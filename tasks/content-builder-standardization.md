# Content Builder Standardization - Implementation Plan

**Created:** 2025-01-17
**Status:** Planning
**Priority:** High
**Related Documentation:** [CONTENT_BUILDER_SECTIONS.md](../docs/CONTENT_BUILDER_SECTIONS.md)

---

## Overview

This task implements the standardized content builder section system across all liturgical modules. The goal is to ensure all templates follow the documented patterns for the eight allowed section types, use shared builders for strict sections (readings, psalm, gospel, petitions), and maintain consistent structure across all modules.

## Background

**Documentation Reference:** `/docs/CONTENT_BUILDER_SECTIONS.md`

**The Eight Section Types:**
1. **Cover Sheet (Summary)** - Flexible, custom per module
2. **First Reading** - Strict, use `buildReadingSection()`
3. **Psalm** - Strict, use `buildPsalmSection()`
4. **Second Reading** - Strict, use `buildReadingSection()`
5. **Gospel** - Strict, use `buildReadingSection()` with Gospel options
6. **Liturgical Ceremony** - Flexible, custom sacramental rite per module (vows, blessings, ritual actions)
7. **Petitions** - Strict, use `buildPetitionsSection()`
8. **Announcements** - Flexible, optional `buildAnnouncementsSection()`

**Key Principles:**
- Strict sections MUST use shared builders (no custom implementations)
- Flexible sections (cover, ceremony, announcements) allow custom implementations
- Title/subtitle at document level only (never in section elements)
- Page breaks managed at section level
- Renderers automatically handle "no page break after last section"

---

## Current State Assessment

### Modules Using Shared Builders ✅

**Using Shared Builders (but missing ceremony sections):**
- ⚠️ **Wedding** (2 templates: full-script-english, full-script-spanish)
  - ✅ Uses shared builders for readings, psalm, petitions
  - ❌ **Missing:** Liturgical ceremony sections (marriage consent, ring exchange, nuptial blessing)
  - **Action:** Add ceremony sections after Gospel, before Petitions

- ⚠️ **Funeral** (2 templates: full-script-english, full-script-spanish)
  - ✅ Uses shared builders for readings, psalm, petitions
  - ❌ **Missing:** Liturgical ceremony sections (final commendation, incensation, song of farewell)
  - **Action:** Add ceremony sections after readings, before Petitions

- ⚠️ **Quinceañera** (2 templates: full-script-english, full-script-spanish)
  - ✅ Uses shared builders for readings, psalm, petitions
  - ❌ **Missing:** Liturgical ceremony sections (renewal of baptismal promises, blessing, presentation of symbols)
  - **Action:** Add ceremony sections after Gospel, before Petitions

- ✅ **Mass** (2 templates: english, spanish)
  - ✅ Uses shared builders for petitions
  - ✅ Correct (Mass itself is the ceremony - no additional ceremony sections needed)
  - **Status:** Review only, no ceremony sections needed

### Modules Needing Updates ⚠️

**Summary-Only Templates (No Liturgy):**
- ⚠️ **Baptism** (2 templates: summary-english, summary-spanish)
  - Currently only has summary section (cover sheet)
  - **Question:** Should baptism have full liturgy templates with readings?
  - **Action:** Verify requirements with user

- ⚠️ **Mass Intention** (2 templates: summary-english, summary-spanish)
  - Currently only has summary section
  - Likely correct (mass intentions are metadata, not full liturgies)
  - **Action:** Verify this is the intended scope

**Has Ceremony Sections (needs to verify shared builders):**
- ⚠️ **Presentation** (5 templates: full-script-english, full-script-spanish, simple-english, simple-spanish, bilingual)
  - ✅ **Has:** Liturgical ceremony section (presentation blessing)
  - ❓ **Unknown:** Whether it uses shared builders for readings/psalm or has custom implementations
  - **Action:** Check if presentation has readings/psalm in database schema
  - **Action:** If yes, verify using shared builders (or refactor if custom)
  - **Action:** If no, document why ceremony-only approach is appropriate

- ⚠️ **Event** (2 templates: full-script-english, full-script-spanish)
  - Generic event template
  - **Action:** Check database schema and usage
  - **Action:** Determine if should use shared builders

### Unknown Status 🔍

Need to investigate:
1. Do baptism ceremonies include scripture readings? (typically yes in full rite)
2. Do presentations include formal readings? (need to check schema)
3. What is the Event module's purpose and scope?

---

## Implementation Tasks

### Phase 1: Audit and Analysis

