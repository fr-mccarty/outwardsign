# Input Field Types

Quick reference for dynamic event form input types used when configuring event types.

## Type Reference

| Type | UI Component | Stores | Description |
|------|--------------|--------|-------------|
| `person` | PersonPickerField | UUID | Select a person from the parish directory. Can be marked as "Key Person" for search. |
| `group` | GroupPickerField | UUID | Select a ministry group (e.g., choir, lectors). |
| `location` | LocationPickerField | UUID | Select a location (church, hall, cemetery). |
| `event_link` | EventPickerField | UUID | Link to another event. Can filter by event type. |
| `list_item` | ListItemField | UUID | Select from a custom list (e.g., music selections). Requires `list_id`. |
| `document` | DocumentPickerField | UUID | Attach a document. |
| `content` | ContentPickerField | UUID | Select reusable content (readings, prayers). |
| `petition` | PetitionPickerField | UUID | Select petitions for the liturgy. |
| `occasion` | OccasionFields | occasions table | Date, time, and location for an event occurrence. **Shows in calendar.** Can be marked as "Primary". |
| `text` | Input | string | Single-line text entry. |
| `rich_text` | Textarea | string | Multi-line text entry. |
| `date` | DatePicker | ISO date | Date selection (no time). |
| `time` | TimePicker | time string | Time selection (no date). |
| `datetime` | DateTimePicker | ISO datetime | Combined date and time selection. |
| `number` | Input (number) | number | Numeric entry. |
| `yes_no` | Switch | boolean | Toggle for yes/no questions. |
| `mass-intention` | MassIntentionField | string | Special field for Mass intentions. |
| `spacer` | (visual only) | — | Visual separator. No data stored. |

## Special Flags

- **`is_key_person`** - Person fields only. Marks person as a key participant (searchable in list view).
- **`is_primary`** - Occasion fields only. Marks as the main event occasion.
- **`filter_tags`** - Filter picker results by tags.
- **`list_id`** - Required for `list_item` type. Specifies which custom list to use.
- **`event_type_filter_id`** - Optional for `event_link` type. Filters linked events by type.

## Type Categories

### Reference Types (select existing records)
`person`, `group`, `location`, `event_link`, `list_item`, `document`, `content`, `petition`

### Data Entry Types (user enters value)
`text`, `rich_text`, `date`, `time`, `datetime`, `number`, `yes_no`, `mass-intention`

### Special Types
- `occasion` - Creates calendar entries with date/time/location
- `spacer` - UI-only visual separator

## Schema Location

Type definitions: `src/lib/schemas/input-field-definitions.ts`
