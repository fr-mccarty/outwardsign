# Application Internationalization (i18n)

**Created:** 2025-12-12
**Status:** Ready for Development
**Agent:** brainstorming-agent, requirements-agent

## Feature Overview

Implement comprehensive internationalization (i18n) for the Outward Sign application, allowing users to switch between English and Spanish for all application UI elements, while keeping liturgical database content unchanged.

## Problem Statement

Currently, the application UI is primarily in English with some bilingual liturgical content in the database. Parish staff and administrators who are more comfortable working in Spanish cannot change the application interface language. While the home page has bilingual support and the parishioner portal has language switching, the main application (dashboard, modules, forms, settings) lacks this capability.

**Who has this problem:**
- Spanish-speaking parish administrators
- Bilingual staff who prefer to work in Spanish
- Parishes serving primarily Spanish-speaking communities
- Staff who switch between languages based on context

## User Stories

### Core User Stories

- As a Spanish-speaking parish administrator, I want to switch the entire application UI to Spanish so that I can work comfortably in my preferred language
- As a bilingual staff member, I want to toggle between English and Spanish UI so that I can work in the language most appropriate for my current task
- As a new user visiting for the first time, I want the application to default to English but make it easy to discover the language selector so that I can immediately switch to Spanish if needed
- As a returning user, I want the application to remember my language preference so that I don't have to select it every time I log in
- As a parish administrator working on multiple devices, I want my language preference to be stored locally on each device so that I can work in different languages on different computers

### Secondary User Stories

- As a user filling out a form, I want the language to update immediately when I change it so that I can see the new language right away
- As a user viewing data tables, I want column headers and status badges to update to my selected language so that all UI elements are consistent
- As a user reading error messages, I want validation messages to appear in my selected language so that I can understand what went wrong
- As a user navigating the application, I want breadcrumbs, sidebar menu items, and page titles to appear in my selected language so that navigation is clear

## Success Criteria

What does "done" look like?

- [ ] Language selector is visible and accessible in the main application header
- [ ] All UI chrome (sidebar, breadcrumbs, headers, buttons) displays in selected language
- [ ] All form labels, placeholders, and validation messages display in selected language
- [ ] All table column headers, status badges, and data display labels display in selected language
- [ ] All system messages (toasts, confirmations, errors) display in selected language
- [ ] User documentation section (`/documentation`) continues to work with its existing language system
- [ ] Language preference persists across browser sessions using localStorage
- [ ] Language change updates UI immediately without page refresh
- [ ] First-time visitors see English by default
- [ ] Language selector is discoverable but not intrusive
- [ ] Liturgical database content (readings, prayers, ceremonies) remains unchanged
- [ ] Print views and PDF exports continue to show user-created content without modification

## Scope

### In Scope (MVP)

**1. UI Chrome & Navigation**
- Sidebar menu items (Weddings, Funerals, Baptisms, Families, People, etc.)
- Breadcrumbs
- Page headers and section titles
- Action buttons (Create, Edit, Delete, Save, Cancel, Export, Print)
- Empty state messages

**2. Forms & Inputs**
- Field labels (Bride Name, Groom Name, Event Date, etc.)
- Placeholder text
- Helper text and tooltips
- Validation error messages
- Form section headings

**3. Data Display**
- Table column headers
- Status badges (Scheduled, Completed, Cancelled, Confirmed, etc.)
- Card labels and metadata
- List view labels
- Search and filter labels

**4. System Messages**
- Success toasts ("Wedding created successfully")
- Error messages ("Failed to save changes")
- Confirmation dialogs ("Are you sure you want to delete?")
- Loading states ("Loading...", "Saving...")
- Warning messages

**5. Documentation & Help**
- The `/documentation` section already has bilingual support - no changes needed
- In-app tooltips and help text

**6. Infrastructure**
- Language selector component in application header
- localStorage persistence (key: `'app-language'` or similar)
- Global language context provider
- Translation file structure
- Immediate UI update on language change

### Out of Scope (Future or Not Applicable)

**Database Content**
- Liturgical content (readings, prayers, ceremonies) - already bilingual in database with `.en` and `.es` fields
- User-created content (names, descriptions, notes)
- Event data, person data, family data

