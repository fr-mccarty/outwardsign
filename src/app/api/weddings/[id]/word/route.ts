import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'
import { getWeddingFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Wedding',
  fetchEntity: getWeddingWithRelations,
  buildContent: buildWeddingLiturgy,
  getFilename: (wedding) => getWeddingFilename(wedding, 'docx'),
  defaultTemplate: 'wedding-full-script-english',
  templateIdField: 'wedding_template_id'
})
