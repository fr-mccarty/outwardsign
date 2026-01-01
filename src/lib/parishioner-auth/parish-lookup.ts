'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface ParishInfo {
  id: string
  name: string
  slug: string
  city: string
  state: string | null
}

/**
 * Look up a parish by its slug
 * Returns null if parish not found
 */
export async function getParishBySlug(slug: string): Promise<ParishInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('parishes')
    .select('id, name, slug, city, state')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    city: data.city,
    state: data.state,
  }
}

/**
 * Get parish info by ID
 */
export async function getParishById(id: string): Promise<ParishInfo | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('parishes')
    .select('id, name, slug, city, state')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    city: data.city,
    state: data.state,
  }
}
