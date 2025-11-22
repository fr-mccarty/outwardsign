import { getMassWithRelations } from '@/lib/actions/masses'
import { buildMassLiturgy } from '@/lib/content-builders/mass'
import { getMassFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Mass',
  fetchEntity: getMassWithRelations,
  buildContent: buildMassLiturgy,
  getFilename: (mass) => getMassFilename(mass, 'pdf'),
  defaultTemplate: 'mass-english',
  templateIdField: 'mass_template_id'
})
