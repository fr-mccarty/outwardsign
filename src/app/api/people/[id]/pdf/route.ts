import { getPerson } from '@/lib/actions/people'
import { buildPersonContactCard } from '@/lib/content-builders/person'
import { getPersonFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Person',
  fetchEntity: getPerson,
  buildContent: buildPersonContactCard,
  getFilename: (person) => getPersonFilename(person, 'pdf')
})
