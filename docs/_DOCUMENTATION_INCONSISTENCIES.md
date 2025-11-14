# Documentation Inconsistencies Report

> **Generated:** 2025-11-15
> **Purpose:** Track inconsistencies, outdated content, and areas needing consolidation across all documentation files.

---

## 🔴 Critical Issues

### 1. **EDIT_MODULE_STRUCTURE.md - Outdated and Redundant**

**File:** `docs/EDIT_MODULE_STRUCTURE.md`

**Issue:** This file contains outdated, presentation-specific content that is now superseded by comprehensive documentation.

**Content:**
```markdown
# Structure of the Edit Module Page

Heading: {name of person} Presentation
SubHeading: Update the Presentation

Key Information (First Section)
-Recipient
-Event Information
... (presentation-specific structure)
```

**Problems:**
- ✅ Content is specific to presentations only (not a general pattern)
- ✅ Structure is now documented in EDIT_FORM_PATTERN.md
- ✅ No longer referenced by any other documentation
- ✅ Incomplete - only shows field organization, not implementation

**Recommendation:** **DELETE** this file entirely.

**Rationale:**
- All edit form patterns are now in EDIT_FORM_PATTERN.md (comprehensive)
- Presentation-specific structure should be in presentation module code if needed
- MODULE_COMPONENT_PATTERNS.md covers the architecture
- This file provides no unique value

---

## ⚠️ Documentation Conflicts

### 2. **Form Wrapper Props - Type Inconsistency**

**Conflict Between:**
- `EDIT_FORM_PATTERN.md` (Lines 413-417)
- `MODULE_COMPONENT_PATTERNS.md` (Lines 412-414)

**EDIT_FORM_PATTERN.md says:**
```tsx
interface WeddingFormWrapperProps {
  wedding?: Wedding  // ← Base type
  title: string
  description: string
  saveButtonLabel: string
}
```

**MODULE_COMPONENT_PATTERNS.md says:**
```tsx
interface FormWrapperProps {
  entity?: EntityWithRelations  // ← WithRelations type
}
```

**Actual Implementation (verified in code):**
```tsx
// wedding-form-wrapper.tsx uses base type
wedding?: Wedding  // ✅ CORRECT
```

**Resolution Needed:**
- EDIT_FORM_PATTERN.md is CORRECT (uses base type)
- MODULE_COMPONENT_PATTERNS.md needs correction (should use base type, not WithRelations)

**Why:** Form wrapper only needs to pass entity to form. It doesn't need relations itself.

---

### 3. **Picker Documentation Overlap**

**Files with overlapping content:**
- `PICKERS.md` (1,281 lines) - Comprehensive picker system documentation
- `PICKER_PATTERNS.md` (312 lines) - Behavioral patterns and critical rules
- `PICKER_EDIT_MODE.md` (314 lines) - Edit mode specific patterns
- `COMPONENT_REGISTRY.md` - Also documents picker components

**Issues:**
1. **PICKERS.md is very comprehensive** but contains content that's also in:
   - PICKER_PATTERNS.md (auto-select behavior, openToNew* pattern)
   - PICKER_EDIT_MODE.md (edit mode props and behavior)
   - COMPONENT_REGISTRY.md (picker component props and usage)

2. **Unclear file purpose hierarchy** - Which file should be consulted first?

3. **Potential for divergence** - Same information in multiple places can get out of sync

**Recommendation:** Create clear hierarchy and cross-references:

**Proposed Structure:**
```
COMPONENT_REGISTRY.md
  ├─ Quick Reference: All picker components with props
  └─ Links to detailed docs ↓

PICKERS.md (Main Reference)
  ├─ Architecture & CorePicker
  ├─ Creating New Pickers
  ├─ Field Wrappers
  └─ Links to behavioral docs ↓

PICKER_PATTERNS.md (Behavioral Rules)
  ├─ No Redirect Rule
  ├─ Auto-Select Rule
  └─ openToNew* Pattern

PICKER_EDIT_MODE.md (Edit Mode)
  └─ Edit mode implementation
```

**Action Items:**
- Add clear "See Also" sections in each file
- Add header notes explaining file purpose and relationship
- Consider consolidating PICKER_PATTERNS.md content into PICKERS.md

---

### 4. **FormField Documentation Duplication**

