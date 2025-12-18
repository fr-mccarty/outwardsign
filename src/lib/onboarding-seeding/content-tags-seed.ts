/**
 * Category Tags Seeding
 * Seeds default category tags during parish onboarding
 * Tags are organized by category with distinct sort_order ranges
 * These tags are shared across content library and petitions
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logSuccess, logError } from '@/lib/utils/console'

// Sacrament Tags (sort_order 1-10)
const SACRAMENT_TAGS = [
  { name: 'Wedding', slug: 'wedding', sort_order: 1 },
  { name: 'Funeral', slug: 'funeral', sort_order: 2 },
  { name: 'Baptism', slug: 'baptism', sort_order: 3 },
  { name: 'Presentation', slug: 'presentation', sort_order: 4 },
  { name: 'Quinceañera', slug: 'quinceanera', sort_order: 5 },
]

// Section Tags (sort_order 11-30)
const SECTION_TAGS = [
  { name: 'First Reading', slug: 'first-reading', sort_order: 11 },
  { name: 'Second Reading', slug: 'second-reading', sort_order: 12 },
  { name: 'Psalm', slug: 'psalm', sort_order: 13 },
  { name: 'Gospel', slug: 'gospel', sort_order: 14 },
  { name: 'Opening Prayer', slug: 'opening-prayer', sort_order: 15 },
  { name: 'Closing Prayer', slug: 'closing-prayer', sort_order: 16 },
  { name: 'Prayers of the Faithful', slug: 'prayers-of-the-faithful', sort_order: 17 },
  { name: 'Ceremony Instructions', slug: 'ceremony-instructions', sort_order: 18 },
  { name: 'Announcements', slug: 'announcements', sort_order: 19 },
]

// Theme Tags (sort_order 31-50)
const THEME_TAGS = [
  { name: 'Hope', slug: 'hope', sort_order: 31 },
  { name: 'Resurrection', slug: 'resurrection', sort_order: 32 },
  { name: 'Love', slug: 'love', sort_order: 33 },
  { name: 'Eternal Life', slug: 'eternal-life', sort_order: 34 },
  { name: 'Comfort', slug: 'comfort', sort_order: 35 },
  { name: 'Joy', slug: 'joy', sort_order: 36 },
  { name: 'Peace', slug: 'peace', sort_order: 37 },
  { name: 'Faith', slug: 'faith', sort_order: 38 },
  { name: 'Community', slug: 'community', sort_order: 39 },
  { name: 'Family', slug: 'family', sort_order: 40 },
]

// Testament Tags (sort_order 51-60)
const TESTAMENT_TAGS = [
  { name: 'Old Testament', slug: 'old-testament', sort_order: 51 },
  { name: 'New Testament', slug: 'new-testament', sort_order: 52 },
]

// Combined tags list
const ALL_TAGS = [
  ...SACRAMENT_TAGS,
  ...SECTION_TAGS,
  ...THEME_TAGS,
  ...TESTAMENT_TAGS
]

/**
 * Seed default category tags for a parish
 * Called during parish onboarding
 */
export async function seedContentTagsForParish(
  supabase: SupabaseClient,
  parishId: string
): Promise<void> {
  try {
    // Prepare tag data with parish_id
    const tagsToInsert = ALL_TAGS.map(tag => ({
      parish_id: parishId,
      name: tag.name,
      slug: tag.slug,
      sort_order: tag.sort_order,
      color: null // NULL for MVP
    }))

    // Insert all tags into category_tags table (shared across content and petitions)
    const { error } = await supabase
      .from('category_tags')
      .insert(tagsToInsert)

    if (error) {
      logError(`Error seeding category tags: ${error.message}`)
      throw new Error(`Failed to seed category tags: ${error.message}`)
    }

    logSuccess(`Seeded ${ALL_TAGS.length} category tags for parish ${parishId}`)
  } catch (error) {
    logError(`Error in seedContentTagsForParish: ${error}`)
    throw error
  }
}

/**
 * Export tag categories for reference
 */
export const CONTENT_TAG_CATEGORIES = {
  SACRAMENT_TAGS,
  SECTION_TAGS,
  THEME_TAGS,
  TESTAMENT_TAGS,
  ALL_TAGS
}
