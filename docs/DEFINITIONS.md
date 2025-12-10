# Definitions

> **Note:** This document is narrative-only. It provides conceptual definitions and explanations without code snippets. For implementation details and code examples, see the referenced documentation files.

This document provides definitions for liturgical terminology and application-specific concepts used throughout Outward Sign. These terms are essential for understanding the Catholic liturgical context and the application's domain model.

---

## Table of Contents

- [Liturgical Roles](#liturgical-roles)
- [Sacraments vs Sacramentals](#sacraments-vs-sacramentals)
- [Liturgical Elements](#liturgical-elements)
- [User-Defined Event System](#user-defined-event-system)
- [Application Concepts](#application-concepts)
- [Quick Reference Glossary](#quick-reference-glossary)

---

## Liturgical Roles

### Presider

The priest or deacon who leads the liturgical celebration. The presider is the primary celebrant of the sacrament or sacramental. A priest celebrates a Wedding Mass, a deacon might lead a Funeral Service, and a priest presides at a Baptism. In the user-defined event system, a presider would typically be captured through a Person-type input field named "Presider" or "Celebrant."

### Reader (Lector)

A person who proclaims the Word of God during the liturgy. Readers proclaim the readings from Scripture, excluding the Gospel (which is always read by a deacon or priest). Readers may proclaim the First Reading (from the Old Testament or Acts of the Apostles), the Second Reading (from New Testament letters), lead the Responsorial Psalm, or read the Petitions (Prayers of the Faithful).

In the user-defined event system, readers can be captured through Person-type input fields. An event type might have separate fields for "First Reading Reader," "Second Reading Reader," "Psalm Reader," and "Petitions Reader," or a simpler setup with just a "Reader" field.

### Minister

A broad term for anyone who serves in a liturgical capacity. Ministers include Extraordinary Ministers of Holy Communion (who assist with distributing communion), Altar Servers (who assist the priest at the altar), Music Ministers (who lead music and singing), Ushers and Greeters (who welcome people and assist with seating), and Sacristans (who prepare the church and liturgical items).

In the user-defined event system, ministers can be captured through Person-type or Group-type input fields depending on how the parish wants to track them.

### Godparent / Sponsor

A person who presents someone for a sacrament and commits to supporting their faith journey. Godparents present infants for Baptism, Sponsors present candidates for Confirmation, and Padrinos and Madrinas (the Spanish terms for godparents) serve similar roles at Quinceañeras and Presentations.

In the user-defined event system, godparents and sponsors are captured through Person-type input fields with names like "Godmother," "Godfather," "Sponsor," "Padrino," or "Madrina."

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

The proclamation of Jesus Christ's life, ministry, death, and resurrection, read from one of the four Gospels: Matthew, Mark, Luke, or John. The Gospel is always proclaimed by a deacon or priest, never by a lay reader. In the user-defined event system, the Gospel reading can be captured through a Text-type input field or by referencing a Custom List of Gospel passages.

### First Reading

The first Scripture reading in the Liturgy of the Word, typically from the Old Testament or Acts of the Apostles. The First Reading is proclaimed by a lay reader. Parishes can capture this through a Text-type input field for free-form entry or a List Item field that references a Custom List of approved readings.

### Second Reading

The second Scripture reading in the Liturgy of the Word, from the New Testament letters (epistles). Like the First Reading, this is proclaimed by a lay reader. It can be captured through Text or List Item fields in the user-defined event system.

### Responsorial Psalm

A psalm sung or recited between the First and Second Readings, typically with a response that the assembly repeats. The Responsorial Psalm may be led by a reader, cantor, or music minister. Parishes often maintain a Custom List of common psalm responses for selection.

### Petitions (Prayers of the Faithful / General Intercessions)

Prayers of intercession for the Church, world, those in need, and the local community. The assembly responds to each petition (commonly "Lord, hear our prayer"). Petitions are read by a lay reader. In the user-defined event system, petitions can be captured through Rich Text fields or multiple Text fields depending on how the parish wants to manage them.

### Homily

The priest or deacon's reflection on the Scripture readings, applying them to the lives of the faithful. The homily is given by the presider and is typically not stored in the system since it is prepared by the celebrant rather than planned by parish staff.

---

## User-Defined Event System

Outward Sign uses a fully flexible, user-defined event system. Rather than hardcoded modules for specific sacraments, parish administrators define their own event types with custom fields, scripts, and templates. This approach allows parishes to manage any type of liturgical or parish event while maintaining the ability to generate professional documents and programs.

### Event Type

An Event Type is a user-defined category that represents a kind of parish event or sacrament. Each parish can create and customize their own event types through the Settings area.

Event types serve as templates that define what information should be collected for events of that type. For example, a "Wedding" event type would define fields for the bride, groom, ceremony date, location, and other wedding-specific information. A "Funeral" event type would define different fields appropriate for funeral planning.

Each event type has a name chosen by the parish (such as "Wedding," "Funeral," "Baptism," or "Youth Retreat"), an icon for display in the navigation sidebar, and an order that determines where it appears in the menu. Parishes can create event types for any purpose—not just sacraments, but also staff meetings, parish festivals, or any recurring event that benefits from structured data collection and document generation.

Event types are managed by parish administrators and appear dynamically in the application's sidebar navigation. When an administrator creates a new event type, it immediately becomes available for staff to create events of that type.

### Input Field

An Input Field is a data field definition that belongs to an event type. Input fields define what information can be collected when creating an event of that type. Each field has a name (like "Bride" or "Ceremony Date"), a type that determines how the field is displayed and validated, and whether the field is required.

The available field types include Person (references a person in the parish database), Group (references a group), Location (references a location), Date, Time, Text, Rich Text, Number, Yes/No toggle, and List Item (allows selection from a custom list of options).

For Person-type fields, there is a special "Key Person" designation. Fields marked as key persons are used for searching and display in event lists. For example, in a Wedding event type, both "Bride" and "Groom" would be marked as key persons so that searching for "Smith" would find weddings where either the bride or groom has that name.

Input fields are ordered, and this order determines how they appear on the event creation and edit forms. Administrators can drag fields to reorder them as needed.

### Custom List

A Custom List is a parish-defined set of options that can be used in List Item fields. Custom lists allow parishes to maintain their own sets of choices for things like songs, readings, or any other selectable options.

For example, a parish might create a "Wedding Songs" custom list containing titles of songs commonly used at weddings. When defining an "Opening Song" field on the Wedding event type, the administrator would select "List Item" as the field type and choose the "Wedding Songs" custom list. When staff create a wedding event, they would see a dropdown with all the songs from that list.

Custom lists are shared across event types within a parish, so a "Responsorial Psalms" list could be used by Wedding, Funeral, and Baptism event types. Each list contains ordered items that can be added, removed, or reordered by parish staff.

### Script

A Script is an ordered collection of sections that together form a printable document for an event. Scripts are attached to event types, and each event type can have multiple scripts. For example, a Wedding event type might have an "English Wedding Program" script and a "Spanish Wedding Program" script.

Scripts serve as templates for generating documents like worship aids, programs, bulletins, or any printed material needed for the celebration of an event. When staff view an individual event, they can preview and export any of the scripts defined for that event's type, with all the placeholder fields replaced with the actual event data.

Scripts can be exported in multiple formats: PDF for high-quality printing, Word document for further editing, a print-optimized HTML view, or plain text. This flexibility allows parishes to use the generated documents however works best for their workflow.

### Section

A Section is a block of content within a script. Each section has a name (like "Welcome" or "Order of Service"), content written in markdown format, and an optional page break indicator.

Section content can include placeholder syntax to insert event data dynamically. When the script is rendered for a specific event, these placeholders are replaced with the actual values. For example, a section might contain "Please join us in celebrating the wedding of {{Bride}} and {{Groom}}" and when rendered for a specific wedding, the names would be inserted automatically.

Sections support rich text formatting through markdown, including bold, italic, headings, and lists. A special syntax allows text to be displayed in red, which is commonly used in liturgical documents to indicate rubrics (instructions for the celebrant).

Sections are ordered within their script and can be reordered by dragging. Each section can optionally have a page break after it, which is useful for creating multi-page documents like wedding programs.

### Occasion

An Occasion is a date, time, and location entry attached to an event. Events do not have their own date or time fields—instead, they have one or more occasions that specify when and where things happen.

This design accommodates events that involve multiple gatherings. A wedding, for example, might have occasions for the rehearsal, the ceremony, and the reception, each with different dates, times, and locations. A funeral might have occasions for the visitation, the funeral Mass, and the committal service.

Each occasion has a label (like "Rehearsal" or "Ceremony"), an optional date, an optional time, and an optional location reference. One occasion on each event must be marked as the "primary" occasion, which is the one displayed in event lists and used for calendar integration. For a wedding, this would typically be the ceremony; for a funeral, the funeral Mass.

### Event

An Event is a specific instance of an event type. When staff create a "Wedding" event, they are creating an instance of the Wedding event type with specific data filled in for all the defined fields.

Events store their field values in a flexible format that matches whatever fields are defined on their event type. This means that when an administrator adds a new field to an event type, existing events of that type can have that field filled in through editing, while new events will have the field available during creation.

Events are parish-scoped, meaning each event belongs to a specific parish and is only visible to users of that parish. Events can be searched by their key person names, filtered by date range (based on the primary occasion), and organized by event type.

### Document

A Document is an uploaded file attached to an event through a Document-type input field. Documents are stored in secure cloud storage and can only be accessed by authenticated users of the parish.

Documents are used for reference materials that should be attached to an event but not included in the script output. For example, a wedding event might have a field for uploading the marriage license or a photo for the bulletin announcement. These files are available for download from the event view but are not rendered into the scripts.

---

## Application Concepts

### Parish

The local Catholic faith community. In Outward Sign, all data is scoped to parishes—each record belongs to a specific parish and users can only access data for parishes they belong to. This multi-tenancy design ensures that each parish's data is completely separated and secure.

### Reference Data

While events are managed through the user-defined event system, certain types of data exist as shared reference data that events can reference. People, Groups, and Locations are managed as separate entities that can be linked to events through Person, Group, and Location type input fields. This allows the same person, group, or location to be associated with many different events without duplicating information.

### Report Builder

A system for generating tabular reports with aggregations and filtering. Report builders are used for administrative reports that present data in table format with summary statistics, such as Mass Intentions reports. Unlike scripts which are document-oriented, report builders focus on data presentation and analysis.

### WithRelations Pattern

A pattern for working with entities that have related data. When fetching an entity like an event, you often need not just the event itself but also its related data—the event type, the people referenced in fields, the locations, and so on. The WithRelations pattern describes how an entity is fetched along with all its related entities, making the data immediately available for display without additional queries.

For implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Quick Reference Glossary

**Alphabetical list of key terms:**

- **Baptism** - Sacrament of initiation into Christian faith
- **Custom List** - Parish-defined set of selectable options for List Item fields
- **Document** - Uploaded file attached to an event through a Document-type field
- **Event** - Specific instance of an event type with filled-in field values
- **Event Type** - User-defined category that defines fields, scripts, and structure for a kind of event
- **First Reading** - Scripture reading from Old Testament or Acts
- **Funeral** - Sacramental celebration of Christian death
- **Godparent** - Person who presents someone for Baptism
- **Gospel** - Scripture reading from Matthew, Mark, Luke, or John
- **Homily** - Priest/deacon's reflection on Scripture readings
- **Input Field** - Data field definition belonging to an event type
- **Key Person** - Designation for Person-type fields used in searching and list display
- **Lector** - See Reader
- **Mass** - Celebration of the Eucharist (sacrament)
- **Mass Intention** - Prayer intention offered at a specific Mass
- **Minister** - Anyone serving in a liturgical capacity
- **Occasion** - Date, time, and location entry attached to an event
- **Parish** - Local Catholic faith community
- **Petitions** - Prayers of the Faithful / General Intercessions
- **Placeholder** - Syntax in section content that gets replaced with event data
- **Presider** - Priest or deacon leading the liturgical celebration
- **Presentation** - Latino tradition of presenting child to Mary (sacramental)
- **Primary Occasion** - The main occasion for an event, used in lists and calendars
- **Psalm** - Responsorial psalm between readings
- **Quinceañera** - Celebration of young woman's 15th birthday and faith (sacramental)
- **Reader** - Person who proclaims Scripture (except Gospel)
- **Sacrament** - Outward sign instituted by Christ conferring grace
- **Sacramental** - Sacred sign instituted by Church preparing for grace
- **Script** - Ordered collection of sections forming a printable document
- **Second Reading** - Scripture reading from New Testament letters
- **Section** - Block of content within a script with name, markdown content, and optional page break
- **Sponsor** - See Godparent
- **Wedding** - Sacrament of Matrimony

---

## Summary

This document defines the liturgical and application-specific terminology used throughout Outward Sign. Understanding these terms is essential for:

- Understanding the Catholic liturgical context in which the application operates
- Communicating effectively with parish staff and users
- Grasping how the user-defined event system allows flexible management of any parish event

Outward Sign respects and accurately represents Catholic liturgical traditions while providing modern, flexible software tools for parish management. The user-defined event system allows each parish to customize the application for their specific needs while maintaining professional document generation capabilities.

For implementation details and technical patterns, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture and patterns
- [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) - Document generation
- [requirements/user-defined-event-types.md](../requirements/user-defined-event-types.md) - Technical requirements
