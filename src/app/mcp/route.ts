/**
 * MCP Server HTTP Endpoint
 *
 * Serves the MCP protocol over HTTP with SSE for Claude.ai integration.
 * Uses OAuth access tokens for authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAccessToken } from '@/lib/oauth/server'
import { createAdminClient } from '@/lib/supabase/admin'

// MCP protocol version
const MCP_VERSION = '2024-11-05'

interface MCPRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, unknown>
}

interface MCPResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

// Extract Bearer token from Authorization header
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// GET /mcp - SSE endpoint for MCP communication
export async function GET(request: NextRequest) {
  // Extract and validate OAuth token
  const token = extractBearerToken(request)
  if (!token) {
    return NextResponse.json(
      { error: 'unauthorized', error_description: 'Missing Authorization header' },
      { status: 401 }
    )
  }

  const context = await validateAccessToken(token)
  if (!context) {
    return NextResponse.json(
      { error: 'invalid_token', error_description: 'Invalid or expired access token' },
      { status: 401 }
    )
  }

  // Set up SSE response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const connectEvent = {
        jsonrpc: '2.0',
        method: 'notifications/initialized',
        params: {
          protocolVersion: MCP_VERSION,
          serverInfo: {
            name: 'outwardsign-mcp',
            version: '1.0.0',
          },
          capabilities: {
            tools: {},
            resources: {},
          },
        },
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`))

      // Keep connection alive with periodic pings
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          clearInterval(pingInterval)
        }
      }, 30000)

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

// POST /mcp - Handle MCP JSON-RPC requests
export async function POST(request: NextRequest) {
  // Extract and validate OAuth token
  const token = extractBearerToken(request)
  if (!token) {
    return NextResponse.json(
      { error: 'unauthorized', error_description: 'Missing Authorization header' },
      { status: 401 }
    )
  }

  const context = await validateAccessToken(token)
  if (!context) {
    return NextResponse.json(
      { error: 'invalid_token', error_description: 'Invalid or expired access token' },
      { status: 401 }
    )
  }

  // Parse MCP request
  let mcpRequest: MCPRequest
  try {
    mcpRequest = await request.json()
  } catch {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      },
      { status: 400 }
    )
  }

  // Handle MCP methods
  const response = await handleMCPMethod(mcpRequest, context)
  return NextResponse.json(response)
}

// Handle MCP JSON-RPC methods
async function handleMCPMethod(
  request: MCPRequest,
  context: Awaited<ReturnType<typeof validateAccessToken>>
): Promise<MCPResponse> {
  if (!context) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: { code: -32600, message: 'Invalid context' },
    }
  }

  const supabase = createAdminClient()

  switch (request.method) {
    case 'initialize': {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: MCP_VERSION,
          serverInfo: {
            name: 'outwardsign-mcp',
            version: '1.0.0',
          },
          capabilities: {
            tools: {},
            resources: {},
          },
        },
      }
    }

    case 'tools/list': {
      // Return available tools based on scopes
      const tools = getAvailableTools(context.scopes)
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: { tools },
      }
    }

    case 'tools/call': {
      const { name, arguments: args } = request.params as {
        name: string
        arguments?: Record<string, unknown>
      }

      try {
        const result = await executeToolByName(name, args || {}, context, supabase)
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
            isError: true,
          },
        }
      }
    }

    case 'resources/list': {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
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
          ],
        },
      }
    }

    case 'resources/read': {
      const { uri } = request.params as { uri: string }

      try {
        const content = await readResource(uri, context, supabase)
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(content, null, 2) }],
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: { code: -32602, message },
        }
      }
    }

    case 'ping': {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {},
      }
    }

    default: {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Method not found: ${request.method}` },
      }
    }
  }
}

// Get available tools based on scopes
function getAvailableTools(scopes: string[]) {
  const tools = []

  // Read tools (always available if any scope)
  if (scopes.includes('read') || scopes.includes('write') || scopes.includes('delete')) {
    tools.push(
      {
        name: 'list_events',
        description: 'List upcoming events (weddings, funerals, baptisms, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            event_type: { type: 'string', description: 'Filter by event type slug' },
            limit: { type: 'number', description: 'Maximum number of events to return' },
          },
        },
      },
      {
        name: 'get_event',
        description: 'Get details of a specific event',
        inputSchema: {
          type: 'object',
          properties: {
            event_id: { type: 'string', description: 'The event ID' },
          },
          required: ['event_id'],
        },
      },
      {
        name: 'list_people',
        description: 'List people in the parish directory',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search by name' },
            limit: { type: 'number', description: 'Maximum number to return' },
          },
        },
      },
      {
        name: 'list_masses',
        description: 'List upcoming masses',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number to return' },
          },
        },
      }
    )
  }

  // Write tools
  if (scopes.includes('write') || scopes.includes('delete')) {
    tools.push({
      name: 'create_event',
      description: 'Create a new event',
      inputSchema: {
        type: 'object',
        properties: {
          event_type_id: { type: 'string', description: 'Event type ID' },
          date: { type: 'string', description: 'Event date (YYYY-MM-DD)' },
          time: { type: 'string', description: 'Event time (HH:MM)' },
          location_id: { type: 'string', description: 'Location ID' },
        },
        required: ['event_type_id', 'date'],
      },
    })
  }

  return tools
}

// Execute a tool by name
async function executeToolByName(
  name: string,
  args: Record<string, unknown>,
  context: NonNullable<Awaited<ReturnType<typeof validateAccessToken>>>,
  supabase: ReturnType<typeof createAdminClient>
) {
  switch (name) {
    case 'list_events': {
      const { event_type, limit = 20 } = args as { event_type?: string; limit?: number }

      let query = supabase
        .from('events')
        .select('id, date, time, status, event_types(name, slug)')
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(limit)

      if (event_type) {
        const { data: eventType } = await supabase
          .from('event_types')
          .select('id')
          .eq('parish_id', context.parishId)
          .eq('slug', event_type)
          .single()

        if (eventType) {
          query = query.eq('event_type_id', eventType.id)
        }
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)
      return { events: data }
    }

    case 'get_event': {
      const { event_id } = args as { event_id: string }

      const { data, error } = await supabase
        .from('events')
        .select('*, event_types(name, slug), locations(name)')
        .eq('id', event_id)
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .single()

      if (error) throw new Error(error.message)
      return { event: data }
    }

    case 'list_people': {
      const { search, limit = 20 } = args as { search?: string; limit?: number }

      let query = supabase
        .from('people')
        .select('id, first_name, last_name, email, phone')
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .order('last_name', { ascending: true })
        .limit(limit)

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)
      return { people: data }
    }

    case 'list_masses': {
      const { limit = 20 } = args as { limit?: number }

      const { data, error } = await supabase
        .from('masses')
        .select('id, date, time, name, locations(name)')
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(limit)

      if (error) throw new Error(error.message)
      return { masses: data }
    }

    case 'create_event': {
      // Check write scope
      if (!context.scopes.includes('write') && !context.scopes.includes('delete')) {
        throw new Error('Insufficient permissions: write scope required')
      }

      const { event_type_id, date, time, location_id } = args as {
        event_type_id: string
        date: string
        time?: string
        location_id?: string
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          parish_id: context.parishId,
          event_type_id,
          date,
          time: time || null,
          location_id: location_id || null,
          status: 'scheduled',
          created_by: context.userId,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return { event: data, success: true }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// Read a resource by URI
async function readResource(
  uri: string,
  context: NonNullable<Awaited<ReturnType<typeof validateAccessToken>>>,
  supabase: ReturnType<typeof createAdminClient>
) {
  if (uri.endsWith('/info')) {
    const { data, error } = await supabase
      .from('parishes')
      .select('id, name, city, state, country')
      .eq('id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  if (uri.endsWith('/event-types')) {
    const { data, error } = await supabase
      .from('event_types')
      .select('id, name, description, slug, icon')
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('order')

    if (error) throw new Error(error.message)
    return data
  }

  throw new Error(`Unknown resource: ${uri}`)
}
