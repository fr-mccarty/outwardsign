# Mass Module - Server Actions Reference

> **Purpose:** Complete reference for Mass server actions including CRUD operations, mass role instances, and mass intention linking.

## Table of Contents

- [Mass CRUD Operations](#mass-crud-operations)
- [Mass Role Instance Functions](#mass-role-instance-functions)
- [Mass Intention Linking Functions](#mass-intention-linking-functions)
- [Mass Scheduling Operations](#mass-scheduling-operations)

---

## Mass CRUD Operations

**File:** `src/lib/actions/masses.ts`

**Key Functions:**
- `getMasses(filters?)` - Fetch masses with presider/homilist/event relations
- `getMassesPaginated(params?)` - Paginated mass list
- `getMass(id)` - Fetch single mass
- `getMassWithRelations(id)` - Fetch mass with ALL relations including mass_roles array
- `createMass(data)` - Create new mass
- `updateMass(id, data)` - Update mass
- `deleteMass(id)` - Delete mass

**TypeScript Interfaces:**
- `Mass` - Base mass type
- `MassWithNames` - Mass with presider/homilist/event names
- `MassWithRelations` - Mass with all related data including mass_roles array
- `CreateMassData` - Create payload
- `UpdateMassData` - Update payload (all optional)

---

## Mass Role Instance Functions

**File:** `src/lib/actions/masses.ts`

**Functions:**
- `getMassRoles(massId)` - Get all role assignments for a specific mass
- `createMassRole(data)` - Create a single mass role assignment
- `updateMassRole(id, data)` - Update a mass role assignment
- `deleteMassRole(id)` - Delete a mass role assignment
- `bulkCreateMassRoles(massId, assignments)` - Create multiple role assignments at once
- `applyMassTemplate(data)` - Apply a role template to a mass (creates role instances from template)

---

## Mass Intention Linking Functions

**File:** `src/lib/actions/masses.ts`

**Functions:**
- `linkMassIntention(massId, massIntentionId)` - Link a mass intention to a mass
- `unlinkMassIntention(massIntentionId)` - Remove the link between a mass intention and its mass

---

## Mass Scheduling Operations

**File:** `src/lib/actions/mass-scheduling.ts`

**Primary Function:**
- `scheduleMasses(params)` - Bulk create Masses with auto-assignment
- Returns: Created masses count, assignment statistics, detailed results

**Supporting Functions:**
- `getAvailableMinisters(roleId, date, time, parishId)` - Get eligible ministers
- `assignMinisterToRole(massRoleInstanceId, personId)` - Manual assignment
- `getPersonSchedulingConflicts(personId, startDate, endDate)` - Check blackouts

**See [MASS_SCHEDULING.md](../MASS_SCHEDULING.md)** for complete server action specifications.

---

## Related Documentation

- **[MASSES_OVERVIEW.md](./MASSES_OVERVIEW.md)** - Implementation status
- **[MASSES_SCHEDULING.md](./MASSES_SCHEDULING.md)** - Scheduling workflows
- **[MASS_SCHEDULING.md](../MASS_SCHEDULING.md)** - Bulk scheduling wizard

---

**Last Updated:** 2025-12-02
