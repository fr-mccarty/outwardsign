# Code Review Checklist

This document contains a checklist of items to verify during code review. Use this with an AI agent to ensure code quality and consistency across the project.

## Form Components

- [ ] **All form inputs use FormField component** - Verify that all form inputs use the FormField component instead of manually composing Label + Input/Select/Textarea. FormField is an all-in-one component that takes props and internally renders the complete field structure. Direct usage of Input, Select, or Textarea components with manual Label composition is prohibited except in picker components or explicitly approved special cases.

- [ ] **No extra styling on form inputs** - Verify that form inputs (Input, Textarea, Select) do NOT have prohibited styling applied. According to [FORMS.md](./FORMS.md) § Form Input Styling, form inputs must use default shadcn/ui styling. **PROHIBITED:** font-family modifications (`font-mono`, `font-serif`, `font-sans`), font styles (`italic`), font weights (`font-bold`, `font-semibold`), border customizations (`border-*`, `rounded-*`), background changes (`bg-*`). **ALLOWED:** Text sizes (`text-sm`, `text-lg`), layout classes (`w-full`, `min-h-*`, padding, margin). Check all Input, Textarea, and Select components for compliance.

- [ ] **All cancel buttons use CancelButton component** - Verify that all cancel/back buttons in forms use the standardized `CancelButton` component from `src/components/cancel-button.tsx` instead of raw Button components. Forms should use `FormBottomActions` component which includes both SaveButton and CancelButton. **PROHIBITED:** Direct Button usage for cancel actions (e.g., `<Button variant="outline" onClick={() => router.push('/back')}>Cancel</Button>`). **REQUIRED:** Use `<CancelButton href="/back">Cancel</CancelButton>` or include `<FormBottomActions ... />` which uses CancelButton internally. Check all form components for cancel/back button compliance. See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) § CancelButton and FormBottomActions.

## Dark Mode Support

- [ ] **All elements use CSS variables for colors** - Verify that all components, pages, and modules use semantic CSS variable tokens instead of hardcoded colors. According to [STYLES.md](./STYLES.md) § Dark Mode Support, ensure compatibility with light, dark, and system themes. **PROHIBITED:** Hardcoded colors (`bg-white`, `bg-gray-100`, `text-gray-900`, `text-black`, hex colors like `#ffffff`), standalone `dark:` utility classes for basic colors. **REQUIRED:** Semantic color tokens (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `text-muted-foreground`, `bg-muted`, `border`), always pair backgrounds with foregrounds (`bg-card text-card-foreground`). **EXCEPTION:** Print views (`app/print/`) can use custom styling for PDF generation. Check all view pages, module components, and UI elements for compliance.

- [ ] **Search entire application for hardcoded Tailwind color classes** - Perform a comprehensive search across the entire codebase to identify and replace any hardcoded Tailwind color classes with semantic CSS variable tokens. **SEARCH FOR:** Common violations like `text-gray-500`, `text-gray-600`, `text-gray-700`, `bg-gray-50`, `bg-gray-100`, `bg-white`, `text-black`, `border-gray-200`, `border-gray-300`. **REPLACE WITH:** Appropriate semantic tokens like `text-muted-foreground`, `bg-muted`, `bg-background`, `text-foreground`, `border`. **HOW TO CHECK:** Use grep/search tools to find patterns like `text-gray-`, `bg-gray-`, `border-gray-`, `text-black`, `bg-white` across all `.tsx`, `.ts`, and `.css` files. Review each occurrence and replace with the appropriate semantic token from [STYLES.md](./STYLES.md). This ensures the entire application properly supports dark mode and maintains visual consistency.

## Component Documentation

- [ ] **All components are documented in COMPONENT_REGISTRY.md** - Verify that all reusable components in `src/components/` are documented in [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md). Each component should have: component name, file path, purpose description, key features (if applicable), props documentation, and usage examples. **REQUIRED:** Compare the list of files in `src/components/` (using `ls src/components/*.tsx` and checking subdirectories) against the documented components in COMPONENT_REGISTRY.md. Any missing components should be added with complete documentation including props, purpose, and usage examples. **EXCEPTION:** Internal/private components that are only used within a single component file do not need documentation. See COMPONENT_REGISTRY.md for examples of proper component documentation format.

## Database Schema & Types

- [ ] **Database schema aligns with types.ts** - Verify that the database schema (migration files in `supabase/migrations/`) matches the TypeScript types in each module's `types.ts` file. For each module, compare:
  - **Column names** - Database column names should match type property names (both singular)
  - **Data types** - SQL types should match TypeScript types (e.g., `text` → `string`, `timestamp` → `Date | string`, `uuid` → `string`, `boolean` → `boolean`, `integer` → `number`)
  - **Nullable fields** - Database `NULL` columns should match TypeScript optional properties (`field?:` or `field: ... | null`)
  - **Foreign keys** - Database foreign key columns should match type properties (e.g., `parish_id uuid` → `parish_id: string`)
  - **Default values** - Database defaults should be reflected in types (e.g., `DEFAULT false` → ensure type includes boolean)
  - **Missing fields** - Check for fields in database that are missing from types.ts and vice versa

  **How to check:**
  1. Find the module's migration file: `supabase/migrations/*_[module_plural].sql`
  2. Find the module's types file: `src/lib/types/[module_singular].ts`
  3. Compare CREATE TABLE statement with the base type interface
  4. Verify all columns are represented in the TypeScript interface
  5. Verify all type properties have corresponding database columns

  **Common mismatches to look for:**
  - Database has `updated_at` but types.ts is missing it
  - Types.ts has a field but database migration doesn't create that column
  - Database allows NULL but TypeScript type is not optional
  - Database has foreign key but types.ts is missing the relationship field

  See MODULE_DEVELOPMENT.md § Type Patterns for proper type structure.

