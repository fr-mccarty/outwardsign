/**
 * Category Tags Seed Data
 *
 * Seeds default category tags (category_tags table) during parish onboarding.
 * Tags are organized by category with distinct sort_order ranges.
 * These tags are shared across content library, petitions, and other entities.
 *
 * HOW THE TAG SYSTEM WORKS:
 * =========================
 * Tags use the `slug` field as the primary identifier for filtering and matching.
 * The `slug` is a URL-safe, lowercase version of the tag name (e.g., 'first-reading').
 *
 * TAG CATEGORIES:
 * ---------------
 * 1. SACRAMENT TAGS (sort_order 1-10)
 *    - Identify which sacrament/event type content belongs to
 *    - Slugs: 'wedding', 'funeral', 'baptism', 'presentation', 'quinceanera'
 *
 * 2. SECTION TAGS (sort_order 10-30)
 *    - Identify the liturgical section/role of content
 *    - Slugs: 'reading', 'first-reading', 'second-reading', 'psalm', 'gospel',
 *             'opening-prayer', 'closing-prayer', 'prayers-of-the-faithful',
 *             'ceremony-instructions', 'announcements'
 *
 * 3. THEME TAGS (sort_order 31-50)
 *    - Optional thematic categorization for discoverability
 *    - Slugs: 'hope', 'resurrection', 'love', 'eternal-life', 'comfort',
 *             'joy', 'peace', 'faith', 'community', 'family'
 *
 * 4. TESTAMENT TAGS (sort_order 51-60)
 *    - Identify scripture source
 *    - Slugs: 'old-testament', 'new-testament'
 *
 * HOW TAGS ARE USED:
 * ------------------
 * - Content items are tagged via `tag_assignments` table (polymorphic)
 * - Input field definitions use `input_filter_tags` array to specify default picker filters
 * - Content pickers query content matching ALL active tags
 *
 * EXAMPLE USAGE:
 * --------------
 * - Wedding first readings: input_filter_tags = ['wedding', 'first-reading']
 * - Funeral opening prayers: input_filter_tags = ['funeral', 'opening-prayer']
 * - Bible study readings: input_filter_tags = ['reading']
 *
 * ADDING NEW TAGS:
 * ----------------
 * 1. Add to appropriate category array below
 * 2. Use a unique slug (lowercase, hyphenated)
 * 3. Assign sort_order within the category range
 * 4. Update content-seed.ts to use the new slug if seeding content
 * 5. Update event-types-seed.ts input_filter_tags if using in input fields
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logSuccess, logError } from '@/lib/utils/console'

// =====================================================
// Sacrament Tags (sort_order 1-10)
// Identify which sacrament/event type content belongs to
// =====================================================
const SACRAMENT_TAGS = [
  { name: 'Wedding', slug: 'wedding', sort_order: 1 },
  { name: 'Funeral', slug: 'funeral', sort_order: 2 },
  { name: 'Baptism', slug: 'baptism', sort_order: 3 },
  { name: 'Presentation', slug: 'presentation', sort_order: 4 },
  { name: 'Quinceañera', slug: 'quinceanera', sort_order: 5 },
]

// =====================================================
// Section Tags (sort_order 10-30)
// Identify the liturgical section/role of content
// =====================================================
const SECTION_TAGS = [
  { name: 'Reading', slug: 'reading', sort_order: 10 }, // Generic reading tag for Bible Studies, etc.
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

// =====================================================
// Theme Tags (sort_order 31-50)
// Optional thematic categorization for discoverability
// =====================================================
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

// =====================================================
// Testament Tags (sort_order 51-60)
// Identify scripture source (Old Testament vs New Testament)
// =====================================================
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
export async function seedCategoryTagsForParish(
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
    logError(`Error in seedCategoryTagsForParish: ${error}`)
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
