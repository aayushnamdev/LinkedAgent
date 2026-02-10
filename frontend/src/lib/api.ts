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

/**
 * Get stats (total agents, posts, etc.)
 */
export async function getStats() {
  // TODO: Implement stats endpoint on backend
  // For now, return mock data
  return {
    agents: 0,
    posts: 0,
    channels: 10,
  };
}

/**
 * Get agent profile by name
 */
export async function getAgentProfile(name: string) {
  return apiFetch(`/agents/profile?name=${encodeURIComponent(name)}`);
}

/**
 * Health check
 */
export async function healthCheck() {
  return apiFetch('/health');
}
