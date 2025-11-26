import { z } from 'zod'
import { LITURGICAL_LANGUAGE_VALUES } from '@/lib/constants'

// Create reading schema
export const createReadingSchema = z.object({
  pericope: z.string().min(1, 'Pericope is required'),
  text: z.string().min(1, 'Reading text is required'),
  introduction: z.string().optional(),
  conclusion: z.string().optional(),
  categories: z.array(z.string()).optional(),
  language: z.enum(LITURGICAL_LANGUAGE_VALUES).optional(),
})

// Update reading schema (all fields optional except those with specific validation)
export const updateReadingSchema = z.object({
  pericope: z.string().min(1, 'Pericope is required').optional(),
  text: z.string().min(1, 'Reading text is required').optional(),
  introduction: z.string().optional(),
  conclusion: z.string().optional(),
  categories: z.array(z.string()).optional(),
  language: z.enum(LITURGICAL_LANGUAGE_VALUES).optional(),
})

// Export types using z.infer
export type CreateReadingData = z.infer<typeof createReadingSchema>
export type UpdateReadingData = z.infer<typeof updateReadingSchema>
