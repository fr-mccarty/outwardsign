'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface BlackoutDate {
  id: string
  person_id: string
  start_date: string
  end_date: string
  reason: string | null
  created_at: string
}

/**
 * Add a blackout date for a person
 */
export async function addBlackoutDate(
  personId: string,
  startDate: string,
  endDate: string,
  reason?: string
): Promise<{ success: boolean; message: string; blackoutDate?: BlackoutDate }> {
  try {
    const supabase = createAdminClient()

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        message: 'Invalid date format',
      }
    }

    if (end < start) {
      return {
        success: false,
        message: 'End date must be on or after start date',
      }
    }

    // Insert blackout date
    const { data, error } = await supabase
      .from('person_blackout_dates')
      .insert({
        person_id: personId,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding blackout date:', error)
      return {
        success: false,
        message: 'Failed to add blackout date',
      }
    }

    return {
      success: true,
      message: 'Blackout date added successfully',
      blackoutDate: data as BlackoutDate,
    }
  } catch (error) {
    console.error('Error in addBlackoutDate:', error)
    return {
      success: false,
      message: 'An error occurred while adding blackout date',
    }
  }
}

/**
 * Delete a blackout date
 */
export async function deleteBlackoutDate(
  blackoutDateId: string,
  personId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    // Delete blackout date (only if it belongs to the person)
    const { error } = await supabase
      .from('person_blackout_dates')
      .delete()
      .eq('id', blackoutDateId)
      .eq('person_id', personId)

    if (error) {
      console.error('Error deleting blackout date:', error)
      return {
        success: false,
        message: 'Failed to delete blackout date',
      }
    }

    return {
      success: true,
      message: 'Blackout date deleted successfully',
    }
  } catch (error) {
    console.error('Error in deleteBlackoutDate:', error)
    return {
      success: false,
      message: 'An error occurred while deleting blackout date',
    }
  }
}

/**
 * Get all blackout dates for a person
 */
export async function getBlackoutDates(personId: string): Promise<BlackoutDate[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('person_blackout_dates')
      .select('*')
      .eq('person_id', personId)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching blackout dates:', error)
      return []
    }

    return (data as BlackoutDate[]) || []
  } catch (error) {
    console.error('Error in getBlackoutDates:', error)
    return []
  }
}

/**
 * Check if a person is unavailable on a specific date
 */
export async function isPersonUnavailable(personId: string, date: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { count } = await supabase
      .from('person_blackout_dates')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', personId)
      .lte('start_date', date)
      .gte('end_date', date)

    return (count || 0) > 0
  } catch (error) {
    console.error('Error checking availability:', error)
    return false
  }
}
