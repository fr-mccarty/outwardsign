'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormInput } from '@/components/form-input'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DollarSign, Calculator, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateParishSettings } from '@/lib/actions/setup'
import { toast } from 'sonner'

interface QuickAmount {
  amount: number // in cents
  label: string  // display label like "$1", "$2", "$5"
}

interface OfferingAmountInputProps {
  id?: string
  label?: string
  value: string // dollar amount as string (e.g., "5.00")
  onChange: (value: string) => void
  quickAmounts?: QuickAmount[]
  placeholder?: string
  required?: boolean
  className?: string
  parishId?: string // for saving new quick amounts
  onQuickAmountAdded?: (newQuickAmount: QuickAmount) => void // callback when new amount is added
}

// Helper function to convert cents to dollars
function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2)
}

// Helper function to convert dollars to cents
function dollarsToCents(dollars: string): number {
  const parsed = parseFloat(dollars)
  return isNaN(parsed) ? 0 : Math.round(parsed * 100)
}

// Helper function to format dollar input (ensures proper decimal places)
function formatDollarInput(value: string): string {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '')
  
  // Split by decimal point
  const parts = cleaned.split('.')
  
  // If more than one decimal point, keep only the first
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }
  
  // If there's a decimal part, limit to 2 digits
  if (parts.length === 2) {
    return parts[0] + '.' + parts[1].substring(0, 2)
  }
  
  return cleaned
}

