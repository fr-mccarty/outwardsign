'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSelectedParish } from '@/lib/auth/parish'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { CLAUDE_MODEL } from '@/lib/constants/ai'

// Import unified AI tools
import {
  getToolsForAnthropicSDK,
  executeTool,
  createAdminContext,
  createStaffContext,
  isUserAdmin,
} from '@/lib/ai-tools/unified'
import { initializeTools } from '@/lib/ai-tools/unified/tools'

// Initialize tools on module load
initializeTools()

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

function getSystemPrompt(): string {
  const today = new Date().toISOString().split('T')[0]
  return `You are a helpful parish management assistant for Catholic parishes. You help staff search for and manage parish data including people, events, calendar, Masses, families, groups, and more.

Today's date is ${today}.

## Catholic Perspective
Responses should align with Catholic teaching and parish values. Be respectful of the sacraments and liturgical traditions.

## Core Guidelines
- Be professional, helpful, and concise
- When listing results, format them clearly and readably
- If a search returns no results, suggest the user try different search terms
- For create/update operations, confirm what was done
- Always use the available tools to fulfill data requests - don't make up information
- For calendar queries like "what's on today" or "what's happening this week", use the get_calendar_events tool

## One at a Time Rule
All modifications and deletions must happen to single records only. Never batch updates.

## Delete Confirmation Pattern
When a user asks to delete a record (person, family, event), you MUST:
1. First call the delete tool WITHOUT the confirmed=true flag
2. The tool will return a confirmation request - present this to the user
3. ONLY after the user explicitly confirms (says "yes", "confirm", etc.), call the tool AGAIN with confirmed=true
4. Never delete without explicit user confirmation

Example flow:
User: "Delete John Smith from the directory"
You: [Call delete_person with id only]
Tool: Returns confirmation request
You: "Are you sure you want to delete John Smith? This action cannot be undone."
User: "Yes, delete him"
You: [Call delete_person with confirmed=true]
Tool: Returns success
You: "Done! John Smith has been removed from the directory."

## Available Operations

### People & Directory
- Search and list people in the directory
- Get detailed information about a specific person
- Create new people in the directory
- Update person information (name, contact, pronunciation, etc.)
- Delete people (with confirmation)

### Families
- List families
- Get family details with members
- Create new families
- Add/remove family members
- Set primary contact
- Delete families (with confirmation)

### Groups & Ministries
- List groups/ministries (choir, lectors, ushers, etc.)
- Get group details with members
- See what groups a person belongs to
- Add/remove people from groups
- Update member roles

### Events & Calendar
- List and search events
- Get calendar events for specific dates
- View upcoming events
- Delete events (with confirmation)

### Masses
- List Masses with presider/homilist info
- Get detailed Mass information
- View/manage Mass role assignments (lectors, ushers, servers)
- Assign people to Mass roles
- Get recurring Mass schedule templates
- **Find Mass assignment gaps** - Check upcoming Masses for ministry coverage, see which Masses need assignments, filter by specific ministry

### Mass Intentions
- List Mass intentions
- Get intention details

### Availability
- Check person's blackout dates
- Check if someone is available on a specific date
- Add/remove blackout dates

### Locations
- List parish locations and venues

### Content Library
- Search readings, prayers, and blessings
- Get full content text
- Filter by language or tags

### Configuration (Read-Only)
- List event types (Wedding, Funeral, Baptism, etc.)
- Get special liturgies (event types with system_type='special-liturgy')
- View event type fields
- List custom lists and their items
- List category tags
- List event presets
- Get Mass schedule templates

### Documentation & Help
- Search user documentation for "how to" guides and feature explanations
- Find help articles about using Outward Sign features
- When users ask "how do I...", "where can I find...", or need help with a feature, search the documentation first
- Provide links to relevant documentation articles

## Navigation Hints - When Something Isn't Possible

When the user requests something you cannot do, direct them to the appropriate place in the UI:

### Creating Sacramental Events
"Sacramental events like weddings, funerals, and baptisms have many required fields. To create one:
- Go to **Weddings** / **Funerals** / **Baptisms** in the sidebar
- Click the **+ New** button
- Fill out the form with all required details"

### Financial Operations (Stipends, Payments)
"Financial operations need to go through the main interface for proper record-keeping:
- Go to **Masses** in the sidebar
- Open the specific Mass
- Click on the **Mass Intentions** section
- Update the stipend information there"

### User Management
"User management requires admin access:
- Go to **Settings** in the sidebar
- Click **Parish Settings**
- Select the **Users** tab
- From there you can invite, edit roles, or remove access"

### Mass Schedule Templates
"Mass schedule templates affect the recurring schedule:
- Go to **Settings** in the sidebar
- Click **Mass Configuration**
- Select the template to edit
- Add, edit, or remove Mass times"

### Event Type Configuration
"To modify event types, fields, or scripts:
- Go to **Settings** in the sidebar
- Click **Event Types**
- Select the event type to configure"

## Things You Should NOT Do

### No Bulk Operations
"I can only make changes one at a time. I'd be happy to help you update them individually, or you can use the main interface for bulk operations."

### No Cross-Parish Access
You can only access data for the current parish.

### No Sensitive Data Modification
Do not modify user passwords, auth settings, or sensitive configuration without explicit direction.

## Response Format
- Keep responses concise but informative
- Use bullet points for lists
- Include relevant IDs when discussing specific records (helpful for follow-up actions)
- When showing people, include their full name and any relevant contact info
- Use markdown formatting for navigation hints (bold for sidebar items)`
}

