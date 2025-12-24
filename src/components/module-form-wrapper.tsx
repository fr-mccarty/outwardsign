'use client'

import React, { useState, ReactNode } from 'react'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'

interface BaseModuleFormWrapperProps {
  /** Page title displayed in header */
  title: string
  /** Page description displayed below title */
  description: string
  /** Module name for button text (e.g., "Event", "Person", "Mass Intention") */
  moduleName: string
  /** Entity being edited (if present, enables "View X" action) */
  entity?: { id: string }
  /** Base path for view action and cancel navigation (e.g., "/events", "/people") */
  viewPath: string
  /** Content to display before the form (e.g., Alert, explanatory text) */
  beforeContent?: ReactNode
}

interface HeaderButtonsProps extends BaseModuleFormWrapperProps {
  /** Where to place the save/cancel buttons */
  buttonPlacement?: 'header'
  /** Render prop for form content - receives formId and loading state handler */
  children: (props: {
    formId: string
    onLoadingChange: (loading: boolean) => void
  }) => ReactNode
}

interface InlineButtonsProps extends BaseModuleFormWrapperProps {
  /** Where to place the save/cancel buttons */
  buttonPlacement: 'inline'
  /** Render prop for form content - receives loading state and button components */
  children: (props: {
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    SaveButtonComponent: typeof SaveButton
    CancelButtonComponent: typeof CancelButton
    cancelHref: string
  }) => ReactNode
}

type ModuleFormWrapperProps = HeaderButtonsProps | InlineButtonsProps

/**
 * ModuleFormWrapper
 *
 * Unified wrapper for module create/edit forms. Provides:
 * - PageContainer with consistent layout
 * - Loading state management
 * - Support for header buttons (module forms) or inline buttons (settings forms)
 * - Optional "View X" action link when editing
 *
 * @example Header buttons (module forms)
 * ```tsx
 * <ModuleFormWrapper
 *   title="Create Event"
 *   description="Create a new event"
 *   moduleName="Event"
 *   viewPath="/events"
 *   entity={event}
 * >
 *   {({ formId, onLoadingChange }) => (
 *     <EventForm
 *       event={event}
 *       formId={formId}
 *       onLoadingChange={onLoadingChange}
 *     />
 *   )}
 * </ModuleFormWrapper>
 * ```
 *
 * @example Inline buttons (settings forms)
 * ```tsx
 * <ModuleFormWrapper
 *   title="Create Event Type"
 *   description="Create a new event type"
 *   moduleName="Event Type"
 *   viewPath="/settings/events"
 *   buttonPlacement="inline"
 *   beforeContent={<Alert>...</Alert>}
 * >
 *   {({ isLoading, setIsLoading, cancelHref }) => (
 *     <form onSubmit={handleSubmit}>
 *       <ContentCard>
 *         {fields}
 *         <div className="flex gap-2 mt-6">
 *           <CancelButton href={cancelHref} disabled={isLoading}>Cancel</CancelButton>
 *           <SaveButton isLoading={isLoading}>Create</SaveButton>
 *         </div>
 *       </ContentCard>
 *     </form>
 *   )}
 * </ModuleFormWrapper>
 * ```
 */
export function ModuleFormWrapper(props: ModuleFormWrapperProps) {
  const {
    title,
    description,
    moduleName,
    entity,
    viewPath,
    beforeContent,
    buttonPlacement = 'header',
    children,
  } = props

  // Generate formId from module name (e.g., "Mass Intention" -> "mass-intention-form")
  const formId = `${moduleName.toLowerCase().replace(/\s+/g, '-')}-form`
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!entity
  const cancelHref = isEditing && entity ? `${viewPath}/${entity.id}` : viewPath

  // Header buttons mode - SaveButton in PageContainer header
  if (buttonPlacement === 'header') {
    const headerChildren = children as HeaderButtonsProps['children']
    return (
      <PageContainer
        title={title}
        description={description}
        primaryAction={
          <SaveButton
            moduleName={moduleName}
            isLoading={isLoading}
            isEditing={isEditing}
            form={formId}
          />
        }
        additionalActions={
          isEditing
            ? [
                {
                  type: 'action',
                  label: `View ${moduleName}`,
                  href: `${viewPath}/${entity.id}`,
                },
              ]
            : undefined
        }
      >
        {beforeContent}
        {headerChildren({ formId, onLoadingChange: setIsLoading })}
      </PageContainer>
    )
  }

  // Inline buttons mode - buttons rendered inside form
  const inlineChildren = children as InlineButtonsProps['children']
  return (
    <PageContainer
      title={title}
      description={description}
      additionalActions={
        isEditing
          ? [
              {
                type: 'action',
                label: `View ${moduleName}`,
                href: `${viewPath}/${entity.id}`,
              },
            ]
          : undefined
      }
    >
      {beforeContent}
      {inlineChildren({
        isLoading,
        setIsLoading,
        SaveButtonComponent: SaveButton,
        CancelButtonComponent: CancelButton,
        cancelHref,
      })}
    </PageContainer>
  )
}
