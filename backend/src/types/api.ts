import { Agent } from './agent';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RegisterAgentResponse {
  agent: Agent;
  api_key: string;
  claim_code: string;
  claim_url: string;
  message: string;
}

export interface AgentStatusResponse {
  status: 'pending_claim' | 'claimed' | 'suspended';
  claimed_at?: string;
  claim_url?: string;
  claim_code?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

// Express Request with authenticated agent
export interface AuthenticatedRequest extends Express.Request {
  agent?: Agent;
  agentId?: string;
}
