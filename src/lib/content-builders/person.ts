/**
 * Person Content Builder
 *
 * Creates contact card documents for person records
 */

import type { Person } from '@/lib/types'
import type { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonName, formatDate } from '@/lib/utils/formatters'
import { buildCoverPage, type CoverPageSection } from '@/lib/content-builders/shared/builders'

/**
 * Build person contact card document
 *
 * Creates a simple contact card with person information
 */
export function buildPersonContactCard(person: Person): LiturgyDocument {
  const sections: ContentSection[] = []

  // 1. COVER PAGE
  const coverSections: CoverPageSection[] = []

  // Contact Information subsection
  const contactRows = []

  if (person.email) {
    contactRows.push({ label: 'Email:', value: person.email })
  }

  if (person.phone_number) {
    contactRows.push({ label: 'Phone:', value: person.phone_number })
  }

  if (person.street || person.city || person.state || person.zipcode) {
    const addressParts = []
    if (person.street) addressParts.push(person.street)
    const cityStateZip = [person.city, person.state, person.zipcode].filter(Boolean).join(', ')
    if (cityStateZip) addressParts.push(cityStateZip)

    contactRows.push({ label: 'Address:', value: addressParts.join(', ') })
  }

  if (contactRows.length > 0) {
    coverSections.push({ title: 'Contact Information', rows: contactRows })
  }

  // Additional Information subsection
  const infoRows = []

  if (person.sex) {
    infoRows.push({ label: 'Gender:', value: person.sex })
  }

  if (person.note) {
    infoRows.push({ label: 'Notes:', value: person.note })
  }

  infoRows.push({ label: 'Created:', value: formatDate(person.created_at, 'en') })
  infoRows.push({ label: 'Last Updated:', value: formatDate(person.updated_at, 'en') })

  coverSections.push({ title: 'Information', rows: infoRows })

  sections.push(buildCoverPage(coverSections))

  const personName = formatPersonName(person) || 'Contact Card'

  return {
    id: person.id,
    type: 'event', // Using 'event' as the closest match for a generic document type
    language: 'en',
    template: 'person-contact-card',
    title: personName,
    subtitle: 'Contact Information',
    sections,
  }
}