**Print Views & Exports**
- PDF export content (uses user-created data)
- Word document exports (uses user-created data)
- Printed scripts (shows liturgical content as-is)

**User Preferences Sync**
- Language preference is per-browser, not per-user account
- No cross-device sync (future enhancement)

**Additional Languages**
- Only English and Spanish for MVP
- Other languages (Latin, French, etc.) are future enhancements

**Parishioner Portal**
- Already has its own language context system - no changes needed

## Key User Flows

### Primary Flow: First-Time User Selecting Language

1. User visits application and logs in
2. Application displays in English (default)
3. User sees language selector in header (globe icon or "English/Español")
4. User clicks language selector
5. User selects "Español"
6. Application immediately updates all UI to Spanish
7. Language preference is saved to localStorage
8. User continues working in Spanish
9. On next visit, application remembers Spanish preference

### Alternative Flow: Switching Language Mid-Workflow

1. User is creating a wedding in English
2. User fills out bride and groom names (database content - unchanged)
3. User clicks language selector
4. User selects "Español"
5. Form labels update to Spanish immediately ("Bride Name" → "Nombre de la Novia")
6. Field values (bride name, groom name) remain unchanged
7. Validation messages, if any, update to Spanish
8. User continues filling out form in Spanish
9. User saves wedding successfully with Spanish success message

### Alternative Flow: Viewing List Page in Spanish

1. User has Spanish selected as language preference
2. User navigates to Weddings list page
3. Page header shows "Bodas" (Spanish for Weddings)
4. Breadcrumb shows "Inicio > Bodas"
5. Search placeholder shows "Buscar bodas..."
6. Status filter shows "Estado: Todos"
7. Column headers show "Pareja", "Fecha", "Estado", "Presididor"
8. Status badges show "Programado", "Completado", "Cancelado"
9. "Create New Wedding" button shows "Crear Nueva Boda"
10. Wedding data (couple names, dates) displays as stored in database

### Edge Case: User Documentation Navigation

1. User is working in Spanish in main application
2. User clicks "Documentation" in sidebar
3. Application navigates to `/documentation/es` (Spanish docs)
4. User reads user guides in Spanish
5. User returns to main application
6. Application remains in Spanish (preference unchanged)

## Integration Points

### Existing Features That Support This

**Home Page Language System:**
- `src/app/page.tsx` already has complete English/Spanish translations object
- Can serve as reference implementation for translation structure
- Uses URL parameter approach (can be adapted for app-wide state)

**Parishioner Portal Language Context:**
- `src/app/(parishioner)/parishioner/(portal)/language-context.tsx` already implements localStorage persistence
- Can be used as pattern for main app language context
- Already uses `'parishioner-language'` key - main app can use `'app-language'`

**LanguageSelector Component:**
- `src/components/language-selector.tsx` already exists
- Supports custom `onLanguageChange` callback
- Needs enhancement to handle localStorage persistence

**Existing Constants:**
- `HOME_LANGUAGES` and `HomeLanguage` type already defined in `src/lib/constants.ts`
- Can be reused or renamed for app-wide language

### Existing Features to Preserve

**Liturgical Language System:**
- Database fields: `events.language`, `mass_times.language`, `readings.language`
- LITURGICAL_LANGUAGE_VALUES: `['en', 'es', 'la']`
- This is for liturgical CONTENT, not UI
- Must remain separate from app UI language

**User Documentation System:**
- `/documentation/[lang]` routes already work
- Has its own language routing structure
- Should continue to function independently

**Database Bilingual Fields:**
- `.en` and `.es` properties on readings, prayers, ceremonies
- These display based on event language, not UI language
- No changes needed to this system

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Translation Library Selection

**Recommendation: next-intl**

After researching i18n options for Next.js 15 App Router, I recommend **next-intl** for the following reasons:

1. **Purpose-built for App Router**: next-intl is designed specifically for Next.js App Router and Server Components, unlike next-i18next which is not compatible with App Router
2. **Simpler API**: Lower configuration overhead compared to react-i18next/i18next
3. **Better integration**: Works seamlessly with both Server and Client Components
4. **Community adoption**: Most popular option for App Router (used by Node.js website)
5. **Bundle size**: Minimal bundle size impact (~5kb minified + gzipped)
6. **Type safety**: Full TypeScript support with autocomplete for translation keys

