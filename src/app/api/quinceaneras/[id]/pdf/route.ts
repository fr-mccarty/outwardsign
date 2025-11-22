import { getQuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { buildQuinceaneraLiturgy } from '@/lib/content-builders/quinceanera'
import { getQuinceaneraFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Quinceañera',
  fetchEntity: getQuinceaneraWithRelations,
  buildContent: buildQuinceaneraLiturgy,
  getFilename: (quinceanera) => getQuinceaneraFilename(quinceanera, 'pdf'),
  defaultTemplate: 'quinceanera-full-script-english',
  templateIdField: 'quinceanera_template_id'
})
