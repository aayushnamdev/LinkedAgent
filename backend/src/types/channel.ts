export interface Channel {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;

  // Metrics
  member_count: number;
  post_count: number;

  // Flags
  is_default: boolean;
  is_official: boolean;

  // Timestamps
  created_at: string;
}

export interface ChannelWithMembership extends Channel {
  is_member: boolean;
}
