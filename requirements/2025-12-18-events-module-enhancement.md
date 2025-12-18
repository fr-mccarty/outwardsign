# Events Module Enhancement: User-Configurable Event Types with Custom Fields and Templates

**Created:** 2025-12-18
**Status:** Ready for Development
**Agent:** brainstorming-agent (vision), requirements-agent (technical specifications)

---

## CRITICAL FINDING: Most Features Already Implemented

**IMPORTANT:** After extensive codebase investigation, I discovered that **90% of the features described in this vision are ALREADY IMPLEMENTED** as part of the recent "Unified Event Data Model" (completed 2025-12-16). This requirements document focuses on the **remaining 10% gap** that needs to be implemented.

### What Already Exists (No Work Needed)

✅ **Event Types** - Fully implemented (`event_types` table) with icon, slug, system_type, order
✅ **Input Field Definitions** - Complete implementation with 18 field types including person, group, location, calendar_event, text, rich_text, date, time, datetime, number, yes_no, document, content, petition, list_item, event_link, mass-intention, spacer
✅ **Scripts & Sections** - Complete script generation system with mustache placeholders, sections, page_break_after
✅ **Master Events** - `master_events` table stores `field_values` as JSONB with presider/homilist assignment
✅ **Calendar Events** - `calendar_events` table (formerly occasions) with start_datetime, end_datetime, location, is_primary
✅ **Custom Lists** - `custom_lists` and `custom_list_items` tables for dropdown options
✅ **Script Export** - HTML/PDF/Word/Text export via renderer system already implemented
✅ **Permission System** - Admin, Staff, Ministry-Leader, Parishioner roles with RLS policies
✅ **Pre-seeded Sacraments** - Wedding, Funeral, Baptism, Quinceañera, Presentation seeded during onboarding
✅ **Event Type Configuration UI** - Already exists at `/settings/events` (Settings → Event Types)
✅ **Dynamic Forms** - `master-event-form.tsx` already generates forms dynamically based on input_field_definitions
✅ **Script Viewing** - Events already have script viewing at `/events/[event_type_id]/[id]/scripts/[script_id]`

**Reference Files:**
- `src/lib/types.ts` (lines 287-877) - Complete type system for event types, master events, calendar events
- `supabase/migrations/20251031000002_create_event_types_table.sql` - Event types table
- `supabase/migrations/20251210000004_create_input_field_definitions_table.sql` - Field definitions
- `supabase/migrations/20251210000007_create_master_events_table.sql` - Master events with JSONB field_values
- `supabase/migrations/20251210000008_create_calendar_events_table.sql` - Calendar events (replaces old occasions)
- `src/app/(main)/events/[event_type_id]/master-event-form.tsx` - Dynamic form generation
- `src/lib/onboarding-seeding/event-types-seed.ts` - Pre-seeded event types (Wedding, Funeral, Baptism, Quinceañera, Presentation)

### What's Missing (Actual Work Needed)

❌ **Master Event Templates Table** - New table needed to save master event configurations for reuse
❌ **Template CRUD Server Actions** - Create/read/update/delete operations for templates
❌ **"Create from Template" UI Flow** - Template picker and pre-fill logic
❌ **"Save as Template" Button** - Add to master event view page
❌ **Template List View** - Show available templates when creating events
❌ **Pre-seeded General Event Types** - Add Bible Study, Fundraiser, Religious Education, Staff Meeting to onboarding seed
❌ **All-Day/Multi-Day Calendar Event Support** - Enhance `calendar_events` to support all-day and multi-day events
❌ **.ics Calendar Feed Enhancements** - Update calendar feed to properly format all-day and multi-day events

---

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

- [x] Administrators can create and configure Event Types through Settings UI (ALREADY EXISTS)
- [x] Each Event Type can have custom fields of 18+ types (ALREADY EXISTS)
- [x] Custom field labels are user-definable (ALREADY EXISTS)
- [x] Fields can be marked as required or optional per Event Type (ALREADY EXISTS)
- [ ] Events can be marked as all-day or timed (with multi-day support) **← NEEDS IMPLEMENTATION**
- [x] Users can create events based on configured Event Types with appropriate custom fields (ALREADY EXISTS)
- [x] Event scripts are user-configurable (ALREADY EXISTS)
- [x] Scripts can be exported in HTML, PDF, Word, and Text formats (ALREADY EXISTS)
- [ ] Users can save events as templates **← NEEDS IMPLEMENTATION**
- [ ] Users can create new events from existing templates **← NEEDS IMPLEMENTATION**
- [ ] Pre-configured Event Types (Bible Study, Fundraiser, Religious Education, Staff) are added during onboarding **← NEEDS IMPLEMENTATION**
- [ ] Calendar feed (.ics) correctly represents timed, all-day, and multi-day events **← NEEDS IMPLEMENTATION**

## Scope

### In Scope (MVP) - REVISED BASED ON EXISTING IMPLEMENTATION

**Event Type Configuration (Admin)** ✅ ALREADY COMPLETE
- Create/edit/delete Event Types through Settings UI at `/settings/events`
- Define custom fields for each Event Type with 18+ field types
- User-defined label (single language)
- Required vs optional flag
- Field ordering via drag-and-drop

**Event Creation & Management (Staff)** ✅ MOSTLY COMPLETE, NEEDS ALL-DAY/MULTI-DAY ENHANCEMENT
- Create master events based on Event Types via dynamic forms
- Fill in custom fields defined for that Event Type
- ❌ Mark events as timed or all-day **← NEEDS IMPLEMENTATION**
- ❌ Support multi-day events (end_datetime) **← NEEDS IMPLEMENTATION**
- Optional connections to Locations, Groups, and People via picker fields (ALREADY EXISTS)
- Date/time required via calendar_event field type (ALREADY EXISTS)

**Script Generation** ✅ ALREADY COMPLETE
- User-configurable script templates per Event Type
- Arrange which fields appear in script via sections
- Control field ordering and layout via section order
- Export to HTML, PDF, Word, and Text formats via renderer system
- Mustache-like placeholders (`{{Field Name}}`) with gendered text support

**Template System** ❌ NEEDS FULL IMPLEMENTATION
- ❌ Save any master event as a template **← NEW FEATURE**
- ❌ View list of available templates when creating events **← NEW FEATURE**
- ❌ "Create from Template" action that pre-fills form with template data **← NEW FEATURE**
- Templates save ALL inputs that the Event Type exposes (field_values JSONB)
- Templates viewable by all staff (parish-wide, RLS policies)

**Calendar Integration** ❌ NEEDS ENHANCEMENT
- ❌ All-day events displayed with "All Day" badge **← NEEDS IMPLEMENTATION**
- ❌ Multi-day events show date range **← NEEDS IMPLEMENTATION**
- ❌ .ics calendar feed properly formats timed, all-day, and multi-day events **← NEEDS IMPLEMENTATION**

**Pre-Seeded General Event Types** ❌ NEEDS IMPLEMENTATION
- ❌ Bible Study event type with default fields
- ❌ Fundraiser event type with default fields
- ❌ Religious Education event type with default fields
- ❌ Staff Meeting event type with default fields

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

**STATUS: ✅ ALREADY IMPLEMENTED**

This flow already exists at `/settings/events`:
1. Admin navigates to Settings → Event Types
2. Admin clicks "Create New Event Type"
3. Admin enters Event Type details (name, description, icon, slug, system_type)
4. Admin adds custom fields via input field definition form
5. Admin creates scripts with sections (text blocks with placeholders)
6. Admin saves Event Type
7. Event Type is now available when creating master events

