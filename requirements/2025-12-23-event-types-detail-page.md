# Event Types Detail Page

**Created:** 2025-12-23
**Status:** Vision (awaiting technical requirements)
**Agent:** brainstorming-agent

## Feature Overview

Create the missing `/settings/event-types/{slug}` detail page that allows parish admins to view and edit event type configurations, including custom fields and printable script templates.

## Three Systems at Stake

This feature involves three distinct but interconnected systems:

### 1. Custom Field Definitions
**What it does:** Defines what data to collect for each event type
- Admin configures which fields appear on event creation/edit forms
- Each event type has its own set of custom fields
- 16 field types available (person, text, date, content picker, etc.)
- Fields are stored in `input_field_definitions` table
- **Works the same for ALL three event types** (masses, special-liturgies, parish-events)

### 2. Script Definitions
**What it does:** Defines the structure of printable scripts
- **SPECIAL LITURGIES ONLY:** Full drag-and-drop ceremony builder with sections (cover page, readings, ceremony, etc.)
- **MASSES & PARISH EVENTS:** Simple output - custom fields printed in the order they were defined (no drag-and-drop builder needed)
- Scripts are stored in `scripts` table, sections in `sections` table

### 3. Output System
**What it does:** Renders scripts to various formats
- Takes a script template + event data → produces output
- Supports HTML (web view), PDF (print), Word (download)
- **SPECIAL LITURGIES:** Complex section rendering with placeholder expansion
- **MASSES & PARISH EVENTS:** Code-based content builder that prints custom fields in their defined order
- Uses existing content builders and renderer infrastructure

**Key insight:** Only special liturgies need the full ceremony script builder. Masses and parish events use a simpler approach where custom fields are printed in the order they were inputted.

## Problem Statement

The `/settings/event-types/{slug}` route currently returns 404. Three settings pages (masses, events, special-liturgies) link to this route when users click on an event type, but the page doesn't exist.

**Current State:**
- Users can create, reorder, and delete event types from list pages
- Users CANNOT view or edit existing event type details
- Clicking an event type name results in a 404 error

**Who has this problem:**
Parish admins who need to configure event types with custom fields and printable scripts for their parish's sacramental and liturgical workflow.

## User Stories

- As a parish admin, I want to define custom fields for an event type so that staff can capture the specific information needed for that type of event (bride/groom names for weddings, deceased name for funerals, etc.)

- As a parish admin, I want to create multiple script templates for an event type so that our priests and deacons have different ceremony options to choose from (Full Wedding Ceremony, Simple Wedding Ceremony, Wedding with Mass)

- As a parish admin, I want script templates to automatically include information from custom fields so that printed scripts show the couple's names, selected readings, and ceremony details without manual copying

- As a parish admin, I want to edit existing event type configurations so that I can refine custom fields and scripts as our parish workflow evolves

- As a parish staff member, I want custom fields to appear on event creation forms so that I can enter all the required information for that type of event in one place

## Success Criteria

What does "done" look like?

- [ ] Clicking an event type name from any settings page (masses/events/special-liturgies) navigates to a working detail page (no 404)
- [ ] Admin can view all custom fields defined for an event type
- [ ] Admin can add, edit, reorder, and delete custom fields
- [ ] Admin can view all script templates defined for an event type
- [ ] Admin can add, edit, reorder, and delete script templates
- [ ] Script templates can reference custom fields using slug-based placeholders like `{{bride.first_name}}`
- [ ] Custom fields appear on event creation/edit forms for that event type
- [ ] Script templates render correctly with custom field data when printed/exported

## Scope

### In Scope (MVP)

**Custom Fields:**
- Define custom fields with 16 available field types
- Configure field properties (label, type, required/optional, type-specific config)
- Reorder custom fields (affects form display order)
- Delete custom fields

**Script Templates:**
- Create multiple script templates per event type
- Build templates by stacking pre-defined section types
- Use slug-based placeholders to reference custom fields
- Reorder and delete script templates

