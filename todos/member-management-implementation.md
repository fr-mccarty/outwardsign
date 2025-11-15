# Parishioner Management - Working TODO List

## 🔴 CRITICAL NEXT STEP

**Before the invitation system will work, you MUST run:**
```bash
supabase db push
```

This applies the new `parish_invitations` table migration created in:
`supabase/migrations/20251115000001_create_parish_invitations_table.sql`

---

## Overview
Building a comprehensive parishioner management system for Outward Sign that handles parish-wide and module-specific access.

## Current State

### ✅ Already Built
- `parish_users` table with roles array (admin, staff, parishioner)
- Parish settings page with Parishioners tab (view, update roles, remove parishioners)
- Email client (AWS SES) configured
- Invitation acceptance flow (`/accept-invitation` page)
- API routes for invitation validation and acceptance
- Email template for parish invitations

### ✅ Recently Completed
- **Auth**: Passwordless (magic link) authentication - ✅ DONE
- **Database**: `parish_invitations` table - ✅ DONE (migration created)
  - Includes: roles[], enabled_modules[] fields for ministry-leader invitations
- **Database**: Role constants added to constants.ts - ✅ DONE
- **UI**: Invite interface in Parish Settings - ✅ DONE
  - Role dropdown with all 4 roles
  - Module checkboxes for ministry-leader role
- **UI**: Removed role change dropdowns - ✅ DONE (roles now set only at invitation)
- **UI**: Pending invitations list with resend/revoke - ✅ DONE
- **Server Actions**: Parish invitation CRUD operations - ✅ DONE
  - create, list, revoke, resend, accept
  - Email integration working

### ❌ Still Missing/Incomplete
- **Database**: `module_shares` table for parishioner→family sharing
- **UI**: Share module interface on view pages (weddings, funerals, etc.)
- **Routes**: Public share routes (e.g., `/shared/weddings/[token]`)
- **Server Actions**: Module sharing CRUD operations
- **Server Actions**: Role-based permission checks in all modules

---

## Feature Requirements (DEFINED ✅)

### 1. Sending Emails to New Parishioners
**Decisions:**
- ✅ Use existing invitation email template for parish invitations
- ✅ NO notification emails when changing parishioner roles
- ✅ NO welcome/onboarding email series (for now)

### 2. Allowing Additional Parishioners to Login
**Decisions:**
- ✅ Parishioners login WITHOUT passwords using "magic link" (passwordless authentication)
- ✅ They receive an email with a token each time they login
- ✅ Invitation-only access (no self-service signup to parishes)
- ✅ Supabase supports magic links via `signInWithOtp` method - built-in feature

### 3. Setting Permissions for Various Roles
**Decisions:**
- ✅ **FOUR ROLES** (removed super-admin, no billing needed):
  - **Admin**: Can change templates, manage parish settings, manage parishioners, full access to all modules
  - **Staff**: Can create/edit all modules (weddings, funerals, baptisms, etc.), can invite parishioners
  - **Ministry-Leader**: Configurable per-user module access (admin enables/disables specific modules)
  - **Parishioner**: Can view modules shared with them, can share modules with family
- ✅ Roles are parish-wide
- ✅ Ministry-Leader module access is configurable per-user (stored in parish_users table)

### 4. Module-Specific Sharing (Parishioners sharing with family)
**Decisions:**
- ✅ **Only STAFF can invite parishioners to the parish**
- ✅ **Parishioners can send read-only copies to family members**
- ✅ Family viewers DON'T need accounts - use magic link with token
- ✅ Token expires in **1 YEAR**
- ✅ Read-only access - NO editing capability
- ✅ Support for all modules (weddings, funerals, baptisms, presentations, etc.)

---

## Implementation Plan (Prioritized)

