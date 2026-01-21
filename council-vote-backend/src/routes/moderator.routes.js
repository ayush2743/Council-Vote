const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// All moderator routes require MODERATOR role
router.use(verifyToken);
router.use(requireRole('MODERATOR'));

// POST /moderator/positions - Create a position
router.post('/positions', async (req, res) => {
  try {
    const { name, description, applicationEndDate } = req.body;

    if (!name || !description || !applicationEndDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const appEndDate = new Date(applicationEndDate);
    const now = new Date();

    if (appEndDate <= now) {
      return res.status(400).json({ error: 'Application end date must be in the future' });
    }

    const position = await prisma.position.create({
      data: {
        name,
        description,
        applicationEndDate: appEndDate,
        createdBy: req.user.id,
        status: 'PENDING',
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Position created successfully',
      position,
    });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /moderator/positions/created - Get positions created by the moderator
router.get('/positions/created', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: {
        createdBy: req.user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        candidateProposals: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ positions });
  } catch (error) {
    console.error('Error fetching created positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /moderator/positions/approved - Get all approved positions
router.get('/positions/approved', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        candidateProposals: {
          where: { status: 'APPROVED' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add candidateCount to each position
    const positionsWithCount = positions.map(position => ({
      ...position,
      candidateCount: position.candidateProposals.length,
    }));

    res.json({ positions: positionsWithCount });
  } catch (error) {
    console.error('Error fetching approved positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /moderator/positions/live - Get all live positions
router.get('/positions/live', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: {
        status: 'LIVE',
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        candidateProposals: {
          where: { status: 'APPROVED' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add candidateCount to each position
    const positionsWithCount = positions.map(position => ({
      ...position,
      candidateCount: position.candidateProposals.length,
    }));

    res.json({ positions: positionsWithCount });
  } catch (error) {
    console.error('Error fetching live positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /moderator/candidates/pending - Get all candidate proposals for review
router.get('/candidates/pending', async (req, res) => {
  try {
    // Return all proposals (PENDING, APPROVED, REJECTED) so moderators can see the status
    const proposals = await prisma.candidateProposal.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        position: {
          select: { id: true, name: true, description: true, status: true },
        },
        moderatorActions: {
          include: {
            moderator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ proposals });
  } catch (error) {
    console.error('Error fetching candidate proposals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /moderator/candidates/:id/approve - Approve candidate proposal
router.post('/candidates/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const proposal = await prisma.candidateProposal.findUnique({
      where: { id },
      include: {
        moderatorActions: true,
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Candidate proposal not found' });
    }

    if (proposal.status !== 'PENDING') {
      return res.status(400).json({ error: 'Proposal is not in pending status' });
    }

    // Check if moderator already voted
    const existingAction = proposal.moderatorActions.find(
      action => action.moderatorId === req.user.id
    );

    if (existingAction) {
      return res.status(409).json({ error: 'You have already reviewed this proposal' });
    }

    // Create moderator action
    await prisma.moderatorAction.create({
      data: {
        proposalId: id,
        moderatorId: req.user.id,
        action: 'APPROVE',
      },
    });

    // Count approvals and rejections
    const updatedProposal = await prisma.candidateProposal.findUnique({
      where: { id },
      include: {
        moderatorActions: true,
      },
    });

    const approvals = updatedProposal.moderatorActions.filter(
      action => action.action === 'APPROVE'
    ).length;
    const rejections = updatedProposal.moderatorActions.filter(
      action => action.action === 'REJECT'
    ).length;

    // Check if decision reached (2 approvals or 2 rejections)
    let finalProposal = updatedProposal;
    if (approvals >= 2) {
      finalProposal = await prisma.candidateProposal.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          position: {
            select: { id: true, name: true },
          },
          moderatorActions: {
            include: {
              moderator: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    } else if (rejections >= 2) {
      finalProposal = await prisma.candidateProposal.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          position: {
            select: { id: true, name: true },
          },
          moderatorActions: {
            include: {
              moderator: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    }

    res.json({
      message: 'Approval recorded successfully',
      proposal: finalProposal,
      approvals,
      rejections,
    });
  } catch (error) {
    console.error('Error approving candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /moderator/candidates/:id/reject - Reject candidate proposal
router.post('/candidates/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const proposal = await prisma.candidateProposal.findUnique({
      where: { id },
      include: {
        moderatorActions: true,
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Candidate proposal not found' });
    }

    if (proposal.status !== 'PENDING') {
      return res.status(400).json({ error: 'Proposal is not in pending status' });
    }

    // Check if moderator already voted
    const existingAction = proposal.moderatorActions.find(
      action => action.moderatorId === req.user.id
    );

    if (existingAction) {
      return res.status(409).json({ error: 'You have already reviewed this proposal' });
    }

    // Create moderator action
    await prisma.moderatorAction.create({
      data: {
        proposalId: id,
        moderatorId: req.user.id,
        action: 'REJECT',
      },
    });

    // Count approvals and rejections
    const updatedProposal = await prisma.candidateProposal.findUnique({
      where: { id },
      include: {
        moderatorActions: true,
      },
    });

    const approvals = updatedProposal.moderatorActions.filter(
      action => action.action === 'APPROVE'
    ).length;
    const rejections = updatedProposal.moderatorActions.filter(
      action => action.action === 'REJECT'
    ).length;

    // Check if decision reached (2 approvals or 2 rejections)
    let finalProposal = updatedProposal;
    if (approvals >= 2) {
      finalProposal = await prisma.candidateProposal.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          position: {
            select: { id: true, name: true },
          },
          moderatorActions: {
            include: {
              moderator: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    } else if (rejections >= 2) {
      finalProposal = await prisma.candidateProposal.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          position: {
            select: { id: true, name: true },
          },
          moderatorActions: {
            include: {
              moderator: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    }

    res.json({
      message: 'Rejection recorded successfully',
      proposal: finalProposal,
      approvals,
      rejections,
    });
  } catch (error) {
    console.error('Error rejecting candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
