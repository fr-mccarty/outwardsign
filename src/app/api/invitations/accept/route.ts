import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setSelectedParish } from '@/lib/auth/parish'

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json()
    
    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Token and userId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch invitation with parish details
    const { data: invitation, error: invitationError } = await supabase
      .from('parish_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (invitationError || !invitation) {
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

    // Note: Email verification is handled during signup process
    // The invitation token itself provides sufficient security

    // Add user to parish
    const { error: addUserError } = await supabase
      .from('parish_users')
      .insert({
        user_id: userId,
        parish_id: invitation.parish_id,
        roles: invitation.roles,
        enabled_modules: invitation.enabled_modules
      })

    if (addUserError) {
      // Check if user is already a member (conflict)
      if (addUserError.code === '23505') { // unique constraint violation
        // Mark invitation as accepted anyway
        const { error: markAcceptedError } = await supabase
          .from('parish_invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('token', token)

        if (markAcceptedError) {
          console.error('Failed to mark invitation as accepted for existing member:', markAcceptedError)
        }

        // Set this parish as selected
        try {
          await setSelectedParish(invitation.parish_id)
        } catch (error) {
          console.error('Failed to set selected parish:', error)
          // Don't fail the request - user is already a member
        }

        return NextResponse.json({
          success: true,
          message: 'User is already a member of this parish',
          warning: markAcceptedError ? 'Could not update invitation status' : undefined
        })
      }

      return NextResponse.json(
        { error: `Failed to add user to parish: ${addUserError.message}` },
        { status: 500 }
      )
    }

    // Set this parish as the user's selected parish
    try {
      await setSelectedParish(invitation.parish_id)
    } catch (error) {
      console.error('Failed to set selected parish:', error)
      // Don't fail the request since the user was successfully added to the parish
      // They can select the parish manually if this fails
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('parish_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token)

    if (updateError) {
      console.error('Failed to mark invitation as accepted:', updateError)
      // Log the error but return success since the user was successfully added to the parish
      // The invitation will remain pending in the UI, but the user is in the parish
      return NextResponse.json({
        success: true,
        message: 'Successfully joined parish',
        warning: 'Invitation status could not be updated, but you have been added to the parish'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined parish'
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}