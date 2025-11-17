# Comprehensive Helper Functions - Implementation Task List

**Created**: 2025-11-17
**Status**: Not Started
**Priority**: High
**Estimated Effort**: 20-25 hours

## Executive Summary

This task list consolidates all formatting and helper functions into `src/lib/utils/formatters.ts` to eliminate duplication, improve consistency, and create a single source of truth for all display formatting across the application.

**Key Problems Solved**:
- ✅ Eliminates 500-700 lines of duplicated code
- ✅ Standardizes page titles across all modules
- ✅ Standardizes filename generation for exports
- ✅ Provides consistent date/time formatting
- ✅ Centralizes relationship formatting (person + role, event + location)
- ✅ Improves bilingual support with language parameters

## Current State Analysis

### Strengths
- ✅ Basic formatters exist (`formatPersonName`, `formatEventDateTime`)
- ✅ Module-specific helpers are organized by module
- ✅ Clear separation of concerns

### Critical Issues
- ❌ `formatLocationText()` duplicated in 7+ module helper files
- ❌ Inconsistent page title generation (manual building in each page.tsx)
- ❌ `generateFilename()` logic duplicated in every view client
- ❌ No helpers for displaying related entities (person with role, event with location)
- ❌ Missing date/time variants (date-only, time-only, compact formats)
- ❌ Naming confusion between document titles and page titles

## Implementation Phases

---

## Phase 1: Critical Consolidation (Priority: HIGHEST)

**Goal**: Eliminate duplication across modules
**Estimated Time**: 6-8 hours
**Impact**: ~500 lines of code removed

### 1.1 Location Formatting Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `formatLocationWithAddress()` function
  ```typescript
  export function formatLocationWithAddress(location?: {
    name: string
    street?: string
    city?: string
    state?: string
  } | null): string
  ```
- [ ] Add `formatLocationName()` function
- [ ] Add `formatAddress()` function (address without location name)
- [ ] Add JSDoc comments with examples
- [ ] Export all functions

**Replaces**: Duplicated `formatLocationText()` in:
- `src/lib/content-builders/wedding/helpers.ts`
- `src/lib/content-builders/funeral/helpers.ts`
- `src/lib/content-builders/mass/helpers.ts`
- `src/lib/content-builders/quinceanera/helpers.ts`
- `src/lib/content-builders/presentation/helpers.ts`
- `src/lib/content-builders/baptism/helpers.ts`

### 1.2 Page Title Generator Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `getWeddingPageTitle()` - Format: "LastName-LastName-Wedding"
- [ ] Add `getFuneralPageTitle()` - Format: "PersonName-Funeral"
- [ ] Add `getBaptismPageTitle()` - Format: "ChildName-Baptism"
- [ ] Add `getMassPageTitle()` - Format: "Presider-Date-Mass"
- [ ] Add `getQuinceaneraPageTitle()` - Format: "PersonName-Quinceañera"
- [ ] Add `getPresentationPageTitle()` - Format: "ChildName-Presentation"
- [ ] Add `getMassIntentionPageTitle()` - Format: "For [intention]-Mass Intention"
- [ ] Add `getEventPageTitle()` - Format: "EventName-Date"
- [ ] Add JSDoc comments with format examples

**Replaces**: Manual title building in:
- `src/app/(main)/weddings/[id]/page.tsx`
- `src/app/(main)/funerals/[id]/page.tsx`
- `src/app/(main)/baptisms/[id]/page.tsx`
- `src/app/(main)/masses/[id]/page.tsx`
- `src/app/(main)/quinceaneras/[id]/page.tsx`
- `src/app/(main)/presentations/[id]/page.tsx`
- `src/app/(main)/mass-intentions/[id]/page.tsx`
- `src/app/(main)/events/[id]/page.tsx`

### 1.3 Filename Generator Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `formatDateForFilename()` helper (YYYYMMDD format)
- [ ] Add `getWeddingFilename()` function
- [ ] Add `getFuneralFilename()` function
- [ ] Add `getBaptismFilename()` function
- [ ] Add `getMassFilename()` function
- [ ] Add `getQuinceaneraFilename()` function
- [ ] Add `getPresentationFilename()` function
- [ ] Add `getMassIntentionFilename()` function
- [ ] Add `getEventFilename()` function
- [ ] Add JSDoc comments with format examples

