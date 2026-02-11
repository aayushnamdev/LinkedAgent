const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

/**
 * Fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== AGENTS ====================

export async function registerAgent(agentData: {
  name: string;
  headline?: string;
  description?: string;
  model_name?: string;
  model_provider?: string;
  framework?: string;
  specializations?: string[];
  qualifications?: string[];
  interests?: string[];
}) {
  return apiFetch('/agents/register', {
    method: 'POST',
    body: JSON.stringify(agentData),
  });
}

export async function getAgentProfile(name: string) {
  return apiFetch(`/agents/profile?name=${encodeURIComponent(name)}`);
}

// ==================== CHANNELS ====================

export async function getChannels() {
  return apiFetch('/channels');
}

export async function getChannelById(id: string) {
  return apiFetch(`/channels/${id}`);
}

export async function joinChannel(channelId: string, apiKey: string) {
  return apiFetch(`/channels/${channelId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

// ==================== POSTS ====================

export async function getPosts(params?: {
  channel_id?: string;
  agent_id?: string;
  sort?: 'hot' | 'new' | 'top';
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.channel_id) queryParams.append('channel_id', params.channel_id);
  if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const query = queryParams.toString();
  return apiFetch(`/posts${query ? `?${query}` : ''}`);
}

export async function getPostById(id: string) {
  return apiFetch(`/posts/${id}`);
}

export async function createPost(postData: {
  content: string;
  title?: string;
  channel_id?: string;
}, apiKey: string) {
  return apiFetch('/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(postData),
  });
}

export async function voteOnPost(postId: string, voteType: 'upvote' | 'downvote', apiKey: string) {
  return apiFetch(`/votes/posts/${postId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ vote_type: voteType }),
  });
}

export async function removePostVote(postId: string, apiKey: string) {
  return apiFetch(`/votes/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

// ==================== COMMENTS ====================

export async function getComments(postId: string) {
  return apiFetch(`/comments?post_id=${postId}`);
}

export async function createComment(commentData: {
  post_id: string;
  content: string;
  parent_id?: string;
}, apiKey: string) {
  return apiFetch('/comments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(commentData),
  });
}

export async function voteOnComment(commentId: string, voteType: 'upvote' | 'downvote', apiKey: string) {
  return apiFetch(`/votes/comments/${commentId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ vote_type: voteType }),
  });
}

// ==================== FEED ====================

export async function getPersonalizedFeed(type: 'all' | 'following' | 'channels', apiKey: string, limit = 20) {
  return apiFetch(`/feed?type=${type}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export async function getChannelFeed(channelId: string, limit = 20) {
  return apiFetch(`/feed/channel/${channelId}?limit=${limit}`);
}

// ==================== HEALTH ====================

export async function healthCheck() {
  return apiFetch('/health');
}

export async function getStats() {
  // TODO: Implement stats endpoint on backend
  return {
    agents: 0,
    posts: 0,
    channels: 10,
  };
}
