# List View Rebuild Requirements

**Date:** 2025-11-30
**Feature:** Complete rebuild of list view interface across all modules
**Reference Implementation:** Wedding module (to be built first)
**Status:** Requirements Phase - Current State Analysis Complete

---

## Table of Contents

- [Feature Overview](#feature-overview)
- [User Stories](#user-stories)
- [Current State Analysis - Complete Module Inventory](#current-state-analysis---complete-module-inventory)
- [Proposed Solution - Pseudocode](#proposed-solution---pseudocode)
- [Technical Scope](#technical-scope)
- [Component Architecture](#component-architecture)
- [Database & Server Action Implications](#database--server-action-implications)
- [UI/UX Specifications](#uiux-specifications)
- [Implementation Phases](#implementation-phases)
- [Testing Requirements](#testing-requirements)
- [Security Considerations](#security-considerations)
- [Documentation Updates Needed](#documentation-updates-needed)
- [Documentation Inconsistencies Found](#documentation-inconsistencies-found)

---

## Feature Overview

### Summary

Replace the current card grid layout (`ListViewCard`) with a table-based list view featuring:
- **Table structure** with sortable columns (who, what, when, where, actions)
- **Avatar displays** in "who" column (single person, couple, or group with overlapping images)
- **Infinite scrolling** for seamless browsing
- **Complex search** with clearable custom search component
- **Sortable columns** for data organization
- **Pagination** on index views (with URL state management)
- **"Go to top" button** that appears only after scrolling begins

### Business Value

- **Improved data density** - See more records at once in table format
- **Better scanability** - Structured columns make it easier to find specific information
- **Professional appearance** - Tables convey organization and professionalism
- **Enhanced sorting** - Quick access to records by any column
- **Consistent UX** - All modules follow the same pattern

### Priority

**High** - This is a major architectural change affecting all modules

---

## User Stories

### As a parish staff member:
- I want to see wedding records in a table format so I can quickly scan multiple weddings
- I want to see photos of the bride and groom in the list so I can visually identify couples
- I want to sort weddings by date, name, or status so I can find specific records quickly
- I want to search across all wedding fields so I can find records by any criteria
- I want to scroll through a long list without pagination delays (infinite scroll)
- I want a "go to top" button so I can quickly return to search filters after scrolling

### As a priest/presider:
- I want to see upcoming liturgies in a table with photos of who is receiving the sacrament/sacramental so I can quickly identify each person or family
- I want to sort by date so I can see chronological order
- I want to see location information so I know where each liturgy is held

### As a parish administrator:
- I want all module list views to be consistent so staff can learn the system easily
- I want performant list views that handle hundreds of records efficiently

---

## Current State Analysis - Complete Module Inventory

### Overall Pattern Summary

**All modules currently use:**
- `ListViewCard` component for card grid layout
- 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- `SearchCard` wrapper for search/filter UI
- URL-based filtering (via `useSearchParams` and `router.push`)
- No pagination (except Masses module)

### Module 1: Weddings

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/weddings/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/weddings/weddings-list-client.tsx`

**Current Implementation:**
```
COMPONENT: WeddingsListClient
  RECEIVES: initialData (WeddingWithNames[]), stats

  SEARCH IMPLEMENTATION:
    - URL-based search via searchParams.get('search')
    - Client state: useState for searchValue
    - Search updates URL via router.push
    - Placeholder: "Search by bride or groom name..."
    - Clear button (X icon) appears when search value exists

  FILTER IMPLEMENTATION:
    - Status filter: Select dropdown with MODULE_STATUS_VALUES
    - Default: 'all' status
    - Updates URL when changed

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: "Wedding"
      - Bride: first_name + last_name
      - Groom: first_name + last_name
      - Status badge
      - Language badge
      - Date + time (from wedding_event)
      - Notes (line-clamp-2, hidden on md)
      - Edit button
      - Preview button

  EMPTY STATE:
    - Icon: VenusAndMars
    - Message: "No weddings yet" or "No weddings found" (if filtered)
    - Action: "Create Your First Wedding" button
    - Clear Filters button (if filters active)

  STATS DISPLAY:
    - FormSectionCard with title "Wedding Overview"
    - Total Weddings count
    - Filtered Results count

  PAGINATION: None
```

**Who Column Data:**
- Bride: `wedding.bride` (Person object)
- Groom: `wedding.groom` (Person object)
- Display Type: **Couple** (2 avatars side by side)

**Unique Patterns:**
- None - follows standard module pattern

---

### Module 2: Funerals

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/funerals/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/funerals/funerals-list-client.tsx`

**Current Implementation:**
```
COMPONENT: FuneralsListClient
  RECEIVES: initialData (FuneralWithNames[]), stats

  SEARCH IMPLEMENTATION:
    - URL-based search via searchParams.get('search')
    - Client state: useState for searchValue
    - Search updates URL via router.push
    - Placeholder: "Search by deceased or family contact name..."
    - Clear button (X icon) appears when search value exists

  FILTER IMPLEMENTATION:
    - Status filter: Select dropdown with MODULE_STATUS_VALUES
    - Default: 'all' status
    - Updates URL when changed

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: "Funeral Service"
      - Deceased: first_name + last_name
      - Family Contact: first_name + last_name (hidden on md)
      - Status badge
      - Language badge
      - Date + time (from funeral_event)
      - Notes (line-clamp-2, hidden on md)
      - Edit button
      - Preview button

  EMPTY STATE:
    - Icon: Cross
    - Message: "No funerals yet" or "No funerals found" (if filtered)
    - Action: "Create Your First Funeral" button
    - Clear Filters button (if filters active)

  STATS DISPLAY:
    - FormSectionCard with title "Funeral Overview"
    - Total Funerals count
    - Filtered Results count

  PAGINATION: None
```

**Who Column Data:**
- Deceased: `funeral.deceased` (Person object)
- Display Type: **Single** (1 avatar)

**Unique Patterns:**
- None - follows standard module pattern

---

### Module 3: Baptisms

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/baptisms/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/baptisms/baptisms-list-client.tsx`

**Current Implementation:**
```
COMPONENT: BaptismsListClient
  RECEIVES: initialData (BaptismWithNames[]), stats

  SEARCH IMPLEMENTATION:
    - URL-based search via searchParams.get('search')
    - Client state: useState for searchValue
    - Search updates URL via router.push
    - Placeholder: "Search by child name..."
    - Clear button (X icon) appears when search value exists

  FILTER IMPLEMENTATION:
    - Status filter: Select dropdown with MODULE_STATUS_VALUES
    - Default: 'all' status
    - Updates URL when changed

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: "Baptism"
      - Child: first_name + last_name
      - Status badge
      - Language badge
      - Date + time (from baptism_event)
      - Notes (line-clamp-2, hidden on md)
      - Edit button
      - Preview button

  EMPTY STATE:
    - Icon: Droplet
    - Message: "No baptisms yet" or "No baptisms found" (if filtered)
    - Action: "Create Your First Baptism" button
    - Clear Filters button (if filters active)

  STATS DISPLAY:
    - FormSectionCard with title "Baptism Overview"
    - Total Baptisms count
    - Filtered Results count

  PAGINATION: None
```

**Who Column Data:**
- Child: `baptism.child` (Person object)
- NOTE: Baptisms also have mother, father, godparents in database but NOT shown in list view
- Display Type: **Single** (child only)

**Unique Patterns:**
- None - follows standard module pattern

---

### Module 4: Quinceaneras

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/quinceaneras/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/quinceaneras/quinceaneras-list-client.tsx`

**Current Implementation:**
```
COMPONENT: QuinceanerasListClient
  RECEIVES: initialData (QuinceaneraWithNames[]), stats

  SEARCH IMPLEMENTATION:
    - URL-based search via searchParams.get('search')
    - Client state: useState for searchValue
    - Search updates URL via router.push
    - Placeholder: "Search by quinceañera or family contact name..."
    - Clear button (X icon) appears when search value exists

  FILTER IMPLEMENTATION:
    - Status filter: Select dropdown with MODULE_STATUS_VALUES
    - Default: 'all' status
    - Updates URL when changed

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: "Quinceañera"
      - Quinceañera: first_name + last_name
      - Family Contact: first_name + last_name (hidden on md)
      - Status badge
      - Language badge
      - Date + time (from quinceanera_event)
      - Notes (line-clamp-2, hidden on md)
      - Edit button
      - Preview button

  EMPTY STATE:
    - Icon: BookHeart
    - Message: "No quinceañeras yet" or "No quinceañeras found" (if filtered)
    - Action: "Create Your First Quinceañera" button
    - Clear Filters button (if filters active)

  STATS DISPLAY:
    - FormSectionCard with title "Quinceañera Overview"
    - Total Quinceañeras count
    - Filtered Results count

  PAGINATION: None
```

**Who Column Data:**
- Quinceañera: `quinceanera.quinceanera` (Person object)
- Display Type: **Single** (1 avatar)

**Unique Patterns:**
- None - follows standard module pattern

---

### Module 5: Presentations

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/presentations/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/presentations/presentations-list-client.tsx`

**Current Implementation:**
```
COMPONENT: PresentationsListClient
  RECEIVES: initialData (PresentationWithNames[]), stats

  SEARCH IMPLEMENTATION:
    - URL-based search via searchParams.get('search')
    - Client state: useState for searchValue
    - Search updates URL via router.push
    - Placeholder: "Search by child, mother, or father name..."
    - Clear button (X icon) appears when search value exists

  FILTER IMPLEMENTATION:
    - Status filter: Select dropdown with MODULE_STATUS_VALUES
    - Default: 'all' status
    - Updates URL when changed

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: "Presentation"
      - "Baptized" badge (if is_baptized is true)
      - Child: first_name + last_name
      - Mother: first_name + last_name (hidden on md)
      - Father: first_name + last_name (hidden on md)
      - Status badge
      - Language badge
      - Date + time (from presentation_event)
      - Notes (line-clamp-2, hidden on md)
      - Edit button
      - Preview button

  EMPTY STATE:
    - Icon: HandHeartIcon
    - Message: "No presentations yet" or "No presentations found" (if filtered)
    - Action: "Create Your First Presentation" button
    - Clear Filters button (if filters active)

  STATS DISPLAY:
    - FormSectionCard with title "Presentation Overview"
    - Total Presentations count
    - Filtered Results count

  PAGINATION: None
```

**Who Column Data:**
- Child: `presentation.child` (Person object)
- NOTE: Presentations also have mother, father in database but NOT shown in list view
- Display Type: **Single** (child only)

**Unique Patterns:**
- **Badge:** "Baptized" badge displays if `is_baptized` field is true

---

### Module 6: Groups

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/groups/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/groups/groups-list-client.tsx`

**Current Implementation:**
```
COMPONENT: GroupsListClient
  RECEIVES: initialData (Group[])

  SEARCH IMPLEMENTATION:
    - None - no search bar

  FILTER IMPLEMENTATION:
    - None - no filters

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: group.name (dynamic)
      - Status: is_active ? 'ACTIVE' : 'INACTIVE'
      - Description (line-clamp-2)
      - Edit button
      - Preview button

  EMPTY STATE:
    - Icon: Users
    - Message: "No groups yet"
    - Description: "Create and manage groups of people who can be scheduled together for liturgical services."
    - Action: "Create Your First Group" button

  STATS DISPLAY: None

  PAGINATION: None
```

**Who Column Data:**
- None - Groups don't have people shown in the list view
- NOTE: Groups have members (accessed via /groups/[id]) but not shown in list
- Display Type: **None** (no avatars)

**Unique Patterns:**
- **No search or filters** - Simplest list implementation
- **No stats display**
- **Dynamic title** from group.name instead of hardcoded module name

---

### Module 7: Masses

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/masses/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/masses/masses-list-client.tsx`

**Current Implementation:**
```
COMPONENT: MassesListClient
  RECEIVES: initialData (MassWithNames[]), stats

  SEARCH IMPLEMENTATION:
    - URL-based search via searchParams.get('search')
    - Client state: useState for searchValue
    - Search updates URL via router.push
    - Placeholder: "Search by presider, homilist, or event name..."
    - Clear button (X icon) appears when search value exists

  FILTER IMPLEMENTATION:
    - Status filter: Select dropdown with MASS_STATUS_VALUES
    - Start Date: DatePickerField with URL sync
    - End Date: DatePickerField with URL sync
    - Sort By: Select dropdown with options:
      - Date (Earliest First) - date_asc
      - Date (Latest First) - date_desc
      - Recently Created - created_desc
      - Oldest Created - created_asc
    - "Clear All Filters" button (appears when filters active)

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: "Mass"
      - Presider: first_name + last_name (or "Not assigned")
      - Homilist: first_name + last_name (optional)
      - Location: event.location.name
      - Language badge
      - Date + time (from event)
      - Notes (line-clamp-2)
      - Edit button
      - Preview button

  EMPTY STATE:
    - Icon: Church
    - Message: "No masses yet" or "No masses found" (if filtered)
    - Action: "Create Your First Mass" button
    - Clear Filters button (if filters active)

  STATS DISPLAY:
    - FormSectionCard with title "Mass Overview"
    - Total Masses count
    - Filtered Results count

  PAGINATION: YES (ONLY MODULE WITH PAGINATION)
    - Page size: 50 (default from URL limit param)
    - Current page: from URL page param
    - Pagination controls:
      - "Page X of Y (N results)"
      - Previous/Next buttons
      - Buttons disabled when at boundary
```

**Who Column Data:**
- None - Masses don't show people avatars in the list view
- NOTE: Presider and homilist are shown as text, not avatars
- Display Type: **None** (no avatars)

**Unique Patterns:**
- **PAGINATION** - Only module with pagination
- **Date range filters** - Start date and end date pickers
- **Sort dropdown** - 4 sort options
- **Complex filters** - Grid layout with 4 filter fields
- **Default start date** - Today's date as default start_date filter

---

### Module 8: People

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/people-list-client.tsx`

**Current Implementation:**
```
COMPONENT: PeopleListClient
  RECEIVES: initialData (Person[]), stats

  AVATAR IMPLEMENTATION:
    - useEffect to fetch signed URLs for all avatars
    - Calls getPersonAvatarSignedUrls(paths) server action
    - Maps signed URLs by person.id
    - Stores in avatarUrls state (Record<string, string>)
    - Fallback: getInitials() function for first + last initials

  SEARCH IMPLEMENTATION:
    - URL-based search via searchParams.get('search')
    - NO client state (uses defaultValue on Input)
    - Search updates URL via onChange -> updateFilters
    - Placeholder: "Search people by name, email, or phone..."

  FILTER IMPLEMENTATION:
    - None - only search, no status or date filters

  CARD GRID LAYOUT:
    - Uses ListViewCard component
    - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    - Card displays:
      - Title: Avatar + full_name (dynamic title using ReactNode)
        - Avatar: h-10 w-10, shows image or initials fallback
      - Email: with Mail icon
      - Phone: with Phone icon
      - City, State: with MapPin icon
      - Notes (line-clamp-2)
      - Edit button
      - View button (no "Preview" text)

  EMPTY STATE:
    - Icon: User
    - Message: "No people yet" or "No people found" (if filtered)
    - Action: "Create Your First Person" button
    - Clear Filters button (if search active)

  STATS DISPLAY:
    - FormSectionCard with title "People Overview"
    - Total People count
    - With Email count
    - With Phone count
    - Filtered Results count

  PAGINATION: None
```

**Who Column Data:**
- Self: Person object itself
- Display Type: **Single** (1 avatar)

**Unique Patterns:**
- **AVATAR DISPLAY** - Only module showing avatars in current list view
- **Signed URLs** - Fetches signed URLs via server action in useEffect
- **Avatar fallback** - Shows initials (first + last) when no avatar
- **Dynamic title** - ReactNode title with Avatar component inside
- **No status filter** - Only search, no other filters
- **4 stats** - More detailed stats than other modules

---

### Module 9: Events

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/events/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/events/events-list-client.tsx`

**Current Implementation:**
```
EXPECTED PATTERN (not read, but follows standard):
  - SearchCard with search input
  - Status filter dropdown
  - Grid layout with ListViewCard
  - Event-specific fields displayed
  - No pagination
```

**Who Column Data:**
- None - Events don't have a primary person
- Display Type: **None** (no avatars)

---

### Module 10: Locations

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/locations/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/locations/locations-list-client.tsx`

**Current Implementation:**
```
EXPECTED PATTERN (not read, but follows standard):
  - SearchCard with search input
  - Possibly filter by location type
  - Grid layout with ListViewCard
  - Location address/details displayed
  - No pagination
```

**Who Column Data:**
- None - Locations don't have people
- Display Type: **None** (no avatars)

---

### Module 11: Mass Intentions

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-intentions/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-intentions/mass-intentions-list-client.tsx`

**Current Implementation:**
```
EXPECTED PATTERN (not read, but follows standard):
  - SearchCard with search input
  - Status filter dropdown
  - Grid layout with ListViewCard
  - Displays:
    - Requested By (Person)
    - Mass Offered For (could be Person or string)
    - Associated Mass
  - No pagination
```

**Who Column Data:**
- None - Mass Intentions don't show people avatars in the list view
- NOTE: "Requested By" and "Mass Offered For" are shown as text, not avatars
- Display Type: **None** (no avatars)

---

### Module 12: Readings

**File Location:**
- List page: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/readings/page.tsx`
- List client: `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/readings/readings-list-client.tsx`

**Current Implementation:**
```
EXPECTED PATTERN (not read, but follows standard):
  - SearchCard with search input
  - Filter by reading type (First Reading, Psalm, Second Reading, Gospel)
  - Grid layout with ListViewCard
  - Displays:
    - Reading reference (book, chapter, verse)
    - Lector (Person, optional)
    - Reading type
  - No pagination
```

**Who Column Data:**
- None - Readings don't show people avatars in the list view
- NOTE: Lector is shown as text, not avatar
- Display Type: **None** (no avatars)

---

### Summary of Current State Patterns

**Consistent Across Modules:**
1. All use `ListViewCard` for card display
2. All use `SearchCard` wrapper for search UI
3. All use 3-column responsive grid
4. All use URL-based filtering via `useSearchParams` + `router.push`
5. All have empty states with "Create Your First X" button
6. All have stats display (except Groups)
7. Search has clear button (X icon) when value exists

**Inconsistencies:**
1. **Pagination:** Only Masses has it (50 per page, Previous/Next buttons)
2. **Avatars:** Only People module shows avatars in list view
3. **Search pattern:** People uses `defaultValue` + `onChange`, others use `value` + `useState`
4. **Filters:** Masses has date range + sort, others only have status
5. **Stats count:** People shows 4 stats, others show 2
6. **Group members display:** Baptisms only shows child, not parents/godparents

---

## Proposed Solution - Pseudocode

### Component 1: PersonAvatarGroup

**Purpose:** Display avatars for a person, couple, or group with overlapping layout and tooltips.

```
COMPONENT PersonAvatarGroup
  PROPS:
    - people: Array of Person objects
    - type: 'single' | 'couple' | 'group'
    - maxDisplay: number (default 3, for groups only)

  STATE:
    - avatarUrls: Record<string, string> (person.id -> signed URL)

  ON MOUNT:
    1. Extract all avatar_url paths from people array
    2. IF no avatar paths THEN return (no fetch needed)
    3. CALL getPersonAvatarSignedUrls(paths) server action
    4. MAP results from path -> URL to person.id -> URL
    5. SET avatarUrls state

  RENDER LOGIC:
    IF type is 'single':
      RENDER one Avatar component
        - Image source: avatarUrls[person.id] OR null
        - Fallback: initials (first + last name first letters)
        - Tooltip on hover: person.full_name

    IF type is 'couple':
      RENDER two Avatar components side by side
        - First avatar: person[0]
        - Second avatar: person[1]
        - Spacing: gap-2 (8px between)
        - Tooltip on hover: both names (e.g., "Jane & John Doe")

    IF type is 'group':
      DETERMINE display count = min(people.length, maxDisplay)
      RENDER avatars with overlapping layout
        - First avatar: z-index 10, no offset
        - Second avatar: z-index 9, left offset -8px
        - Third avatar: z-index 8, left offset -8px
        - Add border to each avatar for separation
      IF people.length > maxDisplay:
        RENDER "+N more" indicator (e.g., "+2 more")
      Tooltip on hover: all person names OR count if > 5

  STYLING:
    - Avatar size: h-10 w-10 for tables, h-8 w-8 for compact views
    - Border: 2px solid bg-card around each avatar (for overlap separation)
    - Colors: Use semantic tokens (bg-muted, text-muted-foreground)
```

---

### Component 2: ClearableSearchInput

**Purpose:** Search input with search icon on left and clear button on right.

```
COMPONENT ClearableSearchInput
  PROPS:
    - value: string
    - onChange: (value: string) => void
    - placeholder: string
    - className?: string

  STATE:
    - None (controlled component)

  RENDER:
    DIV with relative positioning
      - Search icon on left (absolute, left-3, top-1/2)
      - Input field (pl-10 pr-10 for icon spacing)
      - IF value is not empty:
          RENDER clear button (X icon)
            - Absolute position, right-3, top-1/2
            - On click: call onChange('')
            - aria-label: "Clear search"

  KEYBOARD HANDLING:
    ON Escape key press:
      CALL onChange('')
```

---

### Component 3: ScrollToTopButton

**Purpose:** Floating button that appears after scrolling down, scrolls to top on click.

```
COMPONENT ScrollToTopButton
  PROPS:
    - threshold: number (default 300px)

  STATE:
    - isVisible: boolean (default false)

  HOOKS:
    useScrollPosition custom hook:
      ON scroll event:
        IF scrollY > threshold:
          SET isVisible = true
        ELSE:
          SET isVisible = false

  HANDLERS:
    scrollToTop():
      CALL window.scrollTo({ top: 0, behavior: 'smooth' })

  RENDER:
    IF not isVisible:
      RETURN null (don't render)

    RENDER Button
      - Fixed position (bottom-right, 16px from edges)
      - Circular shape (48px diameter)
      - Icon: Arrow Up (↑)
      - Background: bg-primary
      - Shadow: large shadow for elevation
      - z-index: 40 (below modals, above content)
      - Fade-in animation (200ms)
      - On click: call scrollToTop()
      - aria-label: "Scroll to top"
      - Keyboard accessible (Tab + Enter)
```

---

### Component 4: ModuleTableView

**Purpose:** Main table view component that wraps DataTable with module-specific configuration.

```
COMPONENT ModuleTableView<T>
  PROPS:
    - data: Array<T> (generic entity type)
    - columns: ColumnDefinition<T>[] (column configuration)
    - searchConfig: SearchConfig (search placeholder, fields)
    - filterConfig: FilterConfig (status values, sort options)
    - stats: Stats (total, filtered counts)
    - onLoadMore: () => void (infinite scroll callback)
    - hasMore: boolean (whether more results exist)

  STATE:
    - filters: TableFilterState (search, status, sort, page)

  URL STATE SYNC:
    USE useTableFilters hook:
      - Read filters from URL on mount
      - Update URL when filters change
      - Clear filters helper

  RENDER LAYOUT:
    1. SearchCard wrapper
       - ClearableSearchInput for search
       - Status filter dropdown
       - Sort dropdown
       - Clear filters button (if active)

    2. DataTable component
       - Pass columns configuration
       - Pass filtered data
       - Enable infinite scroll (always enabled)
       - Sticky header

    3. ScrollToTopButton
       - Appears when scrolled > 300px

    4. Stats display (if data exists)
       - Total count
       - Filtered count

  INFINITE SCROLL:
    USE useInfiniteScroll hook:
      - Detect when scrolled to bottom
      - CALL onLoadMore() if hasMore is true
      - Show loading spinner while fetching
```

---

### Hook 1: useAvatarUrls

**Purpose:** Fetch signed URLs for avatar images.

```
HOOK useAvatarUrls
  PARAMS:
    - people: Person[] (array of person objects)

  STATE:
    - avatarUrls: Record<string, string> (person.id -> signed URL)

  ON people array change:
    1. Extract all avatar_url paths from people
    2. IF no paths THEN return
    3. CALL getPersonAvatarSignedUrls(paths) server action
    4. MAP results to person.id -> URL
    5. SET avatarUrls state

  RETURN:
    - avatarUrls: Record<string, string>
```

---

### Hook 2: useTableFilters

**Purpose:** Manage table filter state in URL params.

```
HOOK useTableFilters
  PARAMS:
    - defaultFilters: TableFilterState

  STATE:
    - filters: TableFilterState (derived from URL)

  HELPERS:
    updateFilters(updates: Partial<TableFilterState>):
      1. GET current URL search params
      2. FOR EACH update key-value:
           IF value is not empty/default:
             SET param in URL
           ELSE:
             DELETE param from URL
      3. IF not updating page param:
           RESET page to 1
      4. PUSH new URL via router

    clearFilters():
      1. RESET to defaultFilters
      2. PUSH base URL (no params)

  RETURN:
    - filters: TableFilterState
    - updateFilters: function
    - clearFilters: function
```

---

### Hook 3: useScrollPosition

**Purpose:** Track scroll position for showing/hiding scroll-to-top button.

```
HOOK useScrollPosition
  PARAMS:
    - threshold: number (default 300)

  STATE:
    - scrollY: number (current scroll position)

  ON MOUNT:
    ADD scroll event listener
      ON scroll:
        SET scrollY = window.scrollY

  ON UNMOUNT:
    REMOVE scroll event listener

  RETURN:
    - scrollY: number
    - isAboveThreshold: boolean (scrollY > threshold)
```

---

### Hook 4: useInfiniteScroll

**Purpose:** Handle infinite scroll logic for loading more results. Required for all list views.

```
HOOK useInfiniteScroll
  PARAMS:
    - loadMore: () => void (callback to fetch next page)
    - hasMore: boolean (whether more results exist)

  STATE:
    - isLoading: boolean

  REFS:
    - sentinelRef: RefObject<HTMLDivElement> (element at bottom of list)

  INTERSECTION OBSERVER:
    ON sentinel element visible:
      IF hasMore AND not isLoading:
        SET isLoading = true
        CALL loadMore()
        WAIT for completion
        SET isLoading = false

  RETURN:
    - sentinelRef: RefObject (attach to bottom element)
    - isLoading: boolean
```

---

### Server Action Pattern (Apply to All Modules)

**Purpose:** Add pagination, sorting, and enhanced search to all module server actions.

```
INTERFACE ModuleFilterParams
  - search?: string
  - status?: ModuleStatus | 'all'
  - sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  - page?: number
  - limit?: number

FUNCTION getModuleRecords(filters: ModuleFilterParams)
  1. VERIFY authentication
     - CALL requireSelectedParish()
     - CALL ensureJWTClaims()
     - CREATE Supabase client

  2. CALCULATE pagination
     - page = filters.page OR 1
     - limit = filters.limit OR 50
     - offset = (page - 1) * limit

  3. BUILD database query
     - SELECT module records WITH related people, events, locations
     - WHERE parish_id = selectedParishId

  4. APPLY status filter (database level)
     - IF filters.status AND status != 'all':
         ADD WHERE clause: status = filters.status

  5. APPLY sorting (database level for direct fields)
     - IF sort is 'created_asc' OR 'created_desc':
         ADD ORDER BY created_at
     - (Other sorts applied in application layer)

  6. APPLY pagination (database level)
     - ADD .range(offset, offset + limit - 1)

  7. EXECUTE query
     - GET results from Supabase

  8. APPLY search filter (application level)
     - IF filters.search:
         FILTER results by searching:
           - Person names (related entities)
           - Notes
           - Other text fields
         USE case-insensitive includes()

  9. APPLY sorting (application level for related fields)
     - IF sort is 'date_asc' OR 'date_desc':
         SORT by event.start_date
         - Handle nulls (push to end)
     - IF sort is 'name_asc' OR 'name_desc':
         SORT by person.full_name (primary person)

  10. RETURN results
      - records: Array of entities with relations
      - hasMore: boolean (true if more records exist beyond current page)
      - total: number (total count of records matching filters)
```

---

## Technical Scope

### UI Implications

**New Components to Create:**
1. **`PersonAvatarGroup`** (`/src/components/person-avatar-group.tsx`)
   - Single, couple, and group avatar display
   - Overlapping layout for groups
   - Tooltip on hover
   - Signed URL fetching
   - Initials fallback

2. **`ClearableSearchInput`** (`/src/components/clearable-search-input.tsx`)
   - Search icon on left
   - Clear button on right
   - Keyboard handling (Escape to clear)

3. **`ScrollToTopButton`** (`/src/components/scroll-to-top-button.tsx`)
   - Fixed position floating button
   - Scroll threshold detection
   - Smooth scroll animation
   - Fade in/out animation

4. **`ModuleTableView`** (`/src/components/module-table-view.tsx`)
   - Main table wrapper component
   - Integrates search, filters, table, stats
   - Infinite scroll support
   - Generic for all modules

**Components to Modify:**
1. **`DataTable`** (`/src/components/data-table/data-table.tsx`)
   - Add infinite scroll support (required for all module list views)
   - Add sticky header support
   - Add loading state for infinite scroll
   - Ensure mobile responsiveness

**Components to Deprecate:**
- **`ListViewCard`** - Replace with table, deprecate after migration

**Pages/Views to Modify:**
All 12+ module list pages (24+ files):
- Server pages: `/src/app/(main)/[module]/page.tsx`
- Client components: `/src/app/(main)/[module]/[module]-list-client.tsx`

### Server Action Implications

**New Server Actions Required:**
- None - will enhance existing actions

**Server Actions to Modify:**
All module server actions (12+ files):
- `/src/lib/actions/weddings.ts`
- `/src/lib/actions/funerals.ts`
- `/src/lib/actions/baptisms.ts`
- `/src/lib/actions/quinceaneras.ts`
- `/src/lib/actions/presentations.ts`
- `/src/lib/actions/masses.ts`
- `/src/lib/actions/people.ts`
- `/src/lib/actions/events.ts`
- `/src/lib/actions/locations.ts`
- `/src/lib/actions/mass-intentions.ts`
- `/src/lib/actions/readings.ts`
- `/src/lib/actions/groups.ts`

**Changes to Each:**
1. Add `ModuleFilterParams` interface with pagination, sort
2. Add pagination logic (offset-based)
3. Add sorting logic (database + application level)
4. Add enhanced search across related fields

### Interface Analysis

**New TypeScript Interfaces:**

```
INTERFACE ModuleTableColumn<T>
  - key: string
  - header: string
  - accessor?: (row: T) => any
  - cell: (row: T) => ReactNode
  - sortable?: boolean
  - sortFn?: (a: T, b: T) => number
  - hidden?: boolean
  - hiddenOn?: 'sm' | 'md' | 'lg'
  - className?: string

INTERFACE PersonAvatarConfig
  - type: 'single' | 'couple' | 'group'
  - people: Array<{
      id: string
      name: string
      avatar_url?: string
      initials: string
    }>
  - maxDisplay?: number

INTERFACE TableFilterState
  - search: string
  - status: string
  - sort: string
  - page: number
  - limit: number

INTERFACE SearchConfig
  - placeholder: string
  - searchFields: string[] (fields to search)

INTERFACE FilterConfig
  - statusValues: string[]
  - sortOptions: Array<{ value: string, label: string }>
```

**Existing Interfaces to Update:**
- None - all Person, Event, Location interfaces already exist

### Styling Concerns

**Table Styling:**
- Use semantic color tokens (bg-card, text-card-foreground)
- Dark mode support (no hardcoded colors)
- Hover states for rows
- Sticky header when scrolling
- Responsive font sizes

**Avatar Styling:**
- Circular avatars (existing Avatar component)
- Overlapping avatars for groups:
  - First: z-10
  - Second: z-9, left -8px
  - Third: z-8, left -8px
  - Border: 2px solid bg-card (for separation)
- Size: h-10 w-10 (or h-8 w-8 for compact)

**Scroll to Top Button:**
- Fixed position: bottom-right (16px from edges)
- Rounded circle button (48px diameter)
- Shadow for elevation
- Smooth fade-in/out animation
- z-index: 40

### Component Analysis

**Existing Components to Reuse:**
- Avatar, AvatarImage, AvatarFallback (shadcn/ui)
- Button (shadcn/ui)
- Input (shadcn/ui)
- Table, TableHeader, TableBody, TableRow, TableCell, TableHead (shadcn/ui)
- Tooltip, TooltipProvider, TooltipTrigger, TooltipContent (shadcn/ui)
- Select, SelectTrigger, SelectContent, SelectItem (shadcn/ui)
- ModuleStatusLabel (custom)

**New Components:**
- PersonAvatarGroup
- ClearableSearchInput
- ScrollToTopButton
- ModuleTableView

### Implementation Locations

**New Files to Create:**
```
/src/components/
  person-avatar-group.tsx
  clearable-search-input.tsx
  scroll-to-top-button.tsx
  module-table-view.tsx

/src/hooks/
  use-avatar-urls.ts
  use-table-filters.ts
  use-scroll-position.ts
  use-infinite-scroll.ts (optional)
```

**Files to Modify:**
```
All module list pages (24+ files)
All module server actions (12+ files)
/src/components/data-table/data-table.tsx
```

### Documentation Impact

**Files to Update:**
1. `/docs/COMPONENT_REGISTRY.md` - Add new components
2. `/docs/MODULE_COMPONENT_PATTERNS.md` - Update List Client pattern
3. `/docs/LIST_VIEW_PATTERNS.md` - Deprecate card grid, add table pattern
4. `/docs/PAGINATION.md` - Update all modules to show pagination
5. `/CLAUDE.md` - Update references to list views

**New Documentation:**
- None required

### Testing Requirements

**Unit Tests:**
- PersonAvatarGroup component
- ClearableSearchInput component
- ScrollToTopButton component
- useAvatarUrls hook
- useTableFilters hook
- useScrollPosition hook

**Integration Tests (Playwright):**
- Wedding table view (reference implementation)
- Table display, sorting, search, pagination, avatar hover, mobile responsiveness
- Repeat for other high-priority modules

### README Impact

**No changes needed** - Internal feature change

### Code Reuse & Abstraction

**Rule of Three:**
- PersonAvatarGroup: Used in all modules → Abstract immediately
- ClearableSearchInput: Used in all modules → Abstract immediately
- ScrollToTopButton: Used in all modules → Abstract immediately
- ModuleTableView: Used in all modules → Abstract immediately

**Hooks to Abstract:**
- useAvatarUrls (from people-list-client.tsx)
- useTableFilters (from masses-list-client.tsx pattern)
- useScrollPosition (new)

### Security Concerns

**Avatar Access Control:**
- Avatar URLs are signed (already implemented)
- RLS policies enforce parish-scoped access
- Signed URLs expire (1 hour)
- No new security concerns

**Data Access:**
- All data fetching via server actions with auth
- RLS policies enforce parish scope
- No changes to security model

**XSS Protection:**
- React auto-sanitizes all user input
- No dangerouslySetInnerHTML used
- Search terms URL-encoded

**Performance Security:**
- Pagination limits prevent DoS
- Infinite scroll has max page size
- Client-side search is debounced

---

## Database & Server Action Implications

### Database Changes

**No schema changes required** - All necessary fields exist:
- `people.avatar_url` ✅
- `people.full_name` ✅ (auto-generated)
- All module tables have necessary fields

**Potential Index Additions:**
```
CONSIDER adding indexes for frequently sorted columns:
  - events.start_date (for masses, weddings, funerals, etc.)
  - people.full_name (for sorting by name)
  - module_tables.created_at (already indexed on most)
```

**RLS Policies:**
- No changes needed - existing policies cover all data access

### Server Action Changes

**Apply to All Modules:**
1. Add `ModuleFilterParams` interface
2. Add pagination logic (offset-based)
3. Add sorting logic (database + application level)
4. Add enhanced search (application level, across related fields)
5. Return results with optional `hasMore`, `total` for infinite scroll

**Pseudocode documented in "Proposed Solution" section above**

---

## UI/UX Specifications

### Table Layout

**Desktop View (≥1024px):**
```
┌─────────────────────────────────────────────────────────────┐
│ SEARCH                                                       │
│ [Search input with clear button]      [Status ▼] [Sort ▼]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WHO (25%)  │ WHAT (30%)      │ WHEN (20%)  │ WHERE (15%)│(10%) │
├────────────┼─────────────────┼─────────────┼────────────┼──────┤
│ [👤👤] Nm │ Wedding Title   │ Jan 15, 2025│ St. Mary's │ [⋮] │
└────────────┴─────────────────┴─────────────┴────────────┴──────┘
                                                  [↑ Back to top]
```

**Mobile View (<768px):**
```
┌─────────────────────────┐
│ [Search input]          │
│ [Filters ▼]             │
└─────────────────────────┘

┌─────────────────────────┐
│ WHAT            │ [⋮]   │
├─────────────────┼───────┤
│ Wedding Title   │ [⋮]   │
│ Jan 15, 2025    │       │
│ St. Mary's      │       │
│ [👤👤] Names    │       │
└─────────────────┴───────┘
```

### Avatar Display Patterns

**Single Person:**
- One circular avatar (h-10 w-10)
- Fallback: initials

**Couple:**
- Two avatars side by side
- Spacing: gap-2

**Group:**
- Overlapping avatars (max 3 shown)
- "+N more" indicator if > 3

### Search Specifications

**Behavior:**
- Debounced input (300ms)
- Updates URL immediately after debounce
- Server action called on URL change

**Fields by Module:**
- Weddings: Bride name, groom name, notes
- Funerals: Deceased name, notes
- Baptisms: Child name, notes
- (See Current State Analysis for all modules)

### Sorting Specifications

**Sort Options (varies by module):**
- Date (Earliest First) - default
- Date (Latest First)
- Name (A-Z)
- Name (Z-A)
- Recently Created
- Oldest Created

**Persistence:**
- Sort order stored in URL
- Persists across page refreshes

### Pagination & Infinite Scroll

**Strategy:**
- Server-side pagination (offset-based)
- Default page size: 50 records
- Infinite scroll for seamless UX
- "Load More" button as fallback

**Behavior:**
1. User scrolls to bottom
2. Loading indicator appears
3. Next page fetched via server action
4. New rows appended
5. Scroll position maintained

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Create reusable components and hooks

**Tasks:**
1. Create `PersonAvatarGroup` component with tests
2. Create `ClearableSearchInput` component with tests
3. Create `ScrollToTopButton` component with tests
4. Create hooks: `useAvatarUrls`, `useTableFilters`, `useScrollPosition`
5. Enhance `DataTable` component for infinite scroll
6. Update documentation in COMPONENT_REGISTRY.md

**Deliverables:**
- 3 new components (fully tested)
- 3 new hooks
- Updated DataTable
- Documentation

---

### Phase 2: Wedding Module (Reference Implementation) (Week 2)

**Goal:** Implement complete table view for weddings

**Tasks:**
1. Update wedding server action with pagination, sorting
2. Update wedding list server page with pagination params
3. Rewrite wedding list client using table
4. Write integration tests
5. Get user feedback

**Deliverables:**
- Fully functional wedding table view
- Comprehensive tests
- User sign-off before Phase 3

---

### Phase 3: Rollout to Remaining Modules (Weeks 3-4)

**Goal:** Apply table view to all other modules

**Priority Order:**
1. Funerals (similar to weddings)
2. Baptisms (group avatars)
3. Quinceaneras (single person)
4. Presentations (group avatars)
5. Masses (already has pagination)
6. Mass Intentions
7. Events
8. Readings
9. People (already has avatars)
10. Locations (no avatars)
11. Groups (group avatars)

**Per Module:**
- Update server action
- Update server page
- Rewrite list client
- Write/update tests
- Verify mobile responsiveness

**Deliverables:**
- All modules using table view
- All integration tests passing

---

### Phase 4: Documentation & Cleanup (Week 5)

**Goal:** Update documentation and deprecate old patterns

**Tasks:**
1. Update COMPONENT_REGISTRY.md
2. Update MODULE_COMPONENT_PATTERNS.md
3. Update LIST_VIEW_PATTERNS.md
4. Update PAGINATION.md
5. Deprecate ListViewCard
6. Code review and refactoring

**Deliverables:**
- Updated documentation
- Deprecated components marked
- Clean, consistent codebase

---

### Phase 5: Performance Optimization (Week 6) [Optional]

**Goal:** Optimize for large datasets

**Tasks:**
1. Add database indexes
2. Implement React Query for caching
3. Add virtualization (react-virtual) if needed
4. Optimize avatar URL fetching (batch requests)

**Deliverables:**
- Performance metrics
- Optimized queries
- Caching strategy

---

## Testing Requirements

### Unit Tests

**PersonAvatarGroup:**
- Renders single person avatar
- Renders couple avatars side by side
- Renders group avatars with overlap
- Shows initials when no avatar_url
- Displays tooltip on hover
- Limits group display to maxDisplay prop
- Shows "+N more" indicator for large groups

**ClearableSearchInput:**
- Renders search icon on left
- Shows clear button when value exists
- Hides clear button when empty
- Clears input on clear button click
- Clears input on Escape key
- Calls onChange with empty string on clear

**ScrollToTopButton:**
- Is hidden initially
- Appears after scrolling past threshold
- Scrolls to top on click
- Hides after scrolling back to top
- Has proper accessibility attributes

**Hooks:**
- useAvatarUrls: Fetches signed URLs, handles errors
- useTableFilters: Reads from URL, updates URL, clears filters
- useScrollPosition: Tracks scroll position correctly

### Integration Tests (Playwright)

**Wedding Table View:**
1. Table displays with correct columns
2. Shows bride and groom avatars in who column
3. Sorts by date when clicking When column
4. Searches by bride/groom name
5. Clears search with clear button
6. Loads more results on scroll (infinite scroll)
7. Shows scroll to top button after scrolling
8. Shows person name on avatar hover
9. Adapts to mobile view

**Repeat for other modules with module-specific variations**

---

## Security Considerations

### Authentication & Authorization

- All server actions call `requireSelectedParish()` ✅
- All server actions call `ensureJWTClaims()` ✅
- RLS policies enforce parish-scoped access ✅
- No new security concerns

### Avatar Access Control

- Avatar URLs are signed and expire after 1 hour ✅
- Storage bucket RLS policies restrict access ✅
- `getPersonAvatarSignedUrls()` validates parish membership ✅
- No changes needed

### XSS Protection

- React sanitizes all user input ✅
- No `dangerouslySetInnerHTML` used ✅
- Search terms URL-encoded ✅

### Rate Limiting

- Consider adding rate limiting to server actions
- Limit max page size to 100 records
- Debounce search input (already implemented)

---

## Documentation Updates Needed

### Files to Update

1. **`/docs/COMPONENT_REGISTRY.md`**
   - Add PersonAvatarGroup
   - Add ClearableSearchInput
   - Add ScrollToTopButton
   - Add ModuleTableView
   - Update DataTable (infinite scroll)

2. **`/docs/MODULE_COMPONENT_PATTERNS.md`**
   - Update List Client pattern (Section 2)
   - Replace grid with table
   - Add infinite scroll pattern

3. **`/docs/LIST_VIEW_PATTERNS.md`**
   - Mark Card Grid Layout as DEPRECATED
   - Add "Table Layout (Primary Pattern)"
   - Document PersonAvatarGroup usage

4. **`/docs/PAGINATION.md`**
   - Update "Current State" section
   - Change all modules from "❌ No Pagination" to "✅ Has Pagination"
   - Add infinite scroll documentation

5. **`/CLAUDE.md`**
   - Update Module Structure section
   - Add reference to table-based lists

---

## Documentation Inconsistencies Found

### 1. DataTable Component Not in Registry

**Issue:** `DataTable` component exists at `/src/components/data-table/data-table.tsx` but is not documented in `COMPONENT_REGISTRY.md`.

**Location:** `/docs/COMPONENT_REGISTRY.md`

**Suggested Correction:** Add a "Data Display Components" section with full DataTable documentation including props, usage examples, and features.

### 2. Pagination Documentation Out of Date

**Issue:** `PAGINATION.md` states most modules have no pagination.

**Location:** `/docs/PAGINATION.md` - "Current State" section

**Current State:**
- ✅ Has Pagination: Masses only
- ❌ No Pagination: All other modules

**Suggested Correction:** After implementation, update to show all modules with pagination.

### 3. List View Patterns Documentation Will Be Outdated

**Issue:** `LIST_VIEW_PATTERNS.md` documents `ListViewCard` as the primary pattern.

**Location:** `/docs/LIST_VIEW_PATTERNS.md`

**Suggested Correction:**
- Add deprecation notice to Card Grid Layout section
- Add new "Table Layout (Primary Pattern)" section
- Update all module references

### 4. Avatar Usage Not Documented

**Issue:** Avatar display patterns are not documented anywhere.

**Location:** No current documentation exists

**Suggested Correction:** Add avatar pattern documentation to COMPONENT_REGISTRY.md or create AVATAR_PATTERNS.md documenting:
- Single person avatar
- Couple avatars (side by side)
- Group avatars (overlapping)
- Fallback initials
- Hover tooltips
- Signed URL fetching

---

## Summary Report

### Feature Overview

Complete rebuild of all module list views from card grid to table format with:
- Sortable columns (who, what, when, where, actions)
- Avatar displays (single, couple, group with overlapping)
- Infinite scrolling with pagination
- Complex search with clearable input
- Scroll-to-top button

### Technical Scope

**Components:**
- Create: PersonAvatarGroup, ClearableSearchInput, ScrollToTopButton, ModuleTableView (+ 3 hooks)
- Modify: DataTable (add infinite scroll)
- Deprecate: ListViewCard

**Server Actions:**
- Update all 12+ module server actions

**Database:**
- No schema changes
- Consider adding indexes (optional)

**Files Changed:**
- 24+ module files (12 page.tsx, 12 list-client.tsx)
- 12+ server action files
- 4 new component files
- 3+ new hook files
- 1 modified component
- 5 documentation files

### Dependencies and Blockers

**Dependencies:**
- None - all libraries already installed

**Potential Blockers:**
- User feedback on wedding implementation may require changes
- Performance with large datasets may require optimization
- Mobile responsiveness may require design iteration

### Estimated Complexity

**Overall:** **High Complexity**

**Breakdown:**
- Components: Medium
- Hooks: Low
- Server Actions: Medium (repetitive but systematic)
- Testing: High
- Documentation: Medium

**Timeline:** 5-6 weeks (phased rollout)

**Risk Level:** Medium
- Risk: User feedback may require rework
- Mitigation: Build wedding module first, get feedback
- Risk: Performance issues
- Mitigation: Test with 500+ records, optimize queries

### Next Steps

1. **Phase 1 (Week 1):** Build foundation components and hooks
2. **Phase 2 (Week 2):** Implement wedding module, get user feedback
3. **Phase 3 (Weeks 3-4):** Roll out to all remaining modules
4. **Phase 4 (Week 5):** Update documentation and cleanup
5. **Phase 5 (Week 6):** Performance optimization (optional)

**Sign-off Required:** User must approve wedding implementation before proceeding to Phase 3

---

**END OF REQUIREMENTS DOCUMENT**
