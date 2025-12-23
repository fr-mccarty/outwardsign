# Content Builder Section System

> **Purpose:** Navigation hub for the content builder section system documentation. This system defines the standardized section types used in liturgical content builders.

> **Note on Script Template System:** This documentation covers **code-based content builders** (TypeScript builders in the codebase). For **database-driven script templates** (admin-configurable via UI), see [EVENT_TYPE_CONFIGURATION.md](./EVENT_TYPE_CONFIGURATION.md). The two systems work together: code-based builders auto-generate scripts for masses/events, while database templates provide full customization for special liturgies.

## Quick Start

**New to content builders?** Start here:
1. Read [OVERVIEW](./content-builder-sections/OVERVIEW.md) - Understand the 8 section types and design principles
2. Review [SECTION_INTERFACES](./content-builder-sections/SECTION_INTERFACES.md) - Learn the interface for each section type
3. Study [TEMPLATE_EXAMPLE](./content-builder-sections/TEMPLATE_EXAMPLE.md) - See a complete working example
4. Reference [BEST_PRACTICES](./content-builder-sections/BEST_PRACTICES.md) - Avoid common mistakes

**Building a template?** Essential reading:
- [SHARED_BUILDERS](./content-builder-sections/SHARED_BUILDERS.md) - Use these for readings, psalm, petitions
- [CUSTOM_SECTIONS](./content-builder-sections/CUSTOM_SECTIONS.md) - Patterns for summary and ceremony sections
- [PAGE_BREAKS](./content-builder-sections/PAGE_BREAKS.md) - Understand page break behavior

---

## Documentation Structure

### Core Documentation

**[OVERVIEW.md](./content-builder-sections/OVERVIEW.md)**
- System overview and design principles
- The 8 section types (Cover, First Reading, Psalm, Second Reading, Gospel, Ceremony, Petitions, Announcements)
- Section ordering rules
- Strict vs. flexible sections
- **Start here if you're new to the system**

**[SECTION_INTERFACES.md](./content-builder-sections/SECTION_INTERFACES.md)**
- Detailed interface documentation for all 8 section types
- Usage examples for each type
- Automatic elements included by shared builders
- Positioning and page break behavior
- Gospel-specific elements (dialogue, acclamations)
- Liturgical ceremony patterns with examples

**[SHARED_BUILDERS.md](./content-builder-sections/SHARED_BUILDERS.md)**
- Complete reference for shared builder functions
- `buildReadingSection()` - First Reading, Second Reading, Gospel
- `buildPsalmSection()` - Responsorial Psalm
- `buildPetitionsSection()` - Prayer of the Faithful
- `buildAnnouncementsSection()` - Simple announcements
- Function signatures, parameters, return values
- **Essential for implementing strict sections**

**[CUSTOM_SECTIONS.md](./content-builder-sections/CUSTOM_SECTIONS.md)**
- Patterns for implementing custom sections
- Summary (cover sheet) section pattern
- Liturgical ceremony section pattern
- Custom announcements pattern
- Common helper functions
- Element type reference
- **Essential for implementing flexible sections**

**[PAGE_BREAKS.md](./content-builder-sections/PAGE_BREAKS.md)**
- Page break properties (`pageBreakBefore`, `pageBreakAfter`)
- Default behavior by section type
- Automatic last-section handling (prevents blank pages)
- Page break strategies and patterns
- Common document layouts

### Examples and Guides

**[TEMPLATE_EXAMPLE.md](./content-builder-sections/TEMPLATE_EXAMPLE.md)**
- Complete, annotated working template
- All 8 section types demonstrated
- Proper use of shared builders
- Custom section implementation
- Null checking and conditional sections
- Page break configuration
- **Best learning resource - see it all together**

**[BEST_PRACTICES.md](./content-builder-sections/BEST_PRACTICES.md)**
- 10 critical patterns with do's and don'ts
- Common mistakes to avoid
- Rationale for each best practice
- Code examples for each pattern
- **Read before implementing to avoid common errors**

---

## The Eight Section Types

| # | Section Type | Interface | Description | Builder |
|---|-------------|-----------|-------------|---------|
| 1 | **Cover Sheet** | Flexible | Summary page with event metadata | Custom |
| 2 | **First Reading** | Strict | Scripture reading before Gospel | `buildReadingSection()` |
| 3 | **Psalm** | Strict | Responsorial psalm | `buildPsalmSection()` |
| 4 | **Second Reading** | Strict | Scripture reading (if applicable) | `buildReadingSection()` |
| 5 | **Gospel** | Strict | Gospel reading with special dialogue | `buildReadingSection()` |
| 6 | **Liturgical Ceremony** | Flexible | Sacramental rite (vows, blessings, rituals) | Custom |
| 7 | **Petitions** | Strict | Prayer of the Faithful | `buildPetitionsSection()` |
| 8 | **Announcements** | Flexible | End-of-liturgy announcements | `buildAnnouncementsSection()` or Custom |

