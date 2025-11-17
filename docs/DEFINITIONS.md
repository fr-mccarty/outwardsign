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

### Liturgical Events
Events that are part of the liturgical calendar:
- **MASS** - Celebration of the Eucharist
- **WEDDING_CEREMONY** - Marriage liturgy
- **FUNERAL_MASS** - Funeral with Mass
- **FUNERAL_SERVICE** - Funeral without Mass (Liturgy of the Word)
- **BAPTISM** - Sacrament of Baptism
- **QUINCEANERA_MASS** - Quinceañera with Mass
- **PRESENTATION** - Presentation ceremony

### Social Events
Non-liturgical celebrations connected to sacraments/sacramentals:
- **WEDDING_RECEPTION** - Meal and celebration after wedding
- **REHEARSAL** - Practice before wedding or funeral
- **GATHERING** - Social gathering (e.g., after funeral, "repast")

### Planning Events
Administrative meetings and preparation:
- **MEETING** - Planning or preparation meeting
- **PREPARATION** - Preparation session (e.g., marriage prep, baptism class)

**See:** `EVENT_TYPE_VALUES` and `EVENT_TYPE_LABELS` in `src/lib/constants.ts`

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

// ✅ CORRECT - Display in UI
<p>First Reading: {formatPersonName(wedding.first_reading_reader)}</p>
<p>Petitions: {formatPersonName(wedding.petitions_reader)}</p>
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

// Display
<p>Presider: {formatPersonName(mass.presider)}</p>
```

### Event Type Labels

```typescript
// ❌ WRONG - Never display raw event type
<p>{event.event_type}</p>  // Shows "WEDDING_CEREMONY"

// ✅ CORRECT - Use labels
import { EVENT_TYPE_LABELS } from '@/lib/constants'
<p>{EVENT_TYPE_LABELS[event.event_type].en}</p>  // Shows "Wedding Ceremony"
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
