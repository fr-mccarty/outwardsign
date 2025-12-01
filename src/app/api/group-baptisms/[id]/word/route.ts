import { getGroupBaptismWithRelations } from '@/lib/actions/group-baptisms'
import { buildGroupBaptismLiturgy } from '@/lib/content-builders/group-baptism'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Group Baptism',
  fetchEntity: getGroupBaptismWithRelations,
  buildContent: buildGroupBaptismLiturgy,
  getFilename: (groupBaptism) => {
    const name = groupBaptism.name.replace(/[^a-zA-Z0-9]/g, '-')
    const date = groupBaptism.group_baptism_event?.start_date || 'no-date'
    return `${name}-${date}-group-baptism.docx`
  },
  defaultTemplate: 'group-baptism-summary-english',
  templateIdField: 'group_baptism_template_id'
})
