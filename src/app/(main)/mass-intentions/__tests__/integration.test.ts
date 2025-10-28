import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { createClient } from '@/lib/supabase/server'
import { getMassIntentions, createMassIntention, updateMassIntention } from '@/lib/actions/mass-intentions'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  neq: jest.fn(() => mockSupabase),
  order: jest.fn(() => mockSupabase),
  single: jest.fn(),
  insert: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase)
}

const mockUser = {
  user: {
    id: 'test-user-id'
  }
}

const mockUserSettings = {
  selected_parish_id: 'test-parish-id'
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
})

describe('Mass Intentions Integration Tests', () => {
  describe('Complete Mass Intention Workflow', () => {
    it('should create, read, update, and manage mass intentions', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValue({
        data: mockUserSettings,
        error: null
      })

      // Step 1: Create a mass intention
      const createFormData = new FormData()
      createFormData.append('mass_offered_for', 'For John Doe')
      createFormData.append('donor_id', 'donor-1')
      createFormData.append('amount_donated', '25.00')
      createFormData.append('status', 'unscheduled')

      const createdIntention = {
        id: 'new-intention-id',
        mass_offered_for: 'For John Doe',
        donor_id: 'donor-1',
        amount_donated: 2500,
        status: 'unscheduled',
        parish_id: 'test-parish-id'
      }

      // Mock availability check (no existing intention)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null
      })

      // Mock create
      mockSupabase.single.mockResolvedValueOnce({
        data: createdIntention,
        error: null
      })

      await createMassIntention(createFormData)

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          mass_offered_for: 'For John Doe',
          donor_id: 'donor-1',
          amount_donated: 2500,
          status: 'unscheduled',
          parish_id: 'test-parish-id'
        })
      )

      // Step 2: Read the mass intention
      const intentionWithDetails = {
        ...createdIntention,
        donor_name: 'Jane Doe',
        celebrant_name: null,
        event_name: null,
        event_date: null,
        start_time: null
      }

      mockSupabase.single.mockResolvedValueOnce({
        data: [intentionWithDetails],
        error: null
      })

      const intentions = await getMassIntentions()

      expect(intentions).toContainEqual(intentionWithDetails)
      expect(mockSupabase.from).toHaveBeenCalledWith('mass_intentions_with_events')

      // Step 3: Update the mass intention to schedule it
      const updateFormData = new FormData()
      updateFormData.append('id', 'new-intention-id')
      updateFormData.append('mass_offered_for', 'For John Doe')
      updateFormData.append('liturgical_event_id', 'event-1')
      updateFormData.append('scheduled_at', '2023-01-02T09:00:00.000Z')
      updateFormData.append('status', 'scheduled')

      const updatedIntention = {
        ...createdIntention,
        liturgical_event_id: 'event-1',
        scheduled_at: '2023-01-02T09:00:00.000Z',
        status: 'scheduled'
      }

      // Mock availability check (event is available)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null
      })

      // Mock update
      mockSupabase.single.mockResolvedValueOnce({
        data: updatedIntention,
        error: null
      })

      const result = await updateMassIntention(updateFormData)

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          liturgical_event_id: 'event-1',
          scheduled_at: '2023-01-02T09:00:00.000Z',
          status: 'scheduled'
        })
      )
      expect(result).toEqual(updatedIntention)
    })

    it('should prevent double-booking of liturgical events', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValue({
        data: mockUserSettings,
        error: null
      })

      // Try to create intention with already-taken liturgical event
      const formData = new FormData()
      formData.append('mass_offered_for', 'For Jane Doe')
      formData.append('liturgical_event_id', 'event-1')

      // Mock availability check (event is taken)
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'existing-intention-id' },
        error: null
      })

      await expect(createMassIntention(formData)).rejects.toThrow(
        'This liturgical event already has a mass intention assigned'
      )
    })

    it('should handle mass intention status transitions', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValue({
        data: mockUserSettings,
        error: null
      })

      // Scenario: Unscheduled -> Scheduled
      const formData = new FormData()
      formData.append('id', 'intention-1')
      formData.append('mass_offered_for', 'For John Doe')
      formData.append('liturgical_event_id', 'event-1')
      formData.append('status', 'scheduled')

      // Mock availability check
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null
      })

      // Mock update
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'intention-1',
          status: 'scheduled',
          liturgical_event_id: 'event-1'
        },
        error: null
      })

      const result = await updateMassIntention(formData)

      expect(result.status).toBe('scheduled')
      expect(result.liturgical_event_id).toBe('event-1')
    })

    it('should handle currency conversion correctly', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValue({
        data: mockUserSettings,
        error: null
      })

      const formData = new FormData()
      formData.append('mass_offered_for', 'For John Doe')
      formData.append('amount_donated', '25.50') // $25.50

      // Mock availability check
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null
      })

      // Mock create
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'new-intention-id',
          amount_donated: 2550 // Should be converted to cents
        },
        error: null
      })

      await createMassIntention(formData)

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          amount_donated: 2550 // $25.50 in cents
        })
      )
    })

    it('should validate required fields during creation', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValue({
        data: mockUserSettings,
        error: null
      })

      const formData = new FormData()
      // Missing required field: mass_offered_for
      formData.append('donor_id', 'donor-1')

      await expect(createMassIntention(formData)).rejects.toThrow()
    })

    it('should handle parish-specific data isolation', async () => {
      const parish1Settings = { selected_parish_id: 'parish-1' }
      const parish2Settings = { selected_parish_id: 'parish-2' }

      // Mock user settings for parish 1
      mockSupabase.single.mockResolvedValueOnce({
        data: parish1Settings,
        error: null
      })

      // Mock intentions for parish 1
      mockSupabase.single.mockResolvedValueOnce({
        data: [{ id: 'intention-1', parish_id: 'parish-1' }],
        error: null
      })

      const parish1Intentions = await getMassIntentions()

      // Verify parish filtering is applied
      expect(mockSupabase.eq).toHaveBeenCalledWith('parish_id', 'parish-1')
      expect(parish1Intentions).toHaveLength(1)
      expect(parish1Intentions[0].parish_id).toBe('parish-1')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockUserSettings,
        error: null
      })

      // Mock database error
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      })

      await expect(getMassIntentions()).rejects.toThrow('Failed to fetch mass intentions')
    })

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null } 
      })

      await expect(getMassIntentions()).rejects.toThrow('Unauthorized')
    })

    it('should handle missing parish selection', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { selected_parish_id: null },
        error: null
      })

      await expect(getMassIntentions()).rejects.toThrow('No parish selected')
    })
  })
})