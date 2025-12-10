# Unified Events Architecture (Dynamic Event Types)

**Created:** 2025-12-09
**Status:** Ready for Development (Technical Requirements Complete)
**Agent:** brainstorming-agent → requirements-agent

## Feature Overview

Transform the current hardcoded module system (weddings, funerals, baptisms, etc.) into a unified, dynamic Events architecture where administrators can create and manage custom event types through the UI without requiring code changes.

## Problem Statement

**Current State:**
- Each sacrament/sacramental (weddings, funerals, baptisms, presentations, quinceaneras) is a separate hardcoded module
- Adding a new event type requires developer intervention (code changes, migrations, deployment)
- Routes are duplicated across modules (/weddings/, /funerals/, /baptisms/)
- Code patterns are repeated across 7+ modules
- Parish administrators cannot customize event types to match their unique needs

**Problem:**
Parish administrators need the flexibility to create custom event types (e.g., "Mass of Thanksgiving", "Blessing Ceremony", "Rite of Christian Initiation") without waiting for developer support. The current architecture creates unnecessary complexity and limits parish autonomy.

**Who Has This Problem:**
- **Parish Administrators** - Cannot adapt the system to their specific sacramental/liturgical needs
- **Developers** - Must maintain duplicate code across multiple modules
- **Wedding Coordinators / Staff** - Navigate through disconnected modules instead of a unified events system

## User Stories

### Primary User Stories

1. **As a Parish Administrator**, I want to create a new event type called "Rite of Christian Initiation" so that I can track and manage RCIA ceremonies using the same tools as weddings and funerals.

2. **As a Parish Administrator**, I want to customize the input fields for each event type (e.g., Weddings need "Bride Name" and "Groom Name", but Baptisms need "Child Name" and "Parents Names") so that staff collect the right information for each ceremony.

3. **As a Parish Administrator**, I want to configure which event types appear in the sidebar navigation and in what order so that the most frequently used event types are easily accessible.

4. **As a Wedding Coordinator**, I want to access all weddings through a single "Events > Weddings" route so that I don't have to remember separate navigation paths for different ceremony types.

5. **As a Staff Member**, I want to click "New Wedding" in the sidebar and have the form pre-configured for weddings, but still be able to change the event type if I clicked the wrong link so that I can quickly correct mistakes without starting over.

6. **As a Parish Administrator**, I want to define custom script templates for each event type so that the liturgical scripts printed for ceremonies match our parish's unique liturgical practices.

7. **As a Developer**, I want to eliminate code duplication across modules so that bug fixes and improvements automatically apply to all event types.

## Success Criteria

What does "done" look like?

- [ ] **Single Unified Codebase** - All event types use the same module code (no separate /weddings/, /funerals/, /baptisms/ folders)
- [ ] **Dynamic Event Type Creation** - Admins can create new event types via Settings UI without code changes
- [ ] **Clean URL Structure** - Routes follow pattern `/events?type={slug}` for list, `/events/{event_type_slug}/{id}` for detail
- [ ] **Configurable Input Fields** - Each event type defines its own custom input fields (text, select, date, person picker, etc.)
- [ ] **Customizable Sidebar Navigation** - Admins control which event types appear in sidebar and their sort order
- [ ] **Backward Compatible Data** - Existing events migrate cleanly to new structure
- [ ] **Script Template System** - Each event type supports multiple script templates (simple, full, bilingual)
- [ ] **Filter Persistence** - When viewing an event and returning to the list, the event type filter remains active
- [ ] **Pre-filled Create Forms** - Clicking "New Wedding" pre-selects "Wedding" in the Event Type dropdown
- [ ] **Flexible Form Editing** - Users can change event type in the dropdown even after clicking a specific "New X" link

## Scope

### In Scope (MVP)

**1. Database Architecture** ✅
- Add `slug` field to existing `event_types` table
- Add `sort_order` field to existing `event_types` table
- Use existing `order` field from event_types table (already exists)
- Use existing `icon` field from event_types table (already exists)
- No need for `is_active` field (use soft delete with `deleted_at`)

**2. Event Type Settings UI** ✅
- Already exists at `/settings/event-types`
- List, create, edit, delete functionality already implemented
- Drag-and-drop reordering already implemented
- Need to add slug field to form dialog