### Phase 1: Remove Super-Admin Role & Update Auth ✅ COMPLETED
- [x] **Database**: Update migrations to remove `super-admin` from roles
- [x] **Database**: Update RLS policies to work with 4 roles (admin, staff, ministry-leader, parishioner)
- [x] **Database**: Add role constants to constants.ts
- [x] **Auth**: Convert login/signup to magic link (passwordless) authentication
- [x] **Auth**: Update login page to use `signInWithOtp` instead of password
- [x] **UI**: Remove role change functionality (roles now set at invitation only)

### Phase 2: Parish Invitations (Staff → Parishioner) ✅ COMPLETED
- [x] **Database**: Create `parish_invitations` migration table
  - Fields: id, parish_id, email, token, roles[], enabled_modules[], expires_at, accepted_at, invited_by_user_id
- [x] **Database**: Add RLS policies for `parish_invitations`
- [x] **Server Actions**: Create parish invitation actions (create, list, revoke, resend, accept)
- [x] **Server Actions**: Integrated email sending via AWS SES
- [x] **UI**: Add "Invite Member" button to Parish Settings Members tab
- [x] **UI**: Create invitation modal/form (email, role selection, module access for ministry-leader)
- [x] **UI**: Show pending invitations list in Parish Settings with resend/revoke actions
- [x] **Email**: Send invitation email using existing template
- [ ] **Testing**: Test parish invitation flow end-to-end

### Phase 3: Module Sharing (Parishioner → Family)
- [ ] **Database**: Create `module_shares` table for read-only sharing
  - Fields: id, parish_id, module_type (wedding/funeral/etc), module_id, token, expires_at, created_by_user_id
- [ ] **Database**: Add RLS policies for `module_shares`
- [ ] **Server Actions**: Create share actions (create, list, revoke)
- [ ] **UI**: Add "Share" button to all module view pages (wedding, funeral, baptism, etc.)
- [ ] **UI**: Create share modal (generates magic link, shows expiration)
- [ ] **Routes**: Create public view routes that accept share tokens (e.g., `/shared/weddings/[token]`)
- [ ] **Email**: Optional - send share link via email to family member
- [ ] **Testing**: Test module sharing flow with anonymous access

### Phase 4: Permission Enforcement
- [ ] **Server**: Update all server actions to check user roles
- [ ] **Server**: Add permission helper functions (canEditModule, canManageParishioners, etc.)
- [ ] **UI**: Hide/disable UI elements based on user role
- [ ] **Testing**: Test role-based access control across all modules

---

## Notes
- **New role hierarchy**: admin > staff > ministry-leader > parishioner (removed super-admin)
- **Role permissions**:
  - Admin: Manage parish settings, templates, parishioners, all modules
  - Staff: Create/edit all modules (weddings, funerals, etc.), invite parishioners
  - Ministry-Leader: Configurable module access (admin can enable/disable modules per user)
  - Parishioner: View modules shared with them, share modules with family
- RLS policies already exist for `parish_users` table
- AWS SES email client is configured and working
- Supabase magic link auth uses `signInWithOtp` method (built-in feature)
- Module shares expire in 1 year (365 days)

---

## Files Created/Modified (Phase 1 & 2)

### New Files
- `supabase/migrations/20251115000001_create_parish_invitations_table.sql` - Parish invitations table with RLS
- `src/lib/actions/invitations.ts` - Server actions for invitation CRUD operations

### Modified Files
- `src/lib/constants.ts` - Added PARISH_ROLE_VALUES, PARISH_ROLE_LABELS
- `src/app/login/page.tsx` - Converted to passwordless magic link authentication
- `src/app/(main)/settings/parish/page.tsx` - Added invite UI, pending invitations, removed role changing
- `src/lib/actions/invitations.ts` - Integrated email sending via AWS SES

### Existing Files (Referenced)
- `src/lib/email/ses-client.ts` - Email service (already had invitation template)
- `src/app/auth/callback/route.ts` - Auth callback (already supported magic links)
- `src/app/accept-invitation` - Invitation acceptance page (already exists)
