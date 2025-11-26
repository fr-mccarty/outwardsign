import { z } from 'zod'

// Create group schema
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').trim(),
  description: z.string().trim().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
})

// Update group schema (all fields optional)
export const updateGroupSchema = createGroupSchema.partial()

// Export types using z.infer
export type CreateGroupData = z.infer<typeof createGroupSchema>
export type UpdateGroupData = z.infer<typeof updateGroupSchema>