**Files discussing FormField:**
- `FORMS.md` (Lines 165-229)
- `VALIDATION.md` (Lines 1-173)

**Overlap:**
- Both files explain FormField is REQUIRED
- Both show ❌ PROHIBITED patterns
- Both show ✅ CORRECT patterns
- Nearly identical examples

**Difference:**
- FORMS.md focuses on general form patterns
- VALIDATION.md focuses on validation-specific usage

**Recommendation:**
- Keep FORMS.md as primary FormField reference
- VALIDATION.md should reference FORMS.md for FormField usage
- Remove duplicate examples from VALIDATION.md

**Suggested change in VALIDATION.md:**
```markdown
## 1. FormField Component (CRITICAL)

**ALL form inputs must use FormField.** See [FORMS.md](./FORMS.md#formfield-usage-critical---required) for comprehensive FormField documentation including:
- Usage patterns
- Props reference
- Prohibited patterns
- Exceptions

This section focuses on FormField's **validation integration** with React Hook Form.
```

---

### 5. **Validation Pattern Discrepancy**

**Files discussing validation:**
- `FORMS.md` (Lines 257-307) - "Validation" section
- `VALIDATION.md` (entire file)

**FORMS.md suggests:**
```tsx
// Client Form - use .safeParse() (returns result object)
const result = createEntitySchema.safeParse(formData)

if (!result.success) {
  toast.error(result.error.issues[0].message)  // Note: .issues (Zod v4)
  return
}

await createEntity(result.data)
```

**VALIDATION.md mandates:**
```tsx
// ✅ Use React Hook Form with zodResolver
const { handleSubmit } = useForm({
  resolver: zodResolver(createPresentationSchema),
})

// No manual .safeParse() needed - React Hook Form handles it
```

**Issue:** FORMS.md shows manual `.safeParse()` pattern, but VALIDATION.md says this is outdated and should use React Hook Form's automatic validation.

**Resolution:**
- VALIDATION.md pattern is newer and better (automatic validation)
- FORMS.md needs update to reflect React Hook Form pattern
- Manual `.safeParse()` should only be shown as legacy pattern

**Action:**
- Update FORMS.md validation section to recommend React Hook Form + zodResolver
- Show manual `.safeParse()` as "Legacy Pattern (Not Recommended)"
- Add reference to VALIDATION.md for comprehensive guidance

---

## 📝 Minor Issues

### 6. **Inconsistent Terminology**

**"isEditing" vs "editMode":**

In module forms:
```tsx
const isEditing = !!entity  // ✅ Standard across all forms
```

In picker components:
```tsx
editMode={value !== null}  // ⚠️ Different naming
```

**Issue:** Using different names for similar concepts can be confusing.

**Recommendation:** Document the distinction clearly:
- **`isEditing`** - Whether the **parent form** (module) is in edit mode
- **`editMode`** - Whether the **picker modal** should edit an existing entity

Already documented in PICKER_EDIT_MODE.md lines 10-18, but worth emphasizing.

---

### 7. **Next.js 15 searchParams Pattern Incomplete**

**MODULE_COMPONENT_PATTERNS.md (Lines 61-76):**
```tsx
export default async function [Entities]Page({ searchParams }: PageProps) {
  // 2. Parse search params (Next.js 15 requires await)
  const params = await searchParams
  const filters = {
    search: params.search,
    status: params.status
  }
```

**Issue:** This pattern is mentioned but not consistently applied across all examples in docs.

**Verification Needed:**
- Check if all server page examples use `await searchParams`
- Update any examples using old pattern `searchParams.search` directly

**Files to check:**
- All page.tsx examples in MODULE_COMPONENT_PATTERNS.md
- EDIT_FORM_PATTERN.md examples

---

## 🔧 Consolidation Opportunities

### 8. **Picker Component Props Documentation**

**Currently scattered across:**
1. COMPONENT_REGISTRY.md - Picker props tables
2. PICKERS.md - Detailed prop explanations
3. Individual picker section files

**Recommendation:**
- COMPONENT_REGISTRY.md = Quick reference table (props only)
- PICKERS.md = Detailed prop documentation + usage
- Remove redundant prop tables from other docs

---

### 9. **Testing Documentation Structure**

