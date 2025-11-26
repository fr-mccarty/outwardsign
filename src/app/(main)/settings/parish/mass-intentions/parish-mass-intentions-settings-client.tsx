'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { ListCard } from '@/components/list-card'
import { FormSectionCard } from '@/components/form-section-card'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FormInput } from '@/components/form-input'
import { Trash2 } from "lucide-react"
import { updateParishSettings } from '@/lib/actions/setup'
import { Parish, ParishSettings } from '@/lib/types'
import { toast } from 'sonner'

interface ParishMassIntentionsSettingsClientProps {
  parish: Parish
  parishSettings: ParishSettings | null
}

interface QuickAmount {
  amount: number
  label: string
}

export function ParishMassIntentionsSettingsClient({
  parish,
  parishSettings
}: ParishMassIntentionsSettingsClientProps) {
  const router = useRouter()
  const [quickAmountsData, setQuickAmountsData] = useState<QuickAmount[]>(
    parishSettings?.mass_intention_offering_quick_amount && parishSettings.mass_intention_offering_quick_amount.length > 0
      ? parishSettings.mass_intention_offering_quick_amount
      : [
        { amount: 100, label: '$1' },
        { amount: 200, label: '$2' },
        { amount: 500, label: '$5' }
      ]
  )
  const [saving, setSaving] = useState(false)

  const saveQuickAmounts = async (newData: QuickAmount[]) => {
    setSaving(true)
    try {
      await updateParishSettings(parish.id, {
        mass_intention_offering_quick_amount: newData
      })
      toast.success('Quick amounts saved')
      router.refresh()
    } catch (error) {
      console.error('Error saving quick amounts:', error)
      toast.error('Failed to save quick amounts')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickAmountChange = (index: number, field: 'amount' | 'label', value: string | number) => {
    const newData = quickAmountsData.map((item, i) =>
      i === index ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item
    )
    setQuickAmountsData(newData)
  }

  const handleBlur = () => {
    saveQuickAmounts(quickAmountsData)
  }

  const addQuickAmount = () => {
    const newData = [
      ...quickAmountsData,
      { amount: 1000, label: '$10' }
    ]
    setQuickAmountsData(newData)
    saveQuickAmounts(newData)
  }

  const removeQuickAmount = (index: number) => {
    if (quickAmountsData.length <= 1) return
    const newData = quickAmountsData.filter((_, i) => i !== index)
    setQuickAmountsData(newData)
    saveQuickAmounts(newData)
  }

  const renderQuickAmountItem = (quickAmount: QuickAmount, index: number) => (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1 grid grid-cols-2 gap-4">
        <FormInput
          id={`amount-${index}`}
          label="Amount (cents)"
          inputType="number"
          value={quickAmount.amount.toString()}
          onChange={(value) => handleQuickAmountChange(index, 'amount', parseInt(value) || 0)}
          onBlur={handleBlur}
          placeholder="100"
          description={`$${(quickAmount.amount / 100).toFixed(2)}`}
          min="1"
          step="1"
        />
        <FormInput
          id={`label-${index}`}
          label="Display Label"
          value={quickAmount.label}
          onChange={(value) => handleQuickAmountChange(index, 'label', value)}
          onBlur={handleBlur}
          placeholder="$1"
          description="Text shown on button"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => removeQuickAmount(index)}
        disabled={quickAmountsData.length <= 1 || saving}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <PageContainer
      title="Mass Intentions Settings"
      description="Configure quick amount buttons for Mass intention offerings"
    >
      <div className="space-y-6">
        <ListCard
          title="Quick Amounts"
          description="Configure the quick amount buttons that appear when entering Mass intention offerings. Amounts are stored in cents for precise calculations."
          items={quickAmountsData.map((item, index) => ({ ...item, index }))}
          renderItem={(item) => renderQuickAmountItem(item, item.index)}
          getItemId={(item) => `quick-amount-${item.index}`}
          onAdd={addQuickAmount}
          addButtonLabel="Add Quick Amount"
          emptyMessage="No quick amounts configured."
        />

        <FormSectionCard title="Preview">
          <div className="flex gap-2 flex-wrap">
            {quickAmountsData.map((quickAmount, index) => (
              <Badge key={index} variant="outline">
                {quickAmount.label}
              </Badge>
            ))}
          </div>
        </FormSectionCard>
      </div>
    </PageContainer>
  )
}
