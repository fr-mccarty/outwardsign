# Wedding Event Type Documentation

This document describes the inputs, outputs, and selections for the Wedding event type in Outward Sign.

## Overview

The Wedding event type (`system_type: special-liturgy`) is designed for planning and managing wedding ceremonies. It includes:
- **Inputs**: Configurable fields that define what data to collect
- **Outputs**: Scripts (documents/programs) that can be exported
- **Selections**: The actual values chosen by users when creating a wedding event

---

## Inputs (Input Field Definitions)

Input fields define what data is collected for each wedding. These are configured in Settings → Event Types → Wedding.

| Field Name | Property Name | Type | Required | Special Flags | Description |
|------------|---------------|------|----------|---------------|-------------|
| Bride | `bride` | `person` | Yes | `is_key_person: true` | Primary person (used for search/display) |
| Groom | `groom` | `person` | Yes | `is_key_person: true` | Primary person (used for search/display) |
| Wedding Ceremony | `wedding_ceremony` | `calendar_event` | Yes | `is_primary: true` | Main event date/time/location |
| Wedding Rehearsal | `wedding_rehearsal` | `calendar_event` | No | | Optional rehearsal scheduling |
| Presider | `presider` | `person` | No | | Priest/deacon celebrating |
| Reception Location | `reception_location` | `location` | No | | Venue for reception |
| Opening Song | `opening_song` | `list_item` | No | `list: Wedding Songs` | Selection from custom list |
| Opening Prayer | `opening_prayer` | `content` | No | `filter_tags: [wedding, opening-prayer]` | From content library |
| Prayers of the Faithful | `prayers_of_the_faithful` | `petition` | No | `filter_tags: [wedding, prayers-of-the-faithful]` | Petition selection |
| First Reading | `first_reading` | `content` | No | `filter_tags: [wedding, first-reading]` | Scripture reading |
| Second Reading | `second_reading` | `content` | No | `filter_tags: [wedding, second-reading]` | Scripture reading |
| Gospel Reading | `gospel_reading` | `content` | No | `filter_tags: [wedding, gospel]` | Gospel reading |
| Unity Candle | `unity_candle` | `yes_no` | No | | Boolean toggle |
| Special Instructions | `special_instructions` | `rich_text` | No | | Free-form notes |

### Input Field Types Reference

| Type | Description | Stored Value |
|------|-------------|--------------|
| `person` | Links to People module | UUID reference |
| `location` | Links to Locations module | UUID reference |
| `calendar_event` | Date/time/location picker | Creates `calendar_events` record |
| `content` | Content library picker | UUID reference |
| `petition` | Petition picker | UUID reference |
| `list_item` | Custom list dropdown | String value |
| `yes_no` | Boolean checkbox | Boolean |
| `rich_text` | Multi-line textarea | String (markdown) |
| `spacer` | Visual separator | No data stored |

### Custom List: Wedding Songs

Pre-populated options for Opening Song:
1. Ave Maria
2. On This Day, O Beautiful Mother
3. The Lord's Prayer
4. Panis Angelicus
5. Joyful, Joyful, We Adore Thee
6. All Creatures of Our God and King
7. How Great Thou Art
8. Here I Am, Lord
9. The Wedding Song
10. One Hand, One Heart

---

## Outputs (Scripts)

Scripts are exportable documents generated for each wedding. These are configured in Settings → Event Types → Wedding → Scripts.

### 1. English Wedding Program

**Purpose:** English-language ceremony program for attendees

**Sections:**

| Section | Content Template |
|---------|------------------|
| Welcome | Cover page with bride/groom names and ceremony date |
| Order of Service | Numbered list of ceremony elements (Processional, Opening Prayer, etc.) |
| Readings | First Reading, Second Reading, Gospel with `{{field}}` placeholders |
| Reception | Reception location information |

### 2. Spanish Wedding Program

**Purpose:** Spanish-language ceremony program for attendees

**Sections:**

| Section | Content Template |
|---------|------------------|
| Bienvenida | Cover page with bride/groom names and ceremony date |
| Orden del Servicio | Numbered list of ceremony elements in Spanish |
| Lecturas | Primera Lectura, Segunda Lectura, Evangelio with `{{field}}` placeholders |
| Recepción | Reception location information |

### 3. Worship Aid

**Purpose:** Congregation-facing booklet with responses and music

**Sections:**

