# HTML View Theme Support Requirements

**Date:** 2025-11-30
**Feature:** Theme-aware HTML rendering for content builder modules
**Priority:** Medium
**Complexity:** Low-Medium

---

## Feature Overview

Update the HTML rendering of liturgical content across all content builder modules to properly support light/dark theme toggling in view pages while maintaining white backgrounds in print preview pages.

**Current State:**
- View pages (e.g., `/weddings/[id]`) display liturgical HTML content in a white Card (`bg-white`)
- Print pages (e.g., `/print/weddings/[id]`) force white backgrounds with inline styles
- HTML content does not adapt to user's theme preference in view pages

**Desired State:**
- View pages: HTML content adapts to light/dark theme (uses semantic color tokens)
- Print pages: HTML content maintains white background as "print preview" (no theme support needed)

---

## Technical Scope

### Affected Modules (7 modules with content builders)

Based on TEMPLATE_REGISTRY.md and codebase analysis, the following modules use the liturgical content builder system:

1. **Weddings** - 2 templates (EN, ES)
2. **Funerals** - 2 templates (EN, ES)
3. **Baptisms** - 2 templates (EN, ES)
4. **Presentations** - 3 templates (EN, ES, Bilingual)
5. **Quinceañeras** - 2 templates (EN, ES)
6. **Masses** - 2 templates (EN, ES)
7. **Mass Intentions** - 2 templates (EN, ES)

**Total Templates Affected:** 17 templates across 7 modules

---

## Component Analysis

### 1. HTML Renderer (`src/lib/renderers/html-renderer.tsx`)

**Current Behavior:**
- `applyResolvedStyle()` function converts element styles to inline React CSS
- All colors are hardcoded from `liturgical-script-styles.ts` (e.g., `#000000` for black, `#c41e3a` for liturgical red)
- Returns JSX with inline styles that don't adapt to theme

**Specific Lines:**
```typescript
// Line 29-42: applyResolvedStyle function
function applyResolvedStyle(style: ResolvedStyle): React.CSSProperties {
  return {
    fontSize: `${convert.pointsToPx(style.fontSize)}px`,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    color: style.color,  // ← ISSUE: Hardcoded color values
    textAlign: style.alignment,
    marginTop: `${convert.pointsToPx(style.marginTop)}px`,
    marginBottom: `${convert.pointsToPx(style.marginBottom)}px`,
    lineHeight: style.lineHeight,
    fontFamily: LITURGY_FONT,
    whiteSpace: style.preserveLineBreaks ? 'pre-wrap' : 'normal',
  }
}
```

**Issue:** The `color: style.color` line applies hardcoded hex values (`#000000`, `#c41e3a`) that don't respond to theme changes.

### 2. ModuleViewContainer (`src/components/module-view-container.tsx`)

**Current Behavior:**
- Line 177: `<Card className="bg-white">` hardcodes white background
- This card wraps all liturgical HTML content on view pages
- Does not adapt to dark mode

**Specific Lines:**
```typescript
// Line 177
<Card className="bg-white">
  <CardContent className="p-6 space-y-6">
    {isLoading ? (
      <div className="text-center text-muted-foreground py-8">Loading content...</div>
    ) : (
      liturgyContent  // ← HTML content rendered here
    )}
  </CardContent>
</Card>
```

**Issue:** `bg-white` forces white background in both light and dark modes. Should use `bg-card text-card-foreground` for theme support.

### 3. Print Pages (7 files)

**Current Behavior:**
- Each module has a print page at `/print/[module-plural]/[id]/page.tsx`
- All print pages include inline `<style>` tags that force white backgrounds
- This is CORRECT behavior for print previews - no changes needed

**Files:**
- `/src/app/print/weddings/[id]/page.tsx`
- `/src/app/print/funerals/[id]/page.tsx`
- `/src/app/print/baptisms/[id]/page.tsx`
- `/src/app/print/presentations/[id]/page.tsx`
- `/src/app/print/quinceaneras/[id]/page.tsx`
- `/src/app/print/masses/[id]/page.tsx`
- `/src/app/print/mass-intentions/[id]/page.tsx`

**Example (weddings print page, lines 38-66):**
```typescript
<style dangerouslySetInnerHTML={{ __html: `
  body {
    background: white !important;
    color: black !important;
  }
  .wedding-print-content div {
    color: black !important;
  }
  // ... preserves liturgical red color
`}} />
```

**No Changes Needed:** Print pages should remain white for print preview functionality.

