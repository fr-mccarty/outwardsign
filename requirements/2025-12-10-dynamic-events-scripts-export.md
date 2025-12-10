# Dynamic Events - Scripts & Export System

**Created:** 2025-12-10
**Status:** Ready for Development
**Agent:** brainstorming-agent → requirements-agent

## Feature Overview

Add script generation and export functionality to dynamic events, allowing parish staff to generate liturgical documents (ceremony programs, readings sheets, minister notes) for user-defined event types with multiple export formats.

## Problem Statement

Dynamic events (Quinceañeras, House Blessings, Presentations, etc.) need the same script generation and export capabilities that exist in the core modules (Weddings, Funerals, Masses). Parish staff need to:
- View available liturgical scripts for an event
- Generate formatted documents with event-specific data
- Export scripts in multiple formats (PDF, Word, Print, Text)
- Have a consistent workflow across all event types

## User Stories

- As a **parish staff member**, I want to view all available scripts for an event type so that I can choose which document to generate
- As a **liturgical coordinator**, I want to export ceremony programs as PDF so that I can print them for the event
- As a **priest/presider**, I want to print minister notes so that I can have them in the sacristy during the ceremony
- As a **parish administrator**, I want to export scripts as Word documents so that I can make last-minute edits
- As a **parish staff member**, I want to copy script text so that I can paste it into emails or announcements

## Success Criteria

What does "done" look like?
- [x] Event view page displays list of available scripts for that event type as visual cards
- [x] Clicking a script card navigates to dedicated script view page
- [x] Script view page renders the complete liturgical document with all fields replaced
- [x] All 4 export formats work (PDF, Word, Print, Text)
- [x] Empty fields display as "empty" in generated documents
- [x] Event view page sidebar shows Edit, Delete, and created date metadata
- [x] Script view page follows ModuleViewContainer pattern with export buttons in sidebar

## Scope

### In Scope (MVP)

**Event View Page:**
- Display script cards with name and description
- Sidebar with Edit button, Delete button, and created date metadata
- Click script card to navigate to script view page

**Script View Page:**
- Render complete script content using content builder pattern
- Replace `{{Field Name}}` placeholders with actual event data
- Sidebar with 4 export buttons (PDF, Word, Print, Text) stacked vertically, full width
- "Back to Event" button in sidebar
- Follow ModuleViewContainer pattern (like v1 weddings/funerals)

**Export Functionality:**
- PDF export (download formatted PDF)
- Word export (download .docx file)
- Print export (open print view in new window/tab)
- Text export (download .txt file with plain text)

**Field Replacement:**
- Replace all `{{Field Name}}` placeholders with event data
- Empty/missing fields show "empty" in generated documents

### Out of Scope (Future)

- Batch export all scripts at once
- Script template editing UI for admins
- Script preview modal before export
- Sharing/email functionality for scripts
- Customizing script templates per event instance
- "Generate All" option for multiple scripts

## Key User Flows

### Primary Flow: Generate and Export a Script

1. Staff member navigates to event view page (`/events/weddings/[id]`)
2. Staff member sees list of available scripts as visual cards showing:
   - Script name (e.g., "Ceremony Program")
   - Brief description (e.g., "Full order of service with responses")
3. Staff member clicks on a script card
4. System navigates to script view page (`/events/weddings/[id]/scripts/[script_id]`)
5. Staff member sees rendered script content with all fields replaced
6. Staff member clicks desired export button in sidebar (PDF, Word, Print, or Text)
7. System generates and downloads/opens the requested format
8. Staff member clicks "Back to Event" or uses breadcrumbs to return

### Alternative Flow: Edit Event Before Generating Script

1. Staff member views event and notices missing information
2. Staff member clicks "Edit" button in sidebar
3. System navigates to event edit page
4. Staff member updates event fields
5. Staff member saves changes
6. System redirects back to event view page
7. Staff member proceeds with script generation flow

### Alternative Flow: Delete Event

1. Staff member views event and determines it's no longer needed
2. Staff member clicks "Delete" button in sidebar
3. System shows confirmation dialog
4. Staff member confirms deletion
5. System deletes event and redirects to events list

## Integration Points

### Existing Features
- **Dynamic Events System** - Event types, input fields, events table
- **Scripts Table** - Stores script templates with markdown content
- **Sections Table** - Stores script sections and ordering
- **Content Builder Pattern** - Existing system for rendering liturgical documents (v1)
- **Export Infrastructure** - Existing PDF/Word/Print export functionality from Masses/Weddings/Funerals

### Existing Components to Reuse
- **ModuleViewContainer** - Sidebar layout pattern from v1 modules
- **ContentCard** - For script cards on event view page
- **Export API Routes** - Adapt existing export logic for dynamic events
- **Print View Pattern** - Use existing print page structure

### Existing Patterns to Follow
- **Event View Page Structure** - Similar to `/weddings/[id]/page.tsx`
- **Script Rendering** - Similar to v1 wedding/funeral script rendering
- **Sidebar Actions** - Edit/Delete buttons like other modules

## Page Structure Details

### Event View Page (`/events/weddings/[id]`)

