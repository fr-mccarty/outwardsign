"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from 'next-intl'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { FormDialog } from "@/components/form-dialog"
import { createGroup, updateGroup, type GroupWithMembers, type GroupMember, addGroupMember, removeGroupMember } from "@/lib/actions/groups"
import { getGroupRoles, type GroupRole } from "@/lib/actions/group-roles"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PersonPickerField } from "@/components/person-picker-field"
import { ListCard, CardListItem } from "@/components/list-card"
import { Badge } from "@/components/ui/badge"
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

// Zod validation schema
const groupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

type GroupFormValues = z.infer<typeof groupSchema>

interface GroupFormProps {
  group?: GroupWithMembers
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function GroupForm({ group, formId, onLoadingChange }: GroupFormProps) {
  const router = useRouter()
  const t = useTranslations()
  const isEditing = !!group
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // React Hook Form setup
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
      is_active: group?.is_active ?? true,
    },
  })

  // Member management state
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [showPersonPicker, setShowPersonPicker] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedGroupRoleId, setSelectedGroupRoleId] = useState<string>('none')
  const [isAddingMember, setIsAddingMember] = useState(false)

  // Local state for members (optimistic updates)
  const [members, setMembers] = useState<GroupMember[]>(group?.members || [])
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])

  // Load group roles in edit mode
  useEffect(() => {
    if (isEditing) {
      getGroupRoles().then(setGroupRoles).catch(error => {
        console.error('Failed to load group roles:', error)
        toast.error(t('groups.errorLoadingRoles'))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  const onSubmit = async (data: GroupFormValues) => {
    setIsLoading(true)

    try {
      const groupData = {
        name: data.name,
        description: data.description || undefined,
        is_active: data.is_active,
      }

      if (isEditing && group) {
        await updateGroup(group.id, groupData)
        toast.success(t('groups.groupUpdated'))
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newGroup = await createGroup(groupData)
        toast.success(t('groups.groupCreated'))
        router.push(`/groups/${newGroup.id}/edit`) // Go to edit page
      }
    } catch (error) {
      console.error('Error saving group:', error)
      toast.error(isEditing ? t('groups.errorUpdating') : t('groups.errorCreating'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedPerson || !group) return

    // Check if person already a member
    if (members.some(m => m.person_id === selectedPerson.id)) {
      toast.error(t('groups.personAlreadyMember'))
      return
    }

    try {
      setIsAddingMember(true)

      const newMember = await addGroupMember(
        group.id,
        selectedPerson.id,
        selectedGroupRoleId === 'none' ? undefined : selectedGroupRoleId
      )

      // Find the group role if one was selected
      const groupRole = selectedGroupRoleId !== 'none'
        ? groupRoles.find(r => r.id === selectedGroupRoleId)
        : null

      // Optimistically add to local state
      setMembers(prev => [...prev, {
        id: newMember.id,
        group_id: group.id,
        person_id: selectedPerson.id,
        group_role_id: selectedGroupRoleId === 'none' ? null : selectedGroupRoleId,
        joined_at: new Date().toISOString(),
        person: {
          id: selectedPerson.id,
          first_name: selectedPerson.first_name,
          last_name: selectedPerson.last_name,
          full_name: selectedPerson.full_name,
          email: selectedPerson.email || undefined
        },
        group_role: groupRole ? {
          id: groupRole.id,
          name: groupRole.name,
          description: groupRole.description || undefined
        } : undefined
      }])

      toast.success(t('groups.memberAdded'))

      // Reset and close
      setSelectedPerson(null)
      setSelectedGroupRoleId('none')
      setAddMemberDialogOpen(false)
    } catch (error) {
      toast.error(t('groups.errorAddingMember'))
      console.error(error)
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleCancelAddMember = () => {
    setSelectedPerson(null)
    setSelectedGroupRoleId('none')
    setAddMemberDialogOpen(false)
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!group) return

    try {
      const memberToDelete = members.find(m => m.id === memberId)
      if (!memberToDelete) return

      await removeGroupMember(group.id, memberToDelete.person_id)

      // Optimistically remove from local state
      setMembers(prev => prev.filter(m => m.id !== memberId))

      toast.success(t('groups.memberRemoved'))
    } catch (error) {
      toast.error(t('groups.errorRemovingMember'))
      console.error(error)
      throw error
    }
  }

  return (
    <>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
        {/* Group Information */}
        <FormSectionCard
          title={t('groups.groupInformation')}
          description={t('groups.groupInformationDescription')}
        >
          <FormInput
            id="name"
            label={t('groups.name')}
            value={form.watch('name')}
            onChange={(value) => form.setValue('name', value)}
            placeholder={t('groups.namePlaceholder')}
            required
            error={form.formState.errors.name?.message}
          />

          <FormInput
            id="description"
            inputType="textarea"
            label={t('groups.description')}
            value={form.watch('description') || ''}
            onChange={(value) => form.setValue('description', value)}
            placeholder={t('groups.descriptionPlaceholder')}
            rows={3}
            error={form.formState.errors.description?.message}
          />

          <FormInput
            id="is_active"
            inputType="checkbox"
            label={t('groups.isActive')}
            description={t('groups.isActiveDescription')}
            value={form.watch('is_active') ?? true}
            onChange={(value: boolean) => form.setValue('is_active', value)}
            error={form.formState.errors.is_active?.message}
          />
        </FormSectionCard>

        {/* Member Management (Edit Mode Only) */}
        {isEditing && (
          <ListCard
            title={t('groups.manageMembers')}
            description={t('groups.membersCount', { count: members.length })}
            items={members}
            getItemId={(member) => member.id}
            onAdd={() => setAddMemberDialogOpen(true)}
            addButtonLabel={t('groups.addMember')}
            emptyMessage={t('groups.noMembersYet')}
            renderItem={(member) => (
              <CardListItem
                id={member.id}
                onDelete={() => handleDeleteMember(member.id)}
                deleteConfirmTitle={t('groups.removeMember')}
                deleteConfirmDescription={t('groups.confirmRemoveMember', { personName: member.person?.full_name || '' })}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{member.person?.full_name}</span>
                      {member.group_role && (
                        <Badge variant="secondary">{member.group_role.name}</Badge>
                      )}
                    </div>
                    {member.person?.email && (
                      <p className="text-sm text-muted-foreground truncate">
                        {member.person.email}
                      </p>
                    )}
                  </div>
                </div>
              </CardListItem>
            )}
          />
        )}

        {/* Form Actions */}
        <FormBottomActions
          isEditing={isEditing}
          isLoading={isLoading}
          cancelHref={isEditing && group ? `/groups/${group.id}` : '/groups'}
          moduleName={t('groups.title')}
        />
      </form>

      {/* Add Member Dialog */}
      {isEditing && (
        <FormDialog
          open={addMemberDialogOpen}
          onOpenChange={(open) => {
            if (!open) handleCancelAddMember()
            else setAddMemberDialogOpen(open)
          }}
          title={t('groups.addMemberTo', { groupName: group?.name })}
          description={t('groups.addMemberDescription')}
          onSubmit={handleAddMember}
          isLoading={isAddingMember}
          submitLabel={t('groups.addMember')}
          loadingLabel={t('groups.adding')}
          submitDisabled={!selectedPerson}
        >
          <div className="space-y-4 py-4">
            <PersonPickerField
              label={t('groups.person')}
              value={selectedPerson}
              onValueChange={setSelectedPerson}
              showPicker={showPersonPicker}
              onShowPickerChange={setShowPersonPicker}
              placeholder={t('groups.personPlaceholder')}
              required
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />

            <FormInput
              id="group_role"
              label={t('groups.groupRole')}
              inputType="select"
              value={selectedGroupRoleId}
              onChange={setSelectedGroupRoleId}
              placeholder={t('groups.groupRolePlaceholder')}
              options={[
                { value: 'none', label: t('groups.noRole') },
                ...groupRoles.map((role) => ({
                  value: role.id,
                  label: role.name,
                })),
              ]}
            />
          </div>
        </FormDialog>
      )}

    </>
  )
}
