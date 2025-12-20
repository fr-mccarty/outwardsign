/**
 * Dev Seeder: Sample Readings (Content Library)
 *
 * Seeds liturgical readings into the contents table with proper tags.
 * Readings are sourced from src/lib/data/readings.ts
 *
 * HOW FUTURE AGENTS CAN FIND READINGS:
 * =====================================
 * Readings are stored in the `contents` table and tagged via `tag_assignments`.
 *
 * To find readings, query by tags:
 * - Sacrament tags: 'wedding', 'funeral'
 * - Section tags: 'first-reading', 'second-reading', 'psalm', 'gospel'
 * - Testament tags: 'old-testament', 'new-testament'
 *
 * Example queries:
 * - Wedding first readings: tags = ['wedding', 'first-reading']
 * - Funeral gospels: tags = ['funeral', 'gospel']
 * - All psalms for weddings: tags = ['wedding', 'psalm']
 *
 * The pericope (scripture reference) is stored in the `title` field.
 * The reading text is stored in the `body` field.
 * The liturgical introduction is stored in the `description` field.
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo } from '../../src/lib/utils/console'
import { readingsData, type ReadingData } from '../../src/lib/data/readings'

export interface ReadingsResult {
  success: boolean
  count: number
}

// Map from readings.ts categories to content tag slugs
const CATEGORY_TO_TAG: Record<string, string> = {
  WEDDING: 'wedding',
  FUNERAL: 'funeral',
  FIRST_READING: 'first-reading',
  SECOND_READING: 'second-reading',
  PSALM: 'psalm',
  GOSPEL: 'gospel'
}

// Determine testament based on book name
function getTestamentTag(pericope: string): string {
  const oldTestamentBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Tobit', 'Judith',
    'Esther', '1 Maccabees', '2 Maccabees', 'Job', 'Psalm', 'Proverbs',
    'Ecclesiastes', 'Song of Songs', 'Wisdom', 'Sirach', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Baruch', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
    'Zechariah', 'Malachi'
  ]

  const bookName = pericope.split(' ')[0]
  // Handle numbered books like "1 Corinthians"
  const fullBookName = pericope.match(/^(\d\s)?[A-Za-z]+/)?.[0] || bookName

  return oldTestamentBooks.some(book =>
    fullBookName.toLowerCase().startsWith(book.toLowerCase())
  ) ? 'old-testament' : 'new-testament'
}

// Select readings: 4 from each category combination
function selectReadings(allReadings: ReadingData[]): ReadingData[] {
  const selected: ReadingData[] = []
  const categories = [
    ['WEDDING', 'FIRST_READING'],
    ['WEDDING', 'PSALM'],
    ['WEDDING', 'SECOND_READING'],
    ['WEDDING', 'GOSPEL'],
    ['FUNERAL', 'FIRST_READING'],
    ['FUNERAL', 'PSALM'],
    ['FUNERAL', 'SECOND_READING'],
    ['FUNERAL', 'GOSPEL']
  ]

  for (const [sacrament, section] of categories) {
    const matching = allReadings.filter(r =>
      r.categories.includes(sacrament) && r.categories.includes(section)
    )
    // Take first 4 of each category
    selected.push(...matching.slice(0, 4))
  }

  return selected
}

export async function seedReadings(ctx: DevSeederContext): Promise<ReadingsResult> {
  const { supabase, parishId } = ctx

  logInfo('')
  logInfo('Seeding readings into content library...')

  // Note: Contents are cleaned up by dev-seed.ts before this runs, so no skip check needed

  // Get category tags for this parish
  const { data: tags, error: tagsError } = await supabase
    .from('category_tags')
    .select('id, slug')
    .eq('parish_id', parishId)

  if (tagsError || !tags || tags.length === 0) {
    logWarning('No category tags found - run content tags seeder first')
    return { success: false, count: 0 }
  }

  const tagMap = new Map(tags.map(t => [t.slug, t.id]))

  // Select ~32 readings (4 per category)
  const selectedReadings = selectReadings(readingsData)
  logInfo(`Selected ${selectedReadings.length} readings to seed`)

  let contentCount = 0
  let tagCount = 0

  for (const reading of selectedReadings) {
    // Build description from introduction and conclusion
    const descriptionParts: string[] = []
    if (reading.introduction) descriptionParts.push(reading.introduction)
    if (reading.conclusion) descriptionParts.push(reading.conclusion)
    const description = descriptionParts.join(' | ') || null

    // Insert content
    const { data: newContent, error: contentError } = await supabase
      .from('contents')
      .insert({
        parish_id: parishId,
        title: reading.pericope,
        body: reading.text,
        language: 'en',
        description
      })
      .select('id')
      .single()

    if (contentError) {
      logWarning(`Error creating reading ${reading.pericope}: ${contentError.message}`)
      continue
    }

    contentCount++

    // Build tag list
    const tagSlugs: string[] = []
    for (const cat of reading.categories) {
      const slug = CATEGORY_TO_TAG[cat]
      if (slug) tagSlugs.push(slug)
    }
    tagSlugs.push(getTestamentTag(reading.pericope))

    // Create tag assignments
    const validTagIds = tagSlugs
      .map(slug => tagMap.get(slug))
      .filter((id): id is string => id !== undefined)

    if (validTagIds.length > 0) {
      const { error: assignmentError } = await supabase
        .from('tag_assignments')
        .insert(
          validTagIds.map(tagId => ({
            tag_id: tagId,
            entity_type: 'content',
            entity_id: newContent.id
          }))
        )

      if (!assignmentError) {
        tagCount += validTagIds.length
      }
    }
  }

  logSuccess(`Created ${contentCount} readings in content library`)
  logSuccess(`Created ${tagCount} tag assignments`)

  return { success: true, count: contentCount }
}
