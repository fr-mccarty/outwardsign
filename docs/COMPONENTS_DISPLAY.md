# Display Components

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document covers UI components for displaying data, including cards, badges, avatars, and group member components.

---

## See Also

- **[LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)** - List page patterns and implementation
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index

---

## Card Components

### ContentCard
**Path:** `src/components/content-card.tsx`

**Purpose:** Simple card wrapper without header. Provides consistent p-6 padding.

**Key Features:**
- Standard `p-6` padding (24px) built-in
- No header section
- Pass `className` to customize padding when needed

**Props:**
- `children`: Card content (required)
- `className`: Additional CSS classes (merges with default `py-6`)

**Usage:**
```tsx
// Standard usage - gets p-6 padding automatically
<ContentCard>
  <Form>...</Form>
</ContentCard>

// Custom padding override
<ContentCard className="py-8">
  <p>Content with taller vertical padding</p>
</ContentCard>
```

**Related Components:**
- Use `EmptyState` for empty list states
- Use `FormSectionCard` for cards with title/description header
- Use `SearchCard` for compact search/filter sections

---

### EmptyState
**Path:** `src/components/empty-state.tsx`

**Purpose:** Consistent empty state display in a card with centered content. Use for empty list states, no-data states.

**Key Features:**
- Combines `ContentCard` with centered styling and `py-12` padding
- Icon, title, description, and action slot
- Consistent typography and spacing

**Props:**
- `icon`: Icon to display (typically a Lucide icon, optional)
- `title`: Main heading text (required)
- `description`: Description text below title (optional)
- `action`: Action button or link (optional)
- `className`: Additional CSS classes (optional)

**Usage:**
```tsx
<EmptyState
  icon={<Users className="h-16 w-16" />}
  title="No users yet"
  description="Get started by adding your first user"
  action={<Button>Add User</Button>}
/>

// Minimal usage
<EmptyState title="No results found" />

// With filtered state logic
<EmptyState
  icon={<Calendar className="h-16 w-16" />}
  title={hasFilters ? "No events match your filters" : "No events yet"}
  description={hasFilters ? "Try adjusting your filters" : "Create your first event"}
  action={!hasFilters && <Button>Create Event</Button>}
/>
```

**Use EmptyState Instead Of:**
```tsx
// ❌ Don't do this
<ContentCard className="text-center py-12">
  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium mb-2">No users yet</h3>
  <p className="text-muted-foreground">Create your first user</p>
  <Button className="mt-4">Add User</Button>
</ContentCard>

// ✅ Do this
<EmptyState
  icon={<Users className="h-16 w-16" />}
  title="No users yet"
  description="Create your first user"
  action={<Button>Add User</Button>}
/>
```

---

### FormSectionCard
**Path:** `src/components/form-section-card.tsx`

**Purpose:** Card for form sections with title and description header.

**Key Features:**
- CardHeader with title and optional description
- CardContent with `space-y-4` for form field spacing
- Standard card padding

**Props:**
- `title`: Section title (required)
- `description`: Optional description below title
- `children`: Card content (required)
- `className`: CSS classes for Card
- `contentClassName`: CSS classes for CardContent

**Usage:**
```tsx
<FormSectionCard
  title="Personal Information"
  description="Enter the participant's details"
>
  <FormField name="first_name" ... />
  <FormField name="last_name" ... />
</FormSectionCard>
```

---

### SearchCard
**Path:** `src/components/search-card.tsx`

**Purpose:** Compact card for search/filter sections with tighter padding.

**Key Features:**
- Uses ContentCard as base
- Tighter vertical padding (`pt-5 pb-5`) than standard cards
- Built-in title (h3) element
- `space-y-3` gap between title and content

**Props:**
- `title`: Section title (required)
- `children`: Card content (required)
- `className`: Additional CSS classes (optional)

**Usage:**
```tsx
<SearchCard title="Search Weddings">
  <ClearableSearchInput
    value={searchValue}
    onChange={setSearchValue}
    placeholder="Search by name..."
  />
  <AdvancedSearch ... />
</SearchCard>
```

---

## Display Components

### ListViewCard
**Path:** `src/components/list-view-card.tsx`

**Purpose:** Reusable card component for displaying entities in list views with consistent layout and optional status badge.

**Key Features:**
- Title in upper left (truncates automatically)
- Optional status badge between title and edit button
- Edit icon button in upper right
- Custom content area (passed as children)
- View button in bottom right
- Hover shadow effect
- Responsive design

