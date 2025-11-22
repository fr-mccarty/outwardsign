import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { buildMassIntentionLiturgy } from '@/lib/content-builders/mass-intention'
import { getMassIntentionFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Mass Intention',
  fetchEntity: getMassIntentionWithRelations,
  buildContent: buildMassIntentionLiturgy,
  getFilename: (massIntention) => getMassIntentionFilename(massIntention, 'pdf'),
  defaultTemplate: 'mass-intention-summary-english',
  templateIdField: 'mass_intention_template_id'
})
