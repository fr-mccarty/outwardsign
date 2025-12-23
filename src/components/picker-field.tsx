'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Pencil, ExternalLink } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface BasePickerFieldProps<T> {
  label: string
  value: T | null
  onValueChange: (value: T | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  icon: LucideIcon
  renderValue: (value: T) => ReactNode
  children: ReactNode
  descriptionPosition?: 'before' | 'after'
  displayLayout?: 'single-line' | 'multi-line'
  testId?: string // Optional override for data-testid
  onValueClick?: () => void // Optional custom click handler for the value display
  navigationButton?: ReactNode // Optional navigation button to show between value and clear button (legacy)
  error?: string
  // New: auto-generate navigation button when entityPath is provided
  entityPath?: string // URL path like "/people" - will append /{id} for navigation
  entityName?: string // Display name for confirmation dialog (e.g., "person", "location")
  getId?: (value: T) => string // Function to get ID from value for navigation
}

export function PickerField<T>({
  label,
  value,
  onValueChange,
  onShowPickerChange,
  description,
  placeholder,
  required = false,
  icon: Icon,
  renderValue,
  children,
  descriptionPosition = 'after',
  displayLayout = 'single-line',
  testId,
  onValueClick,
  navigationButton,
  error,
  entityPath,
  entityName,
  getId,
}: BasePickerFieldProps<T>) {
  const labelId = testId || label.toLowerCase().replace(/\s+/g, '-')
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)
  const router = useRouter()
  const t = useTranslations('common')

  const displayPlaceholder = placeholder || t('select')

  // Auto-generated navigation button when entityPath is provided
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value && entityPath && getId) {
      router.push(`${entityPath}/${getId(value)}`)
    }
    setShowNavigateConfirm(false)
  }

  // Use provided navigationButton or auto-generate one if entityPath is set
  const resolvedNavigationButton = navigationButton ?? (entityPath && getId && value ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleNavigate}
      title={`View ${entityName || label.toLowerCase()} details`}
      data-testid={`${labelId}-view-details`}
    >
      <ExternalLink className="h-4 w-4" />
    </Button>
  ) : null)

  const handleValueClick = () => {
    if (onValueClick) {
      onValueClick()
    } else {
      onShowPickerChange(true)
    }
  }

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true)
  }

  const confirmRemove = () => {
    onValueChange(null)
    setShowRemoveConfirm(false)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={labelId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {descriptionPosition === 'before' && description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {value ? (
        displayLayout === 'single-line' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleValueClick}
              className={cn(
                "flex-1 flex items-center justify-between p-3 border rounded-md bg-muted/50 hover:bg-muted transition-colors text-left",
                error && "border-destructive"
              )}
              data-testid={`${labelId}-selected-value`}
            >
              <span className="text-sm">{renderValue(value)}</span>
              <Pencil className="h-4 w-4 text-muted-foreground ml-2" />
            </button>
            {resolvedNavigationButton}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveClick}
              data-testid={`${labelId}-clear`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleValueClick}
              className={cn(
                "flex-1 p-3 border rounded-md bg-muted/50 hover:bg-muted transition-colors text-left",
                error && "border-destructive"
              )}
              data-testid={`${labelId}-selected-value`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">{renderValue(value)}</div>
                <Pencil className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </button>
            {resolvedNavigationButton}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveClick}
              data-testid={`${labelId}-clear`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => onShowPickerChange(true)}
          className={cn(
            "w-full justify-start",
            error && "border-destructive dark:border-destructive"
          )}
          data-testid={`${labelId}-trigger`}
        >
          <Icon className="h-4 w-4 mr-2" />
          {displayPlaceholder}
        </Button>
      )}

      {descriptionPosition === 'after' && description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Picker Modal - passed as children */}
      {children}

      {/* Remove confirmation dialog */}
      <ConfirmationDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        onConfirm={confirmRemove}
        title="Remove Selection?"
        description={`Are you sure you want to remove the selected ${label.toLowerCase()}? This will not delete the ${label.toLowerCase()} itself, only remove it from this field.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />

      {/* Navigation confirmation dialog (auto-generated when entityPath is set) */}
      {entityPath && (
        <ConfirmationDialog
          open={showNavigateConfirm}
          onOpenChange={setShowNavigateConfirm}
          onConfirm={confirmNavigate}
          title={`Navigate to ${entityName || label} Details?`}
          description={`You will be taken to the ${(entityName || label).toLowerCase()}'s detail page. Any unsaved changes on this form will be lost.`}
          confirmLabel={`Go to ${entityName || label}`}
          cancelLabel="Cancel"
        />
      )}
    </div>
  )
}
