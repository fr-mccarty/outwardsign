/**
 * Tool Registry
 *
 * Central registry of all unified AI tools.
 * Handles tool lookup, filtering, and permission checking.
 */

import type {
  CategorizedTool,
  ToolConsumer,
  ToolScope,
  ToolExecutionContext,
  ToolResult,
} from './types'
import { hasSufficientScope } from './types'

// ============================================================================
// REGISTRY STATE
// ============================================================================

const toolRegistry: Map<string, CategorizedTool> = new Map()

// ============================================================================
// REGISTRATION
// ============================================================================

/**
 * Register a single tool with the registry.
 */
export function registerTool(tool: CategorizedTool): void {
  if (toolRegistry.has(tool.name)) {
    console.warn(`Tool "${tool.name}" is already registered. Overwriting.`)
  }
  toolRegistry.set(tool.name, tool)
}

/**
 * Register multiple tools at once.
 */
export function registerTools(tools: CategorizedTool[]): void {
  for (const tool of tools) {
    registerTool(tool)
  }
}

// ============================================================================
// RETRIEVAL
// ============================================================================

/**
 * Get all registered tools.
 */
export function getAllTools(): CategorizedTool[] {
  return Array.from(toolRegistry.values())
}

/**
 * Get a specific tool by name.
 */
export function getTool(name: string): CategorizedTool | undefined {
  return toolRegistry.get(name)
}

/**
 * Get tools filtered by consumer and scopes.
 * Only returns tools that the consumer is allowed to use and has sufficient scope for.
 */
export function getToolsForConsumer(
  consumer: ToolConsumer,
  scopes: ToolScope[]
): CategorizedTool[] {
  return Array.from(toolRegistry.values()).filter(tool => {
    // Check if consumer is allowed
    if (!tool.allowedConsumers.includes(consumer)) {
      return false
    }

    // Check if scopes are sufficient
    if (!hasSufficientScope(scopes, tool.requiredScope)) {
      return false
    }

    return true
  })
}

/**
 * Get tools for a specific context.
 * Convenience wrapper around getToolsForConsumer.
 */
export function getToolsForContext(context: ToolExecutionContext): CategorizedTool[] {
  return getToolsForConsumer(context.consumer, context.scopes)
}

// ============================================================================
// EXECUTION
// ============================================================================

/**
 * Execute a tool by name with permission checking.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolResult> {
  const tool = toolRegistry.get(name)

  if (!tool) {
    return {
      success: false,
      error: `Unknown tool: ${name}`,
    }
  }

  // Check if consumer is allowed
  if (!tool.allowedConsumers.includes(context.consumer)) {
    return {
      success: false,
      error: `Tool "${name}" is not available for ${context.consumer} consumers`,
    }
  }

  // Check if scopes are sufficient
  if (!hasSufficientScope(context.scopes, tool.requiredScope)) {
    return {
      success: false,
      error: `Insufficient permissions. Tool "${name}" requires "${tool.requiredScope}" scope`,
    }
  }

  // Execute the tool
  try {
    return await tool.execute(args, context)
  } catch (error) {
    console.error(`Error executing tool "${name}":`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// ============================================================================
// INTROSPECTION
// ============================================================================

/**
 * Get count of registered tools.
 */
export function getToolCount(): number {
  return toolRegistry.size
}

/**
 * Check if a tool is registered.
 */
export function hasToolRegistered(name: string): boolean {
  return toolRegistry.has(name)
}

/**
 * Clear the registry (for testing).
 */
export function clearRegistry(): void {
  toolRegistry.clear()
}
