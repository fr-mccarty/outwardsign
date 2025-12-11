# Script Export Styling Guide

This document explains how styling from script content in the database is transformed across all export formats: HTML View, Print View, PDF, Word (DOCX), and Plain Text.

## Overview

Scripts are stored in the database as Markdown content with custom syntax extensions. When rendered or exported, this content goes through a processing pipeline that:

1. Replaces placeholders (`{{Field Name}}`) with actual event data
2. Converts Markdown to the target format
3. Applies consistent styling across all outputs

## Source Content (Database)

Script section content is stored as Markdown in the `sections.content` column with these supported formats:

| Source Syntax | Description | Example |
|---------------|-------------|---------|
| `# Heading` | H1 heading | `# Introduction` |
| `## Heading` | H2 heading | `## The Readings` |
| `### Heading` | H3 heading | `### First Reading` |
| `**text**` | Bold text | `**Michael Chen**` |
| `*text*` | Italic text | `*Please stand*` |
| `{red}text{/red}` | Liturgical red text | `{red}Priest:{/red}` |
| `{{Field Name}}` | Field placeholder | `{{Bride}}` |
| `{{Field \| male \| female}}` | Gendered placeholder | `{{Bride \| him \| her}}` |
| `{{parish.name}}` | Parish placeholder | `{{parish.name}}` |
| `- item` | Unordered list | `- First point` |
| `1. item` | Ordered list | `1. First step` |

## Transformation by Format

### 1. HTML View (DynamicScriptViewer)

**File:** `src/components/dynamic-script-viewer.tsx`
**Processor:** `src/lib/utils/markdown-processor.ts`

| Source | Output | Styling |
|--------|--------|---------|
| Section name | `<h2>` | `text-xl font-bold mb-4 text-center` |
| `# Heading` | `<h1>` | Tailwind prose styling |
| `## Heading` | `<h2>` | Tailwind prose styling |
| `### Heading` | `<h3>` | Tailwind prose styling |
| `**text**` | `<strong>` | Bold |
| `*text*` | `<em>` | Italic |
| `{red}text{/red}` | `<span class="text-red-600 font-semibold">` | Red, semi-bold |
| `{{Field}}` | Resolved value | Plain text |
| Paragraph | `<p>` | Prose default |
| List items | `<ul><li>` / `<ol><li>` | Prose default |

**Container:** Card with `p-8` padding, content wrapped in `prose dark:prose-invert max-w-none`

---

### 2. Print View (Browser Print)

**File:** `src/app/print/events/[event_type_id]/[event_id]/scripts/[script_id]/page.tsx`
**Styles:** `src/app/print/print.css`
**Processor:** `src/lib/utils/markdown-processor.ts`

