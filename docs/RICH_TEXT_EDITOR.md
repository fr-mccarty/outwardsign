# Rich Text Editor (Tiptap)

The application uses a Tiptap-based WYSIWYG HTML editor for liturgical script content. This document describes the available formatting options and the HTML output format.

## Location

- **Component:** `src/components/tiptap-editor/`
- **Used in:** Section content editing (`section-editor-dialog.tsx`)

## Toolbar Features

### Text Formatting

| Feature | Toolbar | HTML Output |
|---------|---------|-------------|
| Bold | **B** button | `<strong>text</strong>` |
| Italic | *I* button | `<em>text</em>` |
| Underline | U button | `<u>text</u>` |

### Text Size

Five size options available via the **Size** dropdown:

| Size | CSS Value | HTML Output |
|------|-----------|-------------|
| Extra Small | `0.75em` | `<span style="font-size: 0.75em">text</span>` |
| Small | `0.875em` | `<span style="font-size: 0.875em">text</span>` |
| Medium | `1em` | `<span style="font-size: 1em">text</span>` |
| Large | `1.25em` | `<span style="font-size: 1.25em">text</span>` |
| Extra Large | `1.5em` | `<span style="font-size: 1.5em">text</span>` |

**Reset to Default** removes the font-size styling.

### Text Color

Two color options via the **Color** dropdown:

| Color | Hex Value | HTML Output |
|-------|-----------|-------------|
| Black (Default) | Inherit | Removes color style |
| Liturgical Red | `#c41e3a` | `<span style="color: #c41e3a">text</span>` |

Liturgical Red is used for rubrics (instructions to the celebrant).

### Text Alignment

Three alignment options:

| Alignment | HTML Output |
|-----------|-------------|
| Left | `<p style="text-align: left">text</p>` |
| Center | `<p style="text-align: center">text</p>` |
| Right | `<p style="text-align: right">text</p>` |

### Paragraph Spacing

Available via the **Spacing** dropdown:

#### Space Before Paragraph

| Size | CSS Value | HTML Output |
|------|-----------|-------------|
| Small | `0.5em` | `<p style="margin-top: 0.5em">text</p>` |
| Medium | `1em` | `<p style="margin-top: 1em">text</p>` |
| Large | `2em` | `<p style="margin-top: 2em">text</p>` |

#### Space After Paragraph

| Size | CSS Value | HTML Output |
|------|-----------|-------------|
| Small | `0.5em` | `<p style="margin-bottom: 0.5em">text</p>` |
| Medium | `1em` | `<p style="margin-bottom: 1em">text</p>` |
| Large | `2em` | `<p style="margin-bottom: 2em">text</p>` |

#### Line Spacing

| Spacing | CSS Value | HTML Output |
|---------|-----------|-------------|
| Single | `1.2` | `<p style="line-height: 1.2">text</p>` |
| 1.5 Lines | `1.5` | `<p style="line-height: 1.5">text</p>` |
| Double | `2` | `<p style="line-height: 2">text</p>` |

### Field Placeholders

#### Insert Field Dropdown

Inserts placeholders that are replaced at render time:

- **Person fields** have a submenu:
  - Full Name → `{{field_name.full_name}}`
  - First Name → `{{field_name.first_name}}`
  - Last Name → `{{field_name.last_name}}`
- **Other fields** insert directly: `{{field_name}}`

#### Gendered Text Dialog

For person fields, creates conditional text based on gender:

```
{{field_name.sex | male text | female text}}
```

Example: `{{bride.sex | él | ella}}`

- If male → outputs "él"
- If female → outputs "ella"
- If unknown → outputs "él/ella"

#### Parish Info Dropdown

Inserts parish placeholders:

| Placeholder | Example Output |
|-------------|----------------|
| `{{parish.name}}` | St. Mary Catholic Church |
| `{{parish.city}}` | Austin |
| `{{parish.state}}` | TX |
| `{{parish.city_state}}` | Austin, TX |

## Content Storage

Content is stored as **pure HTML** in the database. No markdown or custom syntax is used.

### Example Stored Content

```html
<p><span style="font-size: 1.25em"><strong>Opening Prayer</strong></span></p>
<p style="text-align: center">Lord, we gather today to celebrate...</p>
<p><span style="color: #c41e3a">The priest extends his hands.</span></p>
<p>We pray for {{bride.full_name}} and {{groom.full_name}}.</p>
```

## Content Processing

The `content-processor.ts` module handles:

1. **Placeholder Replacement** - `{{field}}` syntax replaced with actual values
2. **HTML Sanitization** - XSS prevention (removes scripts, event handlers)

### Processing Functions

| Function | Purpose |
|----------|---------|
| `parseContentToHTML(content)` | Sanitizes HTML for safe rendering |
| `replaceFieldPlaceholders(content, event)` | Replaces `{{...}}` with values |
| `processScriptSection(content, event)` | Full processing (placeholders + sanitization) |

## Extensions

Custom Tiptap extensions in `src/components/tiptap-editor/extensions/`:

| Extension | Purpose |
|-----------|---------|
| `font-size.ts` | Adds `setFontSize()` and `unsetFontSize()` commands |
| `paragraph-with-style.ts` | Enables inline `style` attribute on paragraphs |

## Rendering Contexts

The HTML content renders in multiple contexts:

| Context | Styling Applied |
|---------|-----------------|
| HTML View | Inline styles render directly |
| PDF Export | Inline styles converted to PDF formatting |
| DOC Export | Inline styles converted to Word formatting |
| TXT Download | All HTML tags stripped, plain text only |

## Dark Mode

The editor uses semantic color tokens for dark mode compatibility:

- Editor container: `bg-card text-card-foreground`
- Toolbar: `bg-muted/20`
- Buttons: shadcn Button with `variant="ghost"`

Liturgical red (`#c41e3a`) remains constant in both light and dark modes as it represents a specific liturgical color.

## Features NOT Included

The following features are intentionally disabled:

- Headings (H1, H2, H3) - Use text size instead
- Bullet lists
- Numbered lists
- Images
- Links
- Tables

These are omitted to keep liturgical scripts simple and print-friendly.