**Reference:** `src/app/(main)/settings/events/` directory contains all UI for this flow.

### Primary Flow: Create Event from Event Type (Staff)

**STATUS: ✅ MOSTLY COMPLETE, NEEDS ALL-DAY/MULTI-DAY SUPPORT**

This flow already exists at `/events/[event_type_id]/create`:
1. Staff member navigates to Events → Select Event Type
2. Staff selects Event Type (e.g., "Wedding", "Bible Study")
3. Form displays custom fields defined for that Event Type dynamically
4. Staff fills in required and optional fields (person pickers, text inputs, calendar events, etc.)
5. ❌ **MISSING:** Staff needs ability to mark calendar events as "all-day" and set end_datetime for multi-day
6. Staff saves master event
7. Master event appears in list view at `/events/[event_type_id]`
8. Staff can view and export scripts at `/events/[event_type_id]/[id]/scripts/[script_id]`

**Reference:** `src/app/(main)/events/[event_type_id]/master-event-form.tsx` - Dynamic form generation.

### Primary Flow: Create Event from Template (Staff)

**STATUS: ❌ NEEDS FULL IMPLEMENTATION**

This is a NEW feature that needs to be built:
1. Staff member navigates to Events → Create New Event
2. Staff clicks "Create from Template" button (new button needed)
3. System shows list of available templates filtered by Event Type
4. Staff selects a template (e.g., "Weekly Bible Study - Tuesday Evening")
5. Form pre-fills with template data:
   - Event Type
   - All custom field values from template (`field_values` JSONB)
   - Presider/homilist IDs
   - Calendar event times and locations
6. Staff modifies date to new occurrence date
7. Staff adjusts any other fields as needed
8. Staff saves master event
9. New master event is created with all template data plus modifications

### Alternative Flow: Save Event as Template

**STATUS: ❌ NEEDS FULL IMPLEMENTATION**

This is a NEW feature that needs to be built:
1. Staff member creates and saves a master event (or edits existing)
2. Staff views master event at `/events/[event_type_id]/[id]`
3. Staff clicks "Save as Template" button (new button needed in ModuleViewPanel actions)
4. Dialog appears: "Enter template name"
5. Staff enters descriptive name (e.g., "Weekly Bible Study - Tuesday Evening")
6. System saves template with all current master event data:
   - `event_type_id`
   - `field_values` JSONB (all custom field data)
   - `presider_id`, `homilist_id`
   - Calendar event structure (but NOT specific datetimes - those are set when creating from template)
7. Template is now available for "Create from Template" flow
8. Toast notification confirms: "Template saved successfully"

### Alternative Flow: All-Day Event

**STATUS: ❌ NEEDS IMPLEMENTATION**

This feature does NOT currently exist and needs to be added:
1. Staff creates new master event
2. When filling in calendar_event field (e.g., "Wedding Ceremony"):
3. ❌ **MISSING:** Staff checks "All-day event" checkbox
4. ❌ **MISSING:** Time input fields hide, only date picker shows
5. ❌ **MISSING:** If multi-day: Staff enters end date
6. Staff completes other fields and saves
7. ❌ **MISSING:** Calendar view displays with "All Day" badge
8. ❌ **MISSING:** .ics feed uses date-only format (`VALUE=DATE`)

### Alternative Flow: Generate and Export Script

**STATUS: ✅ ALREADY IMPLEMENTED**

This flow already exists:
1. Staff views a master event detail page at `/events/[event_type_id]/[id]`
2. Staff clicks "View Scripts" or navigates to script directly
3. Script view at `/events/[event_type_id]/[id]/scripts/[script_id]` renders with placeholder resolution
4. Staff clicks export button (PDF, Word, Text) - these buttons already exist
5. System generates and downloads file via renderer system
6. Coordinator can print and use at event

**Reference:** `src/app/(main)/events/[event_type_id]/[id]/scripts/[script_id]/` directory.

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Database Schema

#### EXISTING TABLES (No Changes Needed)

**event_types** ✅ ALREADY EXISTS
```
Location: supabase/migrations/20251031000002_create_event_types_table.sql
Columns:
  - id (UUID, PK)
  - parish_id (UUID, FK to parishes)
  - name (TEXT)
  - description (TEXT, nullable)
  - icon (TEXT) - Lucide icon name
  - slug (TEXT, nullable)
  - system_type (TEXT) - 'mass' | 'special-liturgy' | 'sacrament' | 'event'
  - order (INTEGER)
  - role_definitions (JSONB)
  - deleted_at (TIMESTAMPTZ, nullable)
  - created_at, updated_at
```

**input_field_definitions** ✅ ALREADY EXISTS
```
Location: supabase/migrations/20251210000004_create_input_field_definitions_table.sql
Columns:
  - id (UUID, PK)
  - event_type_id (UUID, FK to event_types)
  - name (TEXT) - User-defined field label
  - type (TEXT) - Field type enum (18 types)
  - required (BOOLEAN)
  - list_id (UUID, FK to custom_lists, nullable)
  - event_type_filter_id (UUID, FK to event_types, nullable)
  - is_key_person (BOOLEAN) - For person type only
  - is_primary (BOOLEAN) - For calendar_event type only
  - order (INTEGER)
  - filter_tags (TEXT[])
  - deleted_at, created_at, updated_at

Field Types:
  'person', 'group', 'location', 'event_link', 'list_item', 'document',
  'content', 'petition', 'calendar_event', 'text', 'rich_text', 'date',
  'time', 'datetime', 'number', 'yes_no', 'mass-intention', 'spacer'
```

**master_events** ✅ ALREADY EXISTS
```
Location: supabase/migrations/20251210000007_create_master_events_table.sql
Columns:
  - id (UUID, PK)
  - parish_id (UUID, FK to parishes)
  - event_type_id (UUID, FK to event_types)
  - field_values (JSONB) - Stores all custom field data as key-value pairs
  - presider_id (UUID, FK to people, nullable)
  - homilist_id (UUID, FK to people, nullable)
  - status (TEXT) - 'PLANNING' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  - created_at, updated_at, deleted_at

GIN Index: idx_master_events_field_values_gin for JSONB queries
```

**calendar_events** ✅ ALREADY EXISTS (NEEDS ENHANCEMENT)
```
Location: supabase/migrations/20251210000008_create_calendar_events_table.sql
Columns:
  - id (UUID, PK)
  - parish_id (UUID, FK to parishes)
  - master_event_id (UUID, FK to master_events)
  - input_field_definition_id (UUID, FK to input_field_definitions)
  - start_datetime (TIMESTAMPTZ) - Required
  - end_datetime (TIMESTAMPTZ, nullable) - **ALREADY SUPPORTS MULTI-DAY**
  - location_id (UUID, FK to locations, nullable)
  - is_primary (BOOLEAN)
  - is_cancelled (BOOLEAN)
  - created_at, deleted_at

❌ MISSING: is_all_day (BOOLEAN) - Need to add this column
```

**scripts** ✅ ALREADY EXISTS
```
Location: supabase/migrations/20251210000005_create_scripts_table.sql
Columns:
  - id (UUID, PK)
  - event_type_id (UUID, FK to event_types)
  - name (TEXT)
  - description (TEXT, nullable)
  - order (INTEGER)
  - deleted_at, created_at, updated_at
```

**sections** ✅ ALREADY EXISTS
```
Location: supabase/migrations/20251210000006_create_sections_table.sql
Columns:
  - id (UUID, PK)
  - script_id (UUID, FK to scripts)
  - name (TEXT)
  - section_type (TEXT) - 'text' | 'petition'
  - content (TEXT) - Markdown with mustache placeholders
  - page_break_after (BOOLEAN)
  - order (INTEGER)
  - deleted_at, created_at, updated_at
```