**Props:**
- `title`: Card title (required) - will truncate if status present
- `editHref`: Link to edit page (required)
- `viewHref`: Link to view/detail page (required)
- `viewButtonText`: Text for view button (default: "View Details")
- `status`: Optional status value - automatically renders ModuleStatusLabel
- `statusType`: Status type ('module') - default: 'module'
- `language`: Optional language code - automatically renders plain text below title
- `children`: Card content (required)

**Deprecation Notice:** ListViewCard is being replaced with table-based list views. See PersonAvatarGroup, ClearableSearchInput, ScrollToTopButton, and AdvancedSearch for the new pattern.

**Layout:**
```
┌─────────────────────────────────────────┐
│ Title...     [Status Badge]    [Edit ✏️] │
│ Language Text                            │  ← Language as plain text
│─────────────────────────────────────────│
│ Content from children prop               │
│                         [Preview Button] │
└─────────────────────────────────────────┘
```

**Usage (with status and language):**
```tsx
<ListViewCard
  title="Wedding"
  editHref={`/weddings/${wedding.id}/edit`}
  viewHref={`/weddings/${wedding.id}`}
  viewButtonText="Preview"
  status={wedding.status}                      // ← Automatically renders status badge
  statusType="module"
  language={wedding.wedding_event?.language}   // ← Automatically renders language text
>
  {/* Date/time info */}
  {wedding.wedding_event && (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Calendar className="h-3 w-3" />
      {formatDatePretty(wedding.wedding_event.start_date)}
    </div>
  )}

  {/* Entity details */}
  <div className="text-sm space-y-1">
    <p className="text-muted-foreground">
      <span className="font-medium">Bride:</span> {wedding.bride.first_name}
    </p>
  </div>
</ListViewCard>
```

**Usage (without status):**
```tsx
<ListViewCard
  title={person.first_name + ' ' + person.last_name}
  editHref={`/people/${person.id}/edit`}
  viewHref={`/people/${person.id}`}
>
  <div className="text-sm">
    <p>{person.email}</p>
    <p>{person.phone_number}</p>
  </div>
</ListViewCard>
```

**Notes:**
- Do NOT import ModuleStatusLabel in list-client files - ListViewCard handles it automatically
- Title will truncate with `line-clamp-1` to make room for status badge
- Language appears as plain text directly below title when `language` prop is provided
- Language source varies by module:
  - Events: `event.language`
  - Readings: `reading.language`
  - Sacrament modules: `entity.[entity]_event?.language`
  - Masses: `mass.event?.language`

**Responsive Content Pattern:**

To maintain readability on mobile devices while showing full details on desktop, use responsive utility classes to hide supplementary content on small screens:

**Content Priority:**
1. **Essential (Always visible)**: Event date/time, primary person name
2. **Secondary (Hidden on mobile)**: Additional contacts, secondary people
3. **Supplementary (Hidden on mobile)**: Notes, descriptions

**Implementation Pattern:**
```tsx
<ListViewCard
  title="Module Name"
  editHref={`/modules/${entity.id}/edit`}
  viewHref={`/modules/${entity.id}`}
  status={entity.status}
  statusType="module"
  language={entity.event?.language}
>
  {/* ESSENTIAL - Always visible */}
  {entity.event && (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {formatDatePretty(entity.event.start_date)}
        {entity.event.start_time && ` at ${formatTime(entity.event.start_time)}`}
      </div>
    </div>
  )}

  <div className="text-sm space-y-1">
    {/* PRIMARY PERSON - Always visible */}
    {entity.primary_person && (
      <p className="text-muted-foreground">
        <span className="font-medium">Label:</span> {entity.primary_person.first_name} {entity.primary_person.last_name}
      </p>
    )}

    {/* SECONDARY CONTACTS - Hidden on mobile, visible on tablet+ */}
    {entity.secondary_person && (
      <p className="text-muted-foreground hidden md:block">
        <span className="font-medium">Label:</span> {entity.secondary_person.first_name} {entity.secondary_person.last_name}
      </p>
    )}
  </div>

  {/* NOTES - Hidden on mobile, visible on tablet+ */}
  {entity.notes && (
    <p className="text-sm text-muted-foreground line-clamp-2 hidden md:block">
      {entity.notes}
    </p>
  )}
</ListViewCard>
```

