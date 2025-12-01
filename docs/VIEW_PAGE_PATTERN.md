# View Page Pattern

> **🔴 Context Requirement:** When implementing view pages for any module, you MUST include this file in your context. This file contains the authoritative pattern for all view pages to ensure consistency across the application.

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/[id]/`)

---

## Overview

Every module view page follows a consistent two-file pattern:
1. **Server Page** (`[id]/page.tsx`) - Wraps in PageContainer, fetches entity with relations
2. **View Client** (`[id]/[entity]-view-client.tsx`) - Uses ModuleViewContainer to render entity

This consistency ensures:
- Predictable user experience across all modules
- Proper layout with side panel for metadata and actions
- Consistent liturgical content rendering
- Standardized export functionality

---

## Server Page Pattern

**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/`

### Pattern Reference

**See:** `src/app/(main)/weddings/[id]/page.tsx` for the complete implementation.

**Key elements:**
- Parse `params` as Promise (Next.js 15)
- Authenticate user and redirect if not logged in
- Fetch entity using `get[Entity]WithRelations(id)`
- Return `notFound()` if entity doesn't exist
- Build dynamic title using page title formatter
- Set breadcrumbs with current page having no `href`
- Wrap in `PageContainer` with title and description
- NO `primaryAction` on PageContainer (actions are in view client)
- Render view client component with entity data

### Key Requirements

- 🔴 **MUST wrap in PageContainer** with:
  - `title` - Dynamic title based on entity (use formatter function)
  - `description` - Brief description (e.g., "Preview and download liturgy documents")
  - NO `primaryAction` - Actions are in the view client (ModuleViewContainer)
- ✅ Parse `params` as Promise (Next.js 15)
- ✅ Authenticate user first
- ✅ Fetch entity **WithRelations** (includes all related data)
- ✅ Return `notFound()` if entity doesn't exist
- ✅ Use entity-specific page title formatter (e.g., `getWeddingPageTitle()`)
- ✅ Breadcrumbs: Dashboard → Module List → "View"
- ✅ Current breadcrumb ("View") should only have `label` (no `href`)

### Page Title Formatters

Each module should have a page title formatter function:

**Pattern:** `get[Entity]PageTitle(entity: [Entity]WithRelations): string`

**Location:** `src/lib/utils/formatters.ts`

**Examples:**
- `getWeddingPageTitle(wedding)` → "Smith-Jones-Wedding"
- `getFuneralPageTitle(funeral)` → "John Doe-Funeral"
- `getBaptismPageTitle(baptism)` → "Mary Smith-Baptism"

**Format:** `[DynamicContent]-[ModuleName]`

See [FORMATTERS.md](./FORMATTERS.md) for complete documentation.

---

## View Client Pattern

**File:** `[entity]-view-client.tsx` in `app/(main)/[entity-plural]/[id]/`

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ PageContainer (in server page)                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ModuleViewContainer                                     │ │
│ │ ┌──────────────────────┬────────────────────────────┐   │ │
│ │ │ Main Content Area    │ Side Panel (Metadata)      │   │ │
│ │ │                      │ ┌────────────────────────┐ │   │ │
│ │ │ Rendered Liturgy     │ │ Status Badge           │ │   │ │
│ │ │ (HTML from content   │ │ Event Date/Time        │ │   │ │
│ │ │ builder)             │ │ Location               │ │   │ │
│ │ │                      │ │ Presider               │ │   │ │
│ │ │                      │ │ Custom Details         │ │   │ │
│ │ │                      │ ├────────────────────────┤ │   │ │
│ │ │                      │ │ Edit Button            │ │   │ │
│ │ │                      │ │ Print View Button      │ │   │ │
│ │ │                      │ ├────────────────────────┤ │   │ │
│ │ │                      │ │ Download PDF           │ │   │ │
│ │ │                      │ │ Download Word          │ │   │ │
│ │ │                      │ ├────────────────────────┤ │   │ │
│ │ │                      │ │ Template Selector      │ │   │ │
│ │ │                      │ ├────────────────────────┤ │   │ │
│ │ │                      │ │ Actions Dropdown       │ │   │ │
│ │ │                      │ │ • Delete               │ │   │ │
│ │ │                      │ └────────────────────────┘ │   │ │
│ │ └──────────────────────┴────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Pattern Reference

**See:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx` for the complete implementation.

**Key elements:**
- Client component (`'use client'`)
- Define helper functions: `generateFilename`, `getTemplateId`, `handleUpdateTemplate`
- Build `actionButtons` React node (Edit + Print View buttons)
- Build `exportButtons` React node (PDF + Word download buttons)
- Build `templateSelector` React node (TemplateSelectorDialog component)
- Build `details` React node (status badge, location, custom fields - all conditional)
- Return `ModuleViewContainer` with all required props

### Key Requirements

#### 1. ModuleViewContainer Props

🔴 **CRITICAL: Must use ModuleViewContainer** - This component provides the standard layout with side panel, liturgy rendering, and all export functionality.

**Required Props:**
- `entity` - The full entity with relations
- `entityType` - Display name (e.g., "Wedding", "Funeral")
- `modulePath` - URL path for module (e.g., "weddings", "funerals")
- `mainEvent` - The primary event for this entity (e.g., `wedding.wedding_event`)
- `generateFilename` - Function that returns filename based on extension
- `buildLiturgy` - Content builder function for rendering liturgy
- `getTemplateId` - Function to extract template ID from entity
- `actionButtons` - React node with action buttons (Edit, Print View)
- `exportButtons` - React node with export buttons (PDF, Word)
- `templateSelector` - React node with template selector dialog
- `details` - React node with custom details for side panel
- `onDelete` - Delete function from server actions

#### 2. Action Buttons Pattern

**See:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx:41-53`

