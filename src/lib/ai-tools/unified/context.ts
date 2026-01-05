/**
 * Context Creators for AI Tools
 *
 * Factory functions to create properly typed execution contexts
 * for each consumer type.
 */

import type {
  AdminContext,
  StaffContext,
  ParishionerContext,
  MCPContext,
  ToolScope,
} from './types'

/**
 * Create an admin context for parish administrators.
 * Admin has full access to all tools including admin-only tools.
 */
export function createAdminContext(
  userId: string,
  parishId: string,
  userEmail: string | null
): AdminContext {
  return {
    parishId,
    userId,
    personId: null,
    userEmail,
    consumer: 'admin',
    source: 'ai_chat',
    scopes: ['admin', 'delete', 'write', 'read'],
  }
}

/**
 * Create a staff context for standard staff members.
 * Staff has access to most tools except admin-only tools.
 */
export function createStaffContext(
  userId: string,
  parishId: string,
  userEmail: string | null
): StaffContext {
  return {
    parishId,
    userId,
    personId: null,
    userEmail,
    consumer: 'staff',
    source: 'ai_chat',
    scopes: ['delete', 'write', 'read'],
  }
}

/**
 * Create a parishioner context for self-service operations.
 * Parishioner has limited access to their own data.
 */
export function createParishionerContext(
  personId: string,
  parishId: string
): ParishionerContext {
  return {
    parishId,
    userId: null,
    personId,
    userEmail: null,
    consumer: 'parishioner',
    source: 'parishioner_chat',
    scopes: ['read', 'write_self'],
  }
}

/**
 * Create an MCP context for external OAuth access.
 * Scopes are determined by the OAuth grant.
 */
export function createMCPContext(
  userId: string,
  parishId: string,
  userEmail: string | null,
  oauthScopes: string[],
  accessTokenId?: string
): MCPContext {
  // Map OAuth scopes to tool scopes
  const scopes = mapOAuthScopesToToolScopes(oauthScopes)

  return {
    parishId,
    userId,
    personId: null,
    userEmail,
    consumer: 'mcp',
    source: 'mcp',
    scopes,
    accessTokenId,
  }
}

/**
 * Map OAuth scopes (read, write, delete) to tool scopes.
 * OAuth scopes are strings, tool scopes are typed.
 */
function mapOAuthScopesToToolScopes(oauthScopes: string[]): ToolScope[] {
  const toolScopes: ToolScope[] = ['read'] // Always have read

  // OAuth 'delete' scope grants admin-level tool access (full access)
  if (oauthScopes.includes('delete')) {
    return ['admin', 'delete', 'write', 'read']
  }

  // OAuth 'write' scope grants write access
  if (oauthScopes.includes('write')) {
    toolScopes.push('write')
  }

  return toolScopes
}

/**
 * Determine if a user is an admin based on their roles.
 * Used to decide between createAdminContext and createStaffContext.
 */
export function isUserAdmin(roles: string[] | null): boolean {
  return roles?.includes('admin') ?? false
}
