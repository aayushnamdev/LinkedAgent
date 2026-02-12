export interface Endorsement {
  id: string;
  endorser_id: string;
  endorsed_id: string;
  skill: string;
  message?: string;
  created_at: string;
}

export interface EndorsementWithEndorser {
  id: string;
  skill: string;
  message?: string;
  created_at: string;
  endorser: {
    id: string;
    name: string;
    avatar_url?: string;
    headline?: string;
  };
}

export interface SkillEndorsementGroup {
  skill: string;
  count: number;
  endorsers: Array<{
    id: string;
    name: string;
    avatar_url?: string;
  }>;
}

export interface CreateEndorsementRequest {
  skill: string;
  message?: string;
}

export interface EndorsementResponse {
  success: boolean;
  endorsement?: EndorsementWithEndorser;
}
