# Seeders Reference Documentation

> **Purpose:** Reference for event type input fields and seeder configurations.

---

## Event Type Required Fields

| Event Type | Required | Optional |
|------------|----------|----------|
| **Wedding** | Bride, Groom | Wedding Date, Ceremony Location, Presider, Reception Location, Opening Song, Opening Prayer, Prayers of the Faithful, First Reading, Gospel Reading, Unity Candle, Special Instructions |
| **Funeral** | Deceased | Funeral Date, Funeral Location, Date of Death, Presider, Burial Location, Visitation Location, Opening Song, Opening Prayer, Prayers of the Faithful, First Reading, Psalm, Gospel Reading, Eulogy Speaker, Special Instructions |
| **Baptism** | Child | Baptism Date, Baptism Location, Mother, Father, Godmother, Godfather, Presider, Opening Prayer, Special Instructions |
| **Quinceañera** | Quinceañera | Ceremony Date, Ceremony Location, Mother, Father, Presider, Reception Location, Court of Honor, Opening Prayer, Special Instructions |
| **Presentation** | Child | Presentation Date, Presentation Location, Mother, Father, Godmother, Godfather, Presider, Opening Prayer, Special Instructions |
| **Other** | _(none)_ | _(base event fields only)_ |
| **Sunday Mass** | _(none)_ | Announcements, Entrance Hymn, Offertory Hymn, Communion Hymn, Recessional Hymn, Mass Intentions, Special Instructions |
| **Daily Mass** | _(none)_ | Mass Intentions, Special Instructions |

---

## Source Files

| Seeder | File |
|--------|------|
| Event Types | `src/lib/onboarding-seeding/event-types-seed.ts` |
| Mass Event Types | `src/lib/onboarding-seeding/mass-event-types-seed.ts` |

---

## Input Field Types

| Type | Description |
|------|-------------|
| `person` | Links to people table |
| `date` | Date picker |
| `location` | Links to locations table |
| `text` | Single line text |
| `rich_text` | Multi-line formatted text |
| `yes_no` | Boolean toggle |
| `list_item` | Dropdown from custom list |
| `content` | Links to content library |
| `petition` | Links to petition builder |
| `group` | Links to groups table |
| `mass-intention` | Mass intentions component |
