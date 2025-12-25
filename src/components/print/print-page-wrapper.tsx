/**
 * PrintPageWrapper
 *
 * Unified wrapper component for all print views. Provides consistent:
 * - Page margins and sizing
 * - White background for print
 * - Container styling (max-width, padding)
 * - Print-specific CSS
 *
 * Usage:
 * ```tsx
 * <PrintPageWrapper>
 *   {content}
 * </PrintPageWrapper>
 * ```
 *
 * With HTML content:
 * ```tsx
 * <PrintPageWrapper htmlContent={htmlString} />
 * ```
 *
 * With additional styles:
 * ```tsx
 * <PrintPageWrapper additionalStyles={LITURGICAL_RUBRIC_STYLES}>
 *   {content}
 * </PrintPageWrapper>
 * ```
 */

import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

interface PrintPageWrapperProps {
  /** React children to render inside the wrapper */
  children?: React.ReactNode
  /** Raw HTML content to render (alternative to children) */
  htmlContent?: string
  /** Additional CSS styles to include (e.g., LITURGICAL_RUBRIC_STYLES) */
  additionalStyles?: string
}

export function PrintPageWrapper({
  children,
  htmlContent,
  additionalStyles,
}: PrintPageWrapperProps) {
  const combinedStyles = additionalStyles
    ? `${PRINT_PAGE_STYLES}\n${additionalStyles}`
    : PRINT_PAGE_STYLES

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: combinedStyles }} />
      <div className="print-page-content">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          children
        )}
      </div>
    </>
  )
}
