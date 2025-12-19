# Content Builder Variable System

**Created:** 2025-12-19
**Status:** Vision (awaiting technical requirements)
**Agent:** brainstorming-agent

## Feature Overview

A flexible variable system for liturgical scripts that allows dynamic insertion of person names, gendered pronouns, and content sections. Users define person and content relationships at the event type level, assign them when editing events, and reference them in script templates using a simple `{{variable}}` syntax.

## Problem Statement

Currently, liturgical scripts in Outward Sign are static. When generating a wedding script, there's no way to dynamically insert:
- Ministry assignments (who is reading which section)
- Gender-appropriate pronouns for readers/ministers
- Selected content from the content library (readings, petitions, etc.)

Users need a way to create reusable script templates that adapt based on the specific people and content selected for each event.

## User Stories

- As a **liturgical director**, I want to define script templates with placeholders for readers so that I can reuse templates across multiple events without rewriting scripts each time.

- As a **parish staff member**, I want to assign people to ministry roles (First Reader, Second Reader) when planning an event so that the generated script automatically shows who is assigned to each part.

- As a **priest/presider**, I want scripts to use correct pronouns (he/she, him/her, el/la) based on the assigned person's gender so that instructions are grammatically correct in both English and Spanish.

- As a **liturgical director**, I want to select readings from the content library and have them automatically inserted into the script template so that I don't have to copy/paste content manually.

- As a **parish staff member**, I want unassigned roles to show "Unassigned" in scripts so that I can see what still needs to be filled in before the event.

## Success Criteria

What does "done" look like?

- [ ] Event types can define person inputs (First Reader, Second Reader, Petition Reader, etc.)
- [ ] Event types can define content inputs (First Reading, Second Reading, Petitions, etc.)
- [ ] When editing an event, users can select people and content from pickers
- [ ] Script templates can reference assigned people using `{{field_name.full_name}}`
- [ ] Script templates can use gendered syntax `{{field_name.sex | male | female}}`
- [ ] Script templates can reference selected content using `{{content_field_name}}`
- [ ] Unassigned person fields show "Unassigned" (internationalized)
- [ ] Generated PDFs/Word documents resolve all variables correctly

## Scope

### In Scope (MVP)

**Event Type Configuration:**
- Define person inputs (type: person)
- Define content inputs (type: section/content from library)
- Field labels are bilingual (English/Spanish)

**Event Editing:**
- Select people for person inputs (person picker)
- Select content for content inputs (content library picker)
- See which fields are unassigned

**Variable Syntax:**
- Person name variables: `{{first_reader}}` or `{{first_reader.full_name}}`
- Gendered pronoun variables: `{{first_reader.sex | he | she}}`
- Content variables: `{{first_reading}}`

**Script Templates:**
- Reference person and content inputs using variables
- Variables resolve at render time (PDF, Word, HTML)
- Support for both English and Spanish gendered text

**Rendering:**
- Resolve all variables when generating scripts
- Handle unassigned fields gracefully
- Work with existing PDF/Word export system

### Out of Scope (Future)

- Advanced variable operations (conditionals, loops, formatting)
- User-defined custom variable transformations
- Third-gender pronoun options (they/them) - for future consideration
- Dynamic role creation within events (roles are defined at event type level only)
- Variable preview/validation in content builder UI

## Key User Flows

### Primary Flow: Create Script Template with Variables

1. Admin goes to Event Type settings (e.g., Wedding)
2. Defines inputs:
   - "First Reader" (type: person)
   - "Second Reader" (type: person)
   - "First Reading" (type: content/section)
3. Creates a script template: "Wedding Liturgy with Readings"
4. In template content, uses variables:
   ```
   First Reading
   {{first_reader.full_name}} approaches the ambo.
   {{first_reader.sex | He | She}} proclaims the reading.

   [{{first_reading}}]

   After the reading, {{first_reader.sex | he | she}} returns to {{first_reader.sex | his | her}} seat.
   ```
5. Saves template

### Primary Flow: Assign People and Content to Event

1. Staff creates a new Wedding event
2. Event edit page shows inputs defined in event type:
   - **First Reader:** [Select Person dropdown]
   - **Second Reader:** [Select Person dropdown]
   - **First Reading:** [Select from Content Library button]
3. Staff selects:
   - First Reader: Maria Garcia (female)
   - Second Reader: John Smith (male)
   - First Reading: "Romans 12:1-2" from content library
4. Saves event

### Primary Flow: Generate Script with Resolved Variables

