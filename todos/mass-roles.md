# Mass Roles Implementation

**Priority:** High
**Status:** Planning

## Goal

Implement Mass Roles functionality to assign people to liturgical roles for each Mass.

## Features Needed

1. Assign people to liturgical roles for masses
2. Filter/search people by their group roles
3. Apply mass templates to auto-populate role assignments
4. Track assignment status (assigned, confirmed, declined)
5. Allow roles to remain empty/unfilled

## Database

**Tables exist:** ✅
- `mass_roles` - Junction table linking masses, people, and roles
- `mass_roles_templates` - Template definitions with role requirements
- `roles` - Role definitions (from groups module)

**Need to add:**
- [ ] Status tracking columns to `mass_roles` table (status, confirmed_at, notified_at, notes)
- [ ] Create migration: `supabase/migrations/YYYYMMDD_add_mass_roles_status_tracking.sql`

## Implementation Phases

### Phase 1: Database & Server Actions
- [ ] Create migration for status tracking
- [ ] Add mass role types and server actions to `lib/actions/masses.ts`
- [ ] Add constants to `lib/constants.ts` (MASS_ROLE_STATUS_VALUES)

### Phase 2: Mass Role Picker Component
- [ ] Create `MassRolePicker` component (`src/components/mass-role-picker.tsx`)
- [ ] Implement search & filter by group role
- [ ] Support single select with empty option
- [ ] Use CorePicker pattern

### Phase 3: Mass Form Integration
- [ ] Add role assignment section to mass form
- [ ] Add template selector dropdown
- [ ] Add "Apply Template" button
- [ ] Create RoleAssignmentSection component
- [ ] Integrate MassRolePicker for each role

### Phase 4: View Page
- [ ] Display role assignments on mass view page
- [ ] Show unfilled roles
- [ ] Color-code by status

## Questions to Resolve

1. Can one person be assigned to multiple roles in the same mass?
2. Should applying template overwrite existing assignments or merge?
3. Should we show recent assignment count for rotation?
4. How to handle template parameters JSONB structure?

## Related Documentation

- [MASSES.md](../docs/MASSES.md) - Complete Mass module architecture
- [COMPONENT_REGISTRY.md](../docs/COMPONENT_REGISTRY.md) - Reusable components
- [PICKER_PATTERNS.md](../docs/PICKER_PATTERNS.md) - Picker behavior guidelines
