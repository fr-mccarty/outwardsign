'use client'

import { useEffect, useState } from 'react'
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { UserPlus, User, Trash2, Save, X, Users } from "lucide-react"
import { getGroup, addGroupMember, removeGroupMember, updateGroupMemberRole, type GroupWithMembers, type GroupMember } from '@/lib/actions/groups'
import { getPeople, type Person } from '@/lib/actions/people'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [group, setGroup] = useState<GroupWithMembers | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [memberRole, setMemberRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [groupId, setGroupId] = useState<string>('')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params
        setGroupId(id)
        
        const [groupData, peopleData] = await Promise.all([
          getGroup(id),
          getPeople()
        ])
        
        if (!groupData) {
          toast.error('Group not found')
          router.push('/groups')
          return
        }
        
        setGroup(groupData)
        setPeople(peopleData)
        
        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "Groups", href: "/groups" },
          { label: groupData.name }
        ])
      } catch (error) {
        console.error('Failed to load group:', error)
        toast.error('Failed to load group')
        router.push('/groups')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params, setBreadcrumbs, router])

  const availablePeople = people.filter(person => 
    person.is_active && !group?.members.some(member => member.person_id === person.id)
  )

  const handleAddMember = async () => {
    if (!selectedPersonId) {
      toast.error('Please select a person')
      return
    }

    setSaving(true)
    try {
      await addGroupMember(groupId, selectedPersonId, memberRole || undefined)
      toast.success('Member added successfully')
      
      // Reload group data
      const updatedGroup = await getGroup(groupId)
      if (updatedGroup) {
        setGroup(updatedGroup)
      }
      
      setAddMemberDialogOpen(false)
      setSelectedPersonId('')
      setMemberRole('')
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error('Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = async (member: GroupMember) => {
    const personName = member.person ? `${member.person.first_name} ${member.person.last_name}` : 'this person'
    if (!confirm(`Are you sure you want to remove ${personName} from this group?`)) {
      return
    }

    try {
      await removeGroupMember(groupId, member.person_id)
      toast.success('Member removed successfully')
      
      // Reload group data
      const updatedGroup = await getGroup(groupId)
      if (updatedGroup) {
        setGroup(updatedGroup)
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member')
    }
  }

  const handleUpdateRole = async (member: GroupMember, newRole: string) => {
    try {
      await updateGroupMemberRole(groupId, member.person_id, newRole || undefined)
      toast.success('Role updated successfully')
      
      // Reload group data
      const updatedGroup = await getGroup(groupId)
      if (updatedGroup) {
        setGroup(updatedGroup)
      }
    } catch (error) {
      console.error('Failed to update role:', error)
      toast.error('Failed to update role')
    }
  }

  if (loading) {
    return (
      <PageContainer 
        title="Group Details"
        description="Loading group information..."
      >
        <Loading />
      </PageContainer>
    )
  }

  if (!group) {
    return (
      <PageContainer 
        title="Group Not Found"
        description="The requested group could not be found."
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Group not found</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title={group.name}
      description={group.description || "Manage group members and their roles"}
    >
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <Button onClick={() => setAddMemberDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members ({group.members.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage the people who are part of this group and their specific roles.
          </p>
        </CardHeader>
        <CardContent>
          {group.members.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No members in this group</p>
              <Button onClick={() => setAddMemberDialogOpen(true)} variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {member.person ? 
                          `${member.person.first_name} ${member.person.last_name}` : 
                          'Unknown Person'
                        }
                      </h3>
                      {member.person?.email && (
                        <p className="text-sm text-muted-foreground">
                          {member.person.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="min-w-32">
                      <Select
                        value={member.role || ''}
                        onValueChange={(value) => handleUpdateRole(member, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="No role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No role</SelectItem>
                          <SelectItem value="leader">Leader</SelectItem>
                          <SelectItem value="coordinator">Coordinator</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="substitute">Substitute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member)}
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

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member to {group.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="person">Select Person</Label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a person to add" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.first_name} {person.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availablePeople.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  All active people are already members of this group.
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="role">Role (Optional)</Label>
              <Input
                id="role"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                placeholder="e.g., Leader, Coordinator, Member"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can assign or change roles later.
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setAddMemberDialogOpen(false)}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember} 
                disabled={saving || !selectedPersonId}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}