1. Staff opens Wedding event view page
2. Clicks "Export PDF" or "Export Word"
3. System:
   - Loads script template
   - Fetches related data (people and content)
   - Resolves variables:
     - `{{first_reader.full_name}}` → "Maria Garcia"
     - `{{first_reader.sex | He | She}}` → "She"
     - `{{first_reader.sex | he | she}}` → "she"
     - `{{first_reader.sex | his | her}}` → "her"
     - `{{first_reading}}` → [content of Romans 12:1-2]
   - Generates PDF/Word document
4. Staff receives script:
   ```
   First Reading
   Maria Garcia approaches the ambo.
   She proclaims the reading.

   [A reading from the Letter of Saint Paul to the Romans...]

   After the reading, she returns to her seat.
   ```

### Alternative Flow: Unassigned Fields

1. Staff creates Wedding event but doesn't assign First Reader yet
2. Generates script preview
3. System shows:
   ```
   First Reading
   Unassigned approaches the ambo.
   ```
4. Staff sees reminder to assign First Reader before finalizing

### Alternative Flow: Spanish Gendered Text

1. Template content in Spanish:
   ```
   {{first_reader.sex | El lector | La lectora}} se acerca al ambón.
   {{first_reader.sex | Él | Ella}} proclama la lectura.
   ```
2. If First Reader is Maria Garcia (female):
   ```
   La lectora se acerca al ambón.
   Ella proclama la lectura.
   ```

## Architecture

### Event Type Input Definitions

Event types define inputs that events of that type will have. Inputs have types:
- **person** - Select a person from the people module
- **content/section** - Select content from the content library
- **text** - Free text input
- **date** - Date picker
- (other existing input types...)

**Example Event Type Configuration (Wedding):**
```
Inputs:
- bride_name (type: text, label: "Bride Name")
- groom_name (type: text, label: "Groom Name")
- first_reader (type: person, label: "First Reader")
- second_reader (type: person, label: "Second Reader")
- petition_reader (type: person, label: "Petition Reader")
- first_reading (type: content, label: "First Reading")
- second_reading (type: content, label: "Second Reading")
- petitions (type: content, label: "Petitions")
```

### Related Data (Relationships)

When a user edits an event, the selected values for person and content inputs are stored as **related data** - relationships between the event and other entities.

**Example Related Data for a Wedding Event:**
```
Related Data:
- first_reader → Person (ID: 42, full_name: "Maria Garcia", sex: "female")
- second_reader → Person (ID: 38, full_name: "John Smith", sex: "male")
- petition_reader → null (unassigned)
- first_reading → Content (ID: 101, content: "A reading from Romans...")
- second_reading → Content (ID: 205, content: "A reading from 1 Corinthians...")
```

**Storage Location:**
- Exact storage mechanism to be determined in requirements phase
- Likely stored as relationships/references to person and content entities
- Must support fetching related entities when rendering scripts

### Variable Syntax

**Person Name Variables (Dot Notation Required):**

Users must be able to choose which name format to display:

```
{{first_reader}}               → "Maria Garcia" (defaults to full_name)
{{first_reader.full_name}}     → "Maria Garcia"
{{first_reader.first_name}}    → "Maria"
{{first_reader.last_name}}     → "Garcia"
```

**Field Names with Spaces:**

Field names can contain spaces. The parser splits on the FIRST dot only, so spaces are preserved:

```
{{First Reader}}               → "Maria Garcia" (defaults to full_name)
{{First Reader.full_name}}     → "Maria Garcia"
{{First Reader.first_name}}    → "Maria"
{{Petition Reader.sex | He | She}} → "She"
```

> **✅ IMPLEMENTED:** The `markdown-renderer.ts` now supports dot notation for property access. See `parseFieldReference()` function which splits on the first dot only to preserve spaces in field names.

**Gendered Variables (Pipe Syntax):**

```
{{first_reader.sex | male_text | female_text}}
```

The `.sex` property is required for gendered text. User specifies the exact male/female text inline.

**Examples - English:**
```
{{first_reader.sex | He | She}}
{{first_reader.sex | he | she}}
{{first_reader.sex | him | her}}
{{first_reader.sex | his | her}}
{{first_reader.sex | His | Her}}
```

**Examples - Spanish:**
```
{{first_reader.sex | él | ella}}
{{first_reader.sex | el | la}}
{{first_reader.sex | del | de la}}
{{first_reader.sex | El lector | La lectora}}
```

**Content Variables:**
```
{{first_reading}}              → [Full content of the selected reading]
{{petitions}}                  → [Full content of the selected petitions]
```

### Variable Resolution (Render Time)

Variables are resolved when generating scripts (PDF, Word, HTML export).

**Resolution Algorithm:**

