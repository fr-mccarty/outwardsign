/**
 * Group Baptism Content Builders
 *
 * Template registry and main export for group baptism liturgy content builders
 */

import { GroupBaptismWithRelations } from '@/lib/actions/group-baptisms'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildSummaryEnglish } from './templates/summary-english'
import { buildSummarySpanish } from './templates/summary-spanish'

/**
 * Template Registry
 * Templates for group baptism summaries
 */
export const GROUP_BAPTISM_TEMPLATES: Record<string, LiturgyTemplate<GroupBaptismWithRelations>> = {
  'group-baptism-summary-english': {
    id: 'group-baptism-summary-english',
    name: 'Group Baptism Summary (English)',
    description: 'Simple list of all baptisms in the group with child, parent, and godparent information',
    supportedLanguages: ['en'],
    builder: buildSummaryEnglish,
  },
  'group-baptism-summary-spanish': {
    id: 'group-baptism-summary-spanish',
    name: 'Resumen de Bautismo Grupal (Español)',
    description: 'Lista simple de todos los bautismos del grupo con información de niños, padres y padrinos',
    supportedLanguages: ['es'],
    builder: buildSummarySpanish,
  },
}

/**
 * Main export: Build group baptism liturgy content
 */
export function buildGroupBaptismLiturgy(
  groupBaptism: GroupBaptismWithRelations,
  templateId: string = 'group-baptism-summary-english'
): LiturgyDocument {
  const template = GROUP_BAPTISM_TEMPLATES[templateId] || GROUP_BAPTISM_TEMPLATES['group-baptism-summary-english']
  return template.builder(groupBaptism)
}
