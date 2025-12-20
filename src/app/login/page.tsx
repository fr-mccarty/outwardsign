'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/content-card'
import { FormInput } from '@/components/form-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import {APP_NAME} from "@/lib/constants";

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [parishName, setParishName] = useState<string>('')

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    // If we have an invitation token, accept it after successful login
    if (invitationToken && data.user) {
      try {
        const acceptResponse = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: invitationToken,
          }),
        })

        const acceptData = await acceptResponse.json()

        if (!acceptResponse.ok) {
          setError(`Signed in but failed to join parish: ${acceptData.error}`)
          setLoading(false)
          return
        }

        // Log any warnings but continue
        if (acceptData.warning) {
          console.warn('Invitation acceptance warning:', acceptData.warning)
        }
      } catch {
        setError('Signed in but failed to join parish. Please try accepting the invitation again.')
        setLoading(false)
        return
      }
    }

    // Successful login (with or without invitation)
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-4 hover:opacity-80 transition-opacity">
            <Logo size="large" />
            <div className="font-semibold text-2xl text-foreground">{APP_NAME}</div>
          </Link>
        </div>

        {/* Invitation Banner */}
        {invitationToken && parishName && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You&apos;re joining <strong>{parishName}</strong>! Sign in below to accept the invitation.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {invitationToken && parishName ? `Join ${parishName}` : `Sign in to ${APP_NAME}`}
          </CardTitle>
          <CardDescription>
            {invitationToken ? 'Sign in with your existing account' : 'Enter your email and password to sign in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <FormInput
              id="email"
              label="Email"
              inputType="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="you@example.com"
              disabled={!!searchParams.get('email')}
              autoFocus
            />
            <FormInput
              id="password"
              label="Password"
              inputType="password"
              value={password}
              onChange={setPassword}
              required
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : invitationToken ? `Join ${parishName}` : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href={invitationToken ? `/signup?invitation=${invitationToken}&email=${encodeURIComponent(email)}` : '/signup'}
                className="text-primary hover:underline"
                data-testid="login-signup-link"
              >
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}