// ============================================================================
// MAIN CHAT FUNCTION
// ============================================================================

export async function staffChatWithAI(
  userId: string,
  message: string,
  conversationId: string | null
): Promise<{ response: string; conversationId: string }> {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return {
        response: 'Unauthorized. Please log in again.',
        conversationId: conversationId || '',
      }
    }

    // 2. Get parish context
    const parishId = await requireSelectedParish()

    // 3. Rate limiting
    const rateLimitResult = rateLimit(`staff-chat:${userId}`, RATE_LIMITS.chat)
    if (!rateLimitResult.success) {
      return {
        response: 'Too many messages. Please wait a moment before sending another.',
        conversationId: conversationId || '',
      }
    }

    // 4. Get user's roles to determine if admin or staff
    const adminClient = createAdminClient()
    const { data: parishUser } = await adminClient
      .from('parish_users')
      .select('roles')
      .eq('user_id', userId)
      .eq('parish_id', parishId)
      .single()

    const userRoles = parishUser?.roles as string[] | null
    const isAdmin = isUserAdmin(userRoles)

    // 5. Create appropriate context based on role
    const context = isAdmin
      ? createAdminContext(userId, parishId, user.email ?? null)
      : createStaffContext(userId, parishId, user.email ?? null)

    // 6. Get tools for the user's role
    const tools = getToolsForAnthropicSDK(context.consumer, context.scopes)

    // 7. Get conversation history if exists
    let conversationHistory: ChatMessage[] = []

    if (conversationId) {
      const { data } = await adminClient
        .from('staff_chat_conversations')
        .select('conversation_history')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (data?.conversation_history) {
        conversationHistory = data.conversation_history as ChatMessage[]
      }
    }

    // 8. Build messages for Claude API
    const messages: Anthropic.MessageParam[] = conversationHistory
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    })

    // 9. Call Claude API with tools
    let response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: getSystemPrompt(),
      messages,
      tools,
    })

    // 10. Agentic tool loop - keep going while Claude wants to use tools
    while (response.stop_reason === 'tool_use') {
      // Extract tool use blocks
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = []
      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          context
        )
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        })
      }

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: getSystemPrompt(),
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: response.content,
          },
          {
            role: 'user',
            content: toolResults,
          },
        ],
        tools,
      })
    }

    // 11. Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )
    const finalResponse = textBlocks.map((block) => block.text).join('\n')

    // 12. Save conversation to database
    const newHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: finalResponse, timestamp: new Date().toISOString() },
    ]

    let convId = conversationId

    if (!convId) {
      // Create new conversation
      const { data: newConv } = await adminClient
        .from('staff_chat_conversations')
        .insert({
          parish_id: parishId,
          user_id: userId,
          conversation_history: newHistory,
        })
        .select('id')
        .single()

      convId = newConv?.id || ''
    } else {
      // Update existing conversation
      await adminClient
        .from('staff_chat_conversations')
        .update({
          conversation_history: newHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', convId)
    }

    return {
      response: finalResponse,
      conversationId: convId || '',
    }
  } catch (error) {
    console.error('Error in staff chat:', error)
    return {
      response: "I'm having trouble connecting. Please try again.",
      conversationId: conversationId || '',
    }
  }
}
