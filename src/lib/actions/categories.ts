'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'

export interface Category {
  id: string
  parish_id: string
  name: string
  description?: string
  sort_order: number
  created_at: string
}

export interface CreateCategoryData {
  name: string
  description?: string
  sort_order?: number
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  sort_order?: number
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  
  await requireSelectedParish()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }

  return data || []
}

export async function getCategory(id: string): Promise<Category | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Category not found
    }
    console.error('Error fetching category:', error)
    throw new Error('Failed to fetch category')
  }

  return data
}

export async function createCategory(categoryData: CreateCategoryData): Promise<Category> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const selectedParishId = await requireSelectedParish()

  // If no sort_order provided, get the next available sort order
  let sortOrder = categoryData.sort_order
  if (sortOrder === undefined) {
    const { data: maxData } = await supabase
      .from('categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
    
    sortOrder = maxData && maxData.length > 0 ? maxData[0].sort_order + 1 : 0
  }

  const insertData = {
    parish_id: selectedParishId,
    name: categoryData.name.trim(),
    description: categoryData.description?.trim() || null,
    sort_order: sortOrder
  }

  console.log('Creating category with data:', insertData)

  const { data, error } = await supabase
    .from('categories')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating category:', error)
    throw new Error(`Failed to create category: ${error.message}`)
  }

  revalidatePath('/settings/categories')
  return data
}

export async function updateCategory(id: string, categoryData: UpdateCategoryData): Promise<Category> {
  const supabase = await createClient()
  
  await requireSelectedParish()

  const updateData: Record<string, unknown> = {}
  
  if (categoryData.name !== undefined) {
    updateData.name = categoryData.name.trim()
  }
  if (categoryData.description !== undefined) {
    updateData.description = categoryData.description?.trim() || null
  }
  if (categoryData.sort_order !== undefined) {
    updateData.sort_order = categoryData.sort_order
  }

  console.log('Updating category with data:', { id, updateData })

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Supabase error updating category:', error)
    throw new Error(`Failed to update category: ${error.message}`)
  }

  revalidatePath('/settings/categories')
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient()
  
  await requireSelectedParish()

  // Check if category is in use by any readings
  const { data: readingCategories, error: checkError } = await supabase
    .from('reading_categories')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  if (checkError) {
    console.error('Error checking category usage:', checkError)
    throw new Error('Failed to check if category is in use')
  }

  if (readingCategories && readingCategories.length > 0) {
    throw new Error('Cannot delete category that is assigned to readings. Please remove it from all readings first.')
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    throw new Error('Failed to delete category')
  }

  revalidatePath('/settings/categories')
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
  const supabase = await createClient()
  
  await requireSelectedParish()

  // Update sort_order for each category
  const updates = categoryIds.map((id, index) => ({
    id,
    sort_order: index
  }))

  for (const update of updates) {
    const { error } = await supabase
      .from('categories')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id)

    if (error) {
      console.error('Error reordering categories:', error)
      throw new Error('Failed to reorder categories')
    }
  }

  revalidatePath('/settings/categories')
}