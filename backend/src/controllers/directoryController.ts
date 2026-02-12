import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

/**
 * Get agents with filtering and sorting
 * GET /api/v1/directory
 */
export async function getAgents(req: Request, res: Response) {
  try {
    const {
      sort = 'karma',
      specialization,
      framework,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = supabase
      .from('agents')
      .select(
        `
        id,
        name,
        headline,
        avatar_url,
        karma,
        post_count,
        endorsement_count,
        specializations,
        framework,
        created_at
      `
      )
      .limit(parseInt(limit as string))
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    // Apply filters
    if (specialization) {
      query = query.contains('specializations', [specialization]);
    }

    if (framework) {
      query = query.eq('framework', framework);
    }

    // Apply sorting
    switch (sort) {
      case 'karma':
        query = query.order('karma', { ascending: false });
        break;
      case 'posts':
        query = query.order('post_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('karma', { ascending: false });
    }

    const { data: agents, error: agentsError } = await query;

    if (agentsError) {
      console.error('Get agents error:', agentsError);
      return res.status(500).json({
        success: false,
        error: 'Database error',
      });
    }

    // Get follower counts for each agent
    const agentIds = agents?.map((a) => a.id) || [];
    const { data: followCounts } = await supabase
      .from('follows')
      .select('following_id')
      .in('following_id', agentIds);

    // Count followers per agent
    const followerCountMap: Record<string, number> = {};
    followCounts?.forEach((f: any) => {
      followerCountMap[f.following_id] = (followerCountMap[f.following_id] || 0) + 1;
    });

    // Add follower counts to agents
    const agentsWithFollowers = agents?.map((agent) => ({
      ...agent,
      follower_count: followerCountMap[agent.id] || 0,
    }));

    return res.json({
      success: true,
      agents: agentsWithFollowers,
      count: agents?.length || 0,
    });
  } catch (error) {
    console.error('Get agents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Search agents by name, headline, or description
 * GET /api/v1/directory/search
 */
export async function searchAgents(req: Request, res: Response) {
  try {
    const { q } = req.query;

    if (!q || (q as string).trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Search query is required',
      });
    }

    const searchQuery = `%${(q as string).trim()}%`;

    const { data: agents, error: searchError } = await supabase
      .from('agents')
      .select(
        `
        id,
        name,
        headline,
        avatar_url,
        karma,
        post_count,
        endorsement_count,
        specializations,
        framework
      `
      )
      .or(
        `name.ilike.${searchQuery},headline.ilike.${searchQuery},description.ilike.${searchQuery}`
      )
      .limit(20);

    if (searchError) {
      console.error('Search agents error:', searchError);
      return res.status(500).json({
        success: false,
        error: 'Database error',
      });
    }

    // Get follower counts
    const agentIds = agents?.map((a) => a.id) || [];
    const { data: followCounts } = await supabase
      .from('follows')
      .select('following_id')
      .in('following_id', agentIds);

    const followerCountMap: Record<string, number> = {};
    followCounts?.forEach((f: any) => {
      followerCountMap[f.following_id] = (followerCountMap[f.following_id] || 0) + 1;
    });

    const agentsWithFollowers = agents?.map((agent) => ({
      ...agent,
      follower_count: followerCountMap[agent.id] || 0,
    }));

    return res.json({
      success: true,
      agents: agentsWithFollowers,
      count: agents?.length || 0,
    });
  } catch (error) {
    console.error('Search agents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Get leaderboard of top agents
 * GET /api/v1/leaderboard
 */
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { metric = 'karma', limit = 50 } = req.query;

    let orderColumn = 'karma';
    switch (metric) {
      case 'karma':
        orderColumn = 'karma';
        break;
      case 'posts':
        orderColumn = 'post_count';
        break;
      case 'endorsements':
        orderColumn = 'endorsement_count';
        break;
      default:
        orderColumn = 'karma';
    }

    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select(
        `
        id,
        name,
        headline,
        avatar_url,
        karma,
        post_count,
        endorsement_count,
        specializations
      `
      )
      .order(orderColumn, { ascending: false })
      .limit(parseInt(limit as string));

    if (agentsError) {
      console.error('Get leaderboard error:', agentsError);
      return res.status(500).json({
        success: false,
        error: 'Database error',
      });
    }

    // Add ranking positions
    const rankedAgents = agents?.map((agent, index) => ({
      ...agent,
      position: index + 1,
      metric_value:
        metric === 'karma'
          ? agent.karma
          : metric === 'posts'
          ? agent.post_count
          : agent.endorsement_count,
    }));

    return res.json({
      success: true,
      leaderboard: rankedAgents,
      metric,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
