# Dynamic Event Primary Occasion Improvements

**Created:** 2025-12-11
**Status:** Vision (awaiting technical requirements)
**Agent:** brainstorming-agent

## Feature Overview

Redesign how primary occasions are displayed and managed on dynamic events to treat them identically to attached occasions, with flexible ordering, clear labeling, and full calendar integration.

## Problem Statement

Currently, primary occasions on dynamic events are handled differently from attached occasions, creating an inconsistent user experience. The primary occasion has a different visual treatment, cannot be reordered alongside other occasions, and occasions (both primary and attached) do not appear on calendar views. This makes it difficult for staff to manage multi-occasion events and prevents users from seeing the full event picture in calendar views.

**Who has this problem?**
- Parish staff creating and managing dynamic events with multiple occasions
- Priests, deacons, and liturgical leaders viewing schedules and understanding event structure
- Parishioners viewing the parish calendar who need to see all occasions

## User Stories

- As a parish staff member, I want the primary occasion to look identical to attached occasions so that I have a consistent editing experience
- As a parish staff member, I want to reorder the primary occasion using drag-and-drop alongside attached occasions so that I can arrange occasions in logical or chronological order
- As a parish staff member, I want to clearly identify which occasion is the primary occasion so that I understand the event hierarchy at a glance
- As a parish staff member, I want to delete the primary occasion if needed so that I can restructure events without constraint
- As a priest viewing my schedule, I want to see all occasions (primary and attached) on the calendar so that I can understand the full scope of upcoming events
- As a parishioner viewing the parish calendar, I want to see all occasions associated with dynamic events so that I know what's happening in the parish

## Success Criteria

What does "done" look like?

- [ ] Primary occasion displays identically to attached occasions (same card/panel design, same fields, same actions)
- [ ] Primary occasion can be reordered using drag-and-drop alongside attached occasions in the list
- [ ] Primary occasion label shows "(Primary)" text next to the name to distinguish it from other occasions
- [ ] Primary occasion can be deleted without special restrictions
- [ ] All occasions (primary and attached) appear on all calendar views (day, week, month)
- [ ] Calendar views clearly distinguish the primary occasion from attached occasions
- [ ] Drag-and-drop reordering persists correctly to the database
- [ ] User can identify which occasion is primary at a glance in both edit and view modes

## Scope

### In Scope (MVP)

**Display & Layout:**
- Make primary occasion card/panel visually identical to attached occasion cards
- Add "(Primary)" text label next to primary occasion name
- No special styling or visual treatment beyond the "(Primary)" text label

**Ordering & Interaction:**
- Integrate primary occasion into the drag-and-drop reordering system alongside attached occasions
- Allow primary occasion to be positioned anywhere in the list (not forced first or last)
- Persist order changes to database

**Deletion:**
- Allow deletion of primary occasion without restrictions
- Use same delete confirmation dialog as attached occasions

**Calendar Integration:**
- Display primary occasion on all calendar views (day, week, month)
- Display all attached occasions on all calendar views
- Distinguish primary occasion from attached occasions in calendar view (likely with "(Primary)" indicator)

### Out of Scope (Future)

- Ability to reassign/promote a different occasion to be the primary
- Special visual styling or badges for primary occasions beyond text label
- Filtering calendar views to show only primary occasions or only attached occasions
- Bulk actions on occasions
- Occasion templates or duplication

## Key User Flows

### Primary Flow: Viewing a Dynamic Event

1. User navigates to a dynamic event detail page
2. User sees a list of all occasions (primary and attached) displayed identically
3. Each occasion appears as a card/panel with the same fields and layout
4. The primary occasion has "(Primary)" appended to its name/label
5. User can visually scan and immediately identify which occasion is primary

### Alternative Flow: Reordering Occasions

1. User is editing a dynamic event with multiple occasions
2. User sees all occasions (primary and attached) in a draggable list
3. User drags the primary occasion to a different position (e.g., from position 1 to position 3)
4. The list reorders visually
5. User saves changes
6. Order persists and displays correctly on subsequent views

