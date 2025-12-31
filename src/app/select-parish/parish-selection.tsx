'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSelectedParish } from '@/lib/auth/parish'
import { ParishUser, Parish } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { CreateParishForm } from './create-parish-form'
import { toast } from 'sonner'

interface ParishWithDetails extends ParishUser {
  parish: Parish
}

export function ParishSelection() {
  const [parishes, setParishes] = useState<ParishWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUserParishes()
  }, [])

  async function loadUserParishes() {
    try {
      const supabase = createClient()
      
      // Get user's parish associations with parish details
      const { data: userParishes, error } = await supabase
        .from('parish_users')
        .select(`
          user_id,
          parish_id,
          roles,
          enabled_modules,
          created_at,
          parishes (
            id,
            name,
            city,
            state,
            created_at
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (error) {
        console.error('Error loading parishes:', error)
        toast.error('Failed to load parishes')
        return
      }

      const parishesWithDetails = userParishes?.map(item => ({
        user_id: item.user_id,
        parish_id: item.parish_id,
        roles: item.roles || [],
        enabled_modules: item.enabled_modules || [],
        created_at: item.created_at,
        parish: item.parishes as unknown as Parish
      })) || []

      setParishes(parishesWithDetails)
      
      // If user has no parishes, show option to create/join one
      if (parishesWithDetails.length === 0) {
        toast.info('No parishes found. You need to be invited to a parish or create one.')
      }
    } catch (error) {
      console.error('Error loading parishes:', error)
      toast.error('Failed to load parishes')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectParish(parishId: string) {
    setSelecting(parishId)
    
    try {
      await setSelectedParish(parishId)
      toast.success('Parish selected successfully!')
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error selecting parish:', error)
      toast.error('Failed to select parish')
    } finally {
      setSelecting(null)
    }
  }

  async function handleCreateParish() {
    setShowCreateForm(true)
  }

  async function handleCreateTestParish() {
    setSelecting('test')
    
    try {
      const result = await createTestParish()
      toast.success('Test parish created successfully!')
      
      // Set the test parish as selected
      await setSelectedParish(result.parish.id)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating test parish:', error)
      toast.error('Failed to create test parish')
    } finally {
      setSelecting(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <CreateParishForm 
        onCancel={() => setShowCreateForm(false)}
        onSuccess={() => {
          setShowCreateForm(false)
          loadUserParishes()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {parishes.length > 0 ? (
        <>
          <div className="space-y-4">
            {parishes.map((parishAssoc) => (
              <Card key={parishAssoc.parish_id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{parishAssoc.parish.name}</CardTitle>
                  <CardDescription>
                    {parishAssoc.parish.city}, {parishAssoc.parish.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Role: {parishAssoc.roles.join(', ') || 'Member'}
                    </div>
                    <Button
                      onClick={() => handleSelectParish(parishAssoc.parish_id)}
                      disabled={selecting === parishAssoc.parish_id}
                      className="ml-4"
                    >
                      {selecting === parishAssoc.parish_id ? 'Selecting...' : 'Select Parish'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Don&apos;t see your parish?
            </p>
            <Button variant="outline" onClick={handleCreateParish}>
              Create New Parish
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <p className="mb-2">You&apos;re not associated with any parishes yet.</p>
                  <p className="text-sm">You can either:</p>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleCreateParish} className="w-full">
                    Create New Parish
                  </Button>

                  <Button
                    onClick={handleCreateTestParish}
                    variant="outline"
                    className="w-full"
                    disabled={selecting === 'test'}
                  >
                    {selecting === 'test' ? 'Creating...' : 'Create Test Parish (Development)'}
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    or ask your parish administrator to invite you to an existing parish
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}