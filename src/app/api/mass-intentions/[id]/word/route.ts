import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { buildMassIntentionLiturgy } from '@/lib/content-builders/mass-intention'
import { getMassIntentionFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Mass Intention',
  fetchEntity: getMassIntentionWithRelations,
  buildContent: buildMassIntentionLiturgy,
  getFilename: (massIntention) => getMassIntentionFilename(massIntention, 'docx'),
  defaultTemplate: 'mass-intention-summary-english',
  templateIdField: 'mass_intention_template_id'
})
