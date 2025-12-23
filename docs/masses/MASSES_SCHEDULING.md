# Mass Module - Scheduling Workflows

> **Purpose:** Individual and bulk Mass scheduling workflows, auto-assignment algorithm details.

## Table of Contents

- [Individual Mass Creation](#individual-mass-creation)
- [Bulk Mass Scheduling](#bulk-mass-scheduling)

---

## Individual Mass Creation

**Standard workflow for creating a single Mass:**

1. Navigate to `/mass-liturgies` → Click "Create New Mass"
2. Fill Mass Form:
   - Select/create Event (date, time, location)
   - Select presider and homilist (People Picker)
   - Select liturgical calendar date (optional)
   - Select Mass Role Template (optional)
   - Add announcements, petitions, notes
3. Save Mass
4. (Future) Assign ministers to roles via role assignment UI

**File References:**
- Form: `src/app/(main)/mass-liturgies/mass-liturgy-form.tsx`
- Create page: `src/app/(main)/mass-liturgies/create/page.tsx`
- Server action: `src/lib/actions/mass-liturgies.ts:createMass()`

---

## Bulk Mass Scheduling

**For scheduling multiple Masses over a period:**

Use the Mass Scheduling Wizard at `/mass-liturgies/schedule`. This provides:
- Date range selection
- Recurring schedule pattern (days/times)
- Template-based role requirements
- Automatic minister assignment algorithm
- Interactive assignment editor

**See [MASS_SCHEDULING.md](../MASS_SCHEDULING.md) for complete documentation** of the bulk scheduling workflow, including:
- Wizard steps (5-step process)
- Auto-assignment algorithm details
- Assignment editor features
- Server action specifications
- Testing guidelines

**File References:**
- Wizard: `src/app/(main)/mass-liturgies/schedule/schedule-masses-client.tsx`
- Server action: `src/lib/actions/mass-scheduling.ts:scheduleMasses()`
- Assignment grid: `src/components/mass-schedule-assignment-grid.tsx`

---

## Related Documentation

- **[MASS_SCHEDULING.md](../MASS_SCHEDULING.md)** - Complete bulk scheduling wizard documentation
- **[MASSES_ROLE_SYSTEM.md](./MASSES_ROLE_SYSTEM.md)** - Role templates and membership
- **[MASSES_SERVER_ACTIONS.md](./MASSES_SERVER_ACTIONS.md)** - Server action reference

---

**Last Updated:** 2025-12-02
