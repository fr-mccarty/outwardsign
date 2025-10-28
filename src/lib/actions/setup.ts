'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createTestParish() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Use the database function to create parish with super admin
    // This bypasses RLS policies using SECURITY DEFINER
    const { data: result, error: functionError } = await supabase
      .rpc('create_parish_with_super_admin', {
        p_user_id: user.id,
        p_name: 'Test Parish',
        p_city: 'Test City',
        p_state: 'TS'
      })
      .single()

    if (functionError) {
      throw new Error(`Failed to create parish: ${functionError.message}`)
    }

    if (!result.success) {
      throw new Error(`Failed to create parish: ${result.error_message}`)
    }

    // Fetch the created parish to return it
    const { data: parish, error: fetchError } = await supabase
      .from('parishes')
      .select()
      .eq('id', result.parish_id)
      .single()

    if (fetchError) {
      throw new Error(`Parish created but failed to fetch: ${fetchError.message}`)
    }

    return { success: true, parish }
  } catch (error) {
    console.error('Error creating test parish:', error)
    throw error
  }
}

export async function createParish(data: {
  name: string
  city: string
  state: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Use the database function to create parish with super admin
    // This bypasses RLS policies using SECURITY DEFINER
    const { data: result, error: functionError } = await supabase
      .rpc('create_parish_with_super_admin', {
        p_user_id: user.id,
        p_name: data.name.trim(),
        p_city: data.city.trim(),
        p_state: data.state.trim()
      })
      .single()

    if (functionError) {
      throw new Error(`Failed to create parish: ${functionError.message}`)
    }

    if (!result.success) {
      throw new Error(`Failed to create parish: ${result.error_message}`)
    }

    // Fetch the created parish to return it
    const { data: parish, error: fetchError } = await supabase
      .from('parishes')
      .select()
      .eq('id', result.parish_id)
      .single()

    if (fetchError) {
      throw new Error(`Parish created but failed to fetch: ${fetchError.message}`)
    }

    return { success: true, parish }
  } catch (error) {
    console.error('Error creating parish:', error)
    throw error
  }
}

export async function updateParish(parishId: string, data: {
  name: string
  city: string
  state: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has admin rights for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_users')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish || !userParish.roles.includes('admin')) {
      throw new Error('You do not have permission to update this parish')
    }

    // Update the parish
    const { data: parish, error: parishError } = await supabase
      .from('parishes')
      .update({
        name: data.name.trim(),
        city: data.city.trim(),
        state: data.state.trim()
      })
      .eq('id', parishId)
      .select()
      .single()

    if (parishError) {
      throw new Error(`Failed to update parish: ${parishError.message}`)
    }

    return { success: true, parish }
  } catch (error) {
    console.error('Error updating parish:', error)
    throw error
  }
}

export async function getParishSettings(parishId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has access to this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_users')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish) {
      throw new Error('You do not have access to this parish')
    }

    // Get parish settings
    const { data: settings, error: settingsError } = await supabase
      .from('parish_settings')
      .select('*')
      .eq('parish_id', parishId)
      .single()

    if (settingsError) {
      // If settings don't exist, create default settings
      if (settingsError.code === 'PGRST116') {
        const { data: newSettings, error: createError } = await supabase
          .from('parish_settings')
          .insert({
            parish_id: parishId,
            mass_intention_offering_quick_amounts: [
              { amount: 100, label: '$1' },
              { amount: 200, label: '$2' },
              { amount: 500, label: '$5' }
            ],
            donations_quick_amounts: [
              { amount: 500, label: '$5' },
              { amount: 1000, label: '$10' },
              { amount: 2500, label: '$25' },
              { amount: 5000, label: '$50' }
            ]
          })
          .select()
          .single()

        if (createError) {
          throw new Error(`Failed to create parish settings: ${createError.message}`)
        }

        return { success: true, settings: newSettings }
      }
      throw new Error(`Failed to fetch parish settings: ${settingsError.message}`)
    }

    return { success: true, settings }
  } catch (error) {
    console.error('Error getting parish settings:', error)
    throw error
  }
}

export async function updateParishSettings(parishId: string, data: {
  mass_intention_offering_quick_amounts?: Array<{amount: number, label: string}>
  donations_quick_amounts?: Array<{amount: number, label: string}>
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has admin rights for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_users')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish || !userParish.roles.includes('admin')) {
      throw new Error('You do not have permission to update parish settings')
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (data.mass_intention_offering_quick_amounts !== undefined) {
      updateData.mass_intention_offering_quick_amounts = data.mass_intention_offering_quick_amounts
    }

    if (data.donations_quick_amounts !== undefined) {
      updateData.donations_quick_amounts = data.donations_quick_amounts
    }

    // Update parish settings
    const { data: settings, error: settingsError } = await supabase
      .from('parish_settings')
      .update(updateData)
      .eq('parish_id', parishId)
      .select()
      .single()

    if (settingsError) {
      throw new Error(`Failed to update parish settings: ${settingsError.message}`)
    }

    return { success: true, settings }
  } catch (error) {
    console.error('Error updating parish settings:', error)
    throw error
  }
}

