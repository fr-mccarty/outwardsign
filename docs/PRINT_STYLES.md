# Print Styles Guide

This document describes the print styling system used in Outward Sign for creating clean, consistent print views across all modules.

## Overview

Print views in Outward Sign follow a consistent pattern:
- **Server components** (no `'use client'` directive)
- **No buttons** (users use browser print shortcut Cmd/Ctrl+P)
- **Open in new tabs** for easy printing without navigating away
- **Shared styles** from centralized constants

## File Locations

- **Print styles constants:** `src/lib/print-styles.ts`
- **Print CSS:** `src/app/print/print.css`
- **Print layout:** `src/app/print/layout.tsx`
- **Print views:** `src/app/print/[module]/[id]/page.tsx`

## Shared Style Constants

Import from `@/lib/print-styles`:

### `PRINT_PAGE_STYLES`

Standard print page styles for clean, button-free print views. Use this for all print pages.

```tsx
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

export default async function PrintPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="my-print-content">
        {/* content */}
      </div>
    </>
  )
}
```

**What it does:**
- Sets page margins (0.75in default)
- White background, black text
- Removes box shadows and border radius from `.print-container`
- Removes padding for clean printing

### `LITURGICAL_RUBRIC_STYLES`

Preserves red liturgical text (rubrics) in print views. Use with `PRINT_PAGE_STYLES` for liturgical content.

```tsx
import { PRINT_PAGE_STYLES, LITURGICAL_RUBRIC_STYLES } from '@/lib/print-styles'

export default async function PrintMassPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `${PRINT_PAGE_STYLES}\n${LITURGICAL_RUBRIC_STYLES}` }} />
      <div className="mass-print-content">
        {liturgyContent}
      </div>
    </>
  )
}
```

### `PRINT_PAGE_MARGIN`

The margin value as a CSS string (e.g., `"0.75in"`). Rarely needed directly since `PRINT_PAGE_STYLES` includes it.

### `WORD_PAGE_MARGIN` / `PDF_PAGE_MARGIN`

Margin values in TWIPS (Word) and points (PDF) for document exports. Used by the renderer system.

## Print View Page Structure

All print views should follow this pattern:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEntityWithRelations } from '@/lib/actions/entities'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintEntityPage({ params }: PageProps) {
  const supabase = await createClient()

  // 1. Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Get params and fetch data
  const { id } = await params
  const entity = await getEntityWithRelations(id)

  if (!entity) {
    notFound()
  }

  // 3. Render with shared styles
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="entity-print-content">
        {/* Print content here */}
      </div>
    </>
  )
}
```

## Combining Styles

When you need multiple style sets, concatenate them:

```tsx
// For liturgical content with rubrics
<style dangerouslySetInnerHTML={{ __html: `${PRINT_PAGE_STYLES}\n${LITURGICAL_RUBRIC_STYLES}` }} />

// For reports (using REPORT_STYLES from report-builders)
import { buildReport, REPORT_STYLES } from '@/lib/report-builders'
<style dangerouslySetInnerHTML={{ __html: `${PRINT_PAGE_STYLES}\n${REPORT_STYLES}` }} />
```

## Opening Print Views in New Tabs

Print views should open in a new tab so users don't lose their place:

```tsx
// In a client component
const handlePrint = () => {
  window.open(`/print/entities/${entityId}`, '_blank')
}
```

The `ExportButtonGroup` and `ExportButtons` components handle this automatically for script exports.

## Print View Routes

Print views are located under `/print/`:

| Module | Route Pattern | Example |
|--------|--------------|---------|
| Groups | `/print/groups/[id]` | `/print/groups/abc-123` |
| People | `/print/people/[id]` | `/print/people/abc-123` |
| Masses | `/print/masses/[id]` | `/print/masses/abc-123` |
| Mass Scripts | `/print/masses/[id]/scripts/[script_id]` | `/print/masses/abc/scripts/def` |
| Event Scripts | `/print/events/[type]/[id]/scripts/[script_id]` | `/print/events/weddings/abc/scripts/def` |
| Mass Intentions | `/print/mass-intentions/[id]` | `/print/mass-intentions/abc-123` |
| Announcements | `/print/announcements/[id]` | `/print/announcements/123` |
| Petitions | `/print/petitions/[id]` | `/print/petitions/abc-123` |
| Weekend Summary | `/print/weekend-summary?date=...` | `/print/weekend-summary?date=2025-01-05` |

## CSS Classes for Print

The print layout (`src/app/print/print.css`) provides utility classes:

| Class | Purpose |
|-------|---------|
| `.page-break` | Force page break before element |
| `.no-break` | Prevent page break inside element |
| `.hide-on-print` | Hide element when printing |
| `.reading-section` | Standard reading section formatting |
| `.reading-title` | Title styling for readings |
| `.reading-text` | Body text for readings |

## Best Practices

1. **Always use server components** - Print views don't need interactivity
2. **Always use shared styles** - Import from `@/lib/print-styles`
3. **No buttons on print pages** - Users know Cmd/Ctrl+P
4. **Open in new tabs** - Don't disrupt the user's workflow
5. **Check authentication** - All print views require auth
6. **Use `notFound()`** - For missing resources
7. **Use content builders** - For complex liturgical content, use the content builder system with `renderHTML()`

## Creating a New Print View

1. Create file at `src/app/print/[module]/[id]/page.tsx`
2. Copy the server component pattern above
3. Import `PRINT_PAGE_STYLES` (add `LITURGICAL_RUBRIC_STYLES` if needed)
4. Add data fetching logic
5. Render content with the `<style>` tag and content wrapper

## Related Documentation

- [RENDERER.md](./RENDERER.md) - HTML/PDF/Word rendering system
- [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) - Script content building
- [CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md) - Section-based content
- [REPORT_BUILDER_SYSTEM.md](./REPORT_BUILDER_SYSTEM.md) - Tabular reports
