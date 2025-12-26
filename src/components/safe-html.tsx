/**
 * SafeHTML Component
 *
 * A wrapper component for rendering HTML content safely by automatically
 * sanitizing it to prevent XSS attacks.
 *
 * This component should be used instead of dangerouslySetInnerHTML when
 * rendering user-generated or external HTML content.
 *
 * Usage:
 * ```tsx
 * <SafeHTML html={userContent} className="prose" />
 * ```
 *
 * For trusted system-generated content (like CSS from code constants),
 * you can use dangerouslySetInnerHTML directly. But for ANY content that
 * could come from user input or external sources, use this component.
 */

import { sanitizeHTML } from '@/lib/utils/content-processor'

interface SafeHTMLProps {
  /** The HTML content to render (will be sanitized) */
  html: string
  /** Optional className for the wrapper div */
  className?: string
  /** Optional inline styles for the wrapper div */
  style?: React.CSSProperties
}

/**
 * Renders HTML content safely by sanitizing it first.
 *
 * Removes:
 * - Script tags and their content
 * - Event handlers (onclick, onerror, onload, etc.)
 * - javascript:, data:, vbscript: URLs
 * - Dangerous tags (iframe, object, embed, link, form, input, etc.)
 *
 * Allows:
 * - Basic formatting: div, p, span, strong, em, b, i, u, br, hr
 * - Lists: ul, ol, li
 * - Safe inline styles (preserved)
 */
export function SafeHTML({ html, className, style }: SafeHTMLProps) {
  const sanitizedHTML = sanitizeHTML(html)

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}

/**
 * Utility function for sanitizing HTML in non-component contexts.
 * Re-exported from content-processor for convenience.
 */
export { sanitizeHTML } from '@/lib/utils/content-processor'
