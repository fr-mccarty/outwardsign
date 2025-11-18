# Liturgical Colors System

This document describes the liturgical color system used throughout Outward Sign for displaying liturgical calendar events with proper color coding.

## Overview

The liturgical color system provides a centralized way to handle the colors used in the Catholic liturgical calendar (white, red, purple/violet, green, gold, rose, black). All color logic is managed through CSS variables and helper utilities to ensure consistency and maintainability.

## Architecture

### 1. CSS Variables (globals.css)

All liturgical colors are defined as CSS variables in `src/app/globals.css`:

```css
/* Light mode */
:root {
  --liturgy-white: oklch(1 0 0);
  --liturgy-white-foreground: oklch(0.145 0 0);
  --liturgy-red: oklch(0.577 0.245 27.325);
  --liturgy-red-foreground: oklch(1 0 0);
  --liturgy-purple: oklch(0.488 0.243 264.376);
  --liturgy-purple-foreground: oklch(1 0 0);
  --liturgy-green: oklch(0.6 0.118 184.704);
  --liturgy-green-foreground: oklch(1 0 0);
  --liturgy-gold: oklch(0.828 0.189 84.429);
  --liturgy-gold-foreground: oklch(0.145 0 0);
  --liturgy-rose: oklch(0.769 0.188 70.08);
  --liturgy-rose-foreground: oklch(1 0 0);
  --liturgy-black: oklch(0.269 0 0);
  --liturgy-black-foreground: oklch(0.985 0 0);
}

/* Dark mode */
.dark {
  --liturgy-white: oklch(0.97 0 0);
  --liturgy-white-foreground: oklch(0.145 0 0);
  --liturgy-red: oklch(0.704 0.191 22.216);
  --liturgy-red-foreground: oklch(1 0 0);
  --liturgy-purple: oklch(0.627 0.265 303.9);
  --liturgy-purple-foreground: oklch(1 0 0);
  --liturgy-green: oklch(0.696 0.17 162.48);
  --liturgy-green-foreground: oklch(1 0 0);
  --liturgy-gold: oklch(0.828 0.189 84.429);
  --liturgy-gold-foreground: oklch(0.145 0 0);
  --liturgy-rose: oklch(0.769 0.188 70.08);
  --liturgy-rose-foreground: oklch(1 0 0);
  --liturgy-black: oklch(0.398 0 0);
  --liturgy-black-foreground: oklch(0.985 0 0);
}
```

**Key Points:**
- Each color has a base variable and a `-foreground` variant for text color
- Colors are defined using OKLCH color space for better color consistency
- Both light and dark mode values are provided
- Variables are registered in the Tailwind theme for use with utility classes

### 2. API Color Mapping (constants.ts)

The `LITURGICAL_CALENDAR_API_COLOR_MAPPING` constant maps color strings from the liturgical calendar API to our CSS variable names:

```typescript
// src/lib/constants.ts
export const LITURGICAL_CALENDAR_API_COLOR_MAPPING: Record<string, string> = {
  'white': 'liturgy-white',
  'red': 'liturgy-red',
  'purple': 'liturgy-purple',
  'violet': 'liturgy-purple', // violet maps to purple
  'green': 'liturgy-green',
  'gold': 'liturgy-gold',
  'rose': 'liturgy-rose',
  'black': 'liturgy-black'
}
```

**Note:** The API uses both `'purple'` and `'violet'` to refer to the same liturgical color, so both map to `'liturgy-purple'`.

### 3. Helper Utilities (liturgical-colors.ts)

All liturgical color logic is centralized in helper utilities at `src/lib/utils/liturgical-colors.ts`:

#### `getLiturgicalCssVar(apiColor: string): string | null`

Get the CSS variable name for a liturgical color from the API.

```typescript
const varName = getLiturgicalCssVar('red') // Returns: 'liturgy-red'
const varName = getLiturgicalCssVar('violet') // Returns: 'liturgy-purple'
const varName = getLiturgicalCssVar('unknown') // Returns: null
```

#### `getLiturgicalBgClass(apiColor: string | null | undefined, opacity?: number): string`

Get Tailwind background classes for a liturgical color.

```typescript
const bgClass = getLiturgicalBgClass('red') // Returns: 'bg-liturgy-red'
const bgClass = getLiturgicalBgClass('white', 10) // Returns: 'bg-liturgy-white/10'
const bgClass = getLiturgicalBgClass(null) // Returns: 'bg-muted' (fallback)
```

#### `getLiturgicalTextClass(apiColor: string | null | undefined): string`

Get Tailwind text color classes for a liturgical color.

```typescript
const textClass = getLiturgicalTextClass('red') // Returns: 'text-liturgy-red-foreground'
const textClass = getLiturgicalTextClass(null) // Returns: 'text-muted-foreground' (fallback)
```

#### `getLiturgicalColorClasses(apiColor: string | null | undefined, bgOpacity?: number): string`

Get combined background and text classes for a liturgical color.

```typescript
const classes = getLiturgicalColorClasses('red', 10)
// Returns: 'bg-liturgy-red/10 text-liturgy-red-foreground'

const classes = getLiturgicalColorClasses(null)
// Returns: 'bg-muted/50 text-foreground' (fallback)
```

#### `getLiturgicalCssVarValue(apiColor: string): string`

Get CSS variable value for inline styles (useful for borders, etc.).

```typescript
const varValue = getLiturgicalCssVarValue('red')
// Returns: 'var(--liturgy-red)'

const varValue = getLiturgicalCssVarValue('unknown')
// Returns: 'rgb(156, 163, 175)' (fallback gray)
```

