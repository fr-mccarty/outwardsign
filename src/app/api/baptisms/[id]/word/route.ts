import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import { buildBaptismLiturgy } from '@/lib/content-builders/baptism'
import { getBaptismFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Baptism',
  fetchEntity: getBaptismWithRelations,
  buildContent: buildBaptismLiturgy,
  getFilename: (baptism) => getBaptismFilename(baptism, 'docx'),
  defaultTemplate: 'baptism-summary-english',
  templateIdField: 'baptism_template_id'
})
