# UX Quality Audit - Settings

**Routes Audited**:
- `/settings` (overview hub)
- `/settings/event-types`
- `/settings/category-tags`
- `/settings/content-library`
- `/settings/custom-lists`
- `/settings/petitions/default`
- `/settings/petitions/contexts`
- `/settings/parish`
- `/settings/user`

**Date**: 2025-12-13
**Target Users**: Parish administrators configuring the application

---

## Executive Summary

**Overall Assessment**: ⚠️ Needs Improvement

**Critical Issues**: 1
**High Priority**: 4
**Enhancement Opportunities**: 6

**Strengths**: Settings hub has clear visual organization with cards and icons. However, **descriptions lack specificity** and **technical terminology is not explained**, making it difficult for non-technical users to understand what each setting does.

---

## 1. Language Clarity Assessment

### Form Labels
**Status**: ℹ️ Limited Review (Hub Page Only)

**Findings**:
- Settings hub uses card titles, not form labels
- Card titles are clear but generic
- Actual setting pages not fully reviewed (would require reading each settings sub-page)

**Examples**:
- `settings/page.tsx:33` - "User Preferences" (clear)
- `settings/page.tsx:52` - "Event Types" (clear)
- `settings/page.tsx:72` - "Custom Lists" (clear but doesn't explain what they're for)

### Button/Action Text
**Status**: ⚠️ Some Issues

**Findings**:

**Issue**: Generic "Manage X" Buttons
- `settings/page.tsx:40-43` - "Configure Preferences"
- `settings/page.tsx:60-63` - "Manage Event Types"
- `settings/page.tsx:80-83` - "Manage Custom Lists"

**Problem**: "Manage" is vague. What does managing entail?
- Create/edit/delete?
- Configure settings?
- View reports?

**Recommended**: More specific button text:
- "Configure Preferences" → "Edit My Preferences"
- "Manage Event Types" → "View & Edit Event Types"
- "Manage Custom Lists" → "Create & Edit Lists"

### Card Descriptions
**Status**: ⚠️ Too Generic

**Findings**:
Most card descriptions use i18n keys but don't provide enough context about **what the feature does** or **when you'd use it**.

---

## 2. Descriptions and Help Text

### Card Descriptions
**Status**: ❌ Lacking Context

**Critical Issue**: Settings Descriptions Don't Explain Purpose

**Examples of Vague Descriptions**:

1. **Event Types Card**
   - `settings/page.tsx:57-59`
   - **Current**: Translation key `settings.eventTypesDescription`
   - **Problem**: Likely says something like "Manage event types for your parish"
   - **Recommended**: "Define custom event categories (like Wedding, Funeral, Baptism) with specific fields and document templates. Each event you create will be based on an event type."

2. **Custom Lists Card**
   - `settings/page.tsx:77-79`
   - **Current**: Translation key `settings.customListsDescription`
   - **Problem**: Doesn't explain what custom lists are used for
   - **Recommended**: "Create dropdown lists of options (like songs, readings, or prayers) that can be selected when creating events. Lists are reusable across event types."

3. **Category Tags Card**
   - `settings/page.tsx:157-159`
   - **Current**: Translation key `settings.categoryTagsDescription`
   - **Problem**: Doesn't explain what category tags are or how they differ from event types
   - **Recommended**: "Organize and filter events with custom tags. Unlike event types, tags can be applied to multiple event types and used for reporting."

4. **Petition Settings Card**
   - `settings/page.tsx:97-99`
   - **Current**: Translation key `settings.petitionSettingsDescription`
   - **Problem**: Doesn't explain what petitions are or the difference between "default" and "contexts"
   - **Recommended**: "Manage prayers of the faithful (general intercessions) for Mass and events. Set up default petitions and create contexts for different occasions."

5. **Content Library Card**
   - `settings/page.tsx:137-139`
   - **Current**: Translation key `settings.contentLibraryDescription`
   - **Problem**: Doesn't explain what goes in the content library or how it's used
   - **Recommended**: "Store reusable text content like prayers, readings, and standard paragraphs that can be inserted into event documents and programs."

---

## 3. Navigation and Wayfinding

### Breadcrumbs
**Status**: ✅ Present & Accurate

**Findings**:
- `settings/page.tsx:16-20` - Breadcrumbs set client-side: Dashboard > Settings
- Appropriate for settings hub page

