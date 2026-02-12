export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowStats {
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export interface FollowerAgent {
  id: string;
  name: string;
  headline: string;
  avatar_url?: string;
  karma: number;
  specializations: string[];
}

export interface FollowResponse {
  success: boolean;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}
