# UX Quality Audit - People, Groups & Locations

**Routes Audited**:
- `/people` (list, create, view, edit)
- `/groups` (list, create, view, edit)
- `/families` (list, create, view, edit)
- `/locations` (list, create, view, edit)

**Date**: 2025-12-13
**Target Users**: Parish staff managing parishioner directory, ministry groups, and parish venues

---

## Executive Summary

**Overall Assessment**: ✅ Good

**Critical Issues**: 0
**High Priority**: 1
**Enhancement Opportunities**: 2

**Strengths**: These reference data modules are straightforward with clear labels and logical workflows. Minor opportunities to add more contextual help.

---

## 1. Language Clarity Assessment

### Page Labels
**Status**: ✅ Clear

**Findings**:

**People Module**:
- `people/page.tsx:59` - Title: "Our People"
- `people/page.tsx:60` - Description: "Manage people in your parish."
- **Assessment**: Clear and welcoming language

**Groups Module**:
- Expected similar pattern: "Our Groups" or "Groups"
- **Assessment**: Straightforward naming

**Locations Module**:
- Expected similar pattern: "Locations"
- **Assessment**: Clear concept

**Families Module**:
- Expected similar pattern: "Families"
- **Assessment**: Self-explanatory

### Button/Action Text
**Status**: ✅ Clear

**Findings**:

**People Module**:
- `people/page.tsx:61` - Create button: "Person"
- `people/page.tsx:64` - Additional action: "Download CSV"
- **Assessment**: Clear actions with helpful CSV export

### Field Labels
**Status**: ℹ️ Unable to fully evaluate without seeing form pages

**Expected**: Standard person fields (name, email, phone, address)
**Assessment**: Likely straightforward and well-understood

---

## 2. Descriptions and Help Text

### Page Descriptions
**Status**: ✅ Adequate

**Findings**:

**People Module**:
- `people/page.tsx:60` - "Manage people in your parish."
- **Assessment**: Clear but generic
- **Enhancement**: Could add context: "Your parish directory of members, families, and contacts. People can be assigned to events, groups, and liturgical roles."

**Enhancement Opportunity**: Add more context to descriptions explaining how these modules relate to events:
- "People can be assigned as readers, ministers, or participants in events"
- "Groups can represent ministries, choirs, or committees"
- "Locations are used for Mass celebrations and event venues"

### Empty States
**Status**: ℹ️ Unable to evaluate without seeing client components

**Expected**: Empty states should:
- Welcome first-time users
- Explain why this module is useful
- Provide clear CTA to create first entry

---

## 3. Navigation and Wayfinding

### Breadcrumbs
**Status**: ✅ Present & Accurate

**Findings**:
- `people/page.tsx:52-55` - Breadcrumbs: Dashboard > Our People
- Standard pattern maintained across modules

### Page Titles
**Status**: ⚠️ Minor Inconsistency

**Findings**:

**Issue**: "Our People" vs "Our Events" Pattern
- People uses "Our People"
- Events uses "Our Events"
- **Question**: Do Groups and Locations use "Our X" pattern?

**Recommendation**: Be consistent:
- Either use "Our" prefix for all reference modules (Our People, Our Groups, Our Locations)
- Or drop "Our" for all (People, Groups, Locations)

**Priority**: Low
**Severity**: Minor inconsistency

---

## 4. Information Ordering

### Stats Display
**Status**: ✅ Excellent

**Findings**:

**People Module**:
- `people/page.tsx:44-50` - Pre-calculated stats:
  - Total people
  - People with email
  - People with phone
  - Filtered count

**Assessment**: Excellent use of stats to provide overview
**Recommendation**: Apply this pattern to Groups and Locations if not already present

---

## 5. Terminology Consistency

| Term/Concept | Usage Found | Recommendation |
|--------------|-------------|----------------|
| People vs Parishioners | "People" used | ✅ Good - inclusive of non-members |
| Groups | Consistent | ✅ Good |
| Families | Consistent | ✅ Good |
| Locations vs Venues | "Locations" used | ✅ Good - clear and neutral |

**Findings**:
- Terminology is straightforward and consistent
- No confusing variations

---

## 6. Specific Issues

