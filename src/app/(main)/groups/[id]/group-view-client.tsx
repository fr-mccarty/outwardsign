"use client"

import { deleteGroup } from '@/lib/actions/groups'
import type { GroupWithMembers } from '@/lib/actions/groups'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildGroupMembersReport } from '@/lib/content-builders/group'
import { Button } from '@/components/ui/button'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
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
      <Button asChild className="w-full">
        <Link href={`/groups/${group.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Group
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/groups/${group.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/groups/${group.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/groups/${group.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
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