**Main Content Area:**
- Page title: Event name and event type
- Event details summary (key fields displayed)
- **Scripts & Programs Section** (primary focus):
  - Section heading: "Scripts & Programs"
  - Grid of script cards (responsive: 1 column mobile, 2-3 columns desktop)
  - Each card shows:
    - Script icon (📄)
    - Script name (bold, larger text)
    - Brief description (1-2 lines)
    - Clickable - entire card navigates to script view

**Sidebar:**
- **Edit** button (navigates to `/events/weddings/[id]/edit`)
- **Delete** button (shows confirmation dialog)
- **Metadata section**:
  - Created date (formatted prettily)
  - Last modified date (if different from created)

### Script View Page (`/events/weddings/[id]/scripts/[script_id]`)

**Main Content Area:**
- Breadcrumbs: Home > Dynamic Events > [Event Name] > [Script Name]
- Page title: [Script Name]
- Rendered script content:
  - Uses content builder pattern
  - Shows complete liturgical document
  - All `{{Field Name}}` placeholders replaced with actual data
  - Empty fields show text "empty"
  - Formatted sections (cover page, readings, ceremony order, etc.)

**Sidebar (ModuleViewContainer pattern):**
- **Export Section:**
  - Section heading: "Export"
  - 4 buttons, stacked vertically, full width:
    - 📄 PDF (download PDF file)
    - 📝 Word (download .docx file)
    - 🖨️ Print (open print view)
    - 📋 Text (download .txt file)
- **Navigation:**
  - 🔙 Back to Event button (returns to event view page)

### Event Edit Page Sidebar (`/events/weddings/[id]/edit`)

**Sidebar:**
- Keep fairly simple (no specific requirements captured)
- Likely: Save button, Cancel button (standard edit page pattern)

## Export Format Specifications

### PDF Export
- Formatted document with styling
- Includes all sections and page breaks
- Uses existing PDF generation infrastructure
- Downloads as `[event-name]-[script-name].pdf`

### Word Export
- Downloadable .docx file
- Preserves formatting and structure
- Uses existing Word generation infrastructure
- Downloads as `[event-name]-[script-name].docx`

### Print Export
- Opens in new window/tab
- Print-optimized layout
- Uses existing print view pattern
- Route: `/print/events/weddings/[id]/scripts/[script_id]`

### Text Export
- Plain text file (no formatting)
- Download as .txt file
- Preserves line breaks
- No bold/italics/styling
- Downloads as `[event-name]-[script-name].txt`

## Field Replacement Behavior

### Placeholder Format
- Scripts use markdown with `{{Field Name}}` placeholders
- Field names match custom input field labels defined in event type

### Replacement Rules
- Replace `{{Field Name}}` with actual field value from event data
- If field has a value: show the value
- If field is empty/null: show text "empty"
- If field doesn't exist for this event type: show text "empty"

### Formatting Considerations
- Date fields: Format using `formatDatePretty()` helper
- Person names: Use as stored (pre-formatted in database)
- Multi-line text: Preserve line breaks
- Rich text fields: Strip formatting for Text export, preserve for PDF/Word

## Technical Notes

### Reference Implementation
- **v1 Modules:** Weddings (`/app/(main)/weddings/[id]`), Funerals, Masses
- **Content Builder:** Existing system in v1 for rendering liturgical documents
- **Export Routes:** Existing API routes for PDF/Word/Print generation

### Database Tables
- `scripts` - Stores script templates (markdown content)
- `sections` - Stores script sections and ordering
- `events` - Dynamic events with custom field data
- `event_types` - Event type definitions
- `input_fields` - Custom field definitions for event types

### Key Routes to Implement
- `/events/[slug]/[id]` - Event view page (already exists, needs script cards)
- `/events/[slug]/[id]/scripts/[script_id]` - Script view page (NEW)
- `/print/events/[slug]/[id]/scripts/[script_id]` - Print view (NEW)
- `/api/events/[id]/scripts/[script_id]/pdf` - PDF export API (NEW)
- `/api/events/[id]/scripts/[script_id]/word` - Word export API (NEW)
- `/api/events/[id]/scripts/[script_id]/text` - Text export API (NEW)

## Visual Design Notes

### Script Cards
- Use **ContentCard** component (existing)
- Visual hierarchy:
  - Icon at top (or left)
  - Script name prominent (18-20px font)
  - Description text smaller, muted color
- Hover state: subtle shadow/border change
- Cursor: pointer
- Cards should feel clickable

### Export Buttons
- Full width in sidebar
- Stacked vertically with spacing between
- Each button shows icon + label
- Primary button style (not ghost/outline)
- Clear visual affordance for clickability

### "Back to Event" Button
- Secondary/ghost style (less prominent than export buttons)
- Clear separation from export section
- Icon + label: 🔙 Back to Event

## Open Questions for Requirements-Agent

1. **Script Template Storage:** How are script templates associated with event types? Is there a junction table? Can multiple event types share the same script template?

2. **Script Sections:** Do dynamic event scripts use the sections table the same way as v1 modules? How is section ordering handled?

3. **Content Builder Integration:** Can the existing content builder from v1 be reused, or does it need modification for dynamic events?