export function OfferingAmountInput({
  id = 'offering-amount',
  label = 'Offering Amount',
  value,
  onChange,
  quickAmounts = [
    { amount: 100, label: '$1' },
    { amount: 200, label: '$2' },
    { amount: 500, label: '$5' }
  ],
  placeholder = '0.00',
  required = false,
  className,
  parishId,
  onQuickAmountAdded
}: OfferingAmountInputProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [savingCustomAmount, setSavingCustomAmount] = useState(false)
  const [optimisticQuickAmounts, setOptimisticQuickAmounts] = useState<QuickAmount[]>([])
  const [pendingQuickAmount, setPendingQuickAmount] = useState<QuickAmount | null>(null)

  // Clear optimistic quick amounts when parent updates the quickAmounts prop
  // This prevents duplicates when the parent re-renders with the new quick amounts
  useEffect(() => {
    setOptimisticQuickAmounts([])
    setPendingQuickAmount(null)
  }, [quickAmounts])

  const handleInputChange = (inputValue: string) => {
    const formatted = formatDollarInput(inputValue)
    onChange(formatted)
  }

  const handleQuickAmountSelect = (quickAmount: QuickAmount) => {
    const dollarValue = centsToDollars(quickAmount.amount)
    onChange(dollarValue)
    setIsPopoverOpen(false)
  }

  const handleAddCustomAmount = () => {
    setShowCustomForm(true)
  }

  const handleSaveCustomAmount = async () => {
    if (!customAmount || parseFloat(customAmount) <= 0) {
      return
    }

    const amountInCents = dollarsToCents(customAmount)
    const label = customLabel.trim() || `$${parseFloat(customAmount).toFixed(2)}`
    const newQuickAmount = { amount: amountInCents, label }
    
    // Use the custom amount immediately (optimistic update)
    onChange(customAmount)
    
    // Add to optimistic quick amounts immediately for UI responsiveness
    setOptimisticQuickAmounts(prev => [...prev, newQuickAmount])
    setPendingQuickAmount(newQuickAmount)
    
    // Save to database if parishId is provided
    if (parishId) {
      setSavingCustomAmount(true)
      try {
        // Get current quick amounts and add the new one
        const updatedQuickAmounts = [...quickAmounts, newQuickAmount]
        
        await updateParishSettings(parishId, {
          mass_intention_offering_quick_amount: updatedQuickAmounts
        })
        
        // Notify parent component about the new quick amount
        onQuickAmountAdded?.(newQuickAmount)
        
        // Clear pending state since save succeeded
        setPendingQuickAmount(null)
        
        toast.success(`Added ${label} to quick amounts`)
      } catch (error) {
        console.error('Error saving quick amount:', error)
        toast.error('Failed to save quick amount')
        
        // Remove from optimistic quick amounts if database save failed
        setOptimisticQuickAmounts(prev => prev.filter(qa => qa.amount !== newQuickAmount.amount || qa.label !== newQuickAmount.label))
        setPendingQuickAmount(null)
      } finally {
        setSavingCustomAmount(false)
      }
    }
    
    // Reset form and close popup
    setCustomAmount('')
    setCustomLabel('')
    setShowCustomForm(false)
    setIsPopoverOpen(false)
  }

  const handleCancelCustomAmount = () => {
    setCustomAmount('')
    setCustomLabel('')
    setShowCustomForm(false)
  }

  // Get the current value in cents for validation/processing
  const getCurrentValueInCents = (): number => {
    return dollarsToCents(value)
  }

  // Combine original quick amounts with optimistic ones for UI
  const allQuickAmounts = [...quickAmounts, ...optimisticQuickAmounts]

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-8"
            required={required}
          />
        </div>
        
        {allQuickAmounts.length > 0 && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              {!showCustomForm ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Quick Amounts
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {allQuickAmounts.map((quickAmount, index) => {
                      const isPending = pendingQuickAmount && 
                        pendingQuickAmount.amount === quickAmount.amount && 
                        pendingQuickAmount.label === quickAmount.label
                      
                      return (
                        <Button
                          key={`${quickAmount.amount}-${quickAmount.label}-${index}`}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-9 px-2 text-xs",
                            isPending && "opacity-60 cursor-not-allowed"
                          )}
                          onClick={() => handleQuickAmountSelect(quickAmount)}
                          disabled={!!isPending}
                        >
                          {quickAmount.label}
                          {isPending && (
                            <div className="h-2 w-2 animate-spin rounded-full border border-background border-t-transparent ml-1" />
                          )}
                        </Button>
                      )
                    })}
                  </div>
                  <div className="pt-2 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full flex items-center gap-2 text-xs"
                      onClick={handleAddCustomAmount}
                    >
                      <Plus className="h-3 w-3" />
                      Add Custom Amount
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Custom Amount</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelCustomAmount}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <FormInput
                      id="custom-amount"
                      label="Amount ($)"
                      value={customAmount}
                      onChange={setCustomAmount}
                      placeholder="5.00"
                      inputType="number"
                      step="0.01"
                      min="0.01"
                      required
                    />
                    
                    <FormInput
                      id="custom-label"
                      label="Button Label (optional)"
                      value={customLabel}
                      onChange={setCustomLabel}
                      placeholder="$5 (auto-generated if empty)"
                      description="How this amount will appear on the quick amount buttons"
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelCustomAmount}
                        disabled={savingCustomAmount}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveCustomAmount}
                        disabled={!customAmount || parseFloat(customAmount) <= 0 || savingCustomAmount}
                        className="flex-1"
                      >
                        {savingCustomAmount ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent mr-1" />
                            Saving...
                          </>
                        ) : (
                          parishId ? 'Save & Use' : 'Use Amount'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      {/* Helper text for validation/conversion */}
      {value && getCurrentValueInCents() > 0 && (
        <p className="text-xs text-muted-foreground">
          Amount: {getCurrentValueInCents()} cents
        </p>
      )}
    </div>
  )
}

// Hook to easily get/set amounts in cents
export function useOfferingAmount(initialValueInCents: number = 0) {
  const [dollarValue, setDollarValue] = useState(() => centsToDollars(initialValueInCents))
  
  const setValueFromCents = (cents: number) => {
    setDollarValue(centsToDollars(cents))
  }
  
  const getValueInCents = (): number => {
    return dollarsToCents(dollarValue)
  }
  
  return {
    dollarValue,
    setDollarValue,
    setValueFromCents,
    getValueInCents
  }
}