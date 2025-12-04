'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Tool definitions for Claude
const tools: Anthropic.Tool[] = [
  {
    name: 'view_schedule',
    description:
      'Get upcoming ministry assignments and commitments for the person. Use this when the user asks about their schedule, assignments, or what they have coming up.',
    input_schema: {
      type: 'object',
      properties: {
        days_ahead: {
          type: 'number',
          description: 'Number of days ahead to look (default: 30)',
        },
      },
    },
  },
  {
    name: 'add_blackout_date',
    description:
      'Mark dates when the person is unavailable. Use this when the user wants to block out dates, mark themselves unavailable, or indicate they cannot serve.',
    input_schema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for unavailability',
        },
      },
      required: ['start_date', 'end_date'],
    },
  },
  {
    name: 'get_readings',
    description:
      'Get the scripture readings for a specific date. Use this when the user asks about readings for a particular mass or date.',
    input_schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
      },
      required: ['date'],
    },
  },
]

/**
 * Execute a tool call requested by Claude
 */
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  personId: string
): Promise<string> {
  const supabase = createAdminClient()

  switch (toolName) {
    case 'view_schedule': {
      const daysAhead = (toolInput.days_ahead as number) || 30
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      // Get mass assignments
      const { data: assignments } = await supabase
        .from('mass_assignments')
        .select(
          `
          id,
          role,
          mass:masses (
            id,
            date,
            time,
            mass_type,
            location
          )
        `
        )
        .eq('person_id', personId)

      const filteredAssignments = assignments
        ?.filter((a: any) => {
          const mass = a.mass
          return mass && mass.date >= startDate && mass.date <= endDate
        })
        .map((a: any) => ({
          date: a.mass.date,
          time: a.mass.time,
          type: a.mass.mass_type,
          role: a.role,
          location: a.mass.location,
        }))

      if (!filteredAssignments || filteredAssignments.length === 0) {
        return JSON.stringify({ message: 'No upcoming assignments found', assignments: [] })
      }

      return JSON.stringify({
        message: `Found ${filteredAssignments.length} upcoming assignment(s)`,
        assignments: filteredAssignments,
      })
    }

    case 'add_blackout_date': {
      const startDate = toolInput.start_date as string
      const endDate = toolInput.end_date as string
      const reason = (toolInput.reason as string) || null

      const { error } = await supabase.from('person_blackout_dates').insert({
        person_id: personId,
        start_date: startDate,
        end_date: endDate,
        reason,
      })

      if (error) {
        return JSON.stringify({
          success: false,
          message: `Error adding blackout date: ${error.message}`,
        })
      }

      return JSON.stringify({
        success: true,
        message: `Successfully marked unavailable from ${startDate} to ${endDate}`,
        start_date: startDate,
        end_date: endDate,
        reason,
      })
    }

    case 'get_readings': {
      const date = toolInput.date as string

      // Get the mass for that date
      const { data: mass } = await supabase
        .from('masses')
        .select('id, date, time, mass_type, first_reading, responsorial_psalm, second_reading, gospel')
        .eq('date', date)
        .order('time', { ascending: true })
        .limit(1)
        .single()

      if (!mass) {
        return JSON.stringify({
          message: `No mass found for ${date}`,
          readings: null,
        })
      }

      return JSON.stringify({
        message: `Readings for ${date}`,
        date: mass.date,
        time: mass.time,
        type: mass.mass_type,
        readings: {
          first_reading: mass.first_reading,
          psalm: mass.responsorial_psalm,
          second_reading: mass.second_reading,
          gospel: mass.gospel,
        },
      })
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` })
  }
}

/**
 * Get bilingual system prompt
 */
function getSystemPrompt(language: 'en' | 'es'): string {
  if (language === 'es') {
    return `Eres un asistente ministerial amigable para una parroquia católica. Ayudas a los feligreses a gestionar sus compromisos ministeriales, ver su horario y marcar fechas de no disponibilidad.

Directrices:
- Sé amable, servicial y respetuoso
- Usa un tono conversacional y cálido
- Si el usuario pregunta sobre su horario, usa la herramienta view_schedule
- Si el usuario quiere marcar fechas de no disponibilidad, usa la herramienta add_blackout_date
- Si el usuario pregunta sobre lecturas, usa la herramienta get_readings
- Proporciona información clara y concisa
- Ofrece ayuda proactiva cuando sea apropiado`
  }

  return `You are a friendly ministry assistant for a Catholic parish. You help parishioners manage their ministry commitments, view their schedule, and mark unavailable dates.

Guidelines:
- Be friendly, helpful, and respectful
- Use a conversational, warm tone
- If the user asks about their schedule, use the view_schedule tool
- If the user wants to mark unavailable dates, use the add_blackout_date tool
- If the user asks about readings, use the get_readings tool
- Provide clear and concise information
- Offer proactive help when appropriate`
}

/**
 * Chat with AI assistant using Claude API
 */
export async function chatWithAI(
  personId: string,
  message: string,
  conversationId: string | null,
  language: 'en' | 'es' = 'en'
): Promise<{
  response: string
  conversationId: string
}> {
  try {
    // Verify session
    const { getParishionerSession } = await import('@/lib/parishioner-auth/actions')
    const session = await getParishionerSession()
    if (!session || session.personId !== personId) {
      console.error('Unauthorized access attempt to chat')
      return {
        response: language === 'es'
          ? 'No autorizado. Por favor, inicia sesión de nuevo.'
          : 'Unauthorized. Please log in again.',
        conversationId: conversationId || '',
      }
    }

    // Rate limiting check
    const rateLimitResult = rateLimit(`chat:${personId}`, RATE_LIMITS.chat)
    if (!rateLimitResult.success) {
      return {
        response: language === 'es'
          ? 'Has enviado demasiados mensajes. Por favor espera un momento.'
          : 'You have sent too many messages. Please wait a moment.',
        conversationId: conversationId || ''
      }
    }

    const supabase = createAdminClient()

    // Get conversation history if exists
    let conversationHistory: ChatMessage[] = []
    if (conversationId) {
      const { data } = await supabase
        .from('ai_chat_conversations')
        .select('conversation_history')
        .eq('id', conversationId)
        .single()

      if (data && data.conversation_history) {
        conversationHistory = JSON.parse(data.conversation_history as string)
      }
    }

    // Build messages for Claude API
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

    // Call Claude API
    let response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: getSystemPrompt(language),
      messages,
      tools,
    })

    // Handle tool use
    let finalResponse = ''
    const toolResults: Anthropic.MessageParam[] = []

    while (response.stop_reason === 'tool_use') {
      // Extract tool use blocks
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      // Execute each tool
      for (const toolUse of toolUseBlocks) {
        const toolResult = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>, personId)

        toolResults.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: toolResult,
            },
          ],
        })
      }

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: getSystemPrompt(language),
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: response.content,
          },
          ...toolResults,
        ],
        tools,
      })
    }

    // Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )
    finalResponse = textBlocks.map((block) => block.text).join('\n')

    // Save conversation to database
    const newMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: finalResponse,
      timestamp: new Date().toISOString(),
    }

    const updatedHistory = [...conversationHistory, newMessage, assistantMessage]

    let convId = conversationId

    if (!convId) {
      // Create new conversation
      const { data: person } = await supabase
        .from('people')
        .select('parish_id')
        .eq('id', personId)
        .single()

      const { data: session } = await supabase
        .from('parishioner_auth_sessions')
        .select('id')
        .eq('person_id', personId)
        .eq('is_revoked', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (person && session) {
        const { data: newConv } = await supabase
          .from('ai_chat_conversations')
          .insert({
            parish_id: person.parish_id,
            person_id: personId,
            session_id: session.id,
            conversation_history: JSON.stringify(updatedHistory),
          })
          .select('id')
          .single()

        convId = newConv?.id || ''
      }
    } else {
      // Update existing conversation
      await supabase
        .from('ai_chat_conversations')
        .update({
          conversation_history: JSON.stringify(updatedHistory),
          updated_at: new Date().toISOString(),
        })
        .eq('id', convId)
    }

    return {
      response: finalResponse,
      conversationId: convId || '',
    }
  } catch (error) {
    console.error('Error in chat:', error)
    return {
      response:
        language === 'es'
          ? 'Lo siento, tengo problemas para conectarme. Por favor, inténtalo de nuevo.'
          : "I'm having trouble connecting. Please try again.",
      conversationId: conversationId || '',
    }
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
  // Note: Session verification done at page level for getConversationHistory
  // since conversationId is already scoped to the person's session
  const supabase = createAdminClient()

  try {
    const { data } = await supabase
      .from('ai_chat_conversations')
      .select('conversation_history')
      .eq('id', conversationId)
      .single()

    if (data && data.conversation_history) {
      return JSON.parse(data.conversation_history as string)
    }

    return []
  } catch (error) {
    console.error('Error fetching conversation history:', error)
    return []
  }
}