export async function getParishMembers(parishId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has access to this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_users')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish) {
      throw new Error('You do not have access to this parish')
    }

    // Get all members of the parish using the view
    const { data: parishMembers, error: parishMembersError } = await supabase
      .from('parish_members_view')
      .select('*')
      .eq('parish_id', parishId)

    if (parishMembersError) {
      throw new Error(`Failed to fetch parish members: ${parishMembersError.message}`)
    }

    // Get user emails from auth for each member
    const members = await Promise.all(
      (parishMembers || []).map(async (parishMember) => {
        let userEmail = null
        try {
          // Get email from auth.users using admin API
          const { data: authUser } = await supabase.auth.admin.getUserById(parishMember.user_id)
          userEmail = authUser.user?.email || null
        } catch (error) {
          console.error(`Error fetching email for user ${parishMember.user_id}:`, error)
        }
        
        return {
          user_id: parishMember.user_id,
          roles: parishMember.roles,
          users: {
            id: parishMember.user_id,
            email: userEmail,
            full_name: parishMember.full_name,
            created_at: parishMember.created_at
          }
        }
      })
    )

    return { success: true, members }
  } catch (error) {
    console.error('Error fetching parish members:', error)
    throw error
  }
}

export async function inviteParishMember(parishId: string, email: string, roles: string[] = ['member']) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has admin rights for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_users')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish || !userParish.roles.includes('admin')) {
      throw new Error('You do not have permission to invite members to this parish')
    }

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation, error: invitationCheckError } = await supabase
      .from('parish_invitations')
      .select('id, expires_at, accepted_at')
      .eq('email', email.toLowerCase().trim())
      .eq('parish_id', parishId)
      .single()

    if (invitationCheckError && invitationCheckError.code !== 'PGRST116') {
      throw new Error(`Error checking existing invitations: ${invitationCheckError.message}`)
    }

    if (existingInvitation) {
      // Check if invitation is still valid
      const now = new Date()
      const expiresAt = new Date(existingInvitation.expires_at)
      
      if (existingInvitation.accepted_at) {
        throw new Error('This user has already been invited and joined the parish')
      } else if (now < expiresAt) {
        throw new Error('A pending invitation already exists for this email address')
      } else {
        // Delete expired invitation
        await supabase
          .from('parish_invitations')
          .delete()
          .eq('id', existingInvitation.id)
      }
    }

    // Create invitation and send email
    
    // First, get parish and user details for the email
    const { data: parish } = await supabase
      .from('parishes')
      .select('name')
      .eq('id', parishId)
      .single()
      
    // Get inviter email from current user session
    const inviterEmail = user.email

    // Create invitation token
    const { data: invitation, error: invitationError } = await supabase
      .from('parish_invitations')
      .insert({
        parish_id: parishId,
        email: email.toLowerCase().trim(),
        roles,
        invited_by: user.id,
      })
      .select('token')
      .single()

    if (invitationError) {
      throw new Error(`Failed to create invitation: ${invitationError.message}`)
    }

    // Generate invitation link
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://liturgy.faith'}/accept-invitation?token=${invitation.token}`

    // Send invitation email
    const { sendParishInvitationEmail } = await import('@/lib/email/ses-client')
    
    const emailResult = await sendParishInvitationEmail(
      email,
      parish?.name || 'Unknown Parish',
      inviterEmail || 'A parish administrator',
      invitationLink
    )

    if (!emailResult.success) {
      // Clean up the invitation if email fails
      await supabase
        .from('parish_invitations')
        .delete()
        .eq('token', invitation.token)
        
      throw new Error(`Failed to send invitation email: ${emailResult.error}`)
    }

    return { 
      success: true, 
      message: `Invitation sent to ${email}`,
      userExists: false 
    }
  } catch (error) {
    console.error('Error inviting parish member:', error)
    throw error
  }
}

export async function removeParishMember(parishId: string, userId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has admin rights for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_users')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish || !userParish.roles.includes('admin')) {
      throw new Error('You do not have permission to remove members from this parish')
    }

    // Don't allow removing yourself
    if (userId === user.id) {
      throw new Error('You cannot remove yourself from the parish')
    }

    // Remove the user from the parish
    const { error: removeError } = await supabase
      .from('parish_users')
      .delete()
      .eq('user_id', userId)
      .eq('parish_id', parishId)

    if (removeError) {
      throw new Error(`Failed to remove member: ${removeError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing parish member:', error)
    throw error
  }
}

export async function updateMemberRole(parishId: string, userId: string, roles: string[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has admin rights for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_users')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish || !userParish.roles.includes('admin')) {
      throw new Error('You do not have permission to update member roles')
    }

    // Don't allow removing admin role from yourself
    if (userId === user.id && !roles.includes('admin')) {
      throw new Error('You cannot remove your own admin role')
    }

    // Update the member's roles
    const { error: updateError } = await supabase
      .from('parish_users')
      .update({ roles })
      .eq('user_id', userId)
      .eq('parish_id', parishId)

    if (updateError) {
      throw new Error(`Failed to update member role: ${updateError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    throw error
  }
}