4. **Export API Pattern:** Should export routes follow the same pattern as existing modules, or is there a difference because of the dynamic nature?

5. **Field Value Retrieval:** How to efficiently get all field values for an event to replace placeholders? Is there a `WithRelations` pattern for events?

6. **Print View Styling:** Should print views for dynamic events follow the same styling as weddings/funerals, or do they need custom styling per event type?

7. **Script Permissions:** Are scripts subject to role-based permissions? Can parishioners view scripts for their own events?

8. **Script Availability:** Are all scripts for an event type always available, or can some be conditionally shown based on event data?

9. **Markdown Conversion:** What markdown converter is used in v1? Can it be reused for dynamic events?

10. **Error Handling:** What happens if script generation fails (malformed markdown, missing critical data)? Should there be validation before allowing export?

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Answers to Open Questions

**1. Script Template Storage:**
- Scripts are associated with event types via `scripts.event_type_id` foreign key
- Relationship is one event type → many scripts (one-to-many)
- No junction table needed - direct foreign key relationship
- Scripts CANNOT be shared across event types (each script belongs to exactly one event type)
- Located in migration: `/supabase/migrations/20251210000005_create_scripts_table.sql`

**2. Script Sections:**
- Yes, sections table follows same pattern as documented
- Each section belongs to one script via `sections.script_id` foreign key
- Ordering handled by `sections.order` integer field (ascending)
- Page breaks controlled by `sections.page_break_after` boolean field
- Located in migration: `/supabase/migrations/20251210000006_create_sections_table.sql`

**3. Content Builder Integration:**
- Dynamic events use a DIFFERENT pattern than v1 modules
- v1 modules use TypeScript content builders with structured LiturgyDocument objects
- Dynamic events use markdown content stored in database (`sections.content`)
- Need NEW markdown-to-document converter specific to dynamic events
- Cannot directly reuse v1 content builders (wedding, funeral, etc.)

**4. Export API Pattern:**
- Follow similar URL structure to v1 but with event-specific routes
- Pattern: `/api/events/[event_id]/scripts/[script_id]/[format]`
- Key difference: No `event_type_slug` in URL (use event ID directly)
- Simplified pattern: Event ID is sufficient to fetch event → event type → scripts

**5. Field Value Retrieval:**
- YES - `getEventWithRelations()` already exists in `/src/lib/actions/dynamic-events.ts`
- Returns `DynamicEventWithRelations` with resolved field values
- `resolved_fields` property contains all field values with type information
- Each field has `raw_value` and `resolved_value` (for references like person, location)
- For person fields: Access `resolved_value.full_name` (database-generated field)
- For date fields: Use `formatDatePretty(raw_value)` helper
- For text fields: Use `raw_value` directly

**6. Print View Styling:**
- Use same styling as weddings/funerals (consistent across all modules)
- Print views use liturgical-script-styles.ts for consistent formatting
- No custom styling per event type - maintain visual consistency
- Standard print CSS with white background, black text, liturgical red preserved

**7. Script Permissions:**
- Scripts inherit RLS policies from event_types (via foreign key)
- Parish members can READ scripts for their parish's event types
- Only Admin role can CREATE/UPDATE/DELETE scripts
- Parishioners: No special permissions documented for viewing scripts of their own events (future consideration)
- Export actions: Follow same permission pattern as viewing scripts

**8. Script Availability:**
- All scripts for an event type are ALWAYS available
- No conditional logic based on event data
- Scripts displayed in order defined by `scripts.order` field
- Soft-deleted scripts (deleted_at IS NOT NULL) are excluded via RLS policies

**9. Markdown Conversion:**
- V1 modules do NOT use markdown - they use structured TypeScript builders
- Dynamic events introduce markdown for flexibility
- Need markdown parser: Use `marked` library (already available in project dependencies per user-defined-event-types.md)
- Custom syntax: `{red}text{/red}` for liturgical red text
- Custom syntax: `{{Field Name}}` for placeholder replacement

**10. Error Handling:**
- If script/sections not found: Return 404 (API routes) or notFound() (pages)
- If event not found: Return 404
- If markdown parsing fails: Log error, show graceful error message to user
- If field value missing: Show text "empty" (not an error - expected behavior)
- Validation: No pre-export validation - generate documents on demand

### Database Schema

**Existing Tables (No Changes Needed):**

**scripts table:**
- `id` - UUID primary key
- `event_type_id` - UUID foreign key to event_types (CASCADE delete)
- `name` - Script name (e.g., "English Program", "Spanish Ceremony")
- `order` - Display order (integer, non-negative)
- `deleted_at` - Soft delete timestamp
- `created_at`, `updated_at` - Timestamps

**sections table:**
- `id` - UUID primary key
- `script_id` - UUID foreign key to scripts (CASCADE delete)
- `name` - Section heading (e.g., "Cover Page", "Readings")
- `content` - Markdown text with placeholders and custom syntax
- `page_break_after` - Boolean flag for page breaks
- `order` - Section order within script (integer, non-negative)
- `deleted_at` - Soft delete timestamp
- `created_at`, `updated_at` - Timestamps

