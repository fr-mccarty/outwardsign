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
- **`filter_tags`** - Content/petition fields only. Array of tag slugs to filter picker results. Content must have ALL specified tags. See [TAG_SYSTEM.md](./TAG_SYSTEM.md).
- **`list_id`** - Required for `list_item` type. Specifies which custom list to use.

### filter_tags Examples

```typescript
// Show only wedding first readings
filter_tags: ['wedding', 'first-reading']

// Show only funeral opening prayers
filter_tags: ['funeral', 'opening-prayer']

// Show any generic reading (for Bible Study)
filter_tags: ['reading']
```

**Available slugs:** See [TAG_SYSTEM.md](./TAG_SYSTEM.md) for complete list.

## Type Categories

### Reference Types (select existing records)
`person`, `group`, `location`, `list_item`, `document`, `content`, `petition`

### Data Entry Types (user enters value)
`text`, `rich_text`, `date`, `time`, `datetime`, `number`, `yes_no`, `mass-intention`

### Special Types
- `calendar_event` - Creates calendar entries with date/time/location
- `spacer` - UI-only visual separator

## Schema Location

Type definitions: `src/lib/types/event-types.ts`
