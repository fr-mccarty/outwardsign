# Component Registry

A comprehensive catalog of reusable components in the Outward Sign application. This registry helps AI agents and developers quickly discover components without reading source code.

---

## 🔴 Before Using Components

**CRITICAL:** When working with components, always consult the category-specific documentation files for complete details including props, usage examples, and best practices.

---

## Component Categories

### Form Components
**File:** [COMPONENTS_FORM.md](./COMPONENTS_FORM.md)

Components for building forms including input fields, buttons, date pickers, and form management hooks.

**Key Components:**
- `FormInput` - All-in-one form field (no validation)
- `FormField` - All-in-one form field with validation support
- `DatePickerField` - Calendar date picker
- `CalendarEventField` - Date/time/location picker for calendar_event input type fields (creates calendar_events records)
- `CalendarEventFieldView` - Display version of CalendarEventField for view pages
- `SaveButton`, `CancelButton`, `DeleteButton` - Form action buttons
- `EventFormFields` - Reusable event form fields
- `usePickerState` - Picker state management hook
- `useListFilters` - List view filter management hook

---

### Picker Component Wrappers
**File:** [COMPONENTS_PICKER_WRAPPERS.md](./COMPONENTS_PICKER_WRAPPERS.md)

Modal pickers and field wrappers for selecting entities (people, events, locations, readings, etc.).

**🔴 CRITICAL:** Always use wrapper components (`PersonPickerField`, `EventPickerField`, `LocationPickerField`) instead of direct picker components.

**Key Components:**
- `PersonPickerField` - Select person with inline creation
- `EventPickerField` - Select event with inline creation
- `LocationPickerField` - Select location with inline creation
- `MassPickerField` - Select mass
- `LiturgicalEventPickerField` - Select liturgical calendar event
- `PeoplePicker`, `EventPicker`, `LocationPicker` - Base pickers (use wrappers instead)

**See Also:**
- [PICKERS.md](./PICKERS.md) - Picker architecture and creating new pickers
- [PICKER_PATTERNS.md](./PICKER_PATTERNS.md) - Critical behavioral rules
- [PICKER_EDIT_MODE.md](./PICKER_EDIT_MODE.md) - Inline editing pattern

---

### Layout & Navigation Components
**File:** [COMPONENTS_LAYOUT.md](./COMPONENTS_LAYOUT.md)

Components for page structure, navigation, breadcrumbs, and context providers.

**Key Components:**
- `PageContainer` - Standard page wrapper
- `BreadcrumbSetter` - Set breadcrumbs from server components
- `MainSidebar` - Application navigation sidebar
- `MainHeader` - Application header with breadcrumbs
- `BreadcrumbContext` - Breadcrumb state management
- `ThemeProvider` - Dark mode support

---

### Display Components
**File:** [COMPONENTS_DISPLAY.md](./COMPONENTS_DISPLAY.md)

Components for displaying data including cards, badges, avatars, and status labels.

**Card Components:**
- `ContentCard` - Simple card wrapper with p-6 padding
- `EmptyState` - Empty list state display (use instead of custom empty states)
- `FormSectionCard` - Card with title/description header for forms
- `SearchCard` - Compact card for search/filter sections

**Key Components:**
- `ListViewCard` - Entity display card for list views (being deprecated)
- `ListStatsBar` - Stats/metrics bar for list views
- `PersonAvatarGroup` - Avatar display for people
- `ClearableSearchInput` - Search input with clear button
- `ScrollToTopButton` - Floating scroll-to-top button
- `EndOfListMessage` - Message when infinite scroll reaches end
- `AdvancedSearch` - Collapsible advanced search filters
- `SystemTypeFilter` - Filter dropdown for system types (mass, special-liturgy, sacrament, event)
- `ModuleStatusLabel` - Status badges for modules
- `ModuleViewPanel` - Side panel for view pages
- `ModuleViewContainer` - Complete view page container
- `PeopleEventAssignmentSection` - Template-level person assignments (calendar_event_id = NULL)
- `CalendarEventAssignmentSection` - Occurrence-level person assignments (per calendar event)

---

### Data Table System
**File:** [COMPONENTS_DATA_TABLE.md](./COMPONENTS_DATA_TABLE.md)

Table components for displaying tabular data with sorting and responsive features.

