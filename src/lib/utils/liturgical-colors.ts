import { LITURGICAL_CALENDAR_API_COLOR_MAPPING } from '@/lib/constants'

/**
 * Get the CSS variable name for a liturgical color from the API
 * @param apiColor - Color string from liturgical calendar API (e.g., 'white', 'red', 'purple')
 * @returns CSS variable name (e.g., 'liturgy-white') or null if not found
 */
export function getLiturgicalCssVar(apiColor: string): string | null {
  const normalized = apiColor.toLowerCase()
  return LITURGICAL_CALENDAR_API_COLOR_MAPPING[normalized] || null
}

/**
 * Get Tailwind background classes for a liturgical color
 * @param apiColor - Color string from liturgical calendar API (can be empty/null)
 * @param opacity - Optional opacity value (e.g., 10 for 10%, 50 for 50%)
 * @returns Tailwind classes string (with fallback to 'bg-muted')
 */
export function getLiturgicalBgClass(apiColor: string | null | undefined, opacity?: number): string {
  if (!apiColor) return 'bg-muted'

  const cssVar = getLiturgicalCssVar(apiColor)
  if (!cssVar) return 'bg-muted'

  if (opacity) {
    return `bg-${cssVar}/${opacity}`
  }
  return `bg-${cssVar}`
}

/**
 * Get Tailwind text color classes for a liturgical color
 * @param apiColor - Color string from liturgical calendar API (can be empty/null)
 * @returns Tailwind classes string (with fallback to 'text-muted-foreground')
 */
export function getLiturgicalTextClass(apiColor: string | null | undefined): string {
  if (!apiColor) return 'text-muted-foreground'

  const cssVar = getLiturgicalCssVar(apiColor)
  return cssVar ? `text-${cssVar}-foreground` : 'text-muted-foreground'
}

/**
 * Get combined background and text classes for a liturgical color
 * @param apiColor - Color string from liturgical calendar API (can be empty/null)
 * @param bgOpacity - Optional background opacity value
 * @returns Tailwind classes string (with fallback to 'bg-muted/50 text-foreground')
 */
export function getLiturgicalColorClasses(apiColor: string | null | undefined, bgOpacity?: number): string {
  if (!apiColor) {
    return bgOpacity ? `bg-muted/${bgOpacity} text-foreground` : 'bg-muted/50 text-foreground'
  }

  const bgClass = getLiturgicalBgClass(apiColor, bgOpacity)
  const textClass = getLiturgicalTextClass(apiColor)
  return `${bgClass} ${textClass}`
}

/**
 * Get CSS variable value for inline styles (for borders, etc.)
 * @param apiColor - Color string from liturgical calendar API
 * @returns CSS variable reference (e.g., 'var(--liturgy-red)') or fallback color
 */
export function getLiturgicalCssVarValue(apiColor: string): string {
  const cssVar = getLiturgicalCssVar(apiColor)
  return cssVar ? `var(--${cssVar})` : 'rgb(156, 163, 175)'
}