**3. Unified Events Module** ✅
- Current route structure at `/events/`
- List already supports filtering by `event_type_id` via URL parameters
- Need to update sidebar to use slug-based URLs
- View pages already at `/events/{event_type_id}/{id}`

**4. Sidebar Navigation** ✅
- Dynamic Event Types section already exists (lines 274-306 in main-sidebar.tsx)
- Currently uses `event_type_id` in URLs
- Need to update to use `slug` instead

**5. List Page Filtering** ✅
- SearchCard with Event Type filter dropdown (needs to be added)
- URL parameter support already exists (`event_type_id`)
- Filter persistence via useListFilters hook already implemented

**6. Create/Edit Forms** 🔄
- Event Type dropdown needs to be added to create form
- Pre-fill logic from URL query parameter
- Form wrapper and unified form pattern already established

**7. Data Seeding** ✅
- Event types already seeded via `seedEventTypesForParish()` in event-types-seed.ts
- Need to add slug generation to seeder

**8. Old Route Cleanup** 🔄
- Old module folders already deleted (weddings, funerals, baptisms, presentations, quinceaneras)
- Old routes already return 404

### Out of Scope (Future Enhancements)

**Phase 2: Dynamic Input Fields** - Already implemented via input_field_definitions table
**Phase 3: Advanced Script Templates** - Already implemented via scripts and sections tables
**Phase 4: Permission Controls** - Defer to future
**Phase 5: Analytics & Reporting** - Defer to future

## Key User Flows

### Primary Flow: Admin Creates New Event Type

1. Admin navigates to **Settings > Event Types**
2. Clicks **"Create Event Type"** button
3. Form appears with fields:
   - Name: "Wedding" (text field)
   - Description: "Celebrating the union of two people in marriage." (textarea)
   - Slug: Auto-filled "wedding" (editable, validated for uniqueness)
   - Icon: "VenusAndMars" (icon picker)
   - Order: Auto-assigned (can drag to reorder later)
4. Clicks **"Save"**
5. System validates slug uniqueness (within parish)
6. New event type appears in list
7. Sidebar navigation updates with new "Wedding" submenu item
8. Staff can now create Wedding events via **Events > Wedding > New Wedding**

### Alternative Flow: Staff Creates Wedding Event

1. Staff member clicks **"Events > Wedding > New Wedding"** in sidebar
2. Create form opens at `/events/create?type=weddings`
3. Event Type dropdown is pre-filled with "Wedding"
4. Staff fills in wedding details (names, date, location, etc.)
5. Clicks **"Save"**
6. System creates event with `event_type_id` pointing to "Wedding" type
7. Redirects to view page at `/events/weddings/{new-id}`

### Alternative Flow: Staff Corrects Wrong Event Type

1. Staff member accidentally clicks **"Events > Funeral > New Funeral"** (meant to create Wedding)
2. Create form opens with Event Type dropdown pre-filled as "Funeral"
3. Staff notices error, clicks Event Type dropdown
4. Selects "Wedding" from dropdown
5. Form fields remain (no clearing)
6. Staff fills in wedding details
7. Clicks **"Save"**
8. System creates event as Wedding type
9. Redirects to `/events/weddings/{new-id}` (URL matches actual event type)

### Alternative Flow: Filter Persistence

1. User navigates to **Events > Wedding** (URL: `/events?type=weddings`)
2. List shows only weddings
3. User clicks on "Smith-Jones Wedding" to view details
4. View page opens at `/events/weddings/123`
5. User clicks browser back button (or "Back to list" link)
6. Returns to `/events?type=weddings` with filter still active
7. Search query and scroll position are preserved

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Research Summary

I investigated the current codebase and found:

**Database Layer:**
- `event_types` table already exists (migration: `20251031000002_create_event_types_table.sql`)
- Has fields: `id`, `parish_id`, `name`, `description`, `icon`, `order`, `deleted_at`, `created_at`, `updated_at`
- Missing fields: `slug`, `sort_order` (uses `order` currently)
- `events` table already exists (migration: `20251031000003_create_events_table.sql`)
- Has `event_type_id` foreign key already

**Server Actions:**
- Event types CRUD already exists (`src/lib/actions/event-types.ts`)
- Functions: `getEventTypes()`, `getEventType()`, `createEventType()`, `updateEventType()`, `deleteEventType()`, `reorderEventTypes()`
- Events CRUD already exists (`src/lib/actions/events.ts`)

