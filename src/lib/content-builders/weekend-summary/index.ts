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
