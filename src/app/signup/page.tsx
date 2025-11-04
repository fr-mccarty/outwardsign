'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Flower, CheckCircle } from 'lucide-react'
import {APP_NAME} from "@/lib/constants";

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [parishName, setParishName] = useState<string>('')

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const invitation = searchParams.get('invitation')
    const emailParam = searchParams.get('email')

    if (invitation) {
      setInvitationToken(invitation)
      fetchInvitationDetails(invitation)
    }

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const fetchInvitationDetails = async (token: string) => {
    try {
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (response.ok) {
        setParishName(data.invitation.parish_name)
      }
    } catch (err) {
      console.error('Failed to fetch invitation details:', err)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    try {
      // First try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // If we have an invitation token, accept it after successful signup
      if (invitationToken && signUpData.user) {
        const acceptResponse = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: invitationToken,
            userId: signUpData.user.id,
          }),
        })

        if (!acceptResponse.ok) {
          const errorData = await acceptResponse.json()
          setError(`Account created but failed to join parish: ${errorData.error}`)
          return
        }
      }

      // If email confirmation is disabled, user should be automatically signed in
      if (signUpData.session) {
        if (invitationToken) {
          setMessage(`Account created successfully! You've joined ${parishName}. Redirecting to dashboard...`)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else {
          setMessage('Account created successfully! Let\'s set up your parish...')
          setTimeout(() => {
            window.location.href = '/onboarding'
          }, 1500)
        }
      } else {
        // Try to sign in manually (fallback)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError('Account created but failed to sign in. Please try logging in manually.')
          setTimeout(() => router.push('/login'), 2000)
        } else {
          if (invitationToken) {
            setMessage(`Account created successfully! You've joined ${parishName}. Redirecting to dashboard...`)
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 2000)
          } else {
            setMessage('Account created successfully! Let\'s set up your parish...')
            setTimeout(() => {
              window.location.href = '/onboarding'
            }, 1500)
          }
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="flex aspect-square size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flower className="size-7" />
            </div>
            <div className="font-semibold text-2xl text-foreground">{APP_NAME}</div>
          </Link>
        </div>

        {/* Invitation Banner */}
        {invitationToken && parishName && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You&#39;re joining <strong>{parishName}</strong>! Create your account below to get started.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {invitationToken ? `Join ${parishName}` : `Sign up for ${APP_NAME}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <FormField
              id="email"
              label="Email"
              inputType="email"
              value={email}
              onChange={setEmail}
              required
              disabled={!!searchParams.get('email')}
            />
            <FormField
              id="password"
              label="Password"
              description="Must be at least 6 characters"
              inputType="password"
              value={password}
              onChange={setPassword}
              required
            />
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            {message && (
              <div className="text-green-500 text-sm">{message}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : invitationToken ? `Join ${parishName}` : 'Sign up'}
            </Button>
            <p className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
