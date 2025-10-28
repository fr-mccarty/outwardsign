'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PageContainer } from '@/components/page-container'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { Church, Save, X, Calendar, User, DollarSign, Clock, UserSearch } from 'lucide-react'
import { toast } from 'sonner'
import { 
  getMassIntentionById,
  createMassIntention,
  updateMassIntention,
  getAvailableLiturgicalEvents,
  getMinistersByRole,
  type MassIntentionWithDetails 
} from '@/lib/actions/mass-intentions'
import { PeoplePicker, usePeoplePicker } from '@/components/people-picker'
import { OfferingAmountInput, useOfferingAmount } from '@/components/offering-amount-input'
import { useParishSettings } from '@/hooks/use-parish-settings'
import { getCurrentParish } from '@/lib/auth/parish'
import { type Person } from '@/lib/actions/people'

interface MassIntentionFormProps {
  intentionId?: string
}

interface Minister {
  id: string
  name: string
  role: string
}

interface LiturgicalEvent {
  id: string
  name: string
  event_date: string
  start_time: string
  end_time: string
  available: boolean
}

export function MassIntentionForm({ intentionId }: MassIntentionFormProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [, setIntention] = useState<MassIntentionWithDetails | null>(null)
  const [ministers, setMinisters] = useState<Minister[]>([])
  const [liturgicalEvents, setLiturgicalEvents] = useState<LiturgicalEvent[]>([])
  const [currentParishId, setCurrentParishId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    mass_offered_for: '',
    donor_id: '',
    offered_by_id: '',
    date_requested: '',
    scheduled_at: '',
    liturgical_event_id: '',
    note: '',
    status: 'unscheduled'
  })

  // Use the offering amount hook for proper cents handling
  const offeringAmount = useOfferingAmount(0)
  
  // Get parish settings for quick amounts
  const { quickAmounts, settings } = useParishSettings(currentParishId)
  const [localQuickAmounts, setLocalQuickAmounts] = useState<Array<{amount: number, label: string}>>([])
  
  // Initialize local quick amounts when quickAmounts from settings change
  useEffect(() => {
    setLocalQuickAmounts(quickAmounts)
  }, [quickAmounts.length]) // Only update when length changes to avoid infinite loops

  // People picker hooks
  const donorPicker = usePeoplePicker()
  const celebrantPicker = usePeoplePicker()
  const [selectedDonor, setSelectedDonor] = useState<Person | null>(null)
  const [selectedCelebrant, setSelectedCelebrant] = useState<Person | null>(null)

  const isEditing = Boolean(intentionId)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Mass Intentions", href: "/mass-intentions" },
      { label: isEditing ? "Edit" : "Create" }
    ])
  }, [setBreadcrumbs, isEditing])

  useEffect(() => {
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentionId])

  async function loadInitialData() {
    try {
      setLoading(true)
      
      // Get current parish
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParishId(parish.id)
      }
      
      // Load ministers
      const ministersResult = await getMinistersByRole('priest')
      setMinisters(ministersResult)

      // Load liturgical events for next 3 months
      const today = new Date()
      const threeMonthsLater = new Date(today)
      threeMonthsLater.setMonth(today.getMonth() + 3)
      
      const events = await getAvailableLiturgicalEvents(
        today.toISOString().split('T')[0],
        threeMonthsLater.toISOString().split('T')[0]
      )
      setLiturgicalEvents(events)

      // If editing, load the intention data
      if (intentionId) {
        const intentionData = await getMassIntentionById(intentionId)
        if (intentionData) {
          setIntention(intentionData)
          setFormData({
            mass_offered_for: intentionData.mass_offered_for || '',
            donor_id: intentionData.donor_id || '',
            offered_by_id: intentionData.offered_by_id || '',
            date_requested: intentionData.date_requested || '',
            scheduled_at: intentionData.scheduled_at || '',
            liturgical_event_id: intentionData.liturgical_event_id || '',
            note: intentionData.note || '',
            status: intentionData.status || 'unscheduled'
          })

          // Set offering amount if exists
          if (intentionData.amount_donated) {
            offeringAmount.setValueFromCents(intentionData.amount_donated)
          }

          // Set selected people based on loaded data - we'll load the specific people if needed
          if (intentionData.donor_id) {
            // For now, we'll create a minimal person object and let the picker handle loading details
            // In a real implementation, you might want to load the specific person data
            setSelectedDonor({
              id: intentionData.donor_id,
              parish_id: '',
              first_name: 'Selected',
              last_name: 'Donor',
              email: '',
              phone: '',
              notes: '',
              is_active: true,
              created_at: '',
              updated_at: ''
            })
          }
          
          if (intentionData.offered_by_id) {
            const celebrant = ministersResult.find(m => m.id === intentionData.offered_by_id)
            if (celebrant) {
              // Convert minister to person-like object for consistency
              setSelectedCelebrant({
                id: celebrant.id,
                parish_id: '', // Ministers don't have parish_id in this context
                first_name: celebrant.name.split(' ')[0] || '',
                last_name: celebrant.name.split(' ').slice(1).join(' ') || '',
                email: '',
                phone: '',
                notes: '',
                is_active: true,
                created_at: '',
                updated_at: ''
              })
            }
          }
        }
      } else {
        // Set default date_requested to today for new intentions
        setFormData(prev => ({
          ...prev,
          date_requested: new Date().toISOString().split('T')[0]
        }))
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load form data')
    } finally {
      setLoading(false)
    }
  }

  const handleDonorSelect = (person: Person) => {
    setSelectedDonor(person)
    setFormData(prev => ({ ...prev, donor_id: person.id }))
  }

  const handleCelebrantSelect = (person: Person) => {
    setSelectedCelebrant(person)
    setFormData(prev => ({ ...prev, offered_by_id: person.id }))
  }

  const clearDonorSelection = () => {
    setSelectedDonor(null)
    setFormData(prev => ({ ...prev, donor_id: '' }))
  }

  const clearCelebrantSelection = () => {
    setSelectedCelebrant(null)
    setFormData(prev => ({ ...prev, offered_by_id: '' }))
  }

  const handleQuickAmountAdded = (newQuickAmount: {amount: number, label: string}) => {
    setLocalQuickAmounts(prev => [...prev, newQuickAmount])
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-update status based on liturgical event selection
    if (field === 'liturgical_event_id') {
      if (value) {
        setFormData(prev => ({ ...prev, status: 'scheduled' }))
      } else {
        setFormData(prev => ({ ...prev, status: 'unscheduled' }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.mass_offered_for.trim()) {
      toast.error('Please enter what the Mass is offered for')
      return
    }

    try {
      setSaving(true)
      
      const submitData = new FormData()
      submitData.append('mass_offered_for', formData.mass_offered_for)
      submitData.append('donor_id', formData.donor_id)
      submitData.append('offered_by_id', formData.offered_by_id)
      submitData.append('date_requested', formData.date_requested)
      submitData.append('scheduled_at', formData.scheduled_at)
      submitData.append('liturgical_event_id', formData.liturgical_event_id)
      submitData.append('amount_donated', offeringAmount.getValueInCents().toString())
      submitData.append('note', formData.note)
      submitData.append('status', formData.status)
      
      if (isEditing && intentionId) {
        submitData.append('id', intentionId)
        await updateMassIntention(submitData)
        toast.success('Mass intention updated successfully')
      } else {
        await createMassIntention(submitData)
        toast.success('Mass intention created successfully')
      }
      
      // The server actions will handle the redirect
    } catch (error) {
      console.error('Error saving Mass intention:', error)
      toast.error('Failed to save Mass intention')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/mass-intentions')
  }

  const getEventDisplayName = (event: LiturgicalEvent) => {
    const date = new Date(event.event_date).toLocaleDateString()
    const time = new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
    return `${event.name} - ${date} at ${time}`
  }

  if (loading) {
    return (
      <PageContainer
        title={isEditing ? "Edit Mass Intention" : "Create Mass Intention"}
        description={isEditing ? "Update Mass intention details" : "Add a new Mass intention"}
        maxWidth="2xl"
      >
        <div className="space-y-6">Loading form...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={isEditing ? "Edit Mass Intention" : "Create Mass Intention"}
      description={isEditing ? "Update Mass intention details" : "Add a new Mass intention"}
      maxWidth="2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="h-5 w-5" />
            {isEditing ? "Edit Mass Intention" : "New Mass Intention"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mass Offered For */}
            <div className="space-y-2">
              <Label htmlFor="mass_offered_for" className="text-sm font-medium">
                Mass Offered For *
              </Label>
              <Textarea
                id="mass_offered_for"
                placeholder="e.g., In memory of John Smith, For the health of Mary Johnson..."
                value={formData.mass_offered_for}
                onChange={(e) => handleInputChange('mass_offered_for', e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Donor */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Donor/Requestor
              </Label>
              <div className="flex items-center gap-2">
                {selectedDonor ? (
                  <div className="flex-1 flex items-center justify-between p-3 border border-input rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {selectedDonor.first_name} {selectedDonor.last_name}
                      </span>
                      {selectedDonor.email && (
                        <span className="text-sm text-muted-foreground">
                          ({selectedDonor.email})
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearDonorSelection}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-start"
                    onClick={donorPicker.openPicker}
                  >
                    <UserSearch className="h-4 w-4 mr-2" />
                    Select donor (optional)
                  </Button>
                )}
              </div>
            </div>

            {/* Date Requested */}
            <div className="space-y-2">
              <Label htmlFor="date_requested" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Requested
              </Label>
              <Input
                id="date_requested"
                type="date"
                value={formData.date_requested}
                onChange={(e) => handleInputChange('date_requested', e.target.value)}
              />
            </div>

            {/* Liturgical Event */}
            <div className="space-y-2">
              <Label htmlFor="liturgical_event_id" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduled Mass
              </Label>
              <Select value={formData.liturgical_event_id} onValueChange={(value) => handleInputChange('liturgical_event_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Mass time (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {liturgicalEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id} disabled={!event.available}>
                      <div className="flex items-center gap-2">
                        {getEventDisplayName(event)}
                        {!event.available && (
                          <Badge variant="destructive" className="text-xs">
                            Taken
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Celebrant */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Celebrant
              </Label>
              <div className="flex items-center gap-2">
                {selectedCelebrant ? (
                  <div className="flex-1 flex items-center justify-between p-3 border border-input rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {selectedCelebrant.first_name} {selectedCelebrant.last_name}
                      </span>
                      {selectedCelebrant.email && (
                        <span className="text-sm text-muted-foreground">
                          ({selectedCelebrant.email})
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearCelebrantSelection}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-start"
                    onClick={celebrantPicker.openPicker}
                  >
                    <UserSearch className="h-4 w-4 mr-2" />
                    Select celebrant (optional)
                  </Button>
                )}
              </div>
            </div>

            {/* Amount Donated */}
            <OfferingAmountInput
              id="amount_donated"
              label="Offering Amount"
              value={offeringAmount.dollarValue}
              onChange={offeringAmount.setDollarValue}
              quickAmounts={localQuickAmounts}
              placeholder="0.00"
              parishId={currentParishId || undefined}
              onQuickAmountAdded={handleQuickAmountAdded}
            />

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="note"
                placeholder="Any additional notes or special instructions..."
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={2}
              />
            </div>

            {/* Status (read-only display) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex items-center gap-2">
                {formData.status === 'scheduled' && (
                  <Badge className="bg-green-500">Scheduled</Badge>
                )}
                {formData.status === 'unscheduled' && (
                  <Badge variant="secondary">Unscheduled</Badge>
                )}
                {formData.status === 'conflicted' && (
                  <Badge variant="destructive">Conflicted</Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* People Pickers */}
      <PeoplePicker
        open={donorPicker.open}
        onOpenChange={donorPicker.setOpen}
        onSelect={handleDonorSelect}
        placeholder="Search for a donor..."
        emptyMessage="No people found. You can add a new person."
        selectedPersonId={selectedDonor?.id}
      />

      <PeoplePicker
        open={celebrantPicker.open}
        onOpenChange={celebrantPicker.setOpen}
        onSelect={handleCelebrantSelect}
        placeholder="Search for a celebrant..."
        emptyMessage="No people found. You can add a new person."
        selectedPersonId={selectedCelebrant?.id}
      />
    </PageContainer>
  )
}