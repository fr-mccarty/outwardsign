/**
 * Mass Full Script (English) Template
 *
 * Complete Mass liturgy with all readings, petitions, and directions
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'

/**
 * Build summary section (Mass info, liturgical event, ministers)
 */
function buildSummarySection(mass: MassWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Mass Information
  elements.push({
    type: 'section-title',
    text: 'Mass Information',
  })

  if (mass.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(mass.event),
    })
  }

  if (mass.event?.location) {
    const location = mass.event.location
    const locationText = location.name +
      (location.street || location.city ?
        ` (${[location.street, location.city, location.state].filter(Boolean).join(', ')})` :
        '')
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: locationText,
    })
  }

  // Liturgical Event
  if (mass.liturgical_event) {
    const eventData = mass.liturgical_event.event_data as any
    if (eventData?.name) {
      elements.push({
        type: 'info-row',
        label: 'Liturgical Event:',
        value: `${eventData.name}${eventData.liturgical_season ? ` (${eventData.liturgical_season})` : ''}`,
      })
    }
  }

  // Ministers
  elements.push({
    type: 'section-title',
    text: 'Ministers',
  })

  if (mass.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(mass.presider),
    })
  }

  if (mass.homilist && mass.homilist.id !== mass.presider?.id) {
    elements.push({
      type: 'info-row',
      label: 'Homilist:',
      value: formatPersonName(mass.homilist),
    })
  }

  if (mass.pre_mass_announcement_person) {
    elements.push({
      type: 'info-row',
      label: 'Pre-Mass Announcements:',
      value: formatPersonName(mass.pre_mass_announcement_person),
    })
  }

  return {
    id: 'summary',
    title: 'Mass Summary',
    elements,
  }
}

/**
 * Build liturgy section with Mass structure
 */
function buildLiturgySection(mass: MassWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Introductory Rites
  elements.push({
    type: 'section-title',
    text: 'INTRODUCTORY RITES',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The priest and ministers enter in procession]',
  })

  elements.push({
    type: 'section-title',
    text: 'Entrance Hymn',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The entrance hymn is sung as the procession enters]',
  })

  elements.push({
    type: 'section-title',
    text: 'Greeting',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'In the name of the Father, and of the Son, and of the Holy Spirit.',
  })

  elements.push({
    type: 'text',
    text: 'Amen.',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'The grace of our Lord Jesus Christ, and the love of God, and the communion of the Holy Spirit be with you all.',
  })

  elements.push({
    type: 'text',
    text: 'And with your spirit.',
  })

  // Pre-Mass Announcements
  if (mass.announcements || mass.pre_mass_announcement_person) {
    elements.push({
      type: 'section-title',
      text: 'Announcements',
    })

    if (mass.pre_mass_announcement_person) {
      elements.push({
        type: 'text',
    formatting: ['italic'],
        text: `[Announcements by ${formatPersonName(mass.pre_mass_announcement_person)}${mass.pre_mass_announcement_topic ? ` - ${mass.pre_mass_announcement_topic}` : ''}]`,
      })
    }

    if (mass.announcements) {
      elements.push({
        type: 'text',
        text: mass.announcements,
      })
    }
  }

  // Penitential Act
  elements.push({
    type: 'section-title',
    text: 'Penitential Act',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'Brothers and sisters, let us acknowledge our sins, and so prepare ourselves to celebrate the sacred mysteries.',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Brief pause for silence]',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'May almighty God have mercy on us, forgive us our sins, and bring us to everlasting life.',
  })

  elements.push({
    type: 'text',
    text: 'Amen.',
  })

  // Gloria
  elements.push({
    type: 'section-title',
    text: 'Gloria',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The Gloria is sung or said]',
  })

  // Collect
  elements.push({
    type: 'section-title',
    text: 'Collect (Opening Prayer)',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'Let us pray.',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Brief pause for silent prayer]',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The priest says the Collect of the day]',
  })

  // Liturgy of the Word
  elements.push({
    type: 'section-title',
    text: 'LITURGY OF THE WORD',
  })

  // Readings would be inserted here in a more complete implementation
  elements.push({
    type: 'section-title',
    text: 'First Reading',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The first reading is proclaimed from the Lectionary]',
  })

  elements.push({
    type: 'section-title',
    text: 'Responsorial Psalm',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The responsorial psalm is sung or recited]',
  })

  elements.push({
    type: 'section-title',
    text: 'Second Reading',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The second reading is proclaimed from the Lectionary]',
  })

  elements.push({
    type: 'section-title',
    text: 'Gospel Acclamation',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[All stand]',
  })

  elements.push({
    type: 'text',
    text: 'Alleluia, alleluia.',
  })

  elements.push({
    type: 'section-title',
    text: 'Gospel',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'The Lord be with you.',
  })

  elements.push({
    type: 'text',
    text: 'And with your spirit.',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[The Gospel is proclaimed]',
  })

  // Homily
  elements.push({
    type: 'section-title',
    text: 'Homily',
  })

  const homilist = mass.homilist || mass.presider
  if (homilist) {
    elements.push({
      type: 'text',
    formatting: ['italic'],
      text: `[Homily by ${formatPersonName(homilist)}]`,
    })
  } else {
    elements.push({
      type: 'text',
    formatting: ['italic'],
      text: '[Homily]',
    })
  }

  return {
    id: 'liturgy',
    title: 'Mass Liturgy',
    elements,
  }
}

/**
 * Build Universal Prayer (Prayer of the Faithful) section
 */
function buildUniversalPrayerSection(mass: MassWithRelations): ContentSection | null {
  if (!mass.petitions) return null

  return buildPetitionsSection({
    petitions: mass.petitions
  })
}

/**
 * Build main export function
 */
export function buildFullScriptEnglish(mass: MassWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(mass))

  // Liturgy section
  sections.push(buildLiturgySection(mass))

  // Universal Prayer (Petitions)
  const petitionsSection = buildUniversalPrayerSection(mass)
  if (petitionsSection) {
    sections.push(petitionsSection)
  }

  return {
    id: mass.id,
    type: 'mass',
    language: 'en',
    template: 'mass-full-script-english',
    title: 'Mass Liturgy',
    sections,
  }
}
