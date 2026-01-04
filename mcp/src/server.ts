/**
 * MCP Server Implementation
 *
 * Creates and configures the MCP server for Outward Sign.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { validateApiKey, hasScope, type MCPContext } from './auth.js'
import { getToolsForProtocol, getToolByName } from './tools/index.js'
import { getSupabaseClient } from './db.js'

// Rate limiting (in-memory, per API key)
const rateLimits = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITS = {
  read: { maxRequests: 100, windowMs: 60000 },
  write: { maxRequests: 30, windowMs: 60000 },
  delete: { maxRequests: 10, windowMs: 60000 },
}

function checkRateLimit(
  apiKeyId: string,
  operation: 'read' | 'write' | 'delete'
): { allowed: boolean; retryAfter?: number } {
  const key = `${apiKeyId}:${operation}`
  const config = RATE_LIMITS[operation]
  const now = Date.now()

  const record = rateLimits.get(key)

  if (!record || record.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true }
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, retryAfter: record.resetAt - now }
  }

  record.count++
  return { allowed: true }
}

export function createMCPServer() {
  const server = new Server(
    {
      name: 'outwardsign-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  )

  // Context stored per session
  let context: MCPContext | null = null

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    if (!context) {
      throw new Error('Not authenticated. Set OUTWARDSIGN_API_KEY environment variable.')
    }

    return {
      tools: getToolsForProtocol(context.scopes),
    }
  })

  // Execute a tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (!context) {
      throw new Error('Not authenticated. Set OUTWARDSIGN_API_KEY environment variable.')
    }

    const { name, arguments: args } = request.params
    const tool = getToolByName(name)

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`)
    }

    // Check scope permissions
    if (!hasScope(context, tool.requiredScope)) {
      throw new Error(
        `Insufficient permissions for tool: ${name}. Required scope: ${tool.requiredScope}`
      )
    }

    // Check rate limit
    const rateCheck = checkRateLimit(context.apiKeyId, tool.requiredScope)
    if (!rateCheck.allowed) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.retryAfter || 0) / 1000)} seconds.`
      )
    }

    try {
      // Execute tool with parish context
      const result = await tool.execute(args || {}, context)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: false, error: message }, null, 2),
          },
        ],
        isError: true,
      }
    }
  })

  // List resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    if (!context) {
      throw new Error('Not authenticated')
    }

    return {
      resources: [
        {
          uri: `outwardsign://parish/${context.parishId}/info`,
          name: 'Parish Information',
          description: 'Current parish name, location, and settings',
          mimeType: 'application/json',
        },
        {
          uri: `outwardsign://parish/${context.parishId}/event-types`,
          name: 'Event Types',
          description: 'Available event types (weddings, funerals, etc.)',
          mimeType: 'application/json',
        },
        {
          uri: `outwardsign://parish/${context.parishId}/locations`,
          name: 'Locations',
          description: 'Parish locations and venues',
          mimeType: 'application/json',
        },
      ],
    }
  })

  // Read a resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (!context) {
      throw new Error('Not authenticated')
    }

    const { uri } = request.params
    const supabase = getSupabaseClient()

    if (uri.endsWith('/info')) {
      const { data, error } = await supabase
        .from('parishes')
        .select('id, name, city, state, country, created_at')
        .eq('id', context.parishId)
        .is('deleted_at', null)
        .single()

      if (error) {
        throw new Error(`Failed to fetch parish info: ${error.message}`)
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      }
    }

    if (uri.endsWith('/event-types')) {
      const { data, error } = await supabase
        .from('event_types')
        .select('id, name, description, slug, icon, system_type')
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .order('order')

      if (error) {
        throw new Error(`Failed to fetch event types: ${error.message}`)
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      }
    }

    if (uri.endsWith('/locations')) {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, address')
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch locations: ${error.message}`)
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      }
    }

    throw new Error(`Unknown resource: ${uri}`)
  })

  /**
   * Initializes the server with an API key.
   * Call this before connecting to the transport.
   */
  async function initialize(apiKey: string): Promise<void> {
    context = await validateApiKey(apiKey)
    if (!context) {
      throw new Error('Invalid API key')
    }
  }

  return {
    server,
    initialize,
  }
}