**Module-Specific Responsive Rules:**
- **Weddings**: Keep visible: Date/time, Bride, Groom | Hide on mobile: Notes
- **Funerals**: Keep visible: Date/time, Deceased | Hide on mobile: Family Contact, Notes
- **Baptisms**: Keep visible: Date/time, Child | Hide on mobile: Notes

---

### ListStatsBar
**Path:** `src/components/list-stats-bar.tsx`

**Purpose:** Reusable stats/status bar component for displaying metrics on list views with consistent styling and responsive layout.

**Key Features:**
- Configurable stats via props (no hardcoded values)
- Responsive grid (2 columns on mobile, 4 columns on larger screens)
- Automatic grid adjustment based on number of stats
- Consistent typography and styling using semantic tokens
- Optional custom title (defaults to "Overview")
- Uses FormSectionCard for consistent card styling

**Props:**
- `stats`: Array of `ListStat` objects (required)
  - Each stat has `value: number` and `label: string`
- `title`: Section title (optional, default: "Overview")
- `className`: Additional CSS classes (optional)

**Types:**
```tsx
export interface ListStat {
  value: number
  label: string
}
```

**Usage Examples:**

**Basic - People Module:**
```tsx
import { ListStatsBar, type ListStat } from "@/components/list-stats-bar"

// In server page, calculate stats
const stats = {
  total: allPeople.length,
  withEmail: allPeople.filter(p => p.email).length,
  withPhone: allPeople.filter(p => p.phone_number).length,
  filtered: people.length
}

// In client component, transform to ListStat array
const statsList: ListStat[] = [
  { value: stats.total, label: 'Total People' },
  { value: stats.withEmail, label: 'With Email' },
  { value: stats.withPhone, label: 'With Phone' },
  { value: stats.filtered, label: 'Filtered Results' }
]

// Render stats bar (only when there's data)
{stats.total > 0 && (
  <ListStatsBar title="People Overview" stats={statsList} />
)}
```

**Weddings Module:**
```tsx
// In server action (weddings.ts)
export interface WeddingStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getWeddingStats(filteredWeddings: WeddingWithNames[]): Promise<WeddingStats> {
  // Fetch all weddings
  const allWeddings = await fetchAllWeddings()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return {
    total: allWeddings.length,
    upcoming: allWeddings.filter(w => new Date(w.wedding_event?.start_date) >= today).length,
    past: allWeddings.filter(w => new Date(w.wedding_event?.start_date) < today).length,
    filtered: filteredWeddings.length
  }
}

// In client component
const statsList: ListStat[] = [
  { value: stats.total, label: 'Total Weddings' },
  { value: stats.upcoming, label: 'Upcoming' },
  { value: stats.past, label: 'Past' },
  { value: stats.filtered, label: 'Filtered Results' }
]

{stats.total > 0 && (
  <ListStatsBar title="Wedding Overview" stats={statsList} />
)}
```

**Custom Title:**
```tsx
<ListStatsBar
  title="My Custom Stats"
  stats={statsList}
/>
```

**Grid Layout Behavior:**
- 1-2 stats: 2 columns on all screens
- 3 stats: 2 columns on mobile, 3 columns on md+
- 4+ stats: 2 columns on mobile, 4 columns on md+

**Implementation Pattern:**

1. **Server Page**: Calculate stats from data (all records + filtered results)
2. **Server Page**: Pass stats object to client component via props
3. **Client Component**: Transform stats object to `ListStat[]` array
4. **Client Component**: Render `<ListStatsBar>` only when `total > 0`

**Common Stats Patterns:**
- **Total**: Total count of all records
- **Filtered**: Count of records matching current filters
- **Status-based**: Count by status (Active, Completed, etc.)
- **Time-based**: Upcoming vs Past (events with dates)
- **Attribute-based**: With Email, With Phone, etc.

**Notes:**
- Always calculate stats in server page/action for accuracy
- Stats should reflect ALL records (not just filtered), except for "Filtered Results"
- Don't render stats bar if there are no records (`total > 0`)
- Stats bar appears AFTER the table/list content
- Uses semantic color tokens for dark mode support
- **Quinceaneras**: Keep visible: Date/time, Celebrant | Hide on mobile: Notes
- **Presentations**: Keep visible: Date/time, Child | Hide on mobile: Notes

**Rationale:**
- Users need essential information (who, when) to identify records
- Hiding all content on mobile forces unnecessary taps to view details
- Secondary contacts and notes are useful but not critical for identification
- Desktop users still see full content

---

