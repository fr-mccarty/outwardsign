#!/usr/bin/env node
/**
 * Outward Sign MCP Server
 *
 * Entry point for the Model Context Protocol server.
 * This server exposes parish data to AI assistants like Claude Desktop.
 *
 * Usage:
 *   OUTWARDSIGN_API_KEY=os_live_xxx npx @outwardsign/mcp-server
 *
 * Environment Variables:
 *   - OUTWARDSIGN_API_KEY: Your API key (required)
 *   - SUPABASE_URL: Supabase project URL (required)
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (required)
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createMCPServer } from './src/server.js'

async function main() {
  // Get API key from environment
  const apiKey = process.env.OUTWARDSIGN_API_KEY
  if (!apiKey) {
    console.error('Error: OUTWARDSIGN_API_KEY environment variable is required')
    console.error('')
    console.error('Usage:')
    console.error('  OUTWARDSIGN_API_KEY=os_live_xxx npx @outwardsign/mcp-server')
    console.error('')
    console.error('Get your API key from Outward Sign Settings > API Keys')
    process.exit(1)
  }

  // Check for required Supabase environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing required environment variables')
    console.error('  - SUPABASE_URL')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  try {
    // Create and initialize the MCP server
    const { server, initialize } = createMCPServer()

    // Validate API key
    await initialize(apiKey)

    // Create stdio transport
    const transport = new StdioServerTransport()

    // Connect server to transport
    await server.connect(transport)

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await server.close()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      await server.close()
      process.exit(0)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error starting MCP server: ${message}`)
    process.exit(1)
  }
}

main()
