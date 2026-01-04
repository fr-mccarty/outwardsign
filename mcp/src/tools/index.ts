/**
 * Unified Tool Registry
 *
 * Single source of truth for all AI tools used by:
 * - MCP Server (external AI assistants)
 * - Staff Chat (internal staff interface)
 * - Parishioner Chat (parishioner self-service)
 */

import type {
  UnifiedToolDefinition,
  ToolExecutionContext,
  ToolScope,
  ToolConsumer,
  ToolCategory,
  CategorizedTool,
} from '../types.js'

// Import tool modules
import { peopleTools } from './people.js'
import { familiesTools } from './families.js'
import { groupsTools } from './groups.js'
import { eventsTools } from './events.js'
import { massesTools } from './masses.js'
import { availabilityTools } from './availability.js'
import { contentTools } from './content.js'
import { locationsTools } from './locations.js'
import { settingsTools } from './settings.js'
import { developerTools } from './developer.js'

// ============================================================================
// TOOL REGISTRY
// ============================================================================

/**
 * All registered tools with their categories.
 */
const toolRegistry: CategorizedTool[] = [
  ...peopleTools.map((t) => ({ ...t, category: 'people' as ToolCategory })),
  ...familiesTools.map((t) => ({ ...t, category: 'families' as ToolCategory })),
  ...groupsTools.map((t) => ({ ...t, category: 'groups' as ToolCategory })),
  ...eventsTools.map((t) => ({ ...t, category: 'events' as ToolCategory })),
  ...massesTools.map((t) => ({ ...t, category: 'masses' as ToolCategory })),
  ...availabilityTools.map((t) => ({ ...t, category: 'availability' as ToolCategory })),
  ...contentTools.map((t) => ({ ...t, category: 'content' as ToolCategory })),
  ...locationsTools.map((t) => ({ ...t, category: 'locations' as ToolCategory })),
  ...settingsTools.map((t) => ({ ...t, category: 'settings' as ToolCategory })),
  ...developerTools.map((t) => ({ ...t, category: 'developer' as ToolCategory })),
]

// ============================================================================
// REGISTRY FUNCTIONS
// ============================================================================

/**
 * Get all tools available to a specific consumer with given scopes.
 */
export function getToolsForConsumer(
  consumer: ToolConsumer,
  scopes: ToolScope[]
): UnifiedToolDefinition[] {
  return toolRegistry.filter((tool) => {
    // Check consumer is allowed
    if (!tool.allowedConsumers.includes(consumer)) {
      return false
    }

    // Check scope is sufficient
    return hasRequiredScope(scopes, tool.requiredScope)
  })
}

/**
 * Get a tool by name.
 */
export function getToolByName(name: string): UnifiedToolDefinition | undefined {
  return toolRegistry.find((tool) => tool.name === name)
}

/**
 * Get all tools in a category.
 */
export function getToolsByCategory(category: ToolCategory): CategorizedTool[] {
  return toolRegistry.filter((tool) => tool.category === category)
}

/**
 * Get all registered tools.
 */
export function getAllTools(): CategorizedTool[] {
  return [...toolRegistry]
}

/**
 * Check if scopes include the required scope.
 */
function hasRequiredScope(scopes: ToolScope[], required: ToolScope): boolean {
  // delete implies write implies read
  if (scopes.includes('delete')) return true
  if (scopes.includes('write') && required !== 'delete') return true
  if (scopes.includes('write_self') && (required === 'read' || required === 'write_self')) return true
  return scopes.includes(required)
}

// ============================================================================
// PROTOCOL ADAPTERS
// ============================================================================

/**
 * Convert tools to MCP protocol format.
 */
export function getToolsForMCPProtocol(scopes: ToolScope[]) {
  return getToolsForConsumer('mcp', scopes).map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }))
}

/**
 * Convert tools to Anthropic SDK format.
 */
export function getToolsForAnthropicSDK(
  consumer: ToolConsumer,
  scopes: ToolScope[]
) {
  return getToolsForConsumer(consumer, scopes).map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }))
}

// ============================================================================
// TOOL EXECUTION
// ============================================================================

/**
 * Execute a tool by name with given arguments and context.
 * Validates scope before execution.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const tool = getToolByName(name)

  if (!tool) {
    return { success: false, error: `Unknown tool: ${name}` }
  }

  // Validate scope
  if (!hasRequiredScope(context.scopes, tool.requiredScope)) {
    return {
      success: false,
      error: `Insufficient permissions for tool: ${name}. Required scope: ${tool.requiredScope}`,
    }
  }

  try {
    const result = await tool.execute(args, context)
    return { success: true, result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type {
  UnifiedToolDefinition,
  ToolExecutionContext,
  ToolScope,
  ToolConsumer,
  ToolCategory,
  CategorizedTool,
} from '../types.js'
