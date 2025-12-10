'use server'

import { createClient } from '@/lib/supabase/server'
import { CreatePetitionData, Petition, PetitionContext } from '@/lib/types'
// redirect import removed - not used
import { getPromptTemplate } from '@/lib/actions/definitions'
import { replaceTemplateVariables, getTemplateVariables } from '@/lib/template-utils'
import { getPetitionTemplate } from './petition-templates'
import { requireSelectedParish } from '@/lib/auth/parish'
import type { LiturgicalLanguage } from '@/lib/constants'
import { CLAUDE_MODEL } from '@/lib/constants/ai'

export async function createBasicPetition(data: { title: string; date: string }) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { data: petition, error: petitionError } = await supabase
    .from('petitions')
    .insert([
      {
        parish_id: selectedParishId,
        title: data.title,
        date: data.date,
        language: 'en', // Default, will be set in wizard
        text: null, // Will be generated in wizard
        details: null, // Will be set in wizard
        template: null, // Will be set in wizard
      },
    ])
    .select()
    .single()

  if (petitionError) {
    throw new Error('Failed to create petition')
  }

  return petition
}

export async function createPetition(data: CreatePetitionData) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // If a template ID is provided, store it for reference
  let templateReference = null
  let detailsData = null
  
  if (data.templateId) {
    const template = await getPetitionTemplate(data.templateId)
    if (template) {
      templateReference = template.context // Store template content, not title
      // Store details as simple text in the details field
      detailsData = data.details
    }
  } else {
    // Store details as simple text for custom petition
    detailsData = data.details
  }

  const generatedContent = await generatePetitionContent(data)

  const { data: petition, error: petitionError } = await supabase
    .from('petitions')
    .insert([
      {
        parish_id: selectedParishId,
        title: data.title,
        date: data.date,
        language: data.language,
        text: generatedContent,
        details: detailsData,
        template: templateReference,
      },
    ])
    .select()
    .single()

  if (petitionError) {
    throw new Error('Failed to create petition')
  }

  return petition
}

export async function getPetitions(): Promise<Petition[]> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { data, error } = await supabase
    .from('petitions')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch petitions')
  }

  return data || []
}