**Replaces**: `generateFilename()` logic in:
- `src/app/(main)/weddings/[id]/wedding-view-client.tsx`
- `src/app/(main)/funerals/[id]/funeral-view-client.tsx`
- `src/app/(main)/baptisms/[id]/baptism-view-client.tsx`
- `src/app/(main)/masses/[id]/mass-view-client.tsx`
- `src/app/(main)/quinceaneras/[id]/quinceanera-view-client.tsx`
- `src/app/(main)/presentations/[id]/presentation-view-client.tsx`
- `src/app/(main)/mass-intentions/[id]/mass-intention-view-client.tsx`
- `src/app/(main)/events/[id]/event-view-client.tsx`

### 1.4 Update Module Page Files (page.tsx)

- [ ] Update `src/app/(main)/weddings/[id]/page.tsx` to use `getWeddingPageTitle()`
- [ ] Update `src/app/(main)/funerals/[id]/page.tsx` to use `getFuneralPageTitle()`
- [ ] Update `src/app/(main)/baptisms/[id]/page.tsx` to use `getBaptismPageTitle()`
- [ ] Update `src/app/(main)/masses/[id]/page.tsx` to use `getMassPageTitle()`
- [ ] Update `src/app/(main)/quinceaneras/[id]/page.tsx` to use `getQuinceaneraPageTitle()`
- [ ] Update `src/app/(main)/presentations/[id]/page.tsx` to use `getPresentationPageTitle()`
- [ ] Update `src/app/(main)/mass-intentions/[id]/page.tsx` to use `getMassIntentionPageTitle()`
- [ ] Update `src/app/(main)/events/[id]/page.tsx` to use `getEventPageTitle()`

### 1.5 Update Module View Client Files

- [ ] Update `src/app/(main)/weddings/[id]/wedding-view-client.tsx` to use `getWeddingFilename()`
- [ ] Update `src/app/(main)/funerals/[id]/funeral-view-client.tsx` to use `getFuneralFilename()`
- [ ] Update `src/app/(main)/baptisms/[id]/baptism-view-client.tsx` to use `getBaptismFilename()`
- [ ] Update `src/app/(main)/masses/[id]/mass-view-client.tsx` to use `getMassFilename()`
- [ ] Update `src/app/(main)/quinceaneras/[id]/quinceanera-view-client.tsx` to use `getQuinceaneraFilename()`
- [ ] Update `src/app/(main)/presentations/[id]/presentation-view-client.tsx` to use `getPresentationFilename()`
- [ ] Update `src/app/(main)/mass-intentions/[id]/mass-intention-view-client.tsx` to use `getMassIntentionFilename()`
- [ ] Update `src/app/(main)/events/[id]/event-view-client.tsx` to use `getEventFilename()`

### 1.6 Update Module Helper Files

- [ ] Update `src/lib/content-builders/wedding/helpers.ts` - replace `formatLocationText()` with import
- [ ] Update `src/lib/content-builders/funeral/helpers.ts` - replace `formatLocationText()` with import
- [ ] Update `src/lib/content-builders/mass/helpers.ts` - replace `formatLocationText()` with import
- [ ] Update `src/lib/content-builders/quinceanera/helpers.ts` - replace `formatLocationText()` with import
- [ ] Update `src/lib/content-builders/presentation/helpers.ts` - replace `formatLocationText()` with import
- [ ] Update `src/lib/content-builders/baptism/helpers.ts` - replace `formatLocationText()` with import

### 1.7 Verification & Testing

- [ ] Run build: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Manually verify page titles in browser for all modules
- [ ] Manually verify PDF/Word downloads work for all modules
- [ ] Check that filenames are consistent and correct
- [ ] Verify location displays are correct in all module view pages

---

## Phase 2: Enhanced Date/Time Formatting (Priority: HIGH)

**Goal**: Better date/time formatting for different contexts
**Estimated Time**: 3-4 hours
**Impact**: More flexible date displays, better list view formatting

### 2.1 Core Date/Time Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `formatDate()` function with options (long/short/numeric, weekday on/off)
  ```typescript
  export function formatDate(
    date?: string | null,
    language: 'en' | 'es' = 'en',
    options?: {
      includeWeekday?: boolean
      format?: 'long' | 'short' | 'numeric'
    }
  ): string
  ```
- [ ] Add `formatTime()` function (time-only, 12-hour format)
- [ ] Add `formatEventDateTimeCompact()` function for list views
  - Format: "Sun, Dec 25, 2025 at 10:00 AM"
