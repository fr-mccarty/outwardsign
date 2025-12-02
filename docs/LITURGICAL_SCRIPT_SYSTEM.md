# Liturgical Script System

> **Navigation Hub for Liturgical Script Documentation**
>
> The liturgical script system generates documents (programs, scripts) for sacraments and sacramentals. It renders entity data to HTML, PDF, and Word formats with consistent styling and structure.

## Documentation Structure

This documentation is organized into focused category files for easier navigation and maintenance.

### Core Documentation Files

**[OVERVIEW.md](./liturgical-script-system/OVERVIEW.md)**
- System purpose and architecture
- Module registry (all 7 modules using content builders)
- Template selector pattern
- Architecture consistency across modules

**[WITHRELATIONS.md](./liturgical-script-system/WITHRELATIONS.md)**
- WithRelations pattern for fetching entity data
- Interface definitions
- Implementation guide
- Complete wedding module example

**[TEMPLATES.md](./liturgical-script-system/TEMPLATES.md)**
- Template creation steps
- Helper function patterns
- Shared section builders
- Template registration
- Critical rules (no fallback logic, title/subtitle pattern, calculation placement)

**[PRINT_EXPORT.md](./liturgical-script-system/PRINT_EXPORT.md)**
- Print page setup
- PDF export API routes
- Word export API routes
- Filename patterns and best practices

**[VIEW_INTEGRATION.md](./liturgical-script-system/VIEW_INTEGRATION.md)**
- ModuleViewContainer integration (recommended)
- Manual integration patterns
- Template configuration
- Complete setup checklist

---

## Quick Reference

### System Output Formats

1. **HTML** - Web view and print page (browser print)
2. **PDF** - Generated via API route, downloadable
3. **Word** - Generated via API route, downloadable

### Key Files in Codebase

- **Content types:** `src/lib/types/liturgy-content.ts`
- **Styles:** `src/lib/styles/liturgical-script-styles.ts`
- **Renderers:** `src/lib/renderers/` (html-renderer.tsx, pdf-renderer.ts, word-renderer.ts)
- **Shared builders:** `src/lib/content-builders/shared/script-sections.ts`

### Common Tasks

| When you need to... | Read this file |
|---------------------|----------------|
| **Set up a new module with liturgical scripts** | [VIEW_INTEGRATION.md](./liturgical-script-system/VIEW_INTEGRATION.md) - Complete setup checklist |
| **Create content builder templates** | [TEMPLATES.md](./liturgical-script-system/TEMPLATES.md) - Template creation steps |
| **Fetch entity data for templates** | [WITHRELATIONS.md](./liturgical-script-system/WITHRELATIONS.md) - WithRelations pattern |
| **Add print and export functionality** | [PRINT_EXPORT.md](./liturgical-script-system/PRINT_EXPORT.md) - Print pages and API routes |
| **Understand system architecture** | [OVERVIEW.md](./liturgical-script-system/OVERVIEW.md) - System overview |

---

## Module Registry

All 7 modules with content builders follow a consistent architecture pattern:

| Module | Templates | View Pattern | Template Selector |
|--------|-----------|--------------|-------------------|
| Weddings | 2 (EN, ES) | ModuleViewContainer | View page |
| Funerals | 2 (EN, ES) | ModuleViewContainer | View page |
| Baptisms | 2 (EN, ES) | ModuleViewContainer | View page |
| Presentations | 3 (EN, ES, Bilingual) | ModuleViewContainer | View page |
| Quinceañeras | 2 (EN, ES) | ModuleViewContainer | View page |
| Masses | 2 (EN, ES) | ModuleViewContainer | View page |
| Mass Intentions | 2 (EN, ES) | ModuleViewContainer | View page |

**See [OVERVIEW.md](./liturgical-script-system/OVERVIEW.md) for complete module registry details.**

---

## Critical Rules

### 🔴 No Fallback Logic in Templates

Template files must NEVER contain `||` fallback operators or ternary operators for alternate text. ALL fallback logic must be handled in helper functions.

**Why:** Consistency, maintainability, testability, clarity.

**See [TEMPLATES.md](./liturgical-script-system/TEMPLATES.md#-no-fallback-logic-in-templates) for complete details and examples.**

### 🔴 Title/Subtitle Pattern

Title and subtitle must ONLY be set at the document level. NEVER add them to section elements.

**Why:** Prevents duplication - renderers display title/subtitle automatically.

**See [TEMPLATES.md](./liturgical-script-system/TEMPLATES.md#-titlesubtitle-pattern-no-duplication) for complete details and examples.**

### 🔴 Always Create helpers.ts

Always create a `helpers.ts` file for shared calculations and logic used across multiple templates. Export these helpers from `index.ts` for easy importing.

**Why:** Reusability across all templates (English, Spanish, Simple, Bilingual, etc.).

**See [TEMPLATES.md](./liturgical-script-system/TEMPLATES.md#-calculation-placement-for-reusability) for complete details and examples.**

---

## Related Documentation

### Content Structure
- **[CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md)** - Section types, interfaces, strict vs. flexible patterns, shared builders
- **[CONTENT_BUILDER_STRUCTURE.md](./CONTENT_BUILDER_STRUCTURE.md)** - Standard liturgical script structure (Cover Page, Readings, Psalm, Petitions, Ceremony)
- **[LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md)** - Element types, usage rules, styling parameters, examples

### System Components
- **[RENDERER.md](./RENDERER.md)** - Complete renderer system documentation (HTML, PDF, Word converters)
- **[TEMPLATE_REGISTRY.md](./TEMPLATE_REGISTRY.md)** - Complete registry of all 19 templates across all 7 modules
- **[STYLE_VALUES.md](./STYLE_VALUES.md)** - Easy-to-edit style value reference

### Related Systems
- **[REPORT_BUILDER_SYSTEM.md](./REPORT_BUILDER_SYSTEM.md)** - Tabular reports with aggregations (different from liturgical scripts)
- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Complete module creation checklist
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - Module component patterns

### Utilities
- **[FORMATTERS.md](./FORMATTERS.md)** - Helper and formatting functions (dates, names, locations, page titles, filenames)
- **[DEFINITIONS.md](./DEFINITIONS.md)** - Liturgical and application terminology

---

## Reference Implementations

**Primary Reference:** Wedding module
- Content builder: `src/lib/content-builders/wedding/`
- View client: `src/app/(main)/weddings/[id]/wedding-view-client.tsx`
- Print page: `src/app/print/weddings/[id]/page.tsx`
- PDF route: `src/app/api/weddings/[id]/pdf/route.ts`
- Word route: `src/app/api/weddings/[id]/word/route.ts`

**Other Examples:**
- Funeral, Presentation, Baptism, Mass, Quinceañera, Mass Intention modules

All modules follow the same consistent architecture pattern documented in this system.