**dynamic_events table:**
- `id` - UUID primary key
- `parish_id` - UUID foreign key to parishes
- `event_type_id` - UUID foreign key to event_types
- `field_values` - JSONB object with dynamic field data
- `created_at`, `updated_at`, `deleted_at` - Timestamps

**RLS Policies:**
- Scripts: Parish members can SELECT, Admins can INSERT/UPDATE/DELETE
- Sections: Parish members can SELECT, Admins can INSERT/UPDATE/DELETE
- Dynamic events: Existing policies apply

### Server Actions

**Existing Actions (Already Implemented):**
Located in `/src/lib/actions/scripts.ts`:
- `getScripts(eventTypeId: string): Promise<Script[]>` - Get all scripts for event type
- `getScript(id: string): Promise<Script | null>` - Get single script
- `getScriptWithSections(id: string): Promise<ScriptWithSections | null>` - Get script with sections ordered by order field

Located in `/src/lib/actions/dynamic-events.ts`:
- `getEventWithRelations(id: string): Promise<DynamicEventWithRelations | null>` - Get event with event type, occasions, and resolved field values

**No New Server Actions Needed** - Existing actions provide all necessary data fetching.

### UI Components

#### Existing Components to Reuse

**ModuleViewContainer** - `/src/components/module-view-container.tsx`
- Purpose: All-in-one layout for view pages with sidebar
- Usage: Script view page layout
- NOT suitable for dynamic events (requires specific entity types and build functions)
- Need custom layout similar to ModuleViewContainer but adapted for dynamic scripts

**ContentCard** - `/src/components/ui/card.tsx`
- Purpose: Display script cards on event view page
- Usage: Script list with clickable cards
- Location: Existing shadcn/ui component

**Button** - `/src/components/ui/button.tsx`
- Purpose: Export buttons, Back button, Edit/Delete buttons
- Usage: All interactive buttons
- Location: Existing shadcn/ui component

#### New Components Needed

**ScriptCard** - `/src/components/script-card.tsx`
- Purpose: Display script information in card format
- Props: script (Script object), onClick handler
- Renders: Script name, icon, description (if available)
- Click behavior: Navigate to script view page

**DynamicScriptViewer** - `/src/components/dynamic-script-viewer.tsx`
- Purpose: Render markdown script content with field replacements
- Props: script (ScriptWithSections), event (DynamicEventWithRelations)
- Logic:
  1. For each section, replace `{{Field Name}}` with resolved values
  2. Parse markdown to HTML
  3. Apply liturgical styling
  4. Render with page break indicators
- Returns: Rendered HTML content

**ExportButtonGroup** - `/src/components/export-button-group.tsx`
- Purpose: Stacked export buttons for sidebar
- Props: eventId, scriptId
- Buttons: PDF, Word, Print, Text
- Actions:
  - PDF: Fetch `/api/events/[event_id]/scripts/[script_id]/pdf`
  - Word: Fetch `/api/events/[event_id]/scripts/[script_id]/word`
  - Print: Open `/print/events/[event_id]/scripts/[script_id]` in new tab
  - Text: Fetch `/api/events/[event_id]/scripts/[script_id]/text`

### Type Interfaces

**Existing Interfaces (No Changes Needed):**
Located in `/src/lib/types/event-types.ts`:

```
interface Script {
  id: string
  event_type_id: string
  name: string
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

interface ScriptWithSections extends Script {
  sections: Section[]
}

interface Section {
  id: string
  script_id: string
  name: string
  content: string  // Markdown with placeholders
  page_break_after: boolean
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

interface DynamicEventWithRelations extends DynamicEvent {
  event_type: DynamicEventType
  occasions: Occasion[]
  resolved_fields: Record<string, ResolvedFieldValue>
}

interface ResolvedFieldValue {
  field_name: string
  field_type: InputFieldType
  raw_value: any
  resolved_value?: Person | Group | Location | DynamicEvent | CustomListItem | Document | null
}
```

**New Interface Needed:**

```
interface ProcessedScript {
  script: ScriptWithSections
  processedSections: ProcessedSection[]
}

interface ProcessedSection {
  id: string
  name: string
  htmlContent: string  // Markdown converted to HTML with field replacements
  pageBreakAfter: boolean
  order: number
}
```

### File Structure

```
/src/app/(main)/events/[event_type_slug]/[id]/
├── page.tsx (UPDATE - add script cards section)
├── scripts/
│   └── [script_id]/
│       └── page.tsx (NEW - script view page)

/src/app/print/events/[event_id]/scripts/[script_id]/
└── page.tsx (NEW - print view)

/src/app/api/events/[event_id]/scripts/[script_id]/
├── pdf/
│   └── route.ts (NEW - PDF export)
├── word/
│   └── route.ts (NEW - Word export)
└── text/
    └── route.ts (NEW - Text export)

/src/components/
├── script-card.tsx (NEW)
├── dynamic-script-viewer.tsx (NEW)
└── export-button-group.tsx (NEW)

/src/lib/utils/
└── markdown-processor.ts (NEW - markdown parsing and field replacement)
```

### Field Replacement Logic

