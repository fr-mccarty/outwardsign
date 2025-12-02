# Phase 2 Documentation Audit - Implementation Plan

**Status:** In Progress
**Created:** 2025-12-01
**Target:** Split 8 files over 1000 lines into focused, category-specific files

---

## Overview

Following the successful Phase 1 pattern (COMPONENT_REGISTRY split), this plan addresses the remaining 8 files identified in the documentation audit that exceed 1000 lines.

### Success Criteria
- Each split file under 800 lines (ideally under 600)
- Clear category boundaries
- Comprehensive cross-references
- Lightweight index/hub file for each category
- Originals preserved in archive
- All references updated in CLAUDE.md and other docs

---

## Files to Split

| File | Lines | Priority | Status |
|------|-------|----------|--------|
| CONTENT_BUILDER_SECTIONS.md | 1443 | High | Planned |
| PICKERS.md | 1312 | High | Planned |
| MODULE_COMPONENT_PATTERNS.md | 1171 | Critical | Planned |
| EDIT_FORM_PATTERN.md | 1108 | High | Planned |
| LITURGICAL_SCRIPT_SYSTEM.md | 1104 | Medium | Complete |
| FORMATTERS.md | 1102 | High | Complete |
| CODE_CONVENTIONS.md | 1086 | High | Planned |
| MASS_TEMPLATE.md | 1001 | Medium | Complete |

---

## 1. FORMATTERS.md (1102 lines) - IN PROGRESS

### Split Structure
```
docs/formatters/
├── index.md (Overview, critical rules, navigation) ~250 lines
├── date-functions.md (All date/time formatters) ~350 lines
├── entity-functions.md (Person, location, event, reading) ~300 lines
├── generators.md (Page titles, filenames) ~150 lines
└── creating-helpers.md (Guidelines for new helpers) ~100 lines
```

### Files Created
- [x] `formatters/index.md` - Created

### Files Remaining
- [ ] `formatters/date-functions.md`
- [ ] `formatters/entity-functions.md`
- [ ] `formatters/generators.md`
- [ ] `formatters/creating-helpers.md`
- [ ] Move original to `archive/FORMATTERS.md`
- [ ] Update references in CLAUDE.md

---

## 2. MODULE_COMPONENT_PATTERNS.md (1171 lines) - CRITICAL

**Priority:** CRITICAL - Referenced heavily in module creation workflow

### Split Structure
```
docs/module-patterns/
├── index.md (Overview, 8-file structure, quick ref) ~200 lines
├── server-pages.md (List, View, Edit, Create patterns) ~400 lines
├── client-components.md (List client, Wrapper, Form, View) ~400 lines
└── checklist.md (Verification checklist) ~100 lines
```

### Content Breakdown

**index.md:**
- Overview of 8-file pattern
- File structure table
- When to use which component
- Links to detailed patterns
- Quick reference table

**server-pages.md:**
- File 1: List Page (Server) - page.tsx
- File 3: Create Page (Server) - create/page.tsx
- File 4: View Page (Server) - [id]/page.tsx
- File 5: Edit Page (Server) - [id]/edit/page.tsx
- Next.js 15 searchParams pattern
- Auth checks
- Data fetching patterns

**client-components.md:**
- File 2: List Client - [entities]-list-client.tsx
- File 6: Form Wrapper - [entity]-form-wrapper.tsx
- File 7: Unified Form - [entity]-form.tsx
- File 8: View Client - [id]/[entity]-view-client.tsx
- Client/server component boundaries
- State management
- Event handling

**checklist.md:**
- File creation checklist
- Naming conventions verification
- Import patterns verification
- Common mistakes to avoid

### Cross-References
- From: CLAUDE.md (multiple references)
- From: MODULE_CHECKLIST.md
- From: LIST_VIEW_PATTERN.md
- To: MODULE_DEVELOPMENT.md
- To: FORMS.md

---

## 3. PICKERS.md (1312 lines) - HIGH PRIORITY

### Split Structure
```
docs/pickers/
├── index.md (Overview, architecture, when to use) ~200 lines
├── core-picker.md (CorePicker & CorePickerField) ~400 lines
├── creating-pickers.md (Step-by-step guide) ~400 lines
└── advanced-features.md (Custom forms, validation, memo) ~300 lines
```

### Content Breakdown

**index.md:**
- Overview of picker system
- Picker architecture diagram
- Available pickers registry
- When to use which picker
- Quick reference patterns

