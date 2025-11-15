# Petition Templates Improvements

**Priority:** Medium
**Status:** In Progress

## Completed ✅

- [x] Database migration with `module` and `language` columns
- [x] Admin-only permission check on settings list page
- [x] Updated default template files with module/language metadata

## Remaining Work

### 1. Complete Permission Checks
- [ ] Add admin check to create page (`/settings/petitions/create/page.tsx`)
- [ ] Add admin check to edit page (`/settings/petitions/[id]/page.tsx`)
- [ ] Add admin check to server actions (create, update, delete)

### 2. Update Petition Template Form
**File:** `src/app/(main)/settings/petitions/petition-template-form.tsx`

- [ ] Add module dropdown (Mass, Wedding, Funeral, etc.)
- [ ] Add language dropdown (English, Spanish, Bilingual)
- [ ] Update TypeScript interfaces with new fields
- [ ] Update form validation
- [ ] Pass new fields to server actions

### 3. Add Variable Placeholder Support
- [ ] Define supported variables ({{bride}}, {{groom}}, {{deceased}}, etc.)
- [ ] Create helper function: `replacePetitionVariables()` in `lib/utils/petition-variables.ts`
- [ ] Update PetitionEditor component with "Insert Variable" dropdown
- [ ] Update module forms to pass variable data when inserting templates

### 4. Improve UI
- [ ] Group templates by module in list
- [ ] Show language badges
- [ ] Show "Default" badge for system templates
- [ ] Add search/filter by module and language
- [ ] Add live preview panel in editor
- [ ] Add template duplication feature

### 5. Update Module Forms
- [ ] Update `getPetitionTemplates()` to accept module/language filters
- [ ] Mass form: Fetch only `module: 'mass'` templates
- [ ] Wedding form: Fetch only `module: 'wedding'` templates + variable replacement
- [ ] Funeral, Baptism, Presentation, Quinceanera forms: Similar updates

### 6. Add Constants
**File:** `src/lib/constants.ts`

```typescript
export const PETITION_MODULE_VALUES = ['mass', 'wedding', 'funeral', 'baptism', 'presentation', 'quinceanera', 'mass-intention'] as const
export type PetitionModule = typeof PETITION_MODULE_VALUES[number]

export const PETITION_LANGUAGE_VALUES = ['en', 'es', 'bilingual'] as const
export type PetitionLanguage = typeof PETITION_LANGUAGE_VALUES[number]
```

## Testing
- [ ] Migration applied successfully
- [ ] Only admins can access petition template settings
- [ ] Module filtering works in forms
- [ ] Variable replacement works correctly
- [ ] Build succeeds without errors

## Next Steps

1. Run migration: `supabase db push`
2. Add constants to `lib/constants.ts`
3. Complete admin permission checks
4. Update petition template form
5. Create variable replacement helper
6. Update module forms
