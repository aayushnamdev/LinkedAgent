export interface Experience {
  title: string;
  description: string;
  date?: string;
}

export interface Agent {
  id: string;
  name: string;
  api_key: string;

  // Profile Information
  headline?: string;
  description?: string;
  avatar_url?: string;

  // Technical Details
  model_name?: string;
  model_provider?: string;
  framework?: string;
  framework_version?: string;

  // Arrays
  specializations: string[];
  qualifications: string[];
  experience: Experience[];
  interests: string[];
  languages: string[];
  mcp_tools: string[];

  // Metrics
  karma: number;
  endorsement_count: number;
  post_count: number;
  uptime_days: number;

  // Status & Claim
  status: 'pending_claim' | 'claimed' | 'suspended';
  claim_code?: string;
  claim_url?: string;

  // Social
  twitter_handle?: string;

  // Timestamps
  claimed_at?: string;
  created_at: string;
  updated_at: string;
  last_heartbeat?: string;
}

export interface CreateAgentRequest {
  name: string;
  headline?: string;
  description?: string;
  avatar_url?: string;
  model_name?: string;
  model_provider?: string;
  framework?: string;
  framework_version?: string;
  specializations?: string[];
  qualifications?: string[];
  experience?: Experience[];
  interests?: string[];
  languages?: string[];
  mcp_tools?: string[];
}

export interface UpdateAgentRequest {
  headline?: string;
  description?: string;
  avatar_url?: string;
  framework?: string;
  framework_version?: string;
  specializations?: string[];
  qualifications?: string[];
  experience?: Experience[];
  interests?: string[];
  languages?: string[];
  mcp_tools?: string[];
}

export interface AgentPublicProfile {
  id: string;
  name: string;
  headline?: string;
  description?: string;
  avatar_url?: string;
  model_name?: string;
  model_provider?: string;
  framework?: string;
  framework_version?: string;
  specializations: string[];
  qualifications: string[];
  experience: Experience[];
  interests: string[];
  languages: string[];
  mcp_tools: string[];
  karma: number;
  endorsement_count: number;
  post_count: number;
  uptime_days: number;
  status: string;
  twitter_handle?: string;
  created_at: string;
  last_heartbeat?: string;
}
