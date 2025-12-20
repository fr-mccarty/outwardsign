'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/content-card'
import { FormInput } from '@/components/form-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/logo'
import { Loader2 } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { createParishWithSuperAdmin } from '@/lib/auth/parish'
import { populateInitialParishData } from '@/lib/actions/setup'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const [parishName, setParishName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
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
        state: state || undefined,
        country
      })

      if (!result.success || !result.parishId) {
        setError(result.error || 'Failed to create parish')
        setLoading(false)
        return
      }

      // Step 2: Show preparing screen
      setLoading(false)
      setPreparing(true)

      // Step 3: Populate initial data (sample readings, group roles, mass roles, etc.)
      try {
        await populateInitialParishData(result.parishId)
      } catch (seedError) {
        console.error('Error seeding parish data:', seedError)
        // Continue anyway - parish is created, just missing seed data
        toast.error('Parish created but some initial data failed to load')
      }

      // Step 4: Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoading(false)
      setPreparing(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (preparing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center">
                <Logo size="large" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Setting up your parish
                </h2>
                <p className="text-muted-foreground">
                  One minute while we get your parish ready for you.
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">
                Seeding parish readings...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-4">
            <Logo size="large" />
            <div className="font-semibold text-2xl text-foreground">{APP_NAME}</div>
          </div>
          <h2 className="mt-6 text-xl text-muted-foreground">Welcome! Let&apos;s set up your parish</h2>
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
              <FormInput
                id="parishName"
                label="Parish Name"
                value={parishName}
                onChange={setParishName}
                required
                placeholder="e.g., St. Mary's Catholic Church"
              />
              <FormInput
                id="city"
                label="City"
                value={city}
                onChange={setCity}
                required
                placeholder="e.g., Boston"
              />
              <FormInput
                id="state"
                label="State"
                value={state}
                onChange={setState}
                placeholder="e.g., Massachusetts"
              />
              <FormInput
                id="country"
                label="Country"
                value={country}
                onChange={setCountry}
                required
                placeholder="e.g., United States"
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
