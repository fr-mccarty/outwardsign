# Events Module Enhancement: User-Configurable Event Types with Custom Fields and Templates

**Created:** 2025-12-18
**Status:** Vision (awaiting technical requirements)
**Agent:** brainstorming-agent

## Feature Overview

Transform the Events module from a simple calendar of parish activities into a flexible, user-configurable system where administrators can define Event Types with custom fields, users can create rich event scripts for printing, and recurring events can be managed through templates.

## Problem Statement

Currently, the Events module is limited compared to the Masses module. Events lack the ability to:
- Capture custom information specific to different event types (e.g., prayer text for a wedding, discussion leader for Bible study)
- Generate formatted scripts/printouts for event coordinators
- Reuse event configurations for recurring activities (weekly Bible study, monthly fundraisers)
- Adapt to the diverse needs of different parish event types

Parish staff need a flexible event management system that can handle everything from liturgical events to administrative meetings to community gatherings, each with their own unique data requirements and printable outputs.

## User Stories

### For Parish Administrators
- As a parish administrator, I want to define new Event Types (Bible Study, Fundraiser, Religious Education, etc.) so that staff can create events with the appropriate fields and structure
- As a parish administrator, I want to configure which custom fields each Event Type requires so that staff capture all necessary information
- As a parish administrator, I want to set up default Event Types during onboarding (CEDAR) so that parishes can start using the system immediately with common event types

### For Parish Staff
- As a parish staff member, I want to create events with custom fields specific to the event type so that I can capture all relevant information (prayer text, coordinator name, special instructions)
- As a parish staff member, I want to mark events as "all-day" or multi-day so that the calendar accurately reflects events without specific times or spanning multiple days
- As a parish staff member, I want to generate printable scripts from event data so that coordinators have formatted reference materials
- As a parish staff member, I want to create an event from a template so that I can quickly set up recurring activities without re-entering all the details
- As a parish staff member, I want to save an event as a template so that I can reuse the configuration for future occurrences

### For Event Coordinators
- As an event coordinator, I want to print event scripts with all relevant information so that I have everything I need at a glance during the event
- As an event coordinator, I want to see all custom fields relevant to my event type so that I know what information to gather and prepare

## Success Criteria

What does "done" look like?

- [ ] Administrators can create and configure Event Types through Settings UI
- [ ] Each Event Type can have custom fields of multiple types (text, person picker, location, date, number, dropdown, checkbox, rich text)
- [ ] Custom field labels are user-definable (not bilingual - organizations operate in one language)
- [ ] Fields can be marked as required or optional per Event Type
- [ ] Events can be marked as all-day or timed (with multi-day support)
- [ ] Users can create events based on configured Event Types with appropriate custom fields
- [ ] Event scripts are user-configurable (users arrange which fields appear and in what order)
- [ ] Scripts can be exported in HTML, PDF, Word, and Text formats
- [ ] Users can save events as templates
- [ ] Users can create new events from existing templates
- [ ] Pre-configured Event Types (Bible Study, Fundraiser, Religious Education, Staff) are added during onboarding
- [ ] Calendar feed (.ics) correctly represents timed, all-day, and multi-day events

## Scope

### In Scope (MVP)

**Event Type Configuration (Admin)**
- Create/edit/delete Event Types through Settings UI
- Define custom fields for each Event Type with:
  - Field type (Text, Textarea, Person picker, Location picker, Group reference, Date/Time, Number, Dropdown/Select, Checkbox, Rich text)
  - User-defined label (single language)
  - Required vs optional flag
  - Field ordering
- Pre-configured Event Types added during onboarding (Bible Study, Fundraiser, Religious Education, Staff)

**Event Creation & Management (Staff)**
- Create events based on Event Types
- Fill in custom fields defined for that Event Type
- Mark events as timed or all-day
- Support multi-day events (start_date, end_date)
- Optional connections to Locations, Groups, and People (as field inputs)
- Date always required, time optional

**Script Generation**
- User-configurable script templates per Event Type
- Arrange which fields appear in script
- Control field ordering and layout
- Export to HTML, PDF, Word, and Text formats
- Basic default template for seeder: time, date, responsible person

