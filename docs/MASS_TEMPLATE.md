# Mass Template System - Documentation Index

> **Purpose:** Navigation hub for the Mass Role Template system documentation. This system enables parishes to create reusable templates for different types of Masses and manage liturgical role assignments.

## Quick Start

**What is the Mass Template System?**
The Mass Role Template system allows parishes to:
- Define reusable templates for different Mass types (Sunday Mass, Weekday Mass, etc.)
- Specify which liturgical roles are needed and how many people per role
- Assign specific people to roles for individual Masses
- Maintain consistent role configurations across similar Masses

**Four Key Components:**
1. **Mass Roles** - Liturgical role definitions (Lector, EEM, Altar Server, etc.)
2. **Mass Role Templates** - Reusable configurations (e.g., "Sunday Mass - Full Choir")
3. **Mass Role Template Items** - Individual role requirements within templates (e.g., "3 Lectors needed")
4. **Mass Role Instances** - Actual person-to-role assignments for specific Masses

---

## Documentation Structure

### [OVERVIEW.md](./mass-template/OVERVIEW.md)
**System architecture and core concepts**

**Read this for:**
- Understanding the four-table structure
- System architecture diagrams
- TypeScript interface definitions
- Data structure examples
- How the components relate to each other

**Topics covered:**
- System overview and key concepts
- Four-table architecture
- Data structures and interfaces
- Key relationships between tables

---

### [DATABASE.md](./mass-template/DATABASE.md)
**Database schema, migrations, and constraints**

**Read this for:**
- Complete table schemas
- Migration files and execution order
- Indexes and constraints
- RLS policies
- Foreign key cascade rules
- Delete protection logic

**Topics covered:**
- All four database tables (mass_roles, mass_roles_templates, mass_roles_template_items, mass_role_instances)
- Migration file details
- Indexes for performance
- Table relationships and cascade behavior
- Row-level security policies

---

### [WORKFLOWS.md](./mass-template/WORKFLOWS.md)
**Step-by-step workflows and real-world examples**

**Read this for:**
- Complete workflow from setup to assignment
- Real-world example: St. Mary's Parish
- Database state at each step
- Phase-by-phase implementation guide
- SQL query examples

**Topics covered:**
- Phase 1: Define Mass Roles
- Phase 2: Create Mass Role Template
- Phase 3: Add Roles to Template
- Phase 4: Create Mass Event
- Phase 5: Assign People to Roles
- Phase 6: View Assignments
- Complete real-world example with sample data

---

### [IMPLEMENTATION.md](./mass-template/IMPLEMENTATION.md)
**Components, server actions, and UI implementation**

**Read this for:**
- Component structure and file organization
- Server action API reference
- UI behavior patterns
- Drag-and-drop implementation
- Code examples and snippets
- Delete protection logic

**Topics covered:**
- Template management components (9 files)
- Template item components (3 components)
- Mass form integration
- Complete server actions API
- UI behavior (drag-and-drop, debouncing, role assignment)
- Code examples for common operations

---

## Common Tasks

### Creating a New Template

**Files to read:**
- [WORKFLOWS.md](./mass-template/WORKFLOWS.md) - See Phases 1-3
- [IMPLEMENTATION.md](./mass-template/IMPLEMENTATION.md) - See "Complete Create Template Flow"

**Quick reference:**
1. Create template header (name, description)
2. Redirect to edit page
3. Add roles using `MassRolePicker`
4. Set count for each role (1-99)
5. Reorder roles via drag-and-drop

---

### Assigning People to Mass Roles

**Files to read:**
- [WORKFLOWS.md](./mass-template/WORKFLOWS.md) - See Phases 4-6
- [IMPLEMENTATION.md](./mass-template/IMPLEMENTATION.md) - See "Role Assignment in Mass Form"

**Quick reference:**
1. Create and save Mass first
2. Select template (optional but recommended)
3. For each role, click "Add Person"
4. Select person from `PeoplePicker`
5. Repeat until all roles filled

---

### Understanding Database Relationships

**Files to read:**
- [OVERVIEW.md](./mass-template/OVERVIEW.md) - See "System Architecture"
- [DATABASE.md](./mass-template/DATABASE.md) - See "Table Relationships"

**Quick reference:**
- Mass Roles define what roles exist
- Templates group roles together with counts
- Template Items link roles to templates
- Instances assign people to roles for specific Masses

---

### Working with Drag-and-Drop

**Files to read:**
- [IMPLEMENTATION.md](./mass-template/IMPLEMENTATION.md) - See "Template Item Drag-and-Drop"

**Quick reference:**
- Uses `@dnd-kit/core` library
- Zero-based position values (0, 1, 2, ...)
- Optimistic UI updates
- Automatic gap closing on delete

---

## Related Documentation

### Mass Module
- [MASSES.md](./MASSES.md) - Complete Mass module architecture and future features

### Standard Patterns
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Standard 9-file module structure
- [FORMS.md](./FORMS.md) - Form patterns and component usage
- [DRAG_AND_DROP.md](./DRAG_AND_DROP.md) - Drag-and-drop implementation patterns

### Component Library
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Reusable components including pickers

### Database
- [DATABASE.md](./DATABASE.md) - General database procedures and migration workflows

---

## Data Flow Summary

```
1. Parish creates Mass Roles (one-time setup)
   └─> Stored in: mass_roles table

2. Staff creates Mass Role Template
   └─> Stored in: mass_roles_templates table

3. Staff adds roles to template with counts
   └─> Stored in: mass_roles_template_items table
   └─> Links: template_id + mass_role_id + count + position

4. Staff creates Mass and selects template
   └─> Stored in: masses table
   └─> Optional: mass_roles_template_id field

5. Staff assigns people to roles for specific Mass
   └─> Stored in: mass_role_instances table
   └─> Links: mass_id + person_id + mass_roles_template_item_id

6. System displays assignments with role names
   └─> Joins: instances → template_items → mass_roles
```

---

## File Locations

### Component Files
- Templates: `src/app/(main)/mass-role-templates/`
- Template Items: `src/components/mass-role-template-*`
- Mass Form: `src/app/(main)/mass-liturgies/mass-liturgy-form.tsx`

### Server Actions
- Templates: `src/lib/actions/mass-role-templates.ts`
- Template Items: `src/lib/actions/mass-role-template-items.ts`
- Instances: `src/lib/actions/mass-roles.ts`

### Type Definitions
- Base types: `src/lib/types.ts`
- WithRelations: In respective server action files

### Migrations
- Directory: `supabase/migrations/`
- Files: `20251110000005_create_mass_roles_table.sql` and related

---

## Last Updated

**Date:** 2025-12-02
**Status:** Current implementation fully documented
**Coverage:** Complete system documentation across 4 focused files

---

## Navigation

**Pick the file that best matches your needs:**
- **Architecture questions?** → [OVERVIEW.md](./mass-template/OVERVIEW.md)
- **Database questions?** → [DATABASE.md](./mass-template/DATABASE.md)
- **Workflow questions?** → [WORKFLOWS.md](./mass-template/WORKFLOWS.md)
- **Implementation questions?** → [IMPLEMENTATION.md](./mass-template/IMPLEMENTATION.md)
