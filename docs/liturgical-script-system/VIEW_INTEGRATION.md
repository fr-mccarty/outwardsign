# Liturgical Script System - View Integration

> **View Page Integration Patterns**
>
> This document covers how to integrate liturgical scripts into module view pages using ModuleViewContainer or manual integration.

## Table of Contents

1. [Overview](#overview)
2. [Option 1: ModuleViewContainer (Recommended)](#option-1-moduleviewcontainer-recommended)
3. [Option 2: Manual Integration](#option-2-manual-integration)
4. [Template Configuration](#template-configuration)
5. [Complete Setup Checklist](#complete-setup-checklist)
6. [Reference Implementations](#reference-implementations)
7. [Related Documentation](#related-documentation)

---

## Overview

**Two integration approaches:**
1. **ModuleViewContainer** (Recommended) - Handles layout, rendering, and export buttons automatically
2. **Manual Integration** - Custom layout with ModuleViewPanel and manual rendering

**Key components:**
- `ModuleViewContainer` - All-in-one container with side panel and content area
- `ModuleViewPanel` - Side panel with metadata, Print/PDF/Word buttons, and template selector
- `renderHTML()` - Renders LiturgyDocument to React elements

**Template selection:**
- Template selector appears on view pages (NOT edit pages)
- Integrated through `ModuleViewPanel` component
- Users select templates when viewing/exporting

---

## Option 1: ModuleViewContainer (Recommended)

Use `ModuleViewContainer` for consistent layout and automatic handling of liturgy rendering.

### File Location

`src/app/(main)/[module]/[id]/[entity]-view-client.tsx`

### Implementation Pattern

```typescript
'use client'

import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { ModuleViewContainer } from '@/components/module-view-container'
import { build[Module]Liturgy, [MODULE]_TEMPLATES } from '@/lib/content-builders/[module]'
import { update[Module] } from '@/lib/actions/[modules]'
import { generate[Module]Filename } from '@/lib/utils/formatters'

interface Props {
  [entity]: [Module]WithRelations
}

export function [Module]ViewClient({ [entity] }: Props) {
  const handleUpdateTemplate = async (templateId: string) => {
    await update[Module]([entity].id, {
      [module]_template_id: templateId,
    })
  }

  const getTemplateId = () => {
    return [entity].[module]_template_id || '[module]-full-script-english'
  }

  return (
    <ModuleViewContainer
      entity={[entity]}
      entityType="[Module]"
      modulePath="[modules]"
      generateFilename={generate[Module]Filename}
      buildLiturgy={build[Module]Liturgy}
      getTemplateId={getTemplateId}
      templateConfig={{
        currentTemplateId: [entity].[module]_template_id,
        templates: [MODULE]_TEMPLATES,
        templateFieldName: '[module]_template_id',
        defaultTemplateId: '[module]-full-script-english',
        onUpdateTemplate: handleUpdateTemplate,
      }}
    />
  )
}
```

### What ModuleViewContainer Handles

**Automatic features:**
- Side panel with metadata (ModuleViewPanel)
- Print/PDF/Word export buttons
- Template selector dialog
- Building liturgy document with selected template
- Rendering HTML content
- Two-column responsive layout (side panel + content)
- Consistent styling

**Props:**
- `entity` - Entity with relations
- `entityType` - Module name (e.g., "Wedding", "Funeral")
- `modulePath` - URL path (e.g., "weddings", "funerals")
- `generateFilename` - Function to generate export filenames
- `buildLiturgy` - Function to build liturgy document
- `getTemplateId` - Function to get current template ID
- `templateConfig` - Template selector configuration

### Template Configuration

```typescript
templateConfig={{
  currentTemplateId: [entity].[module]_template_id,
  templates: [MODULE]_TEMPLATES,
  templateFieldName: '[module]_template_id',
  defaultTemplateId: '[module]-full-script-english',
  onUpdateTemplate: handleUpdateTemplate,
}}
```

**Properties:**
- `currentTemplateId` - Current template ID from entity
- `templates` - Template registry object
- `templateFieldName` - Database field name for template ID
- `defaultTemplateId` - Default template if none selected
- `onUpdateTemplate` - Function to update template selection

### Filename Generator

```typescript
import { formatDateForFilename } from '@/lib/utils/formatters'

export function generate[Module]Filename(
  entity: [Module]WithRelations,
  extension: string
): string {
  const personName = entity.person?.last_name || 'Person'
  const date = formatDateForFilename(entity.event?.start_date)
  return `${personName}-[EventType]-${date}.${extension}`
}
```

---

## Option 2: Manual Integration

If you need custom layout, integrate ModuleViewPanel and rendering manually.

### File Location

`src/app/(main)/[module]/[id]/[entity]-view-client.tsx`

### Implementation Pattern

```typescript
'use client'

import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { build[Module]Liturgy, [MODULE]_TEMPLATES } from '@/lib/content-builders/[module]'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { update[Module] } from '@/lib/actions/[modules]'
import { Card, CardContent } from '@/components/ui/card'
import { generate[Module]Filename } from '@/lib/utils/formatters'

interface Props {
  [entity]: [Module]WithRelations
}

export function [Module]ViewClient({ [entity] }: Props) {
  // Build liturgy
  const templateId = [entity].[module]_template_id || '[module]-full-script-english'
  const liturgyDocument = build[Module]Liturgy([entity], templateId)
  const liturgyContent = renderHTML(liturgyDocument)

  const handleUpdateTemplate = async (templateId: string) => {
    await update[Module]([entity].id, {
      [module]_template_id: templateId,
    })
  }

  const getTemplateId = () => {
    return [entity].[module]_template_id || '[module]-full-script-english'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Side panel */}
      <div className="lg:col-span-1">
        <ModuleViewPanel
          entity={[entity]}
          entityType="[Module]"
          modulePath="[modules]"
          generateFilename={generate[Module]Filename}
          getTemplateId={getTemplateId}
          templateConfig={{
            currentTemplateId: [entity].[module]_template_id,
            templates: [MODULE]_TEMPLATES,
            templateFieldName: '[module]_template_id',
            defaultTemplateId: '[module]-full-script-english',
            onUpdateTemplate: handleUpdateTemplate,
          }}
        />
      </div>

      {/* Main content */}
      <div className="lg:col-span-3">
        <Card className="bg-card text-card-foreground border">
          <CardContent className="pt-6">
            {liturgyContent}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Manual Integration Steps

1. **Build liturgy document** - Call `build[Module]Liturgy()` with entity and template ID
2. **Render to HTML** - Call `renderHTML()` to convert document to React elements
3. **Create layout** - Use grid layout with side panel and content area
4. **Add ModuleViewPanel** - Side panel with metadata and export buttons
5. **Display content** - Render liturgy content in Card component

### Layout Pattern

```typescript
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Side panel - 1/4 width on large screens */}
  <div className="lg:col-span-1">
    <ModuleViewPanel {...props} />
  </div>

  {/* Main content - 3/4 width on large screens */}
  <div className="lg:col-span-3">
    <Card className="bg-card text-card-foreground border">
      <CardContent className="pt-6">
        {liturgyContent}
      </CardContent>
    </Card>
  </div>
</div>
```

---

## Template Configuration

### Update Handler

```typescript
const handleUpdateTemplate = async (templateId: string) => {
  await update[Module]([entity].id, {
    [module]_template_id: templateId,
  })
}
```

**Important:**
- Uses server action `update[Module]()`
- Updates `[module]_template_id` field in database
- Triggers page refresh to re-render with new template

### Template ID Getter

```typescript
const getTemplateId = () => {
  return [entity].[module]_template_id || '[module]-full-script-english'
}
```

**Purpose:**
- Returns current template ID
- Falls back to default English template
- Used by ModuleViewPanel for template selector

### Template Registry

```typescript
import { [MODULE]_TEMPLATES } from '@/lib/content-builders/[module]'

templateConfig={{
  currentTemplateId: [entity].[module]_template_id,
  templates: [MODULE]_TEMPLATES,
  templateFieldName: '[module]_template_id',
  defaultTemplateId: '[module]-full-script-english',
  onUpdateTemplate: handleUpdateTemplate,
}}
```

**Template registry includes:**
- Template IDs (keys)
- Template metadata (name, description)
- Builder functions
- Supported languages

---

## Complete Setup Checklist

When adding liturgical scripts to a new module:

### Data Layer
- [ ] Create `[Module]WithRelations` interface in `lib/actions/[module].ts`
- [ ] Create `get[Module]WithRelations()` function
- [ ] Test fetching entity with all relations

### Content Builders
- [ ] Create `lib/content-builders/[module]/` directory
- [ ] Create `helpers.ts` with shared calculations and logic (🔴 CRITICAL for reusability)
- [ ] Create template files in `templates/` subdirectory
- [ ] Create template registry in `index.ts`
- [ ] Export helpers from `index.ts` (`export * from './helpers'`)
- [ ] Export `build[Module]Liturgy()` function

### Print and Export
- [ ] Create print page at `app/print/[module-plural]/[id]/page.tsx`
- [ ] Create PDF route at `app/api/[module-plural]/[id]/pdf/route.ts`
- [ ] Create Word route at `app/api/[module-plural]/[id]/word/route.ts`
- [ ] Create filename generator function

### View Integration
- [ ] Update view client to use `ModuleViewContainer` or manual integration
- [ ] Add `handleUpdateTemplate` function
- [ ] Add `getTemplateId` function
- [ ] Configure `templateConfig` prop
- [ ] Test template switching

### Testing
- [ ] Test HTML view (view page)
- [ ] Test print page (browser print)
- [ ] Test PDF export
- [ ] Test Word export
- [ ] Test template switching
- [ ] Test with missing relations (null/undefined)

---

## Reference Implementations

### Primary Reference

**Wedding module:**
- View client: `src/app/(main)/weddings/[id]/wedding-view-client.tsx`
- Content builder: `src/lib/content-builders/wedding/`
- Print page: `src/app/print/weddings/[id]/page.tsx`
- PDF route: `src/app/api/weddings/[id]/pdf/route.ts`
- Word route: `src/app/api/weddings/[id]/word/route.ts`

### Other Examples

**Similar implementations:**
- Funeral module: `src/app/(main)/funerals/[id]/funeral-view-client.tsx`
- Baptism module: `src/app/(main)/baptisms/[id]/baptism-view-client.tsx`
- Presentation module: `src/app/(main)/presentations/[id]/presentation-view-client.tsx`
- Mass module: `src/app/(main)/masses/[id]/mass-view-client.tsx`

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and architecture
- **[WITHRELATIONS.md](./WITHRELATIONS.md)** - Fetching entity data with relations
- **[TEMPLATES.md](./TEMPLATES.md)** - Template creation and builder patterns
- **[PRINT_EXPORT.md](./PRINT_EXPORT.md)** - Print pages and export API routes
- **[MODULE_COMPONENT_PATTERNS.md](../MODULE_COMPONENT_PATTERNS.md)** - View client patterns
- **[RENDERER.md](../RENDERER.md)** - Complete renderer system documentation
