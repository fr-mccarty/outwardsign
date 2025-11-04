/**
 * Utilities for handling variables in petition templates
 * Variables use {{variable_name}} syntax
 *
 * Special gender-based variables:
 * - {{he_she}}, {{him_her}}, {{his_her}}, {{his_hers}}
 * - For Spanish: {{el_la}}, {{del_de_la}}, {{difunto_difunta}}, etc.
 */

export interface PetitionVariables {
  [key: string]: string | undefined
  gender?: 'male' | 'female' | 'unknown'
  language?: 'en' | 'es'
}

/**
 * Gender-based pronoun mappings
 */
const GENDER_PRONOUNS = {
  en: {
    male: {
      he_she: 'he',
      him_her: 'him',
      his_her: 'his',
      his_hers: 'his',
      himself_herself: 'himself',
    },
    female: {
      he_she: 'she',
      him_her: 'her',
      his_her: 'her',
      his_hers: 'hers',
      himself_herself: 'herself',
    },
    unknown: {
      he_she: 'they',
      him_her: 'them',
      his_her: 'their',
      his_hers: 'theirs',
      himself_herself: 'themselves',
    },
  },
  es: {
    male: {
      el_la: 'el',
      del_de_la: 'del',
      al_a_la: 'al',
      difunto_difunta: 'difunto',
      bautizado_bautizada: 'bautizado',
      presentado_presentada: 'presentado',
      niño_niña: 'niño',
      hijo_hija: 'hijo',
    },
    female: {
      el_la: 'la',
      del_de_la: 'de la',
      al_a_la: 'a la',
      difunto_difunta: 'difunta',
      bautizado_bautizada: 'bautizada',
      presentado_presentada: 'presentada',
      niño_niña: 'niña',
      hijo_hija: 'hija',
    },
    unknown: {
      el_la: 'el/la',
      del_de_la: 'del/de la',
      al_a_la: 'al/a la',
      difunto_difunta: 'difunto/a',
      bautizado_bautizada: 'bautizado/a',
      presentado_presentada: 'presentado/a',
      niño_niña: 'niño/a',
      hijo_hija: 'hijo/a',
    },
  },
}

/**
 * Replace variables in a template string
 * Example: "For {{bride_name}} and {{groom_name}}" -> "For Mary and John"
 * Example: "For {{deceased_name}}, that {{he_she}} may rest" -> "For John, that he may rest"
 */
export function replaceVariables(
  template: string,
  variables: PetitionVariables
): string {
  let result = template
  const gender = variables.gender || 'unknown'
  const language = variables.language || 'en'

  // First, replace gender-based pronouns
  const pronouns = GENDER_PRONOUNS[language]?.[gender] || GENDER_PRONOUNS.en.unknown
  Object.entries(pronouns).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi')
    result = result.replace(regex, value)
  })

  // Then replace regular variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'gender' && key !== 'language') {
      // Replace all instances of {{key}} with the value
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value)
    }
  })

  // Clean up any remaining unreplaced variables by removing them
  // This handles cases where a variable wasn't provided
  result = result.replace(/\{\{[^}]+\}\}/g, '[Name]')

  return result
}

/**
 * Extract variables from a template string
 * Returns array of variable names found in the template
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g)
  if (!matches) return []

  return matches.map(match => match.replace(/\{\{|\}\}/g, '').trim())
}

/**
 * Check if a string contains any variables
 */
export function hasVariables(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text)
}

/**
 * Get missing variables - variables in template that aren't provided
 */
export function getMissingVariables(
  template: string,
  variables: PetitionVariables
): string[] {
  const allVariables = extractVariables(template)
  return allVariables.filter(
    varName => variables[varName] === undefined || variables[varName] === null
  )
}