export async function searchPetitions(params: {
  query?: string
  offset?: number
  limit?: number
  sortBy?: 'created_at' | 'title' | 'date' | 'language'
  sortOrder?: 'asc' | 'desc'
}): Promise<{
  petitions: Petition[]
  total: number
  totalPages: number
  currentPage: number
}> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  
  const {
    query = '',
    offset = 0,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params

  // Build the query
  let queryBuilder = supabase
    .from('petitions')
    .select('*', { count: 'exact' })
    .eq('parish_id', selectedParishId)

  // Add search filter
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,language.ilike.%${query}%`)
  }

  // Add sorting
  queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' })

  // Add pagination
  queryBuilder = queryBuilder.range(offset, offset + limit - 1)

  const { data, error, count } = await queryBuilder

  if (error) {
    throw new Error('Failed to fetch petitions')
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return {
    petitions: data || [],
    total,
    totalPages,
    currentPage
  }
}

export async function getPetition(id: string): Promise<Petition | null> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { data, error } = await supabase
    .from('petitions')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function getSavedContexts(): Promise<Array<{id: string, name: string, details: string}>> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // Get petitions that have details
  const { data, error } = await supabase
    .from('petitions')
    .select('id, title, date, details')
    .eq('parish_id', selectedParishId)
    .not('details', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch saved contexts')
  }

  return (data || []).map(petition => {
    // Details is now simple text, not JSON
    if (petition.details && petition.details.trim()) {
      return {
        id: petition.id,
        name: `${petition.title} - ${new Date(petition.date).toLocaleDateString()}`,
        details: petition.details
      }
    }
    return null
  }).filter(Boolean) as Array<{id: string, name: string, details: string}>
}

export async function getPetitionWithContext(id: string): Promise<{ petition: Petition; context: PetitionContext } | null> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { data: petition, error: petitionError } = await supabase
    .from('petitions')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (petitionError || !petition) {
    return null
  }

  // Get the context from the petition's details field (now simple text)
  let context: PetitionContext | null = null
  if (petition.details) {
    context = {
      id: petition.id,
      petition_id: petition.id,
      parish_id: petition.parish_id,
      details: petition.details, // Details is now simple text
      created_at: petition.created_at,
      updated_at: petition.updated_at
    }
  }
  
  // Create a basic context if none exists or parsing failed
  if (!context) {
    context = {
      id: petition.id,
      petition_id: petition.id,
      parish_id: petition.parish_id,
      details: '',
      created_at: petition.created_at,
      updated_at: petition.updated_at
    }
  }

  return { petition, context }
}

export async function updatePetition(id: string, data: CreatePetitionData) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const generatedContent = await generatePetitionContent(data)

  // Get the existing petition to preserve the details structure
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _existingPetition, error: fetchError } = await supabase
    .from('petitions')
    .select('details, template')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (fetchError) {
    throw new Error('Failed to fetch existing petition')
  }

  // Update the details with new info (now simple text)
  const updatedDetails = data.details

  const { data: petition, error: petitionError } = await supabase
    .from('petitions')
    .update({
      title: data.title,
      date: data.date,
      language: data.language,
      text: generatedContent,
      details: updatedDetails,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (petitionError) {
    console.error('Petition update error:', petitionError)
    throw new Error('Failed to update petition')
  }

  return petition
}

export async function generatePetitionContent(data: CreatePetitionData): Promise<string> {
  // Get the petition template content - prioritize direct template over templateId
  let templateContent = ''
  if (data.template) {
    // Use direct template content if provided
    templateContent = data.template
  } else if (data.templateId) {
    // Fall back to fetching template by ID
    try {
      const template = await getPetitionTemplate(data.templateId)
      if (template && template.context) {
        templateContent = template.context
      }
    } catch (error) {
      console.warn('Failed to fetch template content:', error)
    }
  }

  // Get the user's custom prompt template
  const template = await getPromptTemplate()

  // Replace template variables with actual values (now includes template content)
  const variables = getTemplateVariables(data, templateContent)
  const prompt = replaceTemplateVariables(template, variables)
  
  // Debug logging to see what's being sent to AI
  console.log('[DEBUG] Petition generation data:', data)
  console.log('[DEBUG] Template variables:', variables)
  console.log('[DEBUG] Final prompt being sent to AI:', prompt)

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured. Please set up your API key.')
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Claude API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    if (!result.content || !result.content[0] || !result.content[0].text) {
      throw new Error('Invalid response format from Claude API')
    }
    
    return result.content[0].text
  } catch (error) {
    console.error('Error generating petitions:', error)
    throw error // Throw the error instead of falling back silently
  }
}

export async function updatePetitionLanguage(petitionId: string, language: LiturgicalLanguage) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { error } = await supabase
    .from('petitions')
    .update({ language })
    .eq('id', petitionId)
    .eq('parish_id', selectedParishId)

  if (error) {
    throw new Error('Failed to update petition language')
  }
}

export async function updatePetitionContext(petitionId: string, context: string) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // Context is now stored in the details field
  const { error } = await supabase
    .from('petitions')
    .update({ details: context })
    .eq('id', petitionId)
    .eq('parish_id', selectedParishId)

  if (error) {
    throw new Error('Failed to update petition context')
  }
}

export async function updatePetitionContent(petitionId: string, content: string) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { error } = await supabase
    .from('petitions')
    .update({ text: content })
    .eq('id', petitionId)
    .eq('parish_id', selectedParishId)

  if (error) {
    throw new Error('Failed to update petition content')
  }
}

export async function updatePetitionTemplate(petitionId: string, template: string) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { error } = await supabase
    .from('petitions')
    .update({ template })
    .eq('id', petitionId)
    .eq('parish_id', selectedParishId)

  if (error) {
    throw new Error('Failed to update petition template')
  }
}

export async function updatePetitionDetails(petitionId: string, details: string) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { error } = await supabase
    .from('petitions')
    .update({ details })
    .eq('id', petitionId)
    .eq('parish_id', selectedParishId)

  if (error) {
    throw new Error('Failed to update petition details')
  }
}

export async function updatePetitionFullDetails(id: string, data: { title: string; date: string; language: LiturgicalLanguage; text: string; details?: string }) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const updateData: any = {
    title: data.title,
    date: data.date,
    language: data.language,
    text: data.text,
    updated_at: new Date().toISOString(),
  }
  
  // Only update details if provided
  if (data.details !== undefined) {
    updateData.details = data.details
  }

  const { data: petition, error: petitionError } = await supabase
    .from('petitions')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (petitionError) {
    console.error('Petition update error:', petitionError)
    throw new Error(`Failed to update petition: ${petitionError.message || petitionError.code || 'Database error'}`)
  }

  return petition
}

export async function regeneratePetitionContent(id: string, data: { title: string; date: string; language: LiturgicalLanguage; template?: string; details?: string }) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // Generate new content
  const petitionData: CreatePetitionData = {
    title: data.title,
    date: data.date,
    language: data.language,
    details: data.details || '',
    template: data.template
  }

  let generatedContent: string
  try {
    generatedContent = await generatePetitionContent(petitionData)
  } catch (error) {
    console.error('Content generation error:', error)
    throw new Error(`Failed to generate petition content: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Update the petition with new content
  const { data: petition, error: petitionError } = await supabase
    .from('petitions')
    .update({
      title: data.title,
      date: data.date,
      language: data.language,
      text: generatedContent,
      details: data.details || '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (petitionError) {
    console.error('Petition regeneration error:', petitionError)
    throw new Error(`Failed to regenerate petition: ${petitionError.message || petitionError.code || 'Database error'}`)
  }

  return petition
}

export async function duplicatePetition(id: string): Promise<Petition> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // First, get the original petition
  const { data: originalPetition, error: fetchError } = await supabase
    .from('petitions')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (fetchError || !originalPetition) {
    throw new Error('Failed to find original petition')
  }

  // Create duplicate with modified title
  const { data: duplicatedPetition, error: duplicateError } = await supabase
    .from('petitions')
    .insert([
      {
        parish_id: selectedParishId,
        title: `${originalPetition.title} - duplicate`,
        date: originalPetition.date,
        language: originalPetition.language,
        text: originalPetition.text,
        details: originalPetition.details,
        template: originalPetition.template,
      },
    ])
    .select()
    .single()

  if (duplicateError) {
    console.error('Petition duplication error:', duplicateError)
    throw new Error('Failed to duplicate petition')
  }

  return duplicatedPetition
}

export async function getPetitionsByDateRange(startDate: string, endDate: string): Promise<Petition[]> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { data, error } = await supabase
    .from('petitions')
    .select('*')
    .eq('parish_id', selectedParishId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch petitions by date range')
  }

  return data || []
}

export async function deletePetition(id: string) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { error } = await supabase
    .from('petitions')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Petition deletion error:', error)
    throw new Error('Failed to delete petition')
  }
}

