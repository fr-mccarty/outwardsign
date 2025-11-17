/**
 * Quinceañera Full Script (English) Template
 *
 * Complete quinceañera liturgy with all readings, responses, and directions
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
  formatLocationText,
  getReadingPericope,
  buildTitleEnglish,
  getEventSubtitleEnglish,
} from '../helpers'

/**
 * Build summary section (quinceañera celebration info)
 */
function buildSummarySection(quinceanera: QuinceaneraWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Quinceañera Celebration subsection
  elements.push({
    type: 'section-title',
    text: 'Quinceañera Celebration',
  })

  if (quinceanera.quinceanera) {
    elements.push({
      type: 'info-row',
      label: 'Quinceañera:',
      value: formatPersonName(quinceanera.quinceanera),
    })
  }

  if (quinceanera.family_contact) {
    elements.push({
      type: 'info-row',
      label: 'Family Contact:',
      value: formatPersonWithPhone(quinceanera.family_contact),
    })
  }

  if (quinceanera.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator:',
      value: formatPersonName(quinceanera.coordinator),
    })
  }

  if (quinceanera.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(quinceanera.presider),
    })
  }

  if (quinceanera.homilist) {
    elements.push({
      type: 'info-row',
      label: 'Homilist:',
      value: formatPersonName(quinceanera.homilist),
    })
  }

  if (quinceanera.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Lead Musician:',
      value: formatPersonName(quinceanera.lead_musician),
    })
  }

  if (quinceanera.cantor) {
    elements.push({
      type: 'info-row',
      label: 'Cantor:',
      value: formatPersonName(quinceanera.cantor),
    })
  }

  if (quinceanera.quinceanera_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Celebration Location:',
      value: formatLocationText(quinceanera.quinceanera_event.location),
    })
  }

  if (quinceanera.quinceanera_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Celebration Date & Time:',
      value: formatEventDateTime(quinceanera.quinceanera_event),
    })
  }

  if (quinceanera.quinceanera_reception?.location) {
    elements.push({
      type: 'info-row',
      label: 'Reception Location:',
      value: formatLocationText(quinceanera.quinceanera_reception.location),
    })
  }

  if (quinceanera.note) {
    elements.push({
      type: 'info-row',
      label: 'Note:',
      value: quinceanera.note,
    })
  }

  // Sacred Liturgy subsection
  elements.push({
    type: 'section-title',
    text: 'Sacred Liturgy',
  })

  if (quinceanera.first_reading) {
    elements.push({
      type: 'info-row',
      label: 'First Reading:',
      value: getReadingPericope(quinceanera.first_reading),
    })
  }

  if (quinceanera.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'First Reading Lector:',
      value: formatPersonName(quinceanera.first_reader),
    })
  }

  if (quinceanera.psalm) {
    elements.push({
      type: 'info-row',
      label: 'Psalm:',
      value: getReadingPericope(quinceanera.psalm),
    })
  }

  if (quinceanera.psalm_is_sung) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Choice:',
      value: 'Sung',
    })
  } else if (quinceanera.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Lector:',
      value: formatPersonName(quinceanera.psalm_reader),
    })
  }

  if (quinceanera.second_reading) {
    elements.push({
      type: 'info-row',
      label: 'Second Reading:',
      value: getReadingPericope(quinceanera.second_reading),
    })
  }

  if (quinceanera.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Second Reading Lector:',
      value: formatPersonName(quinceanera.second_reader),
    })
  }

  if (quinceanera.gospel_reading) {
    elements.push({
      type: 'info-row',
      label: 'Gospel Reading:',
      value: getReadingPericope(quinceanera.gospel_reading),
    })
  }

  // Determine petition reader
  const petitionsReader = quinceanera.petitions_read_by_second_reader && quinceanera.second_reader
    ? formatPersonName(quinceanera.second_reader)
    : quinceanera.petition_reader
    ? formatPersonName(quinceanera.petition_reader)
    : ''

  if (petitionsReader) {
    elements.push({
      type: 'info-row',
      label: 'Petitions Read By:',
      value: petitionsReader,
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Build full quinceañera script (English)
 */
export function buildFullScriptEnglish(quinceanera: QuinceaneraWithRelations): LiturgyDocument {
  const quinceaneraTitle = buildTitleEnglish(quinceanera)
  const eventDateTime = getEventSubtitleEnglish(quinceanera)

  const sections: ContentSection[] = []

  // Add summary section (title/subtitle handled at document level)
  sections.push(buildSummarySection(quinceanera))

  // Add all reading sections (only if they exist)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'LITURGY OF THE WORD',
    reading: quinceanera.first_reading,
    reader: quinceanera.first_reader,
    responseText: 'Thanks be to God.',
    showNoneSelected: true,
  })
  if (firstReadingSection) {
    sections.push(firstReadingSection)
  }

  const psalmSection = buildPsalmSection({
    psalm: quinceanera.psalm,
    psalm_reader: quinceanera.psalm_reader,
    psalm_is_sung: quinceanera.psalm_is_sung,
  })
  if (psalmSection) {
    sections.push(psalmSection)
  }

  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: 'SECOND READING',
    reading: quinceanera.second_reading,
    reader: quinceanera.second_reader,
    responseText: 'Thanks be to God.',
    pageBreakBefore: !!quinceanera.second_reading,
  })
  if (secondReadingSection) {
    sections.push(secondReadingSection)
  }

  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: 'GOSPEL',
    reading: quinceanera.gospel_reading,
    reader: quinceanera.presider,
    includeGospelAcclamations: true,
    pageBreakBefore: !!quinceanera.gospel_reading,
  })
  if (gospelSection) {
    sections.push(gospelSection)
  }

  // Add petitions if present
  const petitionsSection = buildPetitionsSection({
    petitions: quinceanera.petitions,
    petition_reader: quinceanera.petition_reader,
    second_reader: quinceanera.second_reader,
    petitions_read_by_second_reader: quinceanera.petitions_read_by_second_reader,
  })
  if (petitionsSection) {
    sections.push(petitionsSection)
  }

  // Add Act of Thanksgiving and Personal Commitment
  // Note: No pageBreakBefore needed - petitions section already has pageBreakAfter
  sections.push({
    id: 'act-of-thanksgiving',
    title: 'Act of Thanksgiving and Personal Commitment',
    elements: [
      {
        type: 'section-title',
        text: 'Act of Thanksgiving and Personal Commitment',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'Before the final blessing, the priest invites the quinceañera to make an act of thanksgiving and of a personal commitment to lead a Christian life. The quinceañera may do so in these or similar words:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'prayer-text',
        text: `Heavenly Father,
I thank you for the gift of life
for creating me in your image and likeness
and for calling me to be your daughter through baptism.

Thank you for sending your Son Jesus to save me
and your Holy Spirit to sanctify me.

To that which in your goodness and love
you will for me, I say "yes,"
With your grace I commit myself
to serve my brothers and sisters all my life.

Mary, Mother of Jesus and our Mother,
I dedicate myself to you.
Since you are my model of faith,
help me to continue learning from you what I need
to be a Christian woman.

Help me to hear the Word of God as you did,
holding it in my heart and loving others,
so that, as I walk with Jesus in this life,
I may worship Him with you in all eternity.

Amen.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest responds:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `${quinceanera.quinceanera ? formatPersonName(quinceanera.quinceanera) : 'N.'}, may God who has begun this good work in you bring it to completion.`,
      },
    ],
  })

  // Add announcements if present
  const announcementsSection = buildAnnouncementsSection(quinceanera.announcements)
  if (announcementsSection) {
    sections.push(announcementsSection)
  }

  return {
    id: quinceanera.id,
    type: 'quinceanera',
    language: 'en',
    template: 'quinceanera-full-script-english',
    title: quinceaneraTitle,
    subtitle: eventDateTime,
    sections,
  }
}
