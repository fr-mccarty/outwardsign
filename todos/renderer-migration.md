# Renderer Structure Migration

**Status:** ✅ COMPLETED
**Priority:** Medium
**Documentation:** [RENDERER.md](../docs/RENDERER.md)
**Completion Date:** 2025-01-15

## Goal

Migrate all liturgical script template files to use the new renderer structure with specific element types instead of the deprecated `multi-part-text` element.

## Background

The renderer system is designed with separation of concerns:
1. **Content Builders** create structured `LiturgyDocument` objects (element types, text, metadata)
2. **Style System** (`liturgical-script-styles.ts`) defines all styling in one place
3. **Renderers** translate the document structure + styles into format-specific output (HTML, PDF, Word)

**Key Principle:** Renderers are pure converters—they never make styling decisions. All styling is resolved by the central style system.

## Migration Path

Replace deprecated `multi-part-text` elements with specific element types:

### OLD (deprecated):
```typescript
{
  type: 'multi-part-text',
  parts: [
    { text: 'CELEBRANT: ' },
    { text: `Do you commit to raise ${childName} in the Catholic faith?` }
  ]
}
```

### NEW (use specific element types):
```typescript
// For celebrant/priest dialogue:
{
  type: 'priest-dialogue',  // or 'priest-text'
  text: `Do you commit to raise ${childName} in the Catholic faith?`
}

// For responses with labels:
{
  type: 'response',
  label: 'R.',
  text: 'Thanks be to God.'
}
```

## Available Element Types

See [RENDERER.md Element Type Reference](../docs/RENDERER.md#element-type-reference) for complete list:

- `event-title` - Main title of the liturgy
- `event-datetime` - Date and time of event
- `section-title` - Major section heading
- `reading-title` - Reading heading
- `pericope` - Scripture reference
- `reader-name` - Name of person reading
- `introduction` - Introductory text before reading
- `reading-text` - The scripture text itself
- `conclusion` - Concluding formula
- `response` - Call and response (with label + text)
- `priest-dialogue` - Priest's spoken text
- `priest-text` - Priest's prayer or blessing
- `petition` - Prayer petition (with label + text)
- `text` - General body text
- `rubric` - Liturgical instruction
- `prayer-text` - Text of a prayer
- `info-row` - Label-value pair
- `spacer` - Vertical spacing

## Tasks

### ✅ Priority 1: Presentation Module Templates (29 occurrences) - COMPLETED

**All files successfully migrated:**

- [x] `src/lib/content-builders/presentation/templates/simple-english.ts` (5 occurrences) ✅
- [x] `src/lib/content-builders/presentation/templates/simple-spanish.ts` (5 occurrences) ✅
- [x] `src/lib/content-builders/presentation/templates/full-script-english.ts` (5 occurrences) ✅
- [x] `src/lib/content-builders/presentation/templates/full-script-spanish.ts` (5 occurrences) ✅
- [x] `src/lib/content-builders/presentation/templates/bilingual.ts` (9 occurrences) ✅

### ✅ Priority 2: Verification Tasks - COMPLETED

All other modules verified to be using the new renderer structure:

- [x] Wedding templates - Already using new structure ✅
- [x] Funeral templates - Already using new structure ✅
- [x] Quinceanera templates - Already using new structure ✅
- [x] Baptism templates - Already using new structure ✅
- [x] Mass templates - Already using new structure ✅
- [x] Mass Intention templates - Already using new structure ✅

### ✅ Priority 3: Cleanup Tasks - COMPLETED

**Deprecated element removed from codebase:**

- [x] Removed `MultiPartTextElement` interface from `src/lib/types/liturgy-content.ts` ✅
- [x] Removed `multi-part-text` rendering logic from `src/lib/renderers/html-renderer.tsx` ✅
- [x] Removed `multi-part-text` rendering logic from `src/lib/renderers/pdf-renderer.ts` ✅
- [x] Removed `multi-part-text` rendering logic from `src/lib/renderers/word-renderer.ts` ✅
- [x] Updated `docs/RENDERER.md` to remove deprecated element references ✅
- [x] Updated `docs/LITURGICAL_SCRIPT_REFERENCE.md` to remove deprecated element references ✅

## File Locations

```
src/lib/
├── content-builders/        # Create LiturgyDocument structures
│   ├── wedding/
│   │   └── templates/
│   ├── funeral/
│   │   └── templates/
│   ├── quinceanera/
│   │   └── templates/
│   ├── baptism/
│   │   └── templates/
│   ├── mass/
│   │   └── templates/
│   ├── mass-intention/
│   │   └── templates/
│   └── presentation/
│       └── templates/       # 🔴 NEEDS MIGRATION
├── styles/
│   └── liturgical-script-styles.ts  # Central style system
├── renderers/
│   ├── html-renderer.tsx            # React/HTML output
│   ├── pdf-renderer.ts              # pdfmake output
│   └── word-renderer.ts             # docx output
└── types/
    └── liturgy-content.ts           # TypeScript interfaces
```

## Testing After Migration

After migrating each template file:

1. **Test HTML rendering** - View page in browser
2. **Test PDF export** - Download PDF and verify formatting
3. **Test Word export** - Download .docx and verify formatting
4. **Compare with original** - Ensure visual appearance is identical

## Migration Summary

✅ **Migration Complete!** All 29 occurrences of `multi-part-text` have been successfully migrated to specific element types (`priest-dialogue`, `priest-text`).

✅ **Deprecated Element Removed:** The `multi-part-text` element type has been completely removed from:
- Type definitions (`liturgy-content.ts`)
- All three renderers (HTML, PDF, Word)
- Documentation files (RENDERER.md, LITURGICAL_SCRIPT_REFERENCE.md)

✅ **All Modules Verified:** Wedding, Funeral, Quinceanera, Baptism, Mass, and Mass Intention modules all confirmed to be using the new renderer structure.

**Result:** The codebase now uses a cleaner, more semantic element type system with better separation of concerns.

## Related Documentation

- [RENDERER.md](../docs/RENDERER.md) - Renderer system documentation
- [LITURGICAL_SCRIPT_SYSTEM.md](../docs/LITURGICAL_SCRIPT_SYSTEM.md) - Content builders overview
- [LITURGICAL_SCRIPT_REFERENCE.md](../docs/LITURGICAL_SCRIPT_REFERENCE.md) - Style reference
