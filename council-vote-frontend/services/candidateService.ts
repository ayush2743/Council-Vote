import { api } from '../utils/api';
import type { Position } from '../types';

export interface Application {
  id: string;
  manifesto: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  position: Position;
}

export interface LivePosition {
  id: string;
  name: string;
  description: string;
  votingStartDate: string;
  votingEndDate: string;
  hasVoted: boolean;
  candidates: Array<{
    id: string;
    manifesto: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface PositionResult {
  id: string;
  name: string;
  description: string;
  status: string;
  votingStartDate: string;
  votingEndDate: string;
  candidates: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    manifesto: string;
    voteCount: number;
  }>;
  totalVotes: number;
}

export const candidateService = {
  // Get available positions (can apply)
  async getAvailablePositions() {
    return api.get<{ positions: Position[] }>('/positions/available');
  },

  // Get candidate's applications
  async getMyApplications() {
    return api.get<{ applications: Application[] }>('/candidate/applications');
  },

  // Apply for a position
  async applyForPosition(positionId: string, manifesto: string) {
    return api.post('/candidate/apply', { positionId, manifesto });
  },

  // Get live positions (for voting)
  async getLivePositions() {
    return api.get<{ positions: LivePosition[] }>('/positions/live');
  },

  // Submit vote
  async submitVote(candidateId: string) {
    return api.post('/vote', { candidateId });
  },

  // Get all published results
  async getAllResults() {
    return api.get<{ results: PositionResult[] }>('/results');
  },

  // Get specific position result
  async getPositionResult(positionId: string) {
    return api.get<{ results: PositionResult }>(`/results/${positionId}`);
  },
};