**Process Overview:**
```
FUNCTION replaceFieldPlaceholders(content: string, event: DynamicEventWithRelations): string
  1. Find all {{Field Name}} patterns in content using regex: /\{\{([^}]+)\}\}/g
  2. FOR each match:
       a. Extract field name (trim whitespace)
       b. Look up field in event.resolved_fields[fieldName]
       c. IF field exists THEN
            - Get fieldType from resolved_field.field_type
            - IF fieldType is 'person' THEN
                value = resolved_field.resolved_value?.full_name || 'empty'
            - ELSE IF fieldType is 'date' THEN
                value = formatDatePretty(resolved_field.raw_value) || 'empty'
            - ELSE IF fieldType is 'location' THEN
                value = resolved_field.resolved_value?.name || 'empty'
            - ELSE IF fieldType is 'group' THEN
                value = resolved_field.resolved_value?.name || 'empty'
            - ELSE (text, number, boolean, etc.) THEN
                value = String(resolved_field.raw_value) || 'empty'
            END IF
          ELSE
            value = 'empty'
          END IF
       d. Replace {{Field Name}} with value
     END FOR
  3. Return modified content
END FUNCTION
```

**Markdown Parsing:**
```
FUNCTION parseMarkdownToHTML(content: string): string
  1. Use marked library to parse markdown to HTML
  2. Post-process HTML to handle custom syntax:
     a. Replace {red}text{/red} with <span style="color: #c41e3a">text</span>
  3. Return HTML string
END FUNCTION
```

**Combined Processing:**
```
FUNCTION processScriptSection(section: Section, event: DynamicEventWithRelations): string
  1. Replace field placeholders: replacedContent = replaceFieldPlaceholders(section.content, event)
  2. Parse markdown to HTML: htmlContent = parseMarkdownToHTML(replacedContent)
  3. Return htmlContent
END FUNCTION
```

### Print Page Implementation

**Route:** `/src/app/print/events/[event_id]/scripts/[script_id]/page.tsx`

**Pattern (Server Component):**
```
FUNCTION PrintScriptPage(params)
  1. Authenticate user (redirect to /login if not authenticated)
  2. Extract event_id and script_id from awaited params
  3. Fetch event with relations: event = await getEventWithRelations(event_id)
  4. IF event is null THEN notFound()
  5. Fetch script with sections: script = await getScriptWithSections(script_id)
  6. IF script is null THEN notFound()
  7. Verify script belongs to event's event type:
     IF script.event_type_id !== event.event_type_id THEN notFound()

  8. Process each section:
     FOR each section in script.sections (ordered by order):
       a. Process section: htmlContent = processScriptSection(section, event)
       b. Store in processedSections array
     END FOR

  9. Render print view:
     - Include print-specific CSS (white background, black text, liturgical red)
     - Render each processed section as HTML
     - Add page break divs where section.page_break_after is true
     - No navigation, no header, no footer

  10. Return JSX with print styles
END FUNCTION
```

**Print CSS (inline in page):**
```css
body {
  background: white !important;
  color: black !important;
  padding: 2rem !important;
}
.script-print-content div {
  color: black !important;
}
/* Preserve liturgical red */
.script-print-content span[style*="color: #c41e3a"],
.script-print-content span[style*="color:#c41e3a"] {
  color: rgb(196, 30, 58) !important;
}
@media print {
  .page-break {
    page-break-after: always;
  }
}
```

### API Route Specifications

#### PDF Export API Route

**Route:** `/src/app/api/events/[event_id]/scripts/[script_id]/pdf/route.ts`

**Implementation:**
```
FUNCTION GET(request: NextRequest, params: Promise<{ event_id: string, script_id: string }>)
  1. Extract event_id and script_id from awaited params
  2. Fetch event with relations: event = await getEventWithRelations(event_id)
  3. IF event is null THEN return 404 JSON response
  4. Fetch script with sections: script = await getScriptWithSections(script_id)
  5. IF script is null THEN return 404 JSON response
  6. Verify script belongs to event's event type:
     IF script.event_type_id !== event.event_type_id THEN return 404

  7. Process sections and build pdfmake content:
     content = []
     FOR each section in script.sections:
       a. Replace placeholders: processedContent = replaceFieldPlaceholders(section.content, event)
       b. Parse markdown to pdfmake format:
          - Use marked library to parse markdown to AST
          - Convert AST nodes to pdfmake content objects
          - Handle headings → { text: '...', fontSize: X, bold: true }
          - Handle paragraphs → { text: '...' }
          - Handle lists → { ul: [...] } or { ol: [...] }
          - Handle custom {red}{/red} syntax → { text: '...', color: '#c41e3a' }
       c. Add to content array
       d. IF section.page_break_after THEN
            content.push({ text: '', pageBreak: 'after' })
          END IF
     END FOR

  8. Create PDF document definition:
     docDefinition = {
       content: content,
       pageSize: 'LETTER',
       pageMargins: [72, 72, 72, 72],  // 1 inch margins
       defaultStyle: { font: 'Helvetica', fontSize: 11 }
     }

  9. Generate PDF using pdfmake:
     - Create printer with Helvetica fonts
     - Create PDF document from definition
     - Collect buffer chunks
     - Concatenate into final buffer

  10. Generate filename:
      - Get primary occasion from event.occasions (is_primary === true)
      - Get key person field from event.resolved_fields (is_key_person === true)
      - Format: "{LastName}-{ScriptName}.pdf"
      - Example: "Smith-English-Program.pdf"

  11. Return PDF response:
      - Content-Type: application/pdf
      - Content-Disposition: attachment; filename="{filename}"
      - Body: PDF buffer

  12. Error handling:
      - CATCH any errors
      - Log error to console
      - Return 500 JSON response with error message
END FUNCTION
```

