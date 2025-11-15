# Petition Templates System Improvements

**Status:** In Progress
**Started:** 2025-11-15
**Priority:** High
**Assignee:** Claude Code

## Overview

Enhance the existing petition templates system in Parish Settings to support:
1. Admin-only permissions
2. Module categorization (Mass, Wedding, Funeral, etc.)
3. Template variables/placeholders ({{bride}}, {{groom}}, etc.)
4. Improved UI with preview

## Current State

The petition templates system already exists with:
- Database table: `petition_templates`
- Settings page: `/settings/petitions`
- CRUD operations working
- Default templates seeded per parish

## Improvements Needed

### 1. Database Schema Updates

- [x] **Add `module` column** (TEXT) - Categorize by module type
  - Values: `mass`, `wedding`, `funeral`, `baptism`, `presentation`, `quinceanera`, `mass-intention`
  - Migration file: `20251115000002_update_petition_templates.sql`
  - Added index for performance

- [x] **Add `language` column** (TEXT) - Template language
  - Values: `en` (English), `es` (Spanish), `bilingual`
  - Default: `en`
  - Added index for performance

- [x] **Add `is_default` column** (BOOLEAN) - System vs custom templates
  - Default: `false`
  - System templates marked as `true`

- [x] **Migrate existing data**
  - Infer module from template title
  - Infer language from template title
  - Mark existing templates as defaults

- [ ] **Run migration**
  - Command: `supabase db push`
  - Test: Verify new columns exist and data migrated correctly

---

### 2. Admin-Only Permissions

**Requirement:** Only parish admins can create, edit, or delete petition templates.

- [x] **Settings list page** (`/settings/petitions/page.tsx`)
  - Added role check: `userParish.roles.includes('admin')`
  - Redirect to dashboard if not admin

- [ ] **Create page** (`/settings/petitions/create/page.tsx`)
  - Add same admin role check
  - Redirect if not admin

- [ ] **Edit page** (`/settings/petitions/[id]/page.tsx`)
  - Add same admin role check
  - Redirect if not admin

- [ ] **Server actions** (`lib/actions/petition-templates.ts`)
  - Add admin check to `createPetitionTemplate()`
  - Add admin check to `updatePetitionTemplate()`
  - Add admin check to `deletePetitionTemplate()`
  - Throw error if user is not admin

---

### 3. Update Petition Template Form

**File:** `src/app/(main)/settings/petitions/petition-template-form.tsx`

- [ ] **Add module dropdown**
  - Options: Mass, Wedding, Funeral, Baptism, Presentation, Quinceañera, Mass Intention
  - Required field
  - Use constants from `src/lib/constants.ts`

- [ ] **Add language dropdown**
  - Options: English, Spanish, Bilingual
  - Required field
  - Default to English

- [ ] **Update TypeScript interfaces**
  - Add `module` to `CreateContextData`
  - Add `language` to `CreateContextData`
  - Add `module` to `UpdateContextData`
  - Add `language` to `UpdateContextData`
  - Add `is_default` to `PetitionContextTemplate`

- [ ] **Update form validation**
  - Ensure module is selected
  - Ensure language is selected

- [ ] **Update create/update actions**
  - Pass module and language to server actions
  - Handle in insert/update queries

---

### 4. Variable Placeholder Support

**Requirement:** Support template variables that get replaced with actual names.

- [ ] **Define supported variables**
  - `{{bride}}` - Bride's name (weddings)
  - `{{groom}}` - Groom's name (weddings)
  - `{{deceased}}` - Deceased person's name (funerals)
  - `{{child}}` - Child's name (baptisms, presentations)
  - `{{mother}}` - Mother's name (baptisms, presentations)
  - `{{father}}` - Father's name (baptisms, presentations)
  - `{{quinceañera}}` - Quinceañera's name
  - `{{date}}` - Event date
  - `{{priest}}` - Presider's name

- [ ] **Create helper function**
  - File: `src/lib/utils/petition-variables.ts`
  - Function: `replacePetitionVariables(template: string, variables: Record<string, string>): string`
  - Replace all {{variable}} occurrences with actual values
  - Handle missing variables gracefully (leave placeholder or use default)

- [ ] **Update PetitionEditor component**
  - File: `src/components/petition-editor.tsx`
  - Add "Insert Variable" dropdown/button
  - Show available variables based on module context
  - Preview variables in real-time if possible

- [ ] **Update module forms**
  - Wedding form: Pass bride/groom names when inserting template
  - Funeral form: Pass deceased name when inserting template
  - Baptism form: Pass child/parent names when inserting template
  - Presentation form: Pass child/parent names when inserting template
  - Quinceañera form: Pass quinceañera name when inserting template
  - Mass form: Pass presider/date when inserting template

