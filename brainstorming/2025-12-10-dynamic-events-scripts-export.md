# Dynamic Events - Scripts & Export System

**Created:** 2025-12-10
**Status:** Vision (awaiting technical requirements)
**Agent:** brainstorming-agent

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
- [ ] Event view page displays list of available scripts for that event type as visual cards
- [ ] Clicking a script card navigates to dedicated script view page
- [ ] Script view page renders the complete liturgical document with all fields replaced
- [ ] All 4 export formats work (PDF, Word, Print, Text)
- [ ] Empty fields display as "empty" in generated documents
- [ ] Event view page sidebar shows Edit, Delete, and created date metadata
- [ ] Script view page follows ModuleViewContainer pattern with export buttons in sidebar

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

## Next Steps

Hand off to requirements-agent for technical analysis:
- Analyze existing script/content builder infrastructure
- Define database relationships for event types → scripts
- Specify exact API route signatures
- Detail field replacement algorithm
- Map out WithRelations pattern for events
- Identify reusable components from v1
- Create detailed implementation checklist

---

**User Note:** "We had this implemented before. It shouldn't be terribly difficult."
This feature builds on existing, proven patterns from v1. The main work is adapting the existing script/export system to work with dynamic event types instead of hard-coded modules.
