/**
 * Dev Seeder: Sample Readings (Content Library)
 *
 * DEPRECATED: This seeder is now a no-op.
 *
 * Properly formatted liturgical readings are seeded via content-seed.ts during
 * onboarding. Those readings follow the CONTENT_STYLE_GUIDE.md format with:
 * - Pericope (right-aligned, italic)
 * - Reading type label (right-aligned, red)
 * - Introduction (bold)
 * - Scripture paragraphs
 * - Conclusion
 *
 * See: src/lib/onboarding-seeding/content-seed.ts
 * See: docs/CONTENT_STYLE_GUIDE.md
 */

import type { DevSeederContext } from './types'
import { logInfo } from '../../src/lib/utils/console'

export interface ReadingsResult {
  success: boolean
  count: number
}

export async function seedReadings(_ctx: DevSeederContext): Promise<ReadingsResult> {
  logInfo('')
  logInfo('Skipping readings seeder - using properly formatted readings from content-seed.ts')

  // Readings are now seeded via content-seed.ts during onboarding
  // with proper HTML formatting per CONTENT_STYLE_GUIDE.md
  return { success: true, count: 0 }
}
