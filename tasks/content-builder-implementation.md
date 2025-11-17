# Content Builder Implementation Task List

Implementation plan for refactoring all liturgy templates to use the new abstracted builder components.

## Overview

This task list covers refactoring all 7 modules to use the new builders from `src/lib/content-builders/shared/builders/`:
- Cover Page Builder
- Reading Builder
- Psalm Builder
- Petitions Builder
- Ceremony Builder

---

## Phase 1: Wedding Module (Reference Implementation)

### Task 1.1: Refactor Wedding English Template
**File:** `src/lib/content-builders/wedding/templates/full-script-english.ts`

- [ ] Replace summary section with `buildCoverPage()`
  - [ ] Convert "Wedding Celebration" section to CoverPageSection
  - [ ] Convert "Sacred Liturgy" section to CoverPageSection
- [ ] Update reading imports to use new builders
- [ ] Refactor ceremony sections to use `buildCeremonySection()`
  - [ ] Marriage Consent - use `buildQuestionSeries()` helper
  - [ ] Exchange of Rings - use `buildCeremonySection()` with elements
  - [ ] Nuptial Blessing - use `buildPrayerWithAmen()` helper
- [ ] Test PDF/Word export with refactored template
- [ ] Verify page breaks work correctly

### Task 1.2: Refactor Wedding Spanish Template
**File:** `src/lib/content-builders/wedding/templates/full-script-spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

### Task 1.3: Update Wedding Helpers (if needed)
**File:** `src/lib/content-builders/wedding/helpers.ts`

- [ ] Review if any helpers can be removed/simplified
- [ ] Document any wedding-specific helpers that remain

---

## Phase 2: Funeral Module

### Task 2.1: Refactor Funeral English Template
**File:** `src/lib/content-builders/funeral/templates/full-script-english.ts`

- [ ] Replace summary section with `buildCoverPage()`
  - [ ] Convert "Funeral Information" section
  - [ ] Convert "Sacred Liturgy" section
- [ ] Update reading imports
- [ ] Refactor ceremony sections to use `buildCeremonySection()`
  - [ ] Final Commendation - use `buildPrayerWithAmen()` with rubrics
  - [ ] Song of Farewell - use `buildCeremonySection()` with response elements
  - [ ] Procession - use `buildCeremonySection()` with prayer-text
- [ ] Test PDF/Word export
- [ ] Verify page breaks

### Task 2.2: Refactor Funeral Spanish Template
**File:** `src/lib/content-builders/funeral/templates/full-script-spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

### Task 2.3: Update Funeral Helpers (if needed)
**File:** `src/lib/content-builders/funeral/helpers.ts`

- [ ] Review if any helpers can be removed/simplified
- [ ] Document any funeral-specific helpers that remain

---

## Phase 3: Quinceañera Module

### Task 3.1: Refactor Quinceañera English Template
**File:** `src/lib/content-builders/quinceanera/templates/full-script-english.ts`

- [ ] Replace summary section with `buildCoverPage()`
  - [ ] Convert "Quinceañera Celebration" section
  - [ ] Convert "Sacred Liturgy" section
- [ ] Update reading imports
- [ ] Refactor ceremony sections to use `buildCeremonySection()`
  - [ ] Renewal of Baptismal Promises - use `buildQuestionSeries()`
  - [ ] Blessing of the Quinceañera - use `buildPrayerWithAmen()`
  - [ ] Presentation of Symbols - use `buildCeremonySection()` with rubrics
  - [ ] Act of Thanksgiving - use `buildCeremonySection()` with prayer-text
- [ ] Test PDF/Word export
- [ ] Verify page breaks

