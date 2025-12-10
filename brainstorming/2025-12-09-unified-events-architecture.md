# Unified Events Architecture (Dynamic Event Types)

**Created:** 2025-12-09
**Status:** Vision (awaiting technical requirements)
**Agent:** brainstorming-agent

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
- [ ] **Clean URL Structure** - Routes follow pattern `/events/{event_type_slug}/{id}` (e.g., `/events/weddings/123`)
- [ ] **Configurable Input Fields** - Each event type defines its own custom input fields (text, select, date, person picker, etc.)
- [ ] **Customizable Sidebar Navigation** - Admins control which event types appear in sidebar and their sort order
- [ ] **Backward Compatible Data** - Existing weddings, funerals, baptisms migrate cleanly to new structure
- [ ] **Script Template System** - Each event type supports multiple script templates (simple, full, bilingual)
- [ ] **Filter Persistence** - When viewing an event and returning to the list, the event type filter remains active
- [ ] **Pre-filled Create Forms** - Clicking "New Wedding" pre-selects "Wedding" in the Event Type dropdown
- [ ] **Flexible Form Editing** - Users can change event type in the dropdown even after clicking a specific "New X" link

## Scope

### In Scope (MVP)

**1. Database Architecture**
- `event_types` table with configurable fields:
  - `id`, `parish_id`, `name` (jsonb for bilingual), `slug`, `icon`, `sort_order`, `is_active`
- `events` table replaces individual module tables (weddings, funerals, etc.)
- Add `event_type_id` foreign key to events table
- Add `slug` field to event_types (URL-safe identifier, auto-generated but editable)
- Migration to consolidate existing module data into unified events table

**2. Event Type Settings UI**
- Settings page at `/settings/event-types`
- List of event types with create/edit/delete actions
- Event type form with fields:
  - Name (bilingual: English + Spanish)
  - Slug (auto-generated from name, editable, validated for uniqueness)
  - Icon (picker from Lucide React icon library)
  - Active/Inactive toggle
  - Sort order (for sidebar navigation)
- Drag-and-drop reordering of event types

**3. Unified Events Module**
- Single module at `/events/{event_type_slug}/`
- Route structure:
  - List (filtered): `/events/{event_type_slug}` (e.g., `/events/weddings`)
  - View: `/events/{event_type_slug}/{id}` (e.g., `/events/weddings/123`)
  - Edit: `/events/{event_type_slug}/{id}/edit`
  - Create: `/events/{event_type_slug}/create`
  - Unfiltered list: `/events` (shows all event types)

**4. Sidebar Navigation**
- "Events" parent menu item
- Submenu items for each active event type (sorted by `sort_order`)
  - Icon from event_type.icon
  - Label from event_type.name
  - "New Wedding" action (pre-fills event type in create form)
- "Show All" link at bottom (links to `/events` without filter)

**5. List Page Filtering**
- SearchCard with Event Type filter dropdown (shows all active event types)
- URL parameter: `?event_type_id=abc-123`
- Filter persistence when navigating back from view page
- Breadcrumbs remain generic ("Home > Events") regardless of filter

**6. Create/Edit Forms**
- Unified form component for all event types
- Event Type dropdown (required field)
- Pre-filled when accessed via "New Wedding" sidebar link
- User can change event type dropdown after clicking specific link (unlocked, editable)
- Form fields adapt based on selected event type (Phase 2 - see Out of Scope)

**7. Data Migration**
- Seeder file (dev-seed.ts) creates default event types with slugs:
  - Wedding (slug: "weddings")
  - Funeral (slug: "funerals")
  - Baptism (slug: "baptisms")
  - Presentation (slug: "presentations")
  - Quinceanera (slug: "quinceaneras")
- Migration adds `event_type_id` column to events table
- Backfill script links existing events to corresponding event types

**8. Old Route Cleanup**
- Remove old module folders: `/weddings/`, `/funerals/`, `/baptisms/`, `/presentations/`, `/quinceaneras/`
- No redirects - old URLs will 404
- Update all internal links to use new `/events/{slug}/` structure

