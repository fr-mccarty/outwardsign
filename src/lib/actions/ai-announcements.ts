'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
        (!userParish.roles.includes('admin') && !userParish.roles.includes('minister'))) {
      throw new Error('You do not have permission to generate announcements for this parish')
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not configured')
    }

    console.log('Making API call to Claude with prompt:', prompt)
    
    // Make API call to Claude using the SDK
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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

    console.log('Claude API response:', response)
    
    const generatedText = response.content[0]?.type === 'text' ? response.content[0].text : ''

    if (!generatedText) {
      console.error('No content in Claude response. Full response:', response)
      throw new Error('No content generated from AI')
    }

    console.log('Generated text:', generatedText)

    return { 
      success: true, 
      text: generatedText.trim(),
      usage: response.usage 
    }
  } catch (error) {
    console.error('Error generating announcement with AI:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prompt,
      parishId
    })
    throw error
  }
}