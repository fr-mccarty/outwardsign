import { z } from 'zod'

// Schema for updating user settings
export const updateUserSettingsSchema = z.object({
  language: z.enum(['en', 'es', 'fr', 'la']).optional(),
})

export type UpdateUserSettingsData = z.infer<typeof updateUserSettingsSchema>