### 4. Liturgical Script Styles (`src/lib/styles/liturgical-script-styles.ts`)

**Current Behavior:**
- Central style system defines all colors in `LITURGY_COLORS` constant
- Colors are resolved to hex values by `resolveElementStyle()`
- Two colors used: `black` (#000000) and `liturgy-red` (#c41e3a)

**Lines 17-20:**
```typescript
export const LITURGY_COLORS = {
  liturgyRed: '#c41e3a',
  black: '#000000',
} as const
```

**Consideration:** This file should remain unchanged as it's the single source of truth for PDF/Word exports which don't need theme support.

---

## UI Implications

### View Pages (Theme-Aware)

**Affected Pages:**
- `/weddings/[id]`
- `/funerals/[id]`
- `/baptisms/[id]`
- `/presentations/[id]`
- `/quinceaneras/[id]`
- `/masses/[id]`
- `/mass-intentions/[id]`

**Behavior:**
1. **Light Mode:** Black text on light background (current behavior maintained)
2. **Dark Mode:** Light text on dark background (NEW behavior)
3. **Liturgical Red:** Preserved in both modes (special handling)

### Print Pages (White Background)

**Affected Pages:**
- `/print/weddings/[id]`
- `/print/funerals/[id]`
- `/print/baptisms/[id]`
- `/print/presentations/[id]`
- `/print/quinceaneras/[id]`
- `/print/masses/[id]`
- `/print/mass-intentions/[id]`

**Behavior:**
- Always white background with black text
- Liturgical red preserved
- No theme support (print preview functionality)
- **NO CHANGES NEEDED**

---

## Implementation Approach

### Option 1: CSS Classes (Recommended)

**Approach:** Replace inline color styles with semantic CSS classes that automatically adapt to theme.

**Changes Required:**

1. **HTML Renderer** (`html-renderer.tsx`)
   - Modify `applyResolvedStyle()` to omit `color` from inline styles
   - Add className logic to apply semantic color classes
   - Return elements with `className` prop instead of inline color

2. **ModuleViewContainer** (`module-view-container.tsx`)
   - Change `bg-white` to `bg-card text-card-foreground border`
   - Ensures card background and text adapt to theme

**Pseudo-code Example:**

```
FUNCTION applyResolvedStyleAsClasses(style)
  RETURN {
    fontSize: convert to pixels,
    fontWeight: bold or normal,
    fontStyle: italic or normal,
    // color: REMOVED - will be handled by className
    textAlign: alignment,
    margins: convert to pixels,
    lineHeight: line height value,
    fontFamily: Helvetica,
    whiteSpace: pre-wrap or normal
  }
END FUNCTION

FUNCTION getColorClass(colorName)
  IF colorName is "black" THEN
    RETURN "text-foreground"  // Adapts to theme
  ELSE IF colorName is "liturgy-red" THEN
    RETURN "text-destructive"  // Destructive is red, adapts to theme
  ELSE
    RETURN "text-foreground"  // Default fallback
  END IF
END FUNCTION

FUNCTION renderElement(element, index)
  SWITCH element.type
    CASE 'section-title':
      style = resolveElementStyle('section-title')
      inlineStyles = applyResolvedStyleAsClasses(style)
      colorClass = getColorClass(style.color)

      RETURN <div className={colorClass} style={inlineStyles}>
        {element.text}
      </div>

    // ... repeat for all element types
  END SWITCH
END FUNCTION
```

**Advantages:**
- Uses Tailwind semantic tokens (automatic dark mode support)
- No changes to print pages needed
- Minimal code changes
- Follows existing STYLES.md patterns

**Disadvantages:**
- Requires updating every element renderer in `html-renderer.tsx`
- Liturgical red maps to `text-destructive` (semantically correct but conceptually different)

### Option 2: CSS Custom Properties (Alternative)

**Approach:** Wrap HTML content in a div with CSS custom properties that adapt to theme.

**Changes Required:**

1. **ModuleViewContainer**
   - Add wrapper div with theme-aware CSS custom properties
   - Set `--liturgy-text-color` and `--liturgy-red-color` based on theme

2. **HTML Renderer**
   - Continue using inline styles but reference CSS custom properties
   - No changes to element renderers

**Pseudo-code Example:**

```
// In ModuleViewContainer
FUNCTION renderLiturgyContent()
  RETURN (
    <div className="liturgy-content" style={{
      "--liturgy-text-color": "var(--foreground)",
      "--liturgy-red-color": "var(--destructive)"
    }}>
      {liturgyContent}
    </div>
  )
END FUNCTION

// In HTML Renderer (minimal changes)
FUNCTION applyResolvedStyle(style)
  RETURN {
    fontSize: convert to pixels,
    fontWeight: bold or normal,
    fontStyle: italic or normal,
    color: IF style.color is "black"
           THEN "var(--liturgy-text-color)"
           ELSE "var(--liturgy-red-color)",
    // ... rest of styles
  }
END FUNCTION
```

**Advantages:**
- Smaller code changes
- Keeps inline style approach
- Easy to add additional theme-aware colors later

**Disadvantages:**
- Less idiomatic for Tailwind/shadcn
- CSS custom properties may not be supported in older browsers
- More complex to debug

---

## Server Actions Implications

**None.** This is purely a client-side rendering concern. No server actions need modification.

---

## Interface Analysis

### Existing Interfaces (No Changes)

All existing TypeScript interfaces remain unchanged:
- `LiturgyDocument` in `src/lib/types/liturgy-content.ts`
- `ResolvedStyle` in `src/lib/styles/liturgical-script-styles.ts`
- `ModuleViewContainerProps` in `src/components/module-view-container.tsx`

**Rationale:** The issue is in how styles are applied, not in the data structures themselves.

---

## Styling Concerns

### Dark Mode Color Mapping

**Standard Text (black → foreground):**
- Light mode: `text-foreground` = near-black
- Dark mode: `text-foreground` = near-white
- Tailwind class: `text-foreground`

**Liturgical Red (red → destructive):**
- Light mode: `text-destructive` = red
- Dark mode: `text-destructive` = lighter red (still visible)
- Tailwind class: `text-destructive`
- Original color: `#c41e3a`

**Card Background:**
- Light mode: `bg-card` = white
- Dark mode: `bg-card` = dark gray
- Tailwind class: `bg-card text-card-foreground border`

### STYLES.md Compliance

From STYLES.md documentation:

```
✅ CORRECT Pattern:
// Standard card
<Card className="bg-card text-card-foreground border">

// Never use hardcoded colors
❌ WRONG: <Card className="bg-white text-black">
```

This feature request aligns with STYLES.md principles:
- Use semantic color tokens
- Never hardcode colors
- Always pair backgrounds with foregrounds

---

## Component Analysis

### Components to Modify

1. **`src/lib/renderers/html-renderer.tsx`**
   - Update `applyResolvedStyle()` function
   - Add color class mapping logic
   - Update all element renderers to use className for colors

2. **`src/components/module-view-container.tsx`**
   - Change line 177: `bg-white` → `bg-card text-card-foreground border`

### Components to NOT Modify

1. **Print pages** (7 files) - Keep current white background behavior
2. **`src/lib/styles/liturgical-script-styles.ts`** - Keep as single source of truth for PDF/Word
3. **PDF/Word renderers** - No changes needed (they don't render to browser)
4. **Content builders** (7 modules) - No changes needed (they generate data structures)

---

## Implementation Locations

### Files to Modify

**1. HTML Renderer**
- File: `/src/lib/renderers/html-renderer.tsx`
- Changes:
  - Line 29-42: Modify `applyResolvedStyle()` to exclude `color` property
  - Add new function: `getColorClassName(colorName: string): string`
  - Update all `renderElement()` switch cases to add className prop
  - Lines affected: ~30 element renderers

**2. ModuleViewContainer**
- File: `/src/components/module-view-container.tsx`
- Changes:
  - Line 177: Change `className="bg-white"` to `className="bg-card text-card-foreground border"`

### Files to NOT Modify

- All 7 print pages in `/src/app/print/*/[id]/page.tsx`
- All content builders in `/src/lib/content-builders/*/`
- Style definition file `/src/lib/styles/liturgical-script-styles.ts`
- PDF renderer `/src/lib/renderers/pdf-renderer.ts`
- Word renderer `/src/lib/renderers/word-renderer.ts`

---

## Documentation Impact

### Files to Update

**1. RENDERER.md** (`/docs/RENDERER.md`)
- Section: "HTML Renderer" (lines 160-240)
- Add documentation about theme-aware color classes
- Document the color mapping (black → foreground, red → destructive)
- Add note about print pages maintaining white backgrounds

**2. STYLES.md** (`/docs/STYLES.md`)
- No updates needed - already documents correct patterns
- This implementation follows existing guidelines

**3. LITURGICAL_SCRIPT_SYSTEM.md** (`/docs/LITURGICAL_SCRIPT_SYSTEM.md`)
- Section: "View Page Integration" (lines 973-1060)
- Add note about theme support in HTML rendering
- Document that print pages remain theme-independent

### User-Facing Documentation

**No changes needed.** This is an internal styling improvement that doesn't affect user workflows or features.

---

## Testing Requirements

### Manual Testing Scenarios

**For Each Module (7 modules):**

1. **View Page - Light Mode**
   - Navigate to entity view page (e.g., `/weddings/[id]`)
   - Verify light background
   - Verify dark text (black text → foreground color)
   - Verify red text (liturgical red → destructive color)

2. **View Page - Dark Mode**
   - Toggle to dark mode via theme switcher
   - Verify dark background
   - Verify light text (black text → light foreground)
   - Verify red text still visible (liturgical red → lighter destructive color)

3. **Print Page - Both Modes**
   - Navigate to print page (e.g., `/print/weddings/[id]`)
   - Verify always white background
   - Verify always black text (except liturgical red)
   - Toggle theme - print page should NOT change

4. **Theme Toggle on View Page**
   - Start in light mode on view page
   - Toggle to dark mode
   - Verify smooth transition
   - Verify all text remains readable
   - Toggle back to light mode
   - Verify returns to original appearance

### Test Cases by Module

| Module | View Page URL | Print Page URL | Templates to Test |
|--------|--------------|----------------|-------------------|
| Weddings | `/weddings/[id]` | `/print/weddings/[id]` | 2 (EN, ES) |
| Funerals | `/funerals/[id]` | `/print/funerals/[id]` | 2 (EN, ES) |
| Baptisms | `/baptisms/[id]` | `/print/baptisms/[id]` | 2 (EN, ES) |
| Presentations | `/presentations/[id]` | `/print/presentations/[id]` | 3 (EN, ES, Bilingual) |
| Quinceañeras | `/quinceaneras/[id]` | `/print/quinceaneras/[id]` | 2 (EN, ES) |
| Masses | `/masses/[id]` | `/print/masses/[id]` | 2 (EN, ES) |
| Mass Intentions | `/mass-intentions/[id]` | `/print/mass-intentions/[id]` | 2 (EN, ES) |

**Total Test Combinations:** 7 modules × 2 modes (light/dark) × 2 page types (view/print) = 28 test scenarios

### Element Type Testing

Test each element type renders correctly in both themes:
- `event-title` (black → foreground)
- `event-datetime` (black → foreground)
- `section-title` (black → foreground)
- `reading-title` (liturgical red → destructive)
- `pericope` (liturgical red → destructive)
- `reader-name` (liturgical red → destructive)
- `introduction` (black → foreground)
- `reading-text` (black → foreground)
- `conclusion` (black → foreground)
- `response-dialogue` (mixed: labels red, text black)
- `presider-dialogue` (mixed: labels red, text black)
- `petition` (mixed: labels red, text black)
- `text` (black → foreground)
- `rubric` (black → foreground)
- `prayer-text` (black → foreground)
- `priest-text` (black → foreground)
- `info-row` (black → foreground)

---

## Security Concerns

**None.** This is a client-side styling change with no security implications.

- No new user input
- No authentication/authorization changes
- No RLS policy changes
- No API modifications
- No data storage changes

---

## Database Changes

**None.** No database schema changes, migrations, or RLS policy updates needed.

---

## Code Reuse & Abstraction

### Rule of Three Assessment

**Not Applicable.** This is a modification to existing code, not new abstraction.

### Shared Code Opportunities

**Color Class Mapping Function:**
A shared helper function `getColorClassName()` will be created in `html-renderer.tsx`:

```
FUNCTION getColorClassName(colorName)
  SWITCH colorName
    CASE 'black':
      RETURN 'text-foreground'
    CASE 'liturgy-red':
      RETURN 'text-destructive'
    DEFAULT:
      RETURN 'text-foreground'
  END SWITCH
END FUNCTION
```

This function will be reused across all element renderers (~30 uses).

**Reusability:** This helper is renderer-specific and should not be shared outside `html-renderer.tsx`.

---

## README Impact

**No changes needed.** This is an internal improvement that doesn't affect the public-facing README or user onboarding.

---

## Estimated Complexity

### Complexity Breakdown

**Low Complexity:**
- ModuleViewContainer change (1 line)
- Color class mapping function (simple switch)

**Medium Complexity:**
- Updating all element renderers in html-renderer.tsx (~30 element cases)
- Testing across 7 modules

**Overall: Low-Medium Complexity**

**Estimated Time:**
- Implementation: 2-3 hours
- Testing: 1-2 hours
- Documentation: 30 minutes
- **Total: 4-6 hours**

---

## Dependencies and Blockers

### Dependencies

**None.** This feature has no external dependencies:
- Uses existing Tailwind theme system
- Uses existing semantic color tokens
- No new libraries needed
- No database changes needed

### Blockers

**None identified.**

---

## Documentation Inconsistencies Found

### 1. ModuleViewContainer Violates STYLES.md

**Location:** `src/components/module-view-container.tsx`, line 177

**Issue:** Uses `bg-white` instead of semantic color tokens

**STYLES.md Rule (lines 729-741):**
```
❌ WRONG
<Card className="border">

✅ CORRECT
<Card className="bg-card text-card-foreground border">
```

**Current Code:**
```typescript
<Card className="bg-white">
```

**Should Be:**
```typescript
<Card className="bg-card text-card-foreground border">
```

**Impact:** This is the root cause of the feature request. The ModuleViewContainer component doesn't follow the documented styling patterns.

**Suggested Fix:** This requirements document addresses this inconsistency as part of the implementation.

---

## Summary Report

### Feature Overview
Add light/dark theme support to HTML liturgical content rendering in view pages while maintaining white backgrounds in print pages for all 7 content builder modules.

### Technical Scope
- **Modules Affected:** 7 (Weddings, Funerals, Baptisms, Presentations, Quinceañeras, Masses, Mass Intentions)
- **Templates Affected:** 17 total templates across all modules
- **Files to Modify:** 2 (html-renderer.tsx, module-view-container.tsx)
- **Files to NOT Modify:** 7 print pages, all content builders, all other renderers

### Components
- **Reused:** ModuleViewContainer (update existing)
- **New:** `getColorClassName()` helper function in html-renderer.tsx
- **Modified:** All element renderers in html-renderer.tsx (~30 cases)

### Documentation Updates Needed
- RENDERER.md - Add theme support documentation
- LITURGICAL_SCRIPT_SYSTEM.md - Note about theme support
- No user-facing documentation changes

### Testing Requirements
- 28 manual test scenarios (7 modules × 2 modes × 2 page types)
- All 16 element types must render correctly in both themes
- Print pages must remain white in all themes

### Security Considerations
**None.** Pure client-side styling change.

### Estimated Complexity
**Low-Medium** - Straightforward implementation, moderate testing scope

### Dependencies and Blockers
**None identified.**

### Documentation Inconsistencies Found
1. ModuleViewContainer uses `bg-white` instead of `bg-card text-card-foreground` (violates STYLES.md)

---

## Next Steps

### After Requirements Approval

1. **Implementation Phase:**
   - Create `getColorClassName()` helper in html-renderer.tsx
   - Update `applyResolvedStyle()` to exclude color property
   - Update all element renderers to use className for colors
   - Update ModuleViewContainer to use semantic card classes

2. **Testing Phase:**
   - Test all 7 modules in light mode
   - Test all 7 modules in dark mode
   - Verify print pages remain white
   - Test theme toggling on view pages
   - Verify all element types render correctly

3. **Documentation Phase:**
   - Update RENDERER.md with theme support notes
   - Update LITURGICAL_SCRIPT_SYSTEM.md with theme support notes
   - Document color mapping (black → foreground, red → destructive)

4. **Validation:**
   - Code review for consistency
   - Visual QA in both themes
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Mobile device testing

---

## References

### Documentation
- `/docs/RENDERER.md` - Renderer system documentation
- `/docs/STYLES.md` - Styling patterns and dark mode rules
- `/docs/TEMPLATE_REGISTRY.md` - Complete list of all 17 templates
- `/docs/LITURGICAL_SCRIPT_SYSTEM.md` - Content builder system overview

### Code Files
- `/src/lib/renderers/html-renderer.tsx` - HTML renderer to modify
- `/src/components/module-view-container.tsx` - View container to modify
- `/src/lib/styles/liturgical-script-styles.ts` - Style definitions (no changes)
- `/src/app/print/*/[id]/page.tsx` - Print pages (no changes)

### Related Issues
- STYLES.md violation in ModuleViewContainer (documented above)

---

**Document Status:** Complete
**Ready for Implementation:** Yes
**Requires Approval:** User confirmation of preferred implementation approach (Option 1 recommended)
