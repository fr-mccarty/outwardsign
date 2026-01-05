/**
 * Unified Types for AI Tools
 *
 * These types are shared across all tool consumers:
 * - Admin UI (parish administrators)
 * - Staff Chat (internal staff interface)
 * - Parishioner Chat (parishioner self-service)
 * - MCP Server (external AI assistants via Claude.ai)
 */

// ============================================================================
// TOOL SCOPES
// ============================================================================

/**
 * Access scopes for tools.
 * Hierarchy: admin > delete > write > read
 * write_self is a special scope for parishioners to modify own data
 */
export type ToolScope =
  | 'admin'       // Full system access (admin-only tools)
  | 'delete'      // Soft-delete records (implies write, read)
  | 'write'       // Create/update records (implies read)
  | 'write_self'  // Create/update own records only (parishioner)
  | 'read'        // Query data

/**
 * Who can use this tool.
 * - admin: Parish administrators with full access
 * - staff: Staff members (most tools but not admin-only)
 * - parishioner: Limited self-service
 * - mcp: External via OAuth (scopes determine access)
 */
export type ToolConsumer = 'admin' | 'staff' | 'parishioner' | 'mcp'

/**
 * Check if a scope satisfies another scope requirement.
 * Returns true if `hasScope` is sufficient for `requiredScope`.
 */
export function scopeSatisfies(hasScope: ToolScope, requiredScope: ToolScope): boolean {
  const hierarchy: Record<ToolScope, ToolScope[]> = {
    admin: ['admin', 'delete', 'write', 'read'],
    delete: ['delete', 'write', 'read'],
    write: ['write', 'read'],
    write_self: ['write_self', 'read'],
    read: ['read'],
  }
  return hierarchy[hasScope]?.includes(requiredScope) ?? false
}

/**
 * Check if any of the provided scopes satisfy the required scope.
 */
export function hasSufficientScope(scopes: ToolScope[], requiredScope: ToolScope): boolean {
  return scopes.some(scope => scopeSatisfies(scope, requiredScope))
}

// ============================================================================
// EXECUTION CONTEXT
// ============================================================================

/**
 * Base context for all tool executions.
 * Contains the minimal information needed to execute any tool.
 */
export interface ToolExecutionContext {
  /** The parish this operation is scoped to */
  parishId: string

  /** The user performing the action (auth.users id) - null for parishioner */
  userId: string | null

  /** The person performing the action (people id) - used for parishioner context */
  personId: string | null

  /** User's email for audit logging */
  userEmail: string | null

  /** Consumer type for permission checking */
  consumer: ToolConsumer

  /** Source of the request for audit logging */
  source: 'application' | 'ai_chat' | 'mcp' | 'parishioner_chat'

  /** Scopes this context has access to */
  scopes: ToolScope[]
}

/**
 * Context for admin operations.
 * Has userId, full access to all tools.
 */
export interface AdminContext extends ToolExecutionContext {
  userId: string
  personId: null
  consumer: 'admin'
  source: 'ai_chat' | 'application'
  scopes: ['admin', 'delete', 'write', 'read']
}

/**
 * Context for staff operations.
 * Has userId, access to most tools.
 */
export interface StaffContext extends ToolExecutionContext {
  userId: string
  personId: null
  consumer: 'staff'
  source: 'ai_chat'
  scopes: ['delete', 'write', 'read']
}

/**
 * Context for parishioner operations.
 * Has personId, limited access.
 */
export interface ParishionerContext extends ToolExecutionContext {
  userId: null
  personId: string
  consumer: 'parishioner'
  source: 'parishioner_chat'
  scopes: ['read', 'write_self']
}

/**
 * Context for MCP operations.
 * Has userId (from OAuth token), scopes from OAuth grant.
 */
export interface MCPContext extends ToolExecutionContext {
  userId: string
  personId: null
  consumer: 'mcp'
  source: 'mcp'
  /** OAuth access token ID for audit trail */
  accessTokenId?: string
}

// ============================================================================
// TOOL DEFINITION
// ============================================================================

/**
 * Schema for tool input parameters.
 * Compatible with both Anthropic SDK and MCP protocol.
 */
export interface ToolInputSchema {
  type: 'object'
  properties: Record<string, {
    type: string
    description?: string
    enum?: string[]
    items?: { type: string }
    default?: unknown
  }>
  required?: string[]
}

/**
 * Unified tool definition.
 * Can be used by all consumers: admin, staff, parishioner, mcp.
 */
export interface UnifiedToolDefinition {
  /** Unique tool name (snake_case) */
  name: string

  /** Human-readable description */
  description: string

  /** Input parameter schema */
  inputSchema: ToolInputSchema

  /** Required scope to use this tool */
  requiredScope: ToolScope

  /** Which consumers can use this tool */
  allowedConsumers: ToolConsumer[]

  /** Execute the tool */
  execute: (
    args: Record<string, unknown>,
    context: ToolExecutionContext
  ) => Promise<ToolResult>
}

// ============================================================================
// TOOL RESULTS
// ============================================================================

/**
 * Standard success result.
 */
export interface ToolSuccessResult {
  success: true
  data?: unknown
  message?: string
  count?: number
  total_count?: number
  offset?: number
  limit?: number
}

/**
 * Standard error result.
 */
export interface ToolErrorResult {
  success: false
  error: string
}

/**
 * Result requiring user confirmation before proceeding.
 */
export interface ToolConfirmationResult {
  success: true
  requires_confirmation: true
  action: string
  target: {
    type: string
    id: string
    name: string
  }
  message: string
}

/**
 * Union of all possible tool results.
 */
export type ToolResult = ToolSuccessResult | ToolErrorResult | ToolConfirmationResult

// ============================================================================
// TOOL REGISTRY
// ============================================================================

/**
 * Category for organizing tools.
 */
export type ToolCategory =
  | 'people'
  | 'families'
  | 'groups'
  | 'events'
  | 'masses'
  | 'availability'
  | 'content'
  | 'locations'
  | 'settings'
  | 'documentation'
  | 'developer'
  | 'parishioner'

/**
 * Tool with category metadata.
 */
export interface CategorizedTool extends UnifiedToolDefinition {
  category: ToolCategory
}
