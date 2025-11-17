/**
 * Wedding Full Script (English) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
  hasRehearsalEvents,
  getReadingPericope,
  getPetitionsReaderName,
  buildTitleEnglish,
  getEventSubtitleEnglish,
} from '../helpers'

/**
 * Build summary section (rehearsal, wedding info, sacred liturgy info)
 */
function buildSummarySection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Rehearsal subsection
  if (hasRehearsalEvents(wedding)) {
    elements.push({
      type: 'section-title',
      text: 'Rehearsal',
    })

    if (wedding.rehearsal_event?.start_date) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Date & Time:',
        value: formatEventDateTime(wedding.rehearsal_event),
      })
    }

    if (wedding.rehearsal_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Location:',
        value: formatLocationWithAddress(wedding.rehearsal_event.location),
      })
    }

    if (wedding.rehearsal_dinner_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Dinner Location:',
        value: formatLocationWithAddress(wedding.rehearsal_dinner_event.location),
      })
    }
  }

  // Wedding subsection
  elements.push({
    type: 'section-title',
    text: 'Wedding',
  })

  if (wedding.bride) {
    elements.push({
      type: 'info-row',
      label: 'Bride:',
      value: formatPersonWithPhone(wedding.bride),
    })
  }

  if (wedding.groom) {
    elements.push({
      type: 'info-row',
      label: 'Groom:',
      value: formatPersonWithPhone(wedding.groom),
    })
  }

  if (wedding.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator:',
      value: formatPersonName(wedding.coordinator),
    })
  }

  if (wedding.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(wedding.presider),
    })
  }

  if (wedding.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Lead Musician:',
      value: formatPersonName(wedding.lead_musician),
    })
  }

  if (wedding.wedding_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Wedding Location:',
      value: formatLocationWithAddress(wedding.wedding_event.location),
    })
  }

  if (wedding.reception_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Reception Location:',
      value: formatLocationWithAddress(wedding.reception_event.location),
    })
  }

  if (wedding.witness_1) {
    elements.push({
      type: 'info-row',
      label: 'Best Man:',
      value: formatPersonName(wedding.witness_1),
    })
  }

  if (wedding.witness_2) {
    elements.push({
      type: 'info-row',
      label: 'Maid/Matron of Honor:',
      value: formatPersonName(wedding.witness_2),
    })
  }

  if (wedding.notes) {
    elements.push({
      type: 'info-row',
      label: 'Wedding Note:',
      value: wedding.notes,
    })
  }

  // Sacred Liturgy subsection - only show if there are readings/petitions
  const petitionsReader = getPetitionsReaderName(wedding)
  const hasLiturgyContent = wedding.first_reading || wedding.first_reader ||
    wedding.psalm || wedding.psalm_reader || wedding.psalm_is_sung ||
    wedding.second_reading || wedding.second_reader ||
    wedding.gospel_reading || petitionsReader

  if (hasLiturgyContent) {
    elements.push({
      type: 'section-title',
      text: 'Sacred Liturgy',
    })
  }

  if (wedding.first_reading) {
    elements.push({
      type: 'info-row',
      label: 'First Reading:',
      value: getReadingPericope(wedding.first_reading),
    })
  }

  if (wedding.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'First Reading Lector:',
      value: formatPersonName(wedding.first_reader),
    })
  }

  if (wedding.psalm) {
    elements.push({
      type: 'info-row',
      label: 'Psalm:',
      value: getReadingPericope(wedding.psalm),
    })
  }

  if (wedding.psalm_is_sung) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Choice:',
      value: 'Sung',
    })
  } else if (wedding.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Lector:',
      value: formatPersonName(wedding.psalm_reader),
    })
  }

  if (wedding.second_reading) {
    elements.push({
      type: 'info-row',
      label: 'Second Reading:',
      value: getReadingPericope(wedding.second_reading),
    })
  }

  if (wedding.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Second Reading Lector:',
      value: formatPersonName(wedding.second_reader),
    })
  }

  if (wedding.gospel_reading) {
    elements.push({
      type: 'info-row',
      label: 'Gospel Reading:',
      value: getReadingPericope(wedding.gospel_reading),
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
 * Build full wedding script (English)
 */
export function buildFullScriptEnglish(wedding: WeddingWithRelations): LiturgyDocument {
  const weddingTitle = buildTitleEnglish(wedding)
  const eventDateTime = getEventSubtitleEnglish(wedding)

  const sections: ContentSection[] = []

  // Build summary section first
  const summarySection = buildSummarySection(wedding)

  // Build all other sections (each checks individually if it has content)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'FIRST READING',
    reading: wedding.first_reading,
    reader: wedding.first_reader,
  })

  const psalmSection = buildPsalmSection({
    psalm: wedding.psalm,
    psalm_reader: wedding.psalm_reader,
    psalm_is_sung: wedding.psalm_is_sung,
  })

  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: 'SECOND READING',
    reading: wedding.second_reading,
    reader: wedding.second_reader,
    pageBreakBefore: !!wedding.second_reading,
  })

  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: 'GOSPEL',
    reading: wedding.gospel_reading,
    includeGospelDialogue: false,
    pageBreakBefore: !!wedding.gospel_reading,
  })

  // Build ceremony sections (Marriage Rite)
  const ceremonySections: ContentSection[] = []

  // Marriage Consent
  const brideName = wedding.bride ? formatPersonName(wedding.bride) : 'N.'
  const groomName = wedding.groom ? formatPersonName(wedding.groom) : 'N.'

  ceremonySections.push({
    id: 'marriage-consent',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'MARRIAGE CONSENT',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest addresses the bride and groom:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: `${brideName} and ${groomName}, have you come here to enter into Marriage without coercion, freely and wholeheartedly?`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'BRIDE AND GROOM:',
        text: 'We have.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Are you prepared, as you follow the path of Marriage, to love and honor each other for as long as you both shall live?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'BRIDE AND GROOM:',
        text: 'We are.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Are you prepared to accept children lovingly from God and to bring them up according to the law of Christ and his Church?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'BRIDE AND GROOM:',
        text: 'We are.',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest invites the couple to declare their consent:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: `Since it is your intention to enter the covenant of Holy Matrimony, join your right hands, and declare your consent before God and his Church.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'rubric',
        text: 'The bride and groom join hands. The groom says:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'GROOM:',
        text: `I, ${groomName}, take you, ${brideName}, to be my wife. I promise to be faithful to you, in good times and in bad, in sickness and in health, to love you and to honor you all the days of my life.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'rubric',
        text: 'The bride says:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'BRIDE:',
        text: `I, ${brideName}, take you, ${groomName}, to be my husband. I promise to be faithful to you, in good times and in bad, in sickness and in health, to love you and to honor you all the days of my life.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: 'May the Lord in his kindness strengthen the consent you have declared before the Church, and graciously bring to fulfillment his blessing within you. What God has joined, let no one put asunder.',
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

  // Exchange of Rings
  ceremonySections.push({
    id: 'exchange-of-rings',
    elements: [
      {
        type: 'section-title',
        text: 'BLESSING AND EXCHANGE OF RINGS',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest blesses the rings:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: 'May the Lord bless ✠ these rings which you will give to each other as a sign of love and fidelity.',
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
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The groom places the ring on the bride\'s finger and says:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'GROOM:',
        text: `${brideName}, receive this ring as a sign of my love and fidelity. In the name of the Father, and of the Son, and of the Holy Spirit.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'rubric',
        text: 'The bride places the ring on the groom\'s finger and says:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'BRIDE:',
        text: `${groomName}, receive this ring as a sign of my love and fidelity. In the name of the Father, and of the Son, and of the Holy Spirit.`,
      },
    ],
  })

  // Nuptial Blessing (after the Lord's Prayer at Mass, or here if outside Mass)
  ceremonySections.push({
    id: 'nuptial-blessing',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'NUPTIAL BLESSING',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest invites all to pray:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Let us humbly invoke by our prayers, dear brothers and sisters, God\'s blessing upon this bride and groom, that in his kindness he may favor with his help those on whom he has bestowed the Sacrament of Matrimony.',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'priest-text',
        text: `O God, who by your mighty power created all things out of nothing, and, when you had set in place the beginnings of the universe, formed man and woman in your own image, making the woman an inseparable helper to the man, that they might no longer be two, but one flesh, and taught that what you were pleased to make one must never be divided;

O God, who consecrated the bond of Marriage by so great a mystery that in the wedding covenant you foreshadow the Sacrament of Christ and his Church;

O God, by whom woman is joined to man and the companionship they had in the beginning is endowed with the one blessing not forfeited by original sin nor washed away by the flood.

Look now with favor on these your servants, joined together in Marriage, who ask to be strengthened by your blessing. Send down on them the grace of the Holy Spirit and pour your love into their hearts, that they may remain faithful in the Marriage covenant.

May the grace of love and peace abide in your daughter ${brideName}, and let her always follow the example of those holy women whose praises are sung in the Scriptures.

May her husband entrust his heart to her, so that, acknowledging her as his equal and his joint heir to the life of grace, he may show her due honor and cherish her always with the love that Christ has for his Church.

And now, Lord, we implore you: may these your servants hold fast to the faith and keep your commandments; made one in the flesh, may they be blameless in all they do; and with the strength that comes from the Gospel, may they bear true witness to Christ before all; (may they be blessed with children, and prove themselves virtuous parents, who live to see their children's children).

And grant that, reaching at last together the fullness of years for which they hope, they may come to the life of the blessed in the Kingdom of Heaven. Through Christ our Lord.`,
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

  const petitionsSection = buildPetitionsSection({
    petitions: wedding.petitions,
    petition_reader: wedding.petition_reader,
    second_reader: wedding.second_reader,
    petitions_read_by_second_reader: wedding.petitions_read_by_second_reader,
  })

  const announcementsSection = buildAnnouncementsSection(wedding.announcements)

  // Check if there are any sections after summary
  const hasFollowingSections = !!(
    firstReadingSection ||
    psalmSection ||
    secondReadingSection ||
    gospelSection ||
    ceremonySections.length > 0 ||
    petitionsSection ||
    announcementsSection
  )

  // Only add page break after summary if there are following sections
  summarySection.pageBreakAfter = hasFollowingSections

  // Add summary section
  sections.push(summarySection)

  // Add other sections (only non-null ones)
  if (firstReadingSection) sections.push(firstReadingSection)
  if (psalmSection) sections.push(psalmSection)
  if (secondReadingSection) sections.push(secondReadingSection)
  if (gospelSection) sections.push(gospelSection)

  // Add ceremony sections (between Gospel and Petitions)
  sections.push(...ceremonySections)

  if (petitionsSection) sections.push(petitionsSection)
  if (announcementsSection) sections.push(announcementsSection)

  return {
    id: wedding.id,
    type: 'wedding',
    language: 'en',
    template: 'wedding-full-script-english',
    title: weddingTitle,
    subtitle: eventDateTime,
    sections,
  }
}
