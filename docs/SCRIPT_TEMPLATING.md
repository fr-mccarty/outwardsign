# Script Templating Guide

This document explains the templating system used in dynamic event scripts, including placeholder syntax, available variables, resolution strategies, and security considerations.

## Overview

Scripts use a Mustache-like placeholder syntax (`{{Field Name}}`) that gets replaced with actual event data at render time. This allows parish staff to create reusable script templates that automatically populate with event-specific information.

## Placeholder Syntax

### Simple Field Placeholders

```
{{property_name}}
{{property_name.property}}
```

Replaced with the resolved value of the field from the event's `field_values`. The `property_name` must match the `property_name` defined in `input_field_definitions` for the event type.

**Important:** Related records (person, location, group) require dot notation to access properties.

**Examples:**
- `{{bride.full_name}}` → "Maria Garcia" (person field)
- `{{groom.first_name}}` → "John" (person field property)
- `{{reception_location.name}}` → "St. Mary's Cathedral" (location field)
- `{{burial_location.name}}` → "Holy Cross Cemetery" (location field)
- `{{unity_candle}}` → "Yes" (boolean field)
- `{{special_instructions}}` → Rich text content (text field)

### Gendered Text Placeholders

```
{{property_name.sex | male_text | female_text}}
```

Outputs different text based on the person's gender (from the `sex` column in the `people` table).

**Resolution Logic:**
- If person's sex is `MALE` → outputs `male_text`
- If person's sex is `FEMALE` → outputs `female_text`
- If sex is unknown/null → outputs `male_text/female_text` (both options)

**Examples:**
- `{{bride.sex | him | her}}` → "her" (if bride is female)
- `{{deceased.sex | his | her}}` → "his" (if deceased is male)
- `{{child.sex | he | she}}` → "he/she" (if gender unknown)

### Parish Placeholders

```
{{parish.name}}
{{parish.city}}
{{parish.state}}
{{parish.city_state}}
```

Replaced with information about the current parish.

**Examples:**
- `{{parish.name}}` → "St. Mary Catholic Church"
- `{{parish.city}}` → "Austin"
- `{{parish.state}}` → "TX"
- `{{parish.city_state}}` → "Austin, TX"

---

## Available Variables

### Event Fields (Dynamic)

Available fields depend on the event type's `input_field_definitions`. Each event type defines its own set of fields.

**Common Field Types:**

| Field Type | Raw Value | Resolved Value |
|------------|-----------|----------------|
| `text` | String | String as-is |
| `textarea` | String | String as-is |
| `number` | Number | Number as string |
| `date` | ISO date string | Formatted date (e.g., "July 15, 2025") |
| `time` | Time string | Formatted time (e.g., "2:00 PM") |
| `datetime` | ISO datetime | Formatted datetime |
| `boolean` | true/false | "Yes" / "No" |
| `person` | Person UUID | Person's `full_name` |
| `location` | Location UUID | Location's `name` |
| `group` | Group UUID | Group's `name` |
| `event` | Event UUID | Event's display value |
| `list` | Custom list item UUID | Item's `value` |
| `document` | Document UUID | Document's `name` |

### Person Field Properties

When a field resolves to a person, these properties are available via dot notation:

| Property | Description | Example |
|----------|-------------|---------|
| `full_name` | Full name (generated) | "Maria Garcia" |
| `first_name` | First name | "Maria" |
| `last_name` | Last name | "Garcia" |
| `sex` | Gender (MALE/FEMALE) | Used for gendered placeholders |
| `email` | Email address | "maria@example.com" |
| `phone` | Phone number | "(512) 555-1234" |

**Usage:**
- `{{bride.full_name}}` → "Maria Garcia"
- `{{bride.first_name}}` → "Maria"
- `{{bride.email}}` → "maria@example.com"

### Location Field Properties

When a field resolves to a location, these properties are available:

| Property | Description | Example |
|----------|-------------|---------|
| `name` | Location name | "St. Mary's Cathedral" |
| `street` | Street address | "123 Main St" |
| `city` | City | "Austin" |
| `state` | State | "TX" |

**Usage:**
- `{{reception_location.name}}` → "St. Mary's Cathedral"
- `{{burial_location.name}}` → "Holy Cross Cemetery"

### Parish Properties

| Property | Description |
|----------|-------------|
| `parish.name` | Parish name |
| `parish.city` | City |
| `parish.state` | State abbreviation |
| `parish.city_state` | "City, State" combined |

---

## Resolution Strategy

### Data Flow

```
Event Created/Updated
         │
         ▼
┌─────────────────────────────────────────┐
│  field_values (JSON)                    │
│  {                                      │
│    "Bride": "uuid-of-person",           │
│    "Wedding Date": "2025-07-15",        │
│    "Catholic": true                     │
│  }                                      │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Server Action: getEventWithRelations() │
│  - Fetches event                        │
│  - Fetches input_field_definitions      │
│  - Resolves each field value            │
│  - Returns resolved_fields              │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  resolved_fields (computed)             │
│  {                                      │
│    "Bride": {                           │
│      field_name: "Bride",               │
│      field_type: "person",              │
│      raw_value: "uuid-of-person",       │
│      resolved_value: {                  │
│        id: "uuid",                      │
│        full_name: "Maria Garcia",       │
│        first_name: "Maria",             │
│        sex: "FEMALE",                   │
│        ...                              │
│      }                                  │
│    },                                   │
│    ...                                  │
│  }                                      │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Template Rendering                     │
│  - Replace {{Field}} with resolved      │
│  - Handle gendered syntax               │
│  - Handle parish placeholders           │
└─────────────────────────────────────────┘
```