### Alternative Flow: Deleting Primary Occasion

1. User is editing a dynamic event
2. User clicks delete on the primary occasion
3. System shows confirmation dialog (same as for attached occasions)
4. User confirms deletion
5. Primary occasion is removed from the event
6. System handles the aftermath (see Open Questions)

### Primary Flow: Viewing Calendar

1. User navigates to the parish calendar (day, week, or month view)
2. User sees a dynamic event scheduled
3. Calendar displays all occasions associated with that event (primary and attached)
4. Primary occasion shows with "(Primary)" indicator
5. User can distinguish between primary and attached occasions at a glance

## Integration Points

**Existing Features:**
- Dynamic Events module (`src/app/(main)/dynamic-events/`)
- Occasions management (currently part of dynamic events)
- Drag-and-drop reordering system (likely uses @dnd-kit based on project patterns)
- Calendar views (`src/app/(main)/calendar/`)
- Calendar event rendering components (mobile/day/week/month indicators)

**Existing Components:**
- Dynamic event form
- Occasion cards/panels (attached occasions)
- Drag-and-drop reordering interface
- Calendar event items (day, week, month views)
- Delete confirmation dialogs

**Database:**
- `dynamic_events` table
- `occasions` table (or similar - needs investigation)
- Relationship between events and occasions
- Ordering/position field for occasions

## Open Questions for Requirements-Agent

**Database & Data Model:**
- What is the current database schema for occasions? Is there a separate table or are occasions embedded?
- How is the primary occasion currently stored/identified? (Boolean flag? Special ID field?)
- How is ordering currently stored? (Position field? Created_at timestamp?)
- What happens in the database when the primary occasion is deleted?
  - Does the event get deleted?
  - Does another occasion become primary automatically?
  - Does the event remain with no primary?

**Current Implementation:**
- Where is the primary occasion currently displayed in the UI? (Separate section? Different component?)
- Where are attached occasions displayed? (List? Cards? Form fields?)
- Is drag-and-drop already implemented for attached occasions?
- What is the current UX pattern for reordering?

**Calendar Integration:**
- How are events currently rendered on the calendar?
- What data structure feeds the calendar views?
- Are there any existing patterns for showing multiple items from a single event?
- What are the performance implications of showing multiple occasions per event on the calendar?

**Technical Patterns:**
- What drag-and-drop library is being used? (@dnd-kit based on project docs?)
- What is the unique constraint handling pattern when reordering?
- Are there existing server actions for occasion CRUD operations?
- What is the WithRelations pattern for fetching dynamic events with occasions?

**Edge Cases:**
- What happens when ALL occasions (including primary) are deleted from a dynamic event?
- Can a dynamic event exist with zero occasions?
- If not, should deleting the last/primary occasion delete the entire event?
- How should occasions be ordered by default when first created?
- What happens if two occasions have the same position/order value?

**User Experience:**
- Should there be a visual indicator during drag-and-drop that the user is moving the primary occasion?
- Should there be any confirmation when reordering the primary occasion specifically?
- On the calendar, if there are many occasions, how should they be displayed? (Stacked? Expandable? Truncated with "show more"?)
- Should calendar event click behavior differ for primary vs attached occasions?

## Next Steps

Hand off to requirements-agent for technical analysis including:
1. Database schema investigation (occasions table, relationships, constraints)
2. Current implementation analysis (how primary occasion is currently handled)
3. Drag-and-drop pattern analysis (existing implementation, library usage)
4. Calendar rendering investigation (data flow, component structure)
5. Server action requirements (CRUD operations, reordering, deletion logic)
6. WithRelations interface design (fetching events with all occasions)
7. Component architecture (unified occasion display component)
8. Technical feasibility assessment and implementation plan

---

**Brainstorming Complete:** Ready for technical requirements analysis.