**Template System**
- Save any event as a template
- View list of available templates when creating events
- "Create from Template" action that pre-fills form with template data
- Templates save ALL inputs that the Event Type exposes
- Templates viewable by all staff (parish-wide)

**Calendar Integration**
- All-day events displayed with "All Day" badge
- Multi-day events show date range
- .ics calendar feed properly formats timed, all-day, and multi-day events

### Out of Scope (Future)

**Phase 2 Enhancements:**
- Template management (edit existing templates, delete templates, template permissions)
- Scheduled recurring events (auto-create from template on schedule)
- Advanced script layouts (multi-column, conditional sections)
- Event Type categories or grouping
- Field dependencies (show Field B only if Field A has certain value)
- Custom validation rules per field
- Event Type permissions (who can create which types)
- Template privacy settings (private vs shared templates)
- Bilingual field labels (if organizations request multi-language internal operations)

**Not Planned:**
- Role assignments like Masses module (Events use custom fields instead)
- Fixed liturgical structure (Events are fully flexible)

## Key User Flows

### Primary Flow: Create New Event Type (Administrator)

1. Admin navigates to Settings → Event Types
2. Admin clicks "Create New Event Type"
3. Admin enters Event Type details:
   - Name (e.g., "Bible Study")
   - Description (optional)
4. Admin adds custom fields:
   - Click "Add Field"
   - Select field type (Text, Person picker, Location, etc.)
   - Enter field label (e.g., "Discussion Leader", "Prayer Text", "Room Setup Notes")
   - Mark as required or optional
   - Reorder fields via drag-and-drop
5. Admin configures default script template:
   - Drag fields into script layout
   - Add static text sections
   - Preview script output
6. Admin saves Event Type
7. Event Type is now available when creating events

### Primary Flow: Create Event from Event Type (Staff)

1. Staff member navigates to Events → Create New Event
2. Staff selects Event Type from dropdown (e.g., "Bible Study")
3. Form displays custom fields defined for that Event Type:
   - Date (required)
   - All-day event checkbox
   - If not all-day: Time inputs (start/end)
   - If multi-day: End date input
   - Custom fields specific to Event Type (Discussion Leader, Topic, Prayer Text, etc.)
4. Staff fills in required and optional fields
5. Staff optionally connects Location, Group, or People via pickers
6. Staff saves event
7. Event appears in calendar and list view
8. Staff can generate and export event script

### Primary Flow: Create Event from Template (Staff)

1. Staff member navigates to Events → Create New Event
2. Staff clicks "Create from Template" (or similar action)
3. System shows list of available templates filtered by Event Type
4. Staff selects a template (e.g., "Weekly Bible Study - Tuesday Evening")
5. Form pre-fills with template data:
   - Event Type
   - All custom field values from template
   - Location, Group, People connections
   - Time (if not all-day)
6. Staff modifies date to new occurrence date
7. Staff adjusts any other fields as needed (e.g., different discussion topic)
8. Staff saves event
9. New event is created with all template data plus modifications

### Alternative Flow: Save Event as Template

1. Staff member creates and saves an event (or edits existing event)
2. Staff clicks "Save as Template" button
3. Dialog appears: "Enter template name"
4. Staff enters descriptive name (e.g., "Weekly Bible Study - Tuesday Evening")
5. System saves template with all current event data
6. Template is now available for "Create from Template" flow

### Alternative Flow: All-Day Event

1. Staff creates new event
2. Staff checks "All-day event" checkbox
3. Time input fields hide
4. If multi-day: Staff enters end date
5. Staff completes other fields and saves
6. Event displays with "All Day" badge in calendar
7. .ics feed uses date-only format

### Alternative Flow: Generate and Export Script

1. Staff views an event detail page
2. Staff clicks "Generate Script" or similar action
3. System renders script using Event Type's configured template
4. Script displays with all custom field values formatted
5. Staff clicks export button (PDF, Word, Text, or HTML)
6. System generates and downloads file
7. Coordinator can print and use at event

## Data Model Overview