### Resolution by Field Type

| Field Type | Resolution Process |
|------------|-------------------|
| `text`, `textarea`, `number` | Return raw value as-is |
| `date` | Format using `formatDatePretty()` |
| `time` | Format as "h:mm A" |
| `datetime` | Format date and time |
| `boolean` | Convert to "Yes" or "No" |
| `person` | Fetch from `people` table, return full object |
| `location` | Fetch from `locations` table, return full object |
| `group` | Fetch from `groups` table, return full object |
| `event` | Fetch from `events` table, return display value |
| `list` | Fetch from `custom_list_items` table, return `value` |
| `document` | Fetch from `documents` table, return `name` |

### Empty Value Handling

When a field has no value or resolves to null:

- Simple placeholders: Return `"empty"`
- Gendered placeholders with no person: Return `"male_text/female_text"`
- Parish placeholders with missing data: Return `"empty"`

---

## Security Considerations

### Security Audit Status

| Security Measure | Status | Implementation |
|------------------|--------|----------------|
| Server-side resolution | ✅ Enforced | All resolution in server actions |
| RLS on scripts | ✅ Enforced | Via event_types → parish_users join |
| RLS on input_field_definitions | ✅ Enforced | Via event_types → parish_users join |
| RLS on event_types | ✅ Enforced | Direct parish_id + parish_users check |
| RLS on dynamic_events | ✅ Enforced | Direct parish_id + parish_users check |
| Parish scoping in getEventWithRelations | ✅ Enforced | Query includes `.eq('parish_id', selectedParishId)` |
| Parish scoping in getEventTypeBySlug | ✅ Enforced | Query includes `.eq('parish_id', selectedParishId)` |
| Parish scoping in getScriptWithSections | ✅ RLS | RLS policy checks via event_types |
| Parish scoping in getInputFieldDefinitions | ✅ RLS | RLS policy checks via event_types |
| Auth in export routes | ✅ Enforced | Server actions call `requireSelectedParish()` |
| HTML sanitization | ⚠️ Partial | Admin-controlled input, see details below |

---

### 1. Server-Side Resolution Only

**All placeholder resolution happens on the server.**

```
❌ WRONG: Client receives raw UUIDs and resolves them
✅ RIGHT: Server resolves UUIDs, client receives display values only
```

The `resolved_fields` object is computed by `getEventWithRelations()` on the server before being sent to the client. Users never see raw database IDs in the rendered output.

**Verified in:** `src/lib/actions/dynamic-events.ts` lines 351-460

---

### 2. Row-Level Security (RLS)

All data fetching respects Supabase RLS policies. Each table has policies that check user membership via `parish_users`.

**Scripts table RLS** (`supabase/migrations/20251210000005_create_scripts_table.sql`):
```sql
CREATE POLICY scripts_select_policy ON scripts
  FOR SELECT
  USING (
    event_type_id IN (
      SELECT et.id
      FROM event_types et
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND et.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );
```

**Similar policies exist for:**
- `input_field_definitions` - via event_types → parish_users
- `sections` - via scripts → event_types → parish_users
- `event_types` - direct parish_id + parish_users check
- `dynamic_events` - direct parish_id + parish_users check

---

### 3. Server Action Authentication

Every server action that accesses data calls these functions:

```typescript
// From src/lib/actions/dynamic-events.ts
export async function getEventWithRelations(id: string) {
  const selectedParishId = await requireSelectedParish()  // Throws if no parish selected
  await ensureJWTClaims()                                  // Ensures valid JWT claims
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('dynamic_events')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)  // Double-check: query + RLS
    .single()
}
```

**Verified locations:**
- `getEventWithRelations()` - lines 352-353
- `getEventTypeBySlug()` - lines 112-113
- `getScriptWithSections()` - lines 69-70
- `getInputFieldDefinitions()` - lines 21-22

---

### 4. No User-Provided Templates in Unsafe Contexts

Script templates are created by authenticated parish staff through the admin interface.

**Safe:**
- Templates created in `/settings/event-types/[slug]/scripts/`
- Only authenticated users with Admin role can create/edit templates (RLS enforced)

**RLS enforcement for script creation:**
```sql
CREATE POLICY scripts_insert_policy ON scripts
  FOR INSERT
  WITH CHECK (
    event_type_id IN (
      SELECT et.id FROM event_types et
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))  -- Admin role required
    )
  );
```

---

### 5. HTML Rendering (Partial Mitigation)

When rendering to HTML (view and print), content uses `dangerouslySetInnerHTML`:

