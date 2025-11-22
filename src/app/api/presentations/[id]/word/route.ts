import { getPresentationWithRelations } from '@/lib/actions/presentations'
import { buildPresentationLiturgy } from '@/lib/content-builders/presentation'
import { getPresentationFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Presentation',
  fetchEntity: getPresentationWithRelations,
  buildContent: buildPresentationLiturgy,
  getFilename: (presentation) => getPresentationFilename(presentation, 'docx'),
  defaultTemplate: 'presentation-spanish',
  templateIdField: 'presentation_template_id'
})