### Out of Scope (Future Enhancements)

**Phase 2: Dynamic Input Fields**
- Custom input field definitions per event type (stored in separate table)
- Field types: text, textarea, select, date, person-picker, location-picker, etc.
- Form builder UI for admins to configure event type fields
- Dynamic form rendering based on field definitions

**Phase 3: Advanced Script Templates**
- Custom script template builder per event type
- Markdown-based template editor with field placeholders
- Multiple templates per event type (simple, full, bilingual)
- Template preview and version control

**Phase 4: Permission Controls**
- Role-based access per event type (Staff vs Ministry-Leader)
- Event type visibility settings (public vs internal)
- Field-level permissions (who can edit which fields)

**Phase 5: Analytics & Reporting**
- Event type usage statistics
- Custom report builder filtered by event type
- Calendar view aggregated across all event types

**Future Considerations:**
- Import/export event type configurations
- Event type templates library (shared across parishes)
- Workflow automation (approval processes per event type)

## Key User Flows

### Primary Flow: Admin Creates New Event Type

1. Admin navigates to **Settings > Event Types**
2. Clicks **"Create Event Type"** button
3. Form appears with fields:
   - Name (English): "Rite of Christian Initiation"
   - Name (Spanish): "Rito de Iniciación Cristiana"
   - Slug: Auto-filled "rite-of-christian-initiation" (editable)
   - Icon: Selects "Cross" icon from picker
   - Active: Toggle ON
   - Sort Order: Auto-assigned (can drag to reorder later)
4. Clicks **"Save"**
5. System validates slug uniqueness (within parish)
6. New event type appears in list
7. Sidebar navigation updates with new "RCIA" submenu item
8. Staff can now create RCIA events via **Events > RCIA > New RCIA**

### Alternative Flow: Staff Creates Wedding Event

1. Staff member clicks **"Events > Weddings > New Wedding"** in sidebar
2. Create form opens at `/events/weddings/create`
3. Event Type dropdown is pre-filled with "Wedding"
4. Staff fills in wedding details (names, date, location, etc.)
5. Clicks **"Save"**
6. System creates event with `event_type_id` pointing to "Wedding" type
7. Redirects to view page at `/events/weddings/{new-id}`

### Alternative Flow: Staff Corrects Wrong Event Type

1. Staff member accidentally clicks **"Events > Funerals > New Funeral"** (meant to create Wedding)
2. Create form opens with Event Type dropdown pre-filled as "Funeral"
3. Staff notices error, clicks Event Type dropdown
4. Selects "Wedding" from dropdown
5. Form updates (in Phase 2, form fields would adapt)
6. Staff fills in wedding details
7. Clicks **"Save"**
8. System creates event as Wedding type
9. Redirects to `/events/weddings/{new-id}` (URL matches actual event type)

### Alternative Flow: Filter Persistence

1. User navigates to **Events > Weddings** (URL: `/events/weddings`)
2. List shows only weddings
3. User clicks on "Smith-Jones Wedding" to view details
4. View page opens at `/events/weddings/123`
5. User clicks browser back button (or "Back to Weddings" link)
6. Returns to `/events/weddings` with filter still active
7. Search query and scroll position are preserved

### Edge Case Flow: Admin Deactivates Event Type

1. Admin navigates to **Settings > Event Types**
2. Finds "Quinceanera" event type
3. Toggles **"Active"** to OFF
4. Clicks **"Save"**
5. System marks `is_active = false`
6. Sidebar navigation removes "Quinceanera" submenu item
7. Event Type filter dropdown removes "Quinceanera" option
8. Existing quinceanera events remain in database (soft delete)
9. Accessing `/events/quinceaneras` returns 404 or "Event type not found" message

## Integration Points

### Existing Features That Will Be Affected

**1. Sidebar Navigation**
- Currently: Hardcoded menu items for each module
- New: Dynamic menu generation based on active event types from database
- File: `src/components/main-sidebar.tsx`

**2. Breadcrumbs**
- Currently: Module-specific breadcrumbs
- New: Generic "Home > Events" for all event lists and detail pages
- File: `src/components/breadcrumb-setter.tsx`