**Settings UI:**
- Event types settings page already exists (`/settings/event-types`)
- Form dialog component already exists (`event-type-form-dialog.tsx`)
- Drag-and-drop reordering already implemented
- Icon picker already integrated (uses `src/lib/utils/lucide-icons.ts`)

**Sidebar:**
- Dynamic Event Types section already exists (lines 274-306 in `main-sidebar.tsx`)
- Currently generates links using `event_type_id`: `/events/{event_type_id}`
- Need to update to use slug: `/events?type={slug}`

**Seeding:**
- Event types already seeded via `seedEventTypesForParish()` in `event-types-seed.ts`
- Creates Wedding, Funeral, Baptism, Quinceañera, Presentation, Other event types
- Need to add slug field to seed data

### Database Schema Changes

#### Migration 1: Add slug field to event_types table

**File:** `supabase/migrations/20251210000001_add_slug_to_event_types.sql`

**Description:**
Add `slug` field to event_types table for URL-safe identifiers. Slug is auto-generated from name but editable by admins. Must be unique per parish.

**Schema Changes:**
```sql
-- Add slug column to event_types table
ALTER TABLE event_types
ADD COLUMN slug TEXT;

-- Add unique constraint for slug per parish
ALTER TABLE event_types
ADD CONSTRAINT unique_event_type_slug_per_parish UNIQUE (parish_id, slug);

-- Add index for slug lookups
CREATE INDEX idx_event_types_slug ON event_types(parish_id, slug) WHERE deleted_at IS NULL;
```

**Backfill Strategy:**
Generate slugs for existing event types in the seeder file, NOT in the migration. The migration only adds the column structure. The seeder will handle creating slugs based on event type names.

**RLS Policies:**
No changes needed - existing RLS policies cover the new slug field.

#### No Migration 2 Needed

The `order` field already exists and serves the purpose of `sort_order`. No changes needed.

### Server Actions Modifications

#### Update event-types.ts

**File:** `src/lib/actions/event-types.ts`

**Changes Needed:**

1. **Add slug to type interfaces:**
   - Update imports from `src/lib/types/event-types.ts` to include slug field
   - `DynamicEventType` interface should include `slug: string | null`

2. **Add slug generation utility function:**
   ```typescript
   /**
    * Generate a URL-safe slug from a string
    * Example: "Wedding Ceremony" -> "wedding-ceremony"
    */
   function generateSlug(text: string): string {
     return text
       .toLowerCase()
       .trim()
       .replace(/[^\w\s-]/g, '') // Remove special characters
       .replace(/\s+/g, '-')      // Replace spaces with hyphens
       .replace(/-+/g, '-')       // Replace multiple hyphens with single
       .replace(/^-+|-+$/g, '')   // Trim hyphens from start/end
   }
   ```

3. **Update createEventType() to generate slug:**
   - Call `generateSlug(data.name)` to auto-generate slug
   - Check slug uniqueness before insert
   - If slug exists, append number (e.g., "wedding-2")

4. **Update updateEventType() to handle slug updates:**
   - If slug is provided in update data, validate uniqueness
   - If slug conflicts, throw error

5. **Add getEventTypeBySlug() function:**
   ```typescript
   export async function getEventTypeBySlug(slug: string): Promise<DynamicEventType | null> {
     const selectedParishId = await requireSelectedParish()
     await ensureJWTClaims()
     const supabase = await createClient()

     const { data, error } = await supabase
       .from('event_types')
       .select('*')
       .eq('slug', slug)
       .eq('parish_id', selectedParishId)
       .is('deleted_at', null)
       .single()

     if (error) {
       if (error.code === 'PGRST116') {
         return null // Not found
       }
       console.error('Error fetching event type by slug:', error)
       throw new Error('Failed to fetch event type by slug')
     }

     return data
   }
   ```

6. **Update deleteEventType() error handling:**
   - Current implementation already checks for existing events
   - Error message: "Cannot delete event type with existing events. Delete events first."
   - This is correct - prevent deletion pattern

#### Update events.ts (if needed)

**File:** `src/lib/actions/events.ts`

**Investigation:**
Current implementation already supports filtering by `event_type_id`. No changes needed for server actions - filtering logic remains the same.