### Event Types Table
- `id` - UUID
- `parish_id` - UUID (parish-scoped)
- `name` - Text (e.g., "Bible Study", "Fundraiser")
- `description` - Text (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Event Type Fields Table
- `id` - UUID
- `event_type_id` - UUID (foreign key)
- `field_type` - Enum (text, textarea, person_picker, location_picker, group_reference, date_time, number, dropdown, checkbox, rich_text)
- `label` - Text (user-defined, e.g., "Discussion Leader")
- `is_required` - Boolean
- `order` - Integer (for field ordering)
- `options` - JSONB (for dropdown values, validation rules, etc.)

### Event Type Scripts Table (Script Templates)
- `id` - UUID
- `event_type_id` - UUID (foreign key)
- `template_structure` - JSONB (defines which fields appear, order, layout)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Events Table (Enhanced)
- Existing fields:
  - `id`, `parish_id`, `title`, `description`, `date`, `location_id`, etc.
- New fields:
  - `event_type_id` - UUID (foreign key to Event Types)
  - `start_date` - Date (required)
  - `end_date` - Date (optional, for multi-day events)
  - `time` - Time (optional)
  - `end_time` - Time (optional)
  - `is_all_day` - Boolean
  - `custom_field_values` - JSONB (stores all custom field data as key-value pairs)

### Event Templates Table
- `id` - UUID
- `parish_id` - UUID
- `event_type_id` - UUID (foreign key)
- `name` - Text (template name, e.g., "Weekly Bible Study - Tuesday Evening")
- `template_data` - JSONB (stores all field values except date)
- `created_by` - UUID (user who created template)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Notes:**
- `custom_field_values` JSONB stores dynamic fields: `{"discussion_leader_id": "uuid", "prayer_text": "Our Father...", "expected_attendance": 25}`
- `template_data` JSONB stores same structure as `custom_field_values` plus time settings
- Migration strategy: Existing events don't need migration (database will be reset)

## Integration Points

### Existing Features This Touches

**Events Module**
- Existing event creation/edit forms will be enhanced with custom fields
- List view and calendar view remain similar
- View page gains script generation capability

**Settings Module**
- New section: Event Types configuration
- Admin-only access
- CRUD interface for Event Types and their fields

**People, Locations, Groups Modules**
- Person picker, Location picker, Group reference fields will use existing picker components
- Events optionally connect to these entities via custom fields

**Print/Export System**
- Leverage existing script generation patterns from Masses module
- Use existing PDF/Word/Text export infrastructure
- New script template builder UI for Event Types

**Calendar Feed (.ics)**
- Enhanced to support all-day and multi-day events properly
- Existing timed events continue to work as before

### Existing Components to Reuse

**Pickers**
- `PersonPicker` - For person picker fields
- `LocationPicker` - For location picker fields
- `GroupPicker` - For group reference fields (if exists, or create new)

**Forms**
- `FormField` component for all input types
- Existing validation patterns (Zod + React Hook Form)
- Date/time picker components

**Script Generation**
- Content builder pattern from Masses module
- Renderer system (HTML, PDF, Word)
- Export buttons component

**UI Components**
- Drag-and-drop for field ordering (use @dnd-kit like other modules)
- DataTable for Event Types list
- Dialog components for confirmations
- Toast notifications for success/error messages

### Existing Patterns to Follow

**Module Structure**
- Follow 8-file module pattern (masses module as reference)
- Server components for data fetching
- Client components for forms and interactivity

**Permission System**
- Event Type configuration: Admin only
- Event creation/editing: Staff and above
- Template usage: Staff and above (viewable by all staff)

**Bilingual Support**
- Event Type names and system labels: Bilingual (EN/ES)
- Custom field labels: NOT bilingual (user-defined, single language)
- System UI follows existing bilingual patterns

## Open Questions for Requirements-Agent

### Technical Architecture Questions

1. **JSONB vs Separate Tables for Custom Fields?**
   - Should `custom_field_values` use JSONB (flexible, simple queries)?
   - Or should we create `event_field_values` table with rows per field (normalized, complex queries)?
   - What are the performance implications for filtering/searching on custom fields?

2. **Event Type Field Configuration Storage?**
   - Is `event_type_fields` table sufficient?
   - How should dropdown options be stored in `options` JSONB?
   - How should field validation rules be stored?

3. **Script Template Storage?**
   - What structure should `template_structure` JSONB use?
   - Should it reference field IDs or field labels?
   - How should static text sections be represented?

4. **Template Data Cloning?**
   - When creating from template, how should related entity references be handled?
   - If template references a Person who is no longer available, what happens?
   - Should templates validate that referenced entities still exist?

### UI/UX Questions

1. **Event Type Field Builder UI?**
   - What's the best interface for admins to add/configure fields?
   - Should there be a preview of the event form as fields are added?
   - How should field types with specific options (dropdown, checkbox) be configured?

2. **Script Template Builder UI?**
   - How should admins arrange fields in the script layout?
   - Drag-and-drop interface?
   - WYSIWYG editor?
   - Simple field ordering with preview?

3. **Template Selection UI?**
   - How should templates be displayed when creating events?
   - Grid of cards? Dropdown? Searchable list?
   - Should templates show preview of fields?

4. **Multi-Day Event UI?**
   - When "all-day" is checked, how does end_date input appear?
   - Should there be a separate "multi-day" checkbox or just show end_date when all-day is checked?
   - How should multi-day events display in calendar view?

### Data Migration Questions

1. **Existing Events?**
   - Confirmed: Database will be reset, no migration needed
   - But for future reference, how would existing events map to Event Types?
   - Should there be a default "General Event" type?

2. **Pre-configured Event Types?**
   - What custom fields should Bible Study, Fundraiser, Religious Education, and Staff meeting types have?
   - Should these be created in seed data or during onboarding (CEDAR)?

### Implementation Order Questions

1. **Phasing Strategy?**
   - Should Event Type configuration be built first, then event creation with custom fields?
   - Or should script generation come before templates?
   - What's the logical implementation order?

2. **Testing Strategy?**
   - How should dynamic custom fields be tested?
   - What's the strategy for testing script generation with various field types?
   - How should template creation/usage be tested?

3. **Backward Compatibility?**
   - Even though database resets, should the Events module continue to work without Event Types configured?
   - Or should Event Types be required from the start?

### Calendar Feed Questions

1. **All-Day Event Format?**
   - Confirm .ics format for all-day events: `DTSTART;VALUE=DATE:20250715`?
   - Multi-day all-day events: `DTSTART;VALUE=DATE:20250715` and `DTEND;VALUE=DATE:20250717`?

2. **Time Zone Handling?**
   - How should timed events handle time zones in .ics feed?
   - Should parish time zone be stored/configurable?

### Performance Questions

1. **Custom Field Queries?**
   - If filtering events by custom field values (e.g., "all events where Discussion Leader = John Doe"), what's the query performance?
   - Should custom fields be indexed? (JSONB GIN index?)

2. **Script Generation Performance?**
   - For events with many custom fields and rich text, what's the expected script generation time?
   - Should scripts be cached or generated on-demand?

## Success Metrics

How will we know this feature is successful?

**Usage Metrics:**
- Number of Event Types created per parish
- Percentage of events using custom Event Types vs default types
- Number of templates created and reused
- Number of scripts generated and exported

**Quality Metrics:**
- Reduction in time to create recurring events
- Staff satisfaction with custom field flexibility
- Number of support requests related to event configuration

**Adoption Metrics:**
- Parishes configuring Event Types during onboarding
- Staff creating events from templates vs from scratch
- Usage of script export functionality

## Next Steps

1. **Hand off to requirements-agent** for technical analysis:
   - Analyze database schema implications (JSONB vs normalized tables)
   - Define server actions for Event Types, Events, and Templates
   - Specify API routes for script generation and export
   - Design UI component structure for Event Type builder
   - Document integration points with existing modules

2. **Requirements-agent should investigate:**
   - Existing script generation patterns in Masses module
   - Existing picker component APIs
   - Existing form validation patterns
   - Performance implications of JSONB storage for custom fields
   - Best practices for dynamic form generation based on Event Type configuration

3. **After requirements phase:**
   - Move this file to `/requirements/2025-12-18-events-module-enhancement.md`
   - Begin phased implementation with developer-agent
   - Create test plans with test-writer
   - Update documentation with project-documentation-writer

---

**Vision captured by brainstorming-agent on 2025-12-18**
**Ready for technical requirements analysis**