**3. Calendar Integration**
- Currently: Multiple event sources (weddings, funerals, baptisms)
- New: Single events table with event_type filter
- File: `src/app/(main)/calendar/calendar-client.tsx`

**4. Search/Filter System**
- Currently: Module-specific search
- New: Cross-event-type search with event type filter
- Component: `SearchCard` and `AdvancedSearch`

**5. Dashboard Stats**
- Currently: Shows counts per module
- New: Shows counts per event type (grouped)
- File: `src/app/(main)/dashboard/page.tsx`

**6. Permissions System**
- Currently: Role permissions per module
- New: Role permissions per event type (dynamic)
- Files: `src/lib/auth/permissions.ts`, `src/lib/auth/permissions-client.ts`

**7. Module Icons**
- Currently: Hardcoded icon mapping in calendar
- New: Icon stored in event_types table
- File: `src/components/calendar/module-icons.tsx`

**8. Print/Export Routes**
- Currently: Separate routes per module (`/print/weddings/{id}`, `/api/weddings/{id}/pdf`)
- New: Unified routes (`/print/events/{event_type_slug}/{id}`, `/api/events/{event_type_slug}/{id}/pdf`)

**9. Content Builders (Script Generation)**
- Currently: Separate content builder per module
- New: Generic content builder with event-type-specific templates (Phase 3)
- Directory: `src/lib/content-builders/`

### Existing Components to Reuse

**1. Form Components**
- FormField, SaveButton, CancelButton, DateTimePicker
- Person pickers, Location pickers, Event Type picker (new)

**2. List Components**
- SearchCard, DataTable, ContentCard, ListStatsBar
- Pagination controls, EmptyState component

**3. View Components**
- ModuleViewContainer, ModuleViewPanel, EntityHeader
- Active/Inactive badges, formatted date displays

**4. Settings Components**
- SettingsCard, SettingsSection
- Drag-and-drop reordering (from mass-role-templates)

**5. Utility Functions**
- `formatDatePretty()`, `formatPersonName()`, `getPageTitle()`
- Server action error handling patterns

### Database Tables to Modify

**1. event_types table (already exists)**
- Add `slug` field (text, unique per parish)
- Add `icon` field (text, Lucide icon name)
- Add `sort_order` field (integer, for sidebar ordering)
- Add `is_active` field (boolean, default true)

**2. events table (new, consolidates all modules)**
- Replaces: weddings, funerals, baptisms, presentations, quinceaneras tables
- Core fields: id, parish_id, event_type_id, date_time, location_id, notes
- Event-type-specific fields stored as jsonb (Phase 1) or normalized (Phase 2)

**3. Existing module tables (migration strategy)**
- Data migration: Copy all records from module tables to events table
- Backfill event_type_id based on source table
- Decision point: Drop old tables or keep as archive?

## Open Questions for Requirements-Agent

### Database & Migrations

1. **Data Migration Strategy**: Should we drop the old module tables (weddings, funerals, etc.) after migrating data to the unified events table, or keep them as an archive for rollback safety?

2. **JSONB vs Normalized Fields**: For Phase 1 (before dynamic input fields), should event-type-specific data (bride_name, groom_name, child_name, etc.) be stored in a jsonb column or as nullable columns in the events table?

3. **Slug Validation**: Should slug uniqueness be enforced at the database level (unique constraint) or application level (Zod validation)? Current decision: Database level with parish scoping.

4. **Event Type Deletion**: When an admin tries to delete an event type that has existing events, should we:
   - Prevent deletion (show error: "Cannot delete, X events exist")
   - Soft delete (mark inactive, hide from UI)
   - Cascade delete (delete all associated events - risky!)
   - Orphan events (allow deletion, set event_type_id to NULL)

### URL Structure & Routing

5. **Dynamic Route Implementation**: Next.js 15 uses `[event_type_slug]` folder for dynamic segments. Should we:
   - Use `app/(main)/events/[event_type_slug]/` pattern?
   - Or use middleware to rewrite `/events/weddings/` to `/events/` with context?

