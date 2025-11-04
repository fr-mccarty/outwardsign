/**
 * Presentation Full Script - English
 * Based on the traditional Presentation in the Temple liturgy
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime } from '@/lib/utils/formatters'

export function buildFullScriptEnglish(presentation: PresentationWithRelations): LiturgyDocument {
  const child = presentation.child
  const mother = presentation.mother
  const father = presentation.father
  const childName = child ? `${child.first_name} ${child.last_name}` : '[Child\'s Name]'
  const childSex = child?.sex || 'Male'
  const motherName = mother ? `${mother.first_name} ${mother.last_name}` : '[Mother\'s Name]'
  const fatherName = father ? `${father.first_name} ${father.last_name}` : '[Father\'s Name]'
  const isBaptized = presentation.is_baptized

  // Helper function for gendered text in English
  const gendered = (maleText: string, femaleText: string) => {
    return childSex === 'Male' ? maleText : femaleText
  }

  const getParentsText = () => {
    return `the parents, ${motherName} and ${fatherName}`
  }

  const getAudienceText = () => 'parents'

  // Build title and subtitle
  const title = `Presentation in the Temple - ${childName}`
  const subtitle = presentation.presentation_event
    ? formatEventDateTime(presentation.presentation_event)
    : undefined

  // Build sections
  const sections: ContentSection[] = []

  // Main Liturgy Section
  const liturgyElements: ContentElement[] = []

  // After the Homily
  liturgyElements.push({
    type: 'section-title',
    text: 'After the Homily',
  })

  liturgyElements.push({
    type: 'text',
    text: '[After the Homily]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `Life is God's greatest gift to us. Grateful for the life of their ${gendered('son', 'daughter')}, ${getParentsText()} would like to present their ${gendered('son', 'daughter')} ${childName} to the Lord and to this community. We welcome you here to the front of the church.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[Walk to the front of the altar]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANT (to the ${getAudienceText()}): `,
        formatting: ['bold'],
      },
      {
        text: `By presenting this ${gendered('boy', 'girl')} to the Lord and to this community today, you ${isBaptized ? 'renew your commitment' : 'commit yourselves'} to raise ${gendered('him', 'her')} in the ways of faith. Do you understand and accept this responsibility?`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response
  liturgyElements.push({
    type: 'response',
    parts: [
      {
        text: 'PARENTS: ',
        formatting: ['bold'],
      },
      {
        text: 'Yes, we do.',
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANT (to the ${gendered('boy', 'girl')}): `,
        formatting: ['bold'],
      },
      {
        text: `${isBaptized ? 'As on the day of your baptism, I' : 'I'} sign you with the sign of the cross, and I ask your ${getAudienceText()} to do the same.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `Heavenly Father, you are the giver of all life. You gave us this ${gendered('son', 'daughter')} and we present ${gendered('him', 'her')} to you, as Mary presented Jesus in the temple. We pray for these ${getAudienceText()}. Bless them in their efforts to raise this ${gendered('boy', 'girl')} as a good Christian and as a good Catholic. Bless this child. Give ${gendered('him', 'her')} good health, protect ${gendered('him', 'her')} from any danger of body and spirit, and help ${gendered('him', 'her')} to grow in age and in wisdom, always in your presence.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer to Mary
  liturgyElements.push({
    type: 'text',
    text: `Holy Mary, Mother of God and our Mother, we ask your protection over this family and over this ${gendered('son', 'daughter')}. It is by following your example that this family brings this ${gendered('boy', 'girl')} to be presented to God, our creator, and to this community today. Help these parents to raise this child with word and example. We make our prayer in the name of Jesus Christ, who is Lord forever and ever.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response
  liturgyElements.push({
    type: 'response',
    parts: [
      {
        text: 'ASSEMBLY: ',
        formatting: ['bold'],
      },
      {
        text: 'Amen.',
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles
  liturgyElements.push({
    type: 'text',
    text: '[Bless religious articles]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Dismissal
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: 'Now we send you back to your places, as we show you our support with applause.',
      },
    ],
  })

  // Add liturgy section
  sections.push({
    id: 'liturgy',
    title: 'Presentation Liturgy',
    elements: liturgyElements,
  })

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
