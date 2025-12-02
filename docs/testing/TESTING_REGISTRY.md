# Testing Registry

> **Purpose:** Complete registry of all end-to-end tests with brief descriptions.
>
> **See Also:**
> - **[TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md)** - Quick setup and run commands
> - **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive guide for writing tests
> - **[TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)** - Testability standards and best practices

This document provides a complete reference of all test files and individual tests in the Outward Sign application, with one-sentence descriptions of what each test verifies.

---

## Table of Contents

- [Authentication & Onboarding](#authentication--onboarding)
- [Permissions & Authorization](#permissions--authorization)
- [Sacrament Modules](#sacrament-modules)
  - [Weddings](#weddings)
  - [Funerals](#funerals)
  - [Baptisms](#baptisms)
  - [Quinceaneras](#quinceaneras)
  - [Presentations](#presentations)
- [Liturgical Modules](#liturgical-modules)
  - [Masses](#masses)
  - [Mass Intentions](#mass-intentions)
  - [Mass Role Templates](#mass-role-templates)
- [Supporting Modules](#supporting-modules)
  - [People](#people)
  - [Locations](#locations)
  - [Events](#events)
  - [Readings](#readings)
  - [Groups & Membership](#groups--membership)
- [Picker Components](#picker-components)
  - [Person Picker](#person-picker)
  - [Event Picker](#event-picker)
  - [Mass Picker](#mass-picker)
  - [Date Picker](#date-picker)
- [Application Features](#application-features)
  - [Dashboard](#dashboard)
  - [Calendar](#calendar)
  - [Parish Settings](#parish-settings)
- [Test Templates](#test-templates)

---

## Authentication & Onboarding

### `tests/signup.spec.ts` (3 tests)

**Module:** Signup Flow

| Test | Description |
|------|-------------|
| should sign up a new user and redirect to onboarding | Verifies new user registration creates account and navigates to onboarding flow |
| should show error for invalid credentials | Validates error handling when signup credentials are invalid |
| should navigate from home to signup | Confirms navigation path from homepage to signup page works correctly |

### `tests/login.spec.ts` (7 tests)

**Module:** Login Flow

| Test | Description |
|------|-------------|
| should login with valid credentials and redirect to dashboard | Verifies successful login with valid credentials navigates to dashboard |
| should show error for invalid credentials | Validates error message displays when login credentials are incorrect |
| should show error for empty email | Confirms browser validation prevents submission without email |
| should show error for empty password | Confirms browser validation prevents submission without password |
| should navigate from home to login | Verifies navigation path from homepage to login page works correctly |
| should navigate from login to signup | Confirms navigation from login page to signup page via link |
| should show loading state during login | Validates loading state (button text changes) displays during authentication |

---

## Permissions & Authorization

### `tests/permissions.spec.ts` (16 tests)

**Module:** Role-Based Access Control

| Test | Description |
|------|-------------|
| admin should see all modules in sidebar | Verifies admin users see all module navigation links in the sidebar |
| staff should see all modules in sidebar | Verifies staff users see all module navigation links in the sidebar |
| ministry-leader should only see enabled modules in sidebar | Validates ministry-leaders only see navigation links for their enabled modules |
| ministry-leader with multiple modules should see all enabled modules | Confirms ministry-leaders with multiple enabled modules see all their assigned modules |
| parishioner should not see any modules in sidebar | Validates parishioners do not see any module navigation links |
| admin can access all module URLs | Verifies admin users can directly navigate to all module URLs |
| staff can access all module URLs | Verifies staff users can directly navigate to all module URLs |
| ministry-leader can only access enabled module URLs | Validates ministry-leaders are redirected when accessing disabled module URLs |
| ministry-leader cannot access specific record URLs for disabled modules | Confirms ministry-leaders cannot access individual records in disabled modules |
| parishioner cannot access any module URLs | Validates parishioners are redirected when attempting to access any module URL |
| ministry-leader with multiple modules can access all enabled URLs | Verifies ministry-leaders with multiple enabled modules can access all assigned module URLs |
| ministry-leader can access create page for enabled modules | Confirms ministry-leaders can access create pages for their enabled modules |
| ministry-leader cannot access create page for disabled modules | Validates ministry-leaders are redirected when accessing create pages for disabled modules |
| parishioner cannot access create pages | Confirms parishioners are redirected when attempting to access any create page |
| ministry-leader can access edit page for enabled modules | Verifies ministry-leaders can access edit pages for their enabled modules |
| ministry-leader cannot access edit page for disabled modules | Validates ministry-leaders are redirected when accessing edit pages for disabled modules |
| only admin can access parish settings | Confirms only admin users can access parish settings page |
| staff cannot access parish settings | Validates staff users cannot access parish settings and don't see link in sidebar |
| ministry-leader cannot access parish settings | Confirms ministry-leaders cannot access parish settings and don't see link in sidebar |
| dashboard should show error message when permission denied | Verifies dashboard displays error message when user is redirected due to insufficient permissions |

### `tests/permissions-server-actions.spec.ts` (12 tests)

**Module:** Server Action Authorization

| Test | Description |
|------|-------------|
| ministry-leader with weddings enabled can create wedding | Verifies ministry-leaders with weddings module can successfully create wedding records |
| ministry-leader without weddings enabled cannot create wedding | Validates ministry-leaders without weddings module are blocked from creating wedding records |
| parishioner cannot create wedding | Confirms parishioners are blocked from creating wedding records |
| ministry-leader with weddings enabled can update wedding | Verifies ministry-leaders with weddings module can successfully update wedding records |
| ministry-leader without weddings enabled cannot update wedding | Validates ministry-leaders without weddings module are blocked from updating wedding records |
| ministry-leader with weddings enabled can delete wedding | Confirms ministry-leaders with weddings module can successfully delete wedding records |
| ministry-leader with funerals enabled can create funeral | Verifies ministry-leaders with funerals module can successfully create funeral records |
| ministry-leader without funerals enabled cannot create funeral | Validates ministry-leaders without funerals module are blocked from creating funeral records |
| ministry-leader with funerals enabled can update funeral | Confirms ministry-leaders with funerals module can successfully update funeral records |
| ministry-leader without funerals enabled cannot update funeral | Validates ministry-leaders without funerals module are blocked from updating funeral records |
| ministry-leader can only access their enabled modules | Verifies ministry-leaders can access enabled modules but are redirected for disabled modules |

### `tests/parish-isolation.spec.ts` (11 tests)

**Module:** Parish Data Isolation

| Test | Description |
|------|-------------|
| should isolate weddings by parish | Verifies users from Parish B cannot see or access wedding records from Parish A |
| should isolate funerals by parish | Validates users from Parish B cannot see or access funeral records from Parish A |
| should isolate baptisms by parish | Confirms users from Parish B cannot see or access baptism records from Parish A |
| should isolate presentations by parish | Verifies users from Parish B cannot see or access presentation records from Parish A |
| should isolate quinceaneras by parish | Validates users from Parish B cannot see or access quinceanera records from Parish A |
| should isolate masses by parish | Confirms users from Parish B cannot see or access mass records from Parish A |
| should isolate mass intentions by parish | Verifies users from Parish B cannot see or access mass intention records from Parish A |
| should isolate people by parish | Validates users from Parish B cannot see or access people records from Parish A |
| should isolate events by parish | Confirms users from Parish B cannot see or access event records from Parish A |
| should isolate locations by parish | Verifies users from Parish B cannot see or access location records from Parish A |
| should isolate readings by parish | Validates users from Parish B cannot see or access reading records from Parish A |

---

## Sacrament Modules

### Weddings

#### `tests/weddings.spec.ts` (5 tests)

**Module:** Weddings Module

| Test | Description |
|------|-------------|
| should create, view, edit, and verify print view for a wedding | End-to-end test covering full CRUD workflow plus print view verification |
| should show empty state when no weddings exist | Validates empty state message displays when wedding list is empty |
| should create wedding with minimal data | Confirms wedding creation succeeds with only required fields |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across wedding pages |
| should display action buttons on wedding view page | Validates Edit, Copy Info, Print, PDF, and Word buttons appear on view page |

### Funerals

#### `tests/funerals.spec.ts` (5 tests)

**Module:** Funerals Module

| Test | Description |
|------|-------------|
| should create, view, edit, and verify print view for a funeral | End-to-end test covering full CRUD workflow plus print view verification |
| should show empty state when no funerals exist | Validates empty state message displays when funeral list is empty |
| should create funeral with minimal data | Confirms funeral creation succeeds with only required fields |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across funeral pages |
| should display action buttons on funeral view page | Validates Edit, Copy Info, Print, PDF, and Word buttons appear on view page |

### Baptisms

#### `tests/baptisms.spec.ts` (5 tests)

**Module:** Baptisms Module

| Test | Description |
|------|-------------|
| should create, view, edit, and verify print view for a baptism | End-to-end test covering full CRUD workflow plus print view verification |
| should show empty state when no baptisms exist | Validates empty state message displays when baptism list is empty |
| should create baptism with minimal data | Confirms baptism creation succeeds with only required fields |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across baptism pages |
| should display action buttons on baptism view page | Validates Edit, Copy Info, Print, PDF, and Word buttons appear on view page |

### Quinceaneras

#### `tests/quinceaneras.spec.ts` (5 tests)

**Module:** Quinceaneras Module

| Test | Description |
|------|-------------|
| should create, view, edit, and verify print view for a quinceanera | End-to-end test covering full CRUD workflow plus print view verification |
| should show empty state when no quinceaneras exist | Validates empty state message displays when quinceanera list is empty |
| should create quinceanera with minimal data | Confirms quinceanera creation succeeds with only required fields |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across quinceanera pages |
| should display action buttons on quinceanera view page | Validates Edit, Copy Info, Print, PDF, and Word buttons appear on view page |

### Presentations

#### `tests/presentation.spec.ts` (5 tests)

**Module:** Presentations Module

| Test | Description |
|------|-------------|
| should create, view, edit, and verify print view for a presentation | End-to-end test covering full CRUD workflow plus print view verification |
| should show empty state when no presentations exist | Validates empty state message displays when presentation list is empty |
| should create presentation with minimal data | Confirms presentation creation succeeds with only required fields |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across presentation pages |
| should display action buttons on presentation view page | Validates Edit, Copy Info, Print, PDF, and Word buttons appear on view page |

---

## Liturgical Modules

### Masses

#### `tests/masses.spec.ts` (6 tests)

**Module:** Masses Module

| Test | Description |
|------|-------------|
| should create, view, edit, and verify print view for a mass | End-to-end test covering full CRUD workflow plus print view verification |
| should show empty state when no masses exist | Validates empty state message displays when mass list is empty |
| should create mass with minimal data | Confirms mass creation succeeds with only required fields |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across mass pages |
| should display action buttons on mass view page | Validates Edit, Copy Info, Print, PDF, and Word buttons appear on view page |
| should create mass with new event and new location via nested pickers | Validates creating mass with inline event and location creation using nested picker modals |

### Mass Intentions

#### `tests/mass-intentions.spec.ts` (9 tests)

**Module:** Mass Intentions Module

| Test | Description |
|------|-------------|
| should create, view, edit, and verify print view for a mass intention | End-to-end test covering full CRUD workflow plus print view verification |
| should show empty state when no mass intentions exist | Validates empty state message displays when mass intention list is empty |
| should create mass intention with minimal data | Confirms mass intention creation succeeds with only required fields |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across mass intention pages |
| should display action buttons on mass intention view page | Validates Edit, Copy Info, Print, PDF, and Word buttons appear on view page |
| should filter mass intentions by status | Verifies status filter dropdown correctly filters mass intentions by their status |
| should search for mass intentions | Validates search functionality finds mass intentions by text content |
| should handle stipend field with dollar formatting | Confirms stipend input accepts and displays monetary values with proper formatting |
| should handle date fields correctly | Validates date picker fields work correctly for mass intention dates |

### Mass Role Templates

#### `tests/mass-role-templates.spec.ts` (7 tests)

**Module:** Mass Role Templates Module

| Test | Description |
|------|-------------|
| should create, view, edit with persistence verification | End-to-end test verifying template CRUD with explicit persistence checks |
| should create template with minimal data | Confirms template creation succeeds with only required name field |
| should show empty state when no templates exist | Validates empty state message displays when template list is empty |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across template pages |
| should validate required fields | Confirms form validation prevents submission without required name field |
| should update only name field and persist change | Validates updating just the name field saves correctly and persists across page reloads |
| should update only description field and persist change | Validates updating just the description field saves correctly and persists across page reloads |

---

## Supporting Modules

### People

#### `tests/people.spec.ts` (5 tests)

**Module:** People Module

| Test | Description |
|------|-------------|
| should create, view, edit, and delete a person | End-to-end test covering full CRUD workflow including deletion |
| should show empty state when no people exist | Validates empty state message displays when people list is empty |
| should validate required fields on create | Confirms form validation prevents submission without required first and last name |
| should filter people by search | Verifies search functionality finds people by name or email |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across people pages |

### Locations

#### `tests/locations.spec.ts` (5 tests)

**Module:** Locations Module

| Test | Description |
|------|-------------|
| should create, view, and edit a location | End-to-end test covering create, view, and edit workflows for locations |
| should show empty state when no locations exist | Validates empty state message displays when location list is empty |
| should validate required fields on create | Confirms form validation prevents submission without required name field |
| should filter locations by search | Verifies search functionality finds locations by name |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across location pages |

### Events

#### `tests/events.spec.ts` (8 tests)

**Module:** Events Module - Standalone Events

| Test | Description |
|------|-------------|
| should create a standalone event (MEETING type) with no module references | Verifies creating standalone meeting event not linked to any sacrament module |
| should create standalone EVENT type event | Validates creating generic standalone event of EVENT type |
| should export standalone event to PDF and Word | Confirms PDF and Word export downloads work for standalone events |
| should show events list and filter standalone events | Verifies event list displays and filters work for standalone events |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across event pages |
| should show empty state when no events exist | Validates empty state message displays when event list is empty |
| should validate required fields on create | Confirms form validation prevents submission without required event name and type |
| should create event and verify print view | Validates event creation and print view page displays correctly |

### Readings

#### `tests/readings.spec.ts` (5 tests)

**Module:** Readings Module

| Test | Description |
|------|-------------|
| should create, view, edit, and delete a reading | End-to-end test covering full CRUD workflow including deletion |
| should filter readings by search, language, and category | Verifies multiple filter controls (search, language dropdown, category dropdown) work correctly |
| should show empty state when no readings exist | Validates empty state message displays when readings list is empty |
| should validate required fields on create | Confirms form validation prevents submission without required title and content |
| should navigate through breadcrumbs | Verifies breadcrumb navigation works correctly across readings pages |

### Groups & Membership

#### `tests/groups-membership.spec.ts` (18 tests)

**Module:** Group Membership - Add Member Tests (7 tests)

| Test | Description |
|------|-------------|
| TC-001: Add member with single role | Verifies adding a person to a group with one liturgical role (Lector) |
| TC-002: Add member with Cantor role | Validates adding a member specifically with the Cantor role |
| TC-003: Add member with no roles | Confirms member can be added without assigning any liturgical roles |
| TC-004: Cannot add member without selecting person | Validates form validation prevents adding member without selecting a person |
| TC-005: Create new person from add member modal | Verifies inline person creation from the add member modal works and auto-selects created person |
| TC-014: Cannot add duplicate member | Confirms system prevents adding the same person to a group twice |
| TC-015: Empty group state displays correctly | Validates empty state message and "Add First Member" button appear for empty groups |

**Module:** Group Membership - Edit Roles Tests (5 tests, all skipped)

| Test | Description |
|------|-------------|
| TC-006: Edit roles - add additional roles | Verifies adding more roles to an existing member persists correctly |
| TC-007: Edit roles - remove roles | Validates removing some roles from a member while keeping others works |
| TC-008: Edit roles - remove all roles | Confirms removing all roles from a member leaves them in group with no roles |
| TC-009: Cancel editing member roles | Verifies canceling role edit discards changes and preserves original roles |

**Module:** Group Membership - Remove Member Tests (2 tests)

| Test | Description |
|------|-------------|
| TC-010: Remove member from group | Validates removing a member from the group with confirmation dialog |
| TC-011: Cancel removing member | Confirms canceling member removal keeps the member in the group |

**Module:** Group Membership - Role Constants Tests (1 test, skipped)

| Test | Description |
|------|-------------|
| TC-012: All liturgical roles are available | Verifies all seven mass roles (Lector, EMHC, Altar Server, Cantor, Usher, Sacristan, Music Minister) appear with English and Spanish labels |

**Module:** Group Membership - Accessibility Tests (2 tests, both skipped)

| Test | Description |
|------|-------------|
| TC-016: Keyboard navigation | Validates keyboard controls (Tab, Space, Escape) work for role selection and modal interaction |
| TC-017: Screen reader labels | Confirms all form controls have proper labels for screen reader accessibility |

**Module:** Group Membership - Performance Tests (1 test, skipped)

| Test | Description |
|------|-------------|
| TC-018: Large group performance | Verifies page load and interaction performance with 50+ members in a group |

---

## Picker Components

### Person Picker

#### `tests/person-picker.spec.ts` (7 tests)

**Module:** Person Picker Component

| Test | Description |
|------|-------------|
| should open picker, search for existing person, and select | Verifies opening picker modal, searching for person by name, and selecting them |
| should create new person inline and auto-select | Validates creating a new person within picker modal auto-selects them and closes modal without navigation |
| should show empty state when no people match search | Confirms empty state message displays when search query matches no people |
| should allow clearing selection and reselecting different person | Verifies user can clear selected person and choose a different one |
| should validate required fields when creating person inline | Confirms inline person creation form validates required fields (first/last name) |
| should preserve form context when using picker (no navigation away) | Critical test ensuring picker modal doesn't navigate away from parent form, preserving unsaved work |
| should reopen picker in edit mode when clicking on selected person field | Validates clicking on selected person display box reopens picker in edit mode with person's data pre-filled |

### Event Picker

#### `tests/event-picker.spec.ts` (5 tests)

**Module:** Event Picker Component

| Test | Description |
|------|-------------|
| should create event with existing location using nested location picker | Verifies creating event via picker while selecting existing location from nested location picker |
| should create event and location inline via nested pickers | Validates creating both event and location inline using nested picker modals (location picker within event picker) |
| should preserve wedding form context when using nested pickers | Critical test ensuring nested pickers don't navigate away from parent wedding form |
| should allow selecting existing location in event creation | Verifies selecting pre-existing location when creating event via picker modal |
| should show validation error when creating event without required fields | Confirms inline event creation form validates required fields (event name, type, date) |

### Mass Picker

#### `tests/mass-picker.spec.ts` (5 tests)

**Module:** Mass Picker Component

| Test | Description |
|------|-------------|
| should open and close mass picker from mass intention form | Verifies picker modal opens from mass intention form, loads correctly, and closes without selection |
| should select existing mass from picker | Validates browsing and selecting an existing mass from picker and confirming selection appears in parent form |
| should display masses in picker | Confirms picker loads and displays mass cards from the database with correct count |
| should clear selected mass | Verifies user can clear a selected mass using the X button and field returns to empty state |
| should preserve mass intention form context when using mass picker | Critical test ensuring picker doesn't navigate away or lose parent form data when selecting a mass |

### Date Picker

#### `tests/date-picker.spec.ts` (8 tests)

**Module:** DatePickerField Component

| Test | Description |
|------|-------------|
| should display date picker with placeholder | Verifies date picker button shows placeholder text when no date is selected |
| should open calendar popover when clicked | Validates calendar popover opens with month navigation when button is clicked |
| should display selected date correctly without timezone shift | Critical test verifying selected date displays correctly without UTC timezone shift bug |
| should pass selected date to URL correctly | Confirms selected date is correctly converted to YYYY-MM-DD format in URL parameters |
| should only enable Sundays for weekend summary | Validates date picker correctly enables/disables dates based on `disabled` callback prop |
| should close calendar after selecting date when closeOnSelect is true | Verifies calendar closes automatically when `closeOnSelect` prop is enabled |
| should handle date selection near midnight correctly | Edge case test ensuring date selection works correctly near midnight in any timezone |

---

## Application Features

### Dashboard

#### `tests/dashboard.spec.ts` (19 tests)

**Module:** Dashboard

| Test | Description |
|------|-------------|
| should load dashboard page with all sections | Verifies dashboard loads with all major sections (stats, sacrament breakdown, quick access, upcoming, recent activity, calendar) |
| should display sacrament type breakdown | Validates sacrament breakdown section shows counts by type (weddings, funerals, etc.) |
| should navigate to weddings from sacrament breakdown | Confirms clicking weddings link in breakdown navigates to weddings list |
| should navigate to funerals from sacrament breakdown | Confirms clicking funerals link in breakdown navigates to funerals list |
| should display quick access links | Verifies quick access section displays "Create New" buttons for all sacrament types |
| should navigate to create wedding from quick access | Validates clicking "Create Wedding" quick access button navigates to wedding creation form |
| should navigate to create funeral from quick access | Validates clicking "Create Funeral" quick access button navigates to funeral creation form |
| should navigate to create presentation from quick access | Validates clicking "Create Presentation" quick access button navigates to presentation creation form |
| should navigate to create quinceanera from quick access | Validates clicking "Create Quinceanera" quick access button navigates to quinceanera creation form |
| should show upcoming celebrations or empty state | Verifies upcoming celebrations section shows events or empty state message |
| should show recent activity or empty state | Validates recent activity section shows recent items or empty state message |
| should display mini calendar | Confirms mini calendar widget displays on dashboard |
| should navigate to event from upcoming celebrations | Verifies clicking event in upcoming celebrations navigates to event detail page |
| should create sacrament and see it in recent activity | Validates newly created sacrament appears in recent activity feed |
| should update statistics after creating sacraments | Confirms stat cards update counts after creating new sacrament records |
| should handle navigation to empty state links | Verifies empty state "Create First" links navigate to correct creation pages |
| should display stat cards with correct labels | Validates all stat cards show with proper labels (Active, Upcoming, etc.) |
| should navigate from dashboard breadcrumb to other pages and back | Confirms breadcrumb navigation to/from dashboard works correctly |

### Calendar

#### `tests/calendar.spec.ts` (10 tests)

**Module:** Calendar Module

| Test | Description |
|------|-------------|
| should load calendar page with month view by default | Verifies calendar page loads initially in month view |
| should switch between calendar views | Validates switching between month, week, and day views works correctly |
| should navigate between months | Confirms prev/next month navigation buttons work correctly |
| should toggle liturgical calendar | Verifies toggling liturgical calendar overlay on/off works |
| should create event and see it on calendar | Validates creating event makes it appear on the calendar view |
| should navigate from calendar to event details | Confirms clicking event on calendar navigates to event detail page |
| should handle month view display correctly | Verifies month view renders all dates correctly including previous/next month overflow |
| should display breadcrumbs | Validates breadcrumb navigation displays correctly on calendar page |
| should persist view selection in URL | Confirms selected view (month/week/day) persists in URL query parameter |
| should handle date parameter in URL | Verifies calendar navigates to specific date when date parameter is in URL |

### Parish Settings

#### `tests/parish-settings.spec.ts` (16 tests)

**Module:** Parish Settings

| Test | Description |
|------|-------------|
| should load parish settings page and display all tabs | Verifies settings page loads with all tabs (Parish Info, Liturgical, Mass Intentions, Members) visible |
| should display parish information and allow updates | Validates parish info form displays current data and accepts updates |
| should validate required fields for parish information | Confirms required field validation works for parish name |
| should update liturgical locale setting | Verifies changing liturgical locale dropdown updates and saves correctly |
| should display and configure mass intention quick amounts | Validates mass intention quick amounts section displays with input fields |
| should add and remove mass intention quick amounts | Confirms adding and removing quick amount slots works correctly |
| should update mass intention quick amount values | Verifies updating quick amount values saves and persists |
| should display parish members tab | Validates parish members tab displays member list |
| should navigate between tabs without losing data | Confirms switching tabs doesn't lose unsaved changes warning |
| should show breadcrumbs on parish settings page | Verifies breadcrumb navigation displays on settings page |
| should display parish details section | Validates parish details section shows all expected fields |
| should handle refresh button correctly | Confirms refresh button reloads parish data from server |
| should prevent removing the last quick amount | Validates system prevents deleting the last remaining quick amount |
| should display quick amount preview badges | Confirms quick amount values display as formatted currency badges |
| should show currency conversion helper text | Verifies helper text for currency conversion displays correctly |
| should show description text for quick amounts | Validates descriptive help text appears for quick amounts section |

---

## Test Templates

### `tests/TEST_TEMPLATE.spec.ts`

**Purpose:** Template file with example test patterns for creating new test files.

| Test | Description |
|------|-------------|
| should create a new record | Example test showing basic record creation pattern |
| should edit an existing record | Example test showing edit workflow pattern |
| should show empty state when no records exist | Example test showing empty state validation pattern |
| should validate required fields | Example test showing form validation pattern |
| should navigate through breadcrumbs | Example test showing breadcrumb navigation pattern |

---

## Test Statistics

**Total Test Files:** 20 (excluding templates and backups)

**Total Tests by Category:**
- **Authentication:** 10 tests (Signup: 3, Login: 7)
- **Sacrament Modules:** 30 tests (5 modules × 5-6 tests each)
- **Liturgical Modules:** 22 tests (Masses: 6, Mass Intentions: 9, Templates: 7)
- **Supporting Modules:** 28 tests (People: 5, Locations: 5, Events: 8, Readings: 5, Groups: 18)
- **Picker Components:** 12 tests (Person: 7, Event: 5)
- **Application Features:** 45 tests (Dashboard: 19, Calendar: 10, Parish Settings: 16)

**Total Active Tests:** ~147 tests (some skipped in groups-membership)

**Skipped Tests:** 11 tests (all in groups-membership.spec.ts)

---

## Notes

- **Skipped Tests:** Tests marked with `test.skip()` are documented but not currently running in the test suite
- **Test IDs:** Group membership tests use TC-XXX identifiers for traceability
- **Naming Convention:** All test files use `.spec.ts` extension
- **Page Object Model:** Complex modules (groups) use Page Object Model pattern for maintainability
- **Template Files:** `TEST_TEMPLATE.spec.ts` and `TEST_TEMPLATE.spec.ts.example` provide patterns for new tests

---

## Using This Registry

**To find tests for a specific module:**
1. Use the Table of Contents to locate the module
2. Review the test descriptions to find what you need
3. Open the test file to see implementation details

**To run specific tests:**
```bash
# Run all tests in a file
npm test tests/weddings.spec.ts

# Run tests matching a pattern
npm test -- --grep "should create"

# Run specific test by TC number
npm test -- --grep "TC-001"
```

**See [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) for more command options.**
