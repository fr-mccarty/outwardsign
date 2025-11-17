# Content Builder Standardization - Task List

**Full Plan:** [content-builder-standardization.md](./content-builder-standardization.md)
**Checklist:** [content-builder-checklist.md](./content-builder-checklist.md)

---

## Quick Task List

### Audit & Investigation (Phase 1)

1. **Audit Wedding Templates** - Check both English/Spanish for shared builder usage, title/subtitle violations, page breaks
2. **Audit Funeral Templates** - Same audit as wedding
3. **Audit Quinceañera Templates** - Same audit as wedding
4. **Audit Mass Templates** - Same audit as wedding, note Mass-specific requirements
5. **Investigate Baptism Requirements** - Check schema, research rite, decide if full liturgy needed
6. **Investigate Presentation Requirements** - Check schema, review custom liturgy, decide on shared builders
7. **Investigate Event Module** - Understand purpose, check schema, decide on approach
8. **Investigate Mass Intention Scope** - Confirm summary-only is correct

### Add Ceremony Sections (Phase 2)

9. **Add Wedding Ceremony Sections** - Create ceremony builders (consent, rings, blessing), add to templates, test outputs
10. **Add Funeral Ceremony Sections** - Create ceremony builders (commendation, incensation), add to templates, test outputs
11. **Add Quinceañera Ceremony Sections** - Create ceremony builders (promises, blessing, symbols), add to templates, test outputs
12. **Review Mass Templates** - Verify shared builders, fix violations, test outputs (no ceremony sections needed)

### Refactor Non-Compliant (Phase 3)

13. **Refactor Baptism** - Create full liturgy templates if needed (conditional)
14. **Refactor Presentation** - Update all 5 templates to use shared builders OR document custom approach
15. **Refactor Event** - Based on investigation, refactor or document

### Helper Functions (Phase 4)

16. **Audit Helper Functions** - Check all modules have helpers.ts, verify title/subtitle builders
17. **Create Missing Helpers** - Add any missing helper functions
18. **Standardize Helper Patterns** - Ensure consistent naming and no fallback logic in templates

### Testing (Phase 5)

19. **Test Wedding Module** - HTML, print, PDF, Word for both templates
20. **Test Funeral Module** - HTML, print, PDF, Word for both templates
21. **Test Quinceañera Module** - HTML, print, PDF, Word for both templates
22. **Test Mass Module** - HTML, print, PDF, Word for both templates
23. **Test Baptism Module** - HTML, print, PDF, Word for all templates
24. **Test Presentation Module** - HTML, print, PDF, Word for all 5 templates
25. **Test Mass Intention Module** - HTML, print, PDF, Word for both templates
26. **Test Event Module** - HTML, print, PDF, Word for both templates

### Documentation (Phase 6)

27. **Update LITURGICAL_SCRIPT_SYSTEM.md** - Add new templates, update notes
28. **Update Module Documentation** - Document template choices and patterns
29. **Create Migration Guide** - Document changes and update path (if needed)

### Cleanup (Phase 7)

30. **Code Review** - Review all templates and helpers for consistency
31. **Remove Dead Code** - Delete backups, deprecated templates, unused helpers
32. **Final Testing** - Smoke test all modules, verify all outputs

---

## Priority Order

**Start Here:**
1. Task 1-4: Audit compliant modules (Wedding, Funeral, Quinceañera, Mass)
2. Task 5-8: Investigate non-compliant modules (Baptism, Presentation, Event, Mass Intention)
3. **DECISION POINT** - Based on investigations, decide approach for each module
4. Task 9-12: Fix any issues in compliant modules
5. Task 13-15: Refactor non-compliant modules based on decisions
6. Task 16-18: Standardize helpers
7. Task 19-26: Comprehensive testing
8. Task 27-29: Update documentation
9. Task 30-32: Final cleanup

---

## Parallel Work Opportunities

**Can be done in parallel:**
- Audit tasks (1-4) can all run simultaneously
- Investigation tasks (5-8) can run simultaneously
- Testing tasks (19-26) can run simultaneously once modules are ready

**Must be sequential:**
- Audit → Fix
- Investigation → Decision → Refactor
- Refactor → Test
- Test → Documentation → Cleanup

---

## Estimated Time per Task

**Audit tasks (1-4):** 1 hour each = 4 hours total
**Investigation tasks (5-8):** 1 hour each = 4 hours total
**Fix tasks (9-12):** 1 hour each = 4 hours total
**Refactor tasks (13-15):** 3-4 hours each = 9-12 hours total
**Helper tasks (16-18):** 1 hour each = 3 hours total
**Testing tasks (19-26):** 45 min each = 6 hours total
**Documentation tasks (27-29):** 1 hour each = 3 hours total
**Cleanup tasks (30-32):** 1 hour each = 3 hours total

**Total:** 36-39 hours (4-5 full days)

---

## Key Questions to Answer

**During Audit (Tasks 1-4):**
- Are shared builders used correctly?
- Are there title/subtitle violations?
- Are page breaks correct?
- Are helpers used consistently?

**During Investigation (Tasks 5-8):**
- Does baptism need full liturgy templates?
- Should presentation use shared builders?
- What is Event module's purpose?
- Is Mass Intention summary-only correct?

**During Testing (Tasks 19-26):**
- Do all three output formats work (HTML, PDF, Word)?
- Are page breaks correct in PDF/Word?
- Is content formatted correctly?
- Are there any regressions?

---

**Last Updated:** 2025-01-17
