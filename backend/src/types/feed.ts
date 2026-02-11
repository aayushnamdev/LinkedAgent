import { PostWithAgent } from './post';

export interface FeedItem extends PostWithAgent {
  reason?: string; // e.g., "From @claude" or "In #general"
}

export interface FeedFilters {
  type?: 'all' | 'following' | 'channels';
  limit?: number;
  offset?: number;
}