- [ ] Add JSDoc comments with format examples
- [ ] Add bilingual support (en/es) to all functions

### 2.2 Update List View Clients

- [ ] Review `src/app/(main)/weddings/weddings-list-client.tsx` for date display improvements
- [ ] Review `src/app/(main)/masses/masses-list-client.tsx` for date display improvements
- [ ] Review `src/app/(main)/funerals/funerals-list-client.tsx` for date display improvements
- [ ] Review `src/app/(main)/baptisms/baptisms-list-client.tsx` for date display improvements
- [ ] Review `src/app/(main)/events/events-list-client.tsx` for date display improvements
- [ ] Update any that would benefit from compact date/time formatting

### 2.3 Verification & Testing

- [ ] Run build: `npm run build`
- [ ] Verify date displays in list views are consistent and readable
- [ ] Test bilingual support (if language selector is implemented)
- [ ] Verify date formatting in print views remains correct

---

## Phase 3: Event & Person Relationship Formatters (Priority: MEDIUM)

**Goal**: Better display of related entities
**Estimated Time**: 4-5 hours
**Impact**: Richer relationship displays, better liturgical script formatting

### 3.1 Person Formatting Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `formatPersonLastName()` function
- [ ] Add `formatPersonFirstName()` function
- [ ] Add `formatPersonWithRole()` function
  - Example: "John Smith (Lector)"
- [ ] Add `formatPersonWithEmail()` function
  - Example: "John Smith - john@example.com"
- [ ] Add JSDoc comments with examples

### 3.2 Event Formatting Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `getEventName()` function with fallback to event type label
  ```typescript
  export function getEventName(
    event?: { name?: string; event_type?: string } | null,
    language: 'en' | 'es' = 'en'
  ): string
  ```
- [ ] Add `formatEventWithLocation()` function
  - Example: "Wedding Ceremony at St. Mary Church"
- [ ] Add bilingual support (en/es) to all functions
- [ ] Add JSDoc comments with examples

### 3.3 Reading Formatting Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `getReadingPericope()` function
- [ ] Add `getReadingTitle()` function
- [ ] Add `formatReadingWithLector()` function
  - Example: "Genesis 1:1-5 (John Smith)"
- [ ] Add JSDoc comments with examples

### 3.4 Update Templates to Use New Formatters

- [ ] Review wedding templates for opportunities to use new formatters
- [ ] Review funeral templates for opportunities to use new formatters
- [ ] Review mass templates for opportunities to use new formatters
- [ ] Review baptism templates for opportunities to use new formatters
- [ ] Update templates to use centralized formatters where applicable

### 3.5 Verification & Testing

- [ ] Run build: `npm run build`
- [ ] Verify liturgical scripts render correctly with new formatters
- [ ] Test person-with-role displays in templates
- [ ] Test event-with-location displays
- [ ] Verify reading displays with lector names

---

## Phase 4: Template Subtitle Consolidation (Priority: MEDIUM)

**Goal**: Consolidate template helpers
**Estimated Time**: 3-4 hours
**Impact**: Remove duplication from module template helpers

### 4.1 Subtitle Helper Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `formatEventSubtitleEnglish()` function
  - Returns formatted date/time or "Missing Date and Time"
- [ ] Add `formatEventSubtitleSpanish()` function
  - Returns formatted date/time or "Falta Fecha y Hora"
- [ ] Add JSDoc comments

### 4.2 Update Module Helper Files

- [ ] Update `src/lib/content-builders/wedding/helpers.ts`
  - Replace `getEventSubtitleEnglish()` with import from formatters
  - Replace `getEventSubtitleSpanish()` with import from formatters
- [ ] Update `src/lib/content-builders/funeral/helpers.ts`
  - Replace subtitle functions with imports
- [ ] Update `src/lib/content-builders/mass/helpers.ts`
  - Replace subtitle functions with imports
- [ ] Update `src/lib/content-builders/quinceanera/helpers.ts`
  - Replace subtitle functions with imports
- [ ] Update `src/lib/content-builders/presentation/helpers.ts`
  - Replace subtitle functions with imports
- [ ] Update `src/lib/content-builders/baptism/helpers.ts` (if applicable)

### 4.3 Rename Document Title Builders (Clarity)

**Problem**: `buildTitleEnglish()` is confusing - it's for liturgical documents, not page titles