**custom_lists** and **custom_list_items** ✅ ALREADY EXIST
```
Location: Multiple migrations
Used for dropdown field options (e.g., "Wedding Songs")
```

#### NEW TABLES NEEDED

**master_event_templates** ❌ NEW TABLE REQUIRED

```sql
-- Migration: Create master_event_templates table
-- Purpose: Save master event configurations for reuse
-- Related: master_events, event_types

CREATE TABLE master_event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE master_event_templates ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON master_event_templates TO anon;
GRANT ALL ON master_event_templates TO authenticated;
GRANT ALL ON master_event_templates TO service_role;

-- Indexes
CREATE INDEX idx_master_event_templates_parish_id ON master_event_templates(parish_id);
CREATE INDEX idx_master_event_templates_event_type_id ON master_event_templates(event_type_id);
CREATE INDEX idx_master_event_templates_created_by ON master_event_templates(created_by);
CREATE INDEX idx_master_event_templates_template_data_gin ON master_event_templates USING GIN (template_data);

-- RLS Policies
-- Parish members can read templates for their parish
CREATE POLICY master_event_templates_select_policy ON master_event_templates
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Admin, Staff, and Ministry-Leader roles can create templates
CREATE POLICY master_event_templates_insert_policy ON master_event_templates
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can update templates
CREATE POLICY master_event_templates_update_policy ON master_event_templates
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can delete templates
CREATE POLICY master_event_templates_delete_policy ON master_event_templates
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER master_event_templates_updated_at
  BEFORE UPDATE ON master_event_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE master_event_templates IS 'Templates for master events that can be reused when creating new events of the same type';
COMMENT ON COLUMN master_event_templates.template_data IS 'JSONB storing field_values, presider_id, homilist_id, and calendar event structure (excluding specific datetimes)';
COMMENT ON COLUMN master_event_templates.created_by IS 'User who created this template (nullable for system templates)';
```

**template_data JSONB Structure:**
```typescript
{
  field_values: {
    [fieldName: string]: any  // All custom field values from the event
  },
  presider_id: string | null,
  homilist_id: string | null,
  calendar_events: {
    [fieldName: string]: {
      // Note: start_datetime and end_datetime are NOT stored
      // Those are filled in when creating from template
      location_id: string | null,
      is_all_day: boolean,
      // For all-day events, store duration in days instead of specific dates
      duration_days: number | null  // For multi-day all-day events
    }
  }
}
```

#### MIGRATIONS NEEDED

**Migration 1: Add is_all_day to calendar_events**

```sql
-- Migration: Add is_all_day column to calendar_events table
-- Purpose: Support all-day events that don't have specific times

ALTER TABLE calendar_events
ADD COLUMN is_all_day BOOLEAN NOT NULL DEFAULT false;

-- Add constraint: if is_all_day is true, start_datetime should be at midnight
-- (This is a soft constraint - we'll handle it in application logic)

-- Add index for all-day event queries
CREATE INDEX idx_calendar_events_is_all_day ON calendar_events(is_all_day) WHERE deleted_at IS NULL;

-- Comment
COMMENT ON COLUMN calendar_events.is_all_day IS 'True if this is an all-day event (no specific time, only date)';
```

**Migration 2: Create master_event_templates table**

See "NEW TABLES NEEDED" section above for complete SQL.

### Server Actions

#### EXISTING SERVER ACTIONS (No Changes Needed)

**event-types.ts** ✅ ALREADY EXISTS
```typescript
Location: src/lib/actions/event-types.ts
Functions:
  - getEventTypes(filters?) - List event types
  - getActiveEventTypes() - Get non-deleted event types
  - getEventType(id) - Get single event type
  - getEventTypeWithRelations(id) - Get with input_field_definitions and scripts
  - createEventType(data) - Create new event type
  - updateEventType(id, data) - Update event type
  - deleteEventType(id) - Soft delete event type
  - reorderEventTypes(updates) - Update order field
```

**input-field-definitions.ts** ✅ ALREADY EXISTS
```typescript
Location: src/lib/actions/input-field-definitions.ts
Functions:
  - getInputFieldDefinitions(eventTypeId) - List fields for event type
  - createInputFieldDefinition(data) - Create new field
  - updateInputFieldDefinition(id, data) - Update field
  - deleteInputFieldDefinition(id) - Soft delete field
  - reorderInputFieldDefinitions(eventTypeId, updates) - Update order
```

**master-events.ts** ✅ ALREADY EXISTS (NEEDS ENHANCEMENT)
```typescript
Location: src/lib/actions/master-events.ts
Functions:
  - getAllMasterEvents(filters?) - List all master events
  - getMasterEventsByType(eventTypeId, filters?) - List by event type
  - getMasterEvent(id) - Get single master event (basic)
  - getMasterEventWithRelations(id) - Get with resolved fields, calendar events
  - createEvent(eventTypeId, data) - Create new master event
  - updateEvent(id, data) - Update master event
  - deleteEvent(id) - Soft delete master event

❌ NEEDS ENHANCEMENT: createEvent and updateEvent need to handle is_all_day for calendar events
```

#### NEW SERVER ACTIONS NEEDED

**master-event-templates.ts** ❌ NEW FILE REQUIRED

```typescript
// Location: src/lib/actions/master-event-templates.ts
// Purpose: CRUD operations for master event templates

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type { MasterEventTemplate, MasterEventTemplateWithRelations, CreateMasterEventTemplateData, UpdateMasterEventTemplateData } from '@/lib/types'

FUNCTION: getTemplatesByEventType(eventTypeId: string)
  DESCRIPTION: Get all templates for a specific event type
  PARAMETERS:
    - eventTypeId: UUID of the event type
  RETURNS: MasterEventTemplate[]
  PERMISSION: Staff and above
  LOGIC:
    1. Call requireSelectedParish() to get parish_id
    2. Call ensureJWTClaims() for auth
    3. Query master_event_templates table:
       - WHERE event_type_id = eventTypeId
       - AND parish_id = selectedParishId
       - AND deleted_at IS NULL
       - ORDER BY created_at DESC
    4. Return array of templates

FUNCTION: getTemplate(id: string)
  DESCRIPTION: Get single template by ID
  PARAMETERS:
    - id: UUID of the template
  RETURNS: MasterEventTemplate | null
  PERMISSION: Staff and above
  LOGIC:
    1. Call requireSelectedParish() to get parish_id
    2. Call ensureJWTClaims() for auth
    3. Query master_event_templates table:
       - WHERE id = id
       - AND parish_id = selectedParishId
       - AND deleted_at IS NULL
    4. Return template or null

FUNCTION: createTemplateFromEvent(masterEventId: string, templateName: string)
  DESCRIPTION: Save a master event as a template
  PARAMETERS:
    - masterEventId: UUID of the master event to save as template
    - templateName: User-provided name for the template
  RETURNS: { success: boolean, template?: MasterEventTemplate, error?: string }
  PERMISSION: Staff and above
  LOGIC:
    1. Call requireSelectedParish() to get parish_id
    2. Call ensureJWTClaims() for auth and get user_id
    3. Fetch master event with relations (getMasterEventWithRelations)
    4. IF event not found THEN return error
    5. Build template_data JSONB:
       - Copy field_values from master event
       - Copy presider_id, homilist_id
       - For calendar_events:
         - Store location_id, is_all_day
         - IF is_all_day AND has end_datetime THEN
           - Calculate duration_days (difference between start and end)
         - DO NOT store start_datetime or end_datetime (those are filled when creating from template)
    6. Insert into master_event_templates:
       - parish_id = selectedParishId
       - event_type_id = event.event_type_id
       - name = templateName
       - template_data = built JSONB
       - created_by = user_id
    7. Revalidate path: `/events/${event.event_type_id}`
    8. Return success with template

FUNCTION: updateTemplate(id: string, data: UpdateMasterEventTemplateData)
  DESCRIPTION: Update template name or description (NOT template_data)
  PARAMETERS:
    - id: UUID of the template
    - data: { name?, description? }
  RETURNS: { success: boolean, error?: string }
  PERMISSION: Staff and above
  LOGIC:
    1. Call requireSelectedParish() to get parish_id
    2. Call ensureJWTClaims() for auth
    3. Update master_event_templates:
       - WHERE id = id AND parish_id = selectedParishId
       - SET name, description (only if provided in data)
    4. Revalidate path
    5. Return success

FUNCTION: deleteTemplate(id: string)
  DESCRIPTION: Soft delete a template
  PARAMETERS:
    - id: UUID of the template
  RETURNS: { success: boolean, error?: string }
  PERMISSION: Staff and above
  LOGIC:
    1. Call requireSelectedParish() to get parish_id
    2. Call ensureJWTClaims() for auth
    3. Update master_event_templates:
       - WHERE id = id AND parish_id = selectedParishId
       - SET deleted_at = now()
    4. Revalidate path
    5. Return success
```

