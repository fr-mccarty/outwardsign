# Module Registry

> **Purpose:** Central reference for all modules in Outward Sign, including routes, labels, and internationalization.
>
> **Note:** This registry preserves module metadata that was previously in `constants.ts` but is kept here for documentation and future i18n needs.

---

## Table of Contents

- [Main Sidebar Navigation Structure](#main-sidebar-navigation-structure)
- [Primary Modules](#primary-modules)
- [Supporting Modules](#supporting-modules)
- [Module Status Constants](#module-status-constants)
- [Module Labels (Internationalization)](#module-labels-internationalization)
- [Module Icons](#module-icons)
- [Module Routes](#module-routes)

---

## Main Sidebar Navigation Structure

**Source:** `src/components/main-sidebar.tsx`

The main sidebar follows a specific ordering and grouping structure. All navigation items are organized under the "Application" group.

### Navigation Order

1. **Dashboard** (`/dashboard`) - Always visible, no permission check
2. **Calendar** (`/calendar?view=month`) - Always visible, no permission check
3. **Events** (Collapsible Section) - Always visible
   - Our Events (`/events`)
   - Create Event (`/events/create`)
4. **Locations** (Collapsible Section) - Always visible
   - Our Locations (`/locations`)
   - New Location (`/locations/create`)
5. **Readings** (Collapsible Section) - Always visible
   - Our Readings (`/readings`)
   - Create Reading (`/readings/create`)
6. **Masses** (Collapsible Section) - Permission check: `canAccess('masses')`
   - Our Masses (`/masses`)
   - New Mass (`/masses/create`)
7. **Mass Scheduling** (Collapsible Section) - Permission check: `canAccess('masses')`
   - Schedule Masses (`/masses/schedule`)
   - Mass Times Templates (`/mass-times-templates`)
   - Mass Types (`/mass-types`)
   - Mass Role Templates (`/mass-role-templates`)
   - Mass Roles (`/mass-roles`)
   - Role Members (`/mass-role-members`)
8. **Weddings** (Collapsible Section) - Permission check: `canAccess('weddings')`
   - Our Weddings (`/weddings`)
   - New Wedding (`/weddings/create`)
9. **Funerals** (Collapsible Section) - Permission check: `canAccess('funerals')`
   - Our Funerals (`/funerals`)
   - New Funeral (`/funerals/create`)
10. **Presentations** (Collapsible Section) - Permission check: `canAccess('presentations')`
    - Our Presentations (`/presentations`)
    - New Presentation (`/presentations/create`)
11. **People** (Collapsible Section) - Always visible
    - Our People (`/people`)
    - Create Person (`/people/create`)
12. **Groups** (Collapsible Section) - Permission check: `canAccess('groups')`
    - Our Groups (`/groups`)
    - New Group (`/groups`)
13. **Mass Intentions** (Collapsible Section) - Permission check: `canAccess('mass-intentions')`
    - Our Mass Intentions (`/mass-intentions`)
    - Create Mass Intention (`/mass-intentions/create`)
    - Report (`/mass-intentions/report`)
14. **Baptisms** (Collapsible Section) - Permission check: `canAccess('baptisms')`
    - Our Baptisms (`/baptisms`)
    - New Baptisms (`/baptisms/create`)
15. **Group Baptisms** (Collapsible Section) - Permission check: `canAccess('group-baptisms')`
    - Our Group Baptisms (`/group-baptisms`)
    - New Group Baptism (`/group-baptisms/create`)
16. **Quinceañeras** (Collapsible Section) - Permission check: `canAccess('quinceaneras')`
    - Our Quinceañeras (`/quinceaneras`)
    - New Quinceañera (`/quinceaneras/create`)

### Settings Section (Bottom of Sidebar)

Separate from the main "Application" group, settings appear in their own group at the bottom:

- **Parish Settings** (`/settings/parish`) - Permission check: `canManageParishSettings(userParish)` - Admin only
  - Event Types (`/settings/event-types`) - User-configurable event type management
- **User Settings** (`/settings`) - Always visible

### Ordering Principles

1. **Core Navigation First** - Dashboard and Calendar appear first as the most frequently accessed pages
2. **Supporting Modules Early** - Events, Locations, and Readings appear before sacramental modules because they provide foundational data
3. **Masses Module Prominence** - Masses module appears before other sacramental modules due to its central importance in parish life
4. **Sacramental Modules Grouped** - Weddings, Funerals, and Presentations appear consecutively
5. **People Before Groups** - People module (foundational data) appears before Groups module (uses people data)
6. **Administrative Last** - Mass Intentions, Baptisms, and Quinceañeras appear toward the end
7. **Settings Separated** - Settings section is visually separated at the bottom

### Permission-Based Display

- **Always Visible:** Dashboard, Calendar, Events, Locations, Readings, People, User Settings
- **Permission-Gated:** Masses, Mass Scheduling, Weddings, Funerals, Presentations, Groups, Mass Intentions, Baptisms, Group Baptisms, Quinceañeras
- **Admin-Only:** Parish Settings

**Note:** All permission checks use the `canAccessModule(userParish, moduleName)` helper function from `@/lib/auth/permissions-client`.

---

## Primary Modules

**Primary modules** are the core sacramental and liturgical modules in Outward Sign. Each primary module follows the standard 9-file architecture pattern.

### List of Primary Modules

1. **Weddings** - Wedding celebrations and ceremonies
2. **Funerals** - Funeral liturgies and services
3. **Baptisms** - Individual baptism celebrations
4. **Group Baptisms** - Group baptism celebrations with multiple children baptized together
5. **Presentations** - Presentation of children in the temple (Latino tradition)
6. **Quinceañeras** - Quinceañera celebrations
7. **Masses** - Mass celebrations with optional event type templating for custom fields and scripts
8. **Mass Intentions** - Mass intention requests and tracking *(Admin-only, not available for staff or ministry-leader roles)*

### Planned Modules (Not Yet Implemented)

- **Confirmations** - Confirmation celebrations

---

## Supporting Modules

**Supporting modules** provide foundational data and functionality for primary modules. Some use different architectural patterns.

1. **People** - Parish directory and person management
2. **Events** - Event scheduling and calendar
3. **Event Types** - User-configurable event types for the Events module (settings-based, dialog architecture)
4. **Locations** - Parish locations and venues
5. **Groups** - Ministry groups and teams (uses dialog-based architecture)
6. **Readings** - Scripture readings for liturgies
7. **Petitions** - Prayer intentions and petitions

### Mass Scheduling Supporting Modules

These modules support the Mass Scheduling functionality and appear under the "Mass Scheduling" collapsible section in the sidebar:

1. **Mass Times Templates** - Recurring mass schedule templates (weekly schedules)
2. **Mass Types** - Mass type categorization (Sunday, Weekday, Holy Day, etc.)
3. **Mass Role Templates** - Reusable role templates for different liturgical contexts
4. **Mass Roles** - Parish-specific mass role definitions (Lector, EMHC, Altar Server, etc.)
5. **Mass Role Members** - Member directory for people serving in mass roles with preferences and availability

---

## Parishioner Portal

**The Parishioner Portal is a separate web application for parishioners** (not parish staff). It provides a simple, mobile-friendly interface for parishioners to view their ministry schedules, communicate with an AI assistant, and receive notifications.

**Access:** `/parishioner/*` routes (separate from main staff application)

**Authentication:** Magic link via email (separate from Supabase Auth used by staff)

**Key Features:**
1. **Calendar Tab** - View ministry schedule and parish events
2. **Chat Tab** - AI assistant powered by Claude API
3. **Notifications Tab** - Receive and manage notifications from ministry coordinators

**Purpose:**
- Give parishioners visibility into their ministry commitments
- Reduce "When am I scheduled?" questions to coordinators
- Enable AI-powered assistance for schedule management
- Provide mobile-friendly access without requiring app download

**Target Users:**
- Ministry volunteers (lectors, EMHCs, altar servers, cantors, ushers, music ministers)
- Family members viewing shared events
- Parishioners with limited technical expertise

**Architecture:**
- Responsive web app (works on desktop, tablet, mobile browsers)
- Progressive Web App (PWA) - can be added to home screen
- Separate authentication system (HTTP-only cookies, not Supabase Auth)
- Parish-scoped access via URL parameter

**For complete technical documentation, see [PARISHIONER_PORTAL.md](./PARISHIONER_PORTAL.md)**

---

## Module Status Constants

Each module uses specific status constants from `src/lib/constants.ts`. Modules are grouped by which status constant set they use.

### Modules Using `MODULE_STATUS_VALUES`

**Most sacramental/sacramental modules use the standard module status constants:**

| Module | Status Constant | Status Type | Values |
|--------|----------------|-------------|--------|
| **Weddings** | `MODULE_STATUS_VALUES` | _(none - uses values directly)_ | PLANNING, ACTIVE, INACTIVE, COMPLETED, CANCELLED |
| **Funerals** | `MODULE_STATUS_VALUES` | _(none - uses values directly)_ | PLANNING, ACTIVE, INACTIVE, COMPLETED, CANCELLED |
| **Baptisms** | `MODULE_STATUS_VALUES` | _(none - uses values directly)_ | PLANNING, ACTIVE, INACTIVE, COMPLETED, CANCELLED |
| **Group Baptisms** | `MODULE_STATUS_VALUES` | _(none - uses values directly)_ | PLANNING, ACTIVE, INACTIVE, COMPLETED, CANCELLED |
| **Presentations** | `MODULE_STATUS_VALUES` | _(none - uses values directly)_ | PLANNING, ACTIVE, INACTIVE, COMPLETED, CANCELLED |
| **Quinceañeras** | `MODULE_STATUS_VALUES` | _(none - uses values directly)_ | PLANNING, ACTIVE, INACTIVE, COMPLETED, CANCELLED |

**Labels Constant:** `MODULE_STATUS_LABELS`
**Used in:** Entity interfaces, form dropdowns, filters
**Display Helper:** `getStatusLabel(status, language)` from `@/lib/content-builders/shared/helpers`

### Modules Using `MASS_STATUS_VALUES`

**The Mass module uses its own status constants with an additional SCHEDULED status:**

| Module | Status Constant | Status Type | Values |
|--------|----------------|-------------|--------|
| **Masses** | `MASS_STATUS_VALUES` | `MassStatus` | ACTIVE, PLANNING, SCHEDULED, COMPLETED, CANCELLED |

**Labels Constant:** `MASS_STATUS_LABELS`
**Used in:** Mass entity interface, mass forms, mass filters
**Display Helper:** `getStatusLabel(status, language)` from `@/lib/content-builders/shared/helpers`

### Modules Using `MASS_INTENTION_STATUS_VALUES`

**The Mass Intentions module uses its own status constants for request workflow:**

| Module | Status Constant | Status Type | Values |
|--------|----------------|-------------|--------|
| **Mass Intentions** | `MASS_INTENTION_STATUS_VALUES` | `MassIntentionStatus` | REQUESTED, CONFIRMED, FULFILLED, CANCELLED |

**Labels Constant:** `MASS_INTENTION_STATUS_LABELS`
**Used in:** MassIntention entity interface, mass intention forms, mass intention filters
**Display Helper:** `getStatusLabel(status, language)` from `@/lib/content-builders/shared/helpers`

### Combined Status Labels

**For display purposes only**, all status labels are also available in a single combined constant:

- **Constant:** `ALL_STATUS_LABELS`
- **Purpose:** Used by the `getStatusLabel()` helper function to display any status value
- **Location:** `src/lib/constants.ts`
- **Contains:** All status labels from all three sets (MODULE, MASS, MASS_INTENTION)

**Important:** Database entity interfaces should use module-specific status types (`MassStatus`, `MassIntentionStatus`), not the combined constant. See [🔴 Data Model Interfaces vs. Filter Interfaces](./CODE_CONVENTIONS.md#-data-model-interfaces-vs-filter-interfaces) for details.

---

## Mass Event Type Integration

**The Masses module supports optional event type templating** for custom fields and scripts, allowing parishes to customize Mass data collection and document generation.

### Key Features

- **Optional Integration**: Masses can link to an event type template via `event_type_id` (nullable)
- **Custom Fields**: Event types define custom input fields (announcements, hymns, intentions, special instructions, etc.)
- **Scripts & Export**: Event types define scripts (presider script, music director sheet, bulletin insert) with PDF, Word, Print, and Text export
- **Backward Compatible**: Masses without event types continue to work with base fields only

### Architecture

**Hybrid Model:**
- Masses remain a **separate module** with their own table (`masses`) and Mass-specific features
- Masses **share the event_types templating system** with dynamic events for custom fields and scripts
- Mass-specific features (scheduling wizard, role assignment, liturgical calendar integration) continue to work unchanged

### Database Schema

**New Columns in `masses` table:**
- `event_type_id` (UUID, nullable) - Foreign key to `event_types.id`
- `field_values` (JSONB) - Stores custom field data from event type template

### New Input Field Types

Two new input field types were added specifically for Masses:

1. **`mass-intention`** - Textarea component for Mass intentions (free text, 4-6 rows)
2. **`spacer`** - Visual section divider with heading (non-data field for form organization)

See [FORMS.md](./FORMS.md#mass-specific-input-field-types) for rendering details.

### User Workflow

1. **Admin creates Mass event type** in Settings → Event Types (e.g., "Sunday Mass", "Daily Mass", "Funeral Mass")
2. **Admin adds custom fields** to event type (hymns, intentions, announcements, etc.)
3. **Admin creates scripts** with sections and placeholders for the event type
4. **Staff creates Mass** and optionally selects an event type template
5. **Staff fills in custom fields** defined by the event type
6. **Staff exports scripts** to PDF, Word, or Print for presider/music director/bulletin

### Export Integration

Mass scripts use the existing event_types export infrastructure:
- **API Routes**: `/api/masses/[id]/pdf`, `/api/masses/[id]/word`, `/api/masses/[id]/text`
- **Print View**: `/print/masses/[id]`
- **Placeholder Resolution**: Placeholders like `{{Presider}}`, `{{Opening Hymn}}`, `{{Mass Intentions}}` are replaced with actual Mass data

### References

- **Requirements**: `/requirements/2025-12-11-mass-templating-via-event-types.md`
- **Forms Documentation**: [FORMS.md](./FORMS.md#mass-specific-input-field-types)
- **Liturgical Script System**: [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)

---

## Module Labels (Internationalization)

All module labels are provided in **English** and **Spanish** for internationalization support.

### Primary Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **Weddings** | Weddings | Bodas |
| **Funerals** | Funerals | Funerales |
| **Baptisms** | Baptisms | Bautismos |
| **Group Baptisms** | Group Baptisms | Bautismos Grupales |
| **Presentations** | Presentations | Presentaciones |
| **Quinceañeras** | Quinceañeras | Quinceañeras |
| **Masses** | Masses | Misas |
| **Mass Intentions** | Mass Intentions | Intenciones de Misa |

### Supporting Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **People** | People | Personas |
| **Events** | Events | Eventos |
| **Event Types** | Event Types | Tipos de Eventos |
| **Locations** | Locations | Ubicaciones |
| **Groups** | Groups | Grupos |
| **Readings** | Readings | Lecturas |
| **Petitions** | Petitions | Peticiones |

### Mass Scheduling Supporting Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **Mass Times Templates** | Mass Times Templates | Plantillas de Horarios de Misa |
| **Mass Types** | Mass Types | Tipos de Misa |
| **Mass Role Templates** | Mass Role Templates | Plantillas de Roles de Misa |
| **Mass Roles** | Mass Roles | Roles de Misa |
| **Mass Role Members** | Mass Role Members | Miembros de Roles de Misa |

### Planned Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **Confirmations** | Confirmations | Confirmaciones |

---

## Module Icons

Each module uses a consistent icon throughout the application. All icons are from **Lucide React**.

| Module | Icon Component | Visual |
|--------|---------------|--------|
| **Weddings** | `VenusAndMars` | ⚤ |
| **Funerals** | `Cross` | ✝ |
| **Baptisms** | `Droplet` | 💧 |
| **Presentations** | `HandHeartIcon` | 🤲 |
| **Quinceañeras** | `BookHeart` | 📖 |
| **Masses** | `CirclePlus` | ⊕ |
| **Mass Intentions** | `List` | 📋 |
| **People** | `User` | 👤 |
| **Events** | `CalendarDays` | 📅 |
| **Event Types** | _(settings-based)_ | - |
| **Locations** | `Building` | 🏢 |
| **Groups** | `Users` | 👥 |
| **Readings** | `BookOpen` | 📖 |
| **Mass Times Templates** | `Clock` | ⏰ |
| **Mass Types** | `List` | 📋 |
| **Mass Role Templates** | `LayoutTemplate` | 📄 |
| **Mass Roles** | `UserCog` | ⚙️ |
| **Mass Role Members** | `UsersIcon` | 👥 |

**Source of Truth:** The main sidebar (`src/components/main-sidebar.tsx`) defines the official icon for each module.

---

## Module Routes

### Primary Module Routes

| Module | Route | Pattern |
|--------|-------|---------|
| **Weddings** | `/weddings` | `/weddings`, `/weddings/create`, `/weddings/[id]`, `/weddings/[id]/edit` |
| **Funerals** | `/funerals` | `/funerals`, `/funerals/create`, `/funerals/[id]`, `/funerals/[id]/edit` |
| **Baptisms** | `/baptisms` | `/baptisms`, `/baptisms/create`, `/baptisms/[id]`, `/baptisms/[id]/edit` |
| **Presentations** | `/presentations` | `/presentations`, `/presentations/create`, `/presentations/[id]`, `/presentations/[id]/edit` |
| **Quinceañeras** | `/quinceaneras` | `/quinceaneras`, `/quinceaneras/create`, `/quinceaneras/[id]`, `/quinceaneras/[id]/edit` |
| **Masses** | `/masses` | `/masses`, `/masses/create`, `/masses/[id]`, `/masses/[id]/edit` |
| **Mass Intentions** | `/mass-intentions` | `/mass-intentions`, `/mass-intentions/create`, `/mass-intentions/[id]`, `/mass-intentions/[id]/edit` |

### Supporting Module Routes

| Module | Route | Pattern |
|--------|-------|---------|
| **People** | `/people` | `/people`, `/people/create`, `/people/[id]`, `/people/[id]/edit` |
| **Events** | `/events` | `/events`, `/events/create`, `/events/[id]`, `/events/[id]/edit` |
| **Event Types** | `/settings/event-types` | `/settings/event-types` (settings-based, dialog architecture) |
| **Locations** | `/locations` | `/locations`, `/locations/create`, `/locations/[id]`, `/locations/[id]/edit` |
| **Groups** | `/groups` | `/groups`, `/groups/[id]` (no separate edit page, uses dialogs) |
| **Readings** | `/readings` | `/readings`, `/readings/create`, `/readings/[id]/edit` |
| **Petitions** | `/petitions` | `/petitions` |

### Mass Scheduling Supporting Module Routes

| Module | Route | Pattern |
|--------|-------|---------|
| **Mass Times Templates** | `/mass-times-templates` | `/mass-times-templates`, `/mass-times-templates/create`, `/mass-times-templates/[id]/edit` |
| **Mass Types** | `/mass-types` | `/mass-types` (dialog-based architecture) |
| **Mass Role Templates** | `/mass-role-templates` | `/mass-role-templates`, `/mass-role-templates/create`, `/mass-role-templates/[id]/edit` |
| **Mass Roles** | `/mass-roles` | `/mass-roles` (dialog-based architecture) |
| **Mass Role Members** | `/mass-role-members` | `/mass-role-members` (read-only directory view) |

### Special Routes

| Purpose | Route | Description |
|---------|-------|-------------|
| **Calendar** | `/calendar` | Parish calendar view |
| **Dashboard** | `/dashboard` | Main dashboard after login |
| **Settings** | `/settings/*` | User and parish settings |
| **Onboarding** | `/onboarding` | New user onboarding flow |

---

## Module Route Patterns

All primary modules follow the **standard 9-file architecture** with these route patterns:

1. **List** - `/[module-plural]` - Shows all entities with filters
2. **Create** - `/[module-plural]/create` - Create new entity
3. **View** - `/[module-plural]/[id]` - View entity details
4. **Edit** - `/[module-plural]/[id]/edit` - Edit entity
5. **Print** - `/print/[module-plural]/[id]` - Print-optimized view
6. **PDF Export** - `/api/[module-plural]/[id]/pdf` - Download PDF
7. **Word Export** - `/api/[module-plural]/[id]/word` - Download Word document

**Exception:** Groups module uses dialog-based editing instead of separate edit pages.

---

## Module Database Tables

### Primary Module Database Tables

| Module | Database Table | Singular Form |
|--------|---------------|---------------|
| **Weddings** | `weddings` | `wedding` |
| **Funerals** | `funerals` | `funeral` |
| **Baptisms** | `baptisms` | `baptism` |
| **Presentations** | `presentations` | `presentation` |
| **Quinceañeras** | `quinceaneras` | `quinceanera` |
| **Masses** | `masses` | `mass` |
| **Mass Intentions** | `mass_intentions` | `mass_intention` |

### Supporting Module Database Tables

| Module | Database Table | Singular Form |
|--------|---------------|---------------|
| **People** | `people` | `person` |
| **Events** | `events` | `event` |
| **Event Types** | `event_types` | `event_type` |
| **Locations** | `locations` | `location` |
| **Groups** | `groups` | `group` |
| **Readings** | `individual_readings` | `individual_reading` |
| **Petitions** | `petitions` | `petition` |

### Mass Scheduling Supporting Module Database Tables

| Module | Database Table | Singular Form |
|--------|---------------|---------------|
| **Mass Times Templates** | `mass_times_templates` | `mass_times_template` |
| **Mass Role Templates** | `mass_role_templates` | `mass_role_template` |
| **Mass Roles** | `mass_roles` | `mass_role` |
| **Mass Role Members** | `mass_role_members` | `mass_role_member` |

**Naming Convention:**
- Database tables: plural form (e.g., `weddings`, `baptisms`)
- Database columns: singular form (e.g., `note`, not `notes`)
- TypeScript interfaces: singular form (e.g., `Wedding`, `Baptism`)

---

## Adding a New Module

When creating a new module, ensure it's documented in this registry:

1. Add to appropriate section (Primary or Supporting)
2. Add bilingual labels (English + Spanish)
3. Add icon reference (Lucide React component)
4. Add route patterns
5. Add database table name
6. Update main sidebar (`src/components/main-sidebar.tsx`)
7. Follow MODULE_CHECKLIST.md for implementation

---

## Related Documentation

- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Step-by-step guide for creating new modules
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - Implementation patterns for module files
- **[CLAUDE.md](../CLAUDE.md)** - Main development guide with module architecture

---

## Liturgical Roles

Liturgical roles are used in the Groups module for assigning people to ministry roles.

### Mass Role Values

These constants are defined in `src/lib/constants.ts`:
- `MASS_ROLE_VALUES` - Array of mass role constants
- `MASS_ROLE_LABELS` - Bilingual labels for each mass role
- `MassRoleType` - TypeScript type

### Available Mass Roles

| Role | English | Spanish |
|------|---------|---------|
| **LECTOR** | Lector | Lector |
| **EMHC** | Extraordinary Minister of Holy Communion | Ministro Extraordinario de la Comunión |
| **ALTAR_SERVER** | Altar Server | Monaguillo |
| **CANTOR** | Cantor | Cantor |
| **USHER** | Usher | Ujier |
| **SACRISTAN** | Sacristan | Sacristán |
| **MUSIC_MINISTER** | Music Minister | Ministro de Música |

**Usage:**
```typescript
import { MASS_ROLE_VALUES, MASS_ROLE_LABELS, type MassRoleType } from '@/lib/constants'

// Display role in select dropdown
<FormField
  inputType="select"
  options={MASS_ROLE_VALUES.map(role => ({
    value: role,
    label: MASS_ROLE_LABELS[role].en  // or .es for Spanish
  }))}
/>
```

---

## Future Internationalization

This registry preserves all module labels in multiple languages to support future internationalization efforts. When implementing language selection:

1. Import labels from this registry or from `constants.ts`
2. Use user's selected language to display appropriate label
3. Maintain consistency across all modules
4. Follow bilingual patterns established here

**Example Implementation:**
```typescript
// Future i18n pattern
const selectedLanguage = getUserLanguage() // 'en' or 'es'
const moduleLabel = MODULE_LABELS.WEDDINGS[selectedLanguage]
```
