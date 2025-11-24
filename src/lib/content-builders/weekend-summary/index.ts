/**
 * Weekend Summary Content Builder
 *
 * Dynamically generates a summary document of all weekend activities
 */

import { WeekendSummaryData, WeekendSummaryParams } from '@/lib/actions/weekend-summary'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildSummaryEnglish } from './templates/summary-english'
import { buildSummarySpanish } from './templates/summary-spanish'

/**
 * Template Registry
 */
export const WEEKEND_SUMMARY_TEMPLATES: Record<string, LiturgyTemplate<{ data: WeekendSummaryData; params: WeekendSummaryParams }>> = {
  'weekend-summary-english': {
    id: 'weekend-summary-english',
    name: 'Weekend Summary (English)',
    description: 'Comprehensive weekend activities summary in English',
    supportedLanguages: ['en'],
    builder: ({ data, params }) => buildSummaryEnglish(data, params),
  },
  'weekend-summary-spanish': {
    id: 'weekend-summary-spanish',
    name: 'Resumen del Fin de Semana (Español)',
    description: 'Resumen completo de actividades del fin de semana en español',
    supportedLanguages: ['es'],
    builder: ({ data, params }) => buildSummarySpanish(data, params),
  },
}

/**
 * Build weekend summary document
 *
 * @param data - Weekend summary data
 * @param params - Weekend summary parameters
 * @param templateId - Template ID (defaults to English)
 */
export function buildWeekendSummary(
  data: WeekendSummaryData,
  params: WeekendSummaryParams,
  templateId: string = 'weekend-summary-english'
): LiturgyDocument {
  const template = WEEKEND_SUMMARY_TEMPLATES[templateId] || WEEKEND_SUMMARY_TEMPLATES['weekend-summary-english']
  return template.builder({ data, params })
}

