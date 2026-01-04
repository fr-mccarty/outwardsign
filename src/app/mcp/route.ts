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

// Extract Bearer token from Authorization header or query param
function extractBearerToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try query parameter (some MCP clients pass token this way)
  const tokenParam = request.nextUrl.searchParams.get('token')
  if (tokenParam) {
    return tokenParam
  }

  // Try access_token query param (OAuth standard)
  const accessToken = request.nextUrl.searchParams.get('access_token')
  if (accessToken) {
    return accessToken
  }

  return null
}

// GET /mcp - SSE endpoint for MCP communication
export async function GET(request: NextRequest) {
  // Extract and validate OAuth token
  const token = extractBearerToken(request)
  if (!token) {
    // Log headers for debugging (without sensitive data)
    const hasAuthHeader = !!request.headers.get('authorization')
    const hasTokenParam = !!request.nextUrl.searchParams.get('token')
    const hasAccessTokenParam = !!request.nextUrl.searchParams.get('access_token')

    return NextResponse.json(
      {
        error: 'unauthorized',
        error_description: 'Missing access token',
        debug: {
          hasAuthHeader,
          hasTokenParam,
          hasAccessTokenParam,
          hint: 'Pass token via Authorization: Bearer <token> header or ?access_token=<token> query param',
        },
      },
      { status: 401 }
    )
  }

  const context = await validateAccessToken(token)
  if (!context) {
    return NextResponse.json(
      {
        error: 'invalid_token',
        error_description: 'Invalid or expired access token',
        debug: {
          tokenPrefix: token.substring(0, 12),
          hint: 'Token may be expired, revoked, or malformed',
        },
      },
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
    const hasAuthHeader = !!request.headers.get('authorization')
    return NextResponse.json(
      {
        error: 'unauthorized',
        error_description: 'Missing access token',
        debug: { hasAuthHeader },
      },
      { status: 401 }
    )
  }

  const context = await validateAccessToken(token)
  if (!context) {
    return NextResponse.json(
      {
        error: 'invalid_token',
        error_description: 'Invalid or expired access token',
        debug: { tokenPrefix: token.substring(0, 12) },
      },
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
        description: 'Search and list events (weddings, funerals, baptisms, etc.). Can filter by event type and date range.',
        inputSchema: {
          type: 'object',
          properties: {
            event_type_id: { type: 'string', description: 'Filter by event type UUID' },
            start_date: { type: 'string', description: 'Start date filter (YYYY-MM-DD)' },
            end_date: { type: 'string', description: 'End date filter (YYYY-MM-DD)' },
            limit: { type: 'number', description: 'Maximum number of events to return (default: 20)' },
          },
        },
      },
      {
        name: 'get_event',
        description: 'Get details of a specific event by ID',
        inputSchema: {
          type: 'object',
          properties: {
            event_id: { type: 'string', description: 'The event UUID' },
          },
          required: ['event_id'],
        },
      },
      {
        name: 'get_calendar_events',
        description: 'Get calendar events for a date range. Returns events with times and locations.',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
            limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
          },
          required: ['start_date', 'end_date'],
        },
      },
      {
        name: 'list_people',
        description: 'List people in the parish directory. Can search by name.',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search by name' },
            limit: { type: 'number', description: 'Maximum number to return (default: 20)' },
          },
        },
      },
      {
        name: 'list_masses',
        description: 'List upcoming Masses with their times and locations.',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: { type: 'string', description: 'Start date (YYYY-MM-DD). Defaults to today.' },
            end_date: { type: 'string', description: 'End date (YYYY-MM-DD). Defaults to 7 days from start.' },
            limit: { type: 'number', description: 'Maximum number to return (default: 20)' },
          },
        },
      }
    )
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
      const { event_type_id, start_date, end_date, limit = 20 } = args as {
        event_type_id?: string
        start_date?: string
        end_date?: string
        limit?: number
      }

      // Query master_events with their calendar_events
      let query = supabase
        .from('master_events')
        .select(`
          id,
          status,
          field_values,
          created_at,
          event_type:event_types(id, name, slug, system_type),
          calendar_events(id, start_datetime, end_datetime, location:locations(id, name))
        `)
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (event_type_id) {
        query = query.eq('event_type_id', event_type_id)
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      // Filter by date range if provided
      let filteredData = data || []
      if (start_date || end_date) {
        filteredData = filteredData.filter((event) => {
          const calendarEvents = event.calendar_events as Array<{ start_datetime: string }>
          if (!calendarEvents || calendarEvents.length === 0) return false

          return calendarEvents.some((ce) => {
            const eventDate = ce.start_datetime.split('T')[0]
            if (start_date && eventDate < start_date) return false
            if (end_date && eventDate > end_date) return false
            return true
          })
        })
      }

      return { success: true, count: filteredData.length, data: filteredData }
    }

    case 'get_event': {
      const { event_id } = args as { event_id: string }

      const { data, error } = await supabase
        .from('master_events')
        .select(`
          id,
          status,
          field_values,
          created_at,
          event_type:event_types(id, name, slug, system_type),
          calendar_events(id, start_datetime, end_datetime, location:locations(id, name))
        `)
        .eq('id', event_id)
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .single()

      if (error) throw new Error(error.message)
      return { success: true, data }
    }

    case 'list_people': {
      const { search, limit = 20 } = args as { search?: string; limit?: number }

      let query = supabase
        .from('people')
        .select('id, first_name, last_name, full_name, email, phone_number')
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .order('last_name', { ascending: true })
        .limit(limit)

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)
      return { success: true, count: data?.length || 0, data: data || [] }
    }

    case 'list_masses': {
      const { start_date, end_date, limit = 20 } = args as {
        start_date?: string
        end_date?: string
        limit?: number
      }

      const today = new Date().toISOString().split('T')[0]
      const startDateValue = start_date || today
      const endDateValue = end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Get mass-liturgy event type
      const { data: massEventType } = await supabase
        .from('event_types')
        .select('id')
        .eq('parish_id', context.parishId)
        .eq('system_type', 'mass-liturgy')
        .is('deleted_at', null)
        .single()

      if (!massEventType) {
        return { success: true, count: 0, data: [], message: 'No mass event type configured' }
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          id,
          start_datetime,
          end_datetime,
          is_cancelled,
          location:locations(id, name),
          master_event:master_events!inner(
            id,
            status,
            field_values,
            event_type_id
          )
        `)
        .eq('parish_id', context.parishId)
        .eq('master_event.event_type_id', massEventType.id)
        .is('deleted_at', null)
        .gte('start_datetime', `${startDateValue}T00:00:00`)
        .lte('start_datetime', `${endDateValue}T23:59:59`)
        .order('start_datetime')
        .limit(limit)

      if (error) throw new Error(error.message)
      return { success: true, count: data?.length || 0, data: data || [] }
    }

    case 'get_calendar_events': {
      const { start_date, end_date, limit = 50 } = args as {
        start_date: string
        end_date: string
        limit?: number
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          id,
          start_datetime,
          end_datetime,
          is_cancelled,
          is_all_day,
          location:locations(id, name, address),
          master_event:master_events(
            id,
            status,
            field_values,
            event_type:event_types(id, name, slug, system_type, icon)
          )
        `)
        .eq('parish_id', context.parishId)
        .is('deleted_at', null)
        .gte('start_datetime', `${start_date}T00:00:00`)
        .lte('start_datetime', `${end_date}T23:59:59`)
        .order('start_datetime')
        .limit(limit)

      if (error) throw new Error(error.message)
      return { success: true, count: data?.length || 0, data: data || [] }
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