**Enhancements to master-events.ts** ❌ MODIFICATION REQUIRED

```typescript
// Location: src/lib/actions/master-events.ts
// Modify existing functions to support is_all_day for calendar events

ENHANCEMENT: createEvent(eventTypeId: string, data: CreateMasterEventData)
  CHANGE: When creating calendar_events from data.calendar_events array:
    1. IF calendar event has is_all_day = true THEN
       - Store start_datetime as date at midnight in parish timezone
       - IF end_datetime provided THEN store as date at midnight
       - ELSE end_datetime = NULL (single-day all-day event)
    2. ELSE (timed event):
       - Store start_datetime and end_datetime as provided (TIMESTAMPTZ)
    3. Store is_all_day flag in calendar_events table

ENHANCEMENT: updateEvent(id: string, data: UpdateMasterEventData)
  CHANGE: Same logic as createEvent for calendar_events updates
    - When updating existing calendar events, handle is_all_day flag
    - Convert dates to midnight timestamps if is_all_day = true
```

### Type Interfaces

**NEW TYPES NEEDED** ❌ ADD TO src/lib/types.ts

```typescript
// Master Event Template Types

export interface MasterEventTemplate {
  id: string
  parish_id: string
  event_type_id: string
  name: string
  description: string | null
  template_data: TemplateData
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TemplateData {
  field_values: Record<string, any>
  presider_id: string | null
  homilist_id: string | null
  calendar_events: Record<string, CalendarEventTemplateData>
}

export interface CalendarEventTemplateData {
  location_id: string | null
  is_all_day: boolean
  duration_days: number | null  // For multi-day all-day events
}

export interface MasterEventTemplateWithRelations extends MasterEventTemplate {
  event_type: EventType
}

export interface CreateMasterEventTemplateData {
  event_type_id: string
  name: string
  description?: string | null
  template_data: TemplateData
}

export interface UpdateMasterEventTemplateData {
  name?: string
  description?: string | null
}

// Enhancement to CalendarEvent interface
export interface CalendarEvent {
  // ... existing fields ...
  is_all_day: boolean  // ❌ ADD THIS FIELD
}

// Enhancement to CreateCalendarEventData
export interface CreateCalendarEventData {
  // ... existing fields ...
  is_all_day?: boolean  // ❌ ADD THIS FIELD
}

// Enhancement to UpdateCalendarEventData
export interface UpdateCalendarEventData {
  // ... existing fields ...
  is_all_day?: boolean  // ❌ ADD THIS FIELD
}
```

### UI Component Specifications

#### EXISTING COMPONENTS (No Changes Needed)

**Event Type Configuration UI** ✅ ALREADY EXISTS
```
Location: src/app/(main)/settings/events/
Files:
  - page.tsx - Server page for event types list
  - events-list-client.tsx - Client component with DataTable
  - create/page.tsx - Create event type page
  - create/event-create-client.tsx - Create form
  - [id]/page.tsx - View event type page (if exists)
  - [id]/edit/page.tsx - Edit event type page (if exists)

Purpose: Admin UI for creating/editing event types, input field definitions, scripts, sections
Status: ALREADY COMPLETE - no work needed
```

**Dynamic Master Event Form** ✅ ALREADY EXISTS
```
Location: src/app/(main)/events/[event_type_id]/master-event-form.tsx
Purpose: Dynamically generates form fields based on input_field_definitions
Features:
  - Person picker fields (PersonPickerField)
  - Location picker fields (LocationPickerField)
  - Group picker fields (GroupPickerField)
  - Calendar event fields (CalendarEventFieldView)
  - Text/rich text fields (FormInput, RichTextEditor)
  - Date/time fields (DatePickerField, TimePickerField)
  - List item fields (ListItemPickerField)
  - Document upload fields (DocumentPickerField)
  - Content picker fields (ContentPickerField)
  - Petition picker fields (PetitionPickerField)
Status: ALREADY COMPLETE
```

**Script Viewing & Export** ✅ ALREADY EXISTS
```
Location: src/app/(main)/events/[event_type_id]/[id]/scripts/[script_id]/
Purpose: View rendered scripts with mustache placeholders resolved
Features:
  - HTML rendering via html-renderer.tsx
  - PDF export via pdf-renderer.ts
  - Word export via word-renderer.ts
  - Text export
Status: ALREADY COMPLETE
```

#### NEW COMPONENTS NEEDED

**CalendarEventFieldView Enhancement** ❌ MODIFICATION REQUIRED
```typescript
// Location: src/components/calendar-event-field-view.tsx
// Purpose: Add all-day event checkbox and multi-day support

COMPONENT: CalendarEventFieldView
  CURRENT STATE: Displays date, time, location pickers
  ENHANCEMENT NEEDED:
    1. Add "All-day event" checkbox (Switch component)
    2. IF is_all_day = true THEN
       - Hide time pickers
       - Show only date picker for start_datetime
       - Show optional "End Date" picker for multi-day all-day events
    3. ELSE (timed event):
       - Show date + time pickers (current behavior)
       - Show optional end_datetime picker (already exists)
    4. Store is_all_day flag in CalendarEventFieldData interface

INTERFACE CHANGE:
  export interface CalendarEventFieldData {
    date: string
    time: string
    location_id: string | null
    location: Location | null
    is_all_day: boolean  // ❌ ADD THIS FIELD
    end_date?: string  // ❌ ADD THIS FIELD (for multi-day all-day events)
  }
```

**Template Picker Dialog** ❌ NEW COMPONENT REQUIRED
```typescript
// Location: src/components/template-picker-dialog.tsx
// Purpose: Show list of available templates when creating master event

COMPONENT: TemplatePickerDialog
  PROPS:
    - eventTypeId: string
    - open: boolean
    - onOpenChange: (open: boolean) => void
    - onSelectTemplate: (template: MasterEventTemplate) => void

  BEHAVIOR:
    1. Fetch templates via getTemplatesByEventType(eventTypeId) server action
    2. Display templates in a scrollable dialog
    3. Each template shows:
       - Template name
       - Description (if exists)
       - Created date
       - Created by (user name if available)
    4. Empty state if no templates exist: "No templates available for this event type"
    5. On template click: call onSelectTemplate and close dialog

  UI STRUCTURE:
    - Dialog with "Select Template" title
    - Search bar to filter templates by name
    - Grid/list of template cards
    - Cancel button

  SIMILAR TO: PersonPicker pattern (src/components/person-picker.tsx)
```

