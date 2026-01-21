const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth.middleware');
const { isPositionInVotingPeriod } = require('../utils/validators');

const router = express.Router();
const prisma = new PrismaClient();

// GET /positions/available - Get positions accepting applications (requires auth)
router.get('/positions/available', verifyToken, async (req, res) => {
  try {
    const now = new Date();

    const positions = await prisma.position.findMany({
      where: {
        status: 'APPROVED',
        applicationEndDate: {
          gte: now,
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        candidateProposals: {
          select: { id: true, status: true, userId: true },
        },
      },
      orderBy: { applicationEndDate: 'asc' },
    });

    const positionsWithApplicationStatus = positions.map(position => {
      const myApplications = position.candidateProposals.filter(p => p.userId === req.user.id);
      const approvedCandidates = position.candidateProposals.filter(p => p.status === 'APPROVED');
      
      return {
        ...position,
        hasApplied: myApplications.length > 0,
        applicationStatus: myApplications[0]?.status || null,
        candidateCount: approvedCandidates.length,
      };
    });

    res.json({ positions: positionsWithApplicationStatus });
  } catch (error) {
    console.error('Error fetching available positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /positions/live - Get all live positions with approved candidates
router.get('/positions/live', verifyToken, async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: {
        status: 'LIVE',
      },
      include: {
        candidateProposals: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        voteStatus: {
          where: { userId: req.user.id },
        },
      },
      orderBy: { votingEndDate: 'asc' },
    });

    const positionsWithVoteStatus = positions.map(position => ({
      id: position.id,
      name: position.name,
      description: position.description,
      votingStartDate: position.votingStartDate,
      votingEndDate: position.votingEndDate,
      hasVoted: position.voteStatus.length > 0 && position.voteStatus[0].hasVoted,
      candidates: position.candidateProposals.map(candidate => ({
        id: candidate.id,
        manifesto: candidate.manifesto,
        user: candidate.user,
      })),
    }));

    res.json({ positions: positionsWithVoteStatus });
  } catch (error) {
    console.error('Error fetching live positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /vote - Vote for a candidate
router.post('/vote', verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    // Get candidate proposal
    const candidate = await prisma.candidateProposal.findUnique({
      where: { id: candidateId },
      include: {
        position: true,
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (candidate.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Candidate is not approved' });
    }

    const position = candidate.position;

    // Check if position is live and in voting period
    if (position.status !== 'LIVE') {
      return res.status(403).json({ error: 'Position is not open for voting' });
    }

    if (!isPositionInVotingPeriod(position)) {
      return res.status(403).json({ error: 'Voting period is not active' });
    }

    // Check if user already voted for this position
    const voteStatus = await prisma.voteStatus.findUnique({
      where: {
        userId_positionId: {
          userId: req.user.id,
          positionId: position.id,
        },
      },
    });

    if (voteStatus && voteStatus.hasVoted) {
      return res.status(409).json({ error: 'You have already voted for this position' });
    }

    // Create vote and update vote status in a transaction
    await prisma.$transaction(async (tx) => {
      // Create anonymous vote
      await tx.vote.create({
        data: {
          positionId: position.id,
          candidateId: candidate.id,
        },
      });

      // Update or create vote status
      await tx.voteStatus.upsert({
        where: {
          userId_positionId: {
            userId: req.user.id,
            positionId: position.id,
          },
        },
        update: {
          hasVoted: true,
        },
        create: {
          userId: req.user.id,
          positionId: position.id,
          hasVoted: true,
        },
      });
    });

    res.json({
      message: 'Vote recorded successfully',
      positionId: position.id,
      positionName: position.name,
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /results/:positionId - Get published results for a position
router.get('/results/:positionId', async (req, res) => {
  try {
    const { positionId } = req.params;

    const position = await prisma.position.findUnique({
      where: { id: positionId },
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
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    if (!position.resultsPublished) {
      return res.status(403).json({ error: 'Results have not been published yet' });
    }

    const results = {
      id: position.id,
      name: position.name,
      description: position.description,
      status: position.status,
      votingStartDate: position.votingStartDate,
      votingEndDate: position.votingEndDate,
      candidates: position.candidateProposals.map(candidate => ({
        id: candidate.id,
        user: candidate.user,
        manifesto: candidate.manifesto,
        voteCount: candidate.votes.length,
      })).sort((a, b) => b.voteCount - a.voteCount),
      totalVotes: position.candidateProposals.reduce(
        (sum, candidate) => sum + candidate.votes.length,
        0
      ),
    };

    res.json({ results });
  } catch (error) {
    console.error('Error fetching position results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /results - Get all published results
router.get('/results', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: {
        resultsPublished: true,
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
      votingStartDate: position.votingStartDate,
      votingEndDate: position.votingEndDate,
      candidates: position.candidateProposals.map(candidate => ({
        id: candidate.id,
        user: candidate.user,
        manifesto: candidate.manifesto,
        voteCount: candidate.votes.length,
      })).sort((a, b) => b.voteCount - a.voteCount),
      totalVotes: position.candidateProposals.reduce(
        (sum, candidate) => sum + candidate.votes.length,
        0
      ),
    }));

    res.json({ results });
  } catch (error) {
    console.error('Error fetching all results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