**core-picker.md:**
- CorePicker component API
- CorePickerField wrapper
- Props and configuration
- Basic usage examples
- Dialog patterns

**creating-pickers.md:**
- Step 1: Create Picker Component
- Step 2: Create PickerField Wrapper
- Step 3: Add to COMPONENT_REGISTRY
- Example: Full PeoplePicker implementation
- Testing pickers

**advanced-features.md:**
- Custom creation forms
- Validation patterns
- Memoization for performance
- Search and filtering
- Complex picker scenarios

### Cross-References
- From: CLAUDE.md
- From: COMPONENT_REGISTRY (multiple pickers)
- From: FORMS.md
- To: MODULE_DEVELOPMENT.md

---

## 4. CONTENT_BUILDER_SECTIONS.md (1443 lines)

### Split Structure
```
docs/content-builder-sections/
├── index.md (Overview, section types, patterns) ~250 lines
├── strict-sections.md (Reading, Psalm, Gospel, Petitions) ~400 lines
├── flexible-sections.md (Cover, Ceremony, Announcements) ~400 lines
├── page-breaks.md (Page break management) ~200 lines
└── shared-builders.md (Reusable section builders) ~200 lines
```

### Content Breakdown

**index.md:**
- Overview of content builder section system
- Section type hierarchy
- Strict vs flexible sections
- Quick reference table
- Usage in liturgical scripts

**strict-sections.md:**
- ReadingSection interface
- PsalmSection interface
- GospelSection interface
- PetitionsSection interface
- Type safety patterns
- Validation rules

**flexible-sections.md:**
- CoverPageSection interface
- CeremonySection interface
- AnnouncementsSection interface
- HTML content patterns
- Styling guidelines

**page-breaks.md:**
- Page break patterns
- Before/after rules
- Print optimization
- Content builder integration

**shared-builders.md:**
- buildReadingSection()
- buildPsalmSection()
- buildGospelSection()
- buildPetitionsSection()
- Reusability patterns

### Cross-References
- From: CLAUDE.md
- From: LITURGICAL_SCRIPT_SYSTEM.md
- From: CONTENT_BUILDER_STRUCTURE.md
- To: RENDERER.md

---

## 5. EDIT_FORM_PATTERN.md (1108 lines)

### Split Structure
```
docs/forms/
├── edit-pattern-index.md (Overview, 3-layer architecture) ~200 lines
├── edit-page-server.md (Layer 1: Server page) ~300 lines
├── edit-form-wrapper.md (Layer 2: Wrapper) ~250 lines
├── edit-unified-form.md (Layer 3: Form implementation) ~350 lines
└── edit-pattern-checklist.md (Verification checklist) ~100 lines
```

### Content Breakdown

**edit-pattern-index.md:**
- Overview of 3-layer architecture
- Layer diagram
- Data flow
- When to use this pattern
- Quick reference

**edit-page-server.md:**
- File structure: [id]/edit/page.tsx
- Auth checks
- Data fetching with relations
- Breadcrumb setup
- Error handling
- Passing data to wrapper

**edit-form-wrapper.md:**
- Client component wrapper
- PageContainer integration
- Action buttons (edit mode only)
- State management
- Form submission handling

**edit-unified-form.md:**
- Unified form pattern (create + edit)
- Mode detection (isEditing)
- Form state management
- Validation patterns
- Redirection after save
- Field rendering patterns

**edit-pattern-checklist.md:**
- Layer 1 checklist
- Layer 2 checklist
- Layer 3 checklist
- Common mistakes
- Verification steps

### Cross-References
- From: CLAUDE.md
- From: MODULE_COMPONENT_PATTERNS.md
- To: FORMS.md
- To: VALIDATION.md

---

## 6. CODE_CONVENTIONS.md (1086 lines)

### Split Structure
```
docs/conventions/
├── index.md (Overview, general conventions) ~250 lines
├── bilingual-ui.md (Bilingual implementation) ~250 lines
├── ui-patterns.md (Dialog, empty states, click hierarchy) ~350 lines
└── development-guidelines.md (Component usage, Rule of Three) ~250 lines
```

### Content Breakdown

**index.md:**
- General code style
- Import order
- TypeScript patterns
- Server vs Client components
- Project organization
- Spelling and typos

**bilingual-ui.md:**
- 🔴 Bilingual implementation (CRITICAL)
- Homepage translations
- Constants pattern (en/es)
- Hard-coded .en (temporary)
- Verification checklist
- Coming soon: language selector

