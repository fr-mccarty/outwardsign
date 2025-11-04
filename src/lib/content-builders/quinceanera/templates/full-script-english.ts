/**
 * Quinceañera Full Script Template - English
 *
 * TODO: Expand this template with complete quinceañera liturgy content
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { LiturgyDocument } from '@/lib/types/liturgy-content'

export function buildFullScriptEnglish(quinceanera: QuinceaneraWithRelations): LiturgyDocument {
  const quinceaneraName = quinceanera.quinceanera
    ? `${quinceanera.quinceanera.first_name} ${quinceanera.quinceanera.last_name}`
    : '[Quinceañera Name]'

  return {
    title: `Quinceañera Celebration for ${quinceaneraName}`,
    sections: [
      {
        heading: 'Introduction',
        content: [
          {
            type: 'paragraph',
            text: `This is a quinceañera celebration for ${quinceaneraName}.`,
          },
          {
            type: 'paragraph',
            text: 'TODO: Add complete liturgy content following the wedding/funeral template patterns.',
          },
        ],
      },
      {
        heading: 'Liturgy of the Word',
        content: [
          {
            type: 'heading',
            level: 3,
            text: 'First Reading',
          },
          {
            type: 'paragraph',
            text: quinceanera.first_reading?.pericope || '[First Reading not selected]',
          },
          {
            type: 'paragraph',
            text: quinceanera.first_reading?.content || '',
          },
        ],
      },
      {
        heading: 'Petitions',
        content: [
          {
            type: 'paragraph',
            text: quinceanera.petitions || '[No petitions entered]',
          },
        ],
      },
    ],
  }
}
