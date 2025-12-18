'use server'

import Anthropic from '@anthropic-ai/sdk'
import { CLAUDE_MODEL } from '@/lib/constants/ai'
import { logInfo, logError } from '@/lib/utils/console'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GeneratePronunciationParams {
  firstName: string
  lastName: string
}

export interface GeneratedPronunciation {
  firstNamePronunciation: string
  lastNamePronunciation: string
}

/**
 * Generate phonetic pronunciations for first and last names using Claude AI
 *
 * Generates detailed phonetic pronunciations with syllable breaks and stress marks
 * to help clergy and liturgical ministers correctly pronounce names during ceremonies.
 */
export async function generatePronunciation(
  params: GeneratePronunciationParams
): Promise<GeneratedPronunciation> {
  const { firstName, lastName } = params

  // Validate input
  if (!firstName && !lastName) {
    throw new Error('At least one name (first or last) is required')
  }

  // Build the prompt
  const prompt = `You are a pronunciation expert helping clergy and liturgical ministers correctly pronounce names during religious ceremonies.

TASK: Generate phonetic pronunciation guides for the following name:

First Name: ${firstName || 'N/A'}
Last Name: ${lastName || 'N/A'}

REQUIREMENTS:
1. Use detailed phonetic spelling with syllable breaks
2. Capitalize the stressed syllable (e.g., "shi-VAWN" for Siobhan)
3. Use simple, readable phonetics that can be pronounced by English speakers
4. Consider common pronunciations in American English
5. If multiple valid pronunciations exist, choose the most common one
6. For culturally diverse names, provide the authentic pronunciation

FORMAT:
- Lowercase letters with hyphens between syllables
- Capitalize ONLY the stressed syllable
- Examples:
  * "Siobhan" → "shi-VAWN"
  * "García" → "gar-SEE-ah"
  * "Nguyen" → "win" or "NWIN"
  * "Xavier" → "ZAY-vee-er"
  * "Caoimhe" → "KEE-vah"

Respond in this exact JSON format:
{
  "firstNamePronunciation": "phonetic-pronunciation-here",
  "lastNamePronunciation": "phonetic-pronunciation-here",
  "explanation": "Brief note on pronunciation origin or alternatives if relevant"
}

If a name is very common and straightforward (like "John" or "Smith"), you may return the name as-is or provide a simple phonetic guide.
If a name was not provided (N/A), return an empty string for that field.`

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    let responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code blocks if present
    responseText = responseText.trim()
    if (responseText.startsWith('```')) {
      // Remove opening ```json or ``` and closing ```
      responseText = responseText
        .replace(/^```(?:json)?\s*\n?/, '')
        .replace(/\n?```\s*$/, '')
        .trim()
    }

    // Parse JSON response
    let parsedResponse: {
      firstNamePronunciation?: string
      lastNamePronunciation?: string
      explanation?: string
    }

    try {
      parsedResponse = JSON.parse(responseText)
    } catch {
      logError('Failed to parse AI response:', responseText)
      throw new Error('Received unexpected response format from AI')
    }

    // Validate response structure
    if (
      typeof parsedResponse.firstNamePronunciation !== 'string' ||
      typeof parsedResponse.lastNamePronunciation !== 'string'
    ) {
      logError('Invalid response structure:', parsedResponse)
      throw new Error('Received unexpected response format from AI')
    }

    // Validate length (max 100 chars per pronunciation)
    const firstPronunciation = parsedResponse.firstNamePronunciation.substring(0, 100)
    const lastPronunciation = parsedResponse.lastNamePronunciation.substring(0, 100)

    // Log explanation for debugging (optional)
    if (parsedResponse.explanation) {
      logInfo('Pronunciation explanation:', parsedResponse.explanation)
    }

    return {
      firstNamePronunciation: firstPronunciation,
      lastNamePronunciation: lastPronunciation,
    }
  } catch (error) {
    logError('Error generating pronunciations:', error)
    throw new Error('Failed to generate pronunciations. Please try again.')
  }
}