**Enhancement**: Individual setting pages should have breadcrumbs like:
- Dashboard > Settings > Event Types

### Page Titles
**Status**: ✅ Descriptive

**Findings**:
- `settings/page.tsx:24` - Title: "Settings"
- Clear and appropriate for hub page

### Menu Organization
**Status**: ✅ Logical

**Findings**:
- Settings organized into logical cards
- Icons help with visual differentiation
- Grouped by category (not alphabetically, which would be less useful)

**Current Grouping** (inferred from page):
1. User Preferences (personal settings)
2. Event Types (event configuration)
3. Custom Lists (data entry options)
4. Petition Settings (liturgical content)
5. Parish Settings (organization-wide settings)
6. Content Library (reusable content)
7. Category Tags (organizational tags)

**Enhancement**: Consider adding visual sections or dividers:
- "My Settings" (User Preferences)
- "Event Configuration" (Event Types, Custom Lists, Category Tags)
- "Liturgical Content" (Petitions, Content Library)
- "Parish Administration" (Parish Settings)

---

## 4. Information Ordering

### Card Order
**Status**: ⚠️ Some Issues

**Findings**:

**Current Order** (from top-left to bottom-right):
1. User Preferences
2. Event Types
3. Custom Lists
4. Petition Settings
5. Parish Settings
6. Content Library
7. Category Tags

**Issue**: Order doesn't prioritize by importance or workflow

**Recommended Order** (by typical setup workflow):
1. Parish Settings (first-time setup)
2. Event Types (core configuration)
3. Custom Lists (supports event types)
4. Category Tags (organizational structure)
5. Content Library (reusable content)
6. Petition Settings (liturgical content)
7. User Preferences (personal, less critical)

**Priority**: Medium
**Severity**: Non-critical but would improve first-time user experience

---

## 5. Terminology Consistency

| Term/Concept | Usage Found | Recommendation |
|--------------|-------------|----------------|
| Event Types | Consistent | ✅ Good |
| Custom Lists | Consistent | ✅ Good |
| Category Tags | Consistent | ⚠️ Explain difference from Event Types |
| Petition Settings | Generic | ⚠️ Clarify "Prayers of the Faithful" |
| Content Library | Consistent | ✅ Good |
| Parish Settings | Consistent | ✅ Good |
| User Preferences | Consistent | ✅ Good |
| Manage vs Configure | Inconsistent | ⚠️ Use consistent verb |

**Findings**:
- Most terminology is consistent
- "Manage" used for most actions except "Configure" for user preferences
- Some terms (Category Tags, Petition Settings) need more context

---

## 6. Specific Issues

### Critical (Users Cannot Complete Tasks)

#### 1. Event Types Purpose Not Clear

**Location**: `settings/page.tsx:49-67`

**Problem**: Card title "Event Types" and generic description don't convey:
- That Event Types are the foundation of the entire event system
- That you MUST create Event Types before creating Events
- What fields and templates mean in this context

**Current Description** (translation key):
```
settings.eventTypesDescription
```

**Recommended Description**:
```
"Event Types define the categories of events your parish manages (like Wedding,
Funeral, or Baptism). Each type has custom input fields and document templates.
You must create at least one Event Type before you can create events.

Examples: Wedding (with Bride/Groom fields), Funeral (with Deceased Person field)"
```

**Recommended Additional Help**:
Add a "Learn More" link to documentation or a "?" icon with tooltip explaining the concept.

**Priority**: Critical
**Severity**: Users won't understand the core concept of the application

---

### High Priority (Users May Be Confused)

#### 2. Category Tags vs Event Types Distinction Unclear

**Location**: `settings/page.tsx:149-167`

**Problem**: Users will wonder: "I already have Event Types. What are Category Tags for?"

**Current Description** (translation key):
```
settings.categoryTagsDescription
```

**Recommended Description**:
```
"Category Tags are optional labels you can apply to any event, regardless of type.
Unlike Event Types (which define structure), tags are flexible labels for filtering
and reporting.

Examples: 'Youth Ministry', 'Spanish', 'Evening', 'Outdoor'"
```

**Priority**: High
**Severity**: Users may confuse tags with event types

---

#### 3. Custom Lists Purpose Not Clear

