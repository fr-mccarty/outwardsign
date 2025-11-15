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
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  getChildName,
  getChildSex,
  isBaptized,
  gendered,
  getParentsTextEnglish,
  getAudienceTextEnglish,
  buildTitleEnglish,
  formatLocationText,
  getEventSubtitleEnglish,
} from '../helpers'

// ============================================================================
// SECTION 1: COVER PAGE
// ============================================================================

/**
 * Build cover page with presentation summary information
 */
function buildCoverPage(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Title and subtitle header
  const title = buildTitleEnglish(presentation)
  const subtitle = getEventSubtitleEnglish(presentation)

  elements.push({
    type: 'event-title',
    text: title,
  })

  elements.push({
    type: 'event-datetime',
    text: subtitle,
  })

  // Presentation Information subsection
  elements.push({
    type: 'section-title',
    text: 'Presentation Information',
  })

  if (presentation.child) {
    elements.push({
      type: 'info-row',
      label: 'Child:',
      value: formatPersonName(presentation.child),
    })
  }

  if (presentation.mother) {
    elements.push({
      type: 'info-row',
      label: 'Mother:',
      value: formatPersonName(presentation.mother),
    })
  }

  if (presentation.father) {
    elements.push({
      type: 'info-row',
      label: 'Father:',
      value: formatPersonName(presentation.father),
    })
  }

  if (presentation.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator:',
      value: formatPersonName(presentation.coordinator),
    })
  }

  if (presentation.presentation_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Event Date & Time:',
      value: formatEventDateTime(presentation.presentation_event),
    })
  }

  if (presentation.presentation_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: formatLocationText(presentation.presentation_event.location),
    })
  }

  elements.push({
    type: 'info-row',
    label: 'Baptism Status:',
    value: presentation.is_baptized ? 'Baptized' : 'Not yet baptized',
  })

  if (presentation.status) {
    elements.push({
      type: 'info-row',
      label: 'Status:',
      value: presentation.status,
    })
  }

  if (presentation.note) {
    elements.push({
      type: 'info-row',
      label: 'Notes:',
      value: presentation.note,
    })
  }

  return {
    id: 'cover',
    pageBreakAfter: true, // Always page break after cover
    elements,
  }
}

// ============================================================================
// SECTION 2: LITURGY
// ============================================================================

/**
 * Build liturgy section with ceremony script
 */
function buildLiturgySection(presentation: PresentationWithRelations): ContentSection {
  // Get names and values using shared helpers
  const childName = getChildName(presentation)
  const childSex = getChildSex(presentation)
  const baptized = isBaptized(presentation)

  // Helper function for gendered text in English (wraps shared helper)
  const genderedText = (maleText: string, femaleText: string) => {
    return gendered(presentation, maleText, femaleText)
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
    type: 'priest-dialogue',
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
    type: 'priest-dialogue',
    text: `(to the ${getAudienceText()}) By presenting this ${genderedText('boy', 'girl')} to the Lord and to this community today, you ${baptized ? 'renew your commitment' : 'commit yourselves'} to raise ${genderedText('him', 'her')} in the ways of faith. Do you understand and accept this responsibility?`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response
  liturgyElements.push({
    type: 'response',
    label: 'PARENTS:',
    text: 'Yes, we do.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross
  liturgyElements.push({
    type: 'priest-dialogue',
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
    type: 'response',
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
    type: 'priest-dialogue',
    text: 'Now we send you back to your places, as we show you our support with applause.',
  })

  return {
    id: 'liturgy',
    pageBreakBefore: true, // Start on new page after cover
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
  const subtitle = presentation.presentation_event
    ? formatEventDateTime(presentation.presentation_event)
    : undefined

  // Build all sections in order
  const sections: ContentSection[] = []

  // PAGE 1: Cover page
  sections.push(buildCoverPage(presentation))

  // PAGE 2: Liturgy section
  sections.push(buildLiturgySection(presentation))

  // Return complete document
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
