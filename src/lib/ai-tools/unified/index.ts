/**
 * Unified AI Tools
 *
 * Single source of truth for all AI tools across the application.
 * Used by: Admin UI, Staff Chat, Parishioner Chat, MCP Server
 *
 * @example
 * ```ts
 * import {
 *   getToolsForAnthropicSDK,
 *   getToolsForMCPProtocol,
 *   executeTool,
 *   createStaffContext,
 *   createMCPContext,
 * } from '@/lib/ai-tools/unified'
 *
 * // Staff chat
 * const context = createStaffContext(userId, parishId, email)
 * const tools = getToolsForAnthropicSDK('staff', context.scopes)
 * const result = await executeTool('list_people', { limit: 10 }, context)
 *
 * // MCP server
 * const mcpContext = createMCPContext(userId, parishId, email, ['read', 'write'])
 * const mcpTools = getToolsForMCPProtocol(mcpContext.scopes)
 * ```
 */

// Types
export type {
  ToolScope,
  ToolConsumer,
  ToolExecutionContext,
  AdminContext,
  StaffContext,
  ParishionerContext,
  MCPContext,
  ToolInputSchema,
  UnifiedToolDefinition,
  ToolResult,
  ToolSuccessResult,
  ToolErrorResult,
  ToolConfirmationResult,
  ToolCategory,
  CategorizedTool,
} from './types'

export { scopeSatisfies, hasSufficientScope } from './types'

// Context creators
export {
  createAdminContext,
  createStaffContext,
  createParishionerContext,
  createMCPContext,
  isUserAdmin,
} from './context'

// Registry
export {
  registerTool,
  registerTools,
  getAllTools,
  getTool,
  getToolsForConsumer,
  getToolsForContext,
  executeTool,
  getToolCount,
  hasToolRegistered,
  clearRegistry,
} from './registry'

// Adapters
export type { AnthropicTool, MCPTool } from './adapters'
export {
  getToolsForAnthropicSDK,
  getToolsForMCPProtocol,
  toJSONSchema,
} from './adapters'

// Database client
export { getSupabaseClient, setAuditContext } from './db'
