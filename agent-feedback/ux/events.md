# UX Quality Audit - Events Module

**Routes Audited**:
- `/events` (list)
- `/events/create` (event type selector)
- `/events/[slug]/create` (create dynamic event)
- `/events/[slug]/[id]` (view event)
- `/events/[slug]/[id]/edit` (edit event)

**Date**: 2025-12-13
**Target Users**: Parish staff managing weddings, funerals, baptisms, and custom event types

---

## Executive Summary

**Overall Assessment**: ⚠️ Needs Improvement

**Critical Issues**: 2
**High Priority**: 4
**Enhancement Opportunities**: 5

**Strengths**: The user-defined event system is architecturally sound with good filtering and search. However, the **conceptual model** (Event Types vs Events vs Occasions) needs clearer explanation to prevent user confusion.

---

## 1. Language Clarity Assessment

### Form Labels
**Status**: ⚠️ Some Issues

**Findings**:

**Critical Issue #1**: "Event Type" vs "Event" Distinction Unclear
- `events/page.tsx:72` - Page title: "Our Events"
- `events-list-client.tsx:285` - Filter label: "Event Type"
- **Problem**: Users may not understand that "Event Types" are templates (like Wedding, Funeral) while "Events" are specific instances (John & Mary's Wedding)
- **Impact**: Users may try to create an Event without first setting up Event Types

**Examples of Ambiguous Labels**:
- `events-list-client.tsx:293` - "All Event Types" (filter option)
  - **Issue**: Doesn't clarify this filters the list, not manages Event Types
- `events/page.tsx:74` - Button: "Event" (ModuleCreateButton)
  - **Issue**: Doesn't indicate you're creating an instance, not a type

**Critical Issue #2**: "Occasion" Terminology Not Explained
- Referenced throughout the codebase but never defined for users
- **Problem**: Technical term from liturgical planning; unfamiliar users won't know what this means
- **Impact**: Users may not understand how to add dates/times/locations to events

### Button/Action Text
**Status**: ⚠️ Some Issues

**Findings**:

**Issue**: Generic "Create Event" Button
- `events/page.tsx:74` - `moduleName="Event"`
- **Problem**: Doesn't clarify what kind of event or that you must select a type
- **Recommended**: "Create New Event" or "Add Event"

**Issue**: Filter Dropdown Label
- `events-list-client.tsx:285` - Label hidden with `hideLabel`
- **Problem**: Dropdown shows event types but has no visible label
- **Recommended**: Show label "Filter by Event Type" or add aria-label

### Error Messages
**Status**: ℹ️ Limited Review

**Findings**:
- Error messages use translation keys (good for i18n)
- `events-list-client.tsx:117` - "Failed to load more events"
- **Enhancement**: More specific error messages would be helpful

---

## 2. Descriptions and Help Text

### Field Descriptions
**Status**: ❌ Lacking

**Critical Issue**: No Explanation of Core Concepts

**Location**: `/events/create` page (Event Type Selector)

**Problem**: When users click "Create Event", they see a list of event types (or empty state if none exist) with no explanation of:
- What an Event Type is
- Why they need to select one
- That Event Types must be configured in Settings first

**Recommended**: Add prominent description on event type selector page:
```
"Events represent specific ceremonies or activities in your parish.
First, choose which type of event you're creating (Wedding, Funeral, etc.).
Each event type has custom fields defined in Settings > Event Types."
```

### Empty States
**Status**: ⚠️ Some Issues

**Findings**:

**Good Practice**:
- `events-list-client.tsx:340-361` - Empty state has clear title, description, and CTA
- Differentiates between "no events yet" vs "no results matching filters"

**Enhancement Opportunity**:
- Empty state for "no event types configured" should:
  - Explain what event types are
  - Link to Settings > Event Types
  - Provide guidance for first-time setup

### Section Descriptions
**Status**: ❌ Missing

**Findings**:
- `events/page.tsx:73` - Page description: "Manage parish events and activities."
  - **Issue**: Too generic, doesn't explain the user-defined event system
  - **Recommended**: "Create and manage parish events like weddings, funerals, and custom activities. Event types are configured in Settings."

---

## 3. Navigation and Wayfinding

### Breadcrumbs
**Status**: ✅ Present & Accurate

**Findings**:
- `events/page.tsx:65-68` - Breadcrumbs: Dashboard > Our Events
- `events/create/page.tsx:35-39` - Breadcrumbs: Dashboard > Our Events > Create

**Enhancement**: Breadcrumbs on individual event views should show event type name instead of just "Our Events"

### Page Titles
**Status**: ⚠️ Inconsistent

**Findings**:

**Issue**: "Our Events" vs "Events"
- Page title: "Our Events" (page.tsx:72)
- Navigation likely says something different (need to verify sidebar)
- **Problem**: Inconsistency creates wayfinding confusion
- **Recommended**: Pick one and use consistently everywhere

**Issue**: Generic "Create" Breadcrumb
- `events/create/page.tsx:38` - "Create" doesn't specify what's being created
- **Recommended**: "Create Event" or "New Event"

### Menu Organization
**Status**: ℹ️ Unable to fully evaluate without sidebar code

**Findings**:
- Events module appears in main navigation
- Relationship to Settings > Event Types not clear from navigation alone

---

## 4. Information Ordering

### Field Order
**Status**: ℹ️ Dynamic based on Event Type configuration

**Findings**:
- Field order determined by Event Type setup
- This is appropriate for a user-defined system
- **Enhancement**: Event Type configuration UI should guide users on logical ordering

### Section Order
**Status**: ✅ Logical

**Findings**:
- Search/filters at top
- Data table below
- Load more at bottom
- Standard, logical pattern

### Content Priority
**Status**: ✅ Good

**Findings**:
- Most important info (What, When, Where) in table columns
- Actions accessible via dropdown menu
- Clear visual hierarchy

---

## 5. Terminology Consistency

| Term/Concept | Usage Found | Recommendation |
|--------------|-------------|----------------|
| Event vs Event Type | Mixed, sometimes unclear | ⚠️ Need clear distinction everywhere |
| "Our Events" vs "Events" | "Our Events" (title), "Events" (routes) | ⚠️ Standardize to one |
| Occasion | Used in code, not explained to users | ❌ Needs explanation or renaming |
| What/When/Where | Column headers | ✅ Clear and consistent |
| Event Type Filter | "Type" dropdown | ⚠️ Clarify "Event Type" |

**Critical Terminology Issue**:
The term "Occasion" is used throughout the data model but never explained to users. In liturgical planning, an "occasion" refers to a date/time/location combination for part of an event. However:
- Users unfamiliar with this term will be confused
- The concept is not intuitive without explanation
- Consider renaming to "Date & Location" or adding help text

---

## 6. Specific Issues

### Critical (Users Cannot Complete Tasks)

#### 1. Event Type Concept Not Explained

**Location**: `/events/create` and `/events` list page

**Problem**: Users don't understand the relationship between Event Types (templates) and Events (instances)

**Current Experience**:
1. User sees "Our Events" page with "Create Event" button
2. Clicks "Create Event"
3. Sees list of event types (or empty state if none configured)
4. May not understand what these types are or why they're being asked to choose

**Recommended Solution**:

**On `/events/create` page**, add prominent explanation:
```markdown
## Choose Event Type

Events in your parish are based on event types you configure.
Each event type (like Wedding or Funeral) has custom fields and templates.

If you don't see the event type you need, ask your administrator to
create it in Settings > Event Types.
```

**On `/events` list page**, enhance description:
```
Current: "Manage parish events and activities."
Recommended: "Manage parish events based on your configured event types.
              Create new events from templates like weddings, funerals, or custom types."
```

**Priority**: Critical
**Severity**: Blocks user understanding

---

#### 2. "Occasion" Terminology Unclear

**Location**: Throughout event forms and views (referenced in code but visible to users)

**Problem**: "Occasion" is a technical/liturgical term not explained to users

**Examples of Confusion**:
- User sees "Primary Occasion" in data model
- User sees "Add Occasion" button (if exposed in UI)
- User doesn't understand an event can have multiple occasions

**Recommended Solution**:

**Option A**: Rename to user-friendly term
- "Occasion" → "Date & Location"
- "Primary Occasion" → "Main Date & Location"
- "Add Occasion" → "Add Another Date & Location"

**Option B**: Keep term but add explanation
- Add tooltip: "An occasion is a date, time, and location for part of your event.
                For example, a funeral might have occasions for visitation,
                funeral mass, and burial."

**Priority**: Critical
**Severity**: Users may not understand how to set dates/locations

---

### High Priority (Users May Be Confused)

#### 3. Filter Dropdown Has No Label

**Location**: `events-list-client.tsx:282-300`

**Current**:
```tsx
<FormInput
  id="event-type-filter"
  label={t('events.eventType')}
  hideLabel  // <-- Label is hidden
  inputType="select"
  ...
/>
```

**Problem**: Dropdown shows event type names but no visible label explaining what it filters

**Recommended**:
```tsx
<FormInput
  id="event-type-filter"
  label={t('events.filterByEventType')}  // More descriptive
  inputType="select"
  ...
/>
```

**Priority**: High
**Severity**: Minor confusion about what the dropdown does

---

#### 4. "What" Column Header Too Generic

**Location**: `events-list-client.tsx:166`

**Current**: Header: "What"

**Problem**: In a list of events, "What" is ambiguous. Does it mean:
- What type of event?
- What is the event about?
- What's happening?

**Recommended**: "Event Type" or keep "What" but ensure it's clear from context

**Priority**: Medium
**Severity**: Minor ambiguity

---

#### 5. Table Shows Event Type Name, Not Event-Specific Title

**Location**: `events-list-client.tsx:171`

**Current**:
```tsx
<div className="font-medium truncate">
  {event.event_type?.name || 'Event'}
</div>
```

**Problem**: Shows "Wedding" for every wedding, "Funeral" for every funeral. No way to distinguish "Smith Wedding" from "Jones Wedding" in the list.

**Recommended**: Show event-specific identifier if available:
- Wedding: Bride & Groom names
- Funeral: Deceased person name
- Baptism: Child name

**Priority**: High
**Severity**: Makes it hard to find specific events in long lists

---

#### 6. "No Date Set" Message Too Vague

**Location**: `events-list-client.tsx:186`

**Current**: "No Date Set"

**Problem**: Doesn't guide user on how to add a date

**Recommended**: "No Date Set - Edit to Add"

**Priority**: Medium
**Severity**: Minor lack of guidance

---

### Enhancement Opportunities

#### 7. Search Placeholder Too Generic

**Location**: `events-list-client.tsx:277`

**Current**: `placeholder={t('events.searchPlaceholder')}`

**Recommended**: Make placeholder more specific: "Search by type, date, or location"

**Priority**: Low
**Severity**: Minor enhancement

---

#### 8. Empty State Could Link to Event Type Setup

**Location**: `events-list-client.tsx:340-361`

**Current**: "Create your first event" button

**Enhancement**: If no event types exist, redirect to Settings > Event Types with explanation

**Priority**: Low
**Severity**: Minor enhancement

---

#### 9. Advanced Search Label

**Location**: `events-list-client.tsx:304-318`

**Current**: AdvancedSearch component with date range filter

**Enhancement**: Add label "Advanced Search" or "Filter by Date Range" to make it more discoverable

**Priority**: Low
**Severity**: Minor enhancement

---

#### 10. Sort Options Not Visible

**Location**: Table sorting

**Current**: Sorting appears to be in DataTable component

**Enhancement**: Make current sort order visible, e.g., "Sorted by Date (Newest First)"

**Priority**: Low
**Severity**: Minor enhancement

---

#### 11. Actions Menu Uses Ellipsis Icon

**Location**: `events-list-client.tsx:231-257`

**Current**: MoreVertical icon with no text

**Enhancement**: While this is a common pattern, screen reader users need clear labels. Verify sr-only text is present (it is: line 234)

**Priority**: Low (already has sr-only text)
**Severity**: Accessibility handled correctly

---

## 7. Positive Observations

### Excellent Patterns to Maintain

1. **Dynamic Routing with Slugs**
   - Uses event type slugs in URLs: `/events/wedding/123`
   - Makes URLs readable and SEO-friendly

2. **Infinite Scroll with Clear End State**
   - `events-list-client.tsx:332-336` - EndOfListMessage component
   - Users know when they've reached the end

3. **Context-Aware Create Button**
   - `events/page.tsx:63` - If filtering by type, create button goes directly to that type
   - Smart UX that reduces clicks

4. **Search Debouncing**
   - `events-list-client.tsx:59` - Debounced search prevents excessive API calls
   - Good performance pattern

5. **Clear Empty State Differentiation**
   - `events-list-client.tsx:341-344` - Different messages for "no events yet" vs "no results"
   - Helps users understand the state

6. **Delete Confirmation Dialog**
   - `events-list-client.tsx:364-376` - Requires confirmation before deletion
   - Prevents accidental data loss

---

## 8. Action Items Summary

| Priority | Issue | Location | Current | Recommended |
|----------|-------|----------|---------|-------------|
| Critical | Event Type concept unclear | `/events` page description | "Manage parish events and activities." | Add explanation of event types and link to Settings |
| Critical | "Occasion" terminology not defined | Throughout forms/views | Technical term used without explanation | Add tooltip or rename to "Date & Location" |
| High | Filter dropdown no visible label | `events-list-client.tsx:285` | `hideLabel` | Show label "Filter by Event Type" |
| High | Table shows type name not event title | `events-list-client.tsx:171` | Shows "Wedding" for all weddings | Show bride/groom names or event-specific identifier |
| High | "What" column header ambiguous | `events-list-client.tsx:166` | "What" | "Event Type" or add context |
| High | No date guidance | `events-list-client.tsx:186` | "No Date Set" | "No Date Set - Edit to Add" |
| Medium | Search placeholder generic | `events-list-client.tsx:277` | Generic placeholder | "Search by type, date, or location" |
| Low | Empty state could link to setup | `events-list-client.tsx:347` | "Create Event" button | Check for event types, guide to Settings if none |
| Low | Advanced search discoverability | `events-list-client.tsx:304` | Collapsible section | Add clearer label |

---

## 9. Verdict

**UX Quality**: Needs Improvement

**User Understanding**: Users familiar with parish management may understand, but first-time users or those unfamiliar with the event type concept will struggle.

**Recommended Follow-up**:
- 🔴 **Fix critical issues immediately** - Add Event Type explanation and clarify "Occasion"
- ⚠️ **Address high priority items before release** - Filter labels, event identifiers
- ✅ **Consider enhancements for future polish** - Search placeholders, sort visibility

**Summary**: The Events module has a **solid technical foundation** but needs **significant UX copywriting improvements**. The core issue is that the **conceptual model** (Event Types as templates, Events as instances, Occasions as date/location combinations) is clear to developers but not explained to users.

**Key Recommendation**: Invest in **contextual help and microcopy** throughout the Events module. Add:
1. Page-level explanations of concepts
2. Field-level help text for complex inputs
3. Tooltips for terminology
4. Links between related features (Events ↔ Event Types in Settings)