- Two buttons: Edit (primary style) and Print View (outline style)
- Both use `Button asChild` with `Link` for navigation
- Edit links to `/[entities]/${entity.id}/edit`
- Print View links to `/print/[entities]/${entity.id}` with `target="_blank"`
- Both full width with appropriate icons (Edit, Printer)

#### 3. Export Buttons Pattern

**See:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx:56-71`

- Two buttons: Download PDF and Download Word (both outline style, full width)
- PDF links to `/api/[entities]/${entity.id}/pdf?filename=${generateFilename('pdf')}` with `target="_blank"`
- Word links to `/api/[entities]/${entity.id}/word?filename=${generateFilename('docx')}`
- Both include `filename` query param using `generateFilename()` helper
- Appropriate icons (FileText for PDF, Download for Word)

#### 4. Template Selector Pattern

**See:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx:74-81`

- Uses `TemplateSelectorDialog` component
- Passes `currentTemplateId` from entity (e.g., `entity.[entity]_template_id`)
- Passes module-specific templates constant (e.g., `WEDDING_TEMPLATES`)
- Passes `moduleName` for display
- Passes `onSave` callback that calls `update[Entity]()` server action
- Passes `defaultTemplateId` for fallback

#### 5. Details Section Pattern

**See:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx:84-104`

- Status badge at top using `ModuleStatusLabel` (conditional - only if status exists)
- Location section with name and optional address details (conditional)
- Border-top separator between sections (only if status exists)
- All content wrapped in conditional checks
- Additional module-specific details can be added as needed
- All details use semantic styling (font-medium labels, text-muted-foreground for secondary info)

#### 6. Helper Functions

**See:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx:20-39`

**generateFilename(extension: string):**
- Calls formatter function `get[Entity]Filename(entity, extension)`
- Returns properly formatted filename for downloads

**getTemplateId(entity: [Entity]WithRelations):**
- Extracts template ID from entity
- Returns template ID with fallback to default if not set
- Pattern: `entity.[entity]_template_id || '[default-template-id]'`

**handleUpdateTemplate(templateId: string):**
- Calls `update[Entity]()` server action
- Updates only the template ID field
- Used by TemplateSelectorDialog's `onSave` callback

---

## Common Mistakes to Avoid

❌ **Not using ModuleViewContainer** - This component is required for all view pages
❌ **Adding primaryAction to PageContainer** - Actions are in ModuleViewContainer, not PageContainer
❌ **Not fetching WithRelations** - Must use `get[Entity]WithRelations()`, not basic `get[Entity]()`
❌ **Missing notFound() check** - Always check if entity exists and return `notFound()` if not
❌ **Not using page title formatter** - Always use `get[Entity]PageTitle()` for consistent titles
❌ **Hardcoding template ID** - Use `getTemplateId()` function to handle default fallback
❌ **Missing filename parameter in export URLs** - Always include `?filename=...`
❌ **Not opening Print View in new tab** - Print View must have `target="_blank"`
❌ **Conditional details without existence checks** - Always check if data exists before rendering

---

## Checklist

When implementing a new view page, verify:

**Server Page:**
- [ ] Wrapped in `PageContainer`
- [ ] Has dynamic `title` using page title formatter
- [ ] Has `description` prop
- [ ] NO `primaryAction` prop
- [ ] Awaits `params` Promise
- [ ] Authenticates user first
- [ ] Fetches entity **WithRelations**
- [ ] Returns `notFound()` if entity doesn't exist
- [ ] Breadcrumbs: Dashboard → List → "View"
- [ ] Current breadcrumb has no `href`

**View Client:**
- [ ] Uses `ModuleViewContainer` component
- [ ] All required props passed to ModuleViewContainer
- [ ] Action buttons: Edit + Print View
- [ ] Export buttons: PDF + Word
- [ ] Template selector configured correctly
- [ ] Details section shows status, location, custom fields
- [ ] All details are conditional
- [ ] `generateFilename()` helper function
- [ ] `getTemplateId()` helper with default fallback
- [ ] `handleUpdateTemplate()` function
- [ ] Delete function passed to `onDelete` prop
- [ ] Print View opens in new tab
- [ ] Export URLs include filename parameter

---

## Reference Files

- **Server Page Example:** `src/app/(main)/weddings/[id]/page.tsx`
- **View Client Example:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx`
- **Components:**
  - `src/components/page-container.tsx`
  - `src/components/module-view-container.tsx`
  - `src/components/template-selector-dialog.tsx`
  - `src/components/module-status-label.tsx`
- **Formatters:** `src/lib/utils/formatters.ts`
- **Content Builders:** `src/lib/content-builders/[entity]/`