1. **Load related data** - Fetch all person and content entities referenced by the event
2. **Build variable context** - Create a map of field names to resolved entities
3. **Parse placeholders** - Find all `{{...}}` patterns in content
4. **Resolve each placeholder:**

   **Person property variables** (dot notation):
   - `{{field_name}}` → person.full_name (default)
   - `{{field_name.full_name}}` → person.full_name
   - `{{field_name.first_name}}` → person.first_name
   - `{{field_name.last_name}}` → person.last_name
   - If person unassigned → "Unassigned" (internationalized)

   **Gendered variables** (pipe syntax):
   - Pattern: `{{field_name.sex | male_text | female_text}}`
   - If person.sex = 'MALE' → use male_text
   - If person.sex = 'FEMALE' → use female_text
   - If unassigned → blank (gendered text makes no sense without a person)

   **Content variables:**
   - Pattern: `{{content_field_name}}`
   - Replace with full content body (markdown) from content library

5. **Return resolved script** - All variables replaced with actual values

**Example Resolution:**

**Template:**
```
First Reading
{{first_reader.full_name}} approaches the ambo.
{{first_reader.sex | He | She}} proclaims the reading.

[{{first_reading}}]

After the reading, {{first_reader.sex | he | she}} returns to {{first_reader.sex | his | her}} seat.
```

**Related Data:**
- first_reader: Maria Garcia (female)
- first_reading: "A reading from the Letter of Saint Paul to the Romans. Brothers and sisters..."

**Resolved Output:**
```
First Reading
Maria Garcia approaches the ambo.
She proclaims the reading.

[A reading from the Letter of Saint Paul to the Romans. Brothers and sisters...]

After the reading, she returns to her seat.
```

## Integration Points

### Existing Content Library/Picker

- Content inputs use the existing content picker component
- Content library already exists for readings, petitions, etc.
- Variable system references content library entries
- Content is inserted into scripts at render time

### Existing Person Picker

- Person inputs use the existing person picker component
- People module already exists
- Person records must have `sex` field for gendered variables
- Related data stores references to person records

### Event Type Configuration

- Event types already support input definitions
- Add new input type: "person"
- Add new input type: "content/section"
- Input definitions already support bilingual labels

### Script Templates

- Templates already exist in the system
- Variables are used within template content
- Rendering system resolves variables at export time
- PDF/Word export system handles resolved content

### PDF/Word Export

- Existing export system generates documents
- Variable resolution happens BEFORE export
- Export receives fully resolved content (no variables)
- No changes needed to export logic itself

## Investigation Findings (Answered Questions)

### Storage & Schema ✅ ANSWERED

1. **Where is "related data" stored?**
   - `master_events.field_values` (JSONB) stores field values including person/content UUIDs
   - `MasterEventWithRelations.resolved_fields` contains pre-fetched entities
   - File: `supabase/migrations/20251210000007_create_master_events_table.sql`

2. **Do person records have a `sex` field?**
   - ✅ YES - `sex TEXT CHECK (sex IN ('MALE', 'FEMALE'))`
   - File: `supabase/migrations/20251031000000_create_people_table.sql:15`

3. **How are content library entries structured?**
   - `contents` table with `id`, `title`, `body` (markdown), `language`
   - Referenced by UUID in field_values, fetched at render time
   - File: `supabase/migrations/20251210000010_create_contents_table.sql`

### Event Type Configuration ✅ ANSWERED

4. **How are event type inputs defined?**
   - `input_field_definitions` table with `name`, `type`, `required`, etc.
   - File: `supabase/migrations/20251210000004_create_input_field_definitions_table.sql`

5. **Do "person" and "content" input types exist?**
   - ✅ YES - Both already implemented and operational
   - Types: `'person' | 'content' | 'group' | 'location' | 'text' | 'date' | ...`
   - File: `src/lib/types.ts:17-35`

### Variable Resolution ✅ ANSWERED

6. **Where does variable resolution happen?**
   - `markdown-renderer.ts` → `replacePlaceholders()` function
   - Called during PDF/Word/HTML export
   - File: `src/lib/utils/markdown-renderer.ts:136-184`

7. **What should unassigned person variables show?**
   - **Decision:** "Unassigned" internationalized at render time based on language setting
   - Gendered variables for unassigned → blank (no person = no gender)

8. **Third-gender options?**
   - **Decision:** No. Only male/female. Binary pipe syntax only.

### Internationalization ✅ ANSWERED

9. **How should "Unassigned" be internationalized?**
   - **Decision:** At render time, based on the language setting of the output
   - English: "Unassigned", Spanish: "Sin asignar"

## Required Implementation Work