**Dependencies:**
- `pdfmake` - PDF generation
- `marked` - Markdown parsing

#### Word Export API Route

**Route:** `/src/app/api/events/[event_id]/scripts/[script_id]/word/route.ts`

**Implementation:**
```
FUNCTION GET(request: NextRequest, params: Promise<{ event_id: string, script_id: string }>)
  1. Extract event_id and script_id from awaited params
  2. Fetch event with relations: event = await getEventWithRelations(event_id)
  3. IF event is null THEN return 404 JSON response
  4. Fetch script with sections: script = await getScriptWithSections(script_id)
  5. IF script is null THEN return 404 JSON response
  6. Verify script belongs to event's event type

  7. Process sections and build docx paragraphs:
     paragraphs = []
     FOR each section in script.sections:
       a. Replace placeholders: processedContent = replaceFieldPlaceholders(section.content, event)
       b. Parse markdown to docx paragraphs:
          - Use marked library to parse markdown to AST
          - Convert AST nodes to docx Paragraph objects
          - Handle headings → new Paragraph({ heading: HeadingLevel.HEADING_1, text: '...' })
          - Handle paragraphs → new Paragraph({ children: [new TextRun({ text: '...' })] })
          - Handle lists → use NumberingFormat for ordered lists
          - Handle custom {red}{/red} → new TextRun({ text: '...', color: 'C41E3A' })
       c. Add paragraphs to array
       d. IF section.page_break_after THEN
            paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
          END IF
     END FOR

  8. Create Word document:
     doc = new Document({
       sections: [{
         properties: {},
         children: paragraphs
       }]
     })

  9. Generate buffer: buffer = await Packer.toBuffer(doc)

  10. Generate filename (same pattern as PDF):
      "{LastName}-{ScriptName}.docx"

  11. Return Word response:
      - Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
      - Content-Disposition: attachment; filename="{filename}"
      - Body: Word buffer

  12. Error handling (same as PDF route)
END FUNCTION
```

**Dependencies:**
- `docx` - Word document generation
- `marked` - Markdown parsing

#### Text Export API Route

**Route:** `/src/app/api/events/[event_id]/scripts/[script_id]/text/route.ts`

**Implementation:**
```
FUNCTION GET(request: NextRequest, params: Promise<{ event_id: string, script_id: string }>)
  1. Extract event_id and script_id from awaited params
  2. Fetch event with relations: event = await getEventWithRelations(event_id)
  3. IF event is null THEN return 404 JSON response
  4. Fetch script with sections: script = await getScriptWithSections(script_id)
  5. IF script is null THEN return 404 JSON response
  6. Verify script belongs to event's event type

  7. Process sections and build plain text:
     textContent = ""
     FOR each section in script.sections:
       a. Add section name as heading: textContent += section.name + "\n\n"
       b. Replace placeholders: processedContent = replaceFieldPlaceholders(section.content, event)
       c. Remove {red}{/red} tags (plain text doesn't support color):
          processedContent = processedContent.replace(/\{red\}(.*?)\{\/red\}/g, '$1')
       d. Keep markdown as plain text (don't convert to HTML):
          - Preserve line breaks
          - Preserve markdown formatting characters (*, #, etc.)
       e. Add to textContent: textContent += processedContent + "\n\n"
       f. IF section.page_break_after THEN
            textContent += "--- PAGE BREAK ---\n\n"
          END IF
     END FOR

  8. Generate filename (same pattern as PDF):
      "{LastName}-{ScriptName}.txt"

  9. Return text response:
      - Content-Type: text/plain; charset=utf-8
      - Content-Disposition: attachment; filename="{filename}"
      - Body: textContent

  10. Error handling (same as PDF route)
END FUNCTION
```

**No external dependencies** - Simple string manipulation

### Script View Page Implementation

**Route:** `/src/app/(main)/events/[event_type_slug]/[id]/scripts/[script_id]/page.tsx`

**Pattern (Server Component):**
```
FUNCTION ScriptViewPage(params: Promise<{ event_type_slug: string, id: string, script_id: string }>)
  1. Authenticate user (redirect to /login if not authenticated)
  2. Extract event_type_slug, id (event_id), script_id from awaited params
  3. Fetch event with relations: event = await getEventWithRelations(id)
  4. IF event is null THEN notFound()
  5. Verify event belongs to correct event type slug:
     IF event.event_type.slug !== event_type_slug THEN notFound()
  6. Fetch script with sections: script = await getScriptWithSections(script_id)
  7. IF script is null THEN notFound()
  8. Verify script belongs to event's event type:
     IF script.event_type_id !== event.event_type_id THEN notFound()

  9. Set breadcrumbs:
     - Home
     - Dynamic Events
     - {event_type.name}
     - {event page title}  // Use helper to generate from key person field
     - {script.name}

  10. Pass data to client component:
      - event (DynamicEventWithRelations)
      - script (ScriptWithSections)
      - eventTypeSlug (for navigation)

  11. Render:
      - BreadcrumbSetter
      - ScriptViewClient component
END FUNCTION
```

