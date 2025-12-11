/**
 * Utilities for parsing and formatting petition text
 *
 * Petitions are stored as simple text, one per line.
 * Text is displayed exactly as entered - no automatic formatting.
 */

export interface Petition {
  id: string
  text: string
}

/**
 * Parse petition text from database into structured array
 * Each non-empty line becomes a petition
 */
export function parsePetitions(petitionsText: string | null | undefined): Petition[] {
  if (!petitionsText || !petitionsText.trim()) {
    return []
  }

  const lines = petitionsText.split('\n')
  const petitions: Petition[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) continue

    petitions.push({
      id: crypto.randomUUID(),
      text: trimmed,
    })
  }

  return petitions
}

/**
 * Format petitions array back into text for database storage
 * Stores just the petition text, one per line
 */
export function formatPetitionsForStorage(petitions: Petition[]): string {
  return petitions
    .map(p => p.text.trim())
    .filter(text => text.length > 0)
    .join('\n')
}