**ui-patterns.md:**
- Dialog and modal standards
- 🔴 DialogButton component (CRITICAL)
- Empty states
- Tables
- Scrollable modals
- Language selector placement
- 🔴 Click hierarchy (CRITICAL)

**development-guidelines.md:**
- Component usage hierarchy
- TypeScript patterns
- Responsive design
- Supabase auth integration
- Consistent design patterns
- Abstraction principle (Rule of Three)
- 🔴 Helper utilities pattern

### Cross-References
- From: CLAUDE.md (multiple sections)
- To: FORMATTERS.md
- To: ARCHITECTURE.md
- To: DESIGN_PRINCIPLES.md
- To: FORMS.md

---

## 7. LITURGICAL_SCRIPT_SYSTEM.md (1104 lines) - ✅ COMPLETE

### Split Structure (COMPLETED)
```
docs/liturgical-script-system/
├── OVERVIEW.md (System overview, module registry) ~161 lines
├── WITHRELATIONS.md (WithRelations pattern) ~348 lines
├── TEMPLATES.md (Template creation, helpers, builders) ~656 lines
├── PRINT_EXPORT.md (Print pages, PDF/Word API routes) ~374 lines
└── VIEW_INTEGRATION.md (View page integration, checklist) ~371 lines

docs/LITURGICAL_SCRIPT_SYSTEM.md (Navigation hub) ~154 lines
docs/archive/LITURGICAL_SCRIPT_SYSTEM_ORIGINAL.md (Original archived) ~1104 lines
```

### Files Created
- [x] `liturgical-script-system/OVERVIEW.md` - 161 lines
- [x] `liturgical-script-system/WITHRELATIONS.md` - 348 lines
- [x] `liturgical-script-system/TEMPLATES.md` - 656 lines
- [x] `liturgical-script-system/PRINT_EXPORT.md` - 374 lines
- [x] `liturgical-script-system/VIEW_INTEGRATION.md` - 371 lines
- [x] `LITURGICAL_SCRIPT_SYSTEM.md` - Replaced with navigation hub (154 lines)
- [x] `archive/LITURGICAL_SCRIPT_SYSTEM_ORIGINAL.md` - Original archived

### Split Strategy

**OVERVIEW.md (161 lines):**
- System purpose and architecture
- Module registry (all 7 modules using content builders)
- Template selector pattern
- Architecture consistency across modules

**WITHRELATIONS.md (348 lines):**
- The problem with base types
- The WithRelations solution
- Implementation steps (interface, fetch function, usage)
- Complete wedding module example
- Why this matters for content builders

**TEMPLATES.md (656 lines):**
- Template system overview
- Directory structure (index.ts, helpers.ts, templates/)
- Template creation steps (3 steps)
- Critical rules (calculation placement, no fallback logic, title/subtitle pattern)
- Helper function patterns
- Shared section builders
- Template registration

**PRINT_EXPORT.md (374 lines):**
- Print page setup and styling
- PDF export API route implementation
- Word export API route implementation
- Filename patterns and best practices

**VIEW_INTEGRATION.md (371 lines):**
- ModuleViewContainer integration (recommended approach)
- Manual integration patterns
- Template configuration
- Complete setup checklist
- Reference implementations

### Cross-References
- From: CLAUDE.md
- From: TEMPLATE_REGISTRY.md
- To: CONTENT_BUILDER_SECTIONS.md
- To: CONTENT_BUILDER_STRUCTURE.md
- To: RENDERER.md

---

## 8. MASS_TEMPLATE.md (1001 lines) - ✅ COMPLETE

### Split Structure (COMPLETED)
```
docs/mass-template/
├── OVERVIEW.md (System architecture, data structures) ~281 lines
├── DATABASE.md (Schema, migrations, constraints) ~326 lines
├── WORKFLOWS.md (Workflows, real-world example) ~484 lines
└── IMPLEMENTATION.md (Components, server actions, UI) ~628 lines

docs/MASS_TEMPLATE.md (Navigation hub) ~244 lines
docs/archive/MASS_TEMPLATE_ORIGINAL.md (Original archived) ~1001 lines
```

### Files Created
- [x] `mass-template/OVERVIEW.md` - 281 lines
- [x] `mass-template/DATABASE.md` - 326 lines
- [x] `mass-template/WORKFLOWS.md` - 484 lines
- [x] `mass-template/IMPLEMENTATION.md` - 628 lines
- [x] `MASS_TEMPLATE.md` - Replaced with navigation hub (244 lines)
- [x] `archive/MASS_TEMPLATE_ORIGINAL.md` - Original archived

