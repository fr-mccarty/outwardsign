import { getPerson } from '@/lib/actions/people'
import { buildPersonContactCard } from '@/lib/content-builders/person'
import { getPersonFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Person',
  fetchEntity: getPerson,
  buildContent: buildPersonContactCard,
  getFilename: (person) => getPersonFilename(person, 'docx')
})
