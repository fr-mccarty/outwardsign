'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, ArrowLeft, UserPlus, Trash2, Star, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/content-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { PeoplePicker } from '@/components/people-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  type FamilyWithMembers,
  type FamilyMember,
  deleteFamily,
  addFamilyMember,
  removeFamilyMember,
  updateFamilyMember,
  setPrimaryContact
} from '@/lib/actions/families'
import type { Person } from '@/lib/types'
import { toast } from 'sonner'

interface FamilyViewClientProps {
  family: FamilyWithMembers
}

export function FamilyViewClient({ family }: FamilyViewClientProps) {
  const router = useRouter()

  // State for add member dialog
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [peoplePickerOpen, setPeoplePickerOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [relationship, setRelationship] = useState('')
  const [isPrimaryContact, setIsPrimaryContact] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)

  // State for edit member dialog
  const [editMemberOpen, setEditMemberOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null)
  const [editRelationship, setEditRelationship] = useState('')
  const [editIsPrimary, setEditIsPrimary] = useState(false)
  const [isUpdatingMember, setIsUpdatingMember] = useState(false)

  // State for remove member confirmation
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null)

  const handleBackToList = () => {
    router.push('/families')
  }

  const handleEdit = () => {
    router.push(`/families/${family.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    await deleteFamily(id)
    toast.success('Family deleted successfully')
    router.push('/families')
  }

  // Add member handlers
  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person)
    setPeoplePickerOpen(false)
  }

  const handleAddMember = async () => {
    if (!selectedPerson) {
      toast.error('Please select a person')
      return
    }

    setIsAddingMember(true)
    try {
      await addFamilyMember(family.id, {
        person_id: selectedPerson.id,
        relationship: relationship || null,
        is_primary_contact: isPrimaryContact
      })
      toast.success(`${selectedPerson.full_name} added to family`)
      setAddMemberOpen(false)
      setSelectedPerson(null)
      setRelationship('')
      setIsPrimaryContact(false)
      router.refresh()
    } catch (error: any) {
      console.error('Failed to add family member:', error)
      toast.error(error.message || 'Failed to add family member')
    } finally {
      setIsAddingMember(false)
    }
  }

  // Edit member handlers
  const handleOpenEditMember = (member: FamilyMember) => {
    setMemberToEdit(member)
    setEditRelationship(member.relationship || '')
    setEditIsPrimary(member.is_primary_contact)
    setEditMemberOpen(true)
  }

  const handleUpdateMember = async () => {
    if (!memberToEdit) return

    setIsUpdatingMember(true)
    try {
      await updateFamilyMember(family.id, memberToEdit.person_id, {
        relationship: editRelationship || null,
        is_primary_contact: editIsPrimary
      })
      toast.success('Family member updated')
      setEditMemberOpen(false)
      setMemberToEdit(null)
      router.refresh()
    } catch (error: any) {
      console.error('Failed to update family member:', error)
      toast.error(error.message || 'Failed to update family member')
    } finally {
      setIsUpdatingMember(false)
    }
  }

  // Remove member handlers
  const handleOpenRemoveMember = (member: FamilyMember) => {
    setMemberToRemove(member)
    setRemoveMemberOpen(true)
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    try {
      await removeFamilyMember(family.id, memberToRemove.person_id)
      toast.success(`${memberToRemove.person?.full_name || 'Member'} removed from family`)
      setRemoveMemberOpen(false)
      setMemberToRemove(null)
      router.refresh()
    } catch (error: any) {
      console.error('Failed to remove family member:', error)
      toast.error(error.message || 'Failed to remove family member')
    }
  }

  // Set primary contact handler
  const handleSetPrimary = async (member: FamilyMember) => {
    try {
      await setPrimaryContact(family.id, member.person_id)
      toast.success(`${member.person?.full_name || 'Member'} set as primary contact`)
      router.refresh()
    } catch (error: any) {
      console.error('Failed to set primary contact:', error)
      toast.error(error.message || 'Failed to set primary contact')
    }
  }

  const getInitials = (member: FamilyMember) => {
    if (!member.person) return '??'
    const first = member.person.first_name?.charAt(0) || ''
    const last = member.person.last_name?.charAt(0) || ''
    return (first + last).toUpperCase()
  }

  // Action buttons for sidebar
  const actionButtons = (
    <div className="space-y-2">
      <Button onClick={handleEdit} variant="outline" className="w-full">
        <Pencil className="h-4 w-4 mr-2" />
        Edit Family
      </Button>
      <Button onClick={handleBackToList} variant="outline" className="w-full">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Families
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main content */}
      <div className="flex-1 order-2 md:order-1 space-y-6">
        {/* Family Members Card */}
        <Card className="bg-card text-card-foreground border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                {family.members.length === 0
                  ? 'No members added yet'
                  : `${family.members.length} member${family.members.length === 1 ? '' : 's'}`}
              </CardDescription>
            </div>
            <Button onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            {family.members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No family members added yet.</p>
                <p className="text-sm mt-1">Click &ldquo;Add Member&rdquo; to add people to this family.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {family.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      {member.person?.avatar_url && (
                        <AvatarImage src={member.person.avatar_url} alt={member.person.full_name} />
                      )}
                      <AvatarFallback>{getInitials(member)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {member.person?.full_name || 'Unknown'}
                        </span>
                        {member.is_primary_contact && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Primary Contact
                          </Badge>
                        )}
                      </div>
                      {member.relationship && (
                        <p className="text-sm text-muted-foreground">{member.relationship}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {member.person?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.person.email}</span>
                          </div>
                        )}
                        {member.person?.phone_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.person.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!member.is_primary_contact && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(member)}
                          title="Set as primary contact"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditMember(member)}
                        title="Edit member"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenRemoveMember(member)}
                        title="Remove from family"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <ModuleViewPanel
        entity={{ id: family.id, created_at: family.created_at }}
        entityType="Family"
        modulePath="families"
        actionButtons={actionButtons}
        onDelete={handleDelete}
      />

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>
              Select a person to add to the {family.family_name} family.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Person Selection */}
            <div className="space-y-2">
              <Label>Person</Label>
              {selectedPerson ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedPerson.first_name?.charAt(0) || ''}
                      {selectedPerson.last_name?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedPerson.full_name}</p>
                    {selectedPerson.email && (
                      <p className="text-sm text-muted-foreground">{selectedPerson.email}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPeoplePickerOpen(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPeoplePickerOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Select Person
                </Button>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship (optional)</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g., Parent, Child, Spouse, Sibling"
              />
            </div>

            {/* Primary Contact Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_primary"
                checked={isPrimaryContact}
                onCheckedChange={(checked) => setIsPrimaryContact(checked === true)}
              />
              <Label htmlFor="is_primary" className="text-sm font-normal">
                Set as primary contact for this family
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!selectedPerson || isAddingMember}>
              {isAddingMember ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* People Picker */}
      <PeoplePicker
        open={peoplePickerOpen}
        onOpenChange={setPeoplePickerOpen}
        onSelect={handlePersonSelect}
        placeholder="Search for a person..."
      />

      {/* Edit Member Dialog */}
      <Dialog open={editMemberOpen} onOpenChange={setEditMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Family Member</DialogTitle>
            <DialogDescription>
              Update the relationship or primary contact status for {memberToEdit?.person?.full_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Relationship */}
            <div className="space-y-2">
              <Label htmlFor="edit_relationship">Relationship (optional)</Label>
              <Input
                id="edit_relationship"
                value={editRelationship}
                onChange={(e) => setEditRelationship(e.target.value)}
                placeholder="e.g., Parent, Child, Spouse, Sibling"
              />
            </div>

            {/* Primary Contact Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit_is_primary"
                checked={editIsPrimary}
                onCheckedChange={(checked) => setEditIsPrimary(checked === true)}
              />
              <Label htmlFor="edit_is_primary" className="text-sm font-normal">
                Set as primary contact for this family
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMember} disabled={isUpdatingMember}>
              {isUpdatingMember ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <ConfirmationDialog
        open={removeMemberOpen}
        onOpenChange={setRemoveMemberOpen}
        onConfirm={handleRemoveMember}
        title="Remove Family Member"
        description={
          memberToRemove
            ? `Are you sure you want to remove ${memberToRemove.person?.full_name || 'this person'} from the ${family.family_name} family? This will not delete the person, only remove them from this family.`
            : 'Are you sure you want to remove this person from the family?'
        }
        confirmLabel="Remove"
      />
    </div>
  )
}
