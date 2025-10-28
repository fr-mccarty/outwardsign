import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MassIntentionsContent } from '../mass-intentions-content'
import { toast } from 'sonner'

// Mock the actions
jest.mock('@/lib/actions/mass-intentions', () => ({
  getMassIntentions: jest.fn(),
  getMassIntentionsByStatus: jest.fn(),
  deleteMassIntention: jest.fn()
}))

// Mock the auth
jest.mock('@/lib/auth/parish', () => ({
  getCurrentParish: jest.fn()
}))

// Mock the breadcrumbs
jest.mock('@/components/breadcrumb-context', () => ({
  useBreadcrumbs: () => ({
    setBreadcrumbs: jest.fn()
  })
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn()
  })
}))

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

const mockActions = require('@/lib/actions/mass-intentions')
const mockAuth = require('@/lib/auth/parish')

const mockParish = {
  id: 'parish-1',
  name: 'Test Parish',
  city: 'Test City',
  state: 'Test State'
}

const mockIntentions = [
  {
    id: '1',
    mass_offered_for: 'For John Doe',
    donor_name: 'Jane Doe',
    celebrant_name: 'Fr. Smith',
    event_date: '2023-01-02',
    start_time: '09:00:00',
    event_name: 'Sunday Mass',
    amount_donated: 2500,
    status: 'scheduled',
    note: 'Test note'
  },
  {
    id: '2',
    mass_offered_for: 'For Mary Johnson',
    donor_name: 'Bob Johnson',
    celebrant_name: null,
    event_date: null,
    start_time: null,
    event_name: null,
    amount_donated: 1000,
    status: 'unscheduled',
    note: null
  }
]

beforeEach(() => {
  jest.clearAllMocks()
  
  mockAuth.getCurrentParish.mockResolvedValue(mockParish)
  mockActions.getMassIntentions.mockResolvedValue(mockIntentions)
  mockActions.getMassIntentionsByStatus.mockImplementation((status) => {
    return Promise.resolve(mockIntentions.filter(i => i.status === status))
  })
  mockActions.deleteMassIntention.mockResolvedValue(undefined)
})

describe('MassIntentionsContent', () => {
  it('renders loading state initially', () => {
    render(<MassIntentionsContent />)
    
    expect(screen.getByText('Loading Mass intentions...')).toBeInTheDocument()
  })

  it('renders mass intentions list after loading', async () => {
    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('Mass Intentions')).toBeInTheDocument()
      expect(screen.getByText('For John Doe')).toBeInTheDocument()
      expect(screen.getByText('For Mary Johnson')).toBeInTheDocument()
    })
  })

  it('displays different tabs with correct counts', async () => {
    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('All (2)')).toBeInTheDocument()
      expect(screen.getByText('Scheduled (1)')).toBeInTheDocument()
      expect(screen.getByText('Unscheduled (1)')).toBeInTheDocument()
      expect(screen.getByText('Conflicted (0)')).toBeInTheDocument()
    })
  })

  it('shows conflict alert when there are conflicted intentions', async () => {
    const conflictedIntentions = [
      { ...mockIntentions[0], status: 'conflicted' }
    ]
    
    mockActions.getMassIntentionsByStatus.mockImplementation((status) => {
      if (status === 'conflicted') return Promise.resolve(conflictedIntentions)
      return Promise.resolve([])
    })

    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('Attention Required')).toBeInTheDocument()
      expect(screen.getByText(/1 conflicted Mass intention/)).toBeInTheDocument()
    })
  })

  it('handles refresh functionality', async () => {
    render(<MassIntentionsContent />)

    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
    })

    await waitFor(() => {
      expect(mockActions.getMassIntentions).toHaveBeenCalledTimes(2) // Initial load + refresh
      expect(toast.success).toHaveBeenCalledWith('Data refreshed successfully')
    })
  })

  it('handles delete functionality with confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => true)

    render(<MassIntentionsContent />)

    await waitFor(() => {
      // Find the first "More" button and click it
      const moreButtons = screen.getAllByLabelText('More')
      fireEvent.click(moreButtons[0])
    })

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)
    })

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this Mass intention?')
      expect(mockActions.deleteMassIntention).toHaveBeenCalledWith('1')
      expect(toast.success).toHaveBeenCalledWith('Mass intention deleted successfully')
    })

    // Restore window.confirm
    window.confirm = originalConfirm
  })

  it('cancels delete when user clicks cancel', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => false)

    render(<MassIntentionsContent />)

    await waitFor(() => {
      const moreButtons = screen.getAllByLabelText('More')
      fireEvent.click(moreButtons[0])
    })

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)
    })

    expect(mockActions.deleteMassIntention).not.toHaveBeenCalled()

    // Restore window.confirm
    window.confirm = originalConfirm
  })

  it('displays correct status badges', async () => {
    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('Scheduled')).toBeInTheDocument()
      expect(screen.getByText('Unscheduled')).toBeInTheDocument()
    })
  })

  it('formats currency correctly', async () => {
    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('$25.00')).toBeInTheDocument()
      expect(screen.getByText('$10.00')).toBeInTheDocument()
    })
  })

  it('formats dates and times correctly', async () => {
    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('1/2/2023')).toBeInTheDocument()
      expect(screen.getByText('9:00 AM')).toBeInTheDocument()
      expect(screen.getByText('Not scheduled')).toBeInTheDocument()
    })
  })

  it('shows empty state when no intentions exist', async () => {
    mockActions.getMassIntentions.mockResolvedValue([])
    mockActions.getMassIntentionsByStatus.mockResolvedValue([])

    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('No Mass Intentions')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first Mass intention.')).toBeInTheDocument()
    })
  })

  it('shows parish selection message when no parish is selected', async () => {
    mockAuth.getCurrentParish.mockResolvedValue(null)

    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(screen.getByText('No Parish Selected')).toBeInTheDocument()
      expect(screen.getByText('Please select a parish to manage its Mass intentions.')).toBeInTheDocument()
    })
  })

  it('handles error states gracefully', async () => {
    mockActions.getMassIntentions.mockRejectedValue(new Error('Load failed'))

    render(<MassIntentionsContent />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load Mass intentions data')
    })
  })

  it('navigates to correct pages on button clicks', async () => {
    // Mock window.location
    const originalLocation = window.location
    delete window.location
    window.location = { href: '' }

    render(<MassIntentionsContent />)

    await waitFor(() => {
      const newIntentionButton = screen.getByText('New Mass Intention')
      fireEvent.click(newIntentionButton)
      expect(window.location.href).toBe('/mass-intentions/create')

      const calendarButton = screen.getByText('Calendar View')
      fireEvent.click(calendarButton)
      expect(window.location.href).toBe('/mass-intentions/calendar')

      const printButton = screen.getByText('Print Report')
      fireEvent.click(printButton)
      expect(window.location.href).toBe('/mass-intentions-print')
    })

    // Restore window.location
    window.location = originalLocation
  })

  it('switches between tabs correctly', async () => {
    render(<MassIntentionsContent />)

    await waitFor(() => {
      const scheduledTab = screen.getByText('Scheduled (1)')
      fireEvent.click(scheduledTab)
      
      // Should show only scheduled intentions
      expect(screen.getByText('For John Doe')).toBeInTheDocument()
      expect(screen.queryByText('For Mary Johnson')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      const unscheduledTab = screen.getByText('Unscheduled (1)')
      fireEvent.click(unscheduledTab)
      
      // Should show only unscheduled intentions
      expect(screen.getByText('For Mary Johnson')).toBeInTheDocument()
      expect(screen.queryByText('For John Doe')).not.toBeInTheDocument()
    })
  })
})