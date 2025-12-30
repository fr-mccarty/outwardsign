/**
 * Shared utilities for AI tools
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ToolResponse, ConfirmationRequired, AuditInfo } from './types'

/**
 * Log AI-initiated activity to the audit log
 */
export async function logAIActivity(params: {
  parishId: string
  source: 'staff_chat' | 'parishioner_chat'
  initiatedByUserId?: string
  initiatedByPersonId?: string
  conversationId?: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  details?: Record<string, unknown>
}): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from('ai_activity_log').insert({
      parish_id: params.parishId,
      source: params.source,
      initiated_by_user_id: params.initiatedByUserId || null,
      initiated_by_person_id: params.initiatedByPersonId || null,
      conversation_id: params.conversationId || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      entity_name: params.entityName || null,
      details: params.details || null,
    })
  } catch (error) {
    // Log errors silently - audit logging should not break the main operation
    console.error('Failed to log AI activity:', error)
  }
}

/**
 * Format a successful tool response
 */
export function successResponse<T>(data: T, count?: number, message?: string): string {
  const response: ToolResponse<T> = {
    success: true,
    data,
    ...(count !== undefined && { count }),
    ...(message && { message }),
  }
  return JSON.stringify(response)
}

/**
 * Format an error tool response
 */
export function errorResponse(error: string): string {
  const response: ToolResponse = {
    success: false,
    error,
  }
  return JSON.stringify(response)
}

/**
 * Format a confirmation required response (for deletions)
 */
export function confirmationRequired(
  action: string,
  target: { id: string; name: string; type: string },
  message: string
): string {
  const response: ConfirmationRequired = {
    requires_confirmation: true,
    action,
    target,
    message,
  }
  return JSON.stringify(response)
}

/**
 * Create audit info for mutations
 */
export function createAuditInfo(
  initiatedBy: string,
  conversationId?: string
): AuditInfo {
  return {
    source: 'ai_chat',
    initiated_by: initiatedBy,
    conversation_id: conversationId,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Format a person for AI display
 */
export function formatPersonForAI(person: {
  id: string
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string | null
  phone_number?: string | null
  preferred_language?: string | null
}) {
  return {
    id: person.id,
    name: person.full_name || `${person.first_name} ${person.last_name}`,
    email: person.email || undefined,
    phone: person.phone_number || undefined,
    language: person.preferred_language || undefined,
  }
}

/**
 * Format a date for AI display
 */
export function formatDateForAI(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a time for AI display
 */
export function formatTimeForAI(time: string | null | undefined): string | undefined {
  if (!time) return undefined
  // Handle time strings like "10:00:00" or "10:00"
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a datetime for AI display
 */
export function formatDateTimeForAI(datetime: string | Date | null | undefined): string | undefined {
  if (!datetime) return undefined
  const d = typeof datetime === 'string' ? new Date(datetime) : datetime
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Safely extract error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

/**
 * Navigation hints for operations that require the UI
 */
export const NAVIGATION_HINTS = {
  createWedding: `To create a new wedding:
- Go to **Weddings** in the sidebar
- Click the **+ New Wedding** button
- Fill out the form with all required details`,

  createFuneral: `To create a new funeral:
- Go to **Funerals** in the sidebar
- Click the **+ New Funeral** button
- Fill out the form with all required details`,

  createBaptism: `To create a new baptism:
- Go to **Baptisms** in the sidebar
- Click the **+ New Baptism** button
- Fill out the form with all required details`,

  financialOperation: `Financial operations need to go through the main interface:
- Go to **Masses** in the sidebar
- Open the specific Mass
- Click on the **Mass Intentions** section
- Update the stipend information there`,

  userManagement: `User management requires admin access:
- Go to **Settings** in the sidebar
- Click **Parish Settings**
- Select the **Users** tab
- From there you can invite, edit roles, or remove access`,

  massTemplates: `Mass schedule templates should be modified through settings:
- Go to **Settings** in the sidebar
- Click **Mass Configuration**
- Select the template to edit
- Add, edit, or remove Mass times`,

  contactParishOffice: `Please contact the parish office for this request. You can reach them at the phone number listed on the parish website, or speak with a staff member after Mass.`,
} as const
