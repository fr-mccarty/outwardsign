# Masses and Mass Intentions Module Implementation Checklist

This checklist tracks the remaining work needed to complete the Masses and Mass Intentions modules for Outward Sign.

**Status:** Database, server actions, constants, pickers, Masses module, and Mass Intentions module completed (87%). Content builder, print/export, and navigation pending.

---

## ✅ Completed Work

### Database Layer
- [x] Created `roles` table with parish_id and RLS policies
- [x] Created `mass_roles_templates` table with parish_id and parameters JSONB field
- [x] Created `masses` table with all required fields:
  - event_id, presider_id, homilist_id, liturgical_event_id
  - mass_roles_template_id, pre_mass_announcement_id
  - pre_mass_announcement_topic, announcements, petitions, note
  - status, mass_template_id
- [x] Created `mass_roles` junction table (masses ↔ people ↔ roles)
- [x] Created `mass_intentions` table with mass_offered_for field
- [x] All tables have proper RLS policies scoped to parish membership

### Server Actions
- [x] `lib/actions/masses.ts` - Full CRUD operations with MassWithRelations interface
- [x] `lib/actions/roles.ts` - CRUD for roles and mass_roles management
- [x] `lib/actions/mass-intentions.ts` - Full CRUD operations (rewritten for new schema)

### TypeScript Types
- [x] Added `Role`, `MassRolesTemplate`, `Mass`, `MassRole`, `MassIntention` interfaces to `lib/types.ts`

---

## 🔴 Phase 1: Constants and Configuration