### Strict vs. Flexible

**Strict Sections (Use Shared Builders):**
- First Reading, Psalm, Second Reading, Gospel, Petitions
- MUST use shared builders - ensures liturgical accuracy and consistency
- See [SHARED_BUILDERS.md](./content-builder-sections/SHARED_BUILDERS.md)

**Flexible Sections (Custom Implementation):**
- Cover Sheet (Summary), Liturgical Ceremony, Announcements
- Custom implementation per module
- Follow element type conventions
- See [CUSTOM_SECTIONS.md](./content-builder-sections/CUSTOM_SECTIONS.md)

---

## Common Tasks

### Creating a New Template

1. **Read** [OVERVIEW.md](./content-builder-sections/OVERVIEW.md) - Understand the system
2. **Review** [TEMPLATE_EXAMPLE.md](./content-builder-sections/TEMPLATE_EXAMPLE.md) - See complete example
3. **Reference** [SECTION_INTERFACES.md](./content-builder-sections/SECTION_INTERFACES.md) - Interface details
4. **Use** [SHARED_BUILDERS.md](./content-builder-sections/SHARED_BUILDERS.md) - For strict sections
5. **Follow** [CUSTOM_SECTIONS.md](./content-builder-sections/CUSTOM_SECTIONS.md) - For flexible sections
6. **Check** [BEST_PRACTICES.md](./content-builder-sections/BEST_PRACTICES.md) - Avoid mistakes

### Adding a Reading Section

```typescript
import { buildReadingSection } from '@/lib/content-builders/shared/script-sections'

const section = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false
})

if (section) sections.push(section)
```

See [SHARED_BUILDERS.md](./content-builder-sections/SHARED_BUILDERS.md#buildreadingsection) for complete details.

### Adding a Custom Ceremony Section

```typescript
function buildCeremonySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Marriage Rite'
  })

  elements.push({
    type: 'rubric',
    text: 'The couple stands before the altar'
  })

  elements.push({
    type: 'presider-dialogue',
    text: 'Do you take this woman to be your lawfully wedded wife?'
  })

  elements.push({
    type: 'response-dialogue',
    label: 'Groom:',
    text: 'I do.'
  })

  return {
    id: 'ceremony',
    pageBreakBefore: false,
    elements
  }
}
```

See [CUSTOM_SECTIONS.md](./content-builder-sections/CUSTOM_SECTIONS.md#liturgical-ceremony-pattern) for complete patterns.

### Understanding Page Breaks

- **pageBreakBefore: true** - Section starts on new page (Gospel, Psalm, Petitions)
- **pageBreakAfter: true** - Next section starts on new page (Summary, Petitions)
- **Last section** - `pageBreakAfter` automatically ignored (no blank pages)

See [PAGE_BREAKS.md](./content-builder-sections/PAGE_BREAKS.md) for complete guide.

---

## Quick Reference

### Shared Builders Location

All shared builders are in: `src/lib/content-builders/shared/script-sections.ts`

### Common Imports

```typescript
// Shared builders
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection
} from '@/lib/content-builders/shared/script-sections'

// Types
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'

// Helpers
import { formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import { gendered } from '@/lib/content-builders/shared/builders'
```

### Section Order Template

```typescript
sections.push(buildSummarySection(entity))          // 1. Cover
sections.push(buildFirstReadingSection(entity))     // 2. First Reading
sections.push(buildPsalmSection(entity))            // 3. Psalm
sections.push(buildSecondReadingSection(entity))    // 4. Second Reading
sections.push(buildGospelSection(entity))           // 5. Gospel
sections.push(buildCeremonySection(entity))         // 6. Ceremony
sections.push(buildPetitionsSection(entity))        // 7. Petitions
sections.push(buildAnnouncementsSection(entity))    // 8. Announcements
```

---

## Related Documentation

### Liturgical Script System
- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Overall system architecture and setup
- **[LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md)** - Element types and styling reference
- **[TEMPLATE_REGISTRY.md](./TEMPLATE_REGISTRY.md)** - Registry of all templates across all modules
- **[RENDERER.md](./RENDERER.md)** - HTML, PDF, and Word rendering system

### Helpers and Utilities
- **[FORMATTERS.md](./FORMATTERS.md)** - Date, name, location, and page title formatters
- **[liturgy-content.ts](../src/lib/types/liturgy-content.ts)** - TypeScript interfaces

### Module Development
- **[MODULE_DEVELOPMENT.md](./MODULE_DEVELOPMENT.md)** - Module structure and conventions
- **[CONTENT_BUILDER_STRUCTURE.md](./CONTENT_BUILDER_STRUCTURE.md)** - Standard liturgical script structure

---

**Last Updated:** 2025-01-17
**Status:** Navigation hub for split content builder section documentation
**Original File:** Archived as `docs/archive/CONTENT_BUILDER_SECTIONS_ORIGINAL.md`
**Structure:** 6 focused category files + this index (replaces 1443-line monolithic file)