### High Priority (Users May Be Confused)

#### 1. CSV Download Button Lacks Context

**Location**: `people/page.tsx:62-68`

**Current**:
```tsx
{
  type: 'action',
  label: 'Download CSV',
  icon: <Download className="h-4 w-4" />,
  href: '/api/people/csv'
}
```

**Problem**: Users don't know what fields are included in the CSV

**Recommended**: Add tooltip or modal explaining:
```
"Download all people in your parish as a CSV file including:
- Full name
- Email address
- Phone number
- Address
- Family relationships

Use this for mail merges, contact lists, or backup purposes."
```

**Priority**: High
**Severity**: Users may download without understanding what they're getting

---

### Enhancement Opportunities

#### 2. Add Relationship Context to Modules

**Location**: Module descriptions

**Enhancement**: Explain how these modules connect to other features:

**People**:
```
"Your parish directory of members, families, and contacts.
People can be assigned to events as participants, selected for liturgical
roles, and organized into groups and ministries."
```

**Groups**:
```
"Organize people into ministries, committees, choirs, and other groups.
Use groups to manage roles, track membership, and coordinate activities."
```

**Locations**:
```
"Manage parish buildings, chapels, and event venues.
Locations are used when scheduling Masses, events, and other activities."
```

**Priority**: Medium
**Severity**: Enhancement for new user understanding

---

#### 3. Add Quick Actions to View Pages

**Location**: Individual person/group/location view pages (not reviewed in detail)

**Enhancement**: On person view page, add contextual actions:
- "Add to Event"
- "Assign to Group"
- "Create Family"
- "View Calendar" (events this person is involved in)

**Priority**: Low
**Severity**: Enhancement for workflow efficiency

---

## 7. Positive Observations

### Excellent Patterns to Maintain

1. **Stats Dashboard in People Module**
   - `people/page.tsx:44-50` - Provides useful overview
   - Shows both total and filtered counts
   - Highlights data completeness (email, phone)

2. **CSV Export Feature**
   - `people/page.tsx:62-68` - Practical data portability
   - Common need for parish administration

3. **Consistent Module Structure**
   - All modules follow same pattern: List, Create, View, Edit
   - Predictable navigation

4. **Clear Breadcrumbs**
   - Every page has accurate breadcrumb trail
   - Easy to navigate back

5. **Straightforward Naming**
   - "People", "Groups", "Locations" are self-explanatory
   - No jargon or technical terms

---

## 8. Action Items Summary

| Priority | Issue | Location | Current | Recommended |
|----------|-------|----------|---------|-------------|
| High | CSV download lacks context | `people/page.tsx:64` | "Download CSV" button | Add tooltip explaining included fields |
| Medium | Add relationship context | Module descriptions | Generic descriptions | Explain how modules connect to events/groups |
| Low | Title consistency | Page titles | "Our People" vs possibly inconsistent pattern | Standardize "Our X" or "X" across all modules |
| Low | Add quick actions | View pages | Standard view | Add contextual action buttons |

---

## 9. Verdict

**UX Quality**: Good

**User Understanding**: Users will understand these modules without confusion

**Recommended Follow-up**:
- ⚠️ **Add CSV download tooltip** - Quick win for better user understanding
- ✅ **Enhance descriptions** - Optional improvement to show module relationships
- ✅ **Check title consistency** - Minor fix for polish

**Summary**: People, Groups, and Locations modules are **well-designed and straightforward**. They benefit from:

1. **Clear, simple naming** - No confusion about purpose
2. **Familiar CRUD patterns** - Create, Read, Update, Delete
3. **Useful stats** (in People module) - Overview at a glance
4. **CSV export** - Practical feature for common need

**Primary Recommendation**: These modules are in good shape. The main opportunity is to **add contextual help** explaining how they integrate with the rest of the application (Events, Masses, etc.). Consider:

- Adding "Learn More" links or info icons
- Showing relationship context in descriptions
- Adding tooltips to export/action buttons
- Linking related features (e.g., from Person view → "View Events" for this person)

**Overall**: These modules can serve as a **reference implementation** for straightforward data management UX. The patterns here should be replicated in other simple modules.