// Legacy function (keeping for backwards compatibility during migration)
function buildWeekendSummaryLegacy(
  data: WeekendSummaryData,
  params: WeekendSummaryParams
): LiturgyDocument {
  const sections: ContentSection[] = []

  // Cover Page
  const coverSections: CoverPageSection[] = [
    {
      title: 'Weekend Dates',
      rows: [
        { label: 'Saturday', value: formatDatePretty(data.saturdayDate) },
        { label: 'Sunday', value: formatDatePretty(data.sundayDate) },
      ],
    },
  ]

  sections.push(
    buildCoverPage(
      'Weekend Summary',
      `${formatDatePretty(data.saturdayDate)} - ${formatDatePretty(data.sundayDate)}`,
      coverSections
    )
  )

  // Sacraments Section
  if (params.includeSacraments) {
    const sacramentElements: ContentElement[] = []

    // Weddings
    if (data.weddings.length > 0) {
      sacramentElements.push({
        type: 'section-title',
        text: 'Weddings',
      })
      data.weddings.forEach(wedding => {
        const bride = wedding.bride?.first_name && wedding.bride?.last_name
          ? `${wedding.bride.first_name} ${wedding.bride.last_name}`
          : 'Unknown'
        const groom = wedding.groom?.first_name && wedding.groom?.last_name
          ? `${wedding.groom.first_name} ${wedding.groom.last_name}`
          : 'Unknown'
        const date = wedding.wedding_event?.start_date ? formatDatePretty(wedding.wedding_event.start_date) : ''
        const time = wedding.wedding_event?.start_time ? formatTime(wedding.wedding_event.start_time) : ''
        const location = wedding.wedding_event?.location?.name || ''

        sacramentElements.push({
          type: 'text',
          text: `${bride} & ${groom} - ${date} ${time} - ${location}`,
        })
      })
    }

    // Baptisms
    if (data.baptisms.length > 0) {
      sacramentElements.push({
        type: 'section-title',
        text: 'Baptisms',
      })
      data.baptisms.forEach(baptism => {
        const childName = baptism.child?.full_name || 'Unknown'
        const date = baptism.baptism_event?.start_date ? formatDatePretty(baptism.baptism_event.start_date) : ''
        const time = baptism.baptism_event?.start_time ? formatTime(baptism.baptism_event.start_time) : ''
        const location = baptism.baptism_event?.location?.name || ''

        sacramentElements.push({
          type: 'text',
          text: `${childName} - ${date} ${time} - ${location}`,
        })
      })
    }

    // Funerals
    if (data.funerals.length > 0) {
      sacramentElements.push({
        type: 'section-title',
        text: 'Funerals',
      })
      data.funerals.forEach(funeral => {
        const deceasedName = funeral.deceased?.full_name || 'Unknown'
        const date = funeral.funeral_event?.start_date ? formatDatePretty(funeral.funeral_event.start_date) : ''
        const time = funeral.funeral_event?.start_time ? formatTime(funeral.funeral_event.start_time) : ''
        const location = funeral.funeral_event?.location?.name || ''

        sacramentElements.push({
          type: 'text',
          text: `${deceasedName} - ${date} ${time} - ${location}`,
        })
      })
    }

    // Presentations
    if (data.presentations.length > 0) {
      sacramentElements.push({
        type: 'section-title',
        text: 'Presentations',
      })
      data.presentations.forEach(presentation => {
        const childName = presentation.child?.full_name || 'Unknown'
        const date = presentation.presentation_event?.start_date ? formatDatePretty(presentation.presentation_event.start_date) : ''
        const time = presentation.presentation_event?.start_time ? formatTime(presentation.presentation_event.start_time) : ''
        const location = presentation.presentation_event?.location?.name || ''

        sacramentElements.push({
          type: 'text',
          text: `${childName} - ${date} ${time} - ${location}`,
        })
      })
    }

    // Quinceañeras
    if (data.quinceaneras.length > 0) {
      sacramentElements.push({
        type: 'section-title',
        text: 'Quinceañeras',
      })
      data.quinceaneras.forEach(quince => {
        const quinceaneraName = quince.quinceanera?.full_name || 'Unknown'
        const date = quince.quinceanera_event?.start_date ? formatDatePretty(quince.quinceanera_event.start_date) : ''
        const time = quince.quinceanera_event?.start_time ? formatTime(quince.quinceanera_event.start_time) : ''
        const location = quince.quinceanera_event?.location?.name || ''

        sacramentElements.push({
          type: 'text',
          text: `${quinceaneraName} - ${date} ${time} - ${location}`,
        })
      })
    }

    if (sacramentElements.length > 0) {
      sections.push({
        id: 'sacraments',
        title: 'Sacraments',
        elements: sacramentElements,
      })
    }
  }

  // Masses Section
  if (params.includeMasses && data.masses.length > 0) {
    const massElements: ContentElement[] = []

    data.masses.forEach(mass => {
      const date = mass.event?.start_date ? formatDatePretty(mass.event.start_date) : ''
      const time = mass.event?.start_time ? formatTime(mass.event.start_time) : ''
      const location = mass.event?.location?.name || ''
      const presider = mass.presider?.full_name || 'TBD'
      const language = mass.event?.language || ''

      massElements.push({
        type: 'section-title',
        text: `${date} ${time} - ${location} ${language ? `(${language})` : ''}`,
      })
      massElements.push({
        type: 'text',
        text: `Presider: ${presider}`,
      })
    })

    sections.push({
      id: 'masses',
      title: 'Masses',
      elements: massElements,
    })
  }

  // Mass Roles Section
  if (params.includeMassRoles && data.massRoles.length > 0) {
    const massRoleElements: ContentElement[] = []

    data.massRoles.forEach(massRoleGroup => {
      if (massRoleGroup.roles.length > 0) {
        massRoleElements.push({
          type: 'section-title',
          text: massRoleGroup.massTitle,
        })

        massRoleGroup.roles.forEach(roleInstance => {
          const personName = roleInstance.person?.full_name || 'TBD'
          const roleName = roleInstance.mass_roles_template_item?.mass_role?.name || 'Unknown Role'

          massRoleElements.push({
            type: 'text',
            text: `${roleName}: ${personName}`,
          })
        })
      }
    })

    if (massRoleElements.length > 0) {
      sections.push({
        id: 'mass-roles',
        title: 'Mass Roles',
        elements: massRoleElements,
      })
    }
  }

  // Empty state
  if (sections.length === 1) { // Only cover page
    sections.push({
      id: 'empty',
      title: 'No Activities',
      elements: [
        {
          type: 'text',
          text: 'No activities scheduled for this weekend.',
        },
      ],
    })
  }

  return {
    id: `weekend-summary-${data.sundayDate}`,
    type: 'event', // Using 'event' as the closest type
    language: 'en',
    template: 'weekend-summary-default',
    title: 'Weekend Summary',
    subtitle: `${formatDatePretty(data.saturdayDate)} - ${formatDatePretty(data.sundayDate)}`,
    sections,
  }
}
