/**
 * Shared types for AI tools
 */

export interface ToolResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
  message?: string
}

export interface ConfirmationRequired {
  requires_confirmation: true
  action: string
  target: {
    id: string
    name: string
    type: string
  }
  message: string
}

export interface AuditInfo {
  source: 'ai_chat'
  initiated_by: string // userId for staff, personId for parishioner
  conversation_id?: string
  timestamp: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
  search?: string
}

export interface DateRangeParams {
  start_date?: string
  end_date?: string
}

// Tool input types
export interface ToolInput {
  [key: string]: unknown
}

// Tool result for Claude API
export interface ToolResult {
  tool_use_id: string
  content: string
}
