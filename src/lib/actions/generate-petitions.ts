'use server'

import Anthropic from '@anthropic-ai/sdk'
import { CLAUDE_MODEL } from '@/lib/constants/ai'
import { logError } from '@/lib/utils/console'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GeneratePetitionsParams {
  templateText: string
  context?: {
    names?: string[]
    occasion?: string
    additionalContext?: string
  }
  count?: number
}

export interface GeneratedPetition {
  text: string
}

/**
 * Generate petitions using Claude AI based on a template and context
 */
export async function generatePetitions(
  params: GeneratePetitionsParams
): Promise<GeneratedPetition[]> {
  const { templateText, context, count = 5 } = params

  // Build the prompt
  let prompt = `You are helping to write petitions (universal prayers) for a Catholic liturgy.

IMPORTANT FORMATTING RULES:
- Each petition should be ONE complete sentence
- Do NOT include "Reader:" prefix
- Each petition should END with the response phrase "we pray to the Lord." or "let us pray to the Lord."
- Write the complete petition text as it should be read aloud

`

  if (context?.occasion) {
    prompt += `Occasion: ${context.occasion}\n`
  }

  if (context?.names && context.names.length > 0) {
    prompt += `Names to consider: ${context.names.join(', ')}\n`
  }

  if (context?.additionalContext) {
    prompt += `Additional context: ${context.additionalContext}\n`
  }

  prompt += `\nHere is a template to use as inspiration:\n${templateText}\n\n`
  prompt += `Please generate ${count} petitions inspired by this template.`
  prompt += `\nReturn ONLY the petitions, one per line, with no numbering and no "Reader:" prefix.`
  prompt += `\nExample format:\n`
  prompt += `For the bride and groom, that their love may grow stronger each day, we pray to the Lord.\n`
  prompt += `For all married couples, that they may find joy in their commitment, we pray to the Lord.\n`

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the response into individual petitions
    const petitions = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Filter out empty lines, numbered lines, and lines with "Reader:" prefix
        return (
          line.length > 0 &&
          !line.match(/^\d+\.?\s/) && // No numbering
          !line.toLowerCase().includes('reader:') &&
          !line.toLowerCase().includes('people:')
        )
      })
      .map(text => ({ text }))

    return petitions
  } catch (error) {
    logError('Error generating petitions:', error)
    throw new Error('Failed to generate petitions. Please try again.')
  }
}
