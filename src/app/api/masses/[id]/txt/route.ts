import { getMassWithRelations } from '@/lib/actions/masses'
import { buildMassLiturgy } from '@/lib/content-builders/mass'
import { getMassFilename } from '@/lib/utils/formatters'
import { createTextRoute } from '@/lib/api/document-routes'

export const GET = createTextRoute({
  entityName: 'Mass',
  fetchEntity: getMassWithRelations,
  buildContent: buildMassLiturgy,
  getFilename: (mass) => getMassFilename(mass, 'txt'),
  defaultTemplate: 'mass-english',
  templateIdField: 'mass_template_id'
})