### PersonAvatarGroup
**Path:** `src/components/person-avatar-group.tsx`

**Purpose:** Display avatars for a person, couple, or group of people with overlapping layout, tooltips, and fallback initials.

**Key Features:**
- Three display modes: single, couple, group
- Automatically fetches signed URLs for avatar images via `useAvatarUrls` hook
- Tooltip shows person name on hover
- Fallback initials (first + last name) when no avatar image
- Overlapping layout for groups with "+N more" indicator
- Responsive sizing (sm, md, lg)

**Props:**
- `people`: Array of person objects with `id`, `first_name`, `last_name`, `full_name`, `avatar_url?`
- `type`: Display mode ('single' | 'couple' | 'group')
- `size`: Avatar size ('sm' | 'md' | 'lg') - default: 'md'
- `maxDisplay`: Max avatars to show in group mode - default: 3

**Usage:**
```tsx
// Single person
<PersonAvatarGroup
  people={[person]}
  type="single"
  size="md"
/>

// Couple (side by side with gap-2)
<PersonAvatarGroup
  people={[bride, groom]}
  type="couple"
  size="md"
/>

// Group (overlapping with +N more indicator)
<PersonAvatarGroup
  people={godparents}
  type="group"
  size="sm"
  maxDisplay={3}
/>
```

**Layout:**
- **Single**: One circular avatar with tooltip
- **Couple**: Two avatars side by side with gap-2 spacing
- **Group**: Overlapping avatars with z-index stacking, "+N more" indicator if count > maxDisplay

---

### ClearableSearchInput
**Path:** `src/components/clearable-search-input.tsx`

**Purpose:** Search input with search icon on left and clear button (X) on right. Used in module list views for filtering.

**Key Features:**
- Search icon positioned on left
- Clear button (X) appears when input has value
- Keyboard support: Escape key to clear and blur
- Controlled component (value/onChange props)
- Accessible with aria-label on clear button

**Props:**
- `value`: Current search value (string)
- `onChange`: Value change handler `(value: string) => void`
- `placeholder`: Placeholder text
- `className`: Additional CSS classes (optional)

**Usage:**
```tsx
const [searchValue, setSearchValue] = useState('')

<ClearableSearchInput
  value={searchValue}
  onChange={setSearchValue}
  placeholder="Search by bride or groom name..."
  className="w-full"
/>
```

**Keyboard Handling:**
- **Escape**: Clears input and removes focus
- **Clear button click**: Calls `onChange('')`

---

### ScrollToTopButton
**Path:** `src/components/scroll-to-top-button.tsx`

**Purpose:** Floating button that appears after scrolling down, scrolls to top on click. Used in module list views with long tables.

**Key Features:**
- Fixed position (bottom-right, 16px from edges)
- Only appears when scrolled past threshold (default 300px from `SCROLL_TO_TOP_THRESHOLD`)
- Smooth scroll animation to top
- Fade-in animation (animate-in fade-in duration-200)
- z-index: 40 (below modals, above content)
- Accessible with aria-label

**Props:**
- `threshold`: Scroll position threshold in pixels (optional, default from constants)

**Usage:**
```tsx
// Use default threshold from constants
<ScrollToTopButton />

// Custom threshold
<ScrollToTopButton threshold={500} />
```

**Behavior:**
- Hidden initially and when scrollY < threshold
- Fades in when scrollY > threshold
- Scrolls to top with smooth behavior on click

---

### EndOfListMessage
**Path:** `src/components/end-of-list-message.tsx`

**Purpose:** Displays a message when infinite scrolling has loaded all available items. Used in list views with infinite scroll to indicate there are no more items to load.

**Key Features:**
- Minimal padding (`py-1`) for compact display
- Centered text with muted foreground color
- Accessible with `role="status"` and `aria-live="polite"`
- Conditionally renders based on `show` prop
- Returns `null` when `show` is false (no DOM element)

**Props:**
- `show: boolean` - Whether to display the message (required)
- `className?: string` - Optional additional CSS classes

**Usage:**
```tsx
import { EndOfListMessage } from '@/components/end-of-list-message'

<DataTable
  data={items}
  columns={columns}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
  // ... other props
/>
<EndOfListMessage show={!hasMore && items.length > 0} />
<ScrollToTopButton />
```

**Rendering Logic:**
```typescript
show={!hasMore && items.length > 0}
```

**When it shows:**
- ✅ No more items to load (`!hasMore`)
- ✅ List has at least 1 item (`items.length > 0`)