**Sources:**
- [next-intl – Internationalization (i18n) for Next.js](https://next-intl.dev/)
- [Why I Chose next-intl for Internationalization in My Next.js App](https://medium.com/@isurusasanga1999/why-i-chose-next-intl-for-internationalization-in-my-next-js-66c9e49dd486)
- [The Best i18n Libraries for Next.js App Router in 2025](https://medium.com/better-dev-nextjs-react/the-best-i18n-libraries-for-next-js-app-router-in-2025-21cb5ab2219a)

### Database Schema

**No database changes required.** All UI language preferences are stored in browser localStorage.

### Translation File Structure

**Recommended Structure:**

```
/src/i18n/
├── locales/
│   ├── en.json          # All English translations
│   └── es.json          # All Spanish translations
├── config.ts            # next-intl configuration
└── request.ts           # Server-side translation helper
```

**Translation File Format (nested JSON):**

```json
// en.json
{
  "nav": {
    "dashboard": "Dashboard",
    "calendar": "Calendar",
    "events": "Events",
    "groups": "Groups",
    "locations": "Locations",
    "massIntentions": "Mass Intentions",
    "massScheduling": "Mass Scheduling",
    "masses": "Masses",
    "families": "Families",
    "people": "People",
    "settings": "Settings"
  },
  "common": {
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "export": "Export",
    "print": "Print",
    "search": "Search",
    "filter": "Filter",
    "loading": "Loading...",
    "saving": "Saving...",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No"
  },
  "forms": {
    "familyName": "Family Name",
    "familyNamePlaceholder": "e.g., Smith Family, The Johnsons",
    "active": "Active",
    "required": "{field} is required",
    "minLength": "{field} must be at least {min} characters"
  },
  "toasts": {
    "familyCreated": "Family created successfully",
    "familyUpdated": "Family updated successfully",
    "familyDeleted": "Family deleted successfully",
    "errorSaving": "Failed to save changes",
    "errorDeleting": "Failed to delete",
    "confirmDelete": "Are you sure you want to delete {name}?"
  },
  "status": {
    "planning": "Planning",
    "active": "Active",
    "inactive": "Inactive",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "scheduled": "Scheduled",
    "requested": "Requested",
    "confirmed": "Confirmed",
    "fulfilled": "Fulfilled"
  }
}
```

```json
// es.json
{
  "nav": {
    "dashboard": "Panel",
    "calendar": "Calendario",
    "events": "Eventos",
    "groups": "Grupos",
    "locations": "Ubicaciones",
    "massIntentions": "Intenciones de Misa",
    "massScheduling": "Programación de Misas",
    "masses": "Misas",
    "families": "Familias",
    "people": "Personas",
    "settings": "Configuración"
  },
  "common": {
    "create": "Crear",
    "edit": "Editar",
    "delete": "Eliminar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "export": "Exportar",
    "print": "Imprimir",
    "search": "Buscar",
    "filter": "Filtrar",
    "loading": "Cargando...",
    "saving": "Guardando...",
    "confirm": "Confirmar",
    "yes": "Sí",
    "no": "No"
  },
  "forms": {
    "familyName": "Nombre de la Familia",
    "familyNamePlaceholder": "ej., Familia Smith, Los Johnson",
    "active": "Activo",
    "required": "{field} es requerido",
    "minLength": "{field} debe tener al menos {min} caracteres"
  },
  "toasts": {
    "familyCreated": "Familia creada exitosamente",
    "familyUpdated": "Familia actualizada exitosamente",
    "familyDeleted": "Familia eliminada exitosamente",
    "errorSaving": "No se pudieron guardar los cambios",
    "errorDeleting": "No se pudo eliminar",
    "confirmDelete": "¿Estás seguro de que deseas eliminar {name}?"
  },
  "status": {
    "planning": "Planificación",
    "active": "Activo",
    "inactive": "Inactivo",
    "completed": "Completado",
    "cancelled": "Cancelado",
    "scheduled": "Programado",
    "requested": "Solicitado",
    "confirmed": "Confirmado",
    "fulfilled": "Cumplido"
  }
}
```

**Why nested structure:**
- Easier to organize related translations
- Better IDE autocomplete with TypeScript
- Follows home page pattern (src/app/page.tsx already uses nested structure)
- Easier to maintain as app grows

### Context/Provider Architecture

**Approach: React Context with localStorage persistence**

Unlike the home page which uses URL parameters, the main application will use React Context for the following reasons:

1. **No URL pollution**: Language preference doesn't need to be in URL for main app
2. **Immediate updates**: Context triggers re-renders without navigation
3. **Consistency**: Matches parishioner portal pattern
4. **Simpler sharing**: Language state easily accessible throughout component tree

**Implementation Pattern:**

```
CONTEXT PROVIDER SETUP:
1. Create AppLanguageProvider in src/app/(main)/layout.tsx
2. Wrap entire main app with provider
3. Provider reads from localStorage on mount ('app-language' key)
4. Provider exposes language state and setLanguage function
5. next-intl's NextIntlClientProvider wraps the AppLanguageProvider

TRANSLATION USAGE:
Client Components:
  - Import useTranslations hook from next-intl
  - Call t('key') to get translated string

Server Components:
  - Import getTranslations from next-intl/server
  - Await t = getTranslations()
  - Call t('key') to get translated string
```

### Type Interfaces

**New Types to Create:**

```typescript
// In src/lib/types.ts or src/i18n/types.ts

// App UI language type (different from liturgical language)
export type AppLanguage = 'en' | 'es'

// Translation key type (auto-generated from translation files)
export type TranslationKey = string // Will be typed by next-intl

// Context type
export interface AppLanguageContextType {
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void
}
```

**Update Existing Types:**

```typescript
// In src/lib/constants.ts

// Rename HOME_LANGUAGES to APP_LANGUAGES
export const APP_LANGUAGES = ['en', 'es'] as const
export type AppLanguage = typeof APP_LANGUAGES[number]
export const DEFAULT_APP_LANGUAGE: AppLanguage = 'en'

// Keep Language type as alias for backward compatibility
export type Language = AppLanguage
```

### File Structure

**New Files to Create:**

```
/src/i18n/
├── locales/
│   ├── en.json                    # English translations
│   └── es.json                    # Spanish translations
├── config.ts                      # next-intl configuration
└── request.ts                     # Server-side translation helper

/src/components/
└── app-language-provider.tsx      # Context provider for main app

/src/hooks/
└── use-app-language.ts            # Hook to access language context
```

**Modified Files:**

```
/src/components/
├── main-header.tsx                # Add LanguageSelector
└── language-selector.tsx          # Enhance for app-wide use

/src/lib/
└── constants.ts                   # Update language constants

/src/app/(main)/
└── layout.tsx                     # Wrap with AppLanguageProvider

All component files with hardcoded strings (see Migration Strategy)
```

### Server vs Client Components Strategy

**Server Components:**
- Use next-intl's `getTranslations()` function
- Import from `'next-intl/server'`
- Translations are server-side rendered
- Better performance for static content

**Client Components:**
- Use next-intl's `useTranslations()` hook
- Import from `'next-intl'`
- Translations reactive to language changes
- Required for interactive UI

**Example Patterns:**

```typescript
// SERVER COMPONENT PATTERN
// src/app/(main)/families/page.tsx

import { getTranslations } from 'next-intl/server'

export default async function FamiliesPage() {
  const t = await getTranslations()

  RETURN page with:
    - Page title: t('nav.families')
    - Breadcrumbs with translations
    - Pass translations to client components as props
}
```

```typescript
// CLIENT COMPONENT PATTERN
// src/components/family-form.tsx

'use client'
import { useTranslations } from 'next-intl'

export function FamilyForm() {
  const t = useTranslations()

  USE translations in:
    - Form labels: t('forms.familyName')
    - Placeholders: t('forms.familyNamePlaceholder')
    - Toast messages: t('toasts.familyCreated')
    - Validation errors: t('forms.required', { field: 'Family Name' })
}
```

### Integration with Existing Language Systems

**1. App UI Language (NEW)**
- Scope: All UI chrome, forms, buttons, toasts, etc.
- Storage: localStorage key `'app-language'`
- Type: `AppLanguage` ('en' | 'es')
- Context: `AppLanguageProvider` in main app layout

**2. Liturgical Content Language (EXISTING - NO CHANGES)**
- Scope: Database content (readings, prayers, ceremonies)
- Storage: Database fields (events.language, mass_times.language)
- Type: `LiturgicalLanguage` ('en' | 'es' | 'la')
- Access: Via `.en`, `.es` fields on database records

**3. Documentation Language (EXISTING - NO CHANGES)**
- Scope: User documentation at `/documentation/[lang]`
- Storage: URL parameter
- Type: `DocLanguage` ('en' | 'es')
- Routing: Dynamic route parameter

**4. Parishioner Portal Language (EXISTING - NO CHANGES)**
- Scope: Parishioner-facing portal
- Storage: localStorage key `'parishioner-language'`
- Type: `Language` ('en' | 'es')
- Context: `LanguageProvider` in parishioner layout

**Coordination:**
- When user clicks "Documentation" in sidebar, check app language and navigate to `/documentation/en` or `/documentation/es`
- Liturgical content language remains independent (selected per event)
- Parishioner portal remains independent (different localStorage key)

### Validation Messages (Zod)

**Current State:**
- Zod validation messages are hardcoded in English
- Example: `z.string().min(1, 'Family name is required')`

**Solution: Custom error maps**

Use next-intl with Zod's error mapping feature:

```typescript
// PATTERN for translated Zod schemas

import { z } from 'zod'
import { useTranslations } from 'next-intl'

FUNCTION to create schema with translations:
  ACCEPT: t (translation function)
  RETURN: Zod schema with translated error messages

EXAMPLE:
  const familyFormSchema = (t) => z.object({
    family_name: z.string().min(1, t('forms.required', { field: t('forms.familyName') }))
  })

IN COMPONENT:
  const t = useTranslations()
  const schema = familyFormSchema(t)
  const form = useForm({ resolver: zodResolver(schema) })
```

### Date/Time Formatting

**Recommendation: Use Intl.DateTimeFormat with locale**

The existing date formatters in `src/lib/utils/formatters.ts` should be enhanced to accept locale parameter:

```typescript
// ENHANCED DATE FORMATTING PATTERN

FUNCTION formatDatePretty(date: Date, locale: AppLanguage):
  IF locale is 'es':
    RETURN date formatted as "12 de diciembre de 2025"
  ELSE:
    RETURN date formatted as "December 12, 2025"
  USE Intl.DateTimeFormat with locale

FUNCTION formatDateShort(date: Date, locale: AppLanguage):
  USE Intl.DateTimeFormat with locale
  FORMAT: MM/DD/YYYY (en) or DD/MM/YYYY (es)
```

**Impact:**
- All date display functions need locale parameter
- Components must pass current language to formatters
- Backward compatible (default to 'en' if not provided)

### Toast Messages

**Current State:**
- Toast messages are hardcoded in component files
- Example: `toast.success('Family created successfully')`

**Solution: Extract to translation files**

```typescript
// PATTERN for translated toasts

import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

IN COMPONENT:
  const t = useTranslations()

  ON SUCCESS:
    toast.success(t('toasts.familyCreated'))

  ON ERROR:
    toast.error(t('toasts.errorSaving'))

  WITH DYNAMIC CONTENT:
    toast.success(t('toasts.confirmDelete', { name: family.family_name }))
```

### Status Labels

**Current State:**
- Status labels already have bilingual support in `src/lib/constants.ts`
- `MODULE_STATUS_LABELS` provides `{ en: string; es: string }` for each status

**Solution: Replace with translation keys**

INSTEAD OF:
  MODULE_STATUS_LABELS.ACTIVE.en
  MODULE_STATUS_LABELS.ACTIVE.es

USE:
  t('status.active')
  (Returns 'Active' in English or 'Activo' in Spanish based on context)

**Migration:**
- Keep MODULE_STATUS_LABELS for backward compatibility initially
- Gradually replace with t('status.X') calls
- Eventually remove MODULE_STATUS_LABELS

### Language Selector Placement

**Location: MainHeader component**

The language selector should be placed in the `MainHeader` component (`src/components/main-header.tsx`) next to the theme selector and user menu.

**Visual Layout:**
```
[Sidebar Toggle] [Breadcrumbs]              [Language] [Theme] [User Menu]
```

**Implementation:**
- Use existing `LanguageSelector` component
- Connect to `AppLanguageProvider` context
- No URL navigation (just update context state)

### Testing Requirements

**Unit Tests:**
- Language context provider (load from localStorage, update, persist)
- Translation key lookup (missing keys fall back to English)
- Language selector component (click changes language)

**Integration Tests:**
- Language change updates all visible UI elements
- Form validation messages appear in selected language
- Toast messages appear in selected language
- Sidebar menu items update when language changes

**E2E Tests:**
- User selects Spanish, all UI updates immediately
- User refreshes page, Spanish preference persists
- User switches to English mid-form, labels update but field values remain

**Not testing:**
- Translation accuracy (assume translations are correct)
- Every single translated string (spot check key areas)

### Documentation Updates

**COMPONENT_REGISTRY.md:**
- Add `AppLanguageProvider` to context providers section
- Document `useAppLanguage()` hook usage

**CODE_CONVENTIONS.md (BILINGUAL section):**
- Update to reference next-intl patterns
- Document translation key naming conventions
- Provide examples of t() usage in forms, toasts, etc.

**FORMS.md:**
- Add section on translating form labels and validation
- Document Zod schema translation pattern

**MODULE_DEVELOPMENT.md:**
- Add i18n requirements to module creation checklist
- Document translation file organization by module

**New file: I18N.md:**
- Comprehensive i18n documentation
- Translation file structure
- Adding new translations
- Using translations in components
- Common patterns and examples

### Security Considerations

**No security implications:**
- All translations are client-side only
- No user data is translated
- No database changes
- localStorage is safe for language preference

**Validation:**
- Validate language value from localStorage (must be 'en' or 'es')
- Default to 'en' if invalid value found

### Implementation Complexity

**Complexity Rating:** Medium

**Reason:**
- Library integration is straightforward (next-intl has good docs)
- Translation file creation is time-consuming but not complex
- Migration of existing components requires touching many files
- Server/Client component translation patterns are well-defined
- No database changes needed

**Estimated Effort by Phase:**
1. Setup (library, config, context): 2-4 hours
2. Translation file creation: 8-12 hours (depends on thoroughness)
3. Component migration (forms, toasts, labels): 12-20 hours
4. Testing and refinement: 4-8 hours

**Note:** This assessment focuses on WHAT needs to be done, not how long it will take. Actual implementation time depends on developer experience and priorities.

### Dependencies and Blockers

**Dependencies:**
- Install next-intl package (`npm install next-intl`)
- No other external dependencies

**Blockers:**
- None identified
- Can implement incrementally (phase by phase)

**Nice to Have (Future Enhancements):**
- Translation management UI for non-developers
- Automated missing translation detection
- Professional Spanish translation review
- Additional languages (French, Portuguese)

### Documentation Inconsistencies Found

**None identified during research.**

All existing language systems (liturgical, documentation, parishioner portal) are well-documented and functioning correctly.

### Implementation Phases

**Recommendation: 4-phase rollout**

**Phase 1: Infrastructure (Core Setup)**
- Install next-intl
- Create translation file structure (/src/i18n/locales/)
- Create AppLanguageProvider context
- Update MainHeader with LanguageSelector
- Create initial translation files with common keys
- Test language switching (even with incomplete translations)

**Phase 2: Core UI (Navigation & Common Elements)**
- Translate sidebar menu items
- Translate breadcrumbs
- Translate common buttons (Create, Edit, Delete, Save, Cancel)
- Translate status labels
- Translate loading/saving states
- Update constants.ts to use translation keys

**Phase 3: Forms & Validation**
- Translate all form labels
- Translate all placeholder text
- Translate Zod validation messages
- Update toast messages
- Translate confirmation dialogs
- Test form workflows in both languages

**Phase 4: Module-Specific Content**
- Translate module-specific labels (families, events, groups, etc.)
- Translate list view column headers
- Translate empty states
- Translate filter labels
- Translate tooltips and help text
- Final testing across all modules

**Why Phased:**
- Each phase is independently testable
- Can release partial i18n support to get feedback
- Easier to manage translation effort
- Allows for learning and refinement between phases

### String Extraction Strategy

**Estimated Translation Count:**

Based on codebase analysis:
- Navigation: ~30 strings
- Common UI: ~50 strings
- Forms (shared): ~40 strings
- Status labels: ~10 strings
- Toast messages: ~50 strings
- Module-specific: ~200 strings (across all modules)
- **Total estimate: ~380-400 translatable strings**

**Extraction Approach:**

1. **Start with reference module** (Families - simplest module)
   - Extract all hardcoded strings from families components
   - Create translation keys for families module
   - Test thoroughly in both languages
   - Use as template for other modules

2. **Common elements first** (Phase 2)
   - Grep for common patterns: "Create", "Edit", "Delete", "Save"
   - Extract sidebar navigation items
   - Extract breadcrumb patterns

3. **Form patterns** (Phase 3)
   - Grep for FormLabel components
   - Grep for placeholder=" patterns
   - Grep for toast.success( and toast.error(
   - Grep for validation error strings

4. **Module by module** (Phase 4)
   - Events module
   - Groups module
   - Locations module
   - Mass Intentions module
   - Mass Scheduling module
   - Settings module

**Tools:**
- Use grep to find hardcoded strings: `grep -r "toast\.success\|toast\.error" src/`
- Use grep to find form labels: `grep -r "FormLabel" src/`
- Manual review of each component file

### Migration Strategy for Existing Components

**Pattern: Gradual migration without breaking changes**

**Step 1: Add translations alongside existing strings**
```typescript
// BEFORE
<FormLabel>Family Name</FormLabel>

// DURING MIGRATION (both work)
<FormLabel>{t('forms.familyName')}</FormLabel>
// Original: "Family Name" still in code as fallback

// AFTER
<FormLabel>{t('forms.familyName')}</FormLabel>
```

**Step 2: Update components one at a time**
- Start with simplest component (e.g., FamilyForm)
- Test thoroughly in both languages
- Move to next component
- No "big bang" migration

**Step 3: Search for hardcoded strings**
```bash
# Find toast messages
grep -r "toast\.success\|toast\.error" src/app/(main)/

# Find form labels
grep -r "<FormLabel>" src/app/(main)/

# Find button text
grep -r "Create\|Edit\|Delete\|Save\|Cancel" src/app/(main)/
```

**Step 4: Replace systematically**
- Create checklist of all components
- Mark components as migrated
- Track progress in requirements document

### Accessibility Considerations

**HTML lang attribute:**
- Update `<html lang="en">` dynamically based on selected language
- Use next-intl's locale detection to set lang attribute
- Ensures screen readers announce content in correct language

**ARIA labels:**
- Translate aria-label attributes
- Translate button labels for screen readers
- Ensure keyboard navigation works in both languages

**Implementation:**
```typescript
// In root layout (src/app/layout.tsx)
<html lang={locale}>
  <body>
    {children}
  </body>
</html>
```

### Next Steps

**Status updated to "Ready for Development"**

Hand off to developer-agent for implementation with the following priorities:

1. **Phase 1 (Infrastructure)**: Set up next-intl, create context provider, add language selector
2. **Phase 2 (Core UI)**: Translate navigation, common buttons, status labels
3. **Phase 3 (Forms)**: Translate form labels, validation, toasts
4. **Phase 4 (Modules)**: Translate module-specific content

**After implementation:**
- Test-writer: Create tests for language switching and translation lookup
- Test-runner-debugger: Run tests and verify all scenarios work
- Project-documentation-writer: Create I18N.md and update related docs
- Code-review-agent: Review translation patterns and implementation consistency

**Recommended First Implementation:**
Start with Families module as proof-of-concept (smallest, simplest module) to validate the approach before rolling out to all modules.
