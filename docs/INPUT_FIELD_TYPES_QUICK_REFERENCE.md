# Input Field Types - Quick Reference

For dynamic event form input types used when configuring event types.

> **Note:** "Required" means "Required before Saving" - the field must have a value before the event can be saved.

## Type Reference

| Type | UI Component | Stores | Description |
|------|--------------|--------|-------------|
| `person` | PersonPickerField | UUID | Select a person from the parish directory. Can be marked as "Key Person" for search. |
| `group` | GroupPickerField | UUID | Select a ministry group (e.g., choir, lectors). |
| `location` | LocationPickerField | UUID | Select a location (church, hall, cemetery). |
| `list_item` | ListItemField | UUID | Select from a custom list (e.g., music selections). Requires `list_id`. |
| `document` | DocumentPickerField | UUID | Attach a document. |
| `content` | ContentPickerField | UUID | Select reusable content (readings, prayers). |
| `petition` | PetitionPickerField | UUID | Select petitions for the liturgy. |
| `calendar_event` | CalendarEventFields | calendar_events table | Date, time, and location for an event occurrence. **Shows in calendar.** Can be marked as "Primary". |
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
- **`is_primary`** - calendar_event fields only. Marks as the main event occurrence.
- **`input_filter_tags`** - Content/petition fields only. Array of tag slugs for default picker filters. Users can toggle these on/off. Content must have ALL active tags. See [TAG_SYSTEM.md](./TAG_SYSTEM.md).
- **`list_id`** - Required for `list_item` type. Specifies which custom list to use.

### input_filter_tags Examples

```typescript
// Default to wedding first readings
input_filter_tags: ['wedding', 'first-reading']

// Default to funeral opening prayers
input_filter_tags: ['funeral', 'opening-prayer']

// Default to any generic reading (for Bible Study)
input_filter_tags: ['reading']
```

**Available slugs:** See [TAG_SYSTEM.md](./TAG_SYSTEM.md) for complete list.

## Type Categories

### Reference Types (select existing records)
`person`, `group`, `location`, `list_item`, `document`, `content`, `petition`, `mass-intention`

### Data Entry Types (user enters value)
`text`, `rich_text`, `date`, `time`, `datetime`, `number`, `yes_no`

### Special Types
- `calendar_event` - Creates calendar entries with date/time/location
- `spacer` - UI-only visual separator

## Placeholder Syntax (for Script Templates)

Custom fields can be referenced in script templates using placeholder syntax.

### Basic Placeholder

```
{{property_name}}
```

**Example:**
```
The wedding will take place on {{wedding_date}}.
```

### Nested Properties (Person Fields)

Person fields support nested property access:

```
{{field_name.first_name}}
{{field_name.last_name}}
{{field_name.full_name}}
```

**Example:**
```
We gather today to celebrate the marriage of {{bride.first_name}} and {{groom.first_name}}.
```

### Standard Placeholders

Always available in script templates:
- `{{event_date}}` - Primary calendar event date
- `{{event_time}}` - Primary calendar event time
- `{{event_location}}` - Primary calendar event location

**See Also:** [EVENT_TYPE_CONFIGURATION.md](./EVENT_TYPE_CONFIGURATION.md) for complete placeholder documentation

## Schema Location

Type definitions: `src/lib/types/event-types.ts`
