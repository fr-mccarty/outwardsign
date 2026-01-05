'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'
import { CLAUDE_MODEL } from '@/lib/constants/ai'

// Import unified AI tools
import {
  getToolsForAnthropicSDK,
  executeTool,
  createParishionerContext,
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
// SYSTEM PROMPT - Based on ai-conversation-parishioner.md guidelines
// ============================================================================

function getSystemPrompt(language: 'en' | 'es'): string {
  const today = new Date().toISOString().split('T')[0]

  if (language === 'es') {
    return `Eres un asistente ministerial amigable para una parroquia católica. Ayudas a los feligreses a gestionar su información personal, ver su horario, unirse a ministerios y marcar fechas de no disponibilidad.

Fecha de hoy: ${today}

## Perspectiva Católica
Las respuestas deben alinearse con la enseñanza católica y los valores parroquiales.

## Lo que PUEDES hacer:
- Mostrar el horario y asignaciones del usuario
- Mostrar eventos del calendario parroquial y horarios de Misas
- Mostrar la información personal del usuario (nombre, teléfono, email, dirección)
- Mostrar la familia del usuario y los grupos/ministerios a los que pertenece
- Buscar lecturas y contenido en la biblioteca
- Mostrar ubicaciones de la parroquia
- Actualizar la información de contacto del usuario (teléfono, email, dirección, idioma)
- Agregar/quitar fechas de no disponibilidad del usuario
- Unirse o dejar grupos/ministerios

## Lo que NO PUEDES hacer:
- Eliminar registros (redirige al usuario a contactar la oficina parroquial)
- Operaciones masivas (solo un cambio a la vez)
- Acceder a información privada de otros feligreses
- Crear eventos (requiere acceso de personal)
- Operaciones financieras

## Cuando algo no es posible:
"No puedo hacer eso. Por favor contacta la oficina parroquial para ayuda con esta solicitud."

## Directrices:
- Sé amable, servicial y respetuoso
- Usa un tono conversacional y cálido
- Proporciona información clara y concisa
- Confirma antes de hacer cambios
- Solo cambia un registro a la vez`
  }

  return `You are a friendly ministry assistant for a Catholic parish. You help parishioners manage their personal information, view their schedule, join ministries, and mark unavailable dates.

Today's date is ${today}.

## Catholic Perspective
Responses should align with Catholic teaching and parish values.

## What you CAN do:
- Show the user's schedule and assignments
- Show parish calendar events and Mass times
- Show the user's personal information (name, phone, email, address)
- Show the user's family and groups/ministries they belong to
- Search readings and content in the library
- Show parish locations
- Update the user's contact information (phone, email, address, language preference)
- Add/remove the user's blackout dates (unavailability)
- Join or leave groups/ministries

## What you CANNOT do:
- Delete records (direct user to contact parish office)
- Bulk operations (only one change at a time)
- Access other parishioners' private information
- Create events (requires staff access)
- Financial operations

## When something is not possible:
Explain clearly and direct the user to the appropriate resource:
- For deletions: "I'm not able to delete records. Please contact the parish office for help with this request."
- For accessing others' info: "I can only show you your own information. Please contact the parish office to get in touch with other parishioners."
- For creating events: "Event creation requires staff access. Please contact the parish office or your ministry leader."
- For financial matters: "I don't have access to financial information. Please contact the parish office."

## Guidelines:
- Be friendly, helpful, and respectful
- Use a conversational, warm tone
- Provide clear and concise information
- Confirm before making changes
- Only change one record at a time
- Always use the available tools - don't make up information`
}

/**
 * Chat with AI assistant using Claude API
 */
export async function chatWithAI(
  personId: string,
  message: string,
  conversationId: string | null,
  language: 'en' | 'es' = 'en',
  csrfToken?: string
): Promise<{
  response: string
  conversationId: string
}> {
  try {
    // Validate CSRF token
    if (!csrfToken || !(await validateCsrfToken(csrfToken))) {
      return {
        response:
          language === 'es'
            ? 'Sesión inválida. Recarga la página.'
            : 'Invalid session. Please reload the page.',
        conversationId: conversationId || '',
      }
    }

    // Verify session
    const { getParishionerSession } = await import('@/lib/parishioner-auth/actions')
    const session = await getParishionerSession()
    if (!session || session.personId !== personId) {
      console.error('Unauthorized access attempt to chat')
      return {
        response:
          language === 'es'
            ? 'No autorizado. Por favor, inicia sesión de nuevo.'
            : 'Unauthorized. Please log in again.',
        conversationId: conversationId || '',
      }
    }

    // Rate limiting check
    const rateLimitResult = rateLimit(`chat:${personId}`, RATE_LIMITS.chat)
    if (!rateLimitResult.success) {
      return {
        response:
          language === 'es'
            ? 'Has enviado demasiados mensajes. Por favor espera un momento.'
            : 'You have sent too many messages. Please wait a moment.',
        conversationId: conversationId || '',
      }
    }

    const supabase = createAdminClient()

    // Get the person's parish_id for tool execution
    const { data: personData } = await supabase
      .from('people')
      .select('parish_id')
      .eq('id', personId)
      .single()

    if (!personData?.parish_id) {
      return {
        response:
          language === 'es'
            ? 'No se pudo encontrar tu información de parroquia.'
            : 'Could not find your parish information.',
        conversationId: conversationId || '',
      }
    }

    const parishId = personData.parish_id

    // Create parishioner context and get tools
    const context = createParishionerContext(personId, parishId)
    const tools = getToolsForAnthropicSDK(context.consumer, context.scopes)

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
      model: CLAUDE_MODEL,
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
        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          context
        )

        toolResults.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            },
          ],
        })
      }

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
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
      const { data: sessionData } = await supabase
        .from('parishioner_auth_sessions')
        .select('id')
        .eq('person_id', personId)
        .eq('is_revoked', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (sessionData) {
        const { data: newConv } = await supabase
          .from('ai_chat_conversations')
          .insert({
            parish_id: parishId,
            person_id: personId,
            session_id: sessionData.id,
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
