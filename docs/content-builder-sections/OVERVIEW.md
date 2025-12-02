# Content Builder Section System - Overview

> **Purpose:** Introduction to the standardized section types used in liturgical content builders. This defines the limited set of possible sections and core design principles.

## Table of Contents

1. [System Overview](#system-overview)
2. [Design Principles](#design-principles)
3. [The Eight Section Types](#the-eight-section-types)
4. [Section Order](#section-order)
5. [Strict vs. Flexible Sections](#strict-vs-flexible-sections)

---

## System Overview

Content builders create liturgical documents by assembling **sections**. Each section has a specific purpose and structure. This system enforces consistency across all liturgical modules (weddings, funerals, baptisms, etc.) while allowing appropriate flexibility where needed.

### Key Concepts

1. **Limited Section Types** - Only 8 section types are allowed (enforced by pattern, not TypeScript)
2. **Consistent Structure** - Each section type has a defined interface and purpose
3. **Reusable Builders** - Shared section builders for strict sections (readings, psalm, petitions)
4. **Flexible Ceremony** - Liturgical ceremony and cover sections allow module-specific content
5. **Smart Page Breaks** - Automatic page breaks between sections, none after the last

### Why This System?

**Problem:** Without structure, each template could create arbitrary sections with inconsistent formatting and behavior.

**Solution:** Define a limited set of section types with clear interfaces. Use shared builders for strict sections (readings) and allow flexibility for cover pages.

---

## Design Principles

1. **Liturgical Consistency** - Follow Church standards for readings, psalms, and prayers
2. **Format Consistency** - All templates use the same section structure and formatting
3. **Reusability** - Share code for common sections (readings, psalm, petitions)
4. **Flexibility Where Needed** - Allow custom implementation for module-specific content (ceremony, cover)
5. **Smart Defaults** - Automatic page breaks, response text, and formatting
6. **Conditional Inclusion** - Sections return null if no content (e.g., no reading selected)

---

## The Eight Section Types

| Section Type | Purpose | Interface | Shared Builder? |
|-------------|---------|-----------|-----------------|
| **Cover Sheet** | Summary page with event metadata | Flexible | No |
| **First Reading** | Scripture reading before Gospel | Strict | Yes - `buildReadingSection()` |
| **Psalm** | Responsorial psalm | Strict | Yes - `buildPsalmSection()` |
| **Second Reading** | Scripture reading (if applicable) | Strict | Yes - `buildReadingSection()` |
| **Gospel** | Gospel reading | Strict | Yes - `buildReadingSection()` |
| **Liturgical Ceremony** | Sacramental rite (vows, blessings, ritual actions) | Flexible | No |
| **Petitions** | Prayer of the Faithful | Strict | Yes - `buildPetitionsSection()` |
| **Announcements** | End-of-liturgy announcements | Flexible | Optional - `buildAnnouncementsSection()` |

### Section Descriptions

**1. Cover Sheet (Summary)**
- First page with event metadata, participants, and liturgical information
- Custom implementation per module (wedding vs. funeral vs. baptism have different info)
- Always includes: event details, participants, ministers, liturgical info
- **Always first in document**

**2. First Reading**
- Scripture reading before Gospel (typically Old Testament)
- Strict format with shared builder
- Includes: title, pericope, reader name, reading text, response

**3. Psalm**
- Responsorial psalm between readings
- Strict format with shared builder
- Can be read or sung
- Automatically starts on new page

**4. Second Reading**
- Scripture reading (typically New Testament epistles)
- Strict format with shared builder
- Same structure as First Reading

**5. Gospel**
- Gospel reading (highest reverence)
- Strict format with shared builder
- Includes special Gospel dialogue and acclamations
- Traditionally starts on new page

**6. Liturgical Ceremony**
- The actual sacramental rite specific to each module
- Flexible implementation (varies by module)
- Can be multiple sections at different positions
- Examples: wedding vows, baptismal promises, funeral commendation

**7. Petitions**
- Prayer of the Faithful (intercessions)
- Strict format with shared builder
- Automatically formatted with responses

**8. Announcements**
- End-of-liturgy announcements
- Flexible implementation (can use shared builder or custom)
- Typically last section

---

## Section Order

Sections typically follow this order, with flexibility for liturgical ceremony sections:

1. **Cover Sheet (summary)** - Always first
2. **First Reading** - Optional
3. **Psalm** - Optional
4. **Second Reading** - Optional
5. **Gospel** - Optional
6. **Liturgical Ceremony Section(s)** - Optional, flexible position, can be multiple
7. **Petitions** - Optional
8. **Announcements** - Optional, typically last

### Important Notes

- **Cover sheet** is always first
- **Liturgical ceremony sections can appear anywhere and can be multiple**
  - Example: Wedding might have ceremony sections after Gospel (vows, rings, nuptial blessing)
  - Example: Presentation might have ceremony section BEFORE readings
  - Example: Baptism might have multiple ceremony sections (promises, water baptism, anointing)
- **Readings/Psalm/Gospel** typically follow the standard Liturgy of the Word order
- **Petitions** typically come after ceremony sections
- **Announcements** typically come last

### Common Positioning Patterns

- **Wedding:** After Gospel (marriage consent, exchange of rings, nuptial blessing)
- **Baptism:** Multiple sections interspersed (baptismal promises, water baptism, anointing, clothing)
- **Funeral:** After readings (final commendation, incensation)
- **Presentation:** Before or after readings (presentation blessing)
- **Quinceañera:** After Gospel (renewal of promises, blessing, symbols)

---

## Strict vs. Flexible Sections

### Strict Sections (Use Shared Builders)

**Sections:** First Reading, Psalm, Second Reading, Gospel, Petitions

**Why Strict?**
- Liturgical requirements (Church standards)
- Consistent formatting across all templates
- Correct sequence and responses
- Proper labeling and reader attribution

**Rule:** ALWAYS use the shared builders for these sections. Do not create custom implementations.

**Shared Builders:**
- `buildReadingSection()` - For First Reading, Second Reading, Gospel
- `buildPsalmSection()` - For Responsorial Psalm
- `buildPetitionsSection()` - For Prayer of the Faithful

### Flexible Sections (Custom Implementation)

**Sections:** Cover Sheet (Summary), Liturgical Ceremony, Announcements

**Why Flexible?**
- **Cover Sheet:** Module-specific metadata (wedding vs. funeral vs. baptism)
- **Liturgical Ceremony:** Each sacrament has unique rites (marriage vows vs. baptismal promises vs. funeral commendation)
- **Announcements:** Varying content and formats
- Custom subsections and groupings
- Different information hierarchies per module

**Rule:** Create custom implementations, but follow element type conventions.

**Best Practices:**
- Use semantic element types (`section-title`, `info-row`, etc.)
- Group related information with subsection titles
- Use helper functions for formatting (dates, names, locations)
- Return `ContentSection | null` to allow conditional inclusion

---

## Related Documentation

### Section Implementation Guides
- **[SECTION_INTERFACES.md](./SECTION_INTERFACES.md)** - Detailed interfaces and usage for all 8 section types
- **[SHARED_BUILDERS.md](./SHARED_BUILDERS.md)** - Shared builder functions for strict sections
- **[CUSTOM_SECTIONS.md](./CUSTOM_SECTIONS.md)** - Patterns for implementing custom sections

### Page Break and Layout
- **[PAGE_BREAKS.md](./PAGE_BREAKS.md)** - Page break rules, strategies, and automatic handling

### Examples and Best Practices
- **[TEMPLATE_EXAMPLE.md](./TEMPLATE_EXAMPLE.md)** - Complete working template example
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Do's and don'ts for section implementation

### Related Systems
- **[LITURGICAL_SCRIPT_SYSTEM.md](../LITURGICAL_SCRIPT_SYSTEM.md)** - Setup and architecture for content builders
- **[LITURGICAL_SCRIPT_REFERENCE.md](../LITURGICAL_SCRIPT_REFERENCE.md)** - Element types and styling reference
- **[FORMATTERS.md](../FORMATTERS.md)** - Helper functions for formatting (dates, names, locations)

---

**Last Updated:** 2025-01-17
**Status:** Core overview of content builder section system
**Coverage:** System overview, design principles, section types, ordering rules, strict vs. flexible classification
