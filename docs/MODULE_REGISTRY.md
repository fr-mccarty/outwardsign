# Module Registry

> **Purpose:** Central reference for all modules in Outward Sign, including routes, labels, and internationalization.
>
> **Architecture Note:** Outward Sign uses a **unified Event Types system**. Sacraments and parish events (Weddings, Funerals, Baptisms, Bible Study, etc.) are all created as **Event Types** through the Settings UI - they are NOT separate code modules.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Main Sidebar Navigation Structure](#main-sidebar-navigation-structure)
- [Core Modules](#core-modules)
- [Supporting Modules](#supporting-modules)
- [Mass Scheduling Modules](#mass-scheduling-modules)
- [Settings Modules](#settings-modules)
- [Module Status Constants](#module-status-constants)
- [Module Labels (Internationalization)](#module-labels-internationalization)
- [Module Icons](#module-icons)
- [Module Routes](#module-routes)
- [Module Database Tables](#module-database-tables)

---

## Architecture Overview

### Unified Event Types System

Outward Sign uses a **unified Event Types architecture** where all sacraments and parish events are managed through configurable Event Types:

- **Event Types** are created by parish administrators in Settings > Event Types
- Each Event Type (Wedding, Funeral, Baptism, Bible Study, etc.) can have custom fields, scripts, and templates
- **Events** are instances of Event Types - e.g., "Smith-Jones Wedding" is an Event of type "Wedding"
- All events are accessed through `/events/[event_type_slug]/[id]`

**There are NO separate code modules for Weddings, Funerals, Baptisms, etc.** These are all Event Types configured through the UI.

### Code Modules vs Event Types

| Concept | Description | Examples |
|---------|-------------|----------|
| **Code Modules** | Distinct functionality requiring separate code | Masses, People, Locations, Groups, Families |
| **Event Types** | User-configured event categories (no code changes) | Wedding, Funeral, Baptism, Bible Study, Youth Group, RCIA |

**When to create a new Code Module:**
- Fundamentally different data model (not just different fields)
- Unique workflows not supported by Events
- Special integrations (e.g., Masses with liturgical calendar)

**When to create a new Event Type:**
- Any sacrament or parish event
- Any recurring activity that needs scheduling
- Anything that needs custom fields, scripts, or templates

---

## Main Sidebar Navigation Structure

**Source:** `src/components/main-sidebar.tsx`

### Navigation Order

1. **Dashboard** (`/dashboard`) - Always visible
2. **Calendar** (`/calendar?view=month`) - Always visible
3. **Events** (Collapsible Section) - Always visible
   - Our Events (`/events`)
   - Create Event (`/events/create`)
4. **Groups** (Collapsible Section) - Always visible
   - Our Groups (`/groups`)
   - New Group (`/groups`)
5. **Locations** (Collapsible Section) - Always visible
   - Our Locations (`/locations`)
   - New Location (`/locations/create`)
6. **Mass Intentions** (Collapsible Section)
   - Our Mass Intentions (`/mass-intentions`)
   - Create Mass Intention (`/mass-intentions/create`)
   - Report (`/mass-intentions/report`)
7. **Mass Scheduling** (Collapsible Section)
   - Schedule Masses (`/masses/schedule`)
   - Mass Times Templates (`/mass-times-templates`)
   - Mass Role Templates (`/mass-role-templates`)
   - Mass Roles (`/mass-roles`)
   - Role Members (`/mass-role-members`)
8. **Masses** (Collapsible Section)
   - Our Masses (`/masses`)
   - New Mass (`/masses/create`)
9. **People** (Collapsible Section) - Always visible
   - Our People (`/people`)
   - Create Person (`/people/create`)
10. **Families** (Collapsible Section) - Always visible
    - Our Families (`/families`)
    - Create Family (`/families/create`)
11. **Weekend Summary** (`/weekend-summary`) - Always visible

### Dynamic Event Types Section

When Event Types are configured, they appear in a separate "Event Types" section:
- Each Event Type gets its own collapsible section
- Links to filtered events list (`/events?type=[slug]`)
- Links to create event of that type (`/events/create?type=[slug]`)

### Settings Section

- **Settings** (`/settings`) - Hub page with all settings
- **Support** (`/support`)

---

## Core Modules

### Events Module

**Purpose:** Unified system for all parish events and sacraments

**Route:** `/events`

**Architecture:**
- Uses dynamic Event Types configured in Settings
- All sacraments (Weddings, Funerals, Baptisms) are Event Types
- All parish activities (Bible Study, Youth Group) are Event Types
- Single codebase handles all event types

**Key Files:**
- `src/app/(main)/events/page.tsx` - List page
- `src/app/(main)/events/[event_type_id]/[id]/page.tsx` - View page
- `src/app/(main)/events/events-list-client.tsx` - List client

### Masses Module

**Purpose:** Mass celebrations with liturgical calendar integration

**Route:** `/masses`

**Architecture:**
- Separate module due to unique requirements (scheduling wizard, role assignment, liturgical calendar)
- Can optionally use Event Types for custom fields and scripts via `event_type_id`
- Mass-specific features not available in generic Events

**Key Features:**
- Mass scheduling wizard
- Role assignment (Lector, EMHC, Altar Server, etc.)
- Liturgical calendar integration
- Optional Event Type templating for custom fields

### Mass Intentions Module

**Purpose:** Track and manage Mass intention requests

**Route:** `/mass-intentions`

**Architecture:**
- Standalone module for intention workflow
- Links to Masses when intentions are fulfilled
- Report generation for stipend tracking

---

## Supporting Modules

### People Module

**Purpose:** Parish directory and person management

**Route:** `/people`

**Key Features:**
- Contact information
- Family relationships
- Ministry participation tracking
- Full name generation (database computed field)

### Families Module

**Purpose:** Family unit management

**Route:** `/families`

**Key Features:**
- Family groupings
- Head of household designation
- Address management

### Locations Module

**Purpose:** Parish locations and venues

**Route:** `/locations`

**Key Features:**
- Venue management (Church, Hall, Chapel, etc.)
- Address and capacity information
- Used by Events, Masses, and other modules

### Calendar Events Module

**Purpose:** Standalone scheduled events (rehearsals, meetings, parish activities) that appear on the calendar

**Route:** `/calendar-events`

**Architecture:**
- Calendar events are standalone occurrences separate from master events
- Used for non-sacramental activities (Zumba, Parish Picnic, Bible Study)
- Also stores individual occurrences of master events (wedding ceremony, funeral service)
- All calendar events appear on the main Calendar view

**Key Features:**
- Scheduled event management
- Links to master events (optional)
- Locations and time management
- Calendar integration

### Groups Module

**Purpose:** Ministry groups and teams

**Route:** `/groups`

**Architecture:** Uses dialog-based editing (not standard 8-file pattern)

**Key Features:**
- Ministry group management
- Member assignment
- Role tracking within groups

---

## Mass Scheduling Modules

These modules support the Mass Scheduling functionality:

### Mass Times Templates

**Route:** `/mass-times-templates`

**Purpose:** Recurring mass schedule templates (weekly schedules)

### Mass Role Templates

**Route:** `/mass-role-templates`

**Purpose:** Reusable role templates for different liturgical contexts

### Mass Roles

**Route:** `/mass-roles`

**Purpose:** Parish-specific mass role definitions (Lector, EMHC, Altar Server, etc.)

### Mass Role Members

**Route:** `/mass-role-members`

**Purpose:** Member directory for people serving in mass roles

---

## Settings Modules

### Event Types

**Route:** `/settings/event-types`

**Purpose:** Configure event categories for the Events module

**Key Features:**
- Create event types (Wedding, Funeral, Baptism, Bible Study, etc.)
- Define custom fields per event type
- Configure scripts and templates
- Set icons and display order

### Content Library

**Route:** `/settings/content-library`

**Purpose:** Reusable content (readings, prayers, blessings)

### Category Tags

**Route:** `/settings/category-tags`

**Purpose:** Tags for organizing content and petitions

### Custom Lists

**Route:** `/settings/custom-lists`

**Purpose:** User-defined dropdown options

### Petitions

**Route:** `/settings/petitions`

**Purpose:** Petition templates and contexts

---

## Module Status Constants

### Events (via Event Types)

Events use `MODULE_STATUS_VALUES` from `src/lib/constants.ts`:
- PLANNING
- ACTIVE
- INACTIVE
- COMPLETED
- CANCELLED

### Masses

Masses use `MASS_STATUS_VALUES`:
- ACTIVE
- PLANNING
- SCHEDULED
- COMPLETED
- CANCELLED

### Mass Intentions

Mass Intentions use `MASS_INTENTION_STATUS_VALUES`:
- REQUESTED
- CONFIRMED
- FULFILLED
- CANCELLED

---

## Module Labels (Internationalization)

All module labels are provided in **English** and **Spanish**.

### Core Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **Events** | Events | Eventos |
| **Masses** | Masses | Misas |
| **Mass Intentions** | Mass Intentions | Intenciones de Misa |

### Supporting Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **People** | People | Personas |
| **Families** | Families | Familias |
| **Locations** | Locations | Ubicaciones |
| **Groups** | Groups | Grupos |

### Settings Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **Event Types** | Event Types | Tipos de Eventos |
| **Content Library** | Content Library | Biblioteca de Contenido |
| **Category Tags** | Category Tags | Etiquetas de Categoría |
| **Custom Lists** | Custom Lists | Listas Personalizadas |
| **Petitions** | Petitions | Peticiones |

---

## Module Icons

Icons are from **Lucide React**.

| Module | Icon Component |
|--------|---------------|
| **Events** | `CalendarDays` |
| **Masses** | `CirclePlus` |
| **Mass Intentions** | `ScrollText` |
| **People** | `User` |
| **Families** | `Users2` |
| **Locations** | `Building` |
| **Groups** | `Users` |
| **Settings** | `Settings` |

**Event Type Icons:** Each Event Type can have its own icon configured in Settings > Event Types.

---

## Module Routes

### Core Module Routes

| Module | Base Route | Patterns |
|--------|------------|----------|
| **Events** | `/events` | `/events`, `/events/create`, `/events/[type]/[id]`, `/events/[type]/[id]/edit` |
| **Masses** | `/masses` | `/masses`, `/masses/create`, `/masses/[id]`, `/masses/[id]/edit`, `/masses/schedule` |
| **Mass Intentions** | `/mass-intentions` | `/mass-intentions`, `/mass-intentions/create`, `/mass-intentions/[id]`, `/mass-intentions/[id]/edit`, `/mass-intentions/report` |

### Supporting Module Routes

| Module | Base Route | Patterns |
|--------|------------|----------|
| **People** | `/people` | `/people`, `/people/create`, `/people/[id]`, `/people/[id]/edit` |
| **Families** | `/families` | `/families`, `/families/create`, `/families/[id]`, `/families/[id]/edit` |
| **Locations** | `/locations` | `/locations`, `/locations/create`, `/locations/[id]`, `/locations/[id]/edit` |
| **Groups** | `/groups` | `/groups`, `/groups/[id]` (dialog-based editing) |

### Mass Scheduling Routes

| Module | Route |
|--------|-------|
| **Mass Times Templates** | `/mass-times-templates` |
| **Mass Role Templates** | `/mass-role-templates` |
| **Mass Roles** | `/mass-roles` |
| **Mass Role Members** | `/mass-role-members` |

### Settings Routes

| Module | Route |
|--------|-------|
| **Settings Hub** | `/settings` |
| **Event Types** | `/settings/event-types` |
| **Content Library** | `/settings/content-library` |
| **Category Tags** | `/settings/category-tags` |
| **Custom Lists** | `/settings/custom-lists` |
| **Petitions** | `/settings/petitions` |
| **Parish Settings** | `/settings/parish/*` |
| **User Settings** | `/settings/user` |

---

## Module Database Tables

### Core Tables

| Module | Database Table | Singular Form |
|--------|---------------|---------------|
| **Events** | `events` | `event` |
| **Event Types** | `event_types` | `event_type` |
| **Masses** | `masses` | `mass` |
| **Mass Intentions** | `mass_intentions` | `mass_intention` |

### Supporting Tables

| Module | Database Table | Singular Form |
|--------|---------------|---------------|
| **People** | `people` | `person` |
| **Families** | `families` | `family` |
| **Locations** | `locations` | `location` |
| **Groups** | `groups` | `group` |

### Mass Scheduling Tables

| Module | Database Table | Singular Form |
|--------|---------------|---------------|
| **Mass Times Templates** | `mass_times_templates` | `mass_times_template` |
| **Mass Role Templates** | `mass_role_templates` | `mass_role_template` |
| **Mass Roles** | `mass_roles` | `mass_role` |
| **Mass Role Members** | `mass_role_members` | `mass_role_member` |

**Naming Convention:**
- Database tables: plural form (e.g., `events`, `masses`)
- Database columns: singular form (e.g., `note`, not `notes`)
- TypeScript interfaces: singular form (e.g., `Event`, `Mass`)

---

## Parishioner Portal

**The Parishioner Portal is a separate web application for parishioners** (not parish staff).

**Access:** `/parishioner/*` routes

**Key Features:**
1. **Calendar Tab** - View ministry schedule and parish events
2. **Chat Tab** - AI assistant powered by Claude API
3. **Notifications Tab** - Receive notifications from ministry coordinators

**For complete documentation, see [PARISHIONER_PORTAL.md](./PARISHIONER_PORTAL.md)**

---

## Related Documentation

- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Step-by-step guide for creating new code modules
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - Implementation patterns for module files
- **[CLAUDE.md](../CLAUDE.md)** - Main development guide
