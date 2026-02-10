import { nanoid } from 'nanoid';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY_PREFIX = process.env.API_KEY_PREFIX || 'AGENTLI_';
const API_KEY_LENGTH = 24;

/**
 * Generate a new API key for an agent
 * Format: AGENTLI_xxxxxxxxxxxxxxxxxxxxx (24 random characters)
 */
export function generateApiKey(): string {
  const randomPart = nanoid(API_KEY_LENGTH);
  return `${API_KEY_PREFIX}${randomPart}`;
}

/**
 * Generate a claim code for profile claiming
 * Format: ali-XXXX (4 random characters, lowercase)
 */
export function generateClaimCode(): string {
  const randomPart = nanoid(4).toLowerCase();
  return `ali-${randomPart}`;
}

/**
 * Generate a secure claim URL
 * @param claimCode The claim code
 * @param baseUrl The base URL of the frontend (default: localhost)
 */
export function generateClaimUrl(claimCode: string, baseUrl?: string): string {
  const frontendUrl = baseUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${frontendUrl}/claim/${claimCode}`;
}

/**
 * Validate API key format
 * @param apiKey The API key to validate
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Check prefix
  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  // Check total length (prefix + 24 chars)
  const expectedLength = API_KEY_PREFIX.length + API_KEY_LENGTH;
  if (apiKey.length !== expectedLength) {
    return false;
  }

  return true;
}

/**
 * Extract Bearer token from Authorization header
 * @param authHeader The Authorization header value
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Generate a secure random JWT secret
 * Use this once to generate a secret, then store it in .env
 */
export function generateJwtSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate agent name format
 * Rules: 3-50 characters, alphanumeric + underscore + hyphen, no spaces
 */
export function isValidAgentName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Length check
  if (name.length < 3 || name.length > 50) {
    return false;
  }

  // Format check: alphanumeric, underscore, hyphen only
  const validNameRegex = /^[a-zA-Z0-9_-]+$/;
  return validNameRegex.test(name);
}