**Key Features:**
- All helpers handle `null`, `undefined`, and empty strings gracefully
- Fallback to semantic colors (`bg-muted`, `text-foreground`) when color is unknown
- Case-insensitive color matching
- TypeScript support with proper types

## Usage Examples

### Example 1: Calendar Event Item

```typescript
import { getLiturgicalColorClasses, getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'

export function LiturgicalEventItem({ event }) {
  const primaryColor = event.liturgicalEvent?.event_data?.color?.[0]

  // Get background and text classes
  const colorClasses = getLiturgicalColorClasses(primaryColor, 10)

  return (
    <div className={`rounded p-3 ${colorClasses}`}>
      <h3>{event.title}</h3>

      {/* Border using CSS variable */}
      <div style={{ borderLeft: `4px solid ${getLiturgicalCssVarValue(primaryColor)}` }}>
        Event details...
      </div>
    </div>
  )
}
```

### Example 2: Color Badge

```typescript
import { getLiturgicalBgClass, getLiturgicalTextClass } from '@/lib/utils/liturgical-colors'

export function ColorBadge({ color }: { color: string }) {
  const bgClass = getLiturgicalBgClass(color)
  const textClass = getLiturgicalTextClass(color)

  return (
    <span className={`px-2 py-1 rounded ${bgClass} ${textClass}`}>
      {color}
    </span>
  )
}
```

### Example 3: Multiple Colors (Calendar Bars)

```typescript
import { getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'

export function LiturgicalColorBars({ colors }: { colors: string[] }) {
  return (
    <div className="flex">
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            backgroundColor: getLiturgicalCssVarValue(color),
            width: '6px',
            height: '100%'
          }}
        />
      ))}
    </div>
  )
}
```

## Liturgical Color Meanings

The seven liturgical colors used in the Catholic Church:

| Color | Meaning | Used For |
|-------|---------|----------|
| **White** | Purity, innocence, glory | Christmas, Easter, feasts of the Lord, Mary, angels, and saints who were not martyrs |
| **Red** | Blood, fire, Holy Spirit | Palm Sunday, Good Friday, Pentecost, feasts of martyrs and the Holy Spirit |
| **Purple/Violet** | Penance, preparation | Advent, Lent |
| **Green** | Hope, life, growth | Ordinary Time |
| **Gold** | Glory, celebration | Major solemnities (alternative to white) |
| **Rose** | Joy in the midst of penance | Third Sunday of Advent (Gaudete), Fourth Sunday of Lent (Laetare) |
| **Black** | Mourning, death | Funerals, All Souls' Day (optional) |

## Component Implementation

### Components Using Liturgical Colors

The following components use the liturgical color system:

1. **Calendar Event Items**
   - `src/components/calendar/event-items/liturgical-event-item-day.tsx`
   - `src/components/calendar/event-items/liturgical-event-item-week.tsx`
   - `src/components/calendar/event-items/liturgical-event-item-month.tsx`

2. **Pickers and Modals**
   - `src/components/global-liturgical-event-picker.tsx`
   - `src/components/liturgical-event-modal.tsx`

### Implementation Pattern

All components follow this pattern:

```typescript
import { getLiturgicalColorClasses, getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'

export function MyComponent({ event }) {
  // 1. Extract color from API data
  const colors = event.liturgicalEvent?.event_data?.color || []
  const primaryColor = (colors[0] || event.liturgicalColor || '').toLowerCase()

  // 2. Get color classes (handles null/empty internally)
  const bgStyles = getLiturgicalColorClasses(primaryColor, 10)

  // 3. Use in component
  return (
    <div className={bgStyles}>
      {/* For borders/inline styles */}
      <div style={{ backgroundColor: getLiturgicalCssVarValue(primaryColor) }}>
        Content
      </div>
    </div>
  )
}
```

## Best Practices

### DO:
- ✅ Always use the helper utilities for liturgical colors
- ✅ Use semantic CSS variables (`liturgy-red`, `liturgy-white`, etc.)
- ✅ Let helpers handle null/empty cases (they have fallbacks)
- ✅ Use `getLiturgicalColorClasses()` for most cases (bg + text)
- ✅ Use `getLiturgicalCssVarValue()` for inline styles (borders, backgrounds)

### DON'T:
- ❌ Don't hardcode colors like `bg-red-600` or `bg-white` for liturgical colors
- ❌ Don't manually map API colors to CSS variables in components
- ❌ Don't use `dark:` classes for liturgical colors (CSS variables handle this)
- ❌ Don't add conditional logic for null/empty colors (helpers handle this)

## Testing Dark Mode

To test that liturgical colors work properly in dark mode:

1. Toggle dark mode in the application settings
2. View liturgical calendar events in all three calendar views (day, week, month)
3. Open the liturgical event picker modal
4. Verify colors are visible and accessible in both light and dark modes

## Future Enhancements

Potential future improvements to the liturgical color system:

1. **Color Contrast Checker** - Ensure WCAG AA compliance for all color combinations
2. **Custom Parish Colors** - Allow parishes to customize liturgical color values
3. **Accessibility Mode** - Higher contrast variants for users with visual impairments
4. **Print Styles** - Optimized color rendering for printed liturgical documents

## Related Documentation

- [STYLES.md](./STYLES.md) - General styling guidelines and semantic color tokens
- [LITURGICAL_CALENDAR.md](./LITURGICAL_CALENDAR.md) - Liturgical calendar API integration
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Component library reference
