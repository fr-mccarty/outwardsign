'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'

export interface Announcement {
  id: number
  title?: string
  text: string | null
  date?: string
  parish_id: string
  created_at: string
}

export interface AnnouncementTemplate {
  id: number
  title: string
  text: string
  parish_id: string
  created_at: string
}

export async function getAnnouncements(parishId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has access to this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_user')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish) {
      throw new Error('You do not have access to this parish')
    }

    // Get announcements for the parish
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('parish_id', parishId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch announcements: ${error.message}`)
    }

    return { success: true, announcements: announcements || [] }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    throw error
  }
}

export async function createAnnouncement(data: {
  text: string
  liturgical_event_id?: string | null
  parish_id: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has permission to create announcements for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_user')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', data.parish_id)
      .single()

    if (userParishError || !userParish ||
        (!userParish.roles.includes('admin') && !userParish.roles.includes('staff'))) {
      throw new Error('You do not have permission to create announcements for this parish')
    }

    // Generate a unique bigint ID using timestamp + random component
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const id = parseInt(`${timestamp}${random.toString().padStart(3, '0')}`)

    // Create the announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        id: id,
        text: data.text.trim(),
        liturgical_event_id: data.liturgical_event_id || null,
        parish_id: data.parish_id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create announcement: ${error.message}`)
    }

    return { success: true, announcement }
  } catch (error) {
    console.error('Error creating announcement:', error)
    throw error
  }
}

export async function updateAnnouncement(announcementId: number, data: {
  title?: string
  text: string
  date?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    const selectedParishId = await requireSelectedParish()
    
    // Get the announcement to check parish ownership
    const { data: existingAnnouncement, error: fetchError } = await supabase
      .from('announcements')
      .select('parish_id')
      .eq('id', announcementId)
      .single()

    if (fetchError || !existingAnnouncement) {
      throw new Error('Announcement not found')
    }

    // Check if the announcement belongs to the user's selected parish
    if (existingAnnouncement.parish_id !== selectedParishId) {
      throw new Error('You do not have permission to update this announcement')
    }

    // Update the announcement
    const updateData: any = {
      text: data.text.trim()
    }
    
    // Only update title and date if provided
    if (data.title !== undefined) {
      updateData.title = data.title.trim()
    }
    if (data.date !== undefined) {
      updateData.date = data.date
    }

    const { data: announcement, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', announcementId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update announcement: ${error.message}`)
    }

    return { success: true, announcement }
  } catch (error) {
    console.error('Error updating announcement:', error)
    throw error
  }
}

export async function deleteAnnouncement(announcementId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Get the announcement to check parish ownership
    const { data: existingAnnouncement, error: fetchError } = await supabase
      .from('announcements')
      .select('parish_id')
      .eq('id', announcementId)
      .single()

    if (fetchError || !existingAnnouncement) {
      throw new Error('Announcement not found')
    }

    // Check if user has permission to delete announcements for this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_user')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', existingAnnouncement.parish_id)
      .single()

    if (userParishError || !userParish || !userParish.roles.includes('admin')) {
      throw new Error('You do not have permission to delete this announcement')
    }

    // Delete the announcement
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)

    if (error) {
      throw new Error(`Failed to delete announcement: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting announcement:', error)
    throw error
  }
}

export async function getAnnouncementTemplates() {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { data: templates, error } = await supabase
    .from('announcement_templates')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('title', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch announcement templates: ${error.message}`)
  }

  return { success: true, templates: templates || [] }
}

export async function createAnnouncementTemplate(data: {
  title: string
  text: string
}) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // Generate a unique bigint ID using timestamp + random component
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const id = parseInt(`${timestamp}${random.toString().padStart(3, '0')}`)

  const { data: template, error } = await supabase
    .from('announcement_templates')
    .insert({
      id: id,
      title: data.title.trim(),
      text: data.text.trim(),
      parish_id: selectedParishId
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create announcement template: ${error.message}`)
  }

  return template
}

export async function updateAnnouncementTemplate(templateId: number, data: {
  title: string
  text: string
}) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // Get the template to check parish ownership
  const { data: existingTemplate, error: fetchError } = await supabase
    .from('announcement_templates')
    .select('parish_id')
    .eq('id', templateId)
    .single()

  if (fetchError || !existingTemplate) {
    throw new Error('Template not found')
  }

  // Check if the template belongs to the user's selected parish
  if (existingTemplate.parish_id !== selectedParishId) {
    throw new Error('You do not have permission to update this template')
  }

  const { data: template, error } = await supabase
    .from('announcement_templates')
    .update({
      title: data.title.trim(),
      text: data.text.trim()
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update announcement template: ${error.message}`)
  }

  return template
}

