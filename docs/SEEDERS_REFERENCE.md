# Seeders Reference Documentation

> **Purpose:** Complete reference for all TypeScript seeders used in onboarding and development.

---

## Overview

Seeders populate the database with initial data. There are two seeder categories:

1. **Onboarding Seeders** (`src/lib/onboarding-seeding/`) - Run for new parishes
2. **Dev Seeders** (`scripts/dev-seeders/`) - Run only in development

---

## Quick Reference

### Commands

```bash
npm run seed:dev      # Full development seed (resets and reseeds everything)
```

### Seeder Execution Order

The dev seed script (`scripts/dev-seed.ts`) executes seeders in this order:

1. Storage buckets (person-avatars)
2. Dev user and parish setup
3. Onboarding seeders (via `seedParishData`)
4. Content library (via `seedContentForParish`)
5. Dev seeders (readings, groups, people, etc.)

---

## Onboarding Seeders

These seeders run when a new parish is created.

| File | Purpose | Data Created |
|------|---------|--------------|
| `parish-seed-data.ts` | Orchestrator | Calls all onboarding seeders |
| `category-tags-seed.ts` | Tag definitions | ~25 tags (sacrament, section, theme, testament) |
| `content-seed.ts` | Sample content | Prayers, announcements (no scripture) |
| `event-types-seed.ts` | Event types | Wedding, Funeral, Baptism, Quinceañera, Presentation + parish events |
| `mass-event-types-seed.ts` | Mass types | Sunday Mass, Daily Mass |
| `special-liturgy-event-types-seed.ts` | Special liturgies | Holy Week, Easter Vigil, etc. |

### category-tags-seed.ts

Seeds the polymorphic tag system used across content and petitions.

**Tags Created:**
- Sacrament: wedding, funeral, baptism, presentation, quinceanera
- Section: reading, first-reading, second-reading, psalm, gospel, opening-prayer, etc.
- Theme: hope, resurrection, love, comfort, joy, peace, faith, etc.
- Testament: old-testament, new-testament

**See:** [TAG_SYSTEM.md](./TAG_SYSTEM.md) for complete tag documentation.

### content-seed.ts

Seeds sample content items (public domain only - no copyrighted scripture).

**Content Types:**
- Opening prayers (wedding, funeral, baptism, quinceañera, presentation)
- Closing prayers
- Prayers of the faithful
- Ceremony instructions
- Announcements

**Tagging:** Each content item is tagged with sacrament + section slugs.

### event-types-seed.ts

Seeds configurable event types with input field definitions.

**Event Types:**
- Wedding (special-liturgy)
- Funeral (special-liturgy)
- Baptism (sacrament)
- Quinceañera (sacrament)
- Presentation (sacrament)
- Bible Studies, Fundraisers, Religious Education, Staff Meetings (parish events)

**Key Fields:**
- `input_filter_tags` on content fields set default picker filters (users can toggle)
- `is_key_person` marks searchable person fields
- `is_primary` marks the primary calendar event

---

## Dev Seeders

These seeders only run in development via `npm run seed:dev`.

| File | Purpose | Data Created |
|------|---------|--------------|
| `seed-people.ts` | Sample people | ~25 parishioners with various roles |
| `seed-groups.ts` | Ministry groups | Choir, Lectors, Youth Ministry, etc. |
| `seed-locations.ts` | Locations | Church, parish hall, funeral home |
| `seed-masses.ts` | Mass records | Sunday and daily Masses |
| `seed-mass-intentions.ts` | Intentions | Sample Mass intentions |
| `seed-mass-role-assignments.ts` | Role assignments | Links people to Mass roles |
| `seed-events.ts` | Events | Baptisms, quinceañeras, parish events |
| `seed-weddings-funerals.ts` | Weddings/funerals | With readings from content library |
| `seed-readings.ts` | Scripture readings | Tagged liturgical readings |
| `seed-families.ts` | Family records | Links people into family groups |

### seed-readings.ts

