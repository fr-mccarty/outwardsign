// Utility functions for petition context handling

export interface ContextData {
  name: string
  description?: string
  details: string
  sacraments_received: Array<{ name: string; details?: string }>
  deaths_this_week: Array<{ name: string; details?: string }>
  sick_members: Array<{ name: string; details?: string }>
  special_petitions: Array<{ name: string; details?: string }>
  default_petition_text?: string
}

// Helper function to get petition text from context field
export function getPetitionTextFromContext(context: string): string {
  if (!context || context.trim() === '') {
    return ''
  }
  
  // If it's already simple text, return it
  try {
    const parsed = JSON.parse(context)
    // If it's a complex object, ignore it and treat as empty
    if (typeof parsed === 'object') {
      return ''
    }
    return context
  } catch {
    // If it's not JSON, it's simple text
    return context
  }
}

// Legacy function for backward compatibility
export function parseContextData(context: string): ContextData | null {
  if (!context || context.trim() === '') {
    return null
  }
  
  try {
    const parsed = JSON.parse(context)
    
    // Validate that we have the required structure
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    
    // Ensure required fields exist and have valid values
    if (!parsed.name || typeof parsed.name !== 'string' || parsed.name.trim() === '') {
      return null
    }
    
    // Return parsed data with defaults for missing fields
    return {
      name: parsed.name,
      description: parsed.description || '',
      details: parsed.details || '',
      sacraments_received: Array.isArray(parsed.sacraments_received) ? parsed.sacraments_received : [],
      deaths_this_week: Array.isArray(parsed.deaths_this_week) ? parsed.deaths_this_week : [],
      sick_members: Array.isArray(parsed.sick_members) ? parsed.sick_members : [],
      special_petitions: Array.isArray(parsed.special_petitions) ? parsed.special_petitions : [],
      default_petition_text: parsed.default_petition_text || ''
    }
  } catch {
    return null
  }
}