/**
 * Unified Types for MCP Tools
 *
 * These types are shared across all tool consumers:
 * - MCP Server (external AI assistants)
 * - Staff Chat (internal staff interface)
 * - Parishioner Chat (parishioner self-service)
 */

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

  /** Source of the request for audit logging */
  source: 'application' | 'ai_chat' | 'mcp' | 'parishioner_chat'

  /** Scopes this context has access to */
  scopes: ToolScope[]
}

/**
 * Context for staff operations.
 * Has userId, full access.
 */
export interface StaffContext extends ToolExecutionContext {
  userId: string
  personId: null
  source: 'ai_chat'
  scopes: ['read', 'write', 'delete']
}

/**
 * Context for parishioner operations.
 * Has personId, limited access.
 */
export interface ParishionerContext extends ToolExecutionContext {
  userId: null
  personId: string
  source: 'parishioner_chat'
  scopes: ['read', 'write_self'] // Can only modify own data
}

/**
 * Context for MCP operations.
 * Has userId (from API key), scopes from API key.
 */
export interface MCPContext extends ToolExecutionContext {
  userId: string
  personId: null
  source: 'mcp'
  apiKeyId: string
}

// ============================================================================
// TOOL SCOPES
// ============================================================================

/**
 * Access scopes for tools.
 */
export type ToolScope =
  | 'read'        // Query data
  | 'write'       // Create/update records
  | 'write_self'  // Create/update own records only (parishioner)
  | 'delete'      // Soft-delete records

/**
 * Who can use this tool.
 */
export type ToolConsumer = 'staff' | 'parishioner' | 'mcp'

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
 * Can be used by MCP server, staff chat, and parishioner chat.
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

/**
 * Tool with category metadata.
 */
export interface CategorizedTool extends UnifiedToolDefinition {
  category: ToolCategory
}
