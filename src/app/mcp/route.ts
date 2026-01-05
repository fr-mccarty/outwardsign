/**
 * MCP Server HTTP Endpoint
 *
 * Serves the MCP protocol over HTTP with SSE for Claude.ai integration.
 * Uses OAuth access tokens for authentication.
 * Tools are loaded from the unified AI tools registry.
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAccessToken } from '@/lib/oauth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getToolsForMCPProtocol,
  executeTool,
  createMCPContext,
  getToolCount,
  type ToolScope,
} from '@/lib/ai-tools/unified'
import { initializeTools } from '@/lib/ai-tools/unified/tools'

// Initialize tools on module load
initializeTools()

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

  // Map OAuth scopes to tool scopes
  const toolScopes = mapOAuthScopesToToolScopes(context.scopes)

  // Create unified tool execution context
  const toolContext = createMCPContext(
    context.userId,
    context.parishId,
    context.userEmail,
    context.scopes,
    context.tokenId
  )

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
      // Get tools from unified registry based on scopes
      const tools = getToolsForMCPProtocol(toolScopes)
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools,
          _debug: {
            totalToolsRegistered: getToolCount(),
            toolsAvailableForScopes: tools.length,
            scopes: toolScopes,
          },
        },
      }
    }

    case 'tools/call': {
      const { name, arguments: args } = request.params as {
        name: string
        arguments?: Record<string, unknown>
      }

      try {
        // Execute tool using unified registry
        const result = await executeTool(name, args || {}, toolContext)
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

// Map OAuth scopes to tool scopes
function mapOAuthScopesToToolScopes(oauthScopes: string[]): ToolScope[] {
  const scopes: ToolScope[] = ['read'] // Always have read

  // OAuth 'delete' scope grants admin-level access (full access to all tools)
  if (oauthScopes.includes('delete')) {
    return ['admin', 'delete', 'write', 'read']
  }

  // OAuth 'write' scope grants write access
  if (oauthScopes.includes('write')) {
    scopes.push('write')
  }

  return scopes
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