- [ ] In wedding helpers: Rename `buildTitleEnglish()` → `buildDocumentTitleEnglish()`
- [ ] In wedding helpers: Rename `buildTitleSpanish()` → `buildDocumentTitleSpanish()`
- [ ] In funeral helpers: Rename title builders with "Document" prefix
- [ ] In mass helpers: Rename title builders with "Document" prefix
- [ ] In quinceanera helpers: Rename title builders with "Document" prefix
- [ ] In presentation helpers: Rename title builders with "Document" prefix
- [ ] Update all template files that reference these functions
- [ ] Update content builder index files if needed

### 4.4 Verification & Testing

- [ ] Run build: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Verify all liturgical documents render correctly
- [ ] Verify subtitles appear correctly in English templates
- [ ] Verify subtitles appear correctly in Spanish templates
- [ ] Check that document title vs page title distinction is clear

---

## Phase 5: Convenience & Polish (Priority: LOW)

**Goal**: Quality of life improvements
**Estimated Time**: 4-5 hours
**Impact**: Cleaner view code, easier conditional rendering

### 5.1 Status & Label Helper Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `getStatusLabel()` function with language support
  ```typescript
  export function getStatusLabel(
    status?: string | null,
    language: 'en' | 'es' = 'en'
  ): string
  ```
- [ ] Add `getEventTypeLabel()` function with language support
- [ ] Add JSDoc comments

### 5.2 Related Entity Helper Functions

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `hasRelatedEvents()` function
  - Check if entity has any related event IDs
- [ ] Add `getRelatedEvents()` function
  - Extract all related events from entity
- [ ] Add `countReadings()` function
  - Count number of readings in sacrament
- [ ] Add JSDoc comments with examples

### 5.3 Type Safety Improvements

**File**: `src/lib/utils/formatters.ts`

- [ ] Create shared type fragments at top of file:
  ```typescript
  export type PersonName = {
    first_name: string
    last_name: string
  }

  export type PersonContact = PersonName & {
    email?: string
    phone_number?: string
  }

  export type LocationDetails = {
    name: string
    street?: string
    city?: string
    state?: string
    country?: string
  }

  export type EventDateTime = {
    start_date?: string
    start_time?: string
    end_date?: string
    end_time?: string
  }
  ```
- [ ] Update all function signatures to use type fragments instead of inline types
- [ ] Remove `any` types from all helper function signatures

### 5.4 List View Summary Functions (Optional Enhancement)

**File**: `src/lib/utils/formatters.ts`

- [ ] Add `getWeddingListSummary()` function
  - Example: "John Smith & Jane Doe - Dec 25, 2025"
- [ ] Add `getMassListSummary()` function
  - Example: "Fr. John Smith - Sunday, Dec 25"
- [ ] Add `getFuneralListSummary()` function
- [ ] Add JSDoc comments with format examples

### 5.5 Update Components to Use New Helpers

- [ ] Review view client files for status label displays - use `getStatusLabel()`
- [ ] Review view client files for event type displays - use `getEventTypeLabel()`
- [ ] Review components that check for related events - use `hasRelatedEvents()`
- [ ] Update any that would benefit from the new helper functions

### 5.6 Verification & Testing

- [ ] Run build: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Verify all status displays use centralized labels
- [ ] Verify event type displays are consistent
- [ ] Test conditional rendering based on related events

---

## Phase 6: Documentation & Cleanup (Priority: MEDIUM)

**Goal**: Document all changes and remove unused code
**Estimated Time**: 2-3 hours

### 6.1 Update Documentation

- [ ] Add comprehensive JSDoc comments to all new functions in `formatters.ts`
- [ ] Update `docs/COMPONENT_REGISTRY.md` if any new components were created
- [ ] Update `CLAUDE.md` to reference centralized formatters pattern
- [ ] Create usage examples document (optional)

### 6.2 Remove Unused Code

- [ ] Remove old `formatLocationText()` from all module helpers (after verification)
- [ ] Remove old `generateFilename()` from all view clients (after verification)
- [ ] Remove any other duplicated code that's been replaced
- [ ] Clean up any unused imports

### 6.3 Code Review Checklist

- [ ] All formatters have JSDoc comments with examples
- [ ] All formatters support bilingual output where applicable
- [ ] All formatters are type-safe (no `any` types)
- [ ] All formatters are pure functions (no side effects)
- [ ] All formatters handle null/undefined gracefully
- [ ] Consistent naming convention across all formatters
- [ ] Consistent parameter order (entity, language, options)