**Location**: `settings/page.tsx:69-87`

**Problem**: Description doesn't explain how Custom Lists relate to Event Types

**Current Description** (translation key):
```
settings.customListsDescription
```

**Recommended Description**:
```
"Custom Lists are dropdown options for Event Type fields. Create lists of songs,
readings, prayers, or any options you want users to select from when creating events.

Example: A 'Wedding Songs' list can be used in a Wedding Event Type's
'Opening Song' field."
```

**Priority**: High
**Severity**: Users may not understand how to use this feature

---

#### 4. Petition Settings Split Into Two Pages

**Location**: `settings/page.tsx:89-107`

**Problem**: Card description doesn't explain:
- What "Default" vs "Contexts" means
- Why petitions are split into two pages
- How these relate to Mass and other events

**Current**: Single card that links to `/settings/petitions` (which likely has sub-navigation)

**Recommended Description**:
```
"Prayers of the Faithful (General Intercessions) for Mass and other liturgies.
Set up default petitions that appear every week, and create contexts (like
Christmas, Easter, Funerals) with specialized petitions."
```

**Priority**: High
**Severity**: Unclear what user is configuring

---

#### 5. Content Library vs Custom Lists Distinction Unclear

**Location**: `settings/page.tsx:129-147`

**Problem**: Users may wonder: "I already have Custom Lists. What's different about Content Library?"

**Recommended Description**:
```
"Store reusable text content (paragraphs, prayers, instructions) that can be
inserted into event documents. Unlike Custom Lists (short dropdown options),
Content Library items are longer formatted text.

Example: Standard welcome paragraph for wedding programs."
```

**Priority**: High
**Severity**: Feature overlap confusion

---

### Enhancement Opportunities

#### 6. Add Visual Grouping to Settings Hub

**Location**: `settings/page.tsx:28-169`

**Current**: All settings cards in one flat grid

**Enhancement**: Add section headers to group related settings:

```tsx
<div className="space-y-8">
  <section>
    <h2 className="text-lg font-semibold mb-4">Personal Settings</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* User Preferences card */}
    </div>
  </section>

  <section>
    <h2 className="text-lg font-semibold mb-4">Event Configuration</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Event Types, Custom Lists, Category Tags cards */}
    </div>
  </section>

  <section>
    <h2 className="text-lg font-semibold mb-4">Liturgical Content</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Petition Settings, Content Library cards */}
    </div>
  </section>

  <section>
    <h2 className="text-lg font-semibold mb-4">Parish Administration</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Parish Settings card */}
    </div>
  </section>
</div>
```

**Priority**: Medium
**Severity**: Enhancement for clarity

---

#### 7. Add Icon Consistency

**Location**: `settings/page.tsx`

**Current**:
- User: User icon ✅
- Event Types: Calendar icon ✅
- Custom Lists: FileText icon ⚠️
- Petitions: FileText icon ⚠️
- Parish: Church icon ✅
- Content Library: FileText icon ⚠️
- Category Tags: Tag icon ✅

**Issue**: Three different features use FileText icon (Custom Lists, Petitions, Content Library)

**Enhancement**: Use more distinctive icons:
- Custom Lists: List icon
- Petitions: BookOpen icon
- Content Library: Library or Archive icon

**Priority**: Low
**Severity**: Minor visual consistency

---

#### 8. Add Settings Overview Description

**Location**: `settings/page.tsx:24-26`

**Current**:
```tsx
<PageContainer
  title={t('settings.title')}
  description={t('settings.description')}
>
```

**Enhancement**: Make description more helpful:
```
"Configure your parish settings, event types, and liturgical content.
Most users will start with Event Types to define the kinds of events
your parish manages."
```

**Priority**: Low
**Severity**: Minor enhancement

---

#### 9. Add "First Steps" Guidance

**Location**: `settings/page.tsx`

**Enhancement**: For new parishes, add a banner or callout:

```tsx
{isNewParish && (
  <Alert className="mb-6">
    <Info className="h-4 w-4" />
    <AlertTitle>First Time Setup</AlertTitle>
    <AlertDescription>
      Start by creating Event Types (like Wedding, Funeral, Baptism) in the
      Event Types section. Then, create Custom Lists for dropdown options
      like songs or readings.
    </AlertDescription>
  </Alert>
)}
```

