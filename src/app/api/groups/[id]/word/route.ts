import { getGroup } from '@/lib/actions/groups'
import { buildGroupMembersReport } from '@/lib/content-builders/group'
import { getGroupFilename } from '@/lib/utils/formatters'
import { createWordRoute } from '@/lib/api/document-routes'

export const GET = createWordRoute({
  entityName: 'Group',
  fetchEntity: getGroup,
  buildContent: buildGroupMembersReport,
  getFilename: (group) => getGroupFilename(group, 'docx')
})
