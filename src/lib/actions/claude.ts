'use server'

import Anthropic from '@anthropic-ai/sdk'
import type { IndividualReading } from './readings'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ReadingSuggestionRequest {
  description: string
  readingType: 'first' | 'psalm' | 'second' | 'gospel'
  availableReadings: IndividualReading[]
}

export interface ReadingSuggestion {
  reading: IndividualReading
  reason: string
  relevanceScore: number
}

export async function getReadingSuggestions({
  description,
  readingType,
  availableReadings
}: ReadingSuggestionRequest): Promise<ReadingSuggestion[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  // Prepare reading data for Claude, limiting to first 50 for token efficiency
  const readingsForAnalysis = availableReadings.slice(0, 50).map(reading => ({
    id: reading.id,
    pericope: reading.pericope,
    category: reading.category,
    language: reading.language || 'English',
    introduction: reading.introduction?.substring(0, 200),
    text: reading.reading_text?.substring(0, 500), // Limit text for token efficiency
    conclusion: reading.conclusion?.substring(0, 200)
  }))

  const readingTypeDescription = {
    first: 'First Reading (typically from Old Testament, Acts, or Epistles)',
    psalm: 'Responsorial Psalm (meditative psalm response)',
    second: 'Second Reading (typically from New Testament Epistles)',
    gospel: 'Gospel Reading (from Matthew, Mark, Luke, or John)'
  }

  const prompt = `You are a liturgical expert helping select appropriate scripture readings for worship. 

USER REQUEST: "${description}"
READING TYPE: ${readingTypeDescription[readingType]}

AVAILABLE READINGS:
${JSON.stringify(readingsForAnalysis, null, 2)}

Please analyze the user's request and suggest 3-5 most appropriate readings from the provided list. Consider:
1. Thematic relevance to the user's description
2. Liturgical appropriateness for the reading type
3. Seasonal or ceremonial context if mentioned
4. Language preference if specified
5. Traditional liturgical usage

For each suggestion, provide:
- The reading ID
- A brief reason why it's suitable (1-2 sentences)
- A relevance score (1-10, where 10 is perfect match)

Respond in this exact JSON format:
{
  "suggestions": [
    {
      "readingId": "reading-id-here",
      "reason": "Brief explanation of why this reading fits the request",
      "relevanceScore": 8
    }
  ]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = response.content[0]?.type === 'text' ? response.content[0].text : ''
    
    // Parse Claude's response
    const parsed = JSON.parse(responseText)
    
    // Map back to full reading objects with reasons
    const suggestions: ReadingSuggestion[] = parsed.suggestions
      .map((suggestion: { readingId: string; reason: string; relevanceScore: number }) => {
        const reading = availableReadings.find(r => r.id === suggestion.readingId)
        if (!reading) return null
        
        return {
          reading,
          reason: suggestion.reason,
          relevanceScore: suggestion.relevanceScore
        }
      })
      .filter(Boolean)
      .sort((a: ReadingSuggestion, b: ReadingSuggestion) => b.relevanceScore - a.relevanceScore)

    return suggestions

  } catch (error) {
    console.error('Error getting reading suggestions:', error)
    throw new Error('Failed to get reading suggestions. Please try again.')
  }
}