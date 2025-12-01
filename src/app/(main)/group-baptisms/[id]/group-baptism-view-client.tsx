"use client"

import { GroupBaptismWithRelations, updateGroupBaptism, deleteGroupBaptism } from '@/lib/actions/group-baptisms'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download, Users } from 'lucide-react'
import Link from 'next/link'
import { GROUP_BAPTISM_TEMPLATES, buildGroupBaptismLiturgy } from '@/lib/content-builders/group-baptism'
import { PersonAvatarGroup } from '@/components/person-avatar-group'
import { useEnrichedEntityWithAvatars } from '@/hooks/use-enriched-entity-with-avatars'
import { useCallback } from 'react'

interface GroupBaptismViewClientProps {
  groupBaptism: GroupBaptismWithRelations
}

export function GroupBaptismViewClient({ groupBaptism }: GroupBaptismViewClientProps) {
  // Extract people (children) from entity
  const getPeople = useCallback(
    (gb: GroupBaptismWithRelations) =>
      gb.baptisms?.filter(b => b.child).map(b => b.child!) || [],
    []
  )

  // Enrich entity with signed avatar URLs
  const enrichEntity = useCallback(
    (gb: GroupBaptismWithRelations, avatarUrls: Record<string, string>) => ({
      ...gb,
      baptisms: gb.baptisms?.map(baptism => ({
        ...baptism,
        child: baptism.child ? {
          ...baptism.child,
          avatar_url: baptism.child.id && avatarUrls[baptism.child.id]
            ? avatarUrls[baptism.child.id]
            : baptism.child.avatar_url
        } : baptism.child
      }))
    }),
    []
  )

  // Get entity enriched with signed avatar URLs
  const enrichedGroupBaptism = useEnrichedEntityWithAvatars(
    groupBaptism,
    getPeople,
    enrichEntity
  )

  // Use centralized content builder with signed avatar URLs
  const buildLiturgy = (entity: GroupBaptismWithRelations) => {
    const templateId = entity.group_baptism_template_id || 'group-baptism-summary-english'
    return buildGroupBaptismLiturgy(enrichedGroupBaptism, templateId)
  }

  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const name = groupBaptism.name.replace(/[^a-zA-Z0-9]/g, '-')
    const date = groupBaptism.group_baptism_event?.start_date || 'no-date'
    return `${name}-${date}-group-baptism.${extension}`
  }

  // Extract template ID from group baptism record
  const getTemplateId = (gb: GroupBaptismWithRelations) => {
    return gb.group_baptism_template_id || 'group-baptism-summary-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateGroupBaptism(groupBaptism.id, {
      group_baptism_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/group-baptisms/${groupBaptism.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Group Baptism
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/group-baptisms/${groupBaptism.id}`} target="_blank">
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
        <Link href={`/api/group-baptisms/${groupBaptism.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/group-baptisms/${groupBaptism.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector using centralized templates
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={groupBaptism.group_baptism_template_id}
      templates={GROUP_BAPTISM_TEMPLATES}
      moduleName="Group Baptism"
      onSave={handleUpdateTemplate}
      defaultTemplateId="group-baptism-summary-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {groupBaptism.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={groupBaptism.status} statusType="module" />
        </div>
      )}

      {groupBaptism.group_baptism_event?.location && (
        <div className={groupBaptism.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {groupBaptism.group_baptism_event.location.name}
          {(groupBaptism.group_baptism_event.location.street || groupBaptism.group_baptism_event.location.city || groupBaptism.group_baptism_event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[groupBaptism.group_baptism_event.location.street, groupBaptism.group_baptism_event.location.city, groupBaptism.group_baptism_event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}

      {groupBaptism.presider && (
        <div className="pt-2 border-t">
          <span className="font-medium">Presider:</span> {groupBaptism.presider.full_name}
        </div>
      )}

      <div className="pt-2 border-t">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{groupBaptism.baptisms?.length || 0} Baptisms</span>
        </div>
        {groupBaptism.baptisms && groupBaptism.baptisms.length > 0 && (
          <div className="mt-2">
            <PersonAvatarGroup
              people={groupBaptism.baptisms
                .filter(baptism => baptism.child)
                .map(baptism => ({
                  id: baptism.child!.id,
                  first_name: baptism.child!.first_name || '',
                  last_name: baptism.child!.last_name || '',
                  full_name: baptism.child!.full_name,
                  avatar_url: baptism.child!.avatar_url
                }))}
              type="group"
              maxDisplay={10}
              size="md"
            />
          </div>
        )}
      </div>

      {groupBaptism.note && (
        <div className="pt-2 border-t">
          <span className="font-medium">Notes:</span>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{groupBaptism.note}</p>
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={groupBaptism}
      entityType="Group Baptism"
      modulePath="group-baptisms"
      mainEvent={groupBaptism.group_baptism_event}
      buildLiturgy={buildLiturgy}
      getTemplateId={getTemplateId}
      generateFilename={generateFilename}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteGroupBaptism}
    />
  )
}
