/**
 * Announcements Builder
 *
 * Builds announcements section
 * Structure: Announcements Title > Announcements Text
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * Build an announcements section
 *
 * Creates simple announcements section.
 * Returns null if no announcements provided.
 * Always has pageBreakAfter: true.
 *
 * @param announcements - Announcement text
 * @returns ContentSection or null if no announcements
 *
 * @example
 * buildAnnouncementsSection(wedding.announcements)
 */
export function buildAnnouncementsSection(
  announcements?: string | null
): ContentSection | null {
  // No announcements - exclude section
  if (!announcements) {
    return null
  }

  const elements: ContentElement[] = []

  // Announcements title
  elements.push({
    type: 'section-title',
    text: 'Announcements',
  })

  // Announcements text
  elements.push({
    type: 'reading-text',
    text: announcements,
  })

  return {
    id: 'announcements',
    pageBreakAfter: true,
    elements,
  }
}
