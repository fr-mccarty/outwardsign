'use server'

import { createClient } from '@/lib/supabase/server'
import { getSelectedParishId } from './parish'

export interface JWTClaims {
  selected_parish_id?: string
  user_id: string
  email?: string
}

export async function updateJWTClaims(): Promise<void> {
  // JWT claims functionality is currently disabled (RLS is off)
  // This function will be ready to use when RLS is re-enabled
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('JWT Claims: User not authenticated')
      return
    }

    const selectedParishId = await getSelectedParishId()
    
    // Update the user's custom claims in the JWT
    const { error } = await supabase.rpc('update_user_claims', {
      claims: {
        selected_parish_id: selectedParishId
      }
    })

    if (error) {
      console.log('JWT Claims: Function not available (RLS disabled):', error.message)
    } else {
      console.log('JWT Claims: Successfully updated')
    }
  } catch (error) {
    console.log('JWT Claims: Error occurred, but continuing:', error)
  }
}

export async function getJWTClaims(): Promise<JWTClaims | null> {
  // JWT claims functionality is currently disabled (RLS is off)
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return null
    }

    // Get claims from the database function
    const { data: claims } = await supabase.rpc('get_user_claims')

    return {
      user_id: user.id,
      email: user.email,
      selected_parish_id: claims?.selected_parish_id
    }
  } catch (error) {
    console.log('JWT Claims: Error getting claims, but continuing:', error)
    return null
  }
}

export async function ensureJWTClaims(): Promise<void> {
  // JWT claims functionality is currently disabled (RLS is off)
  try {
    const claims = await getJWTClaims()
    if (!claims || !claims.selected_parish_id) {
      await updateJWTClaims()
    }
  } catch (error) {
    console.log('JWT Claims: Error ensuring claims, but continuing:', error)
  }
}