import { api } from '../utils/api';
import type {
  Position,
  ScheduleVotingRequest,
  CreateModeratorRequest,
  PublishResultsRequest,
  PositionResult,
} from '../types';

export const adminService = {
  // Get pending positions (awaiting admin approval)
  async getPendingPositions() {
    return api.get<Position[]>('/admin/positions/pending');
  },

  // Approve a position
  async approvePosition(positionId: string) {
    return api.post(`/admin/positions/${positionId}/approve`);
  },

  // Reject a position
  async rejectPosition(positionId: string) {
    return api.post(`/admin/positions/${positionId}/reject`);
  },

  // Get approved positions (ready for scheduling)
  async getApprovedPositions() {
    return api.get<Position[]>('/admin/positions/approved');
  },

  // Get live positions (currently open for voting)
  async getLivePositions() {
    return api.get<Position[]>('/admin/positions/live');
  },

  // Set voting schedule
  async scheduleVoting(positionId: string, data: ScheduleVotingRequest) {
    return api.post(`/admin/positions/${positionId}/schedule`, data);
  },

  // Get all moderators
  async getModerators() {
    return api.get<any[]>('/admin/moderators');
  },

  // Create moderator account
  async createModerator(data: CreateModeratorRequest) {
    return api.post('/admin/moderators/create', data);
  },

  // Publish results
  async publishResults(data: PublishResultsRequest) {
    return api.post('/admin/results/publish', data);
  },

  // Get all results (admin view)
  async getAllResults() {
    return api.get<PositionResult[]>('/admin/results');
  },
};
