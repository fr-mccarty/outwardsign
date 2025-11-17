/**
 * Presentation Full Script - English
 * Based on the traditional Presentation in the Temple liturgy
 *
 * STRUCTURE:
 * 1. Cover Page - Summary (page break after)
 * 2. Liturgy Section - Ceremony script
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime, formatLocationWithAddress, formatPersonWithPhone } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  type CoverPageSection,
  gendered,
  getStatusLabel,
} from '@/lib/content-builders/shared/builders'
import {
  getChildName,
  isBaptized,
  getParentsTextEnglish,
  getAudienceTextEnglish,
  buildTitleEnglish,
  getEventSubtitleEnglish,
} from '../helpers'

// ============================================================================
// SECTION 1: COVER PAGE
// ============================================================================
// (Uses shared buildCoverPage builder)

// ============================================================================
// SECTION 2: LITURGY
// ============================================================================

/**
 * Build liturgy section with ceremony script
 */
function buildLiturgySection(presentation: PresentationWithRelations): ContentSection {
  // Get names and values using shared helpers
  const childName = getChildName(presentation)
  const baptized = isBaptized(presentation)

  // Helper function for gendered text in English (wraps shared helper)
  const genderedText = (maleText: string, femaleText: string) => {
    return gendered(presentation.child, maleText, femaleText)
  }

  const getParentsText = () => getParentsTextEnglish(presentation)
  const getAudienceText = () => getAudienceTextEnglish()

  // Build liturgy elements
  const liturgyElements: ContentElement[] = []

  // After the Homily
  liturgyElements.push({
    type: 'section-title',
    text: 'After the Homily',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'After the Homily',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'PRESIDER:',
    text: `Life is God's greatest gift to us. Grateful for the life of their ${genderedText('son', 'daughter')}, ${getParentsText()} would like to present their ${genderedText('son', 'daughter')} ${childName} to the Lord and to this community. We welcome you here to the front of the church.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'Walk to the front of the altar',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'PRESIDER:',
    text: `(to the ${getAudienceText()}) By presenting this ${genderedText('boy', 'girl')} to the Lord and to this community today, you ${baptized ? 'renew your commitment' : 'commit yourselves'} to raise ${genderedText('him', 'her')} in the ways of faith. Do you understand and accept this responsibility?`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response
  liturgyElements.push({
    type: 'response-dialogue',
    label: 'PARENTS:',
    text: 'Yes, we do.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'PRESIDER:',
    text: `(to the ${genderedText('boy', 'girl')}) ${baptized ? 'As on the day of your baptism, I' : 'I'} sign you with the sign of the cross, and I ask your ${getAudienceText()} to do the same.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer
  liturgyElements.push({
    type: 'priest-text',
    text: `Heavenly Father, you are the giver of all life. You gave us this ${genderedText('son', 'daughter')} and we present ${genderedText('him', 'her')} to you, as Mary presented Jesus in the temple. We pray for these ${getAudienceText()}. Bless them in their efforts to raise this ${genderedText('boy', 'girl')} as a good Christian and as a good Catholic. Bless this child. Give ${genderedText('him', 'her')} good health, protect ${genderedText('him', 'her')} from any danger of body and spirit, and help ${genderedText('him', 'her')} to grow in age and in wisdom, always in your presence.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer to Mary
  liturgyElements.push({
    type: 'text',
    text: `Holy Mary, Mother of God and our Mother, we ask your protection over this family and over this ${genderedText('son', 'daughter')}. It is by following your example that this family brings this ${genderedText('boy', 'girl')} to be presented to God, our creator, and to this community today. Help these parents to raise this child with word and example. We make our prayer in the name of Jesus Christ, who is Lord forever and ever.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response
  liturgyElements.push({
    type: 'response-dialogue',
    label: 'ASSEMBLY:',
    text: 'Amen.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles
  liturgyElements.push({
    type: 'rubric',
    text: 'Bless religious articles',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Dismissal
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'PRESIDER:',
    text: 'Now we send you back to your places, as we show you our support with applause.',
  })

  return {
    id: 'liturgy',
    elements: liturgyElements,
  }
}

// ============================================================================
// MAIN TEMPLATE BUILDER
// ============================================================================

/**
 * Build complete presentation liturgy document (English)
 *
 * DOCUMENT STRUCTURE:
 * 1. Cover Page (summary) [PAGE BREAK]
 * 2. Liturgy Section (ceremony script)
 */
export function buildFullScriptEnglish(presentation: PresentationWithRelations): LiturgyDocument {
  // Calculate title and subtitle
  const title = buildTitleEnglish(presentation)
  const subtitle = getEventSubtitleEnglish(presentation)

  const sections: ContentSection[] = []

  // 1. COVER PAGE - Build sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Presentation Information subsection
  const presentationRows = []
  if (presentation.child) {
    presentationRows.push({ label: 'Child:', value: formatPersonWithPhone(presentation.child) })
  }
  if (presentation.mother) {
    presentationRows.push({ label: 'Mother:', value: formatPersonWithPhone(presentation.mother) })
  }
  if (presentation.father) {
    presentationRows.push({ label: 'Father:', value: formatPersonWithPhone(presentation.father) })
  }
  if (presentation.coordinator) {
    presentationRows.push({ label: 'Coordinator:', value: formatPersonWithPhone(presentation.coordinator) })
  }
  if (presentation.presentation_event?.start_date) {
    presentationRows.push({ label: 'Event Date & Time:', value: formatEventDateTime(presentation.presentation_event) })
  }
  if (presentation.presentation_event?.location) {
    presentationRows.push({ label: 'Location:', value: formatLocationWithAddress(presentation.presentation_event.location) })
  }
  presentationRows.push({
    label: 'Baptism Status:',
    value: presentation.is_baptized ? 'Baptized' : 'Not yet baptized',
  })
  if (presentation.status) {
    presentationRows.push({
      label: 'Status:',
      value: getStatusLabel(presentation.status, 'en'),
    })
  }
  if (presentation.note) {
    presentationRows.push({ label: 'Notes:', value: presentation.note })
  }
  coverSections.push({ title: 'Presentation Information', rows: presentationRows })

  sections.push(buildCoverPage(coverSections))

  // 2. LITURGY SECTION
  sections.push(buildLiturgySection(presentation))

  return {
    id: presentation.id,
    type: 'presentation',
    language: 'en',
    template: 'presentation-english',
    title,
    subtitle,
    sections,
  }
}
