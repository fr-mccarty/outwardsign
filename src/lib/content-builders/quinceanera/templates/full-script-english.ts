/**
 * Quinceañera Full Script Template - English
 *
 * TODO: Expand this template with complete quinceañera liturgy content
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatEventDateTime } from '@/lib/utils/formatters'

export function buildFullScriptEnglish(quinceanera: QuinceaneraWithRelations): LiturgyDocument {
  const quinceaneraName = quinceanera.quinceanera
    ? `${quinceanera.quinceanera.first_name} ${quinceanera.quinceanera.last_name}`
    : '[Quinceañera Name]'

  const eventDateTime =
    quinceanera.quinceanera_event?.start_date && quinceanera.quinceanera_event?.start_time
      ? formatEventDateTime(quinceanera.quinceanera_event)
      : 'Missing Date and Time'

  const sections: ContentSection[] = []

  // Introduction section
  sections.push({
    id: 'introduction',
    title: 'Introduction',
    elements: [
      {
        type: 'event-title',
        text: `Quinceañera Celebration for ${quinceaneraName}`,
        alignment: 'center',
      },
      {
        type: 'event-datetime',
        text: eventDateTime,
        alignment: 'center',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'text',
        text: 'TODO: Add complete liturgy content following the wedding/funeral template patterns.',
      },
    ],
  })

  // Liturgy of the Word section
  if (quinceanera.first_reading) {
    sections.push({
      id: 'first-reading',
      title: 'Liturgy of the Word',
      pageBreakBefore: true,
      elements: [
        {
          type: 'reading-title',
          text: 'FIRST READING',
          alignment: 'center',
        },
        {
          type: 'pericope',
          text: quinceanera.first_reading.pericope || '',
          alignment: 'center',
        },
        {
          type: 'spacer',
          size: 'small',
        },
        {
          type: 'reading-text',
          text: quinceanera.first_reading.text || '',
          preserveLineBreaks: true,
        },
      ],
    })
  }

  // Petitions section
  if (quinceanera.petitions) {
    sections.push({
      id: 'petitions',
      title: 'Petitions',
      pageBreakBefore: true,
      elements: [
        {
          type: 'section-title',
          text: 'Universal Prayer / Prayer of the Faithful',
          alignment: 'center',
        },
        {
          type: 'spacer',
          size: 'medium',
        },
        {
          type: 'text',
          text: quinceanera.petitions,
          preserveLineBreaks: true,
        },
      ],
    })
  }

  return {
    id: quinceanera.id,
    type: 'quinceanera',
    language: 'en',
    template: 'quinceanera-full-script-english',
    title: `Quinceañera Celebration for ${quinceaneraName}`,
    subtitle: eventDateTime,
    sections,
  }
}