### Task 3.2: Refactor Quinceañera Spanish Template
**File:** `src/lib/content-builders/quinceanera/templates/full-script-spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

### Task 3.3: Update Quinceañera Helpers (if needed)
**File:** `src/lib/content-builders/quinceanera/helpers.ts`

- [ ] Review if any helpers can be removed/simplified
- [ ] Document any quinceañera-specific helpers that remain

---

## Phase 4: Mass Module

### Task 4.1: Refactor Mass English Template
**File:** `src/lib/content-builders/mass/templates/english.ts`

- [ ] Replace summary section with `buildCoverPage()`
  - [ ] Convert "Mass Information" section
  - [ ] Convert "Ministers" section
- [ ] Already uses shared builders (petitions, announcements) ✓
- [ ] Add notes section using `buildSimpleCoverPage()` if beneficial
- [ ] Test PDF/Word export
- [ ] Verify page breaks

### Task 4.2: Refactor Mass Spanish Template
**File:** `src/lib/content-builders/mass/templates/spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

### Task 4.3: Update Mass Helpers (if needed)
**File:** `src/lib/content-builders/mass/helpers.ts`

- [ ] Review if any helpers can be removed/simplified

---

## Phase 5: Baptism Module (Summary-Only)

### Task 5.1: Refactor Baptism English Template
**File:** `src/lib/content-builders/baptism/templates/summary-english.ts`

- [ ] Replace summary section with `buildCoverPage()`
  - [ ] Convert "Baptism Celebration" section
  - [ ] Convert "Child to be Baptized" section
  - [ ] Convert "Parents" section
  - [ ] Convert "Sponsors" section
  - [ ] Convert "Ministers" section
- [ ] Test PDF/Word export

### Task 5.2: Refactor Baptism Spanish Template
**File:** `src/lib/content-builders/baptism/templates/summary-spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

---

## Phase 6: Presentation Module (Custom Liturgy)

### Task 6.1: Refactor Presentation Full Script English
**File:** `src/lib/content-builders/presentation/templates/full-script-english.ts`

- [ ] Replace cover page with `buildCoverPage()`
  - [ ] Convert "Presentation Information" section
- [ ] Refactor liturgy section to use `buildCeremonySection()`
  - [ ] "After the Homily" section - use `buildCeremonySection()`
  - [ ] Use `buildDialogueExchange()` for invitation/commitment
  - [ ] Use `buildPrayerWithAmen()` for prayers
- [ ] Test PDF/Word export
- [ ] Verify page breaks

### Task 6.2: Refactor Presentation Full Script Spanish
**File:** `src/lib/content-builders/presentation/templates/full-script-spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

### Task 6.3: Refactor Presentation Simple Templates
**Files:**
- `src/lib/content-builders/presentation/templates/simple-english.ts`
- `src/lib/content-builders/presentation/templates/simple-spanish.ts`

- [ ] Refactor English simple template with `buildCoverPage()`
- [ ] Refactor Spanish simple template with `buildCoverPage()`
- [ ] Test both templates

### Task 6.4: Refactor Presentation Bilingual Template
**File:** `src/lib/content-builders/presentation/templates/bilingual.ts`

- [ ] Refactor with new builders
- [ ] Test bilingual export

---

## Phase 7: Event Module (Calendar/Generic)

### Task 7.1: Refactor Event English Template
**File:** `src/lib/content-builders/event/templates/full-script-english.ts`

- [ ] Replace event details section with `buildCoverPage()`
  - [ ] Convert event information to CoverPageSection
- [ ] Test PDF/Word export

