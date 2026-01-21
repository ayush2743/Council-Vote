const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth.middleware');
const { isPositionInVotingPeriod } = require('../utils/validators');

const router = express.Router();
const prisma = new PrismaClient();

// All candidate routes require authentication
router.use(verifyToken);

// POST /candidate/apply - Apply for a position
router.post('/apply', async (req, res) => {
  try {
    const { positionId, manifesto } = req.body;

    if (!positionId || !manifesto) {
      return res.status(400).json({ error: 'Position ID and manifesto are required' });
    }

    if (manifesto.trim().length < 10) {
      return res.status(400).json({ error: 'Manifesto must be at least 10 characters long' });
    }

    // Check if position exists
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    // Check if position is approved
    if (position.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Position is not open for applications' });
    }

    // Check if application deadline has passed
    const now = new Date();
    if (now > position.applicationEndDate) {
      return res.status(403).json({ error: 'Application deadline has passed' });
    }

    // Check if user already applied
    const existingProposal = await prisma.candidateProposal.findUnique({
      where: {
        positionId_userId: {
          positionId,
          userId: req.user.id,
        },
      },
    });

    if (existingProposal) {
      return res.status(409).json({ error: 'You have already applied for this position' });
    }

    // Create candidate proposal
    const proposal = await prisma.candidateProposal.create({
      data: {
        positionId,
        userId: req.user.id,
        manifesto,
        status: 'PENDING',
      },
      include: {
        position: {
          select: { id: true, name: true, description: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      proposal,
    });
  } catch (error) {
    console.error('Error applying for position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /candidate/applications - Get all applications by the candidate
router.get('/applications', async (req, res) => {
  try {
    const proposals = await prisma.candidateProposal.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        position: {
          select: {
            id: true,
            name: true,
            description: true,
            applicationEndDate: true,
            votingStartDate: true,
            votingEndDate: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const applications = proposals.map(proposal => ({
      id: proposal.id,
      manifesto: proposal.manifesto,
      status: proposal.status,
      createdAt: proposal.createdAt,
      position: proposal.position,
    }));

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
