import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch invitation with parish details
    const { data: invitation, error } = await supabase
      .from('parish_invitations')
      .select(`
        email,
        token,
        roles,
        expires_at,
        accepted_at,
        parishes (
          name
        )
      `)
      .eq('token', token)
      .single()

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Check if invitation has already been accepted
    if (invitation.accepted_at) {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        token: invitation.token,
        roles: invitation.roles,
        expires_at: invitation.expires_at,
        parish_name: (invitation.parishes as any)?.name || 'Unknown Parish'
      }
    })

  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}