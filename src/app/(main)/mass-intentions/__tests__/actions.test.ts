import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { createClient } from '@/lib/supabase/server'
import { 
  getMassIntentions,
  getMassIntentionById,
  getMassIntentionsByStatus,
  createMassIntention,
  updateMassIntention,
  deleteMassIntention,
  checkLiturgicalEventAvailability,
  getAvailableLiturgicalEvents
} from '@/lib/actions/mass-intentions'

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
  gte: jest.fn(() => mockSupabase),
  lte: jest.fn(() => mockSupabase),
  ilike: jest.fn(() => mockSupabase),
  in: jest.fn(() => mockSupabase),
  order: jest.fn(() => mockSupabase),
  single: jest.fn(),
  insert: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  delete: jest.fn(() => mockSupabase)
}

const mockUser = {
  user: {
    id: 'test-user-id'
  }
}

const mockUserSettings = {
  selected_parish_id: 'test-parish-id'
}

const mockMassIntention = {
  id: 'test-intention-id',
  created_at: '2023-01-01T00:00:00.000Z',
  parish_id: 'test-parish-id',
  mass_offered_for: 'For John Doe',
  donor_id: 'test-donor-id',
  offered_by_id: 'test-minister-id',
  date_requested: '2023-01-01',
  scheduled_at: '2023-01-02T09:00:00.000Z',
  liturgical_event_id: 'test-event-id',
  amount_donated: 2500, // $25.00
  note: 'Test note',
  received_at: '2023-01-01T10:00:00.000Z',
  status: 'scheduled'
}

const mockMassIntentionWithDetails = {
  ...mockMassIntention,
  event_name: 'Sunday Mass',
  event_date: '2023-01-02',
  start_time: '09:00:00',
  end_time: '10:00:00',
  location: 'Main Church',
  event_description: 'Sunday Morning Mass',
  donor_name: 'Jane Doe',
  celebrant_name: 'Fr. Smith'
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
})

