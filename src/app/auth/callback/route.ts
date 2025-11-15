import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const invitationToken = requestUrl.searchParams.get('invitation')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // If there's an invitation token, accept it
        if (invitationToken) {
          try {
            const acceptResponse = await fetch(`${requestUrl.origin}/api/invitations/accept`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: invitationToken,
                userId: user.id,
              }),
            })

            if (acceptResponse.ok) {
              // Successfully joined parish via invitation
              return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
            }
          } catch (error) {
            console.error('Failed to accept invitation:', error)
            // Continue to normal flow if invitation acceptance fails
          }
        }

        // Check if user needs onboarding (no parish association)
        const { data: parishUser } = await supabase
          .from('parish_users')
          .select('parish_id')
          .eq('user_id', user.id)
          .maybeSingle()

        // If user has no parish, send them to onboarding
        if (!parishUser) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=authentication_failed`)
}
