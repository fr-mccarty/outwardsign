'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Flower, Loader2 } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { createParishWithSuperAdmin } from '@/lib/auth/parish'
import { populateInitialParishData } from '@/lib/actions/setup'

export default function OnboardingPage() {
  const [parishName, setParishName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [loading, setLoading] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  const router = useRouter()

  // Check if user already has a parish
  useEffect(() => {
    async function checkExistingParish() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user already has parish_users record
        // RLS policy allows users to read their own records, so we don't need to filter by user_id
        const { data: parishUsers, error } = await supabase
          .from('parish_users')
          .select('parish_id')
          .limit(1)

        if (error) {
          console.error('Error checking parish:', error)
        }

        if (parishUsers && parishUsers.length > 0) {
          // User already has a parish, redirect to dashboard
          router.replace('/dashboard')
          return
        }
      }

      setChecking(false)
    }

    checkExistingParish()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Create the parish
      const result = await createParishWithSuperAdmin({
        name: parishName,
        city,
        state
      })

      if (!result.success || !result.parishId) {
        setError(result.error || 'Failed to create parish')
        setLoading(false)
        return
      }

      // Step 2: Show preparing screen
      setLoading(false)
      setPreparing(true)

      // Step 3: Populate initial data (categories and readings)
      await populateInitialParishData(result.parishId)

      // Step 4: Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
      setPreparing(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (preparing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center">
                <div className="flex aspect-square size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Flower className="size-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Setting up your parish
                </h2>
                <p className="text-gray-600">
                  One minute while we get your parish ready for you.
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="text-sm text-gray-500">
                Creating categories and sample readings...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-4">
            <div className="flex aspect-square size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flower className="size-7" />
            </div>
            <div className="font-semibold text-2xl text-gray-900">{APP_NAME}</div>
          </div>
          <h2 className="mt-6 text-xl text-gray-600">Welcome! Let&apos;s set up your parish</h2>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Your Parish</CardTitle>
            <CardDescription>
              Enter your parish information to get started. You&apos;ll be assigned as the parish administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="parishName"
                label="Parish Name"
                value={parishName}
                onChange={setParishName}
                required
                placeholder="e.g., St. Mary's Catholic Church"
              />
              <FormField
                id="city"
                label="City"
                value={city}
                onChange={setCity}
                required
                placeholder="e.g., Boston"
              />
              <FormField
                id="state"
                label="State"
                value={state}
                onChange={setState}
                required
                placeholder="e.g., MA"
                maxLength={2}
                description="Two-letter state code"
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating parish...' : 'Create Parish'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