### 6.4 Final Verification

- [ ] Run full test suite: `npm test`
- [ ] Run build: `npm run build`
- [ ] Run linter: `npm run lint`
- [ ] Manual testing checklist:
  - [ ] View all module detail pages (weddings, funerals, etc.)
  - [ ] Download PDF exports for each module
  - [ ] Download Word exports for each module
  - [ ] Verify filenames are correct
  - [ ] Verify page titles in browser tabs
  - [ ] Check print views for all modules
  - [ ] Verify list views display correctly
  - [ ] Test date/time displays
  - [ ] Test location displays
  - [ ] Test person name displays

---

## Success Metrics

After completing all phases, verify:

- ✅ **500-700 lines of code removed** (duplication elimination)
- ✅ **Consistent page titles** across all 8 modules
- ✅ **Consistent file naming** for PDF/Word exports
- ✅ **Zero location formatting duplicates** (all use centralized function)
- ✅ **Single source of truth** for all display formatting
- ✅ **Type-safe helpers** (no `any` types in formatters.ts)
- ✅ **All functions documented** with JSDoc and examples
- ✅ **All tests passing** (npm test)
- ✅ **Clean build** (npm run build succeeds)
- ✅ **No console errors** in browser during manual testing

---

## Notes & Recommendations

### Naming Convention Clarity

**Important distinction** to maintain:

1. **Document Titles** (for liturgical scripts): `buildDocumentTitleEnglish()`
   - Used in content builder templates
   - Appears in generated PDF/Word documents
   - Example: "Funeral Liturgy for John Smith"

2. **Page Titles** (for browser/UI): `get[Module]PageTitle()`
   - Used in page.tsx files
   - Appears in browser tab and PageContainer
   - Example: "John Smith-Funeral"

3. **Filenames** (for exports): `get[Module]Filename()`
   - Used in view client files
   - Appears as downloaded file name
   - Example: "John-Smith-20251225.pdf"

### Module Helper Files - What to Keep

**Keep in module helpers** (don't centralize):
- Complex business logic specific to that module
  - Example: `getPetitionsReaderName()` in weddings (priority logic)
  - Example: `getHomilist()` in masses (fallback to presider)
- Module-specific conditional checks
  - Example: `hasRehearsalEvents()` in weddings
- Gendered text helpers (presentations module)
  - Example: `gendered()`, `genderedPronoun()`
- Parent/audience text helpers (presentations module)
  - Example: `getParentsTextEnglish()`

**Move to central formatters**:
- All location formatting
- All date/time formatting
- All subtitle formatting
- All filename generation
- All page title generation
- All basic person/event formatting

### Migration Safety

To avoid breaking changes during migration:

1. **Add new functions first** - don't remove old ones immediately
2. **Update one module at a time** - verify each works before moving to next
3. **Test exports thoroughly** - PDF/Word generation is critical
4. **Keep git commits small** - easier to rollback if issues arise
5. **Test print views** - they have different styling requirements

### Future Enhancements (Not in Current Scope)

Consider for future iterations:

- [ ] Add caching to expensive formatters (if performance becomes an issue)
- [ ] Add formatting presets for different contexts (list/detail/print/export)
- [ ] Add formatter for "time until event" (countdown displays)
- [ ] Add formatter for "related entities summary" (e.g., "Wedding with 2 events and 5 readings")
- [ ] Add validation helpers (e.g., "isEventComplete()", "hasRequiredReadings()")
- [ ] Add breadcrumb label generators (currently all use "View")

---

## Related Documentation

- Original task proposal: `todos/migrate-helper-functions.md`
- Subtitle consolidation: `todos/consolidate-subtitle-helpers.md`
- Types reference: `src/lib/types.ts`
- Constants reference: `src/lib/constants.ts`
- Current formatters: `src/lib/utils/formatters.ts`

---

## Implementation Tracking

**Start Date**: _________________
**Target Completion**: _________________
**Actual Completion**: _________________

**Phase Completion Status**:
- [ ] Phase 1: Critical Consolidation
- [ ] Phase 2: Enhanced Date/Time
- [ ] Phase 3: Event & Person Relationships
- [ ] Phase 4: Template Subtitle Consolidation
- [ ] Phase 5: Convenience & Polish
- [ ] Phase 6: Documentation & Cleanup

**Blockers/Issues**: _________________

**Notes**: _________________