**Key Components:**
- `DataTable` - Main data table component
- `DataTableEmpty` - Empty state for tables
- `DataTableHeader` - Table header with search
- `DataTableActions` - Row action buttons

---

### Calendar Components
**File:** [COMPONENTS_CALENDAR.md](./COMPONENTS_CALENDAR.md)

Calendar view components for displaying parish events and liturgical calendar.

**Key Components:**
- `Calendar` - Main calendar container
- `MiniCalendar` - Small calendar widget
- `LiturgicalEventPreview` - Liturgical event details modal

---

### Wizard Components
**File:** [COMPONENTS_WIZARD.md](./COMPONENTS_WIZARD.md)

Multi-step wizard components for complex workflows.

**Key Components:**
- `Wizard` - Main wizard container
- `WizardSteps` - Step indicator/progress bar
- `WizardNavigation` - Next/back buttons
- `LiturgicalReadingsWizard` - Readings selection wizard

---

### UI Components (shadcn/ui)
**File:** [COMPONENTS_UI.md](./COMPONENTS_UI.md)

Quick reference to shadcn/ui components used in the application.

**🔴 CRITICAL:** Components in `src/components/ui/` should **NEVER be edited directly**. Create wrapper components for customization.

**Key Components:**
- `Button`, `Dialog`, `Card`, `Popover`, `DropdownMenu`
- `Input`, `Textarea`, `Select`, `Checkbox`, `Calendar`
- `Badge`, `Alert`, `Toast`, `Skeleton`, `Avatar`
- `Table`, `Tooltip`, `Accordion`, `Tabs`

---

## Component Discovery

### By Use Case

**Building Forms:**
1. Read [FORMS.md](./FORMS.md) for form patterns
2. Use [COMPONENTS_FORM.md](./COMPONENTS_FORM.md) for form components
3. Use [COMPONENTS_PICKER_WRAPPERS.md](./COMPONENTS_PICKER_WRAPPERS.md) for entity selection

**Building List Views:**
1. Read [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md) for complete pattern
2. Use [COMPONENTS_DISPLAY.md](./COMPONENTS_DISPLAY.md) for display components
3. Use [COMPONENTS_DATA_TABLE.md](./COMPONENTS_DATA_TABLE.md) for tables

**Building View Pages:**
1. Read [MODULE_VIEW_CONTAINER_PATTERN.md](./MODULE_VIEW_CONTAINER_PATTERN.md)
2. Use [COMPONENTS_DISPLAY.md](./COMPONENTS_DISPLAY.md) for `ModuleViewContainer`

**Building Wizards:**
1. Read [MASS_SCHEDULING.md](./MASS_SCHEDULING.md) for wizard example
2. Use [COMPONENTS_WIZARD.md](./COMPONENTS_WIZARD.md) for wizard components

---

## Quick Reference

### Most Used Components

1. **FormField** - Use for all form inputs with validation ([COMPONENTS_FORM.md](./COMPONENTS_FORM.md))
2. **PersonPickerField** - Select person ([COMPONENTS_PICKER_WRAPPERS.md](./COMPONENTS_PICKER_WRAPPERS.md))
3. **EventPickerField** - Select event ([COMPONENTS_PICKER_WRAPPERS.md](./COMPONENTS_PICKER_WRAPPERS.md))
4. **DataTable** - Display tabular data ([COMPONENTS_DATA_TABLE.md](./COMPONENTS_DATA_TABLE.md))
5. **ModuleViewContainer** - Module view pages ([COMPONENTS_DISPLAY.md](./COMPONENTS_DISPLAY.md))

### Hooks

- **usePickerState** - Manage picker state ([COMPONENTS_FORM.md](./COMPONENTS_FORM.md))
- **useListFilters** - Manage list view filters ([COMPONENTS_FORM.md](./COMPONENTS_FORM.md))
- **useAvatarUrls** - Fetch avatar signed URLs ([COMPONENTS_FORM.md](./COMPONENTS_FORM.md))

---

## See Also

- **[FORMS.md](./FORMS.md)** - Form patterns, validation, styling requirements
- **[VALIDATION.md](./VALIDATION.md)** - React Hook Form + Zod validation patterns
- **[PICKERS.md](./PICKERS.md)** - Picker architecture and patterns
- **[LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md)** - List page implementation pattern
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Application architecture and component communication

---
