# Liturgical Script System - Print and Export

> **Print Pages and API Routes**
>
> This document covers print page setup and export API routes for PDF and Word document generation.

## Table of Contents

1. [Overview](#overview)
2. [Print Page Setup](#print-page-setup)
3. [PDF Export API Route](#pdf-export-api-route)
4. [Word Export API Route](#word-export-api-route)
5. [Filename Patterns](#filename-patterns)
6. [Related Documentation](#related-documentation)

---

## Overview

**Two output methods:**
1. **Print Page** - HTML view optimized for browser print dialog (save as PDF or print)
2. **API Routes** - Server-generated PDF and Word files for download

**URL patterns:**
- Print page: `/print/[module-plural]/[id]`
- PDF export: `/api/[module-plural]/[id]/pdf`
- Word export: `/api/[module-plural]/[id]/word`

**IMPORTANT:** Directory names must use PLURAL module names (e.g., `weddings`, `funerals`)

---

## Print Page Setup

Print pages display liturgy optimized for printing or saving as PDF via browser print dialog.

### File Location

`src/app/print/[module-plural]/[id]/page.tsx`

**IMPORTANT:** Directory must use PLURAL module name (e.g., `weddings`, `funerals`)

### Implementation Pattern

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderHTML } from '@/lib/renderers/html-renderer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Print[Module]Page({ params }: PageProps) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch entity with relations
  const { id } = await params
  const entity = await get[Module]WithRelations(id)
  if (!entity) notFound()

  // 3. Build and render liturgy
  const templateId = entity.[entity]_template_id || '[module]-full-script-english'
  const liturgyDocument = build[Module]Liturgy(entity, templateId)
  const liturgyContent = renderHTML(liturgyDocument)

  // 4. Return with print styles
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background: white !important;
          color: black !important;
          padding: 2rem !important;
        }
        .[module]-print-content div {
          color: black !important;
        }
        /* Preserve liturgy red */
        .[module]-print-content div[style*="color: rgb(196, 30, 58)"],
        .[module]-print-content div[style*="color:#c41e3a"],
        .[module]-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .[module]-print-content span[style*="color: rgb(196, 30, 58)"],
        .[module]-print-content span[style*="color:#c41e3a"],
        .[module]-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="[module]-print-content">
        {liturgyContent}
      </div>
    </>
  )
}
```

### Print Page Styling

**Key rules:**
- Force white background and black text
- Preserve liturgical red color (`rgb(196, 30, 58)`)
- Use `!important` to override dark mode styles
- Add padding for print margins

**Custom styles:**
```css
body {
  background: white !important;
  color: black !important;
  padding: 2rem !important;
}
```

**Preserve liturgical red:**
```css
/* Target elements with liturgical red */
div[style*="color: rgb(196, 30, 58)"],
div[style*="color:#c41e3a"],
div[style*="color: #c41e3a"] {
  color: rgb(196, 30, 58) !important;
}
```

---

## PDF Export API Route

API route generates downloadable PDF files.

### File Location

`src/app/api/[module-plural]/[id]/pdf/route.ts`

### Implementation Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgical-script-styles'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderPDF } from '@/lib/renderers/pdf-renderer'

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

const printer = new PdfPrinter(fonts)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Fetch entity
    const { id } = await params
    const entity = await get[Module]WithRelations(id)
    if (!entity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 2. Build liturgy
    const templateId = entity.[entity]_template_id || '[module]-full-script-english'
    const liturgyDocument = build[Module]Liturgy(entity, templateId)

    // 3. Render to PDF
    const content = renderPDF(liturgyDocument)

    // 4. Create PDF
    const docDefinition: TDocumentDefinitions = {
      content,
      pageMargins: [
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page
      ]
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)

    // 5. Collect buffer
    const chunks: Buffer[] = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))

    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('end', () => resolve())
      pdfDoc.on('error', reject)
      pdfDoc.end()
    })

    const pdfBuffer = Buffer.concat(chunks)

    // 6. Generate filename
    const filename = `[Entity]-${entity.id}.pdf`

    // 7. Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
```

### PDF Configuration

**Fonts:**
- Use Helvetica family (built-in PDF fonts)
- Normal, Bold, Italics, BoldItalics variants

**Page margins:**
- Use `pdfStyles.margins.page` from `@/lib/styles/liturgical-script-styles`
- Consistent margins across all modules

**Buffer handling:**
- Collect PDF chunks in array
- Concatenate into single buffer
- Return with appropriate headers

---

## Word Export API Route

API route generates downloadable Word (.docx) files.

### File Location

`src/app/api/[module-plural]/[id]/word/route.ts`

### Implementation Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import { Document, Packer } from 'docx'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderWord } from '@/lib/renderers/word-renderer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Fetch entity
    const { id } = await params
    const entity = await get[Module]WithRelations(id)
    if (!entity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 2. Build liturgy
    const templateId = entity.[entity]_template_id || '[module]-full-script-english'
    const liturgyDocument = build[Module]Liturgy(entity, templateId)

    // 3. Render to Word
    const paragraphs = renderWord(liturgyDocument)

    // 4. Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    // 5. Generate buffer
    const buffer = await Packer.toBuffer(doc)

    // 6. Generate filename
    const filename = `[Entity]-${entity.id}.docx`

    // 7. Return Word document
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating Word document:', error)
    return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 })
  }
}
```

### Word Configuration

**Document structure:**
- Single section with paragraphs
- Paragraphs generated by `renderWord()`
- No custom page properties (use Word defaults)

**Buffer handling:**
- Use `Packer.toBuffer()` to generate buffer
- Return with appropriate headers

---

## Filename Patterns

Make filenames descriptive and include relevant entity information.

### Wedding Example

```typescript
import { formatDateForFilename } from '@/lib/utils/formatters'

const brideLastName = wedding.bride?.last_name || 'Bride'
const groomLastName = wedding.groom?.last_name || 'Groom'
const date = formatDateForFilename(wedding.wedding_event?.start_date)
const filename = `${brideLastName}-${groomLastName}-${date}.pdf`
// Result: "Smith-Johnson-20250315.pdf"
```

### Funeral Example

```typescript
import { formatDateForFilename } from '@/lib/utils/formatters'

const lastName = funeral.deceased?.last_name || 'Deceased'
const date = formatDateForFilename(funeral.funeral_event?.start_date)
const filename = `${lastName}-Funeral-${date}.pdf`
// Result: "Williams-Funeral-20250320.pdf"
```

### Baptism Example

```typescript
import { formatDateForFilename } from '@/lib/utils/formatters'

const childLastName = baptism.child?.last_name || 'Child'
const date = formatDateForFilename(baptism.baptism_event?.start_date)
const filename = `${childLastName}-Baptism-${date}.pdf`
// Result: "Garcia-Baptism-20250322.pdf"
```

### Filename Best Practices

- **Use descriptive names** - Include person names, event type, date
- **Use formatDateForFilename()** - Formats dates as YYYYMMDD for sortability
- **Provide fallbacks** - Use default text if data is missing
- **Avoid special characters** - Use only letters, numbers, hyphens
- **Keep it short** - Aim for under 50 characters

---

## Related Documentation

- **[TEMPLATES.md](./TEMPLATES.md)** - Template creation and builder patterns
- **[WITHRELATIONS.md](./WITHRELATIONS.md)** - Fetching entity data with relations
- **[VIEW_INTEGRATION.md](./VIEW_INTEGRATION.md)** - View page integration
- **[RENDERER.md](../RENDERER.md)** - Complete renderer system documentation
- **[FORMATTERS.md](../FORMATTERS.md)** - Helper and formatting functions
