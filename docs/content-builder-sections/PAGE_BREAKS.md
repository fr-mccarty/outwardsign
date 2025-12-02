# Page Break Management

> **Purpose:** Complete guide to page break behavior, strategies, and automatic handling in the content builder section system.

## Table of Contents

1. [Overview](#overview)
2. [Page Break Properties](#page-break-properties)
3. [Default Behavior by Section](#default-behavior-by-section)
4. [Automatic Last Section Handling](#automatic-last-section-handling)
5. [Page Break Strategies](#page-break-strategies)
6. [Common Patterns](#common-patterns)

---

## Overview

Page breaks are controlled at the **section level** to ensure proper document flow and visual separation between liturgical elements.

### Key Concepts

- **Automatic Management** - Renderers handle page breaks intelligently
- **No Blank Pages** - Last section never creates a trailing page break
- **Liturgical Standards** - Gospel and Psalm traditionally start on new pages
- **Visual Separation** - Petitions and summary pages separated from other content

---

## Page Break Properties

Page breaks are controlled via two optional properties on the `ContentSection` interface:

```typescript
interface ContentSection {
  id: string
  pageBreakBefore?: boolean  // Start this section on a new page
  pageBreakAfter?: boolean   // Force next section to a new page
  elements: ContentElement[]
}
```

### pageBreakBefore

**When:** `true`
**Effect:** This section starts on a new page

**Common Uses:**
- Gospel reading (liturgical tradition)
- Psalm (visual separation)
- Petitions (separate from ceremony)
- Major ceremony transitions

### pageBreakAfter

**When:** `true`
**Effect:** Next section starts on a new page

**Common Uses:**
- Summary/cover sheet (separate from liturgy)
- Petitions (separate from announcements)

**Important:** Automatically ignored if this is the last section (prevents blank pages)

---

## Default Behavior by Section

### Shared Builders

**buildReadingSection()** (First Reading, Second Reading, Gospel)
- Default: `pageBreakBefore: false`
- Can override via config parameter
- Gospel typically overrides to `true`

**buildPsalmSection()**
- Fixed: `pageBreakBefore: true`
- Cannot override (always starts on new page)

**buildPetitionsSection()**
- Fixed: `pageBreakBefore: true`
- Fixed: `pageBreakAfter: true`
- Cannot override

**buildAnnouncementsSection()**
- No page breaks
- Flows naturally with surrounding content

### Custom Sections

**Summary (Cover Sheet)**
- Typical: `pageBreakAfter: true`
- Separates cover from liturgical content

**Liturgical Ceremony**
- Flexible: Set based on document flow
- Typically `pageBreakBefore: false` (flows from previous)
- May use `true` for major transitions

**Custom Announcements**
- Flexible: Usually no page breaks
- Typically last section, so `pageBreakAfter` would be ignored anyway

---

## Automatic Last Section Handling

### The Problem

If the last section has `pageBreakAfter: true`, it would create a blank page at the end of the document.

### The Solution

Renderers automatically detect the last section and ignore `pageBreakAfter`.

### Implementation in Renderers

All renderers (HTML, PDF, Word) use this pattern:

```typescript
sections.forEach((section, index) => {
  const isLastSection = index === sections.length - 1

  // Render section content...

  // Only apply pageBreakAfter if NOT the last section
  if (section.pageBreakAfter && !isLastSection) {
    // Add page break
  }
})
```

### What This Means for Template Builders

- You CAN set `pageBreakAfter: true` on any section
- You do NOT need to check if it's the last section
- Renderers automatically prevent page breaks after the last section

### Example

```typescript
// This is safe - renderer handles last section automatically
const petitionsSection = buildPetitionsSection({
  petitions: entity.petitions,
  petition_reader: entity.petition_reader
})
// petitionsSection has pageBreakAfter: true internally

sections.push(petitionsSection)

// If petitions is the last section → no page break added
// If announcements follow → page break occurs between them
```

### Best Practice

```typescript
// ✅ CORRECT - let renderer handle it
const petitions = buildPetitionsSection({ ... })  // Has pageBreakAfter: true
if (petitions) sections.push(petitions)

// Renderer automatically prevents trailing page break if this is last

// ❌ WRONG - unnecessary manual checking
if (petitions) {
  const isLast = !entity.announcements
  petitions.pageBreakAfter = !isLast  // Don't do this!
  sections.push(petitions)
}
```

---

## Page Break Strategies

### Recommended Patterns by Section Type

```typescript
// 1. Summary (cover page)
{
  id: 'summary',
  pageBreakAfter: true,  // Separate from liturgy
  elements: [...]
}

// 2. First Reading
{
  id: 'first-reading',
  pageBreakBefore: false,  // Flow from previous
  elements: [...]
}

// 3. Psalm
{
  id: 'psalm',
  pageBreakBefore: true,  // Visual separation (shared builder sets this)
  elements: [...]
}

// 4. Second Reading
{
  id: 'second-reading',
  pageBreakBefore: false,  // Flow from psalm
  elements: [...]
}

// 5. Gospel
{
  id: 'gospel',
  pageBreakBefore: true,  // Traditional practice
  elements: [...]
}

// 6. Liturgical Ceremony
{
  id: 'ceremony',
  pageBreakBefore: false,  // Flow from Gospel (or set true for long ceremonies)
  elements: [...]
}

// 7. Petitions
{
  id: 'petitions',
  pageBreakBefore: true,  // Separate from ceremony
  pageBreakAfter: true,   // Separate from announcements (ignored if last)
  elements: [...]
}

// 8. Announcements
{
  id: 'announcements',
  // No page breaks - flows naturally or is last section
  elements: [...]
}
```

### When to Use pageBreakBefore

**Always:**
- Gospel reading (liturgical tradition)
- Psalm (visual separation, set by shared builder)
- Petitions (separation from ceremony, set by shared builder)

**Sometimes:**
- Long ceremony sections (major transitions)
- Multi-part ceremonies (between major subsections)

**Never:**
- First reading (flows from summary)
- Announcements (flows from petitions or is last)

### When to Use pageBreakAfter

**Always:**
- Summary/cover sheet (separate from liturgy)
- Petitions (set by shared builder, ignored if last section)

**Rarely:**
- Custom sections with specific layout needs

---

## Common Patterns

### Standard Liturgy Flow

No page breaks between readings (compact):

```typescript
sections.push(buildSummarySection(entity))          // pageBreakAfter: true
sections.push(buildReadingSection({                 // pageBreakBefore: false
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false
}))
sections.push(buildReadingSection({                 // pageBreakBefore: false
  id: 'second-reading',
  title: 'SECOND READING',
  reading: entity.second_reading,
  reader: entity.second_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false
}))
```

**Result:**
- Page 1: Summary
- Page 2: First Reading + Second Reading (flow together)

### Separated Readings

Page break before each major section:

```typescript
sections.push(buildSummarySection(entity))          // pageBreakAfter: true
sections.push(buildReadingSection({                 // pageBreakBefore: false
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false
}))
sections.push(buildPsalmSection({ ... }))          // pageBreakBefore: true (fixed)
sections.push(buildReadingSection({                 // pageBreakBefore: true
  id: 'gospel',
  title: 'GOSPEL',
  reading: entity.gospel_reading,
  includeGospelDialogue: true,
  includeGospelAcclamations: true,
  pageBreakBefore: true
}))
```

**Result:**
- Page 1: Summary
- Page 2: First Reading
- Page 3: Psalm
- Page 4: Gospel

### Multiple Ceremony Sections

Flowing vs. separated:

```typescript
// Flowing (no breaks between ceremony sections)
sections.push(buildGospel(wedding))
sections.push(buildMarriageConsentSection(wedding))     // pageBreakBefore: false
sections.push(buildRingExchangeSection(wedding))        // pageBreakBefore: false
sections.push(buildNuptialBlessingSection(wedding))     // pageBreakBefore: false
sections.push(buildPetitions(wedding))

// Result: Gospel on one page, all 3 ceremony sections flow together

// Separated (break before major transition)
sections.push(buildGospel(wedding))
sections.push(buildMarriageConsentSection(wedding))     // pageBreakBefore: false
sections.push(buildRingExchangeSection(wedding))        // pageBreakBefore: false
sections.push(buildNuptialBlessingSection(wedding))     // pageBreakBefore: true
sections.push(buildPetitions(wedding))

// Result: Gospel on one page, consent + rings flow together, nuptial blessing starts new page
```

### Minimal Document (No Optional Sections)

```typescript
sections.push(buildSummarySection(entity))     // pageBreakAfter: true
sections.push(buildPetitionsSection({ ... }))  // pageBreakBefore: true, pageBreakAfter: true

// Only 2 sections:
// Page 1: Summary
// Page 2: Petitions (pageBreakAfter ignored because it's last)
```

### Full Document with All Sections

```typescript
sections.push(buildSummarySection(entity))               // pageBreakAfter: true
sections.push(buildFirstReading(entity))                 // pageBreakBefore: false
sections.push(buildPsalm(entity))                        // pageBreakBefore: true
sections.push(buildSecondReading(entity))                // pageBreakBefore: false
sections.push(buildGospel(entity))                       // pageBreakBefore: true
sections.push(buildCeremony(entity))                     // pageBreakBefore: false
sections.push(buildPetitions(entity))                    // pageBreakBefore: true, pageBreakAfter: true
sections.push(buildAnnouncements(entity))                // No breaks

// Page breaks:
// Page 1: Summary
// Page 2: First Reading
// Page 3: Psalm + Second Reading
// Page 4: Gospel + Ceremony
// Page 5: Petitions
// Page 6: Announcements (pageBreakAfter from petitions creates break, NOT ignored because not last)
```

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and design principles
- **[SECTION_INTERFACES.md](./SECTION_INTERFACES.md)** - Interfaces for all section types
- **[SHARED_BUILDERS.md](./SHARED_BUILDERS.md)** - Shared builder default page break behavior
- **[TEMPLATE_EXAMPLE.md](./TEMPLATE_EXAMPLE.md)** - Complete working examples
- **[RENDERER.md](../RENDERER.md)** - Renderer implementation details

---

**Last Updated:** 2025-01-17
**Status:** Complete page break management guide
**Coverage:** Properties, default behaviors, automatic handling, strategies, common patterns, examples