| Section | Content Template |
|---------|------------------|
| Cover | Names, date, parish name (page break after) |
| Order of Celebration | Detailed liturgical structure with Entrance, Liturgy of Word, Matrimony, Universal Prayer |
| Readings | Full reading text with placeholders (page break after) |
| Music | Opening song and congregational participation notes |

### Placeholder Syntax

Scripts use markdown with placeholder syntax to insert event data:

| Syntax | Description | Example |
|--------|-------------|---------|
| `{{field_name}}` | Simple field value | `{{reception_location}}` |
| `{{field.full_name}}` | Person's full name | `{{bride.full_name}}` |
| `{{field.first_name}}` | Person's first name | `{{presider.first_name}}` |
| `{{field \| male_text \| female_text}}` | Gender-conditional text | `{{bride.sex \| him \| her}}` |
| `{{parish.name}}` | Parish name | Inserts parish name |
| `{red}text{/red}` | Liturgical red highlighting | `{red}Rubric{/red}` |

---

## Selections (Field Values)

When a user creates or edits a wedding, their choices are stored in the `master_events.field_values` JSONB column.

### Example Field Values

```json
{
  "bride": "uuid-of-bride-person",
  "groom": "uuid-of-groom-person",
  "presider": "uuid-of-presider-person",
  "reception_location": "uuid-of-location",
  "opening_song": "Ave Maria",
  "first_reading": "uuid-of-content",
  "second_reading": "uuid-of-content",
  "gospel_reading": "uuid-of-content",
  "unity_candle": true,
  "special_instructions": "Traditional ceremony with bilingual readings"
}
```

### Calendar Event Storage

Calendar event fields (`wedding_ceremony`, `wedding_rehearsal`) create separate records in the `calendar_events` table:

```sql
-- Example calendar_events record
{
  "id": "uuid",
  "master_event_id": "uuid-of-wedding",
  "input_field_definition_id": "uuid-of-ceremony-field",
  "start_datetime": "2025-06-22T14:00:00Z",
  "location_id": "uuid-of-church",
  "is_primary": true,
  "is_cancelled": false
}
```

### Resolved Field Values

When displaying event data, the system resolves UUIDs to full objects:

| Raw Value | Resolved Value |
|-----------|----------------|
| `"bride": "uuid"` | `{ id, first_name, last_name, full_name, ... }` |
| `"first_reading": "uuid"` | `{ id, title, body, language, ... }` |
| `"reception_location": "uuid"` | `{ id, name, address, ... }` |

---

## Data Flow

### Creating a Wedding

1. User selects "Wedding" event type
2. Form renders input fields from `input_field_definitions`
3. User fills in values (selects people, dates, readings, etc.)
4. System saves to `master_events.field_values` (JSONB)
5. System creates `calendar_events` records for date/time fields
6. System optionally assigns roles via `master_event_roles`

### Viewing Scripts

1. System fetches `master_event` with `field_values`
2. System resolves UUID references to full objects
3. System fetches scripts and sections for the event type
4. System replaces `{{placeholders}}` with resolved values
5. System parses markdown to HTML via `marked`
6. User can export to PDF, Word, or Text

---

## Configuration Locations

| What | Where |
|------|-------|
| Input Field Definitions | Settings → Event Types → Wedding |
| Scripts & Sections | Settings → Event Types → Wedding → Scripts |
| Custom Lists (Songs) | Settings → Custom Lists → Wedding Songs |
| Content Library (Readings) | Settings → Content Library (tagged with `wedding`) |
| Petitions | Settings → Petitions (tagged with `wedding`) |

---

## Related Files

| File | Purpose |
|------|---------|
| `src/lib/onboarding-seeding/event-types-seed.ts` | Creates default wedding event type with fields and scripts |
| `scripts/dev-seeders/seed-weddings-funerals.ts` | Creates sample wedding events for development |
| `src/lib/utils/markdown-renderer.ts` | Processes placeholder syntax in scripts |
| `src/lib/petition-templates/wedding-templates.ts` | Default wedding petition templates |

---

## Filter Tags

Content fields use `filter_tags` to show relevant content in pickers:

| Field | Filter Tags |
|-------|-------------|
| Opening Prayer | `['wedding', 'opening-prayer']` |
| Prayers of the Faithful | `['wedding', 'prayers-of-the-faithful']` |
| First Reading | `['wedding', 'first-reading']` |
| Second Reading | `['wedding', 'second-reading']` |
| Gospel Reading | `['wedding', 'gospel']` |

Content must be tagged with **both** the sacrament tag (`wedding`) AND the section tag (`first-reading`) to appear in the picker.
