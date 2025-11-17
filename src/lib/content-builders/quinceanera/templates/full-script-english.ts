/**
 * Quinceañera Full Script (English) Template
 *
 * Complete quinceañera liturgy with all readings, responses, and directions
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
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
      value: formatLocationWithAddress(quinceanera.quinceanera_event.location),
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
      value: formatLocationWithAddress(quinceanera.quinceanera_reception.location),
    })
  }

  if (quinceanera.note) {
    elements.push({
      type: 'info-row',
      label: 'Note:',
      value: quinceanera.note,
    })
  }

  // Sacred Liturgy subsection - only show if there are readings/petitions
  const petitionsReader = quinceanera.petitions_read_by_second_reader && quinceanera.second_reader
    ? formatPersonName(quinceanera.second_reader)
    : quinceanera.petition_reader
    ? formatPersonName(quinceanera.petition_reader)
    : ''
  const hasLiturgyContent = quinceanera.first_reading || quinceanera.first_reader ||
    quinceanera.psalm || quinceanera.psalm_reader || quinceanera.psalm_is_sung ||
    quinceanera.second_reading || quinceanera.second_reader ||
    quinceanera.gospel_reading || petitionsReader

  if (hasLiturgyContent) {
    elements.push({
      type: 'section-title',
      text: 'Sacred Liturgy',
    })
  }

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

  // Add ceremony sections (between Gospel and Petitions)
  const quinceaneraName = quinceanera.quinceanera ? formatPersonName(quinceanera.quinceanera) : 'N.'

  // Renewal of Baptismal Promises
  sections.push({
    id: 'renewal-of-promises',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'RENEWAL OF BAPTISMAL PROMISES',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest addresses the quinceañera:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: `${quinceaneraName}, do you renounce Satan and all his works and all his empty promises?`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'QUINCEAÑERA:',
        text: 'I do.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Do you believe in God, the Father almighty, Creator of heaven and earth?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'QUINCEAÑERA:',
        text: 'I do.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Do you believe in Jesus Christ, his only Son, our Lord, who was born of the Virgin Mary, suffered death and was buried, rose again from the dead and is seated at the right hand of the Father?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'QUINCEAÑERA:',
        text: 'I do.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Do you believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'QUINCEAÑERA:',
        text: 'I do.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: 'This is our faith. This is the faith of the Church. We are proud to profess it in Christ Jesus our Lord.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'ALL:',
        text: 'Amen.',
      },
    ],
  })

  // Blessing of the Quinceañera
  sections.push({
    id: 'blessing',
    elements: [
      {
        type: 'section-title',
        text: 'BLESSING OF THE QUINCEAÑERA',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'priest-text',
        text: `Lord Jesus Christ, you are the way, the truth, and the life. We ask you to bless ${quinceaneraName} as she begins this new stage of her life. May she always walk in your way, live in your truth, and share your life with those around her.

Grant her wisdom to discern your will, courage to follow where you lead, and love to reflect your presence to all she meets.

Protect her from harm, strengthen her in times of trial, and fill her heart with joy as she grows in faith.

We ask this through Christ our Lord.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'ALL:',
        text: 'Amen.',
      },
    ],
  })

  // Presentation of Symbols
  sections.push({
    id: 'presentation-of-symbols',
    elements: [
      {
        type: 'section-title',
        text: 'PRESENTATION OF SYMBOLS',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest may bless and present symbolic gifts such as a Bible, rosary, cross, or other religious items. If a tiara or crown is presented:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `This crown is a symbol of the dignity you have as a daughter of God. May you always remember that you are a child of the King of Heaven, called to live with grace and virtue.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'If a ring is presented:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `This ring is a symbol of God's eternal love for you. Just as this circle has no end, so God's love for you is without limit. Wear it as a reminder of your commitment to live as God's beloved daughter.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'If a Bible is presented:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `This Bible is the Word of God. May you read it often, treasure its teachings in your heart, and let it guide your life. Through Scripture, may you come to know God's love more deeply each day.`,
      },
    ],
  })

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