**"Save as Template" Button** ❌ NEW COMPONENT REQUIRED
```typescript
// Location: Add to src/app/(main)/events/[event_type_id]/[id]/master-event-view-client.tsx
// Purpose: Add "Save as Template" action to master event view page

ADDITION TO: ModuleViewPanel actions prop
  ACTION: {
    label: "Save as Template",
    icon: <Bookmark />,
    onClick: handleSaveAsTemplate
  }

FUNCTION: handleSaveAsTemplate
  LOGIC:
    1. Show dialog with input for template name
    2. Default name: "{Event Type Name} - {Current Date}"
    3. On submit:
       - Call createTemplateFromEvent(masterEventId, templateName) server action
       - Show toast: "Template saved successfully"
       - Optionally redirect to templates list or stay on page
    4. On cancel: close dialog
```

**"Create from Template" Button** ❌ NEW COMPONENT REQUIRED
```typescript
// Location: Add to src/app/(main)/events/[event_type_id]/create/page.tsx
// Purpose: Add "Create from Template" button to create page

ADDITION TO: Page header (near "Create New Event" title)
  BUTTON: {
    label: "Create from Template",
    variant: "outline",
    icon: <BookmarkPlus />,
    onClick: () => setTemplatePickerOpen(true)
  }

LOGIC:
  1. On click: Open TemplatePickerDialog
  2. On template selection:
     - Pre-fill master-event-form with template data:
       - field_values → populate all input fields
       - presider_id, homilist_id → populate picker fields
       - calendar_events → populate calendar event fields (but NOT datetimes)
     - User can modify any fields before saving
  3. On save: Create new master event (NOT update the template)
```

### API Routes for Exports

**STATUS: ✅ ALREADY IMPLEMENTED**

All export functionality already exists via the renderer system:

```
HTML Export: Direct rendering in browser via src/lib/renderers/html-renderer.tsx
PDF Export: API route at src/app/api/render-liturgy-script-pdf/route.ts
Word Export: API route at src/app/api/render-liturgy-script-docx/route.ts
Text Export: Client-side download via text extraction

Reference Documentation:
  - docs/RENDERER.md - Complete renderer system documentation
  - docs/LITURGICAL_SCRIPT_SYSTEM.md - Script generation overview
  - docs/CONTENT_BUILDER_SECTIONS.md - Section types and builders
```

**NO NEW API ROUTES NEEDED** - The existing renderer system already supports all export formats for master event scripts.

### Onboarding Seed Data

**ENHANCEMENT TO: src/lib/onboarding-seeding/event-types-seed.ts**

```typescript
// Add 4 new general parish event types to seedEventTypesForParish()

AFTER EXISTING SEEDED TYPES (Wedding, Funeral, Baptism, Quinceañera, Presentation):

// =====================================================
// 6. Create Bible Study Event Type
// =====================================================
const { data: bibleStudyType, error: bibleStudyTypeError } = await supabase
  .from('event_types')
  .insert({
    parish_id: parishId,
    name: 'Bible Study',
    description: 'Regular Bible study and scripture reflection gatherings.',
    icon: 'Book',
    slug: 'bible-studies',
    system_type: 'event',
    order: 6
  })
  .select()
  .single()

IF error THEN throw

// Create input field definitions for Bible Study
const bibleStudyFields = [
  { name: 'Session', type: 'calendar_event', required: true, is_primary: true, order: 0 },
  { name: 'Discussion Leader', type: 'person', required: false, is_key_person: true, order: 1 },
  { name: 'Topic', type: 'text', required: false, order: 2 },
  { name: 'Scripture Passage', type: 'text', required: false, order: 3 },
  { name: 'Discussion Questions', type: 'rich_text', required: false, order: 4 },
  { name: 'Resources', type: 'document', required: false, order: 5 },
  { name: 'Expected Attendance', type: 'number', required: false, order: 6 },
  { name: 'Notes', type: 'rich_text', required: false, order: 7 }
]

INSERT bibleStudyFields into input_field_definitions with event_type_id = bibleStudyType.id

// Create default script for Bible Study
CREATE script named "Bible Study Session Plan" with sections:
  - Section 1: "Session Information" (text type)
    - Content: "{{parish.name}} - Bible Study\nDate: {{Session}}\nLeader: {{Discussion Leader}}\n"
  - Section 2: "Topic and Scripture" (text type)
    - Content: "Topic: {{Topic}}\nScripture: {{Scripture Passage}}\n"
  - Section 3: "Discussion Questions" (text type)
    - Content: "{{Discussion Questions}}"

// =====================================================
// 7. Create Fundraiser Event Type
// =====================================================
const { data: fundraiserType, error: fundraiserTypeError } = await supabase
  .from('event_types')
  .insert({
    parish_id: parishId,
    name: 'Fundraiser',
    description: 'Parish fundraising events and activities.',
    icon: 'DollarSign',
    slug: 'fundraisers',
    system_type: 'event',
    order: 7
  })
  .select()
  .single()

IF error THEN throw

// Create input field definitions for Fundraiser
const fundraiserFields = [
  { name: 'Event Date', type: 'calendar_event', required: true, is_primary: true, order: 0 },
  { name: 'Event Coordinator', type: 'person', required: false, is_key_person: true, order: 1 },
  { name: 'Fundraising Goal', type: 'number', required: false, order: 2 },
  { name: 'Event Description', type: 'rich_text', required: false, order: 3 },
  { name: 'Volunteer Needs', type: 'rich_text', required: false, order: 4 },
  { name: 'Setup Notes', type: 'rich_text', required: false, order: 5 },
  { name: 'Cleanup Notes', type: 'rich_text', required: false, order: 6 }
]

INSERT fundraiserFields into input_field_definitions with event_type_id = fundraiserType.id

// Create default script (similar pattern to Bible Study)

// =====================================================
// 8. Create Religious Education Event Type
// =====================================================
const { data: religiousEdType, error: religiousEdTypeError } = await supabase
  .from('event_types')
  .insert({
    parish_id: parishId,
    name: 'Religious Education',
    description: 'Faith formation classes and catechesis programs.',
    icon: 'GraduationCap',
    slug: 'religious-education',
    system_type: 'event',
    order: 8
  })
  .select()
  .single()

IF error THEN throw

// Create input field definitions for Religious Education
const religiousEdFields = [
  { name: 'Class Session', type: 'calendar_event', required: true, is_primary: true, order: 0 },
  { name: 'Catechist', type: 'person', required: false, is_key_person: true, order: 1 },
  { name: 'Grade Level', type: 'text', required: false, order: 2 },
  { name: 'Lesson Topic', type: 'text', required: false, order: 3 },
  { name: 'Lesson Plan', type: 'rich_text', required: false, order: 4 },
  { name: 'Materials Needed', type: 'rich_text', required: false, order: 5 },
  { name: 'Homework Assignment', type: 'rich_text', required: false, order: 6 }
]

INSERT religiousEdFields into input_field_definitions with event_type_id = religiousEdType.id

// Create default script (similar pattern)

// =====================================================
// 9. Create Staff Meeting Event Type
// =====================================================
const { data: staffMeetingType, error: staffMeetingTypeError } = await supabase
  .from('event_types')
  .insert({
    parish_id: parishId,
    name: 'Staff Meeting',
    description: 'Parish staff meetings and administrative gatherings.',
    icon: 'Users',
    slug: 'staff-meetings',
    system_type: 'event',
    order: 9
  })
  .select()
  .single()

IF error THEN throw

// Create input field definitions for Staff Meeting
const staffMeetingFields = [
  { name: 'Meeting Date', type: 'calendar_event', required: true, is_primary: true, order: 0 },
  { name: 'Meeting Leader', type: 'person', required: false, is_key_person: true, order: 1 },
  { name: 'Agenda', type: 'rich_text', required: false, order: 2 },
  { name: 'Meeting Minutes', type: 'rich_text', required: false, order: 3 },
  { name: 'Action Items', type: 'rich_text', required: false, order: 4 },
  { name: 'Attachments', type: 'document', required: false, order: 5 }
]

INSERT staffMeetingFields into input_field_definitions with event_type_id = staffMeetingType.id

// Create default script (similar pattern)
```

