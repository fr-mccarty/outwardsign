import { getPresentationWithRelations } from '@/lib/actions/presentations'
import { buildPresentationLiturgy } from '@/lib/content-builders/presentation'
import { getPresentationFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Presentation',
  fetchEntity: getPresentationWithRelations,
  buildContent: buildPresentationLiturgy,
  getFilename: (presentation) => getPresentationFilename(presentation, 'pdf'),
  defaultTemplate: 'presentation-spanish',
  templateIdField: 'presentation_template_id'
})
