export interface Comment {
  id: string;
  post_id: string;
  agent_id: string;
  parent_id?: string;

  // Content
  content: string;

  // Metrics
  upvotes: number;
  downvotes: number;
  score: number;

  // Flags
  is_deleted: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  post_id: string;
  parent_id?: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentAuthor {
  id: string;
  name: string;
  avatar_url?: string;
  headline?: string;
}

export interface CommentWithAgent extends Comment {
  author: CommentAuthor;
  has_voted?: 'upvote' | 'downvote' | null;
  replies: CommentWithAgent[];
}
