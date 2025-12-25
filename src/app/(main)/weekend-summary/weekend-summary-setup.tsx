'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { DatePickerField } from '@/components/date-picker-field'
import { toLocalDateString } from '@/lib/utils/formatters'

export function WeekendSummarySetup() {
  const router = useRouter()
  const [sundayDate, setSundayDate] = useState<Date>()
  const [includeSacraments, setIncludeSacraments] = useState(true)
  const [includeMasses, setIncludeMasses] = useState(true)
  const [includeMassRoles, setIncludeMassRoles] = useState(true)

  const handleGenerate = () => {
    if (!sundayDate) {
      return
    }

    // Build query string from selections
    const params = new URLSearchParams()
    params.set('date', toLocalDateString(sundayDate))
    if (includeSacraments) params.set('sacraments', 'true')
    if (includeMasses) params.set('masses', 'true')
    if (includeMassRoles) params.set('massRoles', 'true')

    // Navigate to view page with params
    router.push(`/weekend-summary/view?${params.toString()}`)
  }

  return (
    <PageContainer
      title="Weekend Summary"
      description="Generate a summary document of all activities happening on a parish weekend."
    >
      <Card>
        <CardHeader>
          <CardTitle>Configure Weekend Summary</CardTitle>
          <CardDescription>
            Select a Sunday to represent the weekend (Saturday-Sunday) and choose what to include in the summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sunday Date Picker */}
          <DatePickerField
            id="sunday-date"
            label="Sunday Date"
            value={sundayDate}
            onValueChange={setSundayDate}
            placeholder="Select a Sunday"
            description="Select a Sunday to represent the weekend. Only Sundays are selectable."
            disabled={(date) => date.getDay() !== 0}
            closeOnSelect
          />

          {/* Options Checkboxes */}
          <div className="space-y-4">
            <Label>Include in Summary</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sacraments"
                checked={includeSacraments}
                onCheckedChange={(checked) => setIncludeSacraments(checked as boolean)}
              />
              <Label
                htmlFor="sacraments"
                className="text-sm font-normal cursor-pointer"
              >
                Sacraments (Weddings, Baptisms, Funerals, etc.)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="masses"
                checked={includeMasses}
                onCheckedChange={(checked) => setIncludeMasses(checked as boolean)}
              />
              <Label
                htmlFor="masses"
                className="text-sm font-normal cursor-pointer"
              >
                Masses
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mass-roles"
                checked={includeMassRoles}
                onCheckedChange={(checked) => setIncludeMassRoles(checked as boolean)}
              />
              <Label
                htmlFor="mass-roles"
                className="text-sm font-normal cursor-pointer"
              >
                Ministry Assignments (Lectors, Servers, Musicians, etc.)
              </Label>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={!sundayDate}
          >
            Generate Weekend Summary
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