Seeds liturgical readings from `src/lib/data/readings.ts`.

**Readings Created:**
- 4 readings per category (wedding/funeral × first/second/psalm/gospel)
- Tagged with sacrament + section + testament

**How to Find Readings:**
```typescript
// Query by tags: ['wedding', 'first-reading']
// Pericope is in title, text is in body, intro is in description
```

### seed-weddings-funerals.ts

Seeds Wedding and Funeral events with content assignments.

**Fields Populated:**
- first_reading, psalm, second_reading, gospel_reading (content IDs)
- Fetches readings by querying tag_assignments

**How Readings Are Selected:**
1. Query content tagged with sacrament (e.g., 'wedding')
2. Filter by section tag (e.g., 'first-reading')
3. Assign content ID to event's field_values

### seed-events.ts

Seeds sample events for non-wedding/funeral event types.

**Event Types Seeded:**
- Baptisms (2 events)
- Quinceañeras (2 events)
- Presentations (2 events)
- Bible Studies (2 events)
- Fundraisers (2 events)
- Religious Education (2 events)
- Staff Meetings (2 events)

**Field Values Structure:**
```json
{
  "child": "uuid-of-person",
  "mother": "uuid-of-person",
  "presider": "uuid-of-person"
}
```

---

## Event Type Input Fields

| Event Type | Required Fields | Content Fields (with input_filter_tags) |
|------------|-----------------|----------------------------------------|
| **Wedding** | Bride, Groom | Opening Prayer [`wedding`, `opening-prayer`], First Reading [`wedding`, `first-reading`], Second Reading [`wedding`, `second-reading`], Gospel [`wedding`, `gospel`] |
| **Funeral** | Deceased | Opening Prayer [`funeral`, `opening-prayer`], First Reading [`funeral`, `first-reading`], Psalm [`funeral`, `psalm`], Second Reading [`funeral`, `second-reading`], Gospel [`funeral`, `gospel`] |
| **Baptism** | Child | Opening Prayer [`baptism`, `opening-prayer`] |
| **Quinceañera** | Quinceañera | Opening Prayer [`quinceanera`, `opening-prayer`] |
| **Presentation** | Child | Opening Prayer [`presentation`, `opening-prayer`] |
| **Bible Study** | _(none)_ | Scripture Passage [`reading`] |

---

## Input Field Types

| Type | Description | Stored Value |
|------|-------------|--------------|
| `person` | Person picker | UUID |
| `location` | Location picker | UUID |
| `content` | Content picker (uses tags) | UUID |
| `petition` | Petition picker | UUID |
| `calendar_event` | Date/time/location | calendar_events row |
| `text` | Single line text | string |
| `rich_text` | Multi-line text | string |
| `yes_no` | Boolean toggle | boolean |
| `list_item` | Custom list dropdown | UUID |

---

## Source Files

### Onboarding Seeders
- `src/lib/onboarding-seeding/parish-seed-data.ts`
- `src/lib/onboarding-seeding/category-tags-seed.ts`
- `src/lib/onboarding-seeding/content-seed.ts`
- `src/lib/onboarding-seeding/event-types-seed.ts`
- `src/lib/onboarding-seeding/mass-event-types-seed.ts`
- `src/lib/onboarding-seeding/special-liturgy-event-types-seed.ts`

### Dev Seeders
- `scripts/dev-seed.ts` (orchestrator)
- `scripts/dev-seeders/index.ts` (exports)
- `scripts/dev-seeders/seed-*.ts` (individual seeders)

---

## See Also

- [TAG_SYSTEM.md](./TAG_SYSTEM.md) - Complete tag system documentation
- [INPUT_FIELD_TYPES_QUICK_REFERENCE.md](./INPUT_FIELD_TYPES_QUICK_REFERENCE.md) - Input field type reference
- [DATABASE.md](./DATABASE.md) - Database operations and migrations
- [SEEDS.md](./SEEDS.md) - Console helpers for seeder output
