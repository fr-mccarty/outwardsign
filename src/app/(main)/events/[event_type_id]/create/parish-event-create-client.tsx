'use client'

import React, { useState } from 'react'
import { ParishEventForm } from '../parish-event-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import { PresetPickerDialog } from '@/components/preset-picker-dialog'
import { BookmarkCheck, Settings } from 'lucide-react'
import type { EventTypeWithRelations, EventPreset } from '@/lib/types'

interface ParishEventCreateClientProps {
  eventType: EventTypeWithRelations
  title: string
  description: string
}

export function ParishEventCreateClient({
  eventType,
  title,
  description
}: ParishEventCreateClientProps) {
  const formId = 'dynamic-event-form'
  const [isLoading, setIsLoading] = useState(false)
  const [showPresetPicker, setShowPresetPicker] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<EventPreset | null>(null)

  const handleSelectPreset = (preset: EventPreset) => {
    setSelectedPreset(preset)
    // The ParishEventForm component will handle pre-filling from the preset
  }

  return (
    <>
      <PageContainer
        title={title}
        description={description}
        primaryAction={<SaveButton moduleName={eventType.name} isLoading={isLoading} isEditing={false} form={formId} />}
        additionalActions={[
          {
            type: 'action',
            label: 'Create from Preset',
            icon: <BookmarkCheck className="h-4 w-4" />,
            onClick: () => setShowPresetPicker(true)
          },
          {
            type: 'action',
            label: 'Edit Event Type',
            icon: <Settings className="h-4 w-4" />,
            href: `/settings/event-types/${eventType.slug}`
          }
        ]}
      >
        <ParishEventForm
          eventType={eventType}
          formId={formId}
          onLoadingChange={setIsLoading}
          presetData={selectedPreset?.preset_data}
        />
      </PageContainer>

      <PresetPickerDialog
        eventTypeId={eventType.id}
        open={showPresetPicker}
        onOpenChange={setShowPresetPicker}
        onSelectPreset={handleSelectPreset}
      />
    </>
  )
}
