import { CreatePetitionData } from '@/lib/types'

export interface TemplateVariables {
  TITLE: string
  LANGUAGE: string
  DETAILS: string
  TEMPLATE_CONTENT: string
}

export function replaceTemplateVariables(template: string, variables: TemplateVariables): string {
  let result = template
  
  // Replace each variable with its value
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    result = result.replaceAll(placeholder, value)
  })
  
  return result
}

export function getTemplateVariables(data: CreatePetitionData, templateContent?: string): TemplateVariables {
  return {
    TITLE: data.title,
    LANGUAGE: data.language,
    DETAILS: data.details,
    TEMPLATE_CONTENT: templateContent || '',
  }
}

export function getDefaultPromptTemplate(): string {
  return `Generate Catholic liturgical petitions in {{LANGUAGE}} for Mass.

Template Content: {{TEMPLATE_CONTENT}}
Community Details: {{DETAILS}}
Language: {{LANGUAGE}}

INSTRUCTIONS:
- Use the Template Content as the base structure if provided
- Incorporate the Community Details thoughtfully into petitions WITHOUT making assumptions about individuals' personal circumstances
- When mentioning specific people by name, pray for their general wellbeing or stated intentions only
- Generate in {{LANGUAGE}} language
- Each petition should end with "let us pray to the Lord" (or {{LANGUAGE}} equivalent)
- Separate each petition with a blank line

REQUIRED ORDER OF PETITIONS:
1. First: Petition for the Church (bishops, clergy, Church universal)
2. Second: Petition for the world (government leaders, peace, justice)
3. Third and later: Petitions for the deceased, sick members, sacraments, and special requests mentioned in the community details
4. Final: Petition for the local community and silent intentions

CRITICAL FORMATTING RULES:
- DO NOT include any title or heading
- DO NOT include any explanatory text or notes
- DO NOT add commentary before or after the petitions
- Return ONLY the petition text itself

Generate the petitions incorporating the community details now:`
}

export function getUserPromptTemplate(): string {
  // In a real application, this would fetch from the database
  // For now, we'll use localStorage as a simple storage mechanism
  if (typeof window !== 'undefined') {
    return localStorage.getItem('petition-prompt-template') || getDefaultPromptTemplate()
  }
  return getDefaultPromptTemplate()
}

