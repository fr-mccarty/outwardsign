/**
 * Group Baptism Summary (Spanish) Template
 *
 * Resumen simple de información del bautismo grupal mostrando todos los niños
 */

import { GroupBaptismWithRelations } from '@/lib/actions/group-baptisms'
import { LiturgyDocument, ContentElement } from '@/lib/types/liturgy-content'
import { formatDatePretty, formatTime, formatPersonWithPronunciation } from '@/lib/utils/formatters'

/**
 * Main builder function for group baptism summary template (Spanish)
 */
export function buildSummarySpanish(groupBaptism: GroupBaptismWithRelations): LiturgyDocument {
  const elements: ContentElement[] = []

  // Section title
  elements.push({
    type: 'section-title',
    text: 'Bautismos en Este Grupo'
  })

  // Add each baptism
  if (groupBaptism.baptisms && groupBaptism.baptisms.length > 0) {
    groupBaptism.baptisms.forEach((baptism, index) => {
      // Build complete value with child name, parents, and godparents
      const childName = baptism.child
        ? formatPersonWithPronunciation(baptism.child)
        : 'Niño no asignado'

      // Build value with line breaks - child name is bold and larger
      let valueLines = [`<span style="font-size: 1.1em; font-weight: 600;">${childName}</span>`]

      // Add parents
      if (baptism.mother || baptism.father) {
        const parents = [baptism.mother?.full_name, baptism.father?.full_name]
          .filter(Boolean)
          .join(' y ')
        valueLines.push(`Padres: ${parents}`)
      }

      // Add godparents
      if (baptism.sponsor_1 || baptism.sponsor_2) {
        const sponsors = [baptism.sponsor_1?.full_name, baptism.sponsor_2?.full_name]
          .filter(Boolean)
          .join(' y ')
        valueLines.push(`Padrinos: ${sponsors}`)
      }

      const fullValue = valueLines.join('\n')

      if (baptism.child?.avatar_url) {
        // Use info-row-with-avatar for children with avatars
        elements.push({
          type: 'info-row-with-avatar',
          label: `${index + 1}.`,
          value: fullValue,
          avatarUrl: baptism.child.avatar_url,
          avatarSize: 60
        })
      } else {
        // Use regular info-row for children without avatars
        elements.push({
          type: 'info-row',
          label: `${index + 1}.`,
          value: fullValue
        })
      }

      // Add spacing between baptisms
      if (index < groupBaptism.baptisms.length - 1) {
        elements.push({
          type: 'spacer',
          size: 'large'
        })
      }
    })
  } else {
    elements.push({
      type: 'text',
      text: 'Aún no se han agregado bautismos a este grupo.'
    })
  }

  // Build subtitle with date and time
  let subtitle = ''
  if (groupBaptism.group_baptism_event?.start_date) {
    subtitle = formatDatePretty(groupBaptism.group_baptism_event.start_date)
    if (groupBaptism.group_baptism_event.start_time) {
      subtitle += ` a las ${formatTime(groupBaptism.group_baptism_event.start_time)}`
    }
  }

  return {
    id: `group-baptism-summary-${groupBaptism.id}`,
    type: 'baptism',
    language: 'es',
    template: 'group-baptism-summary-spanish',
    title: groupBaptism.name || 'Bautismo Grupal',
    subtitle,
    sections: [
      {
        id: 'baptisms-list',
        title: 'Resumen de Bautismo Grupal',
        elements
      }
    ]
  }
}
