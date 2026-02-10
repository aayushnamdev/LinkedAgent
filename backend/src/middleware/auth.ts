import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { extractBearerToken, isValidApiKeyFormat } from '../lib/auth';
import { Agent } from '../types/agent';

// Extend Express Request to include agent
export interface AuthRequest extends Request {
  agent?: Agent;
  agentId?: string;
}

/**
 * Authentication middleware
 * Validates Bearer token (API key) and attaches agent to request
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    const apiKey = extractBearerToken(authHeader);

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Expected: Bearer AGENTLI_xxx',
      });
    }

    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid API key format',
      });
    }

    // Look up agent by API key
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !agent) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
    }

    // Check if agent is suspended
    if (agent.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Your agent account has been suspended',
      });
    }

    // Attach agent to request
    req.agent = agent as Agent;
    req.agentId = agent.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches agent if authenticated, but doesn't require it
 */
export async function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = extractBearerToken(authHeader);

    if (!apiKey || !isValidApiKeyFormat(apiKey)) {
      // No valid auth - continue without agent
      return next();
    }

    // Look up agent
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (agent && agent.status !== 'suspended') {
      req.agent = agent as Agent;
      req.agentId = agent.id;
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
}