describe('Mass Intentions Actions', () => {
  describe('getMassIntentions', () => {
    it('should fetch all mass intentions for the user\'s parish', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserSettings,
        error: null
      })
      
      // Mock mass intentions query
      mockSupabase.single.mockResolvedValueOnce({
        data: [mockMassIntentionWithDetails],
        error: null
      })

      const result = await getMassIntentions()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_settings')
      expect(mockSupabase.from).toHaveBeenCalledWith('mass_intentions_with_events')
      expect(mockSupabase.eq).toHaveBeenCalledWith('parish_id', 'test-parish-id')
      expect(result).toEqual([mockMassIntentionWithDetails])
    })

    it('should throw error if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      await expect(getMassIntentions()).rejects.toThrow('Unauthorized')
    })

    it('should throw error if no parish is selected', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { selected_parish_id: null },
        error: null
      })

      await expect(getMassIntentions()).rejects.toThrow('No parish selected')
    })
  })

  describe('getMassIntentionById', () => {
    it('should fetch a specific mass intention by ID', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockMassIntentionWithDetails,
        error: null
      })

      const result = await getMassIntentionById('test-intention-id')

      expect(mockSupabase.from).toHaveBeenCalledWith('mass_intentions_with_events')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-intention-id')
      expect(result).toEqual(mockMassIntentionWithDetails)
    })

    it('should return null if mass intention not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      })

      const result = await getMassIntentionById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('getMassIntentionsByStatus', () => {
    it('should fetch mass intentions by status', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserSettings,
        error: null
      })
      
      // Mock mass intentions query
      mockSupabase.single.mockResolvedValueOnce({
        data: [mockMassIntentionWithDetails],
        error: null
      })

      const result = await getMassIntentionsByStatus('scheduled')

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'scheduled')
      expect(result).toEqual([mockMassIntentionWithDetails])
    })

    it('should handle unscheduled status', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserSettings,
        error: null
      })
      
      // Mock mass intentions query
      mockSupabase.single.mockResolvedValueOnce({
        data: [],
        error: null
      })

      const result = await getMassIntentionsByStatus('unscheduled')

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'unscheduled')
      expect(result).toEqual([])
    })
  })

  describe('createMassIntention', () => {
    it('should create a new mass intention', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserSettings,
        error: null
      })
      
      // Mock liturgical event availability check
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null
      })
      
      // Mock insert
      mockSupabase.single.mockResolvedValueOnce({
        data: mockMassIntention,
        error: null
      })

      const formData = new FormData()
      formData.append('mass_offered_for', 'For John Doe')
      formData.append('donor_id', 'test-donor-id')
      formData.append('amount_donated', '25.00')
      formData.append('liturgical_event_id', 'test-event-id')
      formData.append('status', 'scheduled')

      await createMassIntention(formData)

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          mass_offered_for: 'For John Doe',
          donor_id: 'test-donor-id',
          amount_donated: 2500,
          liturgical_event_id: 'test-event-id',
          status: 'scheduled',
          parish_id: 'test-parish-id'
        })
      )
    })

    it('should throw error if liturgical event is already taken', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserSettings,
        error: null
      })
      
      // Mock liturgical event availability check - event is taken
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'existing-intention-id' },
        error: null
      })

      const formData = new FormData()
      formData.append('mass_offered_for', 'For John Doe')
      formData.append('liturgical_event_id', 'test-event-id')

      await expect(createMassIntention(formData)).rejects.toThrow(
        'This liturgical event already has a mass intention assigned'
      )
    })
  })

  describe('updateMassIntention', () => {
    it('should update an existing mass intention', async () => {
      // Mock liturgical event availability check
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null
      })
      
      // Mock update
      mockSupabase.single.mockResolvedValueOnce({
        data: mockMassIntention,
        error: null
      })

      const formData = new FormData()
      formData.append('id', 'test-intention-id')
      formData.append('mass_offered_for', 'For Jane Doe')
      formData.append('amount_donated', '30.00')

      const result = await updateMassIntention(formData)

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          mass_offered_for: 'For Jane Doe',
          amount_donated: 3000
        })
      )
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-intention-id')
      expect(result).toEqual(mockMassIntention)
    })

    it('should throw error if trying to assign taken liturgical event', async () => {
      // Mock liturgical event availability check - event is taken by another intention
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'other-intention-id' },
        error: null
      })

      const formData = new FormData()
      formData.append('id', 'test-intention-id')
      formData.append('liturgical_event_id', 'test-event-id')

      await expect(updateMassIntention(formData)).rejects.toThrow(
        'This liturgical event already has a mass intention assigned'
      )
    })
  })

  describe('deleteMassIntention', () => {
    it('should delete a mass intention', async () => {
      mockSupabase.delete.mockResolvedValue({
        data: null,
        error: null
      })

      await deleteMassIntention('test-intention-id')

      expect(mockSupabase.delete).toHaveBeenCalled()
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-intention-id')
    })

    it('should throw error if deletion fails', async () => {
      mockSupabase.delete.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' }
      })

      await expect(deleteMassIntention('test-intention-id')).rejects.toThrow(
        'Failed to delete mass intention'
      )
    })
  })

  describe('checkLiturgicalEventAvailability', () => {
    it('should return true if liturgical event is available', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await checkLiturgicalEventAvailability('test-event-id')

      expect(mockSupabase.eq).toHaveBeenCalledWith('liturgical_event_id', 'test-event-id')
      expect(result).toBe(true)
    })

    it('should return false if liturgical event is taken', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'existing-intention-id' },
        error: null
      })

      const result = await checkLiturgicalEventAvailability('test-event-id')

      expect(result).toBe(false)
    })
  })

  describe('getAvailableLiturgicalEvents', () => {
    it('should return liturgical events with availability status', async () => {
      // Mock user settings
      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserSettings,
        error: null
      })
      
      // Mock liturgical events query
      mockSupabase.single.mockResolvedValueOnce({
        data: [
          {
            id: 'event-1',
            name: 'Sunday Mass',
            event_date: '2023-01-02',
            start_time: '09:00:00'
          },
          {
            id: 'event-2', 
            name: 'Daily Mass',
            event_date: '2023-01-03',
            start_time: '07:00:00'
          }
        ],
        error: null
      })
      
      // Mock mass intentions query
      mockSupabase.single.mockResolvedValueOnce({
        data: [{ liturgical_event_id: 'event-1' }],
        error: null
      })

      const result = await getAvailableLiturgicalEvents('2023-01-01', '2023-01-07')

      expect(result).toEqual([
        {
          id: 'event-1',
          name: 'Sunday Mass',
          event_date: '2023-01-02',
          start_time: '09:00:00',
          available: false
        },
        {
          id: 'event-2',
          name: 'Daily Mass',
          event_date: '2023-01-03',
          start_time: '07:00:00',
          available: true
        }
      ])
    })
  })
})