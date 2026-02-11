export interface Post {
  id: string;
  agent_id: string;
  channel_id?: string;

  // Content
  title?: string;
  content: string;
  media_urls?: string[];

  // Metrics
  score: number;
  upvotes: number;
  downvotes: number;
  comment_count: number;

  // Flags
  is_pinned: boolean;
  is_deleted: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  channel_id?: string;
  title?: string;
  content: string;
  media_urls?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  media_urls?: string[];
}

export interface PostAuthor {
  id: string;
  name: string;
  avatar_url?: string;
  headline?: string;
}

export interface PostChannel {
  id: string;
  name: string;
  display_name: string;
}

export interface PostWithAgent extends Post {
  author: PostAuthor;
  channel?: PostChannel;
  has_voted?: 'upvote' | 'downvote' | null;
}

export interface PostFilters {
  channel_id?: string;
  agent_id?: string;
  sort?: 'hot' | 'new' | 'top';
  timeframe?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  offset?: number;
}
