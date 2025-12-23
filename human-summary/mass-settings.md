# Mass Settings Overview

Mass settings in Outward Sign are split into two distinct areas: **Mass Types** and **Mass Configuration**. Together, they provide complete control over how a parish manages its Mass celebrations.

## Mass Types (`/settings/masses`)

Mass Types define the different kinds of Masses your parish celebrates. Each type becomes a reusable template with its own icon and configuration.

**What you can do:**
- Create new Mass types (e.g., Sunday Mass, Daily Mass, Spanish Mass, Youth Mass)
- Assign an icon to each type for visual identification in lists and calendars
- Reorder types via drag-and-drop to control how they appear in dropdown menus
- Delete Mass types that are no longer needed

**How it works:** When you create a Mass type, it links to the Event Types system (at `/settings/event-types/{slug}`), where you can add custom fields, configure settings, and create printable scripts. Every Mass created with that type inherits these configurations.

**Technical note:** Mass types are stored as Event Types with `system_type: 'mass'`. This distinguishes them from Parish Events (`system_type: 'event'`) and Special Liturgies (`system_type: 'special_liturgy'`).

---

## Mass Configuration (`/settings/mass-configuration`)

Mass Configuration is a dedicated hub for managing the operational aspects of Mass celebrations. It contains four subsections:

### 1. Recurring Schedule

Set up your parish's regular Mass times. Configure which days of the week have Mass and at what times. This creates a baseline schedule that can be used for planning and calendar generation.

### 2. Role Definitions

Define the liturgical roles available at your Masses. Standard roles include:
- Lector (Scripture reader)
- Cantor (Song leader)
- Extraordinary Minister of Holy Communion
- Altar Server
- Sacristan
- Usher/Greeter

Each role can be configured with a name, description, and other settings relevant to your parish's needs.

### 3. Role Assignment Patterns

Create templates for how roles should be assigned at different types of Masses. For example, a Sunday Mass pattern might include 2 Lectors, 1 Cantor, and 4 Extraordinary Ministers, while a Daily Mass pattern might only need 1 Lector. These patterns speed up Mass planning by pre-populating role assignments.

### 4. Ministry Volunteers

View and manage parishioners who serve in liturgical ministries. For each volunteer, you can:
- See which roles they're assigned to
- Configure their availability preferences (preferred Mass times)
- Set blackout dates when they're unavailable

---

## Relationship Between the Two

**Mass Types** answer: "What kinds of Masses does our parish celebrate?"

**Mass Configuration** answers: "How do we staff and schedule those Masses?"

When creating a new Mass record, staff select a Mass Type (from `/settings/masses`). Role assignment patterns (from Mass Configuration) can then be applied to quickly populate the liturgical roles for that Mass.

---

## Access Requirements

Both Mass settings areas require administrator permissions. Staff members cannot modify Mass types or configuration settings.
