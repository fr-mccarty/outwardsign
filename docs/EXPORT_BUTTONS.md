# Export Buttons Pattern

Standard pattern for export functionality across all module view pages.

## Organization

| Section | Buttons | Variant |
|---------|---------|---------|
| **Actions** | Edit, Print View, Back (contextual) | Edit: `default`, Others: `outline` |
| **Export** | Download PDF, Download Word, Download Text | `default` |

## Icons

| Button | Icon | Import |
|--------|------|--------|
| Edit | `Pencil` or `Edit` | `lucide-react` |
| Print View | `Printer` | `lucide-react` |
| Back | `ArrowLeft` | `lucide-react` |
| Download PDF | `FileText` | `lucide-react` |
| Download Word | `FileDown` | `lucide-react` |
| Download Text | `File` | `lucide-react` |

## Code Pattern

```tsx
import { Edit, Printer, FileText, FileDown, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Action buttons
const actionButtons = (
  <>
    <Button asChild className="w-full">
      <Link href={`/${modulePath}/${entity.id}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit {EntityName}
      </Link>
    </Button>
    <Button asChild variant="outline" className="w-full">
      <Link href={`/print/${modulePath}/${entity.id}`} target="_blank">
        <Printer className="h-4 w-4 mr-2" />
        Print View
      </Link>
    </Button>
  </>
)

// Export buttons
const exportButtons = (
  <>
    <Button asChild variant="default" className="w-full">
      <Link href={`/api/${modulePath}/${entity.id}/pdf`} target="_blank">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </Link>
    </Button>
    <Button asChild variant="default" className="w-full">
      <Link href={`/api/${modulePath}/${entity.id}/word`}>
        <FileDown className="h-4 w-4 mr-2" />
        Download Word
      </Link>
    </Button>
    <Button asChild variant="default" className="w-full">
      <Link href={`/api/${modulePath}/${entity.id}/txt`}>
        <File className="h-4 w-4 mr-2" />
        Download Text
      </Link>
    </Button>
  </>
)
```

## Usage with ModuleViewPanel

Pass buttons to `ModuleViewPanel` or `ModuleViewContainer`:

```tsx
<ModuleViewPanel
  entity={entity}
  entityType="EntityName"
  modulePath="entities"
  actionButtons={actionButtons}
  exportButtons={exportButtons}
  details={details}
  onDelete={deleteEntity}
/>
```

## API Route Requirements

Each module needs three export routes:

| Route | Content-Type |
|-------|--------------|
| `/api/{module}/[id]/pdf/route.ts` | `application/pdf` |
| `/api/{module}/[id]/word/route.ts` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `/api/{module}/[id]/txt/route.ts` | `text/plain; charset=utf-8` |

Use factory functions from `@/lib/api/document-routes`:

```tsx
import { createPdfRoute, createWordRoute, createTextRoute } from '@/lib/api/document-routes'

export const GET = createTextRoute({
  entityName: 'Entity',
  fetchEntity: getEntity,
  buildContent: buildEntityDocument,
  getFilename: (entity) => getEntityFilename(entity, 'txt')
})
```

## Files Using This Pattern

- `src/app/(main)/groups/[id]/group-view-client.tsx`
- `src/app/(main)/mass-liturgies/[id]/mass-view-client.tsx`
- `src/app/(main)/people/[id]/person-view-client.tsx`
- `src/app/(main)/weekend-summary/view/weekend-summary-view-client.tsx`
- `src/app/(main)/events/[event_type_id]/[id]/scripts/[script_id]/script-view-client.tsx`
- `src/app/(main)/mass-liturgies/[id]/scripts/[script_id]/mass-script-view-client.tsx`
