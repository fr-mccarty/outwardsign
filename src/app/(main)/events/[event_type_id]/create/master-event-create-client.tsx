'use client'

import React, { useState } from 'react'
import { MasterEventForm } from '../master-event-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { TemplatePickerDialog } from '@/components/template-picker-dialog'
import { BookmarkCheck } from 'lucide-react'
import type { EventTypeWithRelations, MasterEventTemplate } from '@/lib/types'

interface DynamicEventCreateClientProps {
  eventType: EventTypeWithRelations
  title: string
  description: string
}

export function DynamicEventCreateClient({
  eventType,
  title,
  description
}: DynamicEventCreateClientProps) {
  const formId = 'dynamic-event-form'
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MasterEventTemplate | null>(null)

  const handleSelectTemplate = (template: MasterEventTemplate) => {
    setSelectedTemplate(template)
    // The MasterEventForm component will handle pre-filling from the template
  }

  return (
    <>
      <PageContainer
        title={title}
        description={description}
        primaryAction={<ModuleSaveButton moduleName={eventType.name} isLoading={isLoading} isEditing={false} form={formId} />}
        additionalActions={[
          {
            type: 'action',
            label: 'Create from Template',
            icon: <BookmarkCheck className="h-4 w-4" />,
            onClick: () => setShowTemplatePicker(true)
          }
        ]}
      >
        <MasterEventForm
          eventType={eventType}
          formId={formId}
          onLoadingChange={setIsLoading}
          templateData={selectedTemplate?.template_data}
        />
      </PageContainer>

      <TemplatePickerDialog
        eventTypeId={eventType.id}
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  )
}