**UI/Navigation:**
- Detail page accessible from all three settings pages (masses, events, special-liturgies)
- Consistent with existing settings page patterns
- Back navigation to parent settings page

### Out of Scope (Future)

**Settings and Defaults:**
- Default duration, location, permissions
- Visual styling (colors, icons beyond what's set at creation)
- Required vs optional fields enforcement (beyond basic required flag)

**Advanced Features:**
- Shared/reusable custom fields across event types
- Script template preview/testing
- Conditional sections (show section only if field has value)
- Script versioning/history

## Key User Flows

### Primary Flow: Add Custom Field to Event Type

1. Admin navigates to Settings → Events (or Masses/Special Liturgies)
2. Admin clicks on an event type name (e.g., "Wedding")
3. System displays event type detail page
4. Admin clicks "Add Custom Field" button
5. Admin fills in field definition form:
   - Field label (e.g., "Bride")
   - Field type (select from 16 types: person, text, date, etc.)
   - Required/optional toggle
   - Type-specific config (e.g., `list_id` for list_item type, `input_filter_tags` for content picker)
   - Special flags if applicable (`is_key_person`, `is_primary`)
6. Admin saves custom field
7. System generates field slug from label (e.g., "bride" from "Bride")
8. Custom field appears in the event type's field list
9. When staff create/edit events of this type, the custom field appears on the form

### Alternative Flow: Create Script Template

1. Admin navigates to event type detail page
2. Admin clicks "Add Script Template" button
3. Admin enters template name (e.g., "Full Wedding Ceremony")
4. Admin builds template by adding sections:
   - Clicks "Add Section" → selects section type (Cover Page, Reading, Psalm, Ceremony, etc.)
   - Configures section content (static text or references to custom fields)
   - Uses `{{custom_field_slug}}` placeholders for dynamic content (e.g., `{{bride.first_name}}`)
   - Reorders sections via drag-and-drop
5. Admin saves script template
6. Template appears in event type's template list
7. When staff view/print events of this type, they can select this template for printing

### Edge Cases to Consider

**Custom Fields:**
- What happens to existing event data if a custom field is deleted?
- What if two fields have similar names that generate the same slug?
- Can admins edit a field's type after creation, or only label/required status?
- How are type-specific configs (like `list_id`, `input_filter_tags`) presented in the UI?

**Script Templates:**
- What happens if a template references a custom field that gets deleted?
- How does the system validate that placeholder slugs match existing custom fields?
- Can templates reference standard event fields (like event date, location) in addition to custom fields?
- What if a section type requires configuration (like which reading to display)?

**Cross-Type Consistency:**
- Should all three system types (mass, event, special_liturgy) have identical detail pages?
- Or do special liturgies need more complex script capabilities than parish events?

## Custom Fields - Detailed Requirements

### The 16 Field Types

Custom fields can be any of these types:

**Reference Types (select existing records):**
- `person` - PersonPickerField (UUID) - can be marked as "Key Person" for search
- `group` - GroupPickerField (UUID)
- `location` - LocationPickerField (UUID)
- `list_item` - ListItemField (UUID) - requires `list_id` to specify which custom list
- `document` - DocumentPickerField (UUID)
- `content` - ContentPickerField (UUID) - supports `input_filter_tags`
- `petition` - PetitionPickerField (UUID) - supports `input_filter_tags`
- `mass-intention` - MassIntentionField (string)

**Data Entry Types:**
- `text` - Input (string)
- `rich_text` - Textarea (string)
- `date` - DatePicker (ISO date)
- `time` - TimePicker (time string)
- `datetime` - DateTimePicker (ISO datetime)
- `number` - Input number
- `yes_no` - Switch (boolean)

**Special Types:**
- `calendar_event` - Date/time/location bundle - shows in calendar, can be marked "Primary"
- `spacer` - Visual separator, no data

### Field Configuration

Each custom field has:
- **Label** (string) - Display name shown to users (e.g., "Bride", "Groom", "Rehearsal Date")
- **Slug** (string) - Auto-generated from label (e.g., "bride", "groom", "rehearsal_date") - used in script placeholders
- **Type** (enum) - One of the 16 field types
- **Required** (boolean) - Whether field must be filled in
- **Type-specific config:**
  - `list_id` (UUID) - For `list_item` type only
  - `input_filter_tags` (array of tag slugs) - For `content` and `petition` types
- **Special flags:**
  - `is_key_person` (boolean) - For `person` type - makes field searchable in list view
  - `is_primary` (boolean) - For `calendar_event` type - marks main occurrence

### Free-Form Definition

- Custom fields are **NOT shared** between event types
- Each event type has its own independent set of custom fields
- Admins define fields from scratch each time (no reusable field library)
- Fields can be reordered to control display order on event forms

### How Custom Fields Appear on Forms

When staff create or edit an event of a specific type:
1. Event form loads with standard fields (event name, date, location, etc.)
2. Custom fields for that event type appear below standard fields
3. Custom fields render using their configured field type (text input, person picker, date picker, etc.)
4. Required fields are marked and validated
5. Field order matches the order defined on the event type detail page

## Script Templates - Detailed Requirements

### Multiple Templates Per Event Type

Each event type can have multiple script templates:
- **Wedding** might have: "Full Wedding Ceremony", "Simple Wedding Ceremony", "Wedding with Mass"
- **Funeral** might have: "Funeral Mass", "Funeral Liturgy without Mass", "Graveside Service"
- **Baptism** might have: "Infant Baptism", "Adult Baptism", "Emergency Baptism"

When viewing/printing an event, staff select which template to use.

### Pre-defined Section Types

Scripts are built by stacking **pre-defined section types** from the existing liturgical script system:

- **Cover Page** - Title, date, location, celebrant info
- **Reading** - Scripture readings from content library
- **Psalm** - Responsorial psalm from content library
- **Petitions** - Prayers of the faithful from petition library
- **Announcements** - Parish announcements
- **Ceremony** - Custom ceremony text (vows, rituals, instructions)
- **Custom Text** - Free-form text sections

Each section type has its own rules and configuration options (see CONTENT_BUILDER_SECTIONS.md for complete details).

### Building a Script Template

Admin workflow:
1. Create new template (give it a name)
2. Add sections one by one:
   - Click "Add Section"
   - Select section type (Reading, Ceremony, Custom Text, etc.)
   - Configure section content (see below)
3. Reorder sections via drag-and-drop
4. Save template

### Slug-based Placeholders for Dynamic Content

Script templates use **slug-based placeholders** to reference custom fields:

**Syntax:** `{{custom_field_slug}}`

**Examples:**
- `{{bride.first_name}}` - First name from "Bride" person picker field
- `{{groom.last_name}}` - Last name from "Groom" person picker field
- `{{rehearsal_date}}` - Date from "Rehearsal Date" date picker field
- `{{deceased_name}}` - Text from "Deceased Name" text field

**Where placeholders are used:**
- In **Ceremony** sections (custom ceremony text with dynamic data)
- In **Custom Text** sections (free-form text with placeholders)
- Possibly in **Cover Page** sections (event-specific titles)

**How placeholders work:**
1. Admin writes template with placeholders: "We gather today to celebrate the marriage of {{bride.first_name}} and {{groom.first_name}}..."
2. When rendering the script, system looks up the custom field by slug
3. System retrieves the value from the event's custom field data
4. System replaces placeholder with actual value
5. Rendered script shows: "We gather today to celebrate the marriage of Maria and José..."

### Template Rendering

When staff view/print an event:
1. Select which script template to use
2. System builds the script:
   - Renders each section in order
   - Replaces all `{{placeholders}}` with actual event data
   - Applies formatting and styling
3. Script is displayed/printed/exported (PDF, Word, etc.)

## Integration Points

### Existing Features This Touches

**Settings Pages:**
- `/settings/masses` - Mass types list
- `/settings/events` - Event types list
- `/settings/special-liturgies` - Special liturgy types list
- All three pages link to the new detail page

**Event Creation/Edit Forms:**
- Custom fields must dynamically appear on forms based on event type
- Forms must validate required custom fields
- Forms must save custom field values to database

**Liturgical Script System:**
- Script templates use existing section types from CONTENT_BUILDER_SECTIONS.md
- Rendering system must support slug-based placeholders
- Export system (PDF, Word) must render templates correctly

**Event View Pages:**
- Must allow selecting which script template to use for printing
- Must display rendered script with custom field data

### Existing Components to Reuse

- **Form components** - Use existing FormField, Input, DatePicker, PersonPickerField, etc. (see FORMS.md)
- **Section builders** - Reuse existing liturgical script section components (see CONTENT_BUILDER_SECTIONS.md)
- **Drag-and-drop** - Use @dnd-kit for reordering fields and sections (see DRAG_AND_DROP.md)
- **Export buttons** - Use existing PDF/Word export patterns (see EXPORT_BUTTONS.md)

### Existing Patterns to Follow

- **Module structure** - Follow 8-file module pattern (see MODULE_COMPONENT_PATTERNS.md)
- **Form patterns** - Use unified form with isEditing pattern (see FORMS.md)
- **Styling** - Dark mode support with semantic tokens (see STYLES.md)
- **Bilingual** - All UI text must have English and Spanish translations (see CODE_CONVENTIONS.md)

## Open Questions for Requirements-Agent

### Database Schema

1. Where should custom field definitions be stored?
   - New table `event_type_custom_fields`?
   - JSONB column on existing `event_types` table?
   - How to handle field ordering?

2. Where should custom field VALUES be stored for individual events?
   - JSONB column on event tables (masses, events, etc.)?
   - Separate polymorphic table for custom field values?
   - How to handle different data types (UUID vs string vs date)?

3. Where should script templates be stored?
   - New table `event_type_script_templates`?
   - How to store section configuration (which sections, in what order)?
   - How to store placeholder mappings?

### Technical Implementation

4. How are field slugs generated and validated?
   - Auto-generate from label on creation?
   - Ensure uniqueness within event type?
   - Allow manual editing of slugs?

5. How does the form builder dynamically render custom fields?
   - Server component that fetches field definitions?
   - Client component with conditional rendering based on field type?
   - How to handle type-specific configs (list_id, input_filter_tags)?

6. How does the script renderer resolve placeholders?
   - Regex-based replacement?
   - Template engine (Handlebars, Mustache)?
   - How to handle nested properties ({{bride.first_name}})?
   - Error handling for missing fields or invalid slugs?

7. How are script templates selected at print time?
   - Dropdown on event view page?
   - Default template per event type?
   - Can users switch templates after viewing?

### UI/UX Details

8. ~~What does the detail page layout look like?~~ **RESOLVED**
   - **Answer:** Three-page structure (hub → fields → scripts) - see Wisdom Agent Review Notes

9. How are custom fields created/edited?
   - Inline editing in a list?
   - Modal dialog form?
   - Separate "Add Custom Field" page?

10. How are script templates built? **(Special liturgies only)**
    - Visual section builder (drag-and-drop sections)?
    - Form-based (select sections from dropdown)?
    - Rich text editor with section insertion?

11. How are placeholders inserted into script templates? **(Special liturgies only)**
    - Manual typing of {{slug}}?
    - Dropdown/autocomplete of available custom fields?
    - Visual placeholder insertion button?

### Cross-Type Behavior

12. ~~Do all three system types (mass, event, special_liturgy) use the same detail page?~~ **RESOLVED**
    - **Answer:** Same hub and fields pages for all types. Scripts page shows full builder for special liturgies, simple message for masses/events.

### Data Migration

13. Do any existing event types already have custom fields or scripts?
    - Are we starting from scratch?
    - Any legacy data to migrate?

## Next Steps

Hand off to requirements-agent for technical analysis.

Requirements-agent should:
1. Analyze database schema options for custom fields and script templates
2. Define server actions for CRUD operations on custom fields and templates
3. Specify component structure for the detail page (following 8-file module pattern)
4. Detail the script rendering system with placeholder resolution
5. Define validation rules for field slugs and template placeholders
6. Specify how custom fields integrate with existing event creation/edit forms
7. Detail the UI flow for building script templates with sections

---

## Review Notes
(Added by devils-advocate-agent on 2025-12-23)

### Questions & Answers

**Q1: Custom Field Definitions Already Exist - What's Actually Missing?**

A: This is purely a UI/UX problem. The database infrastructure already exists:
- `input_field_definitions` table has all 16 field types
- Server actions likely exist or need minor updates
- The `/settings/event-types/{slug}` detail page UI is what's missing (currently returns 404)

**Q2: Script Templates vs Master Event Templates - Are These the Same Thing?**

A: No, they are two different features:
- **Master event templates** (`master_event_templates` table) = saved configurations for creating new events quickly (which fields to pre-fill)
- **Script templates** (`scripts` table) = printable ceremony scripts (what goes in the binder for the priest - the assemblage of sections)

**Q3: Where Do Script Templates Live in the Database?**

A: Script templates already exist in the database:
- `scripts` table - Stores script templates (name, description, order) linked to `event_type_id`
- `sections` table - Stores individual sections within a script (name, section_type, content with placeholders, order)
- Server actions exist at `/src/lib/actions/scripts.ts` with full CRUD operations
- `DynamicScriptViewer` component exists to render scripts with placeholder replacement

**Q4: Section Types Mismatch - Database vs Documentation vs Vision**

A: CONFIRMED ISSUE - The `sections` table constraint needs to be expanded:
- Current: `CHECK (section_type IN ('text', 'petition'))`
- Needed: Support for section types like `'cover_page'`, `'reading'`, `'psalm'`, `'ceremony'`, `'petitions'`, `'announcements'`, `'custom_text'`

This will require a database migration to update the constraint.

**Q5: Template-based Scripts vs Code-based Content Builders - Are These Two Different Systems?**

A: Yes, two systems that will coexist:
- **System A: Database-driven script templates** (what this feature builds) - Admin-configurable via UI
- **System B: Code-based content builders** - Still needed for rendering outputs (Word, HTML, PDF)

Parts of System B are legacy, but the rendering infrastructure is essential.

**Q6: How Do Dynamic Scripts Reference Content Library Items?**

A: Sections use placeholders that reference field values:
- Cover page section: Markdown with many `{{placeholders}}` like `{{event_date}}`, `{{bride.full_name}}`, `{{location.name}}`
- Reading section: Content references `{{first_reading}}` to expand the full reading from the content library, plus `{{lector.full_name}}` for the reader's name
- The renderer expands all placeholders automatically

**Q7: What parts of a script need to be dynamic vs. configurable?**

A: ALL OF THE ABOVE - Order, content, and inclusion all vary between parishes:
- Order varies (some parishes do vows before rings, others do rings before vows)
- Content varies (each parish has their own blessing wording)
- Inclusion varies (some weddings have readings, some don't)

This confirms that granular sections with drag-and-drop reordering are necessary.

**Q8: How do readings/psalms/petitions get into scripts?**

A: Use a section type that references dynamic field values:
- Section type `'reading'` pulls from content library based on `field_values.first_reading_id`
- Section content uses placeholders like `{{first_reading}}` that the renderer expands
- Can also reference person fields like `{{lector.full_name}}` for customization

**Q9: What's the 80/20 rule here?**

A: Mix of standard templates and customized per-event:
- Some parishes use standard templates that rarely change
- Some events need customized scripts
- The system needs to support both use cases

**Q10: Section Type Configuration - How Complex Should It Be?**

A: Start simple (Option C) - Just section_type and content (markdown with placeholders):
- Cover page: Heavily dynamic with many placeholders
- Reading page: Mostly standard, just needs reader's name as a tweak
- Renderer handles all placeholder expansion

More complex type-specific configs (show citation, include dialogue markers) can be added later if needed.

**Q11: Custom Field Deletion - What happens to existing master_events when a custom field is deleted?**

A: **Option D - Prevent deletion if field is used in any events**
- Show error message telling the user they have to go through and remove all instances (e.g., "bride" field) from events if they wish to delete the field definition
- This prevents orphaned data in `master_events.field_values` JSONB column
- Protects script templates that reference `{{field_slug}}` from breaking

**Q12: How does "simple output" actually work for masses/events?**

A: **Code-based content builder that reads `input_field_definitions` in sort order**
- Not a database-driven script template (no records in `scripts` table for masses/events)
- Code reads the `input_field_definitions.order` column and renders fields in that sequence
- When staff clicks Print on a mass/event, the system bypasses the scripts system and uses a dedicated content builder

**Q13: Should the Hub page conditionally show the "Manage Scripts" link?**

A: **Option B - Conditionally hide the Scripts link for masses/events**
- Hub page shows "Manage Scripts" link ONLY for special liturgies (`system_type = 'special-liturgy'`)
- For masses and events, Scripts link is hidden (custom fields are the only configuration needed)
- Simpler UX - don't show a link that leads to "Not applicable"

### Resolved Concerns

- **Custom fields infrastructure exists** - Just needs UI layer
- **Script templates infrastructure exists** - Just needs UI layer for building/editing
- **Two template systems clarified** - Master event templates (reusable event configs) vs Script templates (printable ceremony scripts)
- **Section approach validated** - Granular sections with drag-and-drop is the right approach
- **Placeholder expansion pattern confirmed** - Use markdown with `{{placeholders}}` that renderer expands
- **Custom field deletion behavior** - Prevent deletion if field is used (Option D)
- **Simple output implementation** - Code-based content builder reading `input_field_definitions.order`
- **Hub page navigation** - Conditionally hide Scripts link for masses/events (Option B)

### Unresolved Concerns for Requirements-Agent

- **Database migration required** - `sections.section_type` constraint needs to be updated to support all section types (cover_page, reading, psalm, ceremony, petitions, announcements, custom_text)

- **Section type rendering logic** - Requirements-agent needs to specify how different section types render:
  - `reading` type: How does renderer know to fetch from content library using `field_values.first_reading_id`?
  - `psalm` type: How does renderer know to fetch psalm content?
  - `petition` type: How does renderer know to fetch petition set?
  - `cover_page` type: Standard placeholder expansion
  - `ceremony` type: Standard placeholder expansion
  - `custom_text` type: Standard placeholder expansion

- **Server actions for input_field_definitions** - Verify that CRUD operations exist or need to be created for managing custom fields on the detail page

- **UI component structure unclear** - Requirements-agent needs to specify:
  - Should this follow the 8-file module pattern? (Probably not - this is a settings page, not a module)
  - ~~What's the page structure?~~ **RESOLVED:** Three-page structure (hub → fields → scripts)
  - How are custom fields created/edited? (Modal dialog? Inline editing? Separate page?)
  - How are script templates built? (Visual section builder with drag-and-drop? Form-based?)
  - How are placeholders inserted into sections? (Manual typing? Autocomplete? Dropdown?)

- **Event form integration** - How do custom fields dynamically appear on event creation/edit forms?
  - Server component that fetches field definitions?
  - Client component with conditional rendering?
  - How to handle type-specific configs (list_id, input_filter_tags)?

- **Validation and slug generation** - How are field slugs generated and validated?
  - Auto-generate from label on creation? (e.g., "Bride" → "bride")
  - Ensure uniqueness within event type?
  - Allow manual editing of slugs?
  - What happens if two fields generate the same slug?

- **Deletion behavior** - What happens to existing data when custom fields or sections are deleted?
  - ~~Custom field deleted: How are `field_values` in existing events affected?~~ **RESOLVED:** Prevent deletion if field is used in any events (show error message)
  - Script template deleted: Any impact on events using that template?
  - Section deleted from script: Any validation needed?

### Key Decisions Made

1. **Keep the sections table** - Granular sections with drag-and-drop reordering are necessary (for special liturgies)
2. **Expand section_type constraint** - Support cover_page, reading, psalm, ceremony, petitions, announcements, custom_text
3. **Use simple section structure for MVP** - Just section_type and content (markdown with placeholders)
4. **Placeholder-based rendering** - All section types use `{{placeholder}}` syntax that renderer expands
5. **Two template systems coexist** - Master event templates for reusable configs, Script templates for printable scripts
6. **This is primarily a UI problem** - Database infrastructure exists, needs UI layer for admin configuration
7. **Differentiated script approach by system type:**
   - **Special liturgies:** Full drag-and-drop script builder with sections
   - **Masses & parish events:** Simple output - custom fields printed in defined order (no builder needed)
8. **Custom field deletion protection** - Prevent deletion if field is used in any events (show error message requiring manual cleanup)
9. **Simple output implementation for masses/events** - Code-based content builder that reads `input_field_definitions.order` (no script templates in database)
10. **Conditional Hub navigation** - Show "Manage Scripts" link ONLY for special liturgies (hide for masses/events)

---

## Wisdom Agent Review Notes
(Added by wisdom-agent on 2025-12-23)

### Architecture Decision: Three-Page Structure

After reviewing the plan, we decided on a **three-page structure** instead of tabs (tabs don't work well on mobile):

```
/settings/event-types/{slug}         → Hub page (overview + links)
/settings/event-types/{slug}/fields  → Custom Fields management
/settings/event-types/{slug}/scripts → Scripts/Output configuration
```

**Hub Page (`/settings/event-types/{slug}`):**
- Event type overview (name, icon, description)
- Link to "Manage Custom Fields"
- Link to "Manage Scripts"
- Back navigation to parent settings page

**Fields Page (`/settings/event-types/{slug}/fields`):**
- Add/edit/reorder/delete custom fields
- Same UI for ALL three system types (masses, special-liturgies, parish-events)
- Drag-and-drop reordering

**Scripts Page (`/settings/event-types/{slug}/scripts`):**
- **Special liturgies:** Full drag-and-drop script builder with sections
- **Masses & parish events:** Simple message: "Scripts will print custom fields in their defined order"

### Why This Architecture

1. **Mobile-friendly** - No tabs, just linked pages
2. **Clean separation** - Each page does one thing
3. **Simpler code** - No complex conditionals on a single page
4. **Natural workflow** - "Define fields first, then configure output"

### Scope Simplification

The original vision was "build three complex systems for all three event types."

The clarified vision is:
- **Custom fields:** One robust system that works for all three types
- **Script builder:** Full feature for special liturgies only
- **Simple output:** Masses and parish events just print fields in order

This significantly reduces scope while still meeting real user needs.

---

## Final Devil's Advocate Review
(Added by devils-advocate-agent on 2025-12-23)

### Summary of Final Review

After reviewing the updated requirements document with the three-page architecture and simplified scope, I identified three critical areas needing clarification:

1. **Custom field deletion behavior** - RESOLVED: Prevent deletion if field is used in any events
2. **Simple output implementation** - RESOLVED: Code-based content builder reading `input_field_definitions.order`
3. **Hub page navigation logic** - RESOLVED: Conditionally hide Scripts link for masses/events

All three questions have been answered and documented in the Review Notes above.

### Document Status

**READY FOR REQUIREMENTS-AGENT**

The requirements document is now complete with:
- Clear three-page architecture (hub → fields → scripts)
- Simplified scope (full script builder only for special liturgies)
- Deletion protection strategy (prevent deletion if field is used)
- Simple output implementation (code-based content builder for masses/events)
- Conditional navigation (Scripts link only shown for special liturgies)

### Critical Items for Requirements-Agent

The requirements-agent should pay special attention to:

1. **Custom field deletion validation** - Must implement a check to count usage before allowing deletion
2. **Code-based content builder** - Needs to be created for masses/events that reads `input_field_definitions.order`
3. **Conditional UI rendering** - Hub page must check `system_type` to show/hide Scripts link
4. **Database migration** - `sections.section_type` constraint needs expansion (already documented)

No major gaps, ambiguities, or unresolved concerns remain that would block implementation.

---