6. **404 Handling**: When a user accesses `/events/invalid-slug/`, what should happen?
   - Show generic 404 page
   - Redirect to `/events` with error toast
   - Show "Event type not found" message with link to all events

7. **Old Route Redirects**: Confirmed we're NOT doing redirects (old URLs will 404). Should we add a custom 404 page with helpful message like "This URL structure has changed. Visit /events to find what you're looking for"?

### Form & UI Behavior

8. **Event Type Dropdown State**: When event type changes in the create form, should we:
   - Clear all form fields (risky - user loses data)
   - Keep all form fields (may have incompatible data)
   - Show confirmation dialog: "Changing event type will clear the form. Continue?"

9. **Breadcrumb Customization**: We decided on generic "Home > Events" breadcrumbs. Should the view page breadcrumb include the event name?
   - Current: "Home > Events"
   - Alternative: "Home > Events > Smith-Jones Wedding"

10. **Event Type Filter UI**: In the SearchCard Event Type dropdown, should we:
    - Show all event types (active + inactive)?
    - Show only active event types?
    - Show active by default with "Show inactive" toggle?

### Permissions & Access Control

11. **Event Type Permissions**: Should admins be able to configure role-based access per event type?
    - Example: Ministry-Leader can view Weddings but not Funerals
    - Phase 1: All staff have access to all event types
    - Phase 2: Configurable per-event-type permissions

12. **Settings Access**: Who can manage event types (create/edit/delete)?
    - Admin role only?
    - Admin + Staff with special permission?
    - Configurable permission flag?

### Sidebar & Navigation

13. **Sidebar "Show All" Behavior**: When user clicks "Show All Events" in the sidebar, should we:
    - Navigate to `/events` (no filter)
    - Navigate to `/events` with `event_type_id=all` parameter
    - Navigate to `/events` and highlight "Show All" as active

14. **Event Type Sort Order**: When admin reorders event types, should the system:
    - Auto-assign sequential numbers (10, 20, 30) for flexibility?
    - Use dense ordering (1, 2, 3)?
    - Allow manual entry of sort_order number?

### Script Templates & Content Builders

15. **Template Migration**: Each module currently has its own content builder (wedding templates, funeral templates, etc.). For Phase 1, should we:
    - Keep existing content builders and call them based on event_type_id?
    - Create a generic template that works for all event types?
    - Defer script generation to Phase 3?

16. **Print/Export Routes**: Should print URLs include event type slug for clarity?
    - Consistent: `/print/events/{event_type_slug}/{id}`
    - Simplified: `/print/events/{id}` (lookup event type from database)

### Seeding & Development

17. **Default Event Types**: Which event types should be created by default in the seeder?
    - Minimum viable: Wedding, Funeral, Baptism
    - Full set: Wedding, Funeral, Baptism, Presentation, Quinceanera
    - Configurable: Let parishes choose during onboarding

18. **Icon Defaults**: Should default event types have pre-assigned icons, or should admins choose during setup?
    - Pre-assigned: Wedding = Heart, Funeral = Cross, Baptism = Droplet
    - Admin choice: All default to generic "Calendar" icon

### Testing Strategy

19. **Test Coverage**: What level of testing is needed for the MVP?
    - Database migrations (rollback safety)
    - Event type CRUD operations
    - URL routing and filtering
    - Form pre-fill behavior
    - Sidebar navigation updates

20. **Backward Compatibility Testing**: How do we verify existing events migrate correctly?
    - Automated test suite comparing old vs new data
    - Manual QA checklist
    - Staging environment validation before production

## Technical Assumptions

Based on existing patterns in the codebase, the requirements-agent should investigate:

**1. Module Pattern Reuse**
- The unified events module should follow the standard 8-file module structure
- Reference: Wedding module (`src/app/(main)/weddings/`)
- Files: page.tsx, [events]-list-client.tsx, create/page.tsx, [id]/page.tsx, [id]/edit/page.tsx, event-form-wrapper.tsx, event-form.tsx, [id]/event-view-client.tsx

