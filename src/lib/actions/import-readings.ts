'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { readingsData } from '@/lib/data/readings'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export interface ReadingStats {
  totalReadings: number
  categories: string[]
  translations: string[]
}

export async function importReadings(): Promise<ImportResult> {
  const supabase = await createClient()
  
  await ensureJWTClaims()
  const parish_id = await requireSelectedParish()

  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: []
  }

  try {
    // Get existing readings to avoid duplicates
    const { data: existingReadings } = await supabase
      .from('readings')
      .select('pericope, categories')
      .eq('parish_id', parish_id)

    const existingSet = new Set(
      existingReadings?.map(r => `${r.pericope}-${JSON.stringify(r.categories)}`) || []
    )

    // Process each reading from our data
    for (const reading of readingsData) {
      try {
        // Create a unique key for this reading
        const readingKey = `${reading.pericope}-${JSON.stringify(reading.categories)}`
        
        // Skip if already exists
        if (existingSet.has(readingKey)) {
          result.skipped++
          continue
        }

        // Insert the reading
        const { error } = await supabase
          .from('readings')
          .insert({
            parish_id: parish_id,
            pericope: reading.pericope,
            text: reading.text,
            categories: reading.categories,
            language: reading.language || 'English',
            lectionary_id: reading.lectionary_id || null,
            introduction: reading.introduction || null,
            conclusion: reading.conclusion || null
          })

        if (error) {
          result.errors.push(`Failed to import ${reading.pericope}: ${error.message}`)
        } else {
          result.imported++
        }
      } catch (error) {
        result.errors.push(`Error processing ${reading.pericope}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return result
  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getReadingsStats(): Promise<ReadingStats> {
  const supabase = await createClient()
  
  await ensureJWTClaims()
  const parish_id = await requireSelectedParish()

  try {
    const { data: readings, error } = await supabase
      .from('readings')
      .select('categories, language')
      .eq('parish_id', parish_id)

    if (error) {
      throw new Error('Failed to fetch reading statistics')
    }

    const allCategories = new Set<string>()
    const allLanguages = new Set<string>()

    readings?.forEach(reading => {
      if (reading.categories) {
        reading.categories.forEach((cat: string) => allCategories.add(cat))
      }
      if (reading.language) {
        allLanguages.add(reading.language)
      }
    })

    return {
      totalReadings: readings?.length || 0,
      categories: Array.from(allCategories).sort(),
      translations: Array.from(allLanguages).sort()
    }
  } catch (error) {
    throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}