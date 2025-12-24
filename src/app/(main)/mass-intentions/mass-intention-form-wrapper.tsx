'use client'

import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { MassIntentionForm } from './mass-intention-form'
import type { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'

interface MassIntentionFormWrapperProps {
  intention?: MassIntentionWithRelations
  title: string
  description: string
}

export function MassIntentionFormWrapper({
  intention,
  title,
  description
}: MassIntentionFormWrapperProps) {
  return (
    <ModuleFormWrapper
      title={title}
      description={description}
      moduleName="Mass Intention"
      viewPath="/mass-intentions"
      entity={intention}
    >
      {({ formId, onLoadingChange }) => (
        <MassIntentionForm
          intention={intention}
          formId={formId}
          onLoadingChange={onLoadingChange}
        />
      )}
    </ModuleFormWrapper>
  )
}