**2. Server Actions Pattern**
- Event CRUD operations should use server actions with permission checks
- Pattern: `createEvent()`, `updateEvent()`, `deleteEvent()`, `getEventById()`, `getEvents()`
- File location: `src/lib/actions/events.ts` (or `dynamic-events.ts`)

**3. WithRelations Pattern**
- Event fetching should use the established `WithRelations` pattern for including related data
- Example: `EventWithRelations` interface includes event_type, location, people, etc.

**4. Form Validation Pattern**
- Dual validation with Zod schema (server + client)
- Schema location: `src/lib/schemas/events.ts`
- Includes event type validation, required fields, date validation

**5. Permissions Integration**
- Permission checks should integrate with existing auth system
- File: `src/lib/auth/permissions.ts`
- Pattern: Check user role before allowing event type management

**6. Search & Filter Pattern**
- Use existing `useListFilters` hook for filter state management
- URL parameter synchronization for shareable filtered views
- SearchCard component for filter UI

**7. Breadcrumb Pattern**
- Use `useBreadcrumbs()` hook to set breadcrumbs dynamically
- Generic breadcrumbs for all event pages per design decision

**8. Icon Integration**
- Use Lucide React icon library (already in use)
- Reference: `src/lib/utils/lucide-icons.ts` for icon picker implementation
- Store icon name as string, resolve to component at render time

**9. Seeding Pattern**
- Add event type seeding to `scripts/dev-seed.ts`
- Include default event types with slugs, icons, and sort order
- Ensure idempotency (safe to run multiple times)

**10. Migration Patterns**
- Follow established migration patterns from `supabase/migrations/`
- One table per migration file
- RLS policies in same migration as table creation
- Timestamp within current date to current date + 30 days

## Success Metrics

How will we measure if this feature is successful?

**Technical Metrics:**
- [ ] Zero code duplication across event types
- [ ] All existing events migrated without data loss
- [ ] Page load time for `/events` list under 2 seconds
- [ ] All automated tests passing (database, routing, forms)

**User Experience Metrics:**
- [ ] Admins can create new event type in under 2 minutes
- [ ] Staff can navigate to event type via sidebar in 1 click
- [ ] Filter persistence works 100% of time when navigating back
- [ ] Event type dropdown pre-fills correctly from sidebar links

**Business Metrics:**
- [ ] Parishes can add custom event types without developer support
- [ ] Reduced development time for new event type requests (from days to zero)
- [ ] Fewer support tickets about "can you add X event type?"

## Next Steps

**Immediate Next Steps:**
1. **User Confirmation** - Review this vision document for accuracy and completeness
2. **Hand-off to requirements-agent** - Move document to `/requirements/` folder
3. **Technical Analysis** - requirements-agent investigates:
   - Database schema design (events table structure, event_types updates)
   - Server action specifications (CRUD operations, validation rules)
   - Component architecture (dynamic routing, form adaptation)
   - Migration strategy (data backfill, old table cleanup)
   - Testing requirements (unit tests, integration tests, migration tests)

**Development Phases:**
- **Phase 1 (MVP)**: Unified events architecture with basic event types
- **Phase 2**: Dynamic input field definitions per event type
- **Phase 3**: Custom script template builder
- **Phase 4**: Advanced permissions and access controls
- **Phase 5**: Analytics and reporting

**Risk Mitigation:**
- Maintain backward compatibility during migration (existing data must not be lost)
- Thorough testing before dropping old module tables
- Staged rollout (dev → staging → production)
- Rollback plan (keep old tables as archive until production validated)

---

## Vision Document Status

**Status:** Ready for requirements-agent

**User Confirmation Required:** Please review this vision document and confirm:
1. Does this accurately capture your vision for the unified events architecture?
2. Are the user stories and success criteria aligned with your goals?
3. Are there any missing use cases or edge cases we should consider?
4. Are you ready to hand off to requirements-agent for technical analysis?

Once confirmed, this document will be moved to `/requirements/2025-12-09-unified-events-architecture.md` and the requirements-agent will expand it with technical specifications, database schemas, server actions, component architecture, and implementation details.