**Goal:** Understand current state and requirements

- [ ] **Task 1.1:** Audit Wedding Templates
  - Check both English and Spanish templates
  - Verify using shared builders correctly
  - Check for title/subtitle violations
  - Check page break patterns
  - Document any issues found

- [ ] **Task 1.2:** Audit Funeral Templates
  - Same checks as wedding
  - Document any issues found

- [ ] **Task 1.3:** Audit Quinceañera Templates
  - Same checks as wedding
  - Document any issues found

- [ ] **Task 1.4:** Audit Mass Templates
  - Same checks as wedding
  - Note: Mass may have different section requirements
  - Document any issues found

- [ ] **Task 1.5:** Investigate Baptism Requirements
  - Check database schema for baptism readings/psalm fields
  - Research Catholic baptism rite requirements
  - Determine if full liturgy templates needed
  - **Decision:** Create full liturgy templates OR document summary-only scope

- [ ] **Task 1.6:** Investigate Presentation Requirements
  - Check database schema for presentation readings/psalm fields
  - Review existing custom liturgy implementation
  - Determine if should use shared builders
  - **Decision:** Refactor to shared builders OR document custom approach

- [ ] **Task 1.7:** Investigate Event Module
  - Understand purpose and scope of Event module
  - Check database schema
  - **Decision:** Keep, refactor, or deprecate

- [ ] **Task 1.8:** Investigate Mass Intention Scope
  - Confirm summary-only approach is correct
  - **Decision:** Keep as-is OR expand

### Phase 2: Fix Compliant Modules

**Goal:** Ensure modules already using shared builders are fully compliant

- [ ] **Task 2.1:** Add Wedding Ceremony Sections
  - Create ceremony section builders (marriage consent, ring exchange, nuptial blessing)
  - Add ceremony sections to both English and Spanish templates
  - Position after Gospel, before Petitions
  - Use rubrics, priest-dialogue, response, priest-text elements
  - Fix any title/subtitle violations
  - Fix any page break issues
  - Test HTML, PDF, Word outputs
  - English template
  - Spanish template

- [ ] **Task 2.2:** Add Funeral Ceremony Sections
  - Create ceremony section builders (final commendation, incensation, song of farewell)
  - Add ceremony sections to both English and Spanish templates
  - Position after readings, before Petitions
  - Use rubrics, priest-dialogue, response, priest-text elements
  - Fix any title/subtitle violations
  - Fix any page break issues
  - Test HTML, PDF, Word outputs
  - English template
  - Spanish template

- [ ] **Task 2.3:** Add Quinceañera Ceremony Sections
  - Create ceremony section builders (renewal of promises, blessing, presentation of symbols)
  - Add ceremony sections to both English and Spanish templates
  - Position after Gospel, before Petitions
  - Use rubrics, priest-dialogue, response, priest-text elements
  - Fix any title/subtitle violations
  - Fix any page break issues
  - Test HTML, PDF, Word outputs
  - English template
  - Spanish template

- [ ] **Task 2.4:** Review Mass Templates
  - Verify shared builders used correctly
  - Fix any title/subtitle violations
  - Fix any page break issues
  - Test HTML, PDF, Word outputs
  - English template
  - Spanish template
  - **Note:** No ceremony sections needed (Mass itself is the ceremony)

### Phase 3: Refactor Non-Compliant Modules

**Goal:** Implement standardized section system for modules not using shared builders

**Note:** These tasks are conditional on Phase 1 decisions

- [ ] **Task 3.1:** Add Baptism Full Liturgy Templates (if needed)
  - **Decision Point:** Determine if baptism needs full liturgy (readings + ceremony)
  - Create database fields for readings/psalm (if not exist)
  - Create full-script-english template using shared builders for readings/psalm
  - Create full-script-spanish template using shared builders for readings/psalm
  - **Add ceremony sections:** baptismal promises, blessing of water, water baptism, anointing with chrism, clothing with white garment, presentation of candle
  - Position ceremony sections appropriately (may be interspersed with readings)
  - Keep existing summary templates
  - Update template registry
  - Test all outputs

- [ ] **Task 3.2:** Refactor Presentation Templates
  - **Option A:** If has readings - refactor to use shared builders
    - Update all 5 templates (full-script-english, full-script-spanish, simple-english, simple-spanish, bilingual)
    - Replace custom liturgy sections with shared builders
    - Preserve unique presentation ceremony elements
    - Test all outputs
  - **Option B:** If custom liturgy is appropriate - document rationale
    - Add documentation explaining why custom approach is needed
    - Ensure follows element type conventions
    - Ensure page break patterns are correct

