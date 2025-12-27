# Seeders Reference Documentation

> **Purpose:** Complete reference for all TypeScript seeders used in onboarding and development.

---

## Overview

Seeders populate the database with initial data. There are two seeder phases:

1. **Onboarding Seeding** (`src/lib/onboarding-seeding/`) - Data ALL parishes get (production + development)
2. **Dev Seeding** (`scripts/dev-seeders/`) - Additional data for development only

When running `npm run db:fresh` or `npm run seed:dev`, you'll see clear section headers indicating which phase is running.

---

## Quick Reference

### Commands

```bash
npm run seed:dev      # Full development seed (resets and reseeds everything)
npm run db:fresh      # Reset database and run all seeders
```

### Seeder Execution Order

The dev seed script (`scripts/dev-seed.ts`) executes seeders in this order:

1. Storage buckets (person-avatars)
2. Dev user and parish setup
3. Clean up existing data
4. **ONBOARDING SEEDING** (via `seedParishData`):
   - Event types, locations, groups, category tags
   - Non-reading content (prayers, instructions, announcements)
   - Sample parish events and special liturgies (Baptisms, Quinceañeras, Presentations)
5. **DEV SEEDING**:
   - Scripture readings (via `seedReadingsForParish`)
   - Sample people with avatars
   - Group memberships, families
   - Masses and mass intentions
   - Weddings and Funerals (with readings)

---

## Onboarding Seeders

These seeders run when a new parish is created. This is the data ALL parishes receive, including production.

| File | Purpose | Data Created |
|------|---------|--------------|
| `parish-seed-data.ts` | Orchestrator | Calls all onboarding seeders |
| `category-tags-seed.ts` | Tag definitions | ~25 tags (sacrament, section, theme, testament) |
| `content-seed.ts` | Sample content | `seedNonReadingContentForParish()` - Prayers, announcements, ceremony instructions |
| `event-types-seed.ts` | Event types | Wedding, Funeral, Baptism, Quinceañera, Presentation + parish events |
| `mass-event-types-seed.ts` | Mass types | Sunday Mass, Daily Mass |
| `special-liturgy-event-types-seed.ts` | Special liturgies | Holy Week, Easter Vigil, etc. |
| `locations-seed.ts` | Locations | Church, Parish Hall, Funeral Home |
| `groups-seed.ts` | Groups | Parish Council, Finance Council, etc. |
| `event-presets-seed.ts` | Event presets | Religious Education, Staff Meeting presets |
| `events-seed.ts` | Sample events | Bible Study, Fundraiser, Religious Ed, Staff Meeting |
| `special-liturgies-seed.ts` | Special liturgies | Baptisms, Quinceañeras, Presentations (NOT Weddings/Funerals) |

### category-tags-seed.ts

Seeds the polymorphic tag system used across content and petitions.

**Tags Created:**
- Sacrament: wedding, funeral, baptism, presentation, quinceanera
- Section: reading, first-reading, second-reading, psalm, gospel, opening-prayer, etc.
- Theme: hope, resurrection, love, comfort, joy, peace, faith, etc.
- Testament: old-testament, new-testament

**See:** [TAG_SYSTEM.md](./TAG_SYSTEM.md) for complete tag documentation.

### content-seed.ts

Seeds sample content items. The content is split into two functions:

**`seedNonReadingContentForParish()`** - Called by onboarding (ALL parishes):
- Opening prayers (wedding, funeral, baptism, quinceañera, presentation)
- Closing prayers
- Prayers of the faithful
- Ceremony instructions
- Announcements

**`seedReadingsForParish()`** - Called by dev seeder (development only):
- First Readings, Second Readings, Gospels, Psalms
- Uses public domain Douay-Rheims translation

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

These seeders only run in development via `npm run seed:dev`. They augment the onboarding data with additional records for testing and development.

| File | Purpose | Data Created |
|------|---------|--------------|
| `seed-people.ts` | Sample people | ~25 parishioners with various roles |
| `seed-groups.ts` | Group memberships | Assigns people to groups (groups created by onboarding) |
| `seed-masses.ts` | Mass records | Sunday and daily Masses |
| `seed-mass-intentions.ts` | Intentions | Sample Mass intentions |
| `seed-families.ts` | Family records | Links people into family groups |
| `seed-weddings-funerals.ts` | Weddings/funerals | With readings from content library |

**Note:** Scripture readings are seeded via `seedReadingsForParish()` from `content-seed.ts`, not from this folder.

### seed-weddings-funerals.ts

Seeds Wedding and Funeral events with content assignments.

**Fields Populated:**
- first_reading, psalm, second_reading, gospel_reading (content IDs)
- Fetches readings by querying tag_assignments

**How Readings Are Selected:**
1. Query content tagged with sacrament (e.g., 'wedding')
2. Filter by section tag (e.g., 'first-reading')
3. Assign content ID to event's field_values

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
- `src/lib/onboarding-seeding/parish-seed-data.ts` (orchestrator)
- `src/lib/onboarding-seeding/category-tags-seed.ts`
- `src/lib/onboarding-seeding/content-seed.ts` (non-readings for onboarding, readings for dev)
- `src/lib/onboarding-seeding/event-types-seed.ts`
- `src/lib/onboarding-seeding/mass-event-types-seed.ts`
- `src/lib/onboarding-seeding/special-liturgy-event-types-seed.ts`
- `src/lib/onboarding-seeding/locations-seed.ts`
- `src/lib/onboarding-seeding/groups-seed.ts`
- `src/lib/onboarding-seeding/event-presets-seed.ts`
- `src/lib/onboarding-seeding/events-seed.ts`
- `src/lib/onboarding-seeding/special-liturgies-seed.ts`

### Dev Seeders
- `scripts/dev-seed.ts` (orchestrator)
- `scripts/dev-seeders/index.ts` (exports)
- `scripts/dev-seeders/seed-people.ts`
- `scripts/dev-seeders/seed-groups.ts` (group memberships)
- `scripts/dev-seeders/seed-masses.ts`
- `scripts/dev-seeders/seed-mass-intentions.ts`
- `scripts/dev-seeders/seed-families.ts`
- `scripts/dev-seeders/seed-weddings-funerals.ts`

---

## See Also

- [TAG_SYSTEM.md](./TAG_SYSTEM.md) - Complete tag system documentation
- [INPUT_FIELD_TYPES_QUICK_REFERENCE.md](./INPUT_FIELD_TYPES_QUICK_REFERENCE.md) - Input field type reference
- [DATABASE.md](./DATABASE.md) - Database operations and migrations
- [SEEDS.md](./SEEDS.md) - Console helpers for seeder output
