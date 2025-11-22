import { getFuneralWithRelations } from '@/lib/actions/funerals'
import { buildFuneralLiturgy } from '@/lib/content-builders/funeral'
import { getFuneralFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Funeral',
  fetchEntity: getFuneralWithRelations,
  buildContent: buildFuneralLiturgy,
  getFilename: (funeral) => getFuneralFilename(funeral, 'pdf'),
  defaultTemplate: 'funeral-full-script-english',
  templateIdField: 'funeral_template_id'
})