- [ ] **Task 3.3:** Refactor or Document Event Module
  - **Decision based on Phase 1 findings**
  - If should use shared builders: refactor both templates
  - If custom approach needed: document rationale
  - If deprecated: plan removal

### Phase 4: Helper Functions and Utilities

**Goal:** Ensure all necessary helper functions exist and are used correctly

- [ ] **Task 4.1:** Audit Helper Functions
  - Check all modules have helpers.ts files
  - Verify title/subtitle builders exist for each module
  - Verify event subtitle helpers exist
  - Verify any module-specific formatting helpers

- [ ] **Task 4.2:** Create Missing Helpers
  - Baptism helpers (if full liturgy templates created)
  - Any other missing helpers discovered in audit

- [ ] **Task 4.3:** Standardize Helper Patterns
  - Ensure consistent naming: `buildTitle[Language]()`, `getEventSubtitle[Language]()`
  - Ensure all helpers exported from index.ts
  - Ensure no fallback logic in templates (all in helpers)

### Phase 5: Testing and Validation

**Goal:** Verify all templates work correctly in all output formats

- [ ] **Task 5.1:** Test Wedding Module
  - Create test wedding with all sections
  - Verify HTML output (view page)
  - Verify print view (browser print)
  - Verify PDF download
  - Verify Word download
  - Test with missing optional sections
  - Both English and Spanish

- [ ] **Task 5.2:** Test Funeral Module
  - Same tests as wedding
  - Both templates

- [ ] **Task 5.3:** Test Quinceañera Module
  - Same tests as wedding
  - Both templates

- [ ] **Task 5.4:** Test Mass Module
  - Same tests as wedding
  - Both templates

- [ ] **Task 5.5:** Test Baptism Module
  - Test existing summary templates
  - Test new full liturgy templates (if created)
  - All templates

- [ ] **Task 5.6:** Test Presentation Module
  - Test all 5 templates
  - Verify refactored templates (if refactored)
  - Verify custom sections (if kept custom)

- [ ] **Task 5.7:** Test Mass Intention Module
  - Verify summary templates work correctly
  - Both templates

- [ ] **Task 5.8:** Test Event Module
  - Based on Phase 3 decision
  - Verify templates work correctly

### Phase 6: Documentation Updates

**Goal:** Update all documentation to reflect implemented changes

- [ ] **Task 6.1:** Update LITURGICAL_SCRIPT_SYSTEM.md
  - Add any new templates to module registry
  - Update implementation notes
  - Add lessons learned

- [ ] **Task 6.2:** Update Module-Specific Documentation
  - Add notes about template choices for each module
  - Document any module-specific patterns or exceptions

- [ ] **Task 6.3:** Create Migration Guide (if needed)
  - Document what changed
  - Document how to update custom code
  - Provide examples

### Phase 7: Code Review and Cleanup

**Goal:** Final cleanup and quality assurance

- [ ] **Task 7.1:** Code Review
  - Review all template files for consistency
  - Review all helper files
  - Check for code duplication
  - Check for unused code

- [ ] **Task 7.2:** Remove Dead Code
  - Delete backup files (e.g., `.backup` files found in glob)
  - Delete any deprecated templates
  - Clean up unused helpers

- [ ] **Task 7.3:** Final Testing
  - Smoke test all modules
  - Verify all outputs (HTML, PDF, Word)
  - Check for regressions

---

## Decision Points

**These decisions must be made during Phase 1:**

### Decision 1: Baptism Templates
**Question:** Should baptism have full liturgy templates with readings, psalm, gospel?

**Options:**
- **A:** Create full liturgy templates (baptism rite includes scripture)
- **B:** Keep summary-only (baptism is typically within a Mass, readings handled by Mass module)

**Factors:**
- Catholic baptism rite traditionally includes readings
- May be baptism within Mass OR baptism outside Mass
- Check if database schema supports readings for baptism

**Recommendation:** Research Catholic baptism rite, check schema, decide based on user needs

### Decision 2: Presentation Custom Liturgy
**Question:** Should presentation use shared builders or keep custom liturgy?