### Split Strategy

**OVERVIEW.md (281 lines):**
- System overview and key concepts
- Four-table architecture with diagrams
- TypeScript interface definitions for all 4 entities
- Data structure examples with JSON
- Critical relationships explanation

**DATABASE.md (326 lines):**
- Complete schema for all 4 tables
- Migration file details and execution order
- Constraints (unique, check, foreign keys)
- Indexes for performance
- RLS policies
- Delete protection logic
- Table relationship diagrams

**WORKFLOWS.md (484 lines):**
- Phase 1-6 complete workflow
- Real-world example: St. Mary's Parish
- Database state at each step
- SQL query examples
- Assignment flow code examples
- Data flow examples

**IMPLEMENTATION.md (628 lines):**
- Template management components (9 files)
- Template item components (3 components)
- Mass form integration
- Complete server actions API
- UI behavior (drag-and-drop, debouncing, role assignment)
- Delete protection implementation
- Code examples for common operations

### Cross-References
- From: MASSES.md
- To: MODULE_COMPONENT_PATTERNS.md
- To: FORMS.md
- To: COMPONENT_REGISTRY.md
- To: DRAG_AND_DROP.md

---

## Implementation Steps (Per File)

### 1. Create Directory Structure
```bash
mkdir -p docs/[category-name]
```

### 2. Create Index File
- Overview section
- Table of contents with links to split files
- Critical rules section
- Quick reference
- Related documentation links

### 3. Create Category Files
- Extract relevant content from original
- Add cross-references to related files
- Include "See also" sections
- Add navigation back to index

### 4. Create Checklist/Guide File (if applicable)
- Step-by-step procedures
- Common mistakes
- Verification steps

### 5. Archive Original
```bash
mv docs/ORIGINAL.md archive/ORIGINAL.md
```

### 6. Update References
- Update CLAUDE.md references
- Update cross-references in other docs
- Update any import/link statements

### 7. Verify
- All content preserved
- Cross-references work
- No broken links
- Consistent formatting
- Each file under 800 lines

---

## Quality Standards

### Each Index File Must Have:
- Brief overview (2-3 paragraphs)
- Table of contents with descriptions
- Links to all split files
- Quick reference section
- Related documentation section

### Each Split File Must Have:
- Clear title and purpose
- Table of contents (if over 200 lines)
- Cross-references to related files
- Navigation back to index
- Consistent formatting

### Each Set of Files Must Have:
- Logical category boundaries
- No content duplication
- Complete coverage of original content
- Comprehensive cross-referencing
- Clear navigation paths

---

## Progress Tracking

### Completed
- [x] Phase 1: COMPONENT_REGISTRY.md split (reference implementation)
- [x] LITURGICAL_SCRIPT_SYSTEM.md (5 files: OVERVIEW, WITHRELATIONS, TEMPLATES, PRINT_EXPORT, VIEW_INTEGRATION)
- [x] FORMATTERS.md (5 files: index, DATE_FUNCTIONS, ENTITY_FUNCTIONS, GENERATORS, CREATING_HELPERS)
- [x] MASS_TEMPLATE.md (4 files: OVERVIEW, DATABASE, WORKFLOWS, IMPLEMENTATION)

### Pending
- [ ] MODULE_COMPONENT_PATTERNS.md (CRITICAL priority)
- [ ] PICKERS.md
- [ ] CONTENT_BUILDER_SECTIONS.md
- [ ] EDIT_FORM_PATTERN.md
- [ ] CODE_CONVENTIONS.md

---

## Next Steps

1. ✅ ~~Complete FORMATTERS.md split~~
2. ✅ ~~Complete MASS_TEMPLATE.md split~~
3. Split MODULE_COMPONENT_PATTERNS.md (CRITICAL priority)
4. Split PICKERS.md (HIGH priority)
5. Split CONTENT_BUILDER_SECTIONS.md
6. Split EDIT_FORM_PATTERN.md
7. Split CODE_CONVENTIONS.md
8. Final verification pass
9. Generate completion report with metrics

---

## Notes

- Follow Phase 1 pattern for consistency
- Keep index files lightweight (under 300 lines)
- Ensure each split file is focused and scannable
- Add comprehensive cross-references
- Preserve all critical markers (🔴)
- Update references immediately after splitting
