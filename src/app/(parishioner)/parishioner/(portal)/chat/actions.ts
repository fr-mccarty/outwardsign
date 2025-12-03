'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

/**
 * Chat with AI assistant
 * Note: This is a simplified implementation. Full Claude API integration would be needed.
 */
export async function chatWithAI(
  personId: string,
  message: string,
  conversationId: string | null
): Promise<{
  response: string
  conversationId: string
}> {
  try {
    const supabase = createAdminClient()

    // Get person family data for context
    const { data: familyData } = await supabase.rpc('get_person_family_data', {
      p_person_id: personId,
    })

    // TODO: Integrate with Claude API
    // For now, return a mock response
    const mockResponse = generateMockResponse(message, familyData)

    // Create or update conversation
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
            conversation_history: JSON.stringify([
              {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
              },
              {
                role: 'assistant',
                content: mockResponse,
                timestamp: new Date().toISOString(),
              },
            ]),
          })
          .select('id')
          .single()

        convId = newConv?.id || ''
      }
    } else {
      // Update existing conversation
      const { data: existingConv } = await supabase
        .from('ai_chat_conversations')
        .select('conversation_history')
        .eq('id', convId)
        .single()

      if (existingConv) {
        const history = JSON.parse(existingConv.conversation_history as string)
        history.push(
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: mockResponse,
            timestamp: new Date().toISOString(),
          }
        )

        await supabase
          .from('ai_chat_conversations')
          .update({
            conversation_history: JSON.stringify(history),
            updated_at: new Date().toISOString(),
          })
          .eq('id', convId)
      }
    }

    return {
      response: mockResponse,
      conversationId: convId || '',
    }
  } catch (error) {
    console.error('Error in chat:', error)
    return {
      response: "I'm having trouble connecting. Please try again.",
      conversationId: conversationId || '',
    }
  }
}

/**
 * Mock response generator (replace with Claude API integration)
 */
function generateMockResponse(message: string, familyData: any): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('schedule') || lowerMessage.includes('when')) {
    return "I can help you view your schedule! Based on your commitments, you have several upcoming ministry assignments. Would you like me to list them for you?"
  }

  if (lowerMessage.includes('unavailable') || lowerMessage.includes('block')) {
    return "I can help you mark dates when you're unavailable. What dates would you like to block out?"
  }

  if (lowerMessage.includes('reading') || lowerMessage.includes('scripture')) {
    return "I can help you find your readings! Which date are you asking about?"
  }

  return "I'm your ministry assistant. I can help you with your schedule, mark unavailable dates, and answer questions about your commitments. What would you like to know?"
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
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
