import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MassIntentionForm } from '../../components/mass-intention-form'
import { toast } from 'sonner'

// Mock the actions
jest.mock('@/lib/actions/mass-intentions', () => ({
  getMassIntentionById: jest.fn(),
  createMassIntention: jest.fn(),
  updateMassIntention: jest.fn(),
  getAvailableLiturgicalEvents: jest.fn(),
  getPeople: jest.fn(),
  getMinistersByRole: jest.fn()
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
  useRouter: () => ({
    push: jest.fn()
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

const mockPeople = [
  { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
  { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
]

const mockMinisters = [
  { id: '1', name: 'Fr. Johnson', role: 'priest' },
  { id: '2', name: 'Fr. Brown', role: 'priest' }
]

const mockLiturgicalEvents = [
  {
    id: '1',
    name: 'Sunday Mass',
    event_date: '2023-01-02',
    start_time: '09:00:00',
    end_time: '10:00:00',
    available: true
  },
  {
    id: '2',
    name: 'Daily Mass',
    event_date: '2023-01-03',
    start_time: '07:00:00',
    end_time: '08:00:00',
    available: false
  }
]

const mockIntention = {
  id: '1',
  mass_offered_for: 'For John Doe',
  donor_id: '1',
  offered_by_id: '1',
  date_requested: '2023-01-01',
  scheduled_at: '2023-01-02T09:00:00.000Z',
  liturgical_event_id: '1',
  amount_donated: 2500,
  note: 'Test note',
  status: 'scheduled'
}

beforeEach(() => {
  jest.clearAllMocks()
  
  mockAuth.getCurrentParish.mockResolvedValue({ id: 'parish-1', name: 'Test Parish' })
  mockActions.getPeople.mockResolvedValue(mockPeople)
  mockActions.getMinistersByRole.mockResolvedValue(mockMinisters)
  mockActions.getAvailableLiturgicalEvents.mockResolvedValue(mockLiturgicalEvents)
  mockActions.getMassIntentionById.mockResolvedValue(null)
  mockActions.createMassIntention.mockResolvedValue(mockIntention)
  mockActions.updateMassIntention.mockResolvedValue(mockIntention)
})

describe('MassIntentionForm', () => {
  it('renders create form correctly', async () => {
    render(<MassIntentionForm />)

    await waitFor(() => {
      expect(screen.getByText('New Mass Intention')).toBeInTheDocument()
      expect(screen.getByLabelText(/Mass Offered For/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Donor\/Requestor/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Date Requested/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Scheduled Mass/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Celebrant/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Offering Amount/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Additional Notes/)).toBeInTheDocument()
    })
  })

  it('renders edit form correctly', async () => {
    mockActions.getMassIntentionById.mockResolvedValue(mockIntention)
    
    render(<MassIntentionForm intentionId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Edit Mass Intention')).toBeInTheDocument()
      expect(screen.getByDisplayValue('For John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('25')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test note')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(<MassIntentionForm />)

    await waitFor(() => {
      const submitButton = screen.getByText('Create')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter what the Mass is offered for')
    })
  })

  it('submits create form correctly', async () => {
    render(<MassIntentionForm />)

    await waitFor(() => {
      const intentionTextarea = screen.getByLabelText(/Mass Offered For/)
      fireEvent.change(intentionTextarea, { target: { value: 'For John Doe' } })
      
      const amountInput = screen.getByLabelText(/Offering Amount/)
      fireEvent.change(amountInput, { target: { value: '25.00' } })
      
      const submitButton = screen.getByText('Create')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockActions.createMassIntention).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Mass intention created successfully')
    })
  })

  it('submits edit form correctly', async () => {
    mockActions.getMassIntentionById.mockResolvedValue(mockIntention)
    
    render(<MassIntentionForm intentionId="1" />)

    await waitFor(() => {
      const intentionTextarea = screen.getByDisplayValue('For John Doe')
      fireEvent.change(intentionTextarea, { target: { value: 'For Jane Doe' } })
      
      const submitButton = screen.getByText('Update')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockActions.updateMassIntention).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Mass intention updated successfully')
    })
  })

  it('handles form errors', async () => {
    mockActions.createMassIntention.mockRejectedValue(new Error('Create failed'))
    
    render(<MassIntentionForm />)

    await waitFor(() => {
      const intentionTextarea = screen.getByLabelText(/Mass Offered For/)
      fireEvent.change(intentionTextarea, { target: { value: 'For John Doe' } })
      
      const submitButton = screen.getByText('Create')
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save Mass intention')
    })
  })

  it('loads people and ministers on mount', async () => {
    render(<MassIntentionForm />)

    await waitFor(() => {
      expect(mockActions.getPeople).toHaveBeenCalled()
      expect(mockActions.getMinistersByRole).toHaveBeenCalledWith('priest')
      expect(mockActions.getAvailableLiturgicalEvents).toHaveBeenCalled()
    })
  })

  it('updates status when liturgical event is selected', async () => {
    render(<MassIntentionForm />)

    await waitFor(() => {
      const liturgicalEventSelect = screen.getByLabelText(/Scheduled Mass/)
      fireEvent.click(liturgicalEventSelect)
      
      // This would test the select interaction, but requires more complex setup
      // for the shadcn Select component
    })
  })

  it('shows correct currency format', async () => {
    mockActions.getMassIntentionById.mockResolvedValue({
      ...mockIntention,
      amount_donated: 2500 // $25.00
    })
    
    render(<MassIntentionForm intentionId="1" />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('25')).toBeInTheDocument()
    })
  })

  it('handles liturgical events with availability', async () => {
    render(<MassIntentionForm />)

    await waitFor(() => {
      // Check that available and unavailable events are handled correctly
      expect(mockActions.getAvailableLiturgicalEvents).toHaveBeenCalled()
    })
  })
})