- [ ] **Add documentation**
  - Help text explaining available variables
  - Examples of how to use variables
  - Preview of variables being replaced

---

### 5. Improve UI & Editor

- [ ] **Template list improvements**
  - File: `src/app/(main)/settings/petitions/petition-template-list.tsx`
  - Group templates by module
  - Show language badges
  - Show "Default" badge for system templates
  - Add search/filter by module and language
  - Disable delete for system default templates (warn user)

- [ ] **Template editor improvements**
  - Add live preview panel
  - Show character/line count
  - Syntax highlighting for variables ({{variable}})
  - Better textarea styling (larger, line numbers?)
  - Sample variable insertion

- [ ] **Add preview functionality**
  - Preview button in template list
  - Modal/page showing template with sample variable replacement
  - Preview in different languages

- [ ] **Add template duplication**
  - "Duplicate" button to copy system templates for customization
  - Automatically mark duplicates as custom (is_default=false)

---

### 6. Update Module Forms to Use Filtered Templates

Each module form needs to fetch and display only relevant petition templates.

- [ ] **Update getPetitionTemplates() action**
  - File: `src/lib/actions/petition-templates.ts`
  - Add optional `module` filter parameter
  - Add optional `language` filter parameter
  - Example: `getPetitionTemplates({ module: 'wedding', language: 'en' })`

- [ ] **Mass form** (`src/app/(main)/masses/mass-form.tsx`)
  - Fetch only `module: 'mass'` templates
  - Pass to PetitionEditor
  - Replace variables when inserting template

- [ ] **Wedding form** (`src/app/(main)/weddings/wedding-form.tsx`)
  - Fetch only `module: 'wedding'` templates
  - Pass bride/groom names for variable replacement
  - Update template insertion to use helper function

- [ ] **Funeral form** (`src/app/(main)/funerals/funeral-form.tsx`)
  - Fetch only `module: 'funeral'` templates
  - Pass deceased name for variable replacement

- [ ] **Baptism form** (`src/app/(main)/baptisms/baptism-form.tsx`)
  - Fetch only `module: 'baptism'` templates
  - Pass child/parent names for variable replacement

- [ ] **Presentation form** (`src/app/(main)/presentations/presentation-form.tsx`)
  - Fetch only `module: 'presentation'` templates
  - Pass child/parent names for variable replacement

- [ ] **Quinceañera form** (`src/app/(main)/quinceaneras/quinceanera-form.tsx`)
  - Fetch only `module: 'quinceanera'` templates
  - Pass quinceañera name for variable replacement

- [ ] **Mass Intention form** (`src/app/(main)/mass-intentions/mass-intention-form.tsx`)
  - Fetch only `module: 'mass-intention'` templates (if any)

---

### 7. Update Default Petition Templates

Need to update seeded default templates with module and language information.

- [ ] **Update default template files**
  - Location: `src/lib/default-petition-templates/`
  - Add `module` field to each template object
  - Add `language` field to each template object

- [ ] **Update ensureDefaultContexts() function**
  - File: `src/lib/actions/petition-templates.ts`
  - Include module and language when inserting default templates
  - Update existing template imports

- [ ] **Files to update:**
  - [x] `sunday-english.ts` - module: 'mass', language: 'en'
  - [x] `sunday-spanish.ts` - module: 'mass', language: 'es'
  - [x] `daily.ts` - module: 'mass', language: 'en'
  - [x] `wedding-english.ts` - module: 'wedding', language: 'en'
  - [x] `wedding-spanish.ts` - module: 'wedding', language: 'es'
  - [x] `funeral-english.ts` - module: 'funeral', language: 'en'
  - [x] `funeral-spanish.ts` - module: 'funeral', language: 'es'
  - [x] `quinceanera-english.ts` - module: 'quinceanera', language: 'en'
  - [x] `quinceanera-spanish.ts` - module: 'quinceanera', language: 'es'
  - [x] `presentation-english.ts` - module: 'presentation', language: 'en'
  - [x] `presentation-spanish.ts` - module: 'presentation', language: 'es'

---

### 8. Testing & Verification

- [ ] **Migration testing**
  - Run `supabase db push`
  - Verify new columns added
  - Check existing templates have correct module/language
  - Verify indexes created

- [ ] **Permission testing**
  - Login as non-admin user → Should not see petition templates in settings
  - Login as admin → Should see petition templates
  - Try to create template as non-admin via direct API call → Should fail

- [ ] **Module filtering testing**
  - Create wedding → Only see wedding templates
  - Create mass → Only see mass templates
  - Create funeral → Only see funeral templates

