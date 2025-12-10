import { z } from 'zod'

export const createCustomListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
})

export const updateCustomListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
})

export const createCustomListItemSchema = z.object({
  value: z.string().min(1, 'Value is required').max(200, 'Value must be 200 characters or less'),
})

export const updateCustomListItemSchema = z.object({
  value: z.string().min(1, 'Value is required').max(200, 'Value must be 200 characters or less').optional(),
})

export type CreateCustomListData = z.infer<typeof createCustomListSchema>
export type UpdateCustomListData = z.infer<typeof updateCustomListSchema>
export type CreateCustomListItemData = z.infer<typeof createCustomListItemSchema>
export type UpdateCustomListItemData = z.infer<typeof updateCustomListItemSchema>
