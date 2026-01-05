'use server'

/**
 * AI Tools Permissions Server Actions
 *
 * Developer-only actions for managing AI tool permissions.
 * Permissions are stored in tool-permissions.json.
 */

import { writeFile } from 'fs/promises'
import path from 'path'
import { requireDeveloper } from '@/lib/auth/developer'
import {
  getAllToolPermissions,
  getPermissionsConfig,
  type ToolPermissionConfig,
  type ToolPermissionsFile,
} from '@/lib/ai-tools/unified/registry'
import { initializeTools } from '@/lib/ai-tools/unified/tools'
import type { ToolCategory, ToolScope, ToolConsumer } from '@/lib/ai-tools/unified/types'

// Ensure tools are initialized
initializeTools()

export interface ToolPermissionData {
  name: string
  description: string
  category: ToolCategory
  requiredScope: ToolScope
  allowedConsumers: ToolConsumer[]
}

/**
 * Get all tool permissions for the editor UI.
 * Developer-only.
 */
export async function getToolPermissions(): Promise<{
  success: boolean
  data?: ToolPermissionData[]
  lastUpdated?: string
  error?: string
}> {
  try {
    await requireDeveloper()

    const permissions = getAllToolPermissions()
    const config = getPermissionsConfig()

    return {
      success: true,
      data: permissions,
      lastUpdated: config._updated,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get permissions',
    }
  }
}

/**
 * Save tool permissions to the JSON file.
 * Developer-only.
 */
export async function saveToolPermissions(
  tools: Record<string, ToolPermissionConfig>
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await requireDeveloper()

    const config: ToolPermissionsFile = {
      _comment: 'AI Tool Permissions - Edit via /settings/developer-tools/permissions',
      _updated: new Date().toISOString(),
      tools,
    }

    // Path to the permissions file
    const filePath = path.join(
      process.cwd(),
      'src/lib/ai-tools/unified/tool-permissions.json'
    )

    await writeFile(filePath, JSON.stringify(config, null, 2) + '\n', 'utf-8')

    return { success: true }
  } catch (error) {
    console.error('Failed to save permissions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save permissions',
    }
  }
}
