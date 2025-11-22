import { getQuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { buildQuinceaneraLiturgy } from '@/lib/content-builders/quinceanera'
import { getQuinceaneraFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Quinceañera',
  fetchEntity: getQuinceaneraWithRelations,
  buildContent: buildQuinceaneraLiturgy,
  getFilename: (quinceanera) => getQuinceaneraFilename(quinceanera, 'docx'),
  defaultTemplate: 'quinceanera-full-script-english',
  templateIdField: 'quinceanera_template_id'
})