**Client Component:** `/src/app/(main)/events/[event_type_slug]/[id]/scripts/[script_id]/script-view-client.tsx`

```
COMPONENT ScriptViewClient(props: { event, script, eventTypeSlug })
  State: None needed (all data passed as props)

  Layout:
    - Two-column grid (similar to ModuleViewContainer)
    - Left sidebar (1/4 width on desktop):
      * Back to Event button (ghost style)
      * Separator
      * Export section heading
      * ExportButtonGroup component
    - Main content (3/4 width on desktop):
      * Card with script content
      * DynamicScriptViewer component renders processed script

  Handlers:
    - handleBackToEvent: Navigate to `/events/${eventTypeSlug}/${event.id}`
    - Export actions handled by ExportButtonGroup component

  Returns: JSX with two-column layout
END COMPONENT
```

### Event View Page Updates

**Route:** `/src/app/(main)/events/[event_type_slug]/[id]/page.tsx`

**Updates Needed:**
```
FUNCTION EventViewPage(params)
  1. [EXISTING] Authenticate user
  2. [EXISTING] Fetch event with relations
  3. [NEW] Fetch scripts for event type: scripts = await getScripts(event.event_type_id)
  4. [EXISTING] Set breadcrumbs
  5. [EXISTING] Pass event to client component
  6. [NEW] Pass scripts to client component
END FUNCTION
```

**Client Component Updates:** `/src/app/(main)/events/[event_type_slug]/[id]/event-view-client.tsx`

**Add Scripts Section:**
```
SECTION: Scripts & Programs
  Position: After event details summary, before other sections

  IF scripts.length > 0 THEN
    - Section heading: "Scripts & Programs"
    - Grid of script cards (1 column mobile, 2-3 columns desktop)
    - FOR each script in scripts:
        Render ScriptCard component
        onClick: Navigate to `/events/${eventTypeSlug}/${event.id}/scripts/${script.id}`
    END FOR
  ELSE
    - Empty state message: "No scripts available for this event type"
  END IF
END SECTION
```

**Sidebar Updates:**
- [EXISTING] Edit button
- [EXISTING] Delete button
- [EXISTING] Metadata section (created date, updated date)
- [NO CHANGES NEEDED]

### Markdown Processing Utility

**File:** `/src/lib/utils/markdown-processor.ts`

**Functions:**

```
FUNCTION replaceFieldPlaceholders(
  content: string,
  event: DynamicEventWithRelations
): string
  // See Field Replacement Logic section above for implementation
END FUNCTION

FUNCTION parseMarkdownToHTML(content: string): string
  1. Configure marked with options:
     - breaks: true (convert \n to <br>)
     - gfm: true (GitHub Flavored Markdown)
  2. Parse markdown: html = marked.parse(content)
  3. Post-process to handle custom syntax:
     html = html.replace(/\{red\}(.*?)\{\/red\}/g, '<span style="color: #c41e3a">$1</span>')
  4. Return html
END FUNCTION

FUNCTION processScriptSection(
  section: Section,
  event: DynamicEventWithRelations
): string
  1. Replace field placeholders:
     replacedContent = replaceFieldPlaceholders(section.content, event)
  2. Parse markdown to HTML:
     htmlContent = parseMarkdownToHTML(replacedContent)
  3. Return htmlContent
END FUNCTION

FUNCTION processScriptForExport(
  script: ScriptWithSections,
  event: DynamicEventWithRelations
): ProcessedScript
  processedSections = []
  FOR each section in script.sections:
    processedSection = {
      id: section.id,
      name: section.name,
      htmlContent: processScriptSection(section, event),
      pageBreakAfter: section.page_break_after,
      order: section.order
    }
    processedSections.push(processedSection)
  END FOR

  RETURN {
    script: script,
    processedSections: processedSections
  }
END FUNCTION
```

### Filename Generation Helper

**File:** `/src/lib/utils/formatters.ts` (add to existing file)

**Function:**

```
FUNCTION generateDynamicEventScriptFilename(
  event: DynamicEventWithRelations,
  scriptName: string,
  extension: string
): string
  1. Find key person field from event.event_type.input_field_definitions
     WHERE is_key_person === true AND type === 'person'

  2. IF key person field exists THEN
       personFieldValue = event.resolved_fields[keyPersonField.name]
       IF personFieldValue.resolved_value THEN
         lastName = personFieldValue.resolved_value.last_name || 'Event'
       ELSE
         lastName = 'Event'
       END IF
     ELSE
       lastName = 'Event'
     END IF

  3. Clean script name (remove special characters, replace spaces with hyphens):
     cleanScriptName = scriptName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')

  4. Build filename: "{lastName}-{cleanScriptName}.{extension}"
     Example: "Garcia-English-Program.pdf"

  5. Return filename
END FUNCTION
```