**Current files:**
- `TESTING_QUICKSTART.md` - Setup and run commands
- `TESTING_GUIDE.md` - Comprehensive testing patterns
- `TESTING_ARCHITECTURE.md` - Testability standards

**Issue:** No clear indication of which file to consult first.

**Recommendation:** Add cross-references at top of each file:
```markdown
# TESTING_QUICKSTART.md
> **Quick Start:** Run tests immediately
> **Detailed Guide:** See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
> **Architecture:** See [TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)
```

---

## 📚 Documentation Organization Suggestions

### File Purpose Clarity Matrix

| File | Primary Purpose | Audience | Status |
|------|----------------|----------|--------|
| **EDIT_FORM_PATTERN.md** | Complete edit form implementation | Developers creating modules | ✅ Good |
| **MODULE_COMPONENT_PATTERNS.md** | All 9 module files patterns | Developers creating modules | ⚠️ Needs type fix |
| **FORMS.md** | General form patterns & styling | All developers | ⚠️ Needs validation update |
| **VALIDATION.md** | Validation with React Hook Form + Zod | All developers | ✅ Good |
| **PICKERS.md** | Picker system architecture | Developers using/creating pickers | ✅ Good |
| **PICKER_PATTERNS.md** | Critical picker behavioral rules | All developers using pickers | ⚠️ Consider merging |
| **PICKER_EDIT_MODE.md** | Edit mode in pickers | Developers implementing edit | ✅ Good |
| **COMPONENT_REGISTRY.md** | Quick reference for all components | All developers | ⚠️ Needs deduplication |
| **EDIT_MODULE_STRUCTURE.md** | ??? | ??? | ❌ DELETE |

---

## Action Plan

### Immediate Actions (High Priority)

1. **DELETE `EDIT_MODULE_STRUCTURE.md`** - Outdated and redundant
2. **Fix form wrapper type** in MODULE_COMPONENT_PATTERNS.md (should use base type)
3. **Update FORMS.md validation section** to use React Hook Form pattern
4. **Add clear cross-references** between FORMS.md and VALIDATION.md

### Short-Term Actions (Medium Priority)

5. **Consolidate picker docs** - Add clear hierarchy notes to PICKERS.md, PICKER_PATTERNS.md
6. **Remove FormField duplication** from VALIDATION.md
7. **Add file purpose headers** to testing docs
8. **Verify Next.js 15 pattern** across all server page examples

### Long-Term Actions (Low Priority)

9. **Consider merging** PICKER_PATTERNS.md into PICKERS.md (optional)
10. **Create documentation index** showing file relationships
11. **Add "last updated" dates** to frequently changing docs

---

## Files That Are Excellent ✅

The following files are well-written, clear, and have no inconsistencies:

- **EDIT_FORM_PATTERN.md** - Comprehensive, clear, well-organized
- **RENDERER.md** - Excellent technical documentation with examples
- **DESIGN_PRINCIPLES.md** - Clear, actionable principles
- **CONSTANTS_PATTERN.md** - Concise and complete
- **LITURGICAL_CALENDAR.md** - Well-structured technical doc
- **TESTING_GUIDE.md** - Comprehensive testing patterns

---

## Summary Statistics

- **Total docs files:** 33
- **Files with critical issues:** 1 (EDIT_MODULE_STRUCTURE.md - DELETE)
- **Files with conflicts:** 4 (MODULE_COMPONENT_PATTERNS.md, FORMS.md, VALIDATION.md, PICKERS.md)
- **Files needing minor updates:** 3 (COMPONENT_REGISTRY.md, testing docs, various examples)
- **Files that are excellent:** 6+

---

## Recommendations for Documentation Maintenance

1. **Add "Last Updated" dates** to docs that change frequently
2. **Add "See Also" sections** to related documentation
3. **Use clear file naming** - Purpose should be obvious from filename
4. **Avoid duplication** - One source of truth for each concept
5. **Cross-reference liberally** - Guide readers to related information
6. **Create doc index page** - High-level map of all documentation

---

## Questions for User

1. **EDIT_MODULE_STRUCTURE.md** - Confirm deletion?
2. **Picker docs** - Prefer separate files or consolidated into PICKERS.md?
3. **VALIDATION.md vs FORMS.md** - Should validation content stay separate or merge?
4. **Documentation style** - Prefer comprehensive single files or focused topic files?