**When it doesn't show:**
- ❌ More items are available (`hasMore = true`)
- ❌ List is empty (`items.length === 0`)

**Accessibility:**
- `role="status"` - Identifies the message as a status update
- `aria-live="polite"` - Screen readers announce when message appears (after current speech)

**Styling:**
```tsx
className="py-1 text-center text-sm text-muted-foreground"
```

**Related:**
- [INFINITE_SCROLLING.md](./INFINITE_SCROLLING.md) - Complete infinite scroll pattern
- [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md) - List page implementation

---

### AdvancedSearch
**Path:** `src/components/advanced-search.tsx`

**Purpose:** Reusable collapsible component for advanced search filters including status, sort, and date range filters. Encapsulates the collapsible pattern used across all module list views.

**Key Features:**
- Collapsible section with rotating chevron indicator
- Composable: Show only the filters you need (status, sort, date range)
- Consistent UX across all modules
- Ghost button trigger with "Advanced" label
- Smooth CollapsibleContent animation

**Props:**
- `statusFilter`: Optional status filter configuration
  - `value`: Current status value
  - `onChange`: Status change handler
  - `statusValues`: Array of valid status values
- `sortFilter`: Optional sort dropdown configuration
  - `value`: Current sort value
  - `onChange`: Sort change handler
  - `sortOptions`: Array of `{value, label}` sort options
- `dateRangeFilter`: Optional date range filter configuration
  - `startDate`: Start date (Date | undefined)
  - `endDate`: End date (Date | undefined)
  - `onStartDateChange`: Start date change handler
  - `onEndDateChange`: End date change handler
- `defaultOpen`: Whether collapsible is open by default (default: false)

**Usage:**
```tsx
<AdvancedSearch
  statusFilter={{
    value: selectedStatus,
    onChange: (value) => updateFilter('status', value),
    statusValues: MODULE_STATUS_VALUES
  }}
  sortFilter={{
    value: selectedSort,
    onChange: (value) => updateFilter('sort', value),
    sortOptions: STANDARD_SORT_OPTIONS
  }}
  dateRangeFilter={{
    startDate: startDate,
    endDate: endDate,
    onStartDateChange: (date) => {
      setStartDate(date)
      updateFilter('start_date', date ? toLocalDateString(date) : '')
    },
    onEndDateChange: (date) => {
      setEndDate(date)
      updateFilter('end_date', date ? toLocalDateString(date) : '')
    }
  }}
/>
```

**Notes:**
- Component returns null if no filters are provided
- All filters are optional - only render what you need
- Uses `STANDARD_SORT_OPTIONS` from constants for consistent sort options across modules

---

### ModuleStatusLabel
**Path:** `src/components/module-status-label.tsx`

**Purpose:** Display status badges for modules, masses, and mass intentions with appropriate styling and labels.

**Key Features:**
- Supports three status types: module, mass, mass-intention
- Bilingual labels (English/Spanish)
- Automatic color/variant selection based on status
- Fallback to default status if none provided

**Props:**
- `status`: Status string (optional, defaults to type-specific default)
- `statusType`: Type of status ('module' | 'mass' | 'mass-intention')
- `variant`: Override badge variant (optional)
- `className`: Additional CSS classes

**Usage:**
```tsx
// Module status (weddings, funerals, etc.)
<ModuleStatusLabel status="ACTIVE" statusType="module" />
<ModuleStatusLabel status="COMPLETED" statusType="module" />

// Mass status
<ModuleStatusLabel status="SCHEDULED" statusType="mass" />
<ModuleStatusLabel status="CANCELLED" statusType="mass" />

// Mass intention status
<ModuleStatusLabel status="CONFIRMED" statusType="mass-intention" />
<ModuleStatusLabel status="FULFILLED" statusType="mass-intention" />
```

**Status Variants:**
- Module: ACTIVE (default), INACTIVE (secondary), COMPLETED (outline)
- Mass: PLANNING (secondary), SCHEDULED (default), COMPLETED (outline), CANCELLED (destructive)
- Mass Intention: REQUESTED (secondary), CONFIRMED (default), FULFILLED (outline), CANCELLED (destructive)

---

### ReadingCategoryLabel
**Path:** `src/components/reading-category-label.tsx`

**Purpose:** Display reading category labels for liturgical readings.

---

### ErrorDisplay
**Path:** `src/components/error-display.tsx`

**Purpose:** Standardized error message display component.

---