export async function deleteAnnouncementTemplate(templateId: number) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // Get the template to check parish ownership
  const { data: existingTemplate, error: fetchError } = await supabase
    .from('announcement_templates')
    .select('parish_id')
    .eq('id', templateId)
    .single()

  if (fetchError || !existingTemplate) {
    throw new Error('Template not found')
  }

  // Check if the template belongs to the user's selected parish
  if (existingTemplate.parish_id !== selectedParishId) {
    throw new Error('You do not have permission to delete this template')
  }

  const { error } = await supabase
    .from('announcement_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    throw new Error(`Failed to delete announcement template: ${error.message}`)
  }

  return { success: true }
}

export async function getAnnouncementTemplate(templateId: number) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  const { data: template, error } = await supabase
    .from('announcement_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error || !template) {
    throw new Error('Template not found')
  }

  // Check if the template belongs to the user's selected parish
  if (template.parish_id !== selectedParishId) {
    throw new Error('You do not have access to this template')
  }

  return template
}

export async function searchAnnouncements(params: {
  query?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Get user's parishes
    const { data: userParishes, error: userParishError } = await supabase
      .from('parish_user')
      .select('parish_id')
      .eq('user_id', user.id)

    if (userParishError || !userParishes || userParishes.length === 0) {
      throw new Error('You do not have access to any parishes')
    }

    const parishIds = userParishes.map(up => up.parish_id)

    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    let query = supabase
      .from('announcements')
      .select('*', { count: 'exact' })
      .in('parish_id', parishIds)
      .order('created_at', { ascending: false })

    if (params.query) {
      query = query.ilike('text', `%${params.query}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: announcements, error, count } = await query

    if (error) {
      throw new Error(`Failed to search announcements: ${error.message}`)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      announcements: announcements || [],
      total: count || 0,
      totalPages,
      currentPage: page
    }
  } catch (error) {
    console.error('Error searching announcements:', error)
    throw error
  }
}

export async function duplicateAnnouncement(announcementId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Get the original announcement
    const { data: originalAnnouncement, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single()

    if (fetchError || !originalAnnouncement) {
      throw new Error('Announcement not found')
    }

    // Check if user has permission to access this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_user')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', originalAnnouncement.parish_id)
      .single()

    if (userParishError || !userParish) {
      throw new Error('You do not have permission to duplicate this announcement')
    }

    // Generate a unique bigint ID using timestamp + random component
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const id = parseInt(`${timestamp}${random.toString().padStart(3, '0')}`)

    // Create duplicate
    const { data: duplicatedAnnouncement, error } = await supabase
      .from('announcements')
      .insert({
        id: id,
        title: originalAnnouncement.title ? `${originalAnnouncement.title} (Copy)` : null,
        text: originalAnnouncement.text,
        date: originalAnnouncement.date,
        liturgical_event_id: originalAnnouncement.liturgical_event_id,
        parish_id: originalAnnouncement.parish_id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to duplicate announcement: ${error.message}`)
    }

    return duplicatedAnnouncement
  } catch (error) {
    console.error('Error duplicating announcement:', error)
    throw error
  }
}

export async function getAnnouncement(announcementId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Get the announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single()

    if (error || !announcement) {
      throw new Error('Announcement not found')
    }

    // Check if user has access to this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_user')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', announcement.parish_id)
      .single()

    if (userParishError || !userParish) {
      throw new Error('You do not have access to this announcement')
    }

    return announcement
  } catch (error) {
    console.error('Error fetching announcement:', error)
    throw error
  }
}

export async function createBasicAnnouncement(data: {
  title: string
  date: string
}) {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()

  // Generate a unique bigint ID using timestamp + random component
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const id = parseInt(`${timestamp}${random.toString().padStart(3, '0')}`)

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      id: id,
      title: data.title.trim(),
      text: null, // Will be filled in wizard
      date: data.date,
      parish_id: selectedParishId
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create announcement: ${error.message}`)
  }

  return announcement
}

export async function getAnnouncementsByDateRange(startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Get user's parishes
    const { data: userParishes, error: userParishError } = await supabase
      .from('parish_user')
      .select('parish_id')
      .eq('user_id', user.id)

    if (userParishError || !userParishes || userParishes.length === 0) {
      throw new Error('You do not have access to any parishes')
    }

    const parishIds = userParishes.map(up => up.parish_id)

    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .in('parish_id', parishIds)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch announcements by date range: ${error.message}`)
    }

    return announcements || []
  } catch (error) {
    console.error('Error fetching announcements by date range:', error)
    throw error
  }
}

export async function getLiturgicalEvents(parishId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Check if user has access to this parish
    const { data: userParish, error: userParishError } = await supabase
      .from('parish_user')
      .select('roles')
      .eq('user_id', user.id)
      .eq('parish_id', parishId)
      .single()

    if (userParishError || !userParish) {
      throw new Error('You do not have access to this parish')
    }

    // Get liturgical events for the parish
    const { data: events, error } = await supabase
      .from('liturgical_events')
      .select('id, name, event_date, start_time')
      .eq('parish_id', parishId)
      .order('event_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch liturgical events: ${error.message}`)
    }

    return { success: true, events: events || [] }
  } catch (error) {
    console.error('Error fetching liturgical events:', error)
    throw error
  }
}