### Implementation Phases and Order

Based on existing implementation, here's the logical phased approach:

**Phase 1: Database Foundation** (Priority: HIGH)
1. Create migration for `master_event_templates` table
2. Create migration to add `is_all_day` column to `calendar_events` table
3. Run migrations: `npm run db:fresh -- -y` (during development)

**Phase 2: Type System** (Priority: HIGH)
1. Add MasterEventTemplate interfaces to `src/lib/types.ts`
2. Add is_all_day field to CalendarEvent interfaces
3. Add TemplateData and CalendarEventTemplateData interfaces

**Phase 3: Server Actions** (Priority: HIGH)
1. Create `src/lib/actions/master-event-templates.ts` with CRUD operations
2. Enhance `src/lib/actions/master-events.ts` createEvent and updateEvent to handle is_all_day

**Phase 4: UI Components - All-Day Events** (Priority: MEDIUM)
1. Modify `src/components/calendar-event-field-view.tsx` to add:
   - "All-day event" checkbox (Switch component)
   - Conditional rendering: hide time pickers when all-day
   - Add optional end_date picker for multi-day all-day events
2. Update CalendarEventFieldData interface
3. Test all-day event creation and editing

**Phase 5: UI Components - Template System** (Priority: MEDIUM)
1. Create `src/components/template-picker-dialog.tsx`
2. Add "Save as Template" button to `src/app/(main)/events/[event_type_id]/[id]/master-event-view-client.tsx`
3. Add "Create from Template" button to `src/app/(main)/events/[event_type_id]/create/page.tsx`
4. Wire up template selection to pre-fill master-event-form

**Phase 6: Onboarding Seed Data** (Priority: LOW)
1. Enhance `src/lib/onboarding-seeding/event-types-seed.ts`:
   - Add Bible Study event type with fields and script
   - Add Fundraiser event type with fields and script
   - Add Religious Education event type with fields and script
   - Add Staff Meeting event type with fields and script
2. Test onboarding flow with new event types

**Phase 7: Calendar Feed Enhancements** (Priority: LOW)
1. Update .ics calendar feed generation to:
   - Format all-day events with `VALUE=DATE` (no time component)
   - Format multi-day all-day events with DTSTART and DTEND as dates
   - Format timed events with DTSTART and DTEND as TIMESTAMPTZ (existing behavior)
2. Test .ics feed with all event types

**Phase 8: Testing** (Priority: HIGH)
1. Test template creation from existing master event
2. Test "Create from Template" flow with pre-filled data
3. Test all-day event creation and calendar display
4. Test multi-day all-day event creation
5. Test script generation with template-created events
6. Test .ics calendar feed with all event types

**Phase 9: Documentation** (Priority: MEDIUM)
1. Update `docs/MODULE_REGISTRY.md` with template system documentation
2. Create user documentation for template usage (if user-documentation-writer is invoked)
3. Update CLAUDE.md if new patterns are established

### Integration Points with Existing Modules

**People Module** ✅ ALREADY INTEGRATED
- PersonPickerField component already used in master-event-form
- Person records linked via field_values JSONB (person type fields)
- No changes needed

**Locations Module** ✅ ALREADY INTEGRATED
- LocationPickerField component already used in master-event-form
- Location records linked via:
  - field_values JSONB (location type fields)
  - calendar_events.location_id for event locations
- No changes needed

**Groups Module** ✅ ALREADY INTEGRATED
- GroupPickerField component already used in master-event-form
- Group records linked via field_values JSONB (group type fields)
- No changes needed

**Calendar Module** ❌ NEEDS ENHANCEMENT
- Current integration: calendar_events are displayed on parish calendar
- Enhancement needed:
  - Display all-day events with "All Day" badge
  - Display multi-day events with date range (e.g., "July 15-17")
  - Generate .ics feed with proper formatting for all-day and multi-day events
- Files to modify:
  - Calendar view component (wherever calendar is displayed)
  - .ics feed generator (search for .ics or iCalendar in codebase)

**Settings Module** ✅ ALREADY INTEGRATED
- Event Types configuration at `/settings/events` already complete
- No changes needed for templates (templates are created from events, not in settings)

**Print/Export System** ✅ ALREADY INTEGRATED
- Renderer system (HTML, PDF, Word, Text) already supports master event scripts
- No changes needed

### Documentation Inconsistencies Found

During my investigation, I found the following discrepancies between documentation and implementation:

1. **RESOLVED:** Brainstorming document described "Events Table" but actual implementation uses "master_events" table
   - Terminology: "Events" in user-facing UI, "master_events" in database/code
   - This is correct and consistent with the unified event data model

2. **RESOLVED:** Brainstorming document described "Occasions" but actual implementation uses "calendar_events" table
   - Recent rename (2025-12-16): occasions → calendar_events for clarity
   - This is correct and matches latest implementation

3. **PARTIAL:** Brainstorming document described custom field labels as "NOT bilingual" but system UI should be bilingual
   - User-defined field labels (input_field_definitions.name): NOT bilingual (correct)
   - System labels (Event Type name, descriptions): SHOULD be bilingual
   - Recommendation: When seeding event types, provide bilingual names via standard bilingual pattern

4. **CLARIFICATION NEEDED:** Old events table still exists with different schema
   - Old events table (supabase/migrations/20251031000003_create_events_table.sql) has:
     - is_all_day column
     - related_event_type column
   - New master_events table has different schema
   - calendar_events table does NOT have is_all_day (needs to be added)
   - Recommendation: Deprecate old events table after migration is complete

### Complexity Assessment

**Complexity Rating:** Low-Medium

**Reason:**
- **90% of infrastructure already exists** (event types, dynamic forms, scripts, export)
- **Remaining 10% is straightforward CRUD work:**
  - Add one table (master_event_templates)
  - Add one column (calendar_events.is_all_day)
  - Create CRUD server actions for templates (standard pattern)
  - Add 3 UI components (template picker, buttons)
  - Enhance calendar event field view with checkbox
  - Add 4 event types to onboarding seed

**No complex algorithms, performance concerns, or architectural decisions needed.** All patterns already established and proven.

### Dependencies and Blockers

**No Blockers.** All dependencies already in place:

✅ Database tables: event_types, input_field_definitions, scripts, sections, master_events, calendar_events, custom_lists
✅ Server actions: event-types, input-field-definitions, master-events
✅ UI components: master-event-form, calendar-event-field-view, all picker components
✅ Renderer system: HTML, PDF, Word, Text export
✅ Permission system: RLS policies for Admin, Staff, Ministry-Leader, Parishioner
✅ Onboarding system: parish-seed-data.ts with event types seeding

