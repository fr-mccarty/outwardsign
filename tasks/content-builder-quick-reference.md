# Content Builder Implementation - Quick Reference

Quick guide for implementing the new builder components in templates.

## Import Statement

```typescript
// Import all builders you need
import {
  buildCoverPage,
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildCeremonySection,
  buildDialogueExchange,
  buildPrayerWithAmen,
  buildQuestionSeries,
} from '@/lib/content-builders/shared/builders'
```

---

## Common Patterns

### 1. Cover Page (Summary Section)

**Before:**
```typescript
function buildSummarySection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({ type: 'section-title', text: 'Wedding Celebration' })

  if (wedding.bride) {
    elements.push({
      type: 'info-row',
      label: 'Bride:',
      value: formatPersonName(wedding.bride),
    })
  }

  if (wedding.groom) {
    elements.push({
      type: 'info-row',
      label: 'Groom:',
      value: formatPersonName(wedding.groom),
    })
  }

  // ... 20 more info rows

  return { id: 'summary', pageBreakAfter: true, elements }
}
```

**After:**
```typescript
function buildSummarySection(wedding: WeddingWithRelations): ContentSection {
  const rows: CoverPageInfoRow[] = []

  if (wedding.bride) {
    rows.push({ label: 'Bride:', value: formatPersonName(wedding.bride) })
  }

  if (wedding.groom) {
    rows.push({ label: 'Groom:', value: formatPersonName(wedding.groom) })
  }

  // ... add all other rows

  return buildCoverPage({
    sections: [{ title: 'Wedding Celebration', rows }],
    pageBreakAfter: true
  })
}
```

### 2. Reading Sections

**Before:**
```typescript
const elements: ContentElement[] = []

if (wedding.first_reading) {
  elements.push({ type: 'reading-title', text: 'FIRST READING' })
  elements.push({ type: 'pericope', text: wedding.first_reading.pericope || 'No pericope' })

  if (wedding.first_reader) {
    elements.push({
      type: 'reader-name',
      text: formatPersonName(wedding.first_reader),
    })
  }

  // ... more elements

  return { id: 'first-reading', elements }
} else {
  return null
}
```

**After:**
```typescript
const firstReading = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: wedding.first_reading,
  reader: wedding.first_reader,
  responseText: 'Thanks be to God.',
})
```

### 3. Ceremony Sections

**Before:**
```typescript
sections.push({
  id: 'marriage-consent',
  pageBreakBefore: true,
  elements: [
    { type: 'section-title', text: 'MARRIAGE CONSENT' },
    { type: 'spacer', size: 'medium' },
    { type: 'rubric', text: 'The priest addresses the bride and groom:' },
    { type: 'spacer', size: 'small' },
    { type: 'priest-dialogue', text: 'Have you come here freely?' },
    { type: 'spacer', size: 'small' },
    { type: 'response', label: 'COUPLE:', text: 'We have.' },
    // ... 50 more elements
  ]
})
```

**After:**
```typescript
sections.push(buildCeremonySection({
  id: 'marriage-consent',
  title: 'MARRIAGE CONSENT',
  pageBreakBefore: true,
  introRubric: 'The priest addresses the bride and groom:',
  elements: buildQuestionSeries([
    { question: 'Have you come here freely?', response: 'We have.', responseLabel: 'COUPLE:' },
    { question: 'Are you prepared to love and honor?', response: 'We are.', responseLabel: 'COUPLE:' },
    // ... more questions
  ])
}))
```

---

## Refactoring Checklist

For each template file:

### Step 1: Update Imports
- [ ] Add import from `@/lib/content-builders/shared/builders`
- [ ] Remove unused imports from old implementation

### Step 2: Refactor Summary/Cover Section
- [ ] Identify all info-row elements
- [ ] Group related rows into sections
- [ ] Replace with `buildCoverPage()`
- [ ] Test that all information displays correctly

### Step 3: Refactor Reading Sections
- [ ] Replace first reading with `buildReadingSection()`
- [ ] Replace psalm with `buildPsalmSection()`
- [ ] Replace second reading with `buildReadingSection()`
- [ ] Replace gospel with `buildReadingSection()` (with acclamations)
- [ ] Verify page breaks are correct

### Step 4: Refactor Ceremony Sections
- [ ] Identify reusable patterns (Q&A, prayers, dialogues)
- [ ] Use appropriate helpers (`buildQuestionSeries`, `buildPrayerWithAmen`, etc.)
- [ ] Replace with `buildCeremonySection()`
- [ ] Verify page breaks are correct

### Step 5: Test
- [ ] Build the project (`npm run build`)
- [ ] Generate PDF export
- [ ] Generate Word export
- [ ] Compare with previous version
- [ ] Verify all content is present
- [ ] Verify formatting is correct

---

## Common Helpers

### For Q&A Patterns
```typescript
buildQuestionSeries([
  {
    question: 'Question text?',
    response: 'Response text',
    responseLabel: 'PERSON:'
  },
  // ... more questions
])
```

### For Prayers
```typescript
buildPrayerWithAmen(
  'Prayer text goes here...',
  true, // Include rubric
  'The priest prays:' // Rubric text
)
```

### For Dialogues
```typescript
buildDialogueExchange(
  'The Lord be with you.',
  'And with your spirit.'
)
```

### For Rubrics + Actions
```typescript
buildRubricAction(
  'The priest blesses the rings:',
  'May the Lord bless these rings...',
  'priest-text' // or 'prayer-text'
)
```

---

## Testing Commands

```bash
# Build project
npm run build

# Run type checking
npx tsc --noEmit

# Test specific module export
# (View in browser: http://localhost:3000/weddings/[id])
npm run dev
```

---

## Rollback Plan

If issues occur:

```bash
# View changes
git diff src/lib/content-builders/

# Rollback specific file
git checkout HEAD -- src/lib/content-builders/wedding/templates/full-script-english.ts

# Rollback all changes in a directory
git checkout HEAD -- src/lib/content-builders/wedding/
```

---

## Code Size Reduction Example

### Wedding Template (Full-Script-English)

**Before Refactoring:**
- Lines of code: ~600
- Element creation: Manual (~200 elements)
- Ceremony sections: ~250 lines

**After Refactoring (Estimated):**
- Lines of code: ~200-250
- Element creation: Builder-based (~20 builder calls)
- Ceremony sections: ~80 lines

**Reduction:** ~60% fewer lines, much more readable

---

## Getting Help

**Documentation:**
- `src/lib/content-builders/shared/builders/README.md` - Complete builder docs
- `docs/LITURGICAL_SCRIPT_SYSTEM.md` - Liturgy system overview
- `tasks/content-builder-implementation.md` - Full task list

**Examples:**
- Wedding module (after refactoring) - Best reference
- Existing templates - See what needs to change

**Issues:**
- Check TypeScript errors for type mismatches
- Test PDF/Word exports immediately after changes
- Compare before/after outputs visually
