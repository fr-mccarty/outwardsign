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

  const normalized = apiColor.toLowerCase()

  // Return explicit class names so Tailwind can see them at build time
  const classMap: Record<string, string> = {
    'white': opacity ? `bg-liturgy-white/${opacity}` : 'bg-liturgy-white',
    'red': opacity ? `bg-liturgy-red/${opacity}` : 'bg-liturgy-red',
    'purple': opacity ? `bg-liturgy-purple/${opacity}` : 'bg-liturgy-purple',
    'violet': opacity ? `bg-liturgy-purple/${opacity}` : 'bg-liturgy-purple',
    'green': opacity ? `bg-liturgy-green/${opacity}` : 'bg-liturgy-green',
    'gold': opacity ? `bg-liturgy-gold/${opacity}` : 'bg-liturgy-gold',
    'rose': opacity ? `bg-liturgy-rose/${opacity}` : 'bg-liturgy-rose',
    'black': opacity ? `bg-liturgy-black/${opacity}` : 'bg-liturgy-black',
  }

  return classMap[normalized] || 'bg-muted'
}

/**
 * Get Tailwind text color classes for a liturgical color
 * @param apiColor - Color string from liturgical calendar API (can be empty/null)
 * @returns Tailwind classes string (with fallback to empty string for default text color)
 */
export function getLiturgicalTextClass(apiColor: string | null | undefined): string {
  if (!apiColor) return ''

  const normalized = apiColor.toLowerCase()

  // Return explicit class names so Tailwind can see them at build time
  const classMap: Record<string, string> = {
    'white': 'text-liturgy-white-foreground',
    'red': 'text-liturgy-red-foreground',
    'purple': 'text-liturgy-purple-foreground',
    'violet': 'text-liturgy-purple-foreground',
    'green': 'text-liturgy-green-foreground',
    'gold': 'text-liturgy-gold-foreground',
    'rose': 'text-liturgy-rose-foreground',
    'black': 'text-liturgy-black-foreground',
  }

  return classMap[normalized] || ''
}

/**
 * Get combined background and text classes for a liturgical color
 * @param apiColor - Color string from liturgical calendar API (can be empty/null)
 * @param bgOpacity - Optional background opacity value
 * @returns Tailwind classes string (with fallback to 'bg-muted/50')
 */
export function getLiturgicalColorClasses(apiColor: string | null | undefined, bgOpacity?: number): string {
  if (!apiColor) {
    return bgOpacity ? `bg-muted/${bgOpacity}` : 'bg-muted/50'
  }

  const bgClass = getLiturgicalBgClass(apiColor, bgOpacity)
  const textClass = getLiturgicalTextClass(apiColor)

  return textClass ? `${bgClass} ${textClass}` : bgClass
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
