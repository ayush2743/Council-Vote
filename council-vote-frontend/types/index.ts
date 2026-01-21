// User and Auth Types
export type UserRole = 'SUPER_ADMIN' | 'MODERATOR' | 'CANDIDATE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Position Types
export type PositionStatus = 'PENDING' | 'APPROVED' | 'LIVE' | 'CLOSED';

export interface Position {
  id: string;
  name: string;
  description: string;
  applicationEndDate: string;
  votingStartDate?: string;
  votingEndDate?: string;
  status: PositionStatus;
  createdBy: string;
  createdAt: string;
  candidateCount?: number;
}

// Candidate Proposal Types
export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CandidateProposal {
  id: string;
  positionId: string;
  userId: string;
  user?: User;
  position?: Position;
  manifesto: string;
  status: ProposalStatus;
  createdAt: string;
  approvalCount?: number;
  rejectionCount?: number;
}

// Vote Types
export interface VoteStatus {
  userId: string;
  positionId: string;
  hasVoted: boolean;
}

// Results Types
export interface CandidateResult {
  id: string;
  user: User;
  manifesto: string;
  voteCount: number;
}

export interface PositionResult {
  id: string;
  name: string;
  description: string;
  status: PositionStatus;
  resultsPublished: boolean;
  votingStartDate?: string;
  votingEndDate?: string;
  candidates: CandidateResult[];
  totalVotes: number;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreatePositionRequest {
  name: string;
  description: string;
  applicationEndDate: string;
}

export interface ScheduleVotingRequest {
  votingStartDate: string;
  votingEndDate: string;
}

export interface ApplyRequest {
  positionId: string;
  manifesto: string;
}

export interface VoteRequest {
  candidateId: string;
}

export interface CreateModeratorRequest {
  name: string;
  email: string;
  password: string;
}

export interface PublishResultsRequest {
  positionIds: string[];
}
