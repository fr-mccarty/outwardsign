# ModuleViewContainer Pattern

## Overview

The `ModuleViewContainer` component provides a standardized layout for module view pages (weddings, funerals, baptisms, etc.). It manages the side panel and main content area with a consistent structure.

## Structure

The ModuleViewContainer accepts several props that define the content for different sections of the side panel:

### Side Panel Sections (in order)

1. **Actions Section** - Primary action buttons (Edit, Print View)
2. **Export Section** - Download buttons (PDF, Word)
3. **Template Selector Section** - Template selection dialog (if applicable)
4. **Details Section** - Entity details + auto-appended `created_at` timestamp
5. **Delete Section** - Delete button (if `onDelete` is provided)

### Required Props Pattern

For each module's view client component, you must generate and pass these props:

#### 1. Action Buttons (`actionButtons`)
```tsx
const actionButtons = (
  <>
    <Button asChild className="w-full">
      <Link href={`/[module-path]/[id]/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit [EntityType]
      </Link>
    </Button>
    <Button asChild variant="outline" className="w-full">
      <Link href={`/print/[module-path]/[id]`} target="_blank">
        <Printer className="h-4 w-4 mr-2" />
        Print View
      </Link>
    </Button>
  </>
)
```

#### 2. Export Buttons (`exportButtons`)
```tsx
const exportButtons = (
  <>
    <Button asChild variant="outline" className="w-full">
      <Link href={`/api/[module-path]/[id]/pdf?filename=${generateFilename('pdf')}`} target="_blank">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </Link>
    </Button>
    <Button asChild variant="outline" className="w-full">
      <Link href={`/api/[module-path]/[id]/word?filename=${generateFilename('docx')}`}>
        <Download className="h-4 w-4 mr-2" />
        Download Word
      </Link>
    </Button>
  </>
)
```

#### 3. Template Selector (`templateSelector`) - Optional
```tsx
const templateSelector = (
  <TemplateSelectorDialog
    currentTemplateId={entity.[module]_template_id}
    templates={[MODULE]_TEMPLATES}
    moduleName="[EntityType]"
    onSave={handleUpdateTemplate}
    defaultTemplateId="[default-template-id]"
  />
)
```

**Note:** Only include if the module uses liturgical templates (weddings, funerals, baptisms, masses, etc.)

#### 4. Details Section Content (`details`)
```tsx
const details = (
  <>
    {entity.status && (
      <div className="flex items-center gap-2">
        <span className="font-medium">Status:</span>
        <ModuleStatusLabel status={entity.status} statusType="module" />
      </div>
    )}

    {entity.[main_event]?.location && (
      <div className={entity.status ? "pt-2 border-t" : ""}>
        <span className="font-medium">Location:</span> {entity.[main_event].location.name}
        {(entity.[main_event].location.street || entity.[main_event].location.city || entity.[main_event].location.state) && (
          <div className="text-xs text-muted-foreground mt-1">
            {[entity.[main_event].location.street, entity.[main_event].location.city, entity.[main_event].location.state]
              .filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    )}

    {/* Add any module-specific details here */}
  </>
)
```

**Note:** The `created_at` timestamp is automatically appended by ModuleViewPanel - DO NOT include it manually.

## Required Imports

```tsx
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
```

## Complete Example (Wedding Module)

```tsx
"use client"

import { WeddingWithRelations, updateWedding, deleteWedding } from '@/lib/actions/weddings'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildWeddingLiturgy, WEDDING_TEMPLATES } from '@/lib/content-builders/wedding'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface WeddingViewClientProps {
  wedding: WeddingWithRelations
}

export function WeddingViewClient({ wedding }: WeddingViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${brideLastName}-${groomLastName}-${weddingDate}.${extension}`
  }

  // Extract template ID from wedding record
  const getTemplateId = (wedding: WeddingWithRelations) => {
    return wedding.wedding_template_id || 'wedding-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateWedding(wedding.id, {
      wedding_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/weddings/${wedding.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Wedding
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/weddings/${wedding.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/weddings/${wedding.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/weddings/${wedding.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={wedding.wedding_template_id}
      templates={WEDDING_TEMPLATES}
      moduleName="Wedding"
      onSave={handleUpdateTemplate}
      defaultTemplateId="wedding-full-script-english"
    />
  )

  // Generate details section content
  const details = (
    <>
      {wedding.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={wedding.status} statusType="module" />
        </div>
      )}

      {wedding.wedding_event?.location && (
        <div className={wedding.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {wedding.wedding_event.location.name}
          {(wedding.wedding_event.location.street || wedding.wedding_event.location.city || wedding.wedding_event.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[wedding.wedding_event.location.street, wedding.wedding_event.location.city, wedding.wedding_event.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={wedding}
      entityType="Wedding"
      modulePath="weddings"
      mainEvent={wedding.wedding_event}
      generateFilename={generateFilename}
      buildLiturgy={buildWeddingLiturgy}
      getTemplateId={getTemplateId}
      templateConfig={{
        currentTemplateId: wedding.wedding_template_id,
        templates: WEDDING_TEMPLATES,
        templateFieldName: 'wedding_template_id',
        defaultTemplateId: 'wedding-full-script-english',
        onUpdateTemplate: handleUpdateTemplate,
      }}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      details={details}
      onDelete={deleteWedding}
    />
  )
}
```

## Migration Checklist

When refactoring a module to use this new pattern:

- [ ] Add required imports (Button, ModuleStatusLabel, TemplateSelectorDialog, icons, Link)
- [ ] Create `actionButtons` constant with Edit and Print View buttons
- [ ] Create `exportButtons` constant with PDF and Word download buttons
- [ ] Create `templateSelector` constant (if module uses templates)
- [ ] Create `details` constant with Status, Location, and any module-specific details
- [ ] Pass all four sections to ModuleViewContainer
- [ ] Remove any old props that are no longer needed (templateConfig can stay for now, mainEvent can stay)
- [ ] Test the view page to ensure all sections render correctly

## Notes

- **created_at is automatic**: Do not include created_at in the details section - ModuleViewPanel automatically appends it
- **Template Selector is optional**: Only modules with liturgical templates (weddings, funerals, baptisms, masses, etc.) need the templateSelector prop
- **Details can be empty**: If there are no custom details to show, you can pass an empty fragment `<></>`
- **Conditional rendering**: Use conditional rendering for optional details (status, location, etc.)