**Dependencies for Developer:**
1. Understand JSONB storage pattern (field_values in master_events)
2. Understand dynamic form generation pattern (master-event-form.tsx)
3. Understand picker component pattern (person-picker, location-picker, etc.)
4. Understand calendar_event relationship (input_field_definition_id linkage)

**Recommended Reading Before Implementation:**
- `docs/MODULE_COMPONENT_PATTERNS.md` - Module file structure
- `docs/FORMS.md` - Form patterns and validation
- `src/lib/types.ts` (lines 287-877) - Event type system interfaces
- `src/app/(main)/events/[event_type_id]/master-event-form.tsx` - Dynamic form pattern
- `docs/SCRIPT_TEMPLATING.md` - Mustache placeholder system

---

## ANSWERS TO OPEN QUESTIONS

### Technical Architecture Questions

**1. JSONB vs Separate Tables for Custom Fields?**

**ANSWER:** Use JSONB (already implemented correctly in master_events.field_values)

**Rationale:**
- Event types are fully user-defined with unlimited field configurations
- Normalized table approach would require complex schema migrations every time a field is added/removed
- JSONB provides flexibility for dynamic schemas
- PostgreSQL GIN indexing on JSONB provides good query performance
- Current implementation already uses this pattern successfully

**Performance Notes:**
- GIN index already exists: `idx_master_events_field_values_gin`
- Filtering by custom field values: Use `field_values @> '{"field_name": "value"}'::jsonb` syntax
- For common queries, consider adding expression indexes if needed

**2. Event Type Field Configuration Storage?**

**ANSWER:** Current input_field_definitions table is sufficient (already implemented correctly)

**Dropdown Options:** Store in custom_lists and custom_list_items tables (already implemented)
- Field definition has list_id foreign key
- Custom lists are parish-scoped and reusable across event types
- Example: "Wedding Songs" list can be shared by multiple event types

**Field Validation Rules:** Store in input_field_definitions.required column (already implemented)
- For MVP: Only "required" flag is needed
- Future: Could add validation_rules JSONB column for regex, min/max, etc.

**3. Script Template Storage?**

**ANSWER:** Current scripts + sections pattern is correct (already implemented)

**Template Structure:** Scripts contain ordered sections, sections contain markdown content with mustache placeholders
- NOT stored as JSONB template_structure
- Stored as actual script and section records in database
- This allows for proper editing, reordering, and versioning

**Field References:** Sections reference field names (not IDs) in mustache placeholders
- Example: `{{Bride}}`, `{{Wedding Date}}`, `{{Ceremony Location}}`
- Field names match input_field_definitions.name (user-defined labels)
- Resolution happens at render time via resolver system

**Static Text:** Stored in section.content as markdown
- Admins can add sections with static text (no placeholders)
- Example: "Welcome to the ceremony" section

**4. Template Data Cloning?**

**ANSWER:** Templates store field values, NOT resolved entity data. Validation happens at render time.

**Template Storage:**
```jsonb
{
  "field_values": {
    "Discussion Leader": "uuid-of-person",  // Store ID, not full person object
    "Topic": "Genesis Creation Account",     // Store raw value
    "Expected Attendance": 25
  },
  "presider_id": "uuid-of-person",
  "homilist_id": "uuid-of-person",
  "calendar_events": {
    "Session": {
      "location_id": "uuid-of-location",
      "is_all_day": false,
      "duration_days": null
    }
  }
}
```

**Handling Deleted Entities:**
- When creating from template, resolve all IDs to check existence
- IF entity no longer exists (deleted person, deleted location) THEN:
  - Display warning: "Some referenced people/locations from template no longer exist"
  - Allow user to select replacement
  - OR leave field empty if not required
- Do NOT fail template creation - gracefully handle missing references

**Validation:** At render time (not at template creation time)
- Templates can reference entities that might be deleted later
- Scripts that use deleted entity placeholders show blank or "[Not Found]"
- This is acceptable - templates are starting points, not immutable contracts

### UI/UX Questions

**1. Event Type Field Builder UI?**

**ANSWER:** Current implementation at `/settings/events` is correct.

**Interface:** Admin creates input_field_definitions via settings form
- Add field button opens dialog
- Select field type from dropdown
- Enter field label (name)
- Mark as required checkbox
- Drag-and-drop to reorder (if @dnd-kit implemented, otherwise manual order field)

**Preview:** NOT NEEDED for MVP
- Event types are simple enough that admins can visualize the form
- Future enhancement: Could add live preview sidebar

**Field Type Options:**
- Dropdown fields: Select from custom_lists (admin creates lists separately in settings)
- Checkbox fields: Use yes_no type (stores boolean in field_values)

**2. Script Template Builder UI?**

**ANSWER:** Current sections-based approach is correct (already implemented).

**Interface:** Admin manages scripts and sections in settings
- Create script (e.g., "English Program", "Spanish Program")
- Add sections to script
- Each section has:
  - Name (e.g., "Opening Prayer", "Ceremony Details")
  - Content (markdown with mustache placeholders)
  - Page break after toggle

**Layout Control:** Via section ordering
- Sections render in order
- Page breaks control pagination in PDF/Word export

**NOT a WYSIWYG editor:** Simple form for adding sections
- Text area for markdown content
- Placeholder helper showing available field names
- Preview button to see rendered output

**3. Template Selection UI?**

**ANSWER:** Dialog with searchable list (similar to PersonPicker pattern).

**Display Format:** Dialog with filterable list
- Template cards showing:
  - Template name (bold)
  - Description (if exists)
  - Created date
  - Created by (user name)
- Search bar at top to filter by name
- Empty state: "No templates available for this event type. Create a master event and save it as a template."

**NOT Grid of Cards:** Too much visual clutter
**NOT Dropdown:** Not enough information visible

**Preview:** NOT NEEDED for MVP
- Template names should be descriptive enough
- Future enhancement: Could show field values in expandable section

**4. Multi-Day Event UI?**

**ANSWER:** Simple approach - end date field appears when all-day is checked.

**UI Flow:**
1. Calendar event field has "All-day event" checkbox (Switch component)
2. IF is_all_day = true THEN:
   - Hide time pickers
   - Show "Start Date" picker
   - Show optional "End Date" picker (for multi-day)
   - Label: "Leave end date empty for single-day event"
3. ELSE (timed event):
   - Show "Start Date & Time" pickers
   - Show optional "End Date & Time" pickers (already exists)

**NO separate "multi-day" checkbox:** Not needed
- Multi-day is implicit: has end_date OR end_datetime

**Calendar Display:**
- Single-day all-day: "Event Name" with "All Day" badge
- Multi-day all-day: "Event Name (July 15-17)" with "All Day" badge
- Timed event: "Event Name" with time shown

### Data Migration Questions

**1. Existing Events?**

**ANSWER:** Database will be reset - no migration needed (confirmed).

**For Future Reference:**
- Old events table has different schema (is_all_day, related_event_type)
- Would map to master_events via event_type_id lookup
- Default "General Event" type would be needed if old events exist
- But since database resets during development, this is moot

**2. Pre-configured Event Types?**

**ANSWER:** Seed during onboarding (already implemented for sacraments, needs extension for general events).

**Sacraments (Already Seeded):**
- Wedding - Complete with fields, custom lists, scripts
- Funeral - Complete with fields, custom lists, scripts
- Baptism - Complete with fields, scripts
- Quinceañera - Complete with fields, scripts
- Presentation - Complete with fields, scripts