### Task 7.2: Refactor Event Spanish Template
**File:** `src/lib/content-builders/event/templates/full-script-spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

---

## Phase 8: Mass Intention Module (Summary-Only)

### Task 8.1: Refactor Mass Intention English Template
**File:** `src/lib/content-builders/mass-intention/templates/summary-english.ts`

- [ ] Replace summary section with `buildCoverPage()`
  - [ ] Convert "Mass Intention Details" section
- [ ] Test PDF/Word export

### Task 8.2: Refactor Mass Intention Spanish Template
**File:** `src/lib/content-builders/mass-intention/templates/summary-spanish.ts`

- [ ] Apply same refactoring as English template
- [ ] Test PDF/Word export
- [ ] Verify bilingual consistency

---

## Phase 9: Testing & Validation

### Task 9.1: Integration Testing
- [ ] Test Wedding PDF/Word exports (both languages)
- [ ] Test Funeral PDF/Word exports (both languages)
- [ ] Test Quinceañera PDF/Word exports (both languages)
- [ ] Test Mass PDF/Word exports (both languages)
- [ ] Test Baptism PDF/Word exports (both languages)
- [ ] Test Presentation PDF/Word exports (all templates, both languages)
- [ ] Test Event PDF/Word exports (both languages)
- [ ] Test Mass Intention PDF/Word exports (both languages)

### Task 9.2: Visual Regression Testing
- [ ] Compare old vs new PDF outputs for each module
- [ ] Verify page breaks are in correct positions
- [ ] Verify spacing and formatting is consistent
- [ ] Verify no content is missing

### Task 9.3: Performance Testing
- [ ] Measure build times before/after refactoring
- [ ] Measure PDF generation times
- [ ] Verify no performance degradation

---

## Phase 10: Documentation

### Task 10.1: Update Module Documentation
- [ ] Update `docs/LITURGICAL_SCRIPT_SYSTEM.md` with builder examples
- [ ] Add migration guide section
- [ ] Update template architecture diagrams (if any)

### Task 10.2: Update Component Documentation
- [ ] Update `docs/CONTENT_BUILDER_SECTIONS.md` with builder references
- [ ] Add builder usage examples to relevant sections

### Task 10.3: Create Migration Examples
- [ ] Document before/after comparison for each module
- [ ] Create code examples showing old vs new approach
- [ ] Add to builder README.md

---

## Phase 11: Cleanup

### Task 11.1: Remove Duplicate Code
- [ ] Review all helper files for duplicate logic
- [ ] Remove any functions that are now redundant
- [ ] Update imports across all files

### Task 11.2: Code Review
- [ ] Review all refactored templates for consistency
- [ ] Ensure all modules follow same patterns
- [ ] Verify error handling is consistent

### Task 11.3: Final Build & Test
- [ ] Run full production build
- [ ] Run all tests (if any exist)
- [ ] Verify no TypeScript errors
- [ ] Verify no runtime errors

---

## Success Criteria

### Code Quality
- ✅ All templates use new builders consistently
- ✅ No duplicate element-building code in templates
- ✅ All helper functions properly documented
- ✅ TypeScript compiles without errors

### Functionality
- ✅ All PDF exports work correctly
- ✅ All Word exports work correctly
- ✅ Page breaks in correct positions
- ✅ All content renders properly

### Documentation
- ✅ Builder README.md is comprehensive
- ✅ Migration guide is clear
- ✅ All code examples are accurate

### Performance
- ✅ No degradation in build times
- ✅ No degradation in export times
- ✅ Memory usage is stable

---

## Estimated Timeline

**Phase 1-3 (Wedding, Funeral, Quinceañera):** 4-6 hours
- Most complex modules with ceremony sections
- Reference implementations for other modules

**Phase 4-8 (Mass, Baptism, Presentation, Event, Mass Intention):** 3-4 hours
- Simpler modules or summary-only

**Phase 9 (Testing):** 2-3 hours
- Comprehensive testing across all modules

**Phase 10 (Documentation):** 2 hours
- Update docs and create examples

**Phase 11 (Cleanup):** 1 hour
- Final review and cleanup

**Total Estimated Time:** 12-16 hours

---

## Priority Order

### High Priority (Core Liturgical Modules)
1. Wedding - Most complex, best reference implementation
2. Funeral - Second most complex
3. Quinceañera - Complex with multiple ceremony sections

### Medium Priority (Standard Modules)
4. Mass - Frequently used
5. Baptism - Simple but important
6. Presentation - Custom liturgy but less complex

### Low Priority (Supporting Modules)
7. Event - Generic calendar events
8. Mass Intention - Summary only

---

## Notes

- **Backward Compatibility:** All existing code continues to work during migration
- **Gradual Migration:** Can be done module-by-module
- **Testing:** Test each module immediately after refactoring
- **Rollback Plan:** Keep git commits small and atomic for easy rollback

---

## Optional Future Enhancements

After implementation, consider:

- [ ] Create visual builder UI for ceremony sections
- [ ] Add template validation to catch common errors
- [ ] Create builder unit tests
- [ ] Generate template documentation automatically from builder configs
- [ ] Add builder analytics to track usage patterns
