# Mass Roles Entity Conversion

**Goal:** Convert mass roles from hardcoded constants to a full database entity with CRUD operations, similar to group roles.

**Current State:**
- Mass roles are defined as constants in `src/lib/constants.ts`
- Fixed values: LECTOR, EMHC, ALTAR_SERVER, CANTOR, USHER, SACRISTAN, MUSIC_MINISTER
- Cannot be customized per-parish

**Target State:**
- Mass roles stored in database table `mass_roles`
- Each parish can create/edit/delete their own mass roles
- UI for managing mass roles (similar to group roles management)
- Predefined roles seeded on parish creation

---

## Phase 1: Database Layer

### 1.1 Create Migration for mass_roles Table
- [ ] Create migration file `supabase/migrations/[timestamp]_create_mass_roles_table.sql`
- [ ] Table structure:
  ```sql
  CREATE TABLE mass_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_es TEXT,  -- Spanish translation
    description TEXT,
    note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER,  -- For sorting in UI
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- [ ] Add indexes:
  - `idx_mass_roles_parish_id`
  - `idx_mass_roles_is_active`
  - `idx_mass_roles_display_order`
- [ ] Add RLS policies (similar to group_roles)
- [ ] Add updated_at trigger

### 1.2 Create Seed/Migration for Default Mass Roles
- [ ] Create migration or seed function to populate default mass roles
- [ ] Add standard roles for each parish on creation:
  - Lector / Lector
  - Extraordinary Minister of Holy Communion / Ministro Extraordinario de la Comunión
  - Altar Server / Monaguillo
  - Cantor / Cantor
  - Usher / Ujier
  - Sacristan / Sacristán
  - Music Minister / Ministro de Música
- [ ] Consider adding this to parish creation process

### 1.3 Update Existing Mass Role References
- [ ] Migration to update existing `mass_role_template_items` table
  - Check if this table references mass roles by string constant
  - May need to add `mass_role_id UUID REFERENCES mass_roles(id)` column
  - Data migration to link existing role strings to new mass_role records
- [ ] Check `masses` table for any mass role references
- [ ] Check any other tables that reference mass roles

---

## Phase 2: Server Actions

### 2.1 Create Server Actions File
- [ ] Create `src/lib/actions/mass-roles.ts`
- [ ] Implement interfaces:
  ```typescript
  export interface MassRole {
    id: string
    parish_id: string
    name: string
    name_es?: string | null
    description?: string | null
    note?: string | null
    is_active: boolean
    display_order?: number | null
    created_at: string
    updated_at: string
  }

  export interface CreateMassRoleData {
    name: string
    name_es?: string
    description?: string
    note?: string
    is_active?: boolean
    display_order?: number
  }

  export interface UpdateMassRoleData {
    name?: string
    name_es?: string | null
    description?: string | null
    note?: string | null
    is_active?: boolean
    display_order?: number | null
  }
  ```

### 2.2 Implement CRUD Operations
- [ ] `getMassRoles(): Promise<MassRole[]>` - Fetch all for current parish
- [ ] `getMassRole(id: string): Promise<MassRole | null>` - Fetch single role
- [ ] `createMassRole(data: CreateMassRoleData): Promise<MassRole>` - Create new role
- [ ] `updateMassRole(id: string, data: UpdateMassRoleData): Promise<MassRole>` - Update role
- [ ] `deleteMassRole(id: string): Promise<void>` - Delete role (with validation)
- [ ] Add proper error handling and revalidation

### 2.3 Add Validation
- [ ] Prevent deletion of mass roles that are in use (check mass_role_template_items)
- [ ] Validate uniqueness of role names within a parish
- [ ] Ensure at least one active mass role exists per parish

---

## Phase 3: Constants Migration

### 3.1 Remove Old Constants
- [ ] Remove `MASS_ROLE_VALUES` from `src/lib/constants.ts`
- [ ] Remove `MassRoleType` type
- [ ] Remove `MASS_ROLE_LABELS` constant
- [ ] Keep comment explaining mass roles are now in database

### 3.2 Update TypeScript Types
- [ ] Export `MassRole` interface from server actions
- [ ] Update any code using `MassRoleType` to use `MassRole` or `string`
- [ ] Update imports across codebase

---

## Phase 4: UI Components

### 4.1 Create Mass Roles Management Page
- [ ] Create route: `src/app/(main)/settings/mass-roles/page.tsx`
- [ ] Similar structure to group roles management
- [ ] Features:
  - List all mass roles for current parish
  - Create new mass role (dialog/modal)
  - Edit mass role (inline or dialog)
  - Delete mass role (with confirmation)
  - Toggle active/inactive status
  - Reorder roles (drag and drop or up/down buttons)
  - Bilingual display (show both English and Spanish names)

### 4.2 Create Mass Role Form Components
- [ ] Create `src/components/mass-roles/mass-role-form-dialog.tsx`
- [ ] Form fields:
  - Name (English) - required
  - Name (Spanish) - optional
  - Description - optional
  - Note - optional
  - Active status - checkbox
  - Display order - number
- [ ] Validation and error handling

### 4.3 Update Pickers/Selectors
- [ ] Update `src/components/role-picker.tsx` (if it exists)
- [ ] Update `src/components/role-selector.tsx` (if it exists)
- [ ] Update any other components that display mass role dropdowns
- [ ] Load mass roles from database instead of constants
- [ ] Handle bilingual display

---

## Phase 5: Update Existing References

### 5.1 Find and Update All Usages
- [ ] Search codebase for `MASS_ROLE_VALUES` imports
- [ ] Search for `MASS_ROLE_LABELS` imports
- [ ] Search for `MassRoleType` usage
- [ ] Update each file to:
  - Fetch mass roles from database
  - Use `MassRole` interface instead of `MassRoleType`
  - Handle async data loading

### 5.2 Update Specific Files
- [ ] `src/app/(main)/groups/[id]/page.tsx`
  - Update `getRoleLabel()` function to look up from database roles
  - May need to fetch mass roles on page load
- [ ] `src/components/groups/add-membership-modal.tsx`
  - Update to fetch and display mass roles from database
  - Update `getRoleLabel()` function
- [ ] `src/app/(main)/mass-role-templates/` files
  - Check if templates reference mass roles
  - Update to use database-fetched roles
- [ ] Any mass management pages

### 5.3 Update Documentation
- [ ] Update `docs/MODULE_REGISTRY.md` - Remove constant reference, add database entity info
- [ ] Update `docs/COMPONENT_REGISTRY.md` - Update role picker documentation
- [ ] Update `docs/TEAM_MANAGEMENT.md` (if relevant)
- [ ] Update `CLAUDE.md` - Update role naming section
- [ ] Update `.claude/agents/MASSES_MODULE_IMPLEMENTATION_CHECKLIST.md`

---

## Phase 6: Settings Integration

### 6.1 Add to Settings Navigation
- [ ] Add "Mass Roles" to settings sidebar navigation
- [ ] Add appropriate icon
- [ ] Add to permissions check (admin/staff only)

### 6.2 Add to Permissions System
- [ ] Update `src/lib/auth/permissions.ts` if needed
- [ ] Ensure only admin/staff can manage mass roles
- [ ] Ministry leaders and parishioners should only view

---

## Phase 7: Testing

### 7.1 Database Tests
- [ ] Test mass_roles table creation
- [ ] Test RLS policies
- [ ] Test default role seeding

### 7.2 Server Action Tests
- [ ] Test CRUD operations
- [ ] Test validation rules
- [ ] Test deletion prevention when in use

### 7.3 UI Tests
- [ ] Test mass roles management page
- [ ] Test creating new mass role
- [ ] Test editing mass role
- [ ] Test deleting mass role
- [ ] Test role picker components with database roles
- [ ] Test bilingual display

### 7.4 Integration Tests
- [ ] Test mass role usage in mass templates
- [ ] Test mass role usage in group assignments
- [ ] Test role filtering and selection

---

## Phase 8: Data Migration

### 8.1 Existing Data Migration
- [ ] Create migration script for existing parishes
- [ ] Populate mass_roles table with default roles for all existing parishes
- [ ] Update any existing references in mass_role_template_items
- [ ] Verify data integrity after migration

### 8.2 Backwards Compatibility (if needed)
- [ ] Consider if any API contracts need to be maintained
- [ ] Plan deprecation strategy for old constant-based approach
- [ ] Update any external integrations

---

## Phase 9: Final Cleanup

### 9.1 Code Cleanup
- [ ] Remove any dead code related to old constants
- [ ] Remove unused imports
- [ ] Update all comments and documentation
- [ ] Run linter and type checker

### 9.2 Performance Optimization
- [ ] Add caching for mass roles if needed
- [ ] Optimize queries
- [ ] Consider adding database indexes for common queries

### 9.3 User Communication
- [ ] Add migration notes for users
- [ ] Document new mass roles management feature
- [ ] Create user guide for managing mass roles

---

## Notes

### Design Decisions to Consider:

1. **Should mass roles be parish-specific or global with parish overrides?**
   - Current plan: Parish-specific (like group roles)
   - Alternative: Global roles with ability to customize per parish

2. **Should we maintain backward compatibility?**
   - Current plan: Full migration, no backward compatibility
   - Alternative: Gradual migration with deprecation period

3. **Should there be "system" mass roles that can't be deleted?**
   - Consider marking default roles as `is_system: true`
   - Prevent deletion of system roles

4. **How to handle role ordering/sorting?**
   - Add `display_order` field
   - Allow drag-and-drop reordering in UI

5. **Bilingual approach:**
   - Store both `name` (English) and `name_es` (Spanish) in database
   - Fall back to `name` if `name_es` is not provided

### Potential Issues:

- **Breaking changes**: This will break existing code that uses `MASS_ROLE_VALUES`
- **Data migration**: Need to ensure all existing parishes get default roles
- **Performance**: Fetching roles from database vs constants (should be minimal impact)
- **Complexity**: Adds more UI and management overhead

### Benefits:

- ✅ Parish customization - each parish can define their own roles
- ✅ Consistency - mass roles work the same way as group roles
- ✅ Flexibility - add/remove/edit roles without code changes
- ✅ Better i18n - proper bilingual support in database
- ✅ Scalability - easier to add new fields or features in the future

---

**Estimated Effort:** Large (2-3 days of development + testing)

**Priority:** Medium (improves flexibility but not urgent)

**Risks:** Breaking changes, data migration complexity

**Created:** 2025-11-15