### Loading
**Path:** `src/components/loading.tsx`

**Purpose:** Unified loading component with multiple variants for all loading states across the application.

**Variants:**
- `spinner` (default) - Spinning loader with optional message (for client-side loading, dialogs, inline indicators)
- `route` - Full page layout skeleton with search bar + card grid (for Next.js `loading.tsx` files)
- `skeleton-cards` - Card grid skeleton
- `skeleton-list` - List items skeleton
- `skeleton-table` - Table with search bar skeleton

**Usage:**
```tsx
// Route-level loading (in loading.tsx files)
<Loading variant="route" />

// Client-side spinner
<Loading size="md" message="Loading..." />

// Skeleton states
<Loading variant="skeleton-cards" />
```

---

### ModuleViewPanel
**Path:** `src/components/module-view-panel.tsx`

**Purpose:** Reusable side panel for module view pages with a consistent 4-section structure: Actions, Export, Details, and Delete.

**Structure:**
The sidebar is organized into 4 sections:
1. **Actions** - Edit button, Print View button
2. **Export** - Download PDF, Download Word
3. **Details** - Status, Template Selector (if provided), Location (if available), Created date
4. **Delete** - Delete button (if onDelete provided)

**Props:**
- `entity`: Entity being viewed (must have id, status, created_at)
- `entityType`: Display name (e.g., "Wedding", "Funeral")
- `modulePath`: URL path (e.g., "weddings", "funerals")
- `mainEvent`: Optional event for location display
- `generateFilename`: Function to generate download filenames
- `printViewPath`: Optional custom print path (defaults to `/print/${modulePath}/${entity.id}`)
- `statusType`: Status label type ('module' | 'mass' | 'mass-intention'), defaults to 'module'
- `templateConfig`: Optional template selector configuration
  - `currentTemplateId`: Current template ID
  - `templates`: Template registry
  - `templateFieldName`: Database field name (e.g., 'wedding_template_id')
  - `defaultTemplateId`: Default template ID
  - `onUpdateTemplate`: Save handler function
- `onDelete`: Optional delete handler (shows Delete section if provided)

**Usage:**
```tsx
<ModuleViewPanel
  entity={wedding}
  entityType="Wedding"
  modulePath="weddings"
  mainEvent={wedding.wedding_event}
  generateFilename={(ext) => `${brideLastName}-${groomLastName}-${date}.${ext}`}
  templateConfig={{
    currentTemplateId: wedding.wedding_template_id,
    templates: WEDDING_TEMPLATES,
    templateFieldName: 'wedding_template_id',
    defaultTemplateId: 'wedding-full-script-english',
    onUpdateTemplate: handleUpdateTemplate,
  }}
  onDelete={deleteWedding}
/>
```

---

### ModuleViewContainer
**Path:** `src/components/module-view-container.tsx`

**Purpose:** Complete view page container with side panel + liturgy content. Uses callback pattern for module-specific logic.

**Props:**
- `entity`: Entity with relations
- `entityType`: Display name
- `modulePath`: URL path
- `mainEvent`: Optional event
- `generateFilename`: Filename generator function
- `buildLiturgy`: Liturgy builder function
- `getTemplateId`: Template ID extractor function
- `printViewPath`: Optional custom print path

**Usage:**
```tsx
<ModuleViewContainer
  entity={wedding}
  entityType="Wedding"
  modulePath="weddings"
  mainEvent={wedding.wedding_event}
  generateFilename={(ext) => `wedding-${wedding.id}.${ext}`}
  buildLiturgy={buildWeddingLiturgy}
  getTemplateId={(w) => w.wedding_template_id || 'default'}
/>
```

---

### EventDisplay
**Path:** `src/components/event-display.tsx`

**Purpose:** Display event date, time, and location in a formatted card.

**Props:**
- `event`: Event object with start_date, start_time, location

---

### PetitionEditor
**Path:** `src/components/petition-editor.tsx`

**Purpose:** Editor for liturgical petitions with template insertion.

**Props:**
- `value`: Current petitions text
- `onChange`: Change handler
- `templates`: Array of petition templates
- `onInsertTemplate`: Template insertion handler

---

## Group Components

### GroupFormDialog
**Path:** `src/components/groups/group-form-dialog.tsx`

**Purpose:** Dialog for creating/editing liturgical ministry groups.

**Key Features:**
- Inline group creation/editing
- Group name and description
- Role assignment
- Member management
- Used in Groups module (dialog-based architecture)

---

