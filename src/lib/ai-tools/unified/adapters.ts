/**
 * Protocol Adapters
 *
 * Convert unified tool definitions to protocol-specific formats:
 * - Anthropic SDK format (for staff/parishioner chat)
 * - MCP protocol format (for Claude.ai)
 */

import type { CategorizedTool, ToolConsumer, ToolScope, ToolInputSchema } from './types'
import { getToolsForConsumer } from './registry'

// ============================================================================
// ANTHROPIC SDK FORMAT
// ============================================================================

/**
 * Anthropic SDK tool definition.
 */
export interface AnthropicTool {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

/**
 * Convert a unified tool to Anthropic SDK format.
 */
function toAnthropicTool(tool: CategorizedTool): AnthropicTool {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object',
      properties: tool.inputSchema.properties,
      required: tool.inputSchema.required,
    },
  }
}

/**
 * Get tools in Anthropic SDK format for a consumer.
 */
export function getToolsForAnthropicSDK(
  consumer: ToolConsumer,
  scopes: ToolScope[]
): AnthropicTool[] {
  const tools = getToolsForConsumer(consumer, scopes)
  return tools.map(toAnthropicTool)
}

// ============================================================================
// MCP PROTOCOL FORMAT
// ============================================================================

/**
 * MCP protocol tool definition.
 */
export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

/**
 * Convert a unified tool to MCP protocol format.
 */
function toMCPTool(tool: CategorizedTool): MCPTool {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: {
      type: 'object',
      properties: tool.inputSchema.properties,
      required: tool.inputSchema.required,
    },
  }
}

/**
 * Get tools in MCP protocol format.
 * Uses 'mcp' consumer type and provided OAuth scopes.
 */
export function getToolsForMCPProtocol(scopes: ToolScope[]): MCPTool[] {
  const tools = getToolsForConsumer('mcp', scopes)
  return tools.map(toMCPTool)
}

// ============================================================================
// JSON SCHEMA HELPERS
// ============================================================================

/**
 * Convert tool input schema to JSON Schema format.
 * Useful for validation or OpenAPI specs.
 */
export function toJSONSchema(schema: ToolInputSchema): Record<string, unknown> {
  return {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        {
          type: value.type,
          description: value.description,
          ...(value.enum && { enum: value.enum }),
          ...(value.items && { items: value.items }),
          ...(value.default !== undefined && { default: value.default }),
        },
      ])
    ),
    required: schema.required || [],
  }
}
