# Parish Event Settings Overview

Parish Event settings in Outward Sign provide a single, focused area for managing non-liturgical parish activities. Unlike Mass settings (which have both Types and Configuration sections), Parish Events only require type definitions.

## Parish Event Types (`/settings/events`)

Parish Event Types define the categories of non-liturgical activities your parish schedules. Each type becomes a reusable template with its own icon and configuration.

**What you can do:**
- Create new event types (e.g., Bible Study, Youth Group, Parish Meeting, Fundraiser)
- Assign an icon to each type for visual identification in lists and calendars
- Reorder types via drag-and-drop to control how they appear in dropdown menus
- Delete event types that are no longer needed

**How it works:** When you create an event type, it links to the Event Types configuration system (at `/settings/event-types/{slug}`), where you can:
- Add custom fields specific to that event type
- Configure settings and defaults
- Create printable scripts or documents

Every event created with that type inherits these configurations automatically.

---

## Examples of Parish Event Types

Common event types parishes might create:

- **Bible Study** - Weekly scripture study sessions
- **Youth Group** - Teen ministry meetings
- **Parish Meeting** - Administrative or parish council meetings
- **Fundraiser** - Fish fries, bake sales, etc.
- **Religious Education** - Faith formation classes
- **RCIA Session** - Rite of Christian Initiation classes
- **Volunteer Training** - Ministry preparation sessions
- **Social Event** - Parish picnics, dinners, gatherings

---

## Technical Details

**System Type:** Parish Event types are stored as Event Types with `system_type: 'event'`. This distinguishes them from:
- Mass types (`system_type: 'mass'`)
- Special Liturgy types (`system_type: 'special_liturgy'`)

**No Configuration Hub:** Unlike Masses, Parish Events don't have a separate configuration section. This is intentional—parish events typically don't require:
- Recurring schedules (each event is scheduled individually)
- Role definitions (no liturgical ministers)
- Role assignment patterns (no standardized staffing)
- Ministry volunteer management

If your event needs liturgical roles or ministry scheduling, it likely belongs as a Special Liturgy rather than a Parish Event.

---

## Comparison with Mass Settings

| Feature | Mass Settings | Parish Event Settings |
|---------|---------------|----------------------|
| Type definitions | Yes (`/settings/mass-liturgies`) | Yes (`/settings/events`) |
| Recurring schedule | Yes | No |
| Role definitions | Yes | No |
| Role patterns | Yes | No |
| Ministry volunteers | Yes | No |
| Custom fields per type | Yes | Yes |
| Printable scripts | Yes | Yes |

---

## Access Requirements

Parish Event settings require administrator permissions. Staff members cannot modify event types or their configurations.

---

## When to Use Parish Events vs Special Liturgies

**Use Parish Events for:**
- Non-liturgical activities
- Events without presiders or liturgical ministers
- Administrative or social gatherings
- Educational programs

**Use Special Liturgies for:**
- Sacramental celebrations (Weddings, Baptisms, Funerals)
- Liturgical services (Benediction, Stations of the Cross)
- Events requiring a presider or liturgical roles
