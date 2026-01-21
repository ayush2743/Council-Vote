const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require SUPER_ADMIN role
router.use(verifyToken);
router.use(requireRole('SUPER_ADMIN'));

// GET /admin/positions/pending - Get all pending positions
router.get('/positions/pending', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { status: 'PENDING' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ positions });
  } catch (error) {
    console.error('Error fetching pending positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/positions/:id/approve - Approve a position
router.post('/positions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const position = await prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    if (position.status !== 'PENDING') {
      return res.status(400).json({ error: 'Position is not in pending status' });
    }

    const updatedPosition = await prisma.position.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      message: 'Position approved successfully',
      position: updatedPosition,
    });
  } catch (error) {
    console.error('Error approving position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/positions/:id/reject - Reject a position
router.post('/positions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const position = await prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    if (position.status !== 'PENDING') {
      return res.status(400).json({ error: 'Position is not in pending status' });
    }

    // Delete the position (rejection)
    await prisma.position.delete({
      where: { id },
    });

    res.json({ message: 'Position rejected and deleted successfully' });
  } catch (error) {
    console.error('Error rejecting position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/positions/approved - Get all approved and live positions
router.get('/positions/approved', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { 
        status: 'APPROVED'
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

// GET /admin/positions/live - Get all live positions
router.get('/positions/live', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { status: 'LIVE' },
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

// POST /admin/positions/:id/schedule - Set voting schedule
router.post('/positions/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { votingStartDate, votingEndDate } = req.body;

    if (!votingStartDate || !votingEndDate) {
      return res.status(400).json({ error: 'Both voting start and end dates are required' });
    }

    const startDate = new Date(votingStartDate);
    const endDate = new Date(votingEndDate);

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'Voting end date must be after start date' });
    }

    const position = await prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    if (position.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Position must be approved before scheduling' });
    }

    const updatedPosition = await prisma.position.update({
      where: { id },
      data: {
        votingStartDate: startDate,
        votingEndDate: endDate,
        status: 'LIVE',
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      message: 'Voting schedule set successfully',
      position: updatedPosition,
    });
  } catch (error) {
    console.error('Error scheduling position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/moderators - Get all moderators
router.get('/moderators', async (req, res) => {
  try {
    const moderators = await prisma.user.findMany({
      where: { 
        role: { in: ['MODERATOR'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ moderators });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/moderators/create - Create moderator account
router.post('/moderators/create', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, promote to moderator
      if (existingUser.role === 'MODERATOR') {
        return res.status(409).json({ error: 'User is already a moderator' });
      }

      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'MODERATOR' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return res.json({
        message: 'User promoted to moderator successfully',
        user: updatedUser,
      });
    }

    // Create new moderator
    const hashedPassword = await bcrypt.hash(password, 10);

    const moderator = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'MODERATOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Moderator created successfully',
      user: moderator,
    });
  } catch (error) {
    console.error('Error creating moderator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/results/publish - Publish results
router.post('/results/publish', async (req, res) => {
  try {
    const { positionIds } = req.body;

    if (!positionIds || !Array.isArray(positionIds) || positionIds.length === 0) {
      return res.status(400).json({ error: 'Position IDs array is required' });
    }

    const now = new Date();

    // Update positions to published, mark as CLOSED, and set voting end date to now
    const updated = await prisma.position.updateMany({
      where: {
        id: { in: positionIds },
        status: { in: ['LIVE', 'CLOSED'] },
      },
      data: {
        resultsPublished: true,
        status: 'CLOSED',
        votingEndDate: now,
      },
    });

    res.json({
      message: 'Results published successfully',
      count: updated.count,
    });
  } catch (error) {
    console.error('Error publishing results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/results - Get all results
router.get('/results', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: {
        status: { in: ['LIVE', 'CLOSED'] },
      },
      include: {
        candidateProposals: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const results = positions.map(position => ({
      id: position.id,
      name: position.name,
      description: position.description,
      status: position.status,
      resultsPublished: position.resultsPublished,
      votingStartDate: position.votingStartDate,
      votingEndDate: position.votingEndDate,
      candidates: position.candidateProposals.map(candidate => ({
        id: candidate.id,
        user: candidate.user,
        manifesto: candidate.manifesto,
        voteCount: candidate.votes.length,
      })),
      totalVotes: position.candidateProposals.reduce(
        (sum, candidate) => sum + candidate.votes.length,
        0
      ),
    }));

    res.json({ results });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