### Testing Requirements

**Unit Tests:**
- `markdown-processor.ts` functions:
  - `replaceFieldPlaceholders()` with various field types
  - `parseMarkdownToHTML()` with markdown syntax
  - `parseMarkdownToHTML()` with custom {red}{/red} syntax
  - Edge cases: missing fields, null values, empty content

**Integration Tests:**
- Script view page renders correctly
- Export buttons trigger correct API routes
- Field replacement works end-to-end
- Page breaks appear in exports

**E2E Tests (if time permits):**
- User navigates from event view to script view
- User exports PDF and file downloads
- User prints script
- Empty fields display as "empty"

### Documentation Updates

**MODULE_REGISTRY.md:**
- Add entry for Dynamic Events module with script generation

**COMPONENT_REGISTRY.md:**
- Add ScriptCard component
- Add DynamicScriptViewer component
- Add ExportButtonGroup component

**FORMATTERS.md:**
- Document `generateDynamicEventScriptFilename()` helper

**Other Documentation:**
- No updates needed to LITURGICAL_SCRIPT_SYSTEM.md (dynamic events use different pattern)
- No updates needed to RENDERER.md (not using v1 renderers)

### Security Considerations

**Authentication:**
- All routes (pages and API) check user authentication
- Redirect to /login if not authenticated

**Authorization:**
- Event access controlled by parish_id via RLS
- Scripts access controlled by event_type_id → parish_id via RLS
- Users can only access scripts for their parish's event types

**Data Validation:**
- Verify script belongs to event's event type (prevent unauthorized access)
- Verify event belongs to correct event type slug (prevent URL manipulation)

**RLS Enforcement:**
- All database queries automatically enforce RLS policies
- Scripts table policies: Parish members SELECT, Admins INSERT/UPDATE/DELETE
- Sections table policies: Parish members SELECT, Admins INSERT/UPDATE/DELETE
- Dynamic events table policies: Existing policies apply

### Implementation Complexity

**Complexity Rating:** Medium

**Reason:**
- **Familiar patterns:** Follows existing export infrastructure from v1 modules
- **New challenge:** Markdown processing and field replacement (not in v1)
- **Database:** No schema changes needed - all tables exist
- **Components:** Mix of existing (cards, buttons) and new (script viewer, export group)
- **Routes:** Straightforward API routes following established patterns
- **Testing:** Standard testing requirements

**Estimated Effort Breakdown:**
- Markdown processing utility: 20% of effort (new pattern)
- API routes (PDF, Word, Text): 30% of effort (adapt existing patterns)
- Print page: 10% of effort (copy existing pattern)
- Script view page: 20% of effort (new layout)
- Event view page updates: 10% of effort (add script cards)
- Components (ScriptCard, DynamicScriptViewer, ExportButtonGroup): 10% of effort

**Note:** Focus on WHAT needs to be done, not how long it will take. No time or cost estimates included per requirements-agent guidelines.

### Dependencies and Blockers

**Dependencies:**
- `marked` library (markdown parsing) - Already available in project
- `pdfmake` library (PDF generation) - Already in use
- `docx` library (Word generation) - Already in use
- Existing server actions: `getScripts()`, `getScriptWithSections()`, `getEventWithRelations()`
- Existing components: ContentCard, Button

**Blockers:**
- None identified - all database tables and server actions already exist

### Documentation Inconsistencies Found

**None identified during analysis.**

The existing documentation accurately describes:
- Database schema for scripts and sections
- Server actions for fetching scripts
- Export patterns from v1 modules
- Type interfaces in event-types.ts

All patterns are consistent and well-documented.

### Next Steps

**Status updated to "Ready for Development"**

Hand off to developer-agent for implementation.

**Implementation Order (Recommended):**

1. **Markdown processing utility** (`/src/lib/utils/markdown-processor.ts`)
   - Implement field replacement logic
   - Implement markdown parsing
   - Test with sample data

2. **Components** (in order):
   - ScriptCard component (simple, reuses existing patterns)
   - ExportButtonGroup component (straightforward button group)
   - DynamicScriptViewer component (uses markdown processor)

3. **Print page** (`/src/app/print/events/[event_id]/scripts/[script_id]/page.tsx`)
   - Server component with authentication
   - Fetch data, process markdown, render HTML
   - Test in browser print view

4. **Text export API route** (simplest export format)
   - Implement string processing
   - Test download

5. **PDF export API route**
   - Implement markdown → pdfmake conversion
   - Test PDF generation

6. **Word export API route**
   - Implement markdown → docx conversion
   - Test Word generation

7. **Script view page**
   - Server component (fetch data)
   - Client component (layout + DynamicScriptViewer)
   - Test navigation and rendering

8. **Event view page updates**
   - Add scripts section with ScriptCard grid
   - Test navigation to script view

9. **Filename generation helper**
   - Add to formatters.ts
   - Update all export routes to use helper

10. **Testing**
    - Unit tests for markdown processor
    - Integration tests for routes
    - E2E tests for user flows

11. **Documentation updates**
    - MODULE_REGISTRY.md
    - COMPONENT_REGISTRY.md
    - FORMATTERS.md
