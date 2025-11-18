'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { readingsData } from '@/lib/data/readings'
import sundayEnglish from '@/lib/default-petition-templates/sunday-english'
import sundaySpanish from '@/lib/default-petition-templates/sunday-spanish'
import daily from '@/lib/default-petition-templates/daily'
import weddingEnglish from '@/lib/default-petition-templates/wedding-english'
import weddingSpanish from '@/lib/default-petition-templates/wedding-spanish'
import funeralEnglish from '@/lib/default-petition-templates/funeral-english'
import funeralSpanish from '@/lib/default-petition-templates/funeral-spanish'
import quinceaneraEnglish from '@/lib/default-petition-templates/quinceanera-english'
import quinceaneraSpanish from '@/lib/default-petition-templates/quinceanera-spanish'
import presentationEnglish from '@/lib/default-petition-templates/presentation-english'
import presentationSpanish from '@/lib/default-petition-templates/presentation-spanish'

export async function createTestParish() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Use the database function to create parish with admin
    // This bypasses RLS policies using SECURITY DEFINER
    const { data: result, error: functionError } = await supabase
      .rpc('create_parish_with_admin', {
        p_user_id: user.id,
        p_name: 'Test Parish',
        p_city: 'Test City',
        p_state: 'TS'
      })
      .single()

    if (functionError) {
      throw new Error(`Failed to create parish: ${functionError.message}`)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from create_parish_with_admin')
    }

    const typedResult = result as { success: boolean; error_message?: string; parish_id?: string }

    if (!typedResult.success) {
      throw new Error(`Failed to create parish: ${typedResult.error_message}`)
    }

    // Fetch the created parish to return it
    const { data: parish, error: fetchError } = await supabase
      .from('parishes')
      .select()
      .eq('id', typedResult.parish_id)
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
    // Use the database function to create parish with admin role
    // This bypasses RLS policies using SECURITY DEFINER
    const { data: result, error: functionError } = await supabase
      .rpc('create_parish_with_admin', {
        p_user_id: user.id,
        p_name: data.name.trim(),
        p_city: data.city.trim(),
        p_state: data.state.trim()
      })
      .single()

    if (functionError) {
      throw new Error(`Failed to create parish: ${functionError.message}`)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from create_parish_with_admin')
    }

    const typedResult = result as { success: boolean; error_message?: string; parish_id?: string }

    if (!typedResult.success) {
      throw new Error(`Failed to create parish: ${typedResult.error_message}`)
    }

    // Fetch the created parish to return it
    const { data: parish, error: fetchError } = await supabase
      .from('parishes')
      .select()
      .eq('id', typedResult.parish_id)
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
            mass_intention_offering_quick_amount: [
              { amount: 100, label: '$1' },
              { amount: 200, label: '$2' },
              { amount: 500, label: '$5' }
            ],
            donations_quick_amount: [
              { amount: 500, label: '$5' },
              { amount: 1000, label: '$10' },
              { amount: 2500, label: '$25' },
              { amount: 5000, label: '$50' }
            ],
            liturgical_locale: 'en_US'
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
  mass_intention_offering_quick_amount?: Array<{amount: number, label: string}>
  donations_quick_amount?: Array<{amount: number, label: string}>
  liturgical_locale?: string
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

    // Prepare update data using simplified pattern
    const updateData = Object.fromEntries(
      Object.entries({
        mass_intention_offering_quick_amount: data.mass_intention_offering_quick_amount,
        donations_quick_amount: data.donations_quick_amount,
        liturgical_locale: data.liturgical_locale,
        updated_at: new Date().toISOString()
      }).filter(([_, value]) => value !== undefined)
    )

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

    // Get all members of the parish
    const { data: parishMembers, error: parishMembersError } = await supabase
      .from('parish_users')
      .select('user_id, roles, enabled_modules, created_at')
      .eq('parish_id', parishId)

    if (parishMembersError) {
      throw new Error(`Failed to fetch parish members: ${parishMembersError.message}`)
    }

    // Create admin client for fetching user emails
    const adminClient = createAdminClient()

    // Get user emails from auth for each member
    const members = await Promise.all(
      (parishMembers || []).map(async (parishMember) => {
        let userEmail = null
        let userCreatedAt = parishMember.created_at

        try {
          // Get email from auth.users using admin API
          const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(parishMember.user_id)

          if (authError) {
            console.error(`Error fetching user ${parishMember.user_id} from auth:`, authError)
          } else if (authUser?.user) {
            userEmail = authUser.user.email || null
            userCreatedAt = authUser.user.created_at
          } else {
            console.warn(`No user data returned for user_id ${parishMember.user_id}`)
          }
        } catch (error) {
          console.error(`Exception fetching email for user ${parishMember.user_id}:`, error)
        }

        return {
          user_id: parishMember.user_id,
          roles: parishMember.roles,
          enabled_modules: parishMember.enabled_modules || [],
          users: {
            id: parishMember.user_id,
            email: userEmail,
            created_at: userCreatedAt
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

export async function inviteStaff(parishId: string, email: string, roles: string[] = ['staff']) {
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

export async function updateMemberRole(
  parishId: string,
  userId: string,
  roles: string[],
  enabled_modules?: string[]
) {
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

    // Update the member's roles and enabled_modules
    const updateData: { roles: string[]; enabled_modules?: string[] } = { roles }

    // Only set enabled_modules if provided (for ministry-leader role)
    if (enabled_modules !== undefined) {
      updateData.enabled_modules = roles.includes('ministry-leader') ? enabled_modules : []
    }

    const { error: updateError } = await supabase
      .from('parish_users')
      .update(updateData)
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

export async function populateInitialParishData(parishId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Seed initial readings from the canonical library
    const readingsToInsert = readingsData.map((reading) => ({
      parish_id: parishId,
      pericope: reading.pericope,
      text: reading.text,
      categories: reading.categories,
      language: reading.language,
      introduction: reading.introduction ?? null,
      conclusion: reading.conclusion ?? null
    }))

    const { data: readings, error: readingsError } = await supabase
      .from('readings')
      .insert(readingsToInsert)
      .select()

    if (readingsError) {
      console.error('Error creating readings:', readingsError)
      throw new Error(`Failed to create readings: ${readingsError.message}`)
    }

    // Seed initial petition templates
    const defaultPetitionTemplates = [
      sundayEnglish,
      sundaySpanish,
      daily,
      weddingEnglish,
      weddingSpanish,
      funeralEnglish,
      funeralSpanish,
      quinceaneraEnglish,
      quinceaneraSpanish,
      presentationEnglish,
      presentationSpanish
    ]

    const petitionTemplatesToInsert = defaultPetitionTemplates.map((template) => ({
      parish_id: parishId,
      title: template.title,
      description: template.description,
      context: template.content,
      module: template.module,
      language: template.language,
      is_default: template.is_default
    }))

    const { data: petitionTemplates, error: petitionTemplatesError } = await supabase
      .from('petition_templates')
      .insert(petitionTemplatesToInsert)
      .select()

    if (petitionTemplatesError) {
      console.error('Error creating petition templates:', petitionTemplatesError)
      throw new Error(`Failed to create petition templates: ${petitionTemplatesError.message}`)
    }

    // Seed default group roles
    const defaultGroupRoles = [
      {
        parish_id: parishId,
        name: 'Leader',
        description: 'Leads and coordinates the group',
        is_active: true,
        display_order: 1
      },
      {
        parish_id: parishId,
        name: 'Member',
        description: 'Active participant in the group',
        is_active: true,
        display_order: 2
      },
      {
        parish_id: parishId,
        name: 'Secretary',
        description: 'Maintains records and communications',
        is_active: true,
        display_order: 3
      },
      {
        parish_id: parishId,
        name: 'Treasurer',
        description: 'Manages group finances',
        is_active: true,
        display_order: 4
      },
      {
        parish_id: parishId,
        name: 'Coordinator',
        description: 'Coordinates group activities and events',
        is_active: true,
        display_order: 5
      }
    ]

    const { data: groupRoles, error: groupRolesError } = await supabase
      .from('group_roles')
      .insert(defaultGroupRoles)
      .select()

    if (groupRolesError) {
      console.error('Error creating default group roles:', groupRolesError)
      throw new Error(`Failed to create default group roles: ${groupRolesError.message}`)
    }

    // Seed default mass (liturgical) roles
    const defaultMassRoles = [
      {
        parish_id: parishId,
        name: 'Lector',
        description: 'Proclaims the Word of God during Mass',
        is_active: true,
        display_order: 1
      },
      {
        parish_id: parishId,
        name: 'Eucharistic Minister',
        description: 'Distributes Holy Communion during Mass',
        is_active: true,
        display_order: 2
      },
      {
        parish_id: parishId,
        name: 'Server',
        description: 'Assists the priest at the altar during Mass',
        is_active: true,
        display_order: 3
      },
      {
        parish_id: parishId,
        name: 'Cantor',
        description: 'Leads the congregation in singing',
        is_active: true,
        display_order: 4
      },
      {
        parish_id: parishId,
        name: 'Usher',
        description: 'Welcomes parishioners and assists with seating and collection',
        is_active: true,
        display_order: 5
      },
      {
        parish_id: parishId,
        name: 'Sacristan',
        description: 'Prepares the sacred vessels and sanctuary for Mass',
        is_active: true,
        display_order: 6
      },
      {
        parish_id: parishId,
        name: 'Music Minister',
        description: 'Provides music during the liturgy',
        is_active: true,
        display_order: 7
      },
      {
        parish_id: parishId,
        name: 'Greeter',
        description: 'Welcomes parishioners as they arrive',
        is_active: true,
        display_order: 8
      },
      {
        parish_id: parishId,
        name: 'Coordinator',
        description: 'Coordinates and oversees liturgical ministries',
        is_active: true,
        display_order: 9
      },
      {
        parish_id: parishId,
        name: 'Gift Bearer',
        description: 'Brings up the gifts during the offertory',
        is_active: true,
        display_order: 10
      },
      {
        parish_id: parishId,
        name: 'Pre-Mass Speaker',
        description: 'Makes announcements before Mass begins',
        is_active: true,
        display_order: 11
      }
    ]

    const { data: massRoles, error: massRolesError } = await supabase
      .from('mass_roles')
      .insert(defaultMassRoles)
      .select()

    if (massRolesError) {
      console.error('Error creating default mass roles:', massRolesError)
      throw new Error(`Failed to create default mass roles: ${massRolesError.message}`)
    }

    return {
      success: true,
      readings: readings || [],
      petitionTemplates: petitionTemplates || [],
      groupRoles: groupRoles || [],
      massRoles: massRoles || []
    }
  } catch (error) {
    console.error('Error populating initial parish data:', error)
    throw error
  }
}
