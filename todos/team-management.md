# Team Management - Remaining Work

**Priority:** High
**Status:** Partially Complete

## Completed ✅

- [x] Parish invitations table and migration
- [x] Invitation server actions (create, list, revoke, resend, accept)
- [x] Invitation UI in Parish Settings
- [x] Email sending via AWS SES
- [x] Role selection (admin, staff, ministry-leader, parishioner)
- [x] Module selection for ministry-leader role
- [x] Magic link (passwordless) authentication

## Remaining Work

### Phase 3: Module Sharing (Parishioner → Family)

**Purpose:** Allow parishioners to share read-only access to sacramental records with family members.

- [ ] **Database:** Create `module_shares` table
  - Fields: id, parish_id, module_type, module_id, token, expires_at, created_by_user_id
  - Add RLS policies

- [ ] **Server Actions:** Create share actions
  - `createModuleShare(moduleType, moduleId): Promise<ShareLink>`
  - `listModuleShares(moduleId): Promise<Share[]>`
  - `revokeModuleShare(shareId): Promise<void>`

- [ ] **UI:** Add "Share" button to module view pages
  - Wedding, Funeral, Baptism, Presentation, Quinceañera view pages

- [ ] **UI:** Create share modal
  - Shows generated magic link
  - Shows expiration date (1 year)
  - Copy to clipboard button
  - Optional: Send via email

- [ ] **Routes:** Create public share routes
  - `/shared/weddings/[token]`, `/shared/funerals/[token]`, etc.

- [ ] **Testing:** End-to-end share flow

### Phase 4: Permission Enforcement

**Purpose:** Enforce role-based access control across all modules.

- [ ] **Server:** Create permission helper functions in `lib/auth/permissions.ts`
  - `canEditModule(userParish, moduleName): boolean`
  - `canManageParishioners(userParish): boolean`
  - `canManageTemplates(userParish): boolean`

- [ ] **Server:** Update all server actions with permission checks
  - Wedding, Funeral, Baptism, Presentation, Quinceañera, Mass, Groups actions

- [ ] **UI:** Hide/disable elements based on role
  - Edit/Delete buttons for non-staff
  - Settings pages for non-admin
  - Create buttons based on module access (ministry-leaders)

- [ ] **Testing:** Role-based access control
  - Admin can access everything
  - Staff can access all modules
  - Ministry-leader can only access enabled modules
  - Parishioner cannot access module creation/editing

## Critical Next Steps

1. **Recommended:** Complete Phase 4 (Permission Enforcement) first - security concern
2. **Then:** Implement Phase 3 (Module Sharing) - nice-to-have feature

## Related Documentation

- [TEAM_MANAGEMENT.md](../docs/TEAM_MANAGEMENT.md) - Complete team management documentation