**Priority**: Low
**Severity**: Enhancement for new users

---

#### 10. Hover States on Cards

**Location**: `settings/page.tsx:29` (and other cards)

**Current**: `className="hover:shadow-lg transition-shadow"`

**Good Practice**: Cards already have hover states ✅

**Enhancement**: Consider adding subtle background color change on hover to make it even clearer cards are clickable

**Priority**: Low
**Severity**: Minor visual enhancement

---

#### 11. Consistent Button Variants

**Location**: Throughout settings cards

**Current**:
- "Configure Preferences": `<Button asChild className="w-full justify-between">`
- Other buttons: `<Button asChild variant="outline" className="w-full justify-between">`

**Issue**: User Preferences uses default variant, others use outline

**Enhancement**: Use consistent variant for all settings cards (recommend all default or all outline)

**Priority**: Low
**Severity**: Minor visual consistency

---

## 7. Positive Observations

### Excellent Patterns to Maintain

1. **Clear Visual Organization**
   - `settings/page.tsx:28` - Grid layout with cards
   - Easy to scan and find settings

2. **Consistent Card Structure**
   - Every card has: Icon, Title, Description, Button
   - Predictable pattern

3. **ChevronRight Icon on Buttons**
   - `settings/page.tsx:43` - Indicates navigation
   - Good affordance that clicking goes to another page

4. **Icons Provide Visual Differentiation**
   - Each setting has unique icon (mostly)
   - Helps with quick recognition

5. **Internationalization Support**
   - All text uses translation keys
   - Good foundation for multi-language support

6. **Responsive Grid**
   - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - Works well on all screen sizes

---

## 8. Action Items Summary

| Priority | Issue | Location | Current | Recommended |
|----------|-------|----------|---------|-------------|
| Critical | Event Types purpose unclear | `settings/page.tsx:57-59` | Generic description | Explain that Event Types are foundation, required before creating events |
| High | Category Tags vs Event Types | `settings/page.tsx:157-159` | Vague description | Explain tags are flexible labels, different from types |
| High | Custom Lists purpose unclear | `settings/page.tsx:77-79` | Generic description | Explain lists are dropdown options for Event Type fields |
| High | Petition Settings split unclear | `settings/page.tsx:97-99` | Vague description | Explain Default vs Contexts and relation to liturgy |
| High | Content Library vs Lists unclear | `settings/page.tsx:137-139` | Generic description | Explain difference between short lists and long formatted content |
| Medium | Card order not workflow-based | `settings/page.tsx:28-169` | Alphabetical-ish | Reorder by typical setup workflow |
| Medium | Add visual grouping | `settings/page.tsx:28-169` | Flat grid | Add section headers |
| Low | Icon consistency | Various cards | Three cards use FileText | Use distinct icons |
| Low | Button variant inconsistency | `settings/page.tsx:40,60,80...` | Mixed default/outline | Standardize variant |
| Low | Add first-time guidance | `settings/page.tsx` | No guidance | Add banner for new parishes |

---

## 9. Verdict

**UX Quality**: Needs Improvement

**User Understanding**: Users may struggle to understand what each setting does and how settings relate to each other

**Recommended Follow-up**:
- 🔴 **Fix critical issue immediately** - Add comprehensive Event Types description
- ⚠️ **Address high priority items** - Clarify all card descriptions with specific examples
- ✅ **Consider enhancements** - Visual grouping, icon consistency, workflow ordering

**Summary**: Settings hub has **good visual organization** but **descriptions lack specificity**. The core issue is that **technical features are not explained in user-friendly terms**. Non-technical parish staff may not understand:
- What Event Types are and why they're needed
- How Custom Lists, Category Tags, and Content Library differ
- What "Petition Contexts" means
- When to use each setting

**Key Recommendation**: Rewrite all card descriptions to:
1. **Explain WHAT the feature is** (in plain language)
2. **Explain WHEN you'd use it** (with use cases)
3. **Provide concrete EXAMPLES** (specific to parish context)
4. **Show RELATIONSHIPS** (how features connect to each other)

**Example of Good Description**:
```
"Event Types define the categories of events your parish manages (like Wedding,
Funeral, or Baptism). Each type has custom fields and document templates.
Create Event Types here before adding individual events to your calendar."
```
