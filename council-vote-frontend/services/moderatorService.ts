import { api } from '../utils/api';
import type { Position, PositionResult } from '../types';

export interface CreatePositionRequest {
  name: string;
  description: string;
  applicationEndDate: string;
}

export interface CandidateProposal {
  id: string;
  manifesto: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  position: {
    id: string;
    name: string;
    description: string;
  };
  moderatorActions?: Array<{
    id: string;
    action: 'APPROVE' | 'REJECT';
    moderator: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export const moderatorService = {
  // Create a new position
  async createPosition(data: CreatePositionRequest) {
    return api.post('/moderator/positions', data);
  },

  // Get positions created by the moderator
  async getCreatedPositions() {
    return api.get<{ positions: Position[] }>('/moderator/positions/created');
  },

  // Get all approved positions
  async getApprovedPositions() {
    return api.get<{ positions: Position[] }>('/moderator/positions/approved');
  },

  // Get all live positions
  async getLivePositions() {
    return api.get<{ positions: Position[] }>('/moderator/positions/live');
  },

  // Get pending candidate proposals
  async getPendingProposals() {
    return api.get<{ proposals: CandidateProposal[] }>('/moderator/candidates/pending');
  },

  // Approve a candidate proposal
  async approveProposal(proposalId: string) {
    return api.post(`/moderator/candidates/${proposalId}/approve`);
  },

  // Reject a candidate proposal
  async rejectProposal(proposalId: string) {
    return api.post(`/moderator/candidates/${proposalId}/reject`);
  },

  // Get all published results (using public route)
  async getAllResults() {
    return api.get<{ results: PositionResult[] }>('/results');
  },
};
