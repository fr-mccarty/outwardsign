# Liturgical Script System - Overview

> **System Introduction**
>
> The liturgical script system generates documents (programs, scripts) for sacraments and sacramentals. This document provides an overview of the system architecture and module registry.

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [System Purpose](#system-purpose)
3. [Modules Using Content Builders](#modules-using-content-builders)
4. [Architecture Consistency](#architecture-consistency)
5. [Template Selector Pattern](#template-selector-pattern)
6. [Related Documentation](#related-documentation)

---

## Quick Overview

**What this system does:**
- Builds liturgical documents from entity data
- Renders to HTML (web view), PDF, and Word
- Uses centralized styling for consistency

**Three output formats:**
1. **HTML** - Web view and print page (browser print)
2. **PDF** - Generated via API route, downloadable
3. **Word** - Generated via API route, downloadable

**Key files:**
- Content types: `src/lib/types/liturgy-content.ts`
- Styles: `src/lib/styles/liturgical-script-styles.ts`
- Renderers: `src/lib/renderers/` (html-renderer.tsx, pdf-renderer.ts, word-renderer.ts)
- Shared builders: `src/lib/content-builders/shared/script-sections.ts`

**For element types and styling parameters, see [LITURGICAL_SCRIPT_REFERENCE.md](../LITURGICAL_SCRIPT_REFERENCE.md).**

**For standard liturgical script structure (Cover Page, Readings, Psalm, Petitions, Ceremony), see [CONTENT_BUILDER_STRUCTURE.md](../CONTENT_BUILDER_STRUCTURE.md).**

**For section types and builder interfaces, see [CONTENT_BUILDER_SECTIONS.md](../CONTENT_BUILDER_SECTIONS.md).**

**For complete registry of all templates across all modules, see [TEMPLATE_REGISTRY.md](../TEMPLATE_REGISTRY.md).**

---

## System Purpose

**Note:** This system is for individual entity documents (weddings, funerals, etc.). For tabular reports with aggregations (mass intentions report), see [REPORT_BUILDER_SYSTEM.md](../REPORT_BUILDER_SYSTEM.md).

**Belief:** The Sacraments are the core activity of the Catholic Parish. Their proper celebration at every step is the evangelizing work of parishes.

**Important operational note:** Being fully prepared to celebrate a sacrament or a sacramental means having the summary and the script printed off in a binder and in the sacristy for the priest, deacon, or church leader to pick up and take it to action.

---

## Modules Using Content Builders

**All 7 modules with content builders follow a consistent architecture pattern.**

### Module Registry

| Module | Content Builder Path | Templates | View Pattern | Template Selector Location |
|--------|---------------------|-----------|--------------|---------------------------|
| **Weddings** | `src/lib/content-builders/wedding/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Funerals** | `src/lib/content-builders/funeral/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Baptisms** | `src/lib/content-builders/baptism/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Presentations** | `src/lib/content-builders/presentation/` | 3 (EN, ES, Bilingual) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Quinceañeras** | `src/lib/content-builders/quinceanera/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Masses** | `src/lib/content-builders/mass/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Mass Intentions** | `src/lib/content-builders/mass-intention/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |

### Template Counts

- **Most templates:** Presentations (3 templates - Full Script English, Full Script Spanish, Bilingual)
- **Standard modules:** All others have 2 templates (English and Spanish versions)

### Other Content Builders

**Non-module content builders** (not tied to specific sacrament modules):
- **Event** (`src/lib/content-builders/event/`) - Used for event liturgy scripts
- **Petitions** (`src/lib/content-builders/petitions/`) - Used for building petitions/intercessions
- **Shared** (`src/lib/content-builders/shared/`) - Shared utilities for script sections

---

## Architecture Consistency

**✅ All modules are consistent:**
- All use `ModuleViewContainer` in their view pages
- All have `templateConfig` passed to `ModuleViewContainer`
- Template selection happens on **view pages** (not edit pages)
- `TemplateSelectorDialog` is integrated through `ModuleViewPanel`
- Each module has a `[module]_template_id` field in the database

**Why this pattern:**
- Template selection affects how the liturgy document is rendered and exported
- Users select templates when viewing/exporting, not when editing entity data
- Keeps edit pages focused on entity-specific data (names, dates, etc.)
- Centralizes template UI through `ModuleViewPanel` component

---

## Template Selector Pattern

**Location:** Template selector is displayed on the **view page** in the side panel metadata section.

**NOT on edit pages:** Edit pages do not have template selectors. Template selection is a view/export concern.

### Implementation in view-client.tsx

```typescript
export function [Module]ViewClient({ [entity] }: Props) {
  const handleUpdateTemplate = async (templateId: string) => {
    await update[Module]([entity].id, {
      [module]_template_id: templateId,
    })
  }

  return (
    <ModuleViewContainer
      entity={[entity]}
      entityType="[Module]"
      modulePath="[modules]"
      generateFilename={generateFilename}
      buildLiturgy={build[Module]Liturgy}
      getTemplateId={getTemplateId}
      templateConfig={{
        currentTemplateId: [entity].[module]_template_id,
        templates: [MODULE]_TEMPLATES,
        templateFieldName: '[module]_template_id',
        defaultTemplateId: '[default-template-id]',
        onUpdateTemplate: handleUpdateTemplate,
      }}
    />
  )
}
```

---

## Related Documentation

### Setup and Implementation
- **[WITHRELATIONS.md](./WITHRELATIONS.md)** - WithRelations pattern for fetching entity data with relations
- **[TEMPLATES.md](./TEMPLATES.md)** - Template creation, helpers, and shared builders
- **[PRINT_EXPORT.md](./PRINT_EXPORT.md)** - Print pages and export API routes (PDF/Word)
- **[VIEW_INTEGRATION.md](./VIEW_INTEGRATION.md)** - View page integration patterns

### Content Structure
- **[CONTENT_BUILDER_SECTIONS.md](../CONTENT_BUILDER_SECTIONS.md)** - Section types, interfaces, strict vs. flexible patterns
- **[CONTENT_BUILDER_STRUCTURE.md](../CONTENT_BUILDER_STRUCTURE.md)** - Standard liturgical script structure (Cover Page, Readings, Psalm, Petitions)
- **[LITURGICAL_SCRIPT_REFERENCE.md](../LITURGICAL_SCRIPT_REFERENCE.md)** - Element types, usage rules, styling parameters

### System Components
- **[RENDERER.md](../RENDERER.md)** - Complete renderer system documentation (HTML, PDF, Word converters)
- **[TEMPLATE_REGISTRY.md](../TEMPLATE_REGISTRY.md)** - Complete registry of all templates across all modules
- **[STYLE_VALUES.md](../STYLE_VALUES.md)** - Easy-to-edit style value reference

### Related Systems
- **[REPORT_BUILDER_SYSTEM.md](../REPORT_BUILDER_SYSTEM.md)** - Tabular reports with aggregations (different from liturgical scripts)
- **[MODULE_CHECKLIST.md](../MODULE_CHECKLIST.md)** - Complete module creation checklist