- [ ] **Variable replacement testing**
  - Create wedding template with {{bride}} and {{groom}}
  - Insert into wedding form → Variables should be replaced
  - Save and view → Should see actual names, not variables

- [ ] **UI testing**
  - Template list shows module badges
  - Template list shows language badges
  - Can filter by module
  - Can search templates
  - Preview works correctly

- [ ] **Build testing**
  - Run `npm run build`
  - Ensure no TypeScript errors
  - Ensure no compilation errors

---

## Constants to Add

Create module constants in `src/lib/constants.ts`:

```typescript
// Petition Template Module Constants
export const PETITION_MODULE_VALUES = [
  'mass',
  'wedding',
  'funeral',
  'baptism',
  'presentation',
  'quinceanera',
  'mass-intention'
] as const

export type PetitionModule = typeof PETITION_MODULE_VALUES[number]

export const PETITION_MODULE_LABELS: Record<PetitionModule, { en: string; es: string }> = {
  'mass': { en: 'Mass', es: 'Misa' },
  'wedding': { en: 'Wedding', es: 'Boda' },
  'funeral': { en: 'Funeral', es: 'Funeral' },
  'baptism': { en: 'Baptism', es: 'Bautismo' },
  'presentation': { en: 'Presentation', es: 'Presentación' },
  'quinceanera': { en: 'Quinceañera', es: 'Quinceañera' },
  'mass-intention': { en: 'Mass Intention', es: 'Intención de Misa' }
}

// Petition Template Language Constants
export const PETITION_LANGUAGE_VALUES = ['en', 'es', 'bilingual'] as const
export type PetitionLanguage = typeof PETITION_LANGUAGE_VALUES[number]

export const PETITION_LANGUAGE_LABELS: Record<PetitionLanguage, { en: string; es: string }> = {
  'en': { en: 'English', es: 'Inglés' },
  'es': { en: 'Spanish', es: 'Español' },
  'bilingual': { en: 'Bilingual', es: 'Bilingüe' }
}
```

---

## Files to Create

1. **src/lib/utils/petition-variables.ts** - Variable replacement helper
2. **todos/petition-templates-improvements.md** - This file!

## Files to Modify

1. ✅ `supabase/migrations/20251115000002_update_petition_templates.sql` (created)
2. ✅ `src/app/(main)/settings/petitions/page.tsx` (admin check added)
3. `src/app/(main)/settings/petitions/create/page.tsx` (add admin check)
4. `src/app/(main)/settings/petitions/[id]/page.tsx` (add admin check)
5. `src/app/(main)/settings/petitions/petition-template-form.tsx` (add fields)
6. `src/app/(main)/settings/petitions/petition-template-list.tsx` (improve UI)
7. `src/lib/actions/petition-templates.ts` (add filtering, admin checks)
8. `src/lib/constants.ts` (add petition module/language constants)
9. `src/components/petition-editor.tsx` (add variable insertion)
10. All module forms (filter templates, replace variables)
11. All default template files (add module/language)

---

## Dependencies

- Migration must be run before other changes work
- Constants should be added before updating forms
- Variable helper must exist before updating module forms
- Admin permissions should be added before testing

---

## Risks & Considerations

1. **Breaking Changes**
   - Existing petition templates will work but need migration
   - Forms currently use hardcoded templates from `lib/petition-templates/`
   - Need gradual migration from hardcoded to database templates

2. **Performance**
   - Filtering templates by module/language should be fast (indexed)
   - Variable replacement should be efficient (simple string replace)

3. **User Experience**
   - Non-admin users will lose access to petition template management
   - Need clear messaging if non-admin tries to access

4. **Data Integrity**
   - Default templates should not be deletable
   - Module categorization must be accurate

---

## Success Criteria

- ✅ Only admins can access petition template settings
- ✅ Templates are categorized by module (Mass, Wedding, etc.)
- ✅ Templates support language selection (English, Spanish, Bilingual)
- ✅ Template variables ({{bride}}, {{groom}}, etc.) work correctly
- ✅ Module forms show only relevant templates
- ✅ UI is improved with better organization and preview
- ✅ All tests pass
- ✅ Build succeeds
- ✅ Migration runs successfully

---

## Next Steps

1. Get user approval to run migration: `supabase db push`
2. Add constants to `src/lib/constants.ts`
3. Complete admin permission checks on all pages
4. Update petition template form with module/language fields
5. Create variable replacement helper
6. Update module forms to filter and use variables
7. Improve UI and add preview
8. Test thoroughly

---

## Notes

- The hardcoded templates in `src/lib/petition-templates/` can remain for backward compatibility
- Eventually migrate all forms to use database templates exclusively
- Consider adding template versioning in the future
- Consider adding template sharing between parishes in the future
