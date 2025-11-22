import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import { buildBaptismLiturgy } from '@/lib/content-builders/baptism'
import { getBaptismFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Baptism',
  fetchEntity: getBaptismWithRelations,
  buildContent: buildBaptismLiturgy,
  getFilename: (baptism) => getBaptismFilename(baptism, 'pdf'),
  defaultTemplate: 'baptism-summary-english',
  templateIdField: 'baptism_template_id'
})