```typescript
// From src/components/dynamic-script-viewer.tsx
<div
  className="prose dark:prose-invert max-w-none"
  dangerouslySetInnerHTML={{ __html: section.htmlContent }}
/>
```

**Mitigations:**
- Templates are admin-created (RLS-enforced), not user-submitted
- Field values resolve to display strings (names, dates), not arbitrary HTML
- Content is either pre-formatted HTML (from trusted seeding) or markdown converted to HTML
- No `<script>` tags can be injected through field values

**Potential risk:** If an admin creates a template with malicious content, it would render. This is acceptable because:
1. Only admins can create templates
2. Admins already have full access to parish data
3. Templates are internal tools, not public-facing

---

### 6. Export Route Authentication

All export API routes use server actions that enforce authentication:

```typescript
// From src/app/api/events/.../export/pdf/route.ts
const eventType = await getEventTypeBySlug(event_type_id)  // Calls requireSelectedParish()
const event = await getEventWithRelations(event_id)        // Calls requireSelectedParish()
const script = await getScriptWithSections(script_id)      // Calls requireSelectedParish()
```

If any of these fail authentication, the request is rejected before any data is returned.

---

### 7. Parameterized Queries (No SQL Injection)

All database queries use Supabase's query builder with parameterized values:

```typescript
// Safe - parameterized query
const { data } = await supabase
  .from('people')
  .select('*')
  .eq('id', personId)  // personId is bound as parameter
  .single()

// Never happens - no string concatenation
// ❌ supabase.rpc('get_person', { query: `id = '${personId}'` })
```

---

### 8. Cross-Parish Data Leakage Prevention

Multiple layers prevent accessing data from other parishes:

1. **Query-level:** Server actions include `.eq('parish_id', selectedParishId)`
2. **RLS-level:** Policies check `parish_users` membership
3. **JWT-level:** `ensureJWTClaims()` validates the selected parish claim

Even if an attacker obtained a UUID from another parish:
- Query would return no results (parish_id mismatch)
- RLS would block the query (no parish_users membership)
- JWT claims would be invalid for that parish

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/utils/markdown-processor.ts` | Content processor - placeholder replacement, auto-detects HTML vs markdown |
| `src/lib/utils/markdown-renderer.ts` | Content renderer for exports - placeholder replacement, auto-detects HTML vs markdown |
| `src/lib/actions/dynamic-events.ts` | `getEventWithRelations()` - Resolves field values |
| `src/lib/utils/resolve-field-entities.ts` | Entity resolution helpers |
| `src/lib/types/event-types.ts` | Type definitions for resolved fields |

---

## Examples

### Reading Content (HTML Format - Modern)

```html
<div style="text-align: right; font-style: italic;">Genesis 1:26-28, 31a</div>

<div style="text-align: right; color: red;">FIRST READING</div>

<p><strong>A reading from the Book of Genesis</strong></p>

<p>God said: "Let us make man in our image, after our likeness..."</p>

<p>The word of the Lord.</p>
```

### Script Template (References Content)

```html
<p><strong>Reader:</strong> {{first_reader.full_name}}</p>

{{first_reading}}
```

### Wedding Script Template (HTML Format)

```html
<h1>Wedding Ceremony</h1>

<h2>The Couple</h2>

<p><strong>{{bride.full_name}}</strong> and <strong>{{groom.full_name}}</strong> have come together today at
{{parish.name}} in {{parish.city_state}} to celebrate their marriage.</p>

<p><span style="color: #c41e3a">Priest:</span> {{bride.first_name}} and {{groom.first_name}},
have you come here freely and without reservation to give yourselves
to each other in marriage?</p>

<p><strong>Both:</strong> We have.</p>

<p><span style="color: #c41e3a">Priest:</span> Will you honor {{groom.sex | him | her}} as your
spouse for as long as you both shall live?</p>

<p><strong>{{bride.first_name}}:</strong> I will.</p>
```

### Rendered Output

```
FIRST READING

Reader: Sarah Johnson

<Right-aligned italic citation>
<Right-aligned red section header>
<Bold introduction>
<Reading text>
<Conclusion>
```

---

## Adding New Placeholder Types

To add a new placeholder type (e.g., `{{today}}`):

1. **markdown-processor.ts**: Add handling in `replaceFieldPlaceholders()`
2. **markdown-renderer.ts**: Add handling in `replacePlaceholders()`
3. **Update this documentation** with the new placeholder syntax

```typescript
// Example: Adding {{today}} placeholder
if (cleanFieldName === 'today') {
  return formatDatePretty(new Date().toISOString())
}
```

## Content Format Notes

The content processor (`markdown-processor.ts` and `markdown-renderer.ts`) auto-detects the content format:

- **HTML content:** Detected by presence of HTML tags (`<div>`, `<p>`, `<span>`, etc.) or inline styles. Passed through as-is without markdown parsing.
- **Markdown content (legacy):** Converted to HTML using marked.js

This allows for:
- Modern HTML content with precise styling control (readings, structured content)
- Legacy markdown for simpler content (notes, basic text)
