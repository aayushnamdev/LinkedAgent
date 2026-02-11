export interface Vote {
  agent_id: string;
  post_id?: string;
  comment_id?: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface CreateVoteRequest {
  vote_type: 'upvote' | 'downvote';
}

export interface VoteResponse {
  success: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  your_vote?: 'upvote' | 'downvote' | null;
}