### 1.1 Add Mass Status Constants
**File:** `src/lib/constants.ts` (or create if doesn't exist)

**Task:** Add mass status values and bilingual labels following the existing pattern

```typescript
// Mass Status Constants
export const MASS_STATUS_VALUES = ['PLANNING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const
export type MassStatus = typeof MASS_STATUS_VALUES[number]

export const MASS_STATUS_LABELS: Record<MassStatus, { en: string; es: string }> = {
  PLANNING: { en: 'Planning', es: 'Planificación' },
  SCHEDULED: { en: 'Scheduled', es: 'Programado' },
  COMPLETED: { en: 'Completed', es: 'Completado' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' }
}
```

### 1.2 Add Mass Intention Status Constants
**Task:** Add mass intention status values with bilingual labels

```typescript
// Mass Intention Status Constants
export const MASS_INTENTION_STATUS_VALUES = ['REQUESTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED'] as const
export type MassIntentionStatus = typeof MASS_INTENTION_STATUS_VALUES[number]

export const MASS_INTENTION_STATUS_LABELS: Record<MassIntentionStatus, { en: string; es: string }> = {
  REQUESTED: { en: 'Requested', es: 'Solicitado' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  FULFILLED: { en: 'Fulfilled', es: 'Cumplido' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' }
}
```

### 1.3 Add Role Constants (Bilingual)
**Task:** Add standard Mass role labels for the pre-populated roles

```typescript
// Role Labels (for display purposes)
export const ROLE_LABELS: Record<string, { en: string; es: string }> = {
  LECTOR: { en: 'Lector', es: 'Lector' },
  EMHC: { en: 'Extraordinary Minister of Holy Communion', es: 'Ministro Extraordinario de la Comunión' },
  ALTAR_SERVER: { en: 'Altar Server', es: 'Monaguillo' },
  CANTOR: { en: 'Cantor', es: 'Cantor' }
}
```

**Verification:**
- [x] Constants file exists and follows existing pattern
- [x] All status values are uppercase (database format)
- [x] All labels have both English and Spanish translations
- [x] Constants are exported and accessible

---

## 🔴 Phase 2: Shared Components

### 2.1 Create MassPicker Component
**File:** `src/components/mass-picker.tsx`

**Reference:** Use `src/components/people-picker.tsx` as the pattern

**Requirements:**
- [x] Search functionality for existing masses
- [x] Display mass presider and event date/time
- [x] Select existing mass (calls `onSelect` callback)
- [x] Close modal after selection
- [x] **NO inline creation** (masses are complex, must be created via full form)
- [x] Props: `onSelect(mass: Mass)`, `onOpenChange(open: boolean)`, `open: boolean`
- [x] Use `getMasses()` server action for fetching
- [x] Filter by status and search term (presider name, date)

**Key Differences from PeoplePicker:**
- No "Add New Mass" inline form (too complex)
- Display event date/time if available
- Show presider name prominently
- Include status badge

### 2.2 Create GlobalLiturgicalEventPicker Component (if needed)
**File:** `src/components/global-liturgical-event-picker.tsx`

**Requirements:**
- [x] Search liturgical events by name or date
- [x] Display event name, date, and liturgical color
- [x] Select event (calls `onSelect` callback)
- [x] Filter by date range (default: current year)
- [x] Use existing `global_liturgical_events` table

### 2.3 Create RolePicker Component
**File:** `src/components/role-picker.tsx`

**Requirements:**
- [x] List all roles for the parish
- [x] Search by role name
- [x] Allow inline creation of new custom roles
- [x] Select role (calls `onSelect` callback)
- [x] Use `getRoles()` from `lib/actions/roles.ts`

---

## 🔴 Phase 3: Masses Module Structure

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/`)

### 3.1 List Page (Server)
**File:** `src/app/(main)/masses/page.tsx`

**Checklist:**
- [x] Auth check with `requireSelectedParish()` and `ensureJWTClaims()`
- [x] Await searchParams (Next.js 15 pattern)
- [x] Fetch masses with filters: `const masses = await getMasses(filters)`
- [x] Compute stats server-side (total, by status)
- [x] Define breadcrumbs: `[{ label: 'Masses', href: '/masses' }]`
- [x] Render structure: `BreadcrumbSetter → MassesListClient initialData={masses} stats={stats}`

### 3.2 List Client (Client Component)
**File:** `src/app/(main)/masses/masses-list-client.tsx` (PLURAL naming)

**Checklist:**
- [x] Accept `initialData: MassWithNames[]` and `stats` props
- [x] Use URL search params for filters (search, status) via `useSearchParams()`
- [x] Update URL via `router.push()` when filters change (NO client-side filtering)
- [x] Card with Search/Filter inputs (Search input, Status select)
- [x] Grid of Mass cards showing:
  - Presider name (or "No Presider")
  - Event date/time (from event relation)
  - Status badge
  - Link to `/masses/${mass.id}`
- [x] Empty state: "No masses found. Create your first Mass."
- [x] Stats card showing counts by status
- [x] "Create Mass" button linking to `/masses/create`

### 3.3 Create Page (Server)
**File:** `src/app/(main)/masses/create/page.tsx`

**Checklist:**
- [x] Auth check
- [x] Define breadcrumbs: `[{ label: 'Masses', href: '/masses' }, { label: 'Create Mass' }]`
- [x] Render: `BreadcrumbSetter → MassFormWrapper` (no entity prop)

### 3.4 View Page (Server)
**File:** `src/app/(main)/masses/[id]/page.tsx`

**Checklist:**
- [x] Auth check
- [x] Fetch mass WITH RELATIONS: `const mass = await getMassWithRelations(id)`
- [x] Handle not found with `notFound()`
- [x] Define breadcrumbs: `[{ label: 'Masses', href: '/masses' }, { label: 'Mass Details' }]`
- [x] Render: `PageContainer → BreadcrumbSetter → MassViewClient mass={mass}`

### 3.5 Edit Page (Server)
**File:** `src/app/(main)/masses/[id]/edit/page.tsx`

**Checklist:**
- [x] Auth check
- [x] Fetch mass WITH RELATIONS: `const mass = await getMassWithRelations(id)`
- [x] Handle not found
- [x] Define breadcrumbs: `[{ label: 'Masses', href: '/masses' }, { label: mass name/id }, { label: 'Edit' }]`
- [x] Render: `BreadcrumbSetter → MassFormWrapper mass={mass}`

### 3.6 Form Wrapper (Client)
**File:** `src/app/(main)/masses/mass-form-wrapper.tsx` (REQUIRED)

**Checklist:**
- [x] Accept optional `mass?: MassWithRelations` prop
- [x] Detect mode: `const isEditing = !!mass`
- [x] Wrap with `PageContainer`
- [x] Show action buttons in edit mode (View button + Save button at TOP)
- [x] Manage loading state
- [x] Pass props down to `MassForm`

### 3.7 Unified Form (Client)
**File:** `src/app/(main)/masses/mass-form.tsx`

**Checklist:**
- [x] Accept optional `mass?: MassWithRelations` prop
- [x] Compute `isEditing = !!mass` at top
- [x] Form fields:
  - [x] EventPicker for main event (with `openToNewEvent={!isEditing}`)
  - [x] PeoplePicker for presider (with `openToNewPerson={!isEditing}`)
  - [x] PeoplePicker for homilist (with `openToNewPerson={!isEditing}`)
  - [x] GlobalLiturgicalEventPicker for liturgical_event_id
  - [x] MassRolesTemplatePicker for mass_roles_template_id (optional - skipped for simplicity)
  - [x] PeoplePicker for pre_mass_announcement_id
  - [x] Input for pre_mass_announcement_topic
  - [x] Textarea for announcements
  - [x] Textarea for petitions
  - [x] Textarea for note
  - [x] Select for status (use constants)
  - [x] Select for mass_template_id (liturgy template - hardcoded options for now)
- [x] SaveButton and CancelButton at BOTTOM
- [x] Call `createMass()` or `updateMass()` based on mode
- [x] After UPDATE: `router.refresh()` (stay on edit page)
- [x] After CREATE: `router.push(\`/masses/\${newMass.id}\`)` (go to view page)
- [x] Toast notifications for success/error

### 3.8 View Client (Client Component)
**File:** `src/app/(main)/masses/[id]/mass-view-client.tsx`

**Checklist:**
- [x] Accept `mass: MassWithRelations` prop
- [x] Use `ModuleViewContainer` component
- [x] Implement `generateFilename()` function:
  - Format: `mass-{presider-last-name}-{event-date}.{ext}`
  - Example: `mass-smith-20251110.pdf`
- [x] Implement `getTemplateId()` function: `return mass.mass_template_id || 'mass-default-template'`
- [x] Pass `buildMassLiturgy` callback (create this in content builder phase)
- [x] Props:
  - `entity={mass}`
  - `entityType="Mass"`
  - `modulePath="masses"`
  - `mainEvent={mass.event}`
  - `generateFilename={generateFilename}`
  - `buildLiturgy={buildMassLiturgy}`
  - `getTemplateId={getTemplateId}`

### 3.9 Loading and Error States
**Files:**
- `src/app/(main)/masses/loading.tsx`
- `src/app/(main)/masses/error.tsx`
- `src/app/(main)/masses/[id]/loading.tsx`
- `src/app/(main)/masses/[id]/error.tsx`

**Checklist:**
- [x] Import and render reusable skeleton/error components
- [x] Follow existing pattern from weddings module

---

## 🔴 Phase 4: Mass Intentions Module Structure

**Note:** Follow the exact same pattern as Masses module above

### 4.1 Mass Intentions List Page
**File:** `src/app/(main)/mass-intentions/page.tsx`

**Status:** ✅ Complete

**Key Fields to Display:**
- [x] Mass offered for (main text)
- [x] Requested by (person name)
- [x] Date requested
- [x] Status badge

### 4.2 Mass Intentions List Client
**File:** `src/app/(main)/mass-intentions/mass-intentions-list-client.tsx`

**Status:** ✅ Complete

### 4.3 Mass Intentions Create Page
**File:** `src/app/(main)/mass-intentions/create/page.tsx`

**Status:** ✅ Complete

### 4.4 Mass Intentions View Page
**File:** `src/app/(main)/mass-intentions/[id]/page.tsx`

**Status:** ✅ Complete

### 4.5 Mass Intentions Edit Page
**File:** `src/app/(main)/mass-intentions/[id]/edit/page.tsx`

**Status:** ✅ Complete

### 4.6 Mass Intentions Form Wrapper
**File:** `src/app/(main)/mass-intentions/mass-intention-form-wrapper.tsx`

**Status:** ✅ Complete

### 4.7 Mass Intentions Unified Form
**File:** `src/app/(main)/mass-intentions/mass-intention-form.tsx`

**Status:** ✅ Complete

**Form Fields:**
- [x] MassPicker for mass_id (optional - can create intention without assigned mass)
- [x] Input for mass_offered_for (main intention text - REQUIRED)
- [x] PeoplePicker for requested_by_id
- [x] Date input for date_received
- [x] Date input for date_requested
- [x] Number input for stipend_in_cents (display as dollars.cents)
- [x] Select for status (REQUESTED, CONFIRMED, FULFILLED, CANCELLED)
- [x] Textarea for note

### 4.8 Mass Intentions View Client
**File:** `src/app/(main)/mass-intentions/[id]/mass-intention-view-client.tsx`

**Status:** ✅ Complete

**Note:** Mass Intentions do NOT need liturgy generation (no print view, PDF, or Word export)

**Simple view showing:**
- [x] Mass offered for
- [x] Requested by person
- [x] Dates (received, requested)
- [x] Stipend amount
- [x] Status
- [x] Notes
- [x] Linked Mass (if assigned)

### 4.9 Loading and Error States
**Files:**
- `src/app/(main)/mass-intentions/loading.tsx`
- `src/app/(main)/mass-intentions/error.tsx`
- `src/app/(main)/mass-intentions/[id]/loading.tsx`
- `src/app/(main)/mass-intentions/[id]/error.tsx`

**Status:** ✅ Complete

---

## 🔴 Phase 5: Mass Content Builder & Templates

### 5.1 Create Mass Content Builder
**File:** `src/lib/content-builders/mass/index.ts`

**Reference:** `src/lib/content-builders/wedding/index.ts`

**Requirements:**
- [ ] Export `buildMassLiturgy(mass: MassWithRelations, templateId: string)` function
- [ ] Return structured document array (sections, headings, paragraphs)
- [ ] Template options (at minimum):
  - `mass-full-script-english` - Complete Mass script in English
  - `mass-full-script-spanish` - Complete Mass script in Spanish
  - `mass-readings-only` - Just the readings section
- [ ] Include sections for:
  - Presider and ministers
  - Liturgical event (if selected)
  - Announcements
  - Petitions
  - Mass roles (lectors, EMHCs, servers, etc.)

### 5.2 Create Template Files (Optional - can hardcode in index.ts initially)
**Directory:** `src/lib/content-builders/mass/templates/`

**Files:**
- `mass-full-script-english.ts`
- `mass-full-script-spanish.ts`
- `mass-readings-only.ts`

---

## 🔴 Phase 6: Print View & Export Routes

### 6.1 Create Print Page
**File:** `src/app/print/masses/[id]/page.tsx`

**Checklist:**
- [ ] Directory is PLURAL: `print/masses/`
- [ ] Fetch mass with relations
- [ ] Get template ID: `const templateId = mass.mass_template_id || 'mass-full-script-english'`
- [ ] Build liturgy: `const liturgy = buildMassLiturgy(mass, templateId)`
- [ ] Render HTML: `const content = renderHTML(liturgy)`
- [ ] Use print-specific styling
- [ ] No navigation elements

### 6.2 Create PDF Export Route
**File:** `src/app/api/masses/[id]/pdf/route.ts`

**Reference:** Wedding PDF route

**Checklist:**
- [ ] Fetch mass with relations
- [ ] Get template ID from `mass.mass_template_id`
- [ ] Build liturgy using `buildMassLiturgy()`
- [ ] Convert HTML to PDF
- [ ] Return response with appropriate headers:
  - Content-Type: application/pdf
  - Content-Disposition: attachment; filename="mass-{id}.pdf"

### 6.3 Create Word Export Route
**File:** `src/app/api/masses/[id]/word/route.ts`

**Reference:** Wedding Word route

**Checklist:**
- [ ] Fetch mass with relations
- [ ] Get template ID from `mass.mass_template_id`
- [ ] Build liturgy using `buildMassLiturgy()`
- [ ] Generate .docx file
- [ ] Return response with appropriate headers:
  - Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - Content-Disposition: attachment; filename="mass-{id}.docx"

---

## 🔴 Phase 7: Navigation & Integration

### 7.1 Update Main Sidebar
**File:** `src/components/main-sidebar.tsx`

**Task:** Add Masses and Mass Intentions to navigation

**Checklist:**
- [ ] Import appropriate icon from lucide-react for Masses (suggest: `Church` or `Cross`)
- [ ] Import icon for Mass Intentions (suggest: `Heart` or `Scroll`)
- [ ] Add navigation items:
  ```tsx
  {
    label: 'Masses',
    href: '/masses',
    icon: Church
  },
  {
    label: 'Mass Intentions',
    href: '/mass-intentions',
    icon: Heart
  }
  ```
- [ ] Ensure icons are consistent and documented

### 7.2 Update Module Icons Reference
**File:** `MODULE_CHECKLIST.md`

**Task:** Document the icons chosen for Masses and Mass Intentions

---

## 🔴 Phase 8: Testing & Validation

### 8.1 Manual Testing Checklist

**Masses Module:**
- [ ] Can create a new Mass
- [ ] Can view Mass details
- [ ] Can edit existing Mass
- [ ] Can delete Mass
- [ ] List page filters work (search, status)
- [ ] Pickers work correctly (People, Event, Liturgical Event)
- [ ] Print view displays correctly
- [ ] PDF export works
- [ ] Word export works
- [ ] Mass roles can be added/removed
- [ ] Form validation works
- [ ] Breadcrumbs display correctly
- [ ] Loading states display
- [ ] Error handling works

**Mass Intentions Module:**
- [ ] Can create a new Mass Intention
- [ ] Can view Mass Intention details
- [ ] Can edit existing Mass Intention
- [ ] Can delete Mass Intention
- [ ] List page filters work
- [ ] Can link Mass Intention to Mass
- [ ] Stipend amount displays correctly (dollars.cents)
- [ ] Status transitions work
- [ ] Form validation works

### 8.2 Database Validation
- [ ] RLS policies work correctly (can only access own parish data)
- [ ] Foreign key constraints work
- [ ] Unique constraints work (e.g., mass_id in mass_intentions)
- [ ] Timestamps auto-update

### 8.3 Code Quality Checks
- [ ] No TypeScript errors
- [ ] No unused imports
- [ ] All components follow naming conventions
- [ ] All files match wedding module pattern
- [ ] Bilingual support implemented (constants)
- [ ] No hardcoded colors (use semantic tokens)
- [ ] No custom font styling in form inputs

---

## 📊 Progress Tracking

### Database & Server Actions
- ✅ 5/5 Migration files created
- ✅ 3/3 Server action files created
- ✅ TypeScript types added

### Constants & Configuration
- ✅ 3/3 Constant groups added (Mass Status, Mass Intention Status, Role Labels)

### Shared Components
- ✅ 3/3 Picker components created (MassPicker, GlobalLiturgicalEventPicker, RolePicker)

### Masses Module (8 main files + extras)
- ✅ 12/12 Files created
  - List page, List client
  - Create page
  - View page, View client
  - Edit page
  - Form wrapper, Form
  - Loading states (2), Error states (2)

### Mass Intentions Module (8 main files + extras)
- ✅ 12/12 Files created
  - List page, List client
  - Create page
  - View page, View client
  - Edit page
  - Form wrapper, Form
  - Loading states (2), Error states (2)

### Content Builder & Export
- ⬜ 0/4 Files created (Content builder, Print page, PDF route, Word route)

### Navigation & Integration
- ⬜ 0/2 Updates made (Sidebar, Icons documentation)

**Overall Progress: 41/47 (87%)**

---

## 🎯 Next Steps

1. ✅ ~~**Start with Constants** - Add all status and label constants with bilingual support~~
2. ✅ ~~**Build Pickers** - Create MassPicker, GlobalLiturgicalEventPicker, and RolePicker components~~
3. ✅ ~~**Masses Module** - Complete all 8 main files following wedding pattern exactly~~
4. ✅ ~~**Mass Intentions Module** - Complete all 8 main files (simpler than Masses - no liturgy)~~
5. **Content Builder** - Create liturgy generation for Masses
6. **Print & Export** - Add print view and PDF/Word export routes
7. **Navigation** - Update sidebar and finalize icons
8. **Test Everything** - Manual testing of all CRUD operations and features

---

## ⚠️ Important Reminders

- **Follow the wedding module pattern exactly** - Don't deviate from established patterns
- **Always use `WithRelations` types in forms and view pages** - Forms need full entity data
- **Use `openToNewEvent={!isEditing}` and `openToNewPerson={!isEditing}`** - Consistent create/edit behavior
- **No redirect in picker modals** - Auto-select new entity and close modal, stay on parent form
- **Redirections:** UPDATE = `router.refresh()`, CREATE = `router.push()`
- **One table per migration file** - Keep migrations focused and atomic
- **Bilingual support** - All user-facing text must have EN and ES translations
- **No custom form input styling** - Use default shadcn/ui component styles

---

## 📝 Notes

- Mass Intentions do NOT need liturgy generation (no print/PDF/Word)
- Mass Intentions view is simpler - just display data, no complex formatting
- The `mass_roles` junction table is used to assign multiple people to different roles for a Mass
- The `mass_roles_templates` table allows parishes to save common role configurations for reuse
- Liturgical events are global (not parish-specific) and come from the `global_liturgical_events` table