### Type Interfaces Updates

**File:** `src/lib/types/event-types.ts`

**Changes:**

```typescript
export interface EventType {
  id: string
  parish_id: string
  name: string
  description: string | null
  icon: string
  order: number
  slug: string | null  // NEW FIELD
  deleted_at: string | null
  created_at: string
  updated_at: string
}
```

**File:** `src/lib/types.ts`

Update `DynamicEventType` type alias to match:
```typescript
export type DynamicEventType = EventType  // Ensure it includes slug
```

### UI Component Changes

#### 1. Update Event Type Form Dialog

**File:** `src/app/(main)/settings/event-types/event-type-form-dialog.tsx`

**Changes:**

1. **Add slug field to form schema:**
   - Add slug input field (auto-generated from name, editable)
   - Show slug preview as URL-safe text
   - Validate slug uniqueness on blur

2. **Auto-generate slug from name:**
   - When name changes, auto-update slug field (if slug hasn't been manually edited)
   - Use `generateSlug()` utility function

3. **Form fields order:**
   - Name (text input)
   - Description (textarea)
   - Slug (text input with auto-generate button)
   - Icon (icon picker)

**Pseudo-code:**
```
COMPONENT EventTypeFormDialog
  STATE: name, description, slug, icon, order, slugManuallyEdited

  ON name change:
    IF NOT slugManuallyEdited THEN
      SET slug = generateSlug(name)
    END IF

  ON slug change by user:
    SET slugManuallyEdited = TRUE

  ON submit:
    VALIDATE slug uniqueness via server action
    IF slug exists THEN
      SHOW error: "This slug already exists"
    ELSE
      CALL createEventType() or updateEventType()
    END IF
```

#### 2. Update Sidebar Navigation

**File:** `src/components/main-sidebar.tsx`

**Current Implementation (lines 274-306):**
```typescript
{eventTypes.map((eventType) => {
  const Icon = getLucideIcon(eventType.icon)
  return (
    <CollapsibleNavSection
      key={eventType.id}
      name={eventType.name}
      icon={Icon}
      items={[
        {
          title: `Our ${eventType.name}s`,
          url: `/events/${eventType.id}`,  // CURRENT: Uses ID
          icon: Icon,
        },
        {
          title: `New ${eventType.name}`,
          url: `/events/${eventType.id}/create`,  // CURRENT: Uses ID
          icon: Plus,
        },
      ]}
      defaultOpen={false}
    />
  )
})}
```

**Required Changes:**
```typescript
{eventTypes.map((eventType) => {
  const Icon = getLucideIcon(eventType.icon)
  const slug = eventType.slug || eventType.id  // Fallback to ID if slug missing
  return (
    <CollapsibleNavSection
      key={eventType.id}
      name={eventType.name}
      icon={Icon}
      items={[
        {
          title: `Our ${eventType.name}s`,
          url: `/events?type=${slug}`,  // UPDATED: Use slug in query param
          icon: Icon,
        },
        {
          title: `New ${eventType.name}`,
          url: `/events/create?type=${slug}`,  // UPDATED: Use slug in query param
          icon: Plus,
        },
      ]}
      defaultOpen={false}
    />
  )
})}
```

**Rationale:**
- Use query parameter `?type={slug}` for list filtering (cleaner than `/events/{slug}`)
- Use `?type={slug}` for create pre-fill
- Keep detail view as `/events/{event_type_slug}/{id}` (requires dynamic route folder)

#### 3. Add Event Type Filter to Events List

**File:** `src/app/(main)/events/events-list-client.tsx`

**Current State:**
- SearchCard exists with search input
- AdvancedSearch with date range filter
- No event type filter dropdown

**Required Changes:**

1. **Add Event Type filter dropdown to SearchCard:**
   - Fetch active event types via `getActiveEventTypes()`
   - Display as dropdown: "All Event Types", "Wedding", "Funeral", etc.
   - Update URL parameter `?type={slug}` when selected
   - Read from URL on page load to restore filter

2. **Update filter state management:**
   - Use `useListFilters` hook (already in use)
   - Add `type` parameter to filter state
   - Sync with URL

3. **Update server-side filtering:**
   - In `page.tsx`, read `type` query param
   - Look up event_type_id from slug
   - Pass to `getEventsWithModuleLinks({ event_type_id })`

**Pseudo-code for SearchCard:**
```
COMPONENT EventsListClient
  FETCH eventTypes = getActiveEventTypes()

  STATE selectedEventTypeSlug from URL param "type"

  RENDER SearchCard:
    Event Type Dropdown:
      OPTIONS:
        - "All Event Types" (value: null, clears filter)
        - eventTypes.map(et => et.name) (value: et.slug)

      ON CHANGE:
        UPDATE URL param "type" = selected slug
        TRIGGER server-side refresh
```

#### 4. Update Events List Page (Server)

**File:** `src/app/(main)/events/page.tsx`

**Current Implementation:**
```typescript
const filters: EventFilterParams = {
  search: params.search,
  event_type_id: params.event_type_id,  // CURRENT: Direct ID
  // ...
}
```

**Required Changes:**
```typescript
// If type param exists (slug), look up event_type_id
let eventTypeId: string | undefined = params.event_type_id

if (params.type) {
  const eventType = await getEventTypeBySlug(params.type)
  if (eventType) {
    eventTypeId = eventType.id
  }
}

const filters: EventFilterParams = {
  search: params.search,
  event_type_id: eventTypeId,  // UPDATED: Use looked-up ID
  // ...
}
```

**Pass active event types to client:**
```typescript
const eventTypes = await getActiveEventTypes()

<EventsListClient
  initialData={events}
  stats={stats}
  initialHasMore={initialHasMore}
  eventTypes={eventTypes}  // NEW PROP
/>
```

#### 5. Update Events Create Form

**File:** `src/app/(main)/events/create/page.tsx` (needs to be created)

**Current State:**
No unified create page exists at `/events/create`. Each event type has its own create route.

**Required Implementation:**

1. **Create new file:** `src/app/(main)/events/create/page.tsx`
2. **Read `type` query parameter** from URL
3. **Look up event type by slug** (if provided)
4. **Pass to EventFormWrapper** with pre-filled event_type_id

**Pseudo-code:**
```
PAGE /events/create
  PARAMS: searchParams.type (slug)

  IF type param exists THEN
    eventType = getEventTypeBySlug(type)
    prefilledEventTypeId = eventType.id
  ELSE
    prefilledEventTypeId = null
  END IF

  FETCH eventTypes = getActiveEventTypes()

  RENDER EventFormWrapper:
    PASS prefilledEventTypeId
    PASS eventTypes for dropdown
```

#### 6. Update Events Form Component

**File:** `src/app/(main)/events/event-form.tsx` (needs significant changes)

**Current State:**
Events form uses dynamic field definitions from input_field_definitions table. This is already implemented.

**Required Changes:**

1. **Add Event Type dropdown to top of form:**
   - Required field
   - Pre-filled from URL query parameter
   - User can change selection (unlocked)
   - On change, form fields adapt (already implemented via input_field_definitions)

2. **Event Type Dropdown behavior:**
   - DO NOT clear form fields when event type changes (per user flow decision)
   - Keep all existing field values (user can manually clear if needed)
   - Form fields will adapt based on new event type's input_field_definitions

**Pseudo-code:**
```
COMPONENT EventForm
  PROP: prefilledEventTypeId (from URL)
  PROP: entity (for edit mode)

  STATE: selectedEventTypeId = prefilledEventTypeId || entity.event_type_id

  FETCH inputFieldDefinitions for selectedEventTypeId

  FORM FIELDS:
    1. Event Type Dropdown (required)
       - Options: All active event types
       - Default value: selectedEventTypeId
       - On change: Update selectedEventTypeId, re-fetch inputFieldDefinitions

    2. Dynamic fields based on inputFieldDefinitions
       - Rendered via field type (person, location, text, date, etc.)
       - Use existing field rendering logic

  ON SUBMIT:
    VALIDATE event type selected
    CALL createEvent() or updateEvent()
    REDIRECT to /events/{event_type_slug}/{id}
```

### File Structure & Routes

**Current Structure:**
```
/src/app/(main)/events/
├── page.tsx (list page - already exists)
├── events-list-client.tsx (already exists)
├── create/page.tsx (NEEDS TO BE CREATED)
├── event-form-wrapper.tsx (already exists)
├── event-form.tsx (already exists, needs updates)
├── [event_type_id]/
│   ├── [id]/page.tsx (view page - already exists)
│   ├── [id]/edit/page.tsx (edit page - already exists)
```

**Required Changes:**

1. **Create** `/events/create/page.tsx`
2. **Update** `/events/event-form.tsx` to add Event Type dropdown
3. **Update** `/events/page.tsx` to support `?type={slug}` filtering
4. **Update** `/events/events-list-client.tsx` to add Event Type filter dropdown
5. **Rename** `[event_type_id]` folder to `[event_type_slug]` for URL consistency (OPTIONAL)

**Rationale for keeping [event_type_id]:**
Keeping `[event_type_id]` avoids complex routing logic. The slug is used in query params for filtering, but detail views can continue using IDs in the path.

### URL Routing Strategy

**List Page:**
- `/events` - Show all events (no filter)
- `/events?type=weddings` - Show only weddings (filtered by slug)
- `/events?type=funerals` - Show only funerals (filtered by slug)

**Create Page:**
- `/events/create` - Blank form (no event type pre-selected)
- `/events/create?type=weddings` - Form with "Wedding" pre-selected

**Detail Pages:**
- `/events/{event_type_slug}/{id}` - View event
- `/events/{event_type_slug}/{id}/edit` - Edit event

**Alternative (simpler):**
Keep detail URLs as `/events/{event_type_id}/{id}` to avoid slug lookup on every page load. Slugs are only used for filtering and pre-fill.

**DECISION:** Use slugs in query parameters only, keep IDs in detail URLs.

### Data Seeding Updates

**File:** `src/lib/seeding/event-types-seed.ts`

**Current Implementation:**
Event types are created with name, description, icon, order. Slug field doesn't exist yet.

**Required Changes:**

Add slug field to each event type insert:

```typescript
const { data: weddingType } = await supabase
  .from('event_types')
  .insert({
    parish_id: parishId,
    name: 'Wedding',
    description: 'Celebrating the union of two people in marriage.',
    icon: 'VenusAndMars',
    order: 1,
    slug: 'weddings'  // NEW FIELD
  })
  .select()
  .single()
```

**Default Event Type Slugs:**
- Wedding → `weddings`
- Funeral → `funerals`
- Baptism → `baptisms`
- Quinceañera → `quinceaneras`
- Presentation → `presentations`
- Other → `other`

**File:** `scripts/dev-seed.ts`

**Changes:**
The seeder calls `seedEventTypesForParish()`, so no direct changes needed to dev-seed.ts. The changes in event-types-seed.ts will automatically propagate.

### Testing Requirements

**Unit Tests:**
- Test slug generation function (generateSlug)
- Test slug uniqueness validation
- Test event type CRUD with slug field

**Integration Tests:**
- Test sidebar navigation with slug-based URLs
- Test events list filtering by slug
- Test create form pre-fill from slug query param
- Test event type filter dropdown

**E2E Tests (Playwright):**
- Create event type with custom slug
- Navigate to event type via sidebar
- Create event via "New Wedding" link
- Verify event type filter persistence

**Test File Locations:**
- `tests/event-types-settings.spec.ts` (update existing)
- `tests/events.spec.ts` (update existing)

**Test Scenarios:**

1. **Create Event Type with Auto-Generated Slug:**
   - Navigate to Settings > Event Types
   - Click "Create Event Type"
   - Enter name "Wedding Ceremony"
   - Verify slug auto-fills as "wedding-ceremony"
   - Save and verify slug appears in list

2. **Create Event Type with Custom Slug:**
   - Navigate to Settings > Event Types
   - Click "Create Event Type"
   - Enter name "Mass of Thanksgiving"
   - Edit slug to "thanksgiving-mass"
   - Save and verify custom slug is preserved

3. **Slug Uniqueness Validation:**
   - Create event type with slug "weddings"
   - Attempt to create another with slug "weddings"
   - Verify error message appears
   - Verify second event type is not created

4. **Sidebar Navigation with Slug URLs:**
   - Navigate to Dashboard
   - Verify sidebar shows "Events > Wedding > Our Weddings"
   - Click "Our Weddings"
   - Verify URL is `/events?type=weddings`
   - Verify list shows only weddings

5. **Create Event via Sidebar:**
   - Click "Events > Wedding > New Wedding"
   - Verify URL is `/events/create?type=weddings`
   - Verify Event Type dropdown pre-selected to "Wedding"
   - Fill in form and save
   - Verify redirect to `/events/weddings/{id}`

6. **Filter Persistence:**
   - Navigate to `/events?type=weddings`
   - Click on a wedding
   - Click browser back button
   - Verify returned to `/events?type=weddings`
   - Verify filter still shows "Wedding"

### Documentation Updates

**Files to Update:**

1. **MODULE_REGISTRY.md** - Update Events module entry with new routing pattern
2. **COMPONENT_REGISTRY.md** - Document Event Type filter dropdown component
3. **DATABASE.md** - Document new slug field in event_types table
4. **MODULE_DEVELOPMENT.md** - Update event type creation guide with slug field

**New Sections:**

1. **Event Type Slug Generation:**
   - How slugs are auto-generated from names
   - Slug editing capabilities
   - Slug uniqueness enforcement

2. **Event Type Filtering:**
   - How to filter events by type using slug query parameter
   - Filter persistence mechanism
   - Pre-fill behavior from sidebar links

### Security Considerations

**Slug Validation:**
- Validate slug contains only alphanumeric characters and hyphens
- Prevent SQL injection via parameterized queries (already handled by Supabase)
- Enforce slug uniqueness at database level (unique constraint)

**Permission Checks:**
- Event type CRUD already restricted to Admin role (existing RLS policies)
- Event CRUD already scoped to parish via RLS
- No additional permission changes needed

**Data Validation:**
- Slug must be non-empty when event type is saved
- Slug length limit: 100 characters (add constraint)
- Name and slug required fields (already enforced)

### Implementation Complexity

**Complexity Rating:** Low

**Reason:**
Most infrastructure already exists:
- Event types table exists (just add slug column)
- Server actions exist (just add slug generation)
- Settings UI exists (just add slug field to form)
- Sidebar dynamic generation exists (just update URLs)
- Events list filtering exists (just add dropdown)

The main work is:
1. Database migration (5 minutes)
2. Update seeder with slugs (10 minutes)
3. Add slug field to form dialog (20 minutes)
4. Update sidebar URLs (10 minutes)
5. Add filter dropdown to events list (30 minutes)
6. Update events create page (20 minutes)
7. Testing (1 hour)

Total estimated effort: 2-3 hours of development + 1 hour testing

### Dependencies and Blockers

**Dependencies:**
- None - all infrastructure exists

**Blockers:**
- None identified

**Prerequisites:**
- Database migration must run before deploying UI changes
- Seeder must be updated to include slugs for dev environments

### Open Questions Resolved

**1. Slug Field Location:**
RESOLVED - Add to existing event_types table (no new table needed)

**2. Slug vs ID in URLs:**
RESOLVED - Use slugs in query parameters (`?type=weddings`), keep IDs in detail URLs (`/events/{id}`)

**3. Event Type Filter Location:**
RESOLVED - Add to SearchCard in events list (consistent with existing patterns)

**4. Pre-fill Behavior:**
RESOLVED - Use query parameter `?type={slug}` for pre-fill, read in create page

**5. Form Field Clearing:**
RESOLVED - DO NOT clear form fields when event type changes (per user flow decision)

**6. Sidebar URL Structure:**
RESOLVED - Use `/events?type={slug}` for list, `/events/create?type={slug}` for create

**7. Old Module Cleanup:**
RESOLVED - Already deleted, no action needed

**8. Default Event Types:**
RESOLVED - Use full set from seeder (Wedding, Funeral, Baptism, Quinceañera, Presentation, Other)

**9. Slug Uniqueness:**
RESOLVED - Database-level unique constraint per parish

**10. Event Type Deletion:**
RESOLVED - Prevent deletion if events exist (current implementation correct)

### Documentation Inconsistencies Found

**1. Event Types Table Schema:**
- Vision document mentioned `is_active` field
- Actual implementation uses `deleted_at` for soft delete (better pattern)
- RECOMMENDATION: Update vision to reflect soft delete pattern

**2. Event Types Table Field Names:**
- Vision document mentioned `sort_order` field
- Actual implementation uses `order` field
- RECOMMENDATION: Keep `order` field (already exists, works correctly)

**3. Sidebar Navigation Pattern:**
- Vision suggested `/events/{slug}/` routes
- Investigation found `/events?type={slug}` is cleaner (avoids dynamic route folder confusion)
- RECOMMENDATION: Use query parameters for filtering, IDs for detail views

### Next Steps

**Status updated to "Ready for Development"**

**Hand-off to developer-agent for implementation:**

1. **Phase 1: Database** (5 minutes)
   - Create migration to add slug column to event_types
   - Add unique constraint
   - Add index

2. **Phase 2: Seeder** (10 minutes)
   - Update event-types-seed.ts to include slug field
   - Add slug generation utility if not already present

3. **Phase 3: Server Actions** (15 minutes)
   - Add generateSlug() utility function
   - Update createEventType() to auto-generate slug
   - Add getEventTypeBySlug() function
   - Update type interfaces

4. **Phase 4: Settings UI** (20 minutes)
   - Add slug field to event type form dialog
   - Implement auto-generation from name
   - Add slug validation

5. **Phase 5: Sidebar** (10 minutes)
   - Update main-sidebar.tsx URLs to use slug query params
   - Test navigation

6. **Phase 6: Events List** (30 minutes)
   - Add Event Type filter dropdown to SearchCard
   - Update page.tsx to handle type query param
   - Update events-list-client.tsx with filter UI

7. **Phase 7: Create Form** (20 minutes)
   - Create /events/create/page.tsx
   - Update event-form.tsx to add Event Type dropdown
   - Implement pre-fill logic

8. **Phase 8: Testing** (1 hour)
   - Write/update E2E tests
   - Manual testing of all flows
   - Verify filter persistence

**Total Estimated Effort:** 2-3 hours development + 1 hour testing

---

## Implementation Notes for Developer-Agent

**Key Files to Modify:**
1. `supabase/migrations/20251210000001_add_slug_to_event_types.sql` (NEW)
2. `src/lib/seeding/event-types-seed.ts` (UPDATE)
3. `src/lib/actions/event-types.ts` (UPDATE)
4. `src/lib/types/event-types.ts` (UPDATE)
5. `src/app/(main)/settings/event-types/event-type-form-dialog.tsx` (UPDATE)
6. `src/components/main-sidebar.tsx` (UPDATE)
7. `src/app/(main)/events/page.tsx` (UPDATE)
8. `src/app/(main)/events/events-list-client.tsx` (UPDATE)
9. `src/app/(main)/events/create/page.tsx` (NEW)
10. `src/app/(main)/events/event-form.tsx` (UPDATE)

**Testing Files:**
1. `tests/event-types-settings.spec.ts` (UPDATE)
2. `tests/events.spec.ts` (UPDATE)

**Documentation Files:**
1. `docs/MODULE_REGISTRY.md` (UPDATE)
2. `docs/DATABASE.md` (UPDATE)

**Critical Implementation Rules:**

1. **DO NOT create new tables** - Add columns to existing event_types table
2. **DO NOT modify existing RLS policies** - They already cover new fields
3. **DO NOT use slug in detail URLs** - Keep `/events/{event_type_id}/{id}` pattern
4. **DO use slug in query params** - `/events?type={slug}` for filtering
5. **DO NOT clear form fields** - When event type changes, preserve field values
6. **DO generate slugs automatically** - But allow manual editing
7. **DO enforce slug uniqueness** - Database constraint per parish
8. **DO handle missing slugs gracefully** - Fallback to ID if slug is null

**Success Indicators:**

- [ ] Admin can create event type with auto-generated slug
- [ ] Admin can edit slug to custom value
- [ ] Sidebar shows event types with slug-based URLs
- [ ] Clicking sidebar link filters events list correctly
- [ ] Creating event via sidebar pre-fills event type
- [ ] Filter persists when navigating back from detail view
- [ ] All existing tests pass
- [ ] New tests cover slug functionality

**Risk Mitigation:**

- Migration is additive only (no data deletion)
- Slug is nullable initially (allows gradual rollout)
- Fallback to ID if slug is missing (backward compatible)
- Seeder provides slugs for all default event types
- Database constraint prevents duplicate slugs

**Deployment Checklist:**

1. Run database migration
2. Run seeder to add slugs to existing event types
3. Deploy UI changes
4. Test in staging environment
5. Verify filter persistence
6. Verify sidebar navigation
7. Deploy to production
8. Monitor for errors
