'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

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

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    fetchInvitation()
  }, [token])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitation')
      }

      setInvitation(data.invitation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async () => {
    if (!invitation) return

    setAccepting(true)
    try {
      // Redirect to signup with invitation token
      router.push(`/signup?invitation=${token}&email=${encodeURIComponent(invitation.email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading invitation...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            You're Invited!
          </CardTitle>
          <CardDescription>
            Join {invitation.parish_name} on Liturgy.faith
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                You've been invited to join <strong>{invitation.parish_name}</strong> as a {invitation.roles.join(', ')}.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Email: <strong>{invitation.email}</strong>
              </p>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Click the button below to create your account and join the parish.
              </p>
            </div>

            <Button
              onClick={acceptInvitation}
              disabled={accepting}
              className="w-full"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By accepting, you'll be redirected to create your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvitationForm />
    </Suspense>
  )
}