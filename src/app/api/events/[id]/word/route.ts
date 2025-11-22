import { getEventWithRelations } from '@/lib/actions/events'
import { buildEventLiturgy } from '@/lib/content-builders/event'
import { getEventFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Event',
  fetchEntity: getEventWithRelations,
  buildContent: buildEventLiturgy,
  getFilename: (event) => getEventFilename(event, 'docx'),
  defaultTemplate: 'event-full-script-english',
  templateIdField: 'event_template_id'
})
