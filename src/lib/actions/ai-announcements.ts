'use server'

import Anthropic from '@anthropic-ai/sdk'
import { CLAUDE_MODEL } from '@/lib/constants/ai'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logInfo, logError } from '@/lib/utils/console'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateAnnouncementWithAI(prompt: string, parishId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has permission to create announcements for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_user')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish ||
        (!userParish.roles.includes('admin') && !userParish.roles.includes('staff'))) {
      throw new Error('You do not have permission to generate announcements for this parish')
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not configured')
    }

    logInfo('Making API call to Claude with prompt: ' + prompt)
    
    // Make API call to Claude using the SDK
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system: `You are a helpful assistant that writes parish announcements. Your task is to create professional, warm, and appropriate announcements for a Catholic parish community. 

Guidelines:
- Use a respectful, welcoming tone
- Include appropriate Catholic terminology when relevant
- Keep announcements concise but informative
- Use proper formatting with clear structure
- End with appropriate religious closing when suitable
- Include placeholder text in brackets [] for specific details that need to be filled in

Format the response as a ready-to-use announcement text.`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    })

    logInfo('Claude API response: ' + JSON.stringify(response))
    
    const generatedText = response.content[0]?.type === 'text' ? response.content[0].text : ''

    if (!generatedText) {
      logError('No content in Claude response. Full response: ' + JSON.stringify(response))
      throw new Error('No content generated from AI')
    }

    logInfo('Generated text: ' + generatedText)

    return { 
      success: true, 
      text: generatedText.trim(),
      usage: response.usage 
    }
  } catch (error) {
    logError('Error generating announcement with AI: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    logError('Error details: ' + ({
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prompt,
      parishId
    } instanceof Error ? {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prompt,
      parishId
    }.message : JSON.stringify({
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prompt,
      parishId
    })))
    throw error
  }
}