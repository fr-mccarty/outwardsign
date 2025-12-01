# Template Registry

> **Purpose:** Complete registry of all liturgical script templates across all modules with detailed information about each template.
>
> **See Also:**
> - **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Setup guide for content builders, print pages, and export routes
> - **[CONTENT_BUILDER_STRUCTURE.md](./CONTENT_BUILDER_STRUCTURE.md)** - Standard liturgical script structure
> - **[CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md)** - Section types and builder interfaces

This document provides a complete reference of all template files, their IDs, names, descriptions, and purposes across all 8 modules that use the content builder system.

---

## Table of Contents

- [Overview](#overview)
- [Template Summary by Module](#template-summary-by-module)
- [Detailed Template Registry](#detailed-template-registry)
  - [Weddings](#weddings)
  - [Funerals](#funerals)
  - [Baptisms](#baptisms)
  - [Group Baptisms](#group-baptisms)
  - [Presentations](#presentations)
  - [Quinceañeras](#quinceañeras)
  - [Masses](#masses)
  - [Mass Intentions](#mass-intentions)
- [Template Naming Conventions](#template-naming-conventions)
- [Adding New Templates](#adding-new-templates)

---

## Overview

**Total Modules with Templates:** 8
**Total Templates:** 19

Each module has a template registry in its `index.ts` file that defines available templates. Templates are referenced by their unique ID and can be selected on the view page via the template selector dialog.

**Template Location Pattern:**
```
src/lib/content-builders/[module]/
├── index.ts              # Template registry (TEMPLATES constant)
├── helpers.ts            # Module-specific helper functions
└── templates/
    ├── [template-1].ts   # Individual template builder functions
    └── [template-2].ts
```

---

## Template Summary by Module

| Module | Total Templates | English | Spanish | Bilingual | Special |
|--------|----------------|---------|---------|-----------|---------|
| **Weddings** | 2 | 1 (Full Script) | 1 (Full Script) | - | - |
| **Funerals** | 2 | 1 (Full Script) | 1 (Full Script) | - | - |
| **Baptisms** | 2 | 1 (Summary) | 1 (Summary) | - | - |
| **Group Baptisms** | 2 | 1 (Summary) | 1 (Summary) | - | - |
| **Presentations** | 3 | 1 (Full Script) | 1 (Full Script) | 1 | - |
| **Quinceañeras** | 2 | 1 (Full Script) | 1 (Full Script) | - | - |
| **Masses** | 2 | 1 | 1 | - | - |
| **Mass Intentions** | 2 | 1 (Summary) | 1 (Summary) | - | - |
| **TOTAL** | **19** | **8** | **8** | **1** | **0** |

**Template Types:**
- **Full Script** - Complete liturgy with all readings, responses, and directions
- **Summary** - Condensed information summary for sacristy use
- **Bilingual** - Combined English and Spanish content

---

## Detailed Template Registry

### Weddings

**Module Path:** `src/lib/content-builders/wedding/`
**Template Registry:** `WEDDING_TEMPLATES`
**Builder Function:** `buildWeddingLiturgy(wedding, templateId)`
**Total Templates:** 2

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `wedding-full-script-english` | Full Ceremony Script (English) | Complete wedding liturgy with all readings, responses, and directions | English | Full Script | `templates/full-script-english.ts` |
| `wedding-full-script-spanish` | Guión Completo de la Ceremonia (Español) | Liturgia completa de boda con todas las lecturas, respuestas e indicaciones | Spanish | Full Script | `templates/full-script-spanish.ts` |

**Default Template:** `wedding-full-script-english`

---

### Funerals

**Module Path:** `src/lib/content-builders/funeral/`
**Template Registry:** `FUNERAL_TEMPLATES`
**Builder Function:** `buildFuneralLiturgy(funeral, templateId)`
**Total Templates:** 2

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `funeral-full-script-english` | Full Funeral Liturgy Script (English) | Complete funeral liturgy with all readings, responses, and directions | English | Full Script | `templates/full-script-english.ts` |
| `funeral-full-script-spanish` | Guión Completo de la Liturgia Fúnebre (Español) | Liturgia fúnebre completa con todas las lecturas, respuestas e indicaciones | Spanish | Full Script | `templates/full-script-spanish.ts` |

**Default Template:** `funeral-full-script-english`

---

### Baptisms

**Module Path:** `src/lib/content-builders/baptism/`
**Template Registry:** `BAPTISM_TEMPLATES`
**Builder Function:** `buildBaptismLiturgy(baptism, templateId)`
**Total Templates:** 2

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `baptism-summary-english` | Baptism Summary (English) | Simple summary of all baptism information for sacristy use | English | Summary | `templates/summary-english.ts` |
| `baptism-summary-spanish` | Resumen del Bautismo (Español) | Resumen simple de toda la información del bautismo para uso en la sacristía | Spanish | Summary | `templates/summary-spanish.ts` |

**Default Template:** `baptism-summary-english`

**Note:** Baptism templates are summary-style (not full scripts) designed for quick reference in the sacristy.

---

### Group Baptisms

**Module Path:** `src/lib/content-builders/group-baptism/`
**Template Registry:** `GROUP_BAPTISM_TEMPLATES`
**Builder Function:** `buildGroupBaptismLiturgy(groupBaptism, templateId)`
**Total Templates:** 2

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `group-baptism-summary-english` | Group Baptism Summary (English) | Simple list of all baptisms in the group with child, parent, and godparent information | English | Summary | `templates/summary-english.ts` |
| `group-baptism-summary-spanish` | Resumen de Bautismo Grupal (Español) | Lista simple de todos los bautismos del grupo con información de niños, padres y padrinos | Spanish | Summary | `templates/summary-spanish.ts` |

**Default Template:** `group-baptism-summary-english`

**Note:** Group Baptism templates show a summary of all children being baptized in the group ceremony with their parents and godparents. Child names include pronunciation guides when available.

**Content Displayed:**
- Section title ("Baptisms in This Group" / "Bautismos en Este Grupo")
- For each child being baptized:
  - Child's full name with pronunciation (if available) **with inline avatar** (40x40px circular, displayed using `info-row-with-avatar` element)
  - Parents' names (mother and father)
  - Godparents' names (sponsor 1 and sponsor 2)
- Event date and time as subtitle

**Avatar Display:**
- Uses new `info-row-with-avatar` element type for inline avatar display
- Avatars appear inline to the left of the child's name (40x40px circular images)
- Avatars are displayed in HTML view only (not in PDF/Word exports)
- Gracefully falls back to regular `info-row` if child has no avatar_url

---

### Presentations

**Module Path:** `src/lib/content-builders/presentation/`
**Template Registry:** `PRESENTATION_TEMPLATES`
**Builder Function:** `buildPresentationLiturgy(presentation, templateId)`
**Total Templates:** 3

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `presentation-english` | Presentation in the Temple (English) | Complete presentation liturgy in English | English | Full Script | `templates/full-script-english.ts` |
| `presentation-spanish` | Presentación en el Templo (Español) | Complete presentation liturgy in Spanish | Spanish | Full Script | `templates/full-script-spanish.ts` |
| `presentation-bilingual` | Bilingual Presentation (English & Spanish) | Complete bilingual presentation liturgy | Bilingual | Full Script | `templates/bilingual.ts` |

**Default Template:** `presentation-english`

**Note:** Presentations includes full scripts in English, Spanish, and a bilingual option.

---

### Quinceañeras

**Module Path:** `src/lib/content-builders/quinceanera/`
**Template Registry:** `QUINCEANERA_TEMPLATES`
**Builder Function:** `buildQuinceaneraLiturgy(quinceanera, templateId)`
**Total Templates:** 2

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `quinceanera-full-script-english` | Full Ceremony Script (English) | Complete quinceañera liturgy with all readings, responses, and directions | English | Full Script | `templates/full-script-english.ts` |
| `quinceanera-full-script-spanish` | Guión Completo de la Ceremonia (Español) | Liturgia completa de quinceañera con todas las lecturas, respuestas e instrucciones | Spanish | Full Script | `templates/full-script-spanish.ts` |

**Default Template:** `quinceanera-full-script-english`

---

### Masses

**Module Path:** `src/lib/content-builders/mass/`
**Template Registry:** `MASS_TEMPLATES`
**Builder Function:** `buildMassLiturgy(mass, templateId)`
**Total Templates:** 2

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `mass-english` | Mass (English) | Mass information, liturgical event, liturgical color, ministers, role assignments, mass intention, petitions, and announcements | English | Summary | `templates/english.ts` |
| `mass-spanish` | Misa (Español) | Información de la misa, evento litúrgico, color litúrgico, ministros, asignaciones de roles, intención de la misa, peticiones y anuncios | Spanish | Summary | `templates/spanish.ts` |

**Default Template:** `mass-english`

**Note:** Mass templates focus on ministers, petitions, and announcements rather than full liturgical scripts.

**Fields Displayed:**
- Mass Information (date, time, location)
- Liturgical Event (linked feast day/solemnity)
- Liturgical Color (e.g., White, Red, Purple, Green, Gold, Rose, Black)
- Mass Intention (if linked)
- Ministers (Presider, Homilist)
- Role Assignments (from mass role templates)
- Notes
- Petitions
- Announcements

---

### Mass Intentions

**Module Path:** `src/lib/content-builders/mass-intention/`
**Template Registry:** `MASS_INTENTION_TEMPLATES`
**Builder Function:** `buildMassIntentionLiturgy(massIntention, templateId)`
**Total Templates:** 2

| Template ID | Name | Description | Language | Type | File |
|------------|------|-------------|----------|------|------|
| `mass-intention-summary-english` | Mass Intention Summary (English) | Summary of mass intention details in English | English | Summary | `templates/summary-english.ts` |
| `mass-intention-summary-spanish` | Resumen de Intención de Misa (Español) | Resumen de los detalles de la intención de misa en español | Spanish | Summary | `templates/summary-spanish.ts` |

**Default Template:** `mass-intention-summary-english`

---

## Template Naming Conventions

**Template IDs follow a consistent pattern:**

```
[module]-[type]-[language]
```

**Examples:**
- `wedding-full-script-english`
- `baptism-summary-spanish`
- `presentation-bilingual`

**Module Names (lowercase, singular):**
- `wedding`, `funeral`, `baptism`, `presentation`, `quinceanera`, `mass`, `mass-intention`

**Type Names:**
- `full-script` - Complete liturgy with all elements
- `summary` - Condensed information for quick reference

**Language Codes:**
- `english` - English only
- `spanish` - Spanish only (español)
- `bilingual` - Both English and Spanish

---

## Adding New Templates

When creating a new template for an existing module, follow these steps:

### 1. Create the Template File

**Location:** `src/lib/content-builders/[module]/templates/[new-template-name].ts`

**Pattern:**
```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { LiturgyDocument } from '@/lib/types/liturgy-content'
import { buildCoverPage, buildReadingSection } from '@/lib/content-builders/shared/script-sections'
// ... import other builders as needed

export function build[TemplateName]([entity]: [Module]WithRelations): LiturgyDocument {
  return {
    id: `[module]-${[entity].id}`,
    title: 'Template Title',
    metadata: {
      date: new Date().toISOString(),
      version: '1.0',
      language: 'en', // or 'es' or 'both'
    },
    sections: [
      // Build sections using shared builders
      buildCoverPage(...),
      buildReadingSection(...),
      // ...
    ],
  }
}
```

### 2. Register in Module Index

**Location:** `src/lib/content-builders/[module]/index.ts`

**Add to template registry:**
```typescript
export const [MODULE]_TEMPLATES: Record<string, LiturgyTemplate<[Module]WithRelations>> = {
  // ... existing templates
  '[module]-[new-template-id]': {
    id: '[module]-[new-template-id]',
    name: 'Template Display Name',
    description: 'What this template does',
    supportedLanguages: ['en'], // or ['es'] or ['en', 'es']
    builder: build[TemplateName],
  },
}
```

### 3. Update This Registry

Add the new template to the appropriate module section in this document with:
- Template ID
- Name (English and/or Spanish)
- Description
- Language
- Type
- File path

### 4. Test the Template

Run tests to verify:
- Template appears in template selector dialog on view page
- PDF export works correctly
- Word export works correctly
- Print view displays properly

---

## Template Database Field

Each module has a `[module]_template_id` field in the database that stores the selected template ID:

- `weddings.wedding_template_id`
- `funerals.funeral_template_id`
- `baptisms.baptism_template_id`
- `presentations.presentation_template_id`
- `quinceaneras.quinceanera_template_id`
- `masses.mass_template_id`
- `mass_intentions.mass_intention_template_id`

When no template is selected, the default template (first in registry) is used.

---

## Using This Registry

**To find a specific template:**
1. Locate the module in the table of contents
2. Find the template by ID or name in the module section
3. Check the file path to view implementation

**To add a new template:**
1. Follow the "Adding New Templates" section
2. Create the template file in the correct location
3. Register it in the module's index.ts
4. Update this registry document

**To understand template structure:**
- See [CONTENT_BUILDER_STRUCTURE.md](./CONTENT_BUILDER_STRUCTURE.md) for standard liturgical script structure
- See [CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md) for section types and builders
- See [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) for setup and implementation guide

---

## Notes

- **Template selection** happens on view pages via the `TemplateSelectorDialog` component in `ModuleViewPanel`
- **NOT on edit pages** - Template selection is a view/export concern, not an editing concern
- All templates use the same rendering system (HTML → PDF/Word)
- Templates share common section builders from `src/lib/content-builders/shared/script-sections.ts`
- Each module can have unlimited templates - the current count is just what exists today
- Future templates are noted in some module index files (see comments in FUNERAL_TEMPLATES, WEDDING_TEMPLATES)

---

**Last Updated:** 2025-11-17
**Total Templates:** 19
**Total Modules:** 7
