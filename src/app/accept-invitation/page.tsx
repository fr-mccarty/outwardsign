'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, UserPlus, LogIn } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

interface InvitationData {
  parish_name: string
  email: string
  token: string
  expires_at: string
  roles: string[]
}

function AcceptInvitationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [, setIsAuthenticated] = useState(false)
  const [acceptSuccess, setAcceptSuccess] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [emailMismatch, setEmailMismatch] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link - no token provided')
      setLoading(false)
      return
    }

    checkAuthAndFetchInvitation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]) // checkAuthAndFetchInvitation is stable, only re-run when token changes

  const checkAuthAndFetchInvitation = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)
      if (user?.email) {
        setCurrentUserEmail(user.email)
      }

      // Fetch invitation details
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitation')
      }

      setInvitation(data.invitation)

      // If user is already authenticated, check if their email matches the invitation
      if (user) {
        const invitationEmail = data.invitation.email.toLowerCase()
        const userEmail = user.email?.toLowerCase()

        if (userEmail === invitationEmail) {
          // Email matches - auto-accept the invitation
          await autoAcceptInvitation()
        } else {
          // Email mismatch - show warning instead of auto-accepting
          setEmailMismatch(true)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const autoAcceptInvitation = async () => {
    setAccepting(true)
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setAcceptSuccess(true)

      // Redirect to dashboard after a brief success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  const handleSignup = () => {
    if (!invitation) return
    router.push(`/signup?invitation=${token}&email=${encodeURIComponent(invitation.email)}`)
  }

  const handleLogin = () => {
    if (!invitation) return
    router.push(`/login?invitation=${token}&email=${encodeURIComponent(invitation.email)}`)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Reload the page to reset state
    window.location.reload()
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading invitation...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !acceptSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/')}
              className="w-full mt-4"
              variant="outline"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state (after auto-accepting for authenticated users)
  if (acceptSuccess && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Invitation Accepted!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve successfully joined <strong>{invitation.parish_name}</strong>.
                Redirecting to your dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Email mismatch state (logged in as different user than invitation)
  if (emailMismatch && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              Wrong Account
            </CardTitle>
            <CardDescription>
              This invitation was sent to a different email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="mb-2">
                    This invitation was sent to <strong>{invitation.email}</strong>, but you&apos;re currently signed in as <strong>{currentUserEmail}</strong>.
                  </p>
                  <p>
                    To accept this invitation, please sign out and then sign in with the correct account.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Invitation to join:
                </p>
                <p className="font-semibold">{invitation.parish_name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Role: <span className="font-medium text-foreground">{invitation.roles.join(', ')}</span>
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSignOut}
                  className="w-full"
                  size="lg"
                >
                  Sign Out & Continue
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No invitation found
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              Invitation Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid or has expired.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full"
              variant="outline"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main invitation display (for unauthenticated users)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            You&apos;re Invited!
          </CardTitle>
          <CardDescription>
            Join {invitation.parish_name} on {APP_NAME}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                You&apos;ve been invited to join:
              </p>
              <p className="font-semibold text-lg">{invitation.parish_name}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Role: <span className="font-medium text-foreground">{invitation.roles.join(', ')}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Email: <span className="font-medium text-foreground">{invitation.email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Choose how you&apos;d like to continue:
              </p>

              <Button
                onClick={handleSignup}
                disabled={accepting}
                className="w-full"
                size="lg"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create New Account
              </Button>

              <Button
                onClick={handleLogin}
                disabled={accepting}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in with Existing Account
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              After signing in or creating an account, you&apos;ll be automatically added to {invitation.parish_name}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AcceptInvitationForm />
    </Suspense>
  )
}