| Source | Output | Screen Styling | Print Styling |
|--------|--------|----------------|---------------|
| Section name | `<div class="reading-title">` | 1.25rem, bold, centered | 14pt, bold, centered |
| `# Heading` | `<h1>` | Prose styling | Prose styling |
| `## Heading` | `<h2>` | Prose styling | Prose styling |
| `### Heading` | `<h3>` | Prose styling | Prose styling |
| `**text**` | `<strong>` | Bold | Bold |
| `*text*` | `<em>` | Italic | Italic |
| `{red}text{/red}` | `<span class="text-red-600">` | Red | Red (#c41e3a) |
| Paragraph | `<p>` in `.reading-text` | 1rem, justified | 12pt, justified |
| Page break | `.page-break` class | Dashed border | `page-break-before: always` |

**Container:** `.script-print-content` with A4-like dimensions, white background

---

### 3. PDF Export

**File:** `src/app/api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/pdf/route.ts`
**Library:** pdfmake

| Source | pdfmake Output | Styling |
|--------|----------------|---------|
| Section name | `{ text, fontSize: 14, bold: true, alignment: 'center' }` | 14pt, bold, centered |
| `# Heading` | `{ text, fontSize: 18, bold: true, alignment: 'center' }` | 18pt, bold, centered |
| `## Heading` | `{ text, fontSize: 16, bold: true, alignment: 'center' }` | 16pt, bold, centered |
| `### Heading` | `{ text, fontSize: 14, bold: true, alignment: 'center' }` | 14pt, bold, centered |
| `**text**` | `{ text, bold: true }` | Bold |
| `*text*` | `{ text, italics: true }` | Italic |
| `{red}text{/red}` | `{ text, color: '#c41e3a' }` | Liturgical red |
| Paragraph | `{ text, fontSize: 11, alignment: 'justify' }` | 11pt, justified |
| List item | `{ text: ['• ', content], margin: [20, 0, 0, 3] }` | Bulleted, indented |
| Page break | `{ text: '', pageBreak: 'after' }` | New page |

**Page Settings:** 1-inch margins, default font Helvetica, 11pt base size, 1.4 line height

---

### 4. Word (DOCX) Export

**File:** `src/app/api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/docx/route.ts`
**Library:** docx

| Source | docx Output | Styling |
|--------|-------------|---------|
| Section name | `Paragraph` with `TextRun` | 14pt, bold, Times New Roman, centered |
| `# Heading` | `Paragraph` with `HeadingLevel.HEADING_1` | 18pt, bold, centered |
| `## Heading` | `Paragraph` with `HeadingLevel.HEADING_2` | 16pt, bold, centered |
| `### Heading` | `Paragraph` with `HeadingLevel.HEADING_3` | 14pt, bold, centered |
| `**text**` | `TextRun` with `bold: true` | Bold |
| `*text*` | `TextRun` with `italics: true` | Italic |
| `{red}text{/red}` | `TextRun` with `color: 'c41e3a'` | Liturgical red |
| Paragraph | `Paragraph` with `AlignmentType.JUSTIFIED` | Justified |
| List item | `Paragraph` with bullet prefix, indented | Bulleted |
| Page break | `Paragraph` with `PageBreak` | New page |

**Page Settings:** 1-inch margins, Times New Roman font, 11pt base size

---

### 5. Plain Text Export

**File:** `src/app/api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/txt/route.ts`
**Renderer:** `src/lib/utils/markdown-renderer.ts` → `renderMarkdownToText()`

| Source | Text Output | Notes |
|--------|-------------|-------|
| Section name | Centered title with `===` underline | Padded to ~70 char width |
| `# Heading` | `HEADING` (uppercase) or plain | Markdown stripped |
| `## Heading` | `Heading` | Markdown stripped |
| `### Heading` | `Heading` | Markdown stripped |
| `**text**` | `text` | Formatting stripped |
| `*text*` | `text` | Formatting stripped |
| `{red}text{/red}` | `text` | Tags stripped |
| Paragraph | Plain text | Whitespace preserved |
| List item | `• item` or `1. item` | Bullets/numbers preserved |
| Page break | `--- PAGE BREAK ---` | Visual separator |

**Example output:**
```
                         Section Title
                         =============

This is the content with Michael Chen and Lisa Brown mentioned.

--- PAGE BREAK ---
```

---

## Styling Consistency Matrix

| Element | HTML View | Print View | PDF | Word | Text |
|---------|-----------|------------|-----|------|------|
| **Section titles** | Centered | Centered | Centered | Centered | Centered |
| **Headings** | Default | Default | Centered | Centered | Plain |
| **Paragraphs** | Left | Justified | Justified | Justified | Left |
| **Bold** | `<strong>` | `<strong>` | Bold run | Bold run | Stripped |
| **Italic** | `<em>` | `<em>` | Italic run | Italic run | Stripped |
| **Red text** | Red span | Red span | Red color | Red color | Stripped |
| **Lists** | HTML list | HTML list | Bulleted | Bulleted | Bulleted |

---

## Processing Pipeline

```
Database (Markdown)
       │
       ▼
┌─────────────────────────────────────────┐
│  1. Replace Placeholders                │
│     - {{Field}} → resolved value        │
│     - {{Field | male | female}} → text  │
│     - {{parish.name}} → parish name     │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  2. Parse Custom Syntax                 │
│     - {red}text{/red} → format-specific │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  3. Convert Markdown                    │
│     - marked.parse() → HTML             │
│     - Then convert to target format     │
└─────────────────────────────────────────┘
       │
       ├──► HTML View: dangerouslySetInnerHTML
       ├──► Print View: dangerouslySetInnerHTML + print.css
       ├──► PDF: pdfmake content array
       ├──► Word: docx Paragraph/TextRun objects
       └──► Text: Strip HTML, preserve structure
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/utils/markdown-processor.ts` | Shared processor for HTML/Print views |
| `src/lib/utils/markdown-renderer.ts` | Placeholder replacement, text rendering |
| `src/components/dynamic-script-viewer.tsx` | HTML view component |
| `src/app/print/events/.../page.tsx` | Print view page |
| `src/app/print/print.css` | Print/screen styles for print views |
| `src/app/api/events/.../export/pdf/route.ts` | PDF export API route |
| `src/app/api/events/.../export/docx/route.ts` | Word export API route |
| `src/app/api/events/.../export/txt/route.ts` | Text export API route |

---

## Adding New Formatting

To add a new formatting syntax (e.g., `{blue}text{/blue}`):

1. **markdown-renderer.ts**: Update `parseCustomSyntax()` to handle new tag
2. **markdown-processor.ts**: Add conversion for HTML output
3. **PDF route**: Add to `parseInlineFormatting()` regex and segment handling
4. **Word route**: Add to `createStyledTextRuns()` regex and TextRun handling
5. **Text route**: Add stripping logic in `renderMarkdownToText()`
6. **print.css**: Add CSS class for print styling if needed
