/**
 * Group Content Builder
 *
 * Creates member reports for group records
 */

import type { GroupWithMembers } from '@/lib/actions/groups'
import type { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { buildCoverPage, type CoverPageSection } from '@/lib/content-builders/shared/builders'

/**
 * Build group members report document
 *
 * Creates a report listing all members of a group with their roles
 */
export function buildGroupMembersReport(group: GroupWithMembers): LiturgyDocument {
  const sections: ContentSection[] = []

  // 1. COVER PAGE
  const coverSections: CoverPageSection[] = []

  // Group Details subsection
  const detailsRows = []

  if (group.description) {
    detailsRows.push({ label: 'Description:', value: group.description })
  }

  detailsRows.push({ label: 'Status:', value: group.is_active ? 'Active' : 'Inactive' })
  detailsRows.push({ label: 'Total Members:', value: group.members.length.toString() })

  coverSections.push({ title: 'Group Information', rows: detailsRows })

  // Members List subsection
  if (group.members.length > 0) {
    const memberRows = group.members.map(member => {
      const personName = member.person?.full_name || 'Unknown Person'
      const role = member.group_role ? member.group_role.name : 'No role assigned'
      return { label: personName, value: role }
    })

    coverSections.push({ title: 'Members', rows: memberRows })
  } else {
    coverSections.push({
      title: 'Members',
      rows: [{ label: 'No members', value: 'This group has no members yet.' }]
    })
  }

  sections.push(buildCoverPage(coverSections))

  return {
    id: group.id,
    type: 'event', // Using 'event' as the closest match for a generic document type
    language: 'en',
    template: 'group-members-report',
    title: group.name,
    subtitle: 'Member Directory',
    sections,
  }
}
