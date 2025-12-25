'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  isDirty: boolean
  message?: string
}

interface UseUnsavedChangesReturn {
  /** Whether navigation is being blocked */
  isBlocking: boolean
  /** Whether the confirmation dialog should be shown */
  showDialog: boolean
  /** The pending navigation href (if any) */
  pendingHref: string | null
  /** Call this to attempt navigation - will show dialog if dirty */
  handleNavigation: (href: string) => void
  /** Call this when user confirms they want to leave */
  confirmNavigation: () => void
  /** Call this when user cancels leaving */
  cancelNavigation: () => void
}

/**
 * Hook for managing unsaved changes warnings.
 *
 * Handles:
 * - Browser back/forward navigation (beforeunload event)
 * - Tab/window close (beforeunload event)
 * - In-app navigation via CancelButton or other links
 *
 * @example
 * const { formState: { isDirty } } = useForm(...)
 * const unsavedChanges = useUnsavedChanges({ isDirty })
 *
 * // Pass to CancelButton:
 * <CancelButton
 *   href="/people"
 *   isDirty={isDirty}
 *   onNavigate={unsavedChanges.handleNavigation}
 * />
 *
 * // Render dialog:
 * <UnsavedChangesDialog
 *   open={unsavedChanges.showDialog}
 *   onConfirm={unsavedChanges.confirmNavigation}
 *   onCancel={unsavedChanges.cancelNavigation}
 * />
 */
export function useUnsavedChanges({
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  // Handle browser back/forward and tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return

      e.preventDefault()
      // Modern browsers ignore custom messages, but we set it for older ones
      e.returnValue = message
      return message
    }

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty, message])

  // Handle in-app navigation attempts
  const handleNavigation = useCallback((href: string) => {
    if (isDirty) {
      setPendingHref(href)
      setShowDialog(true)
    } else {
      router.push(href)
    }
  }, [isDirty, router])

  // Confirm navigation - user chose to leave
  const confirmNavigation = useCallback(() => {
    setShowDialog(false)
    if (pendingHref) {
      router.push(pendingHref)
      setPendingHref(null)
    }
  }, [pendingHref, router])

  // Cancel navigation - user chose to stay
  const cancelNavigation = useCallback(() => {
    setShowDialog(false)
    setPendingHref(null)
  }, [])

  return {
    isBlocking: isDirty,
    showDialog,
    pendingHref,
    handleNavigation,
    confirmNavigation,
    cancelNavigation,
  }
}
