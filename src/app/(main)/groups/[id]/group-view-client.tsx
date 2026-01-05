"use client"

import { deleteGroup } from '@/lib/actions/groups'
import type { GroupWithMembers } from '@/lib/actions/groups'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildGroupMembersReport } from '@/lib/content-builders/group'
import { LinkButton } from '@/components/link-button'
import { Edit, Printer, FileText, FileDown, File } from 'lucide-react'
import { getGroupFilename } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'

interface GroupViewClientProps {
  group: GroupWithMembers
}

export function GroupViewClient({ group }: GroupViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return getGroupFilename(group, extension)
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <LinkButton href={`/groups/${group.id}/edit`} className="w-full">
        <Edit className="h-4 w-4 mr-2" />
        Edit Group
      </LinkButton>
      <LinkButton href={`/print/groups/${group.id}`} variant="outline" className="w-full" target="_blank">
        <Printer className="h-4 w-4 mr-2" />
        Print View
      </LinkButton>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <LinkButton href={`/api/groups/${group.id}/pdf?filename=${generateFilename('pdf')}`} variant="default" className="w-full" target="_blank">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </LinkButton>
      <LinkButton href={`/api/groups/${group.id}/word?filename=${generateFilename('docx')}`} variant="default" className="w-full">
        <FileDown className="h-4 w-4 mr-2" />
        Download Word
      </LinkButton>
      <LinkButton href={`/api/groups/${group.id}/txt?filename=${generateFilename('txt')}`} variant="default" className="w-full">
        <File className="h-4 w-4 mr-2" />
        Download Text
      </LinkButton>
    </>
  )

  // Generate details section content
  const details = (
    <>
      {group.description && (
        <div>
          <span className="font-medium">Description:</span>
          <div className="text-sm text-muted-foreground mt-1">{group.description}</div>
        </div>
      )}

      <div className={group.description ? "pt-2 border-t" : ""}>
        <span className="font-medium">Status:</span>{' '}
        {group.is_active ? (
          <Badge variant="default" className="ml-2">Active</Badge>
        ) : (
          <Badge variant="secondary" className="ml-2">Inactive</Badge>
        )}
      </div>
    </>
  )

  return (
    <ModuleViewContainer
      entity={group}
      entityType="Group"
      modulePath="groups"
      generateFilename={generateFilename}
      buildLiturgy={buildGroupMembersReport}
      getTemplateId={() => 'group-members-report'}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      details={details}
      onDelete={deleteGroup}
    />
  )
}