### ✅ COMPLETED: Extend Dot Notation in markdown-renderer.ts

**Implemented on 2025-12-19.**

The `markdown-renderer.ts` now supports full dot notation for person properties:

- `{{Bride}}` → returns `full_name` (default) ✅
- `{{Bride.full_name}}` → returns `full_name` ✅
- `{{Bride.first_name}}` → returns `first_name` ✅
- `{{Bride.last_name}}` → returns `last_name` ✅
- `{{Bride.sex | he | she}}` → returns gendered text ✅
- `{{First Reader.full_name}}` → supports spaces in field names ✅

**Files modified:**
- `src/lib/utils/markdown-renderer.ts` - Added `parseFieldReference()`, updated `getDisplayValue()` and `replacePlaceholders()`
- `src/components/markdown-editor.tsx` - Updated UI to insert proper dot notation syntax

### ✅ COMPLETED: Add "Unassigned" Internationalization

**Implemented on 2025-12-19.**

- When person field is null, shows "Unassigned" (English) or "Sin asignar" (Spanish)
- Uses the render `language` option from `RenderMarkdownOptions`
- Added `UNASSIGNED_TEXT` constant with both languages

## Parish Onboarding Seeder Updates

**File:** `src/lib/onboarding-seeding/event-types-seed.ts`

The parish onboarding seeder creates default event types with input field definitions and script templates when a new parish is created. Once the variable system is implemented, the seeder scripts should be updated to demonstrate proper variable syntax.

### Current State

The seeder creates these event types with scripts:
- **Sacraments/Sacramentals (special-liturgy):** Wedding, Funeral, Baptism, Quinceañera, Presentation
- **Events (event):** Bible Study, Fundraiser, Religious Education, Staff Meeting, Other

Each event type includes:
- Input field definitions (person, content, location, text types)
- Default scripts with sections

### Scripts That Need Variable Updates

**Wedding Script:**
```markdown
# Current (placeholder pattern):
{{Bride}} and {{Groom}} wedding ceremony...

# Should be updated to:
{{Bride.full_name}} and {{Groom.full_name}} wedding ceremony...

# With gendered pronouns:
{{Bride.sex | She | He}} will be escorted by her father...
```

**Funeral Script:**
```markdown
# Current:
Funeral Mass for {{Deceased}}

# Should be updated to:
Funeral Mass for {{Deceased.full_name}}

# With gendered text:
{{Deceased.sex | He | She}} was a beloved member of our community...
```

**Baptism Script:**
```markdown
# Current:
Baptism of {{Child}}

# Should be updated to:
Baptism of {{Child.first_name}}

# With gendered text:
{{Child.sex | He | She}} will be baptized in the name of...
```

### Recommended Updates

When implementing the variable system:

1. **Update seeder scripts** to use proper dot notation:
   - `{{Field}}` → `{{Field.full_name}}` (explicit)
   - Add gendered pronoun examples where appropriate

2. **Add reader role examples** to demonstrate ministry assignments:
   ```markdown
   {{first_reader.full_name}} approaches the ambo.
   {{first_reader.sex | He | She}} proclaims the reading.
   ```

3. **Include content variable examples** for readings/petitions:
   ```markdown
   [{{first_reading}}]
   ```

4. **Test the seeder** after updates to ensure variables resolve correctly in generated scripts.

### Input Field Definitions Already in Seeder

The seeder already defines these person-type fields that can be referenced in variables:

| Event Type | Person Fields |
|------------|---------------|
| Wedding | Bride, Groom, First Reader, Second Reader, Petition Reader |
| Funeral | Deceased, Next of Kin, First Reader, Second Reader |
| Baptism | Child, Mother, Father, Godmother, Godfather |
| Quinceañera | Quinceañera, Mother, Father |
| Presentation | Child, Mother, Father |

## Next Steps

Hand off to requirements-agent for technical analysis and implementation planning.

**Requirements phase should address:**
1. Database schema for related data storage
2. Event type input definition structure
3. Variable resolution algorithm implementation
4. Integration with existing person picker and content picker
5. Sex/gender field on person records
6. Unassigned field handling and internationalization
7. UI for event type configuration (adding person/content inputs)
8. UI for event editing (assigning people and content)
9. Testing strategy for variable resolution

**Development order (suggested):**
1. Add sex field to people table (if missing)
2. Add person and content input types to event type configuration
3. Update event edit UI to show person/content pickers for defined inputs
4. Implement related data storage for person/content references
5. Implement variable resolution utility
6. Integrate variable resolution with PDF/Word export
7. Add internationalization for "Unassigned"
8. Testing and refinement
