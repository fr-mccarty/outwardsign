# Definitions

This document provides definitions for liturgical terminology and application-specific concepts used throughout Outward Sign. These terms are essential for understanding the Catholic liturgical context and the application's domain model.

---

## Table of Contents

- [Liturgical Roles](#liturgical-roles)
- [Sacraments vs Sacramentals](#sacraments-vs-sacramentals)
- [Liturgical Elements](#liturgical-elements)
- [Event Types](#event-types)
- [Application Concepts](#application-concepts)
- [Quick Reference Glossary](#quick-reference-glossary)

---

## Liturgical Roles

### Presider
The priest or deacon who leads the liturgical celebration. The presider is the primary celebrant of the sacrament or sacramental.

**Examples:**
- Priest celebrating a Wedding Mass
- Deacon leading a Funeral Service
- Priest presiding at a Baptism

**Database field:** `presider_id` (references `people` table)

### Reader (Lector)
A person who proclaims the Word of God during the liturgy. Readers proclaim the readings from Scripture, excluding the Gospel (which is read by the deacon or priest).

**What readers proclaim:**
- First Reading (Old Testament or Acts of the Apostles)
- Second Reading (New Testament letters)
- Responsorial Psalm (or lead the response)
- Petitions (Prayers of the Faithful / General Intercessions)

**Database field:** Varies by module
- Masses: `reader_id` (general reader)
- Weddings: `first_reading_reader_id`, `second_reading_reader_id`, `psalm_reader_id`, `petitions_reader_id`
- Funerals: Similar pattern with specific reader fields

**Note:** The Gospel is NOT read by a reader - it is proclaimed by a deacon or priest.

### Minister
A broad term for anyone who serves in a liturgical capacity. Can include:
- **Extraordinary Ministers of Holy Communion** - Assist with distributing communion
- **Altar Servers** - Assist the priest at the altar
- **Music Ministers** - Lead music and singing
- **Ushers/Greeters** - Welcome people and assist with seating
- **Sacristans** - Prepare the church and liturgical items

**Database field:** Varies by module, often stored in pivot tables or as separate relationships

### Godparent / Sponsor
A person who presents someone for a sacrament and commits to supporting their faith journey.

**Examples:**
- Godparents at a Baptism
- Sponsors at a Confirmation
- Padrinos/Madrinas at a Quinceañera or Presentation

**Database field:** `godparent_id`, `sponsor_id`, or module-specific fields

---

## Sacraments vs Sacramentals

### Sacraments
The seven sacraments instituted by Christ as outward signs of inward grace. Outward Sign focuses on:

**Sacraments of Initiation:**
- **Baptism** - Initiation into the Christian faith
- **Confirmation** - Strengthening by the Holy Spirit (future module)
- **Eucharist** - Receiving the Body and Blood of Christ (Mass module)

**Sacraments of Healing:**
- **Reconciliation** - Confession of sins (future module)
- **Anointing of the Sick** - Healing prayer for the sick (future module)

**Sacraments at the Service of Communion:**
- **Matrimony** - Wedding - covenant between spouses
- **Holy Orders** - Ordination (not typically managed by parishes)

**Sacraments in Outward Sign:**
- Baptism
- Wedding (Matrimony)
- Mass (Eucharist)

### Sacramentals
Sacred signs and practices that prepare people to receive grace. Not sacraments themselves, but help dispose people toward God's grace.

**Sacramentals in Outward Sign:**
- **Funeral** - Celebration of Christian death and hope of resurrection
- **Quinceañera** - Celebration of a young woman's 15th birthday and faith
- **Presentation** - Latino tradition of presenting a child to Mary (similar to dedication)

**Key Difference:**
- **Sacraments** - Instituted by Christ, confer grace ex opere operato (by the work performed)
- **Sacramentals** - Instituted by the Church, prepare people to receive grace through their faith

---

## Liturgical Elements

### Gospel
The proclamation of Jesus Christ's life, ministry, death, and resurrection. Read from one of the four Gospels: Matthew, Mark, Luke, or John.

**Who reads it:** Always a deacon or priest (never a lay reader)

**Database field:** `gospel_id` or `gospel_text`

### First Reading
The first Scripture reading in the Liturgy of the Word, typically from the Old Testament or Acts of the Apostles.

**Who reads it:** Reader (lay person)

**Database field:** `first_reading_id` or `first_reading_text`

### Second Reading
The second Scripture reading in the Liturgy of the Word, from the New Testament letters (epistles).

**Who reads it:** Reader (lay person)

**Database field:** `second_reading_id` or `second_reading_text`

### Responsorial Psalm
A psalm sung or recited between the First and Second Readings, typically with a response that the assembly repeats.

**Who leads it:** Reader, cantor, or music minister

**Database field:** `psalm_id` or `psalm_text`

### Petitions (Prayers of the Faithful / General Intercessions)
Prayers of intercession for the Church, world, those in need, and the local community. The assembly responds to each petition (e.g., "Lord, hear our prayer").

**Who reads them:** Reader (lay person)

**Database field:** Related through `petitions` table with `petition_text` field

### Homily
The priest or deacon's reflection on the Scripture readings, applying them to the lives of the faithful.

**Who gives it:** Presider (priest or deacon)

**Database field:** Typically not stored (prepared by presider)

---

## Event Types

Outward Sign has two types of event categorization: **user-configurable event types** (`event_types` table) and **system-defined related event types** (constants for module linkage).

### User-Configurable Event Types (`event_types` table)

Parish staff can create and manage their own custom event types in **Settings > Event Types**. These are stored in the `event_types` table and provide flexible categorization for parish events.

**Database table:** `event_types`
**Fields:**
- `id` - UUID primary key
- `parish_id` - References the parish
- `name` - User-entered name (e.g., "Parish Festival", "Staff Meeting", "Youth Group")
- `description` - Optional description
- `is_active` - Whether the event type is currently in use
- `display_order` - For custom sorting in UI

**Examples of custom event types:**
- "Parish Festival"
- "Staff Meeting"
- "Youth Group Gathering"
- "Bible Study"
- "Choir Practice"

**Usage in events table:** The `event_type_id` field on the `events` table references a user-created event type.

### System-Defined Related Event Types (Constants)

When an event is linked to a sacrament or sacramental module record (wedding, funeral, baptism, etc.), the `related_event_type` field stores a **system-defined constant** that indicates which module the event belongs to.

**Database field:** `related_event_type` (TEXT, nullable) on `events` table

**System constants for liturgical events:**
- **WEDDING** - Wedding ceremony linked to wedding module
- **FUNERAL** - Funeral service linked to funeral module
- **BAPTISM** - Baptism ceremony linked to baptism module
- **QUINCEANERA** - Quinceañera linked to quinceanera module
- **PRESENTATION** - Presentation linked to presentation module
- **MASS** - Mass linked to mass module
- **MASS_INTENTION** - Mass with specific intention linked to mass intention module

**System constants for related events:**
- **WEDDING_RECEPTION** - Reception linked to wedding module
- **WEDDING_REHEARSAL** - Rehearsal linked to wedding module
- **FUNERAL_VISITATION** - Visitation/viewing linked to funeral module
- **FUNERAL_COMMITTAL** - Graveside service linked to funeral module

**Purpose:** The `related_event_type` field allows the system to:
1. Link calendar events back to their source module records
2. Filter events by module (e.g., show all wedding-related events)
3. Display module-specific icons and styling
4. Navigate from calendar to the related module record

### Key Differences

| Feature | User Event Types (`event_type_id`) | System Related Types (`related_event_type`) |
|---------|-----------------------------------|-------------------------------------------|
| **Who creates** | Parish staff via Settings | System/application code |
| **Storage** | Database table (`event_types`) | Constants in code |
| **Purpose** | Flexible categorization | Module linkage |
| **Required** | Optional | Set when event linked to module |
| **Editable** | Yes (by parish staff) | No (system-defined) |
| **Example** | "Staff Meeting", "Parish Festival" | "WEDDING", "FUNERAL", "BAPTISM" |

**See:**
- `src/app/(main)/settings/event-types/` - User event type management UI
- `src/lib/actions/event-types.ts` - Server actions for event types
- Constants for related event types (implementation in progress)

---

## Application Concepts

### Parish
The local Catholic faith community. In Outward Sign, data is scoped to parishes - each record belongs to a specific parish.

**Database field:** `parish_id` (on all main tables)

**Multi-tenancy:** Users can only access data for parishes they belong to.

### Module
A section of the application focused on a specific sacrament or sacramental. Each module follows the standard 9-file pattern.

**Available modules:**
- Masses
- Weddings
- Funerals
- Baptisms
- Quinceaneras
- Presentations
- Mass Intentions
- Groups

**See:** [MODULE_REGISTRY.md](./MODULE_REGISTRY.md)

### Content Builder
A system for generating liturgical documents (scripts) for individual sacraments/sacramentals. Content builders create structured documents that can be exported to PDF and Word.

**See:** [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)

### Report Builder
A system for generating tabular reports with aggregations and filtering. Used for administrative reports (e.g., Mass Intentions Report).

**See:** [REPORT_BUILDER_SYSTEM.md](./REPORT_BUILDER_SYSTEM.md)

### Template
A pre-configured structure for a liturgy that can be reused. Templates store common readings, prayers, and liturgical elements that can be applied to new events.

**Examples:**
- Sunday Mass template with standard readings
- Wedding ceremony template with common prayers
- Funeral liturgy template

**Database table:** `templates`

### WithRelations
An interface pattern that extends the base entity type to include all related data (foreign keys expanded to full objects).

**Example:**
```typescript
interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  wedding_event?: Event | null
  presider?: Person | null
}
```

**See:** [ARCHITECTURE.md](./ARCHITECTURE.md) - Type Patterns section

---

## Quick Reference Glossary

**Alphabetical list of key terms:**

- **Baptism** - Sacrament of initiation into Christian faith
- **Content Builder** - System for generating liturgical documents
- **Event** - A scheduled occurrence (Mass, wedding, funeral, etc.)
- **First Reading** - Scripture reading from Old Testament or Acts
- **Funeral** - Sacramental celebration of Christian death
- **Godparent** - Person who presents someone for Baptism
- **Gospel** - Scripture reading from Matthew, Mark, Luke, or John
- **Homily** - Priest/deacon's reflection on Scripture readings
- **Lector** - See Reader
- **Mass** - Celebration of the Eucharist (sacrament)
- **Mass Intention** - Prayer intention offered at a specific Mass
- **Minister** - Anyone serving in a liturgical capacity
- **Module** - Section of app focused on specific sacrament/sacramental
- **Parish** - Local Catholic faith community
- **Petitions** - Prayers of the Faithful / General Intercessions
- **Presider** - Priest or deacon leading the liturgical celebration
- **Presentation** - Latino tradition of presenting child to Mary (sacramental)
- **Psalm** - Responsorial psalm between readings
- **Quinceañera** - Celebration of young woman's 15th birthday and faith (sacramental)
- **Reader** - Person who proclaims Scripture (except Gospel)
- **Report Builder** - System for generating administrative reports
- **Sacrament** - Outward sign instituted by Christ conferring grace
- **Sacramental** - Sacred sign instituted by Church preparing for grace
- **Second Reading** - Scripture reading from New Testament letters
- **Sponsor** - See Godparent
- **Template** - Pre-configured liturgy structure for reuse
- **Wedding** - Sacrament of Matrimony
- **WithRelations** - Interface pattern including all related data

---

## Usage in Code

### Referring to Readers

```typescript
// ✅ CORRECT - Use specific reader fields
interface Wedding {
  first_reading_reader_id: string | null
  second_reading_reader_id: string | null
  psalm_reader_id: string | null
  petitions_reader_id: string | null
}

// ✅ CORRECT - WithRelations interface expands to Person
interface WeddingWithRelations extends Wedding {
  first_reading_reader?: Person | null
  second_reading_reader?: Person | null
  psalm_reader?: Person | null
  petitions_reader?: Person | null
}

// ✅ CORRECT - Display in UI (using database-generated full_name)
<p>First Reading: {wedding.first_reading_reader.full_name}</p>
<p>Petitions: {wedding.petitions_reader.full_name}</p>
```

### Referring to Presiders

```typescript
// ✅ CORRECT - Presider field
interface Mass {
  presider_id: string | null
}

interface MassWithRelations extends Mass {
  presider?: Person | null
}

// Display (using database-generated full_name)
<p>Presider: {mass.presider.full_name}</p>
```

### Working with Event Types

```typescript
// Event interface
interface Event {
  id: string
  parish_id: string
  name: string
  event_type_id?: string | null        // User-configured event type
  related_event_type?: string | null   // System-defined module link
  // ... other fields
}

// ✅ CORRECT - Display user-configured event type
// Fetch the EventType record and display its name
const eventType = await getEventType(event.event_type_id)
<p>Type: {eventType?.name}</p>  // Shows "Staff Meeting", "Parish Festival", etc.

// ✅ CORRECT - Check system-defined related event type
if (event.related_event_type === 'WEDDING') {
  // This event is linked to a wedding module record
}

// ✅ CORRECT - Filter events by related type
const weddingEvents = events.filter(e => e.related_event_type === 'WEDDING')
```

---

## Summary

This document defines the liturgical and application-specific terminology used throughout Outward Sign. Understanding these terms is essential for:

- **Implementing features** correctly according to Catholic liturgical practices
- **Naming database fields** and TypeScript interfaces appropriately
- **Creating user interfaces** that use proper liturgical terminology
- **Communicating** with parish staff and users effectively

**Key Principle:** Outward Sign respects and accurately represents Catholic liturgical traditions while providing modern software tools for parish management.

For implementation patterns using these concepts, see:
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - How to build modules
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture and patterns
- [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) - Document generation
- [CONSTANTS_PATTERN.md](./CONSTANTS_PATTERN.md) - Using constants and labels
