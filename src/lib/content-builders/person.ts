/**
 * Person Content Builder
 *
 * Creates contact card documents for person records
 */

import type { Person } from '@/lib/types'
import type { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatDate } from '@/lib/utils/formatters'
import { buildCoverPage, type CoverPageSection } from '@/lib/content-builders/shared/builders'
import { getPersonAvatarSignedUrl } from '@/lib/actions/people'

/**
 * Build person contact card document
 *
 * Creates a simple contact card with person information
 * Async to support fetching signed URLs for avatar images
 */
export async function buildPersonContactCard(person: Person): Promise<LiturgyDocument> {
  const sections: ContentSection[] = []

  // 1. COVER PAGE
  const coverSections: CoverPageSection[] = []

  // Profile Photo section (if avatar exists)
  if (person.avatar_url) {
    try {
      const signedUrl = await getPersonAvatarSignedUrl(person.avatar_url)
      if (signedUrl) {
        // Add a section with the avatar image before other sections
        const photoElements: ContentElement[] = [
          {
            type: 'section-title',
            text: 'Profile Photo',
          },
          {
            type: 'image',
            url: signedUrl,
            alt: person.full_name || 'Profile Photo',
            width: 150,
            height: 150,
            alignment: 'center',
          },
          {
            type: 'spacer',
            size: 'medium',
          },
        ]
        sections.push({
          id: 'profile-photo',
          elements: photoElements,
        })
      }
    } catch (error) {
      // Silently skip if we can't get the signed URL
      console.error('Failed to get avatar signed URL for PDF:', error)
    }
  }

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

  const personName = person.full_name || 'Contact Card'

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