**Options:**
- **A:** Refactor to use shared builders (if has standard readings/psalm)
- **B:** Keep custom liturgy (if ceremony is unique and doesn't fit standard pattern)

**Factors:**
- Presentation is a Latino cultural tradition
- May have unique ceremony elements not covered by shared builders
- Check database schema for standard reading fields

**Recommendation:** Review presentation ceremony structure, check if standard readings exist

### Decision 3: Event Module Purpose
**Question:** What is the Event module for and how should it be structured?

**Options:**
- **A:** Generic event with standard liturgy (use shared builders)
- **B:** Custom event type (keep flexible)
- **C:** Deprecated (remove)

**Factors:**
- Purpose unclear without more context
- May be for generic liturgical events not covered by specific modules

**Recommendation:** Clarify Event module purpose with user

---

## Success Criteria

**The implementation is complete when:**

1. ✅ All modules using liturgical readings use shared builders
2. ✅ All templates have title/subtitle at document level only
3. ✅ All page breaks follow documented patterns
4. ✅ All helper functions follow naming conventions
5. ✅ All templates tested in HTML, PDF, and Word outputs
6. ✅ All documentation updated
7. ✅ No code duplication for strict sections (readings, psalm, petitions)
8. ✅ All custom sections documented with rationale
9. ✅ No regressions in existing functionality
10. ✅ All backup/dead code removed

---

## Risks and Mitigations

**Risk 1: Breaking Changes**
- **Risk:** Refactoring templates could break existing exports
- **Mitigation:** Test thoroughly, compare old vs. new outputs, use version control

**Risk 2: Unknown Requirements**
- **Risk:** May discover modules need features not in current system
- **Mitigation:** Phase 1 investigation, flexible approach, document exceptions

**Risk 3: Database Schema Gaps**
- **Risk:** Database may not support all needed fields for full liturgies
- **Mitigation:** Create migrations if needed, verify schema early

**Risk 4: Performance Impact**
- **Risk:** Shared builders might be slower than custom implementations
- **Mitigation:** Profile if performance concerns arise, optimize builders

**Risk 5: User Disruption**
- **Risk:** Changes might affect documents users have already created
- **Mitigation:** Test backward compatibility, provide migration path if needed

---

## Timeline Estimate

**Total Estimated Time:** 3-5 days

- **Phase 1 (Audit):** 4-6 hours
- **Phase 2 (Fix Compliant):** 4-6 hours
- **Phase 3 (Refactor Non-Compliant):** 8-12 hours (depends on decisions)
- **Phase 4 (Helpers):** 2-4 hours
- **Phase 5 (Testing):** 6-8 hours
- **Phase 6 (Documentation):** 2-3 hours
- **Phase 7 (Cleanup):** 2-3 hours

**Note:** Timeline assumes Baptism and Presentation require full refactoring. If summary-only or custom approaches are chosen, time will be reduced.

---

## Open Questions

1. **Baptism Liturgy:** Does baptism module need full liturgy templates with readings?
2. **Presentation Readings:** Does presentation ceremony use standard Catholic readings or custom liturgy?
3. **Event Module:** What is the purpose and intended use of the Event module?
4. **Mass Intention Scope:** Confirm that summary-only is correct for Mass Intentions
5. **Simple Templates:** Do "simple" presentation templates need same sections as "full" templates?
6. **Bilingual Template:** Does bilingual presentation template need special handling?

---

## Next Steps

1. **Review this plan with user** - Get feedback and answers to open questions
2. **Start Phase 1 (Audit)** - Begin with wedding module audit
3. **Make decisions** - Based on Phase 1 findings, make decisions for Baptism, Presentation, Event
4. **Execute phases sequentially** - Don't skip ahead
5. **Test continuously** - Test each module as it's updated
6. **Document as you go** - Update docs during implementation, not after

---

## Notes

- This is a **refactoring task** - functionality should remain the same, structure improves
- **Greenfield mindset** - We can make breaking changes, not concerned with backward compatibility
- **Documentation-driven** - The CONTENT_BUILDER_SECTIONS.md doc defines the target state
- **Quality over speed** - Take time to do it right, this is foundational
- **Test thoroughly** - All three output formats (HTML, PDF, Word) must work perfectly

---

## Update Log

**2025-01-17 (Updated):** Added 8th section type - **Liturgical Ceremony**
- Discovered that ceremony sections are a critical missing piece
- Ceremony sections are flexible (custom per module) and can be multiple
- Can appear at any position in the document (before/after/between readings)
- Wedding, Funeral, Baptism, Quinceañera need ceremony sections added
- Presentation already has ceremony sections (good example)
- Updated Phase 2 tasks to focus on adding ceremony sections

---

**Last Updated:** 2025-01-17
**Owner:** Claude Code
**Reviewer:** User