- [ ] **Verify src/lib/types.ts matches ALL database migrations** - The main `src/lib/types.ts` file contains TypeScript interfaces for all database tables. This file must be kept in sync with the database schema. For comprehensive verification:

  **How to check:**
  1. Review ALL migration files in `supabase/migrations/*.sql`
  2. For each CREATE TABLE statement, find the corresponding TypeScript interface in `src/lib/types.ts`
  3. Verify that every database column has a corresponding TypeScript property
  4. Verify that every TypeScript property has a corresponding database column
  5. Check data types match (UUID → string, TEXT → string, BOOLEAN → boolean, INTEGER → number, TIMESTAMPTZ → string)
  6. Check nullable columns have optional properties (column allows NULL → property uses `field?:` or `field: string | null`)
  7. Check array columns match (TEXT[] → string[], UUID[] → string[], JSONB → Record<string, any> or specific type)

  **Common discrepancies to watch for:**
  - **Missing fields in types.ts** - Database has columns that aren't represented in the TypeScript interface
  - **Missing fields in database** - TypeScript interface has properties that don't exist in database
  - **Type mismatches** - TypeScript type doesn't match SQL type (e.g., number vs string for UUIDs)
  - **Nullability mismatches** - Database allows NULL but TypeScript property is required, or vice versa
  - **Array type mismatches** - Database uses array column but TypeScript doesn't reflect array type
  - **Table missing from types.ts** - Migration creates a table but no corresponding interface exists

  **Critical interfaces to verify:**
  - Parish, ParishUser, ParishSettings, UserSettings
  - Person, PersonBlackoutDate (check naming: table is `person_blackout_dates`)
  - Event, Location, Reading
  - Wedding, Funeral, Baptism, Quinceanera, Presentation
  - Mass, MassRole, MassRolesTemplate, MassRoleTemplateItem, MassRoleMember, MassIntention
  - Group, GroupMember, GroupRole

  **Known patterns:**
  - All tables have `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - Most tables have `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` with trigger
  - All parish-scoped tables have `parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE`
  - Junction tables typically have composite primary keys
  - Foreign keys typically use `ON DELETE CASCADE` or `ON DELETE SET NULL`

  See ARCHITECTURE.md § Data Architecture for naming conventions and patterns.

- [ ] **Server actions implement all interface parameters** - Verify that all server action functions (create, update) implement ALL parameters defined in the corresponding TypeScript interfaces in `src/lib/types.ts`. Server actions should accept and handle every field that exists in the interface, ensuring complete data persistence.

  **How to check:**
  1. Identify the module's base interface in `src/lib/types.ts` (e.g., `Wedding`, `Funeral`, `MassTime`)
  2. Find the module's server action file: `src/lib/actions/[module-plural].ts`
  3. Review the `create` and `update` functions
  4. For each property in the interface (excluding `id`, `created_at`, `updated_at`):
     - Verify the server action accepts this parameter
     - Verify the parameter is included in the database INSERT/UPDATE operation
     - Check that the parameter name matches the interface property exactly
  5. Check for any parameters in server actions that don't exist in the interface

  **Common issues to watch for:**
  - **Missing parameters** - Interface has a field but server action doesn't accept/handle it
  - **Parameter name mismatch** - Server action uses different name than interface (e.g., `startDate` vs `start_date`)
  - **Incomplete updates** - Update action doesn't accept all updatable fields
  - **Extra parameters** - Server action accepts parameters that don't exist in the interface
  - **Required vs optional mismatch** - Interface marks field as optional but server action treats it as required, or vice versa

  **What to verify:**
  - CREATE actions: Should accept all interface properties except `id`, `created_at`, `updated_at` (auto-generated)
  - UPDATE actions: Should accept `id` plus all updatable interface properties (typically all except timestamps)
  - Required fields from interface should be validated in server actions
  - Optional fields from interface should be handled properly (allow undefined/null)

  **Example check for Wedding module:**
  ```typescript
  // In src/lib/types.ts
  interface Wedding {
    id: string
    parish_id: string
    partner_1_id: string
    partner_2_id: string
    wedding_date?: string | null
    location_id?: string | null
    presider_id?: string | null
    // ... etc
  }

  // In src/lib/actions/weddings.ts - should accept ALL these fields
  export async function createWedding({
    partner_1_id,
    partner_2_id,
    wedding_date,
    location_id,
    presider_id,
    // Must include ALL other fields from interface
  }: Omit<Wedding, 'id' | 'created_at' | 'updated_at'>)
  ```

  See MODULE_DEVELOPMENT.md for server action patterns and ARCHITECTURE.md § Data Flow for server action guidelines.

## Module Structure

- [ ] **All error.tsx files use ErrorDisplay component** - Verify that all module error boundary files (`error.tsx`) use the shared `ErrorDisplay` component from `@/components/error-display` with consistent props and structure across all modules.

- [ ] **All loading.tsx files use Loading component** - Verify that all module loading state files (`loading.tsx`) use the shared `Loading` component from `@/components/loading` with `variant="route"` for consistent structure across all modules.

- [ ] **All edit pages use PageContainer component** - Verify that all module edit pages (form wrapper files like `[entity]-form-wrapper.tsx`) use the `PageContainer` component from `@/components/page-container` to wrap the form and provide consistent layout, breadcrumbs, and action buttons.

- [ ] **All view pages use ModuleViewContainer component** - Verify that all module view pages (view client files like `[id]/[entity]-view-client.tsx`) use the `ModuleViewContainer` component from `@/components/module-view-container` to provide consistent layout with the module view panel and content display.

## Code Quality

- [ ] **Check for unused imports** - Verify that all imports are being used and delete any unused imports. Run the linter to identify unused imports automatically.



