import { getGroup } from '@/lib/actions/groups'
import { buildGroupMembersReport } from '@/lib/content-builders/group'
import { getGroupFilename } from '@/lib/utils/formatters'
import { createTextRoute } from '@/lib/api/document-routes'

export const GET = createTextRoute({
  entityName: 'Group',
  fetchEntity: getGroup,
  buildContent: buildGroupMembersReport,
  getFilename: (group) => getGroupFilename(group, 'txt')
})