**General Events (Needs Implementation):**
- Bible Study - Fields: Session (calendar_event), Discussion Leader (person), Topic (text), Scripture Passage (text), Discussion Questions (rich_text), Resources (document), Expected Attendance (number), Notes (rich_text)
- Fundraiser - Fields: Event Date (calendar_event), Event Coordinator (person), Fundraising Goal (number), Event Description (rich_text), Volunteer Needs (rich_text), Setup Notes (rich_text), Cleanup Notes (rich_text)
- Religious Education - Fields: Class Session (calendar_event), Catechist (person), Grade Level (text), Lesson Topic (text), Lesson Plan (rich_text), Materials Needed (rich_text), Homework Assignment (rich_text)
- Staff Meeting - Fields: Meeting Date (calendar_event), Meeting Leader (person), Agenda (rich_text), Meeting Minutes (rich_text), Action Items (rich_text), Attachments (document)

**Location:** `src/lib/onboarding-seeding/event-types-seed.ts` (enhance existing function)

### Implementation Order Questions

**1. Phasing Strategy?**

**ANSWER:** See "Implementation Phases and Order" section above.

**Key Principle:** Database first, then server actions, then UI.
- Phase 1: Database (tables, columns)
- Phase 2: Type system (TypeScript interfaces)
- Phase 3: Server actions (CRUD for templates, enhance master-events)
- Phase 4: UI - All-day events (modify existing components)
- Phase 5: UI - Template system (new components)
- Phase 6: Onboarding seed data (extend existing seeder)
- Phase 7: Calendar feed enhancements (low priority)
- Phase 8: Testing (comprehensive)

**2. Testing Strategy?**

**ANSWER:** Focus on integration tests for template flow and all-day events.

**Test Coverage:**
1. Template creation from master event (server action)
2. Template retrieval by event type (server action)
3. Master event creation from template (server action)
4. All-day event creation and storage (server action + database)
5. Multi-day all-day event creation (server action + database)
6. Calendar event field view with is_all_day toggle (UI component)
7. Template picker dialog selection (UI component)

**Test Files to Create:**
- `tests/master-event-templates.spec.ts` - Template CRUD operations
- `tests/all-day-events.spec.ts` - All-day and multi-day event creation
- Update existing event type tests if needed

**Test Limits (per TESTING.md):**
- 150 lines max per test file
- 5 tests max per file
- 30 lines max per test

**3. Backward Compatibility?**

**ANSWER:** NOT a concern - database resets during development.

**For Production (Future):**
- Events module should work even if no event types configured (empty state)
- System event types (mass, special-liturgy, sacrament, event) provide organization
- Parishes can create unlimited custom event types
- Templates are optional - users can create events without templates

### Calendar Feed Questions

**1. All-Day Event Format?**

**ANSWER:** Use standard iCalendar format (RFC 5545).

**All-Day Event (Single Day):**
```
BEGIN:VEVENT
DTSTART;VALUE=DATE:20250715
DTEND;VALUE=DATE:20250716
...
END:VEVENT
```
Note: DTEND is exclusive (day after event)

**All-Day Event (Multi-Day):**
```
BEGIN:VEVENT
DTSTART;VALUE=DATE:20250715
DTEND;VALUE=DATE:20250718
...
END:VEVENT
```
Example: July 15-17 event has DTEND of July 18

**Timed Event:**
```
BEGIN:VEVENT
DTSTART:20250715T140000Z
DTEND:20250715T160000Z
...
END:VEVENT
```
Use TIMESTAMPTZ converted to UTC

**2. Time Zone Handling?**

**ANSWER:** Use parish timezone (if stored) or default to UTC.

**Current Implementation:** calendar_events stores TIMESTAMPTZ (timezone-aware)
**Recommendation:**
- Add timezone column to parish_settings table (future enhancement)
- For now: Use UTC for .ics feed (standard practice)
- Convert start_datetime and end_datetime to UTC before generating .ics

**Example:**
```
DTSTART:20250715T140000Z  // 2:00 PM UTC
```

**For All-Day Events:** No timezone needed (VALUE=DATE format is timezone-agnostic)

### Performance Questions

**1. Custom Field Queries?**

**ANSWER:** Use GIN index on field_values JSONB (already exists).

**Query Pattern:**
```sql
SELECT * FROM master_events
WHERE field_values @> '{"Discussion Leader": "person-uuid"}'::jsonb
  AND parish_id = 'parish-uuid'
  AND deleted_at IS NULL
```

**Performance:**
- GIN index: `idx_master_events_field_values_gin` (already exists)
- Should be performant for up to 10,000+ master events per parish
- For high-volume queries, consider adding expression indexes:
  ```sql
  CREATE INDEX idx_master_events_discussion_leader
  ON master_events ((field_values->>'Discussion Leader'))
  WHERE deleted_at IS NULL;
  ```

**Filtering in List Views:**
- Most list views filter by event_type_id first (indexed)
- Then apply field_values filters if needed
- Should not be a bottleneck for typical parish usage

**2. Script Generation Performance?**

**ANSWER:** Generate on-demand (no caching needed for typical usage).

**Current Implementation:** Scripts generated on page load
**Expected Performance:**
- Simple script (10 sections, 20 placeholders): < 100ms
- Complex script (30 sections, 50+ placeholders): < 500ms
- PDF generation via pdfmake: 1-3 seconds (acceptable for user-initiated download)
- Word generation via docx: 1-3 seconds (acceptable for user-initiated download)

**Caching:** NOT NEEDED for MVP
- Scripts are dynamic (field values change frequently during event planning)
- Caching would complicate invalidation
- On-demand generation is fast enough

**Future Optimization (if needed):**
- Cache rendered HTML for frequently viewed scripts
- Invalidate cache on master event update
- Use Redis or similar for cache storage

---

## Next Steps

**Status:** Ready for Development

**Handoff to developer-agent:**

1. **Review this requirements document** - Understand that 90% already exists
2. **Focus on the 10% gap:**
   - master_event_templates table and CRUD
   - is_all_day support for calendar_events
   - Template picker UI components
   - Onboarding seed data for general event types
3. **Follow implementation phases** in order (Database → Types → Server Actions → UI)
4. **Reference existing patterns:**
   - master_events pattern for JSONB storage
   - master-event-form pattern for dynamic forms
   - person-picker pattern for template picker dialog
   - calendar-event-field-view pattern for all-day checkbox
5. **Test thoroughly** with template creation and all-day events
6. **Update documentation** after implementation

**Key Files to Modify:**
- Create: `supabase/migrations/YYYYMMDD_create_master_event_templates_table.sql`
- Create: `supabase/migrations/YYYYMMDD_add_is_all_day_to_calendar_events.sql`
- Create: `src/lib/actions/master-event-templates.ts`
- Modify: `src/lib/types.ts` (add MasterEventTemplate interfaces)
- Modify: `src/components/calendar-event-field-view.tsx` (add is_all_day checkbox)
- Create: `src/components/template-picker-dialog.tsx`
- Modify: `src/app/(main)/events/[event_type_id]/[id]/master-event-view-client.tsx` (add "Save as Template" button)
- Modify: `src/app/(main)/events/[event_type_id]/create/page.tsx` (add "Create from Template" button)
- Modify: `src/lib/onboarding-seeding/event-types-seed.ts` (add 4 general event types)
- Modify: `src/lib/actions/master-events.ts` (enhance createEvent/updateEvent for is_all_day)

**Documentation Updates:**
- Update `docs/MODULE_REGISTRY.md` with template system documentation
- Update CLAUDE.md if new patterns established
- Create user documentation (optional, via user-documentation-writer)

---

**Vision captured by brainstorming-agent on 2025-12-18**
**Technical requirements added by requirements-agent on 2025-12-18**
**Ready for implementation by developer-agent**
