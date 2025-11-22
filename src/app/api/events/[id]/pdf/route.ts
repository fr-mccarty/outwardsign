import { getEventWithRelations } from '@/lib/actions/events'
import { buildEventLiturgy } from '@/lib/content-builders/event'
import { getEventFilename } from '@/lib/utils/formatters'
import { createPdfRoute } from '@/lib/api/document-routes'

export const GET = createPdfRoute({
  entityName: 'Event',
  fetchEntity: getEventWithRelations,
  buildContent: buildEventLiturgy,
  getFilename: (event) => getEventFilename(event, 'pdf'),
  defaultTemplate: 'event-full-script-english',
  templateIdField: 'event_template_id'
})
