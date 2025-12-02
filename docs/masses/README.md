# Mass Module Documentation

> **Navigation Hub:** Complete documentation for the Mass module including scheduling, role assignments, and liturgical preparation.

## Quick Links

### Core Documentation
- **[Overview & Implementation Status](./MASSES_OVERVIEW.md)** - Current implementation, what's working, what's planned
- **[Role System](./MASSES_ROLE_SYSTEM.md)** - Role definitions, templates, membership, availability
- **[Mass Scheduling](./MASSES_SCHEDULING.md)** - Individual and bulk scheduling workflows, auto-assignment algorithm
- **[User Interfaces](./MASSES_UI.md)** - Minister-facing and coordinator-facing UI specifications

### Reference
- **[Database Schema](./MASSES_DATABASE.md)** - Complete schema reference, migrations, relationships
- **[Server Actions](./MASSES_SERVER_ACTIONS.md)** - CRUD operations, mass role instances, intention linking

## What is the Mass Module?

The Mass module manages Sunday and weekday Mass celebrations including:
- **Mass Planning** - Schedule Masses, assign presider/homilist, link to liturgical calendar
- **Role Assignment** - Assign ministers to liturgical roles (lectors, servers, ushers, etc.)
- **Communication** - Notify ministers, handle substitute requests (planned)
- **Liturgical Preparation** - Manage readings, petitions, announcements, intentions
- **Execution** - Print scripts and coordination materials

## Core Belief

A well-prepared Mass requires clear communication with all ministers, proper scheduling, and printable liturgical scripts ready in the sacristy.

## Getting Started

1. **New to Mass module?** Start with [Overview & Implementation Status](./MASSES_OVERVIEW.md)
2. **Setting up roles?** See [Role System](./MASSES_ROLE_SYSTEM.md)
3. **Scheduling Masses?** See [Mass Scheduling](./MASSES_SCHEDULING.md)
4. **Building UI?** See [User Interfaces](./MASSES_UI.md)

## Key Features

### ✅ Implemented
- Standard 9-file module structure (CRUD operations)
- Event picker integration
- People picker for presider/homilist
- Liturgical event picker
- Mass Intentions (separate module, linked via event)
- Bulk scheduling wizard with auto-assignment algorithm
- Role membership tables
- Blackout date tracking
- Conflict detection

### ⏳ Planned
- Role assignment UI in Mass form
- Minister confirmation workflow
- Substitute request system
- Email/SMS notifications
- Minister self-service portal
- Assignment history tracking

## Related Documentation

- **[MASS_SCHEDULING.md](../MASS_SCHEDULING.md)** - Complete bulk scheduling wizard documentation
- **[MODULE_COMPONENT_PATTERNS.md](../MODULE_COMPONENT_PATTERNS.md)** - Standard 9-file module structure
- **[GROUP_MEMBERS.md](../GROUP_MEMBERS.md)** - Similar person-role membership pattern

---

**Last Updated:** 2025-12-02
**Status:** Active Development
**Current Focus:** Bulk scheduling wizard (implemented), enhanced assignment UI (planned)
