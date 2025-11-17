/**
 * Funeral Full Script (English) Template
 *
 * Complete funeral liturgy with all readings, responses, and directions
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
  buildTitleEnglish,
  getEventSubtitleEnglish,
} from '../helpers'

/**
 * Build summary section (funeral service info)
 */
function buildSummarySection(funeral: FuneralWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Funeral Service subsection
  elements.push({
    type: 'section-title',
    text: 'Funeral Service Information',
  })

  if (funeral.deceased) {
    elements.push({
      type: 'info-row',
      label: 'Deceased:',
      value: formatPersonName(funeral.deceased),
    })
  }

  if (funeral.family_contact) {
    elements.push({
      type: 'info-row',
      label: 'Family Contact:',
      value: formatPersonWithPhone(funeral.family_contact),
    })
  }

  if (funeral.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator:',
      value: formatPersonName(funeral.coordinator),
    })
  }

  if (funeral.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(funeral.presider),
    })
  }

  if (funeral.homilist) {
    elements.push({
      type: 'info-row',
      label: 'Homilist:',
      value: formatPersonName(funeral.homilist),
    })
  }

  if (funeral.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Lead Musician:',
      value: formatPersonName(funeral.lead_musician),
    })
  }

  if (funeral.cantor) {
    elements.push({
      type: 'info-row',
      label: 'Cantor:',
      value: formatPersonName(funeral.cantor),
    })
  }

  if (funeral.funeral_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Service Location:',
      value: formatLocationWithAddress(funeral.funeral_event.location),
    })
  }

  if (funeral.funeral_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Service Date & Time:',
      value: formatEventDateTime(funeral.funeral_event),
    })
  }

  // Liturgical Roles subsection - only show if there are roles assigned
  const hasLiturgicalRoles = funeral.first_reader || funeral.psalm_reader ||
    funeral.second_reader || funeral.gospel_reader ||
    funeral.petition_reader || funeral.petitions_read_by_second_reader

  if (hasLiturgicalRoles) {
    elements.push({
      type: 'section-title',
      text: 'Liturgical Roles',
    })
  }

  if (funeral.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'First Reader:',
      value: formatPersonName(funeral.first_reader),
    })
  }

  if (funeral.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Reader:',
      value: formatPersonName(funeral.psalm_reader),
    })
  }

  if (funeral.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Second Reader:',
      value: formatPersonName(funeral.second_reader),
    })
  }

  if (funeral.gospel_reader) {
    elements.push({
      type: 'info-row',
      label: 'Gospel Reader:',
      value: formatPersonName(funeral.gospel_reader),
    })
  }

  if (funeral.petition_reader) {
    elements.push({
      type: 'info-row',
      label: 'Petition Reader:',
      value: formatPersonName(funeral.petition_reader),
    })
  } else if (funeral.petitions_read_by_second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Petition Reader:',
      value: 'Second Reader',
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Main builder function
 */
export function buildFullScriptEnglish(funeral: FuneralWithRelations): LiturgyDocument {
  // Build funeral title and subtitle using helpers
  const funeralTitle = buildTitleEnglish(funeral)
  const eventDateTime = getEventSubtitleEnglish(funeral)

  const sections: ContentSection[] = []

  // Build summary section first
  const summarySection = buildSummarySection(funeral)

  // Build all other sections (each checks individually if it has content)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'LITURGY OF THE WORD',
    reading: funeral.first_reading,
    reader: funeral.first_reader,
    responseText: 'Thanks be to God.',
  })

  const psalmSection = buildPsalmSection({
    psalm: funeral.psalm,
    psalm_reader: funeral.psalm_reader,
    psalm_is_sung: funeral.psalm_is_sung,
  })

  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: 'SECOND READING',
    reading: funeral.second_reading,
    reader: funeral.second_reader,
    responseText: 'Thanks be to God.',
    pageBreakBefore: !!funeral.second_reading,
  })

  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: 'GOSPEL',
    reading: funeral.gospel_reading,
    reader: funeral.presider,
    includeGospelAcclamations: true,
    pageBreakBefore: !!funeral.gospel_reading,
  })

  // Build ceremony sections (Final Commendation)
  const ceremonySections: ContentSection[] = []

  const deceasedName = funeral.deceased ? formatPersonName(funeral.deceased) : 'N.'

  // Final Commendation
  ceremonySections.push({
    id: 'final-commendation',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'FINAL COMMENDATION',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest invites those present to pray:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Before we go our separate ways, let us take leave of our brother/sister. May our farewell express our affection for him/her; may it ease our sadness and strengthen our hope. One day we shall joyfully greet him/her again when the love of Christ, which conquers all things, destroys even death itself.',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The priest may sprinkle the coffin with holy water and incense it. Then he says the prayer of commendation:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `Into your hands, Father of mercies, we commend our brother/sister ${deceasedName}, in the sure and certain hope that, together with all who have died in Christ, he/she will rise with him on the last day.

We give you thanks for the blessings which you have bestowed upon ${deceasedName} in this life: they are signs to us of your goodness and of our fellowship with the saints in Christ.

Merciful Lord, turn toward us and listen to our prayers: open the gates of paradise to your servant and help us who remain to comfort one another with assurances of faith, until we all meet in Christ and are with you and with our brother/sister forever.

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

  // Song of Farewell
  ceremonySections.push({
    id: 'song-of-farewell',
    elements: [
      {
        type: 'section-title',
        text: 'SONG OF FAREWELL',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The following or another suitable song may be sung:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'ALL:',
        text: `Saints of God, come to his/her aid!
Hasten to meet him/her, angels of the Lord!

Receive his/her soul and present him/her to God the Most High.

May Christ, who called you, take you to himself;
may angels lead you to the bosom of Abraham.

Receive his/her soul and present him/her to God the Most High.

Eternal rest grant unto him/her, O Lord,
and let perpetual light shine upon him/her.

Receive his/her soul and present him/her to God the Most High.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'priest-dialogue',
        text: 'In peace let us take our brother/sister to his/her place of rest.',
      },
    ],
  })

  // Procession to Place of Committal
  ceremonySections.push({
    id: 'procession',
    elements: [
      {
        type: 'section-title',
        text: 'PROCESSION TO PLACE OF COMMITTAL',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'The following or another suitable song may be sung during the procession:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'prayer-text',
        text: `May the angels lead you into paradise;
may the martyrs come to welcome you
and take you to the holy city,
the new and eternal Jerusalem.

May choirs of angels welcome you
and lead you to the bosom of Abraham;
and where Lazarus is poor no longer
may you find eternal rest.`,
      },
    ],
  })

  const petitionsSection = buildPetitionsSection({
    petitions: funeral.petitions,
    petition_reader: funeral.petition_reader,
    second_reader: funeral.second_reader,
    petitions_read_by_second_reader: funeral.petitions_read_by_second_reader,
  })

  const announcementsSection = buildAnnouncementsSection(funeral.announcements)

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
    id: funeral.id,
    type: 'funeral',
    language: 'en',
    template: 'funeral-full-script-english',
    title: funeralTitle,
    subtitle: eventDateTime,
    sections,
  }
}
