# UX Improvement Recommendations - Action Plan

**Application**: Outward Sign
**Date**: 2025-12-13
**Prepared for**: Development Team

---

## Quick Reference: What to Fix First

### Immediate Fixes (Before Next Release)

**Time Estimate**: 4-6 hours

1. **Add Event Types explanation in Settings** (30 min)
   - File: `src/app/(main)/settings/page.tsx`
   - Update translation key for Event Types card description
   - Add comprehensive explanation of Event Types concept

2. **Clarify "Occasion" terminology** (1 hour)
   - Consider renaming to "Date & Location" throughout codebase
   - OR add tooltip explaining what an occasion is
   - Update forms and views to include help text

3. **Add Event Type concept explanation on Events pages** (1 hour)
   - File: `src/app/(main)/events/page.tsx`
   - Enhance page description
   - File: `src/app/(main)/events/create/page.tsx`
   - Add explanation before event type selector

4. **Create Mass Management overview page** (2 hours)
   - New file: `src/app/(main)/masses/page.tsx` (hub page)
   - Explain the 6 Mass Management modules and their relationships
   - Add navigation cards like Settings hub

5. **Add CSV download tooltip** (15 min)
   - File: `src/app/(main)/people/page.tsx`
   - Add tooltip or modal explaining what's included in CSV export

### Short Term Improvements (Next Sprint)

**Time Estimate**: 8-12 hours

1. **Enhance all Settings card descriptions** (2 hours)
   - Rewrite translation keys for all settings cards
   - Add concrete examples and use cases
   - Show relationships between features

2. **Improve Mass Management module labels** (3 hours)
   - Rename "Mass Role Members" to "Mass Role Scheduling"
   - Clarify "Schedule Masses" vs "Create Mass"
   - Add descriptions to template modules

3. **Add filter labels throughout** (2 hours)
   - Events: "Filter by Event Type" instead of hidden label
   - Other modules: Check for similar issues
   - Make search placeholders more specific

4. **Add field descriptions to forms** (3 hours)
   - Event Type form builder: Explain each input type
   - Mass Role forms: Explain required roles
   - Any complex forms: Add contextual help

5. **Standardize terminology** (2 hours)
   - Audit all uses of "Events" vs "Our Events"
   - Ensure "Our X" pattern is consistent (or removed)
   - Check for other inconsistencies

### Long Term Enhancements (Future Sprints)

**Time Estimate**: 16-24 hours

1. **Create administrator onboarding tour** (8 hours)
   - Interactive tour of Event Types setup
   - Mass Management configuration
   - First-time user guidance

2. **Add contextual help system** (8 hours)
   - Info icons with popovers on complex fields
   - "Learn More" links to documentation
   - Contextual tips based on user role

3. **Improve empty states** (4 hours)
   - Add more context to all empty states
   - Link to setup pages when needed
   - Show relationship to other features

4. **Add visual grouping to Settings** (4 hours)
   - Section headers for related settings
   - Reorder cards by typical workflow
   - Improve icon consistency

---

## By Category: Detailed Recommendations

### Events Module

**Priority**: High (Core functionality)

**Issues to Fix**:
1. Event Types vs Events distinction unclear
2. "Occasion" terminology confusing
3. Filter dropdown has no visible label
4. Table shows event type name, not event-specific identifier
5. Search placeholder too generic

**Recommended Changes**:

```typescript
// src/app/(main)/events/page.tsx
// Line 73 - Enhance description
description: "Create and manage parish events based on your configured event types.
              Event types (like Wedding, Funeral, Baptism) are set up in Settings
              and define what information is collected for each event."

// src/app/(main)/events/events-list-client.tsx
// Line 285 - Show filter label
label={t('events.filterByEventType')}
// Remove hideLabel

// Line 277 - Better search placeholder
placeholder="Search events by type, date, or location"
```

**Translation Keys to Update**:
- `events.filterByEventType` - "Filter by Event Type"
- `events.searchPlaceholder` - "Search events by type, date, or location"
- `events.pageDescription` - Enhanced description with Event Types explanation

---

### Settings Module

**Priority**: Critical (Foundational configuration)

**Issues to Fix**:
1. Event Types purpose not clear (CRITICAL)
2. Category Tags vs Event Types distinction unclear
3. Custom Lists purpose not clear
4. Petition Settings split unclear
5. Content Library vs Custom Lists distinction unclear

**Recommended Changes**:

```typescript
// Update all translation keys for settings card descriptions
// Example format for each:

settings.eventTypesDescription:
"Define custom event categories (like Wedding, Funeral, Baptism) with specific
fields and document templates. Each event you create will be based on an event
type. You must create at least one Event Type before you can create events.

Examples: Wedding (with Bride/Groom fields), Funeral (with Deceased Person field)"

settings.customListsDescription:
"Create dropdown lists of options (like songs, readings, or prayers) that can be
selected when creating events. Lists are reusable across event types.

Example: A 'Wedding Songs' list can be used in a Wedding Event Type's
'Opening Song' field."

settings.categoryTagsDescription:
"Organize and filter events with custom tags. Unlike event types (which define
structure), tags are flexible labels for filtering and reporting.

Examples: 'Youth Ministry', 'Spanish', 'Evening', 'Outdoor'"

settings.petitionSettingsDescription:
"Prayers of the Faithful (General Intercessions) for Mass and other liturgies.
Set up default petitions that appear every week, and create contexts (like
Christmas, Easter, Funerals) with specialized petitions."

settings.contentLibraryDescription:
"Store reusable text content (paragraphs, prayers, instructions) that can be
inserted into event documents. Unlike Custom Lists (short dropdown options),
Content Library items are longer formatted text.

Example: Standard welcome paragraph for wedding programs."
```

**Additional Enhancement**:
Consider adding visual grouping to settings hub:

```typescript
// src/app/(main)/settings/page.tsx
// Wrap cards in sections:

<div className="space-y-8">
  <section>
    <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
      Event Configuration
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Event Types, Custom Lists, Category Tags cards */}
    </div>
  </section>

  <section>
    <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
      Liturgical Content
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Petition Settings, Content Library cards */}
    </div>
  </section>

  <section>
    <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
      Administration
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Parish Settings, User Preferences cards */}
    </div>
  </section>
</div>
```

---

### Mass Management

**Priority**: High (Complex feature set)

**Issues to Fix**:
1. Module relationships unclear (CRITICAL)
2. "Schedule Masses" vs "Create Mass" unclear
3. "Mass Role Members" name confusing
4. Templates concept not explained

**Recommended Changes**:

**Option 1**: Create Mass Management Hub (RECOMMENDED)

```typescript
// NEW FILE: src/app/(main)/masses/page.tsx
// Create hub page similar to Settings

import { PageContainer } from '@/components/page-container'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Calendar,
  Heart,
  Users,
  UserCog,
  Layout,
  Clock
} from 'lucide-react'

export default function MassManagementHub() {
  return (
    <PageContainer
      title="Mass Management"
      description="The Mass is the source and summit of Catholic life. Manage your parish's Mass schedule, intentions, and liturgical roles."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">Schedule Masses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  Masses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and manage your parish's Mass schedule. Create individual
                  Mass celebrations and view upcoming liturgies.
                </p>
                <Button asChild className="w-full">
                  <Link href="/masses/list">View Mass Schedule</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Layout className="h-5 w-5 text-primary" />
                  Schedule Masses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Quickly create multiple masses at once using templates.
                  Perfect for planning weeks or months ahead.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/masses/schedule">Bulk Create Masses</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  Mass Times Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Save recurring mass schedules (like "Every Sunday at 9am") to
                  quickly create multiple masses.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/mass-times-templates">Manage Templates</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Manage Intentions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" />
                  Mass Intentions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track prayer intentions offered at each Mass. Record who
                  requested each intention and for whom it's offered.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/mass-intentions">View Intentions</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Coordinate Liturgical Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  Mass Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Define liturgical role types (Lector, Server, Musician, Usher, etc.)
                  that your parish uses during Mass.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/mass-roles">Setup Role Types</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCog className="h-5 w-5 text-primary" />
                  Mass Role Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Assign people to liturgical roles for upcoming masses. Create
                  the ministry schedule for readers, servers, and other roles.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/mass-role-members">Schedule Roles</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Layout className="h-5 w-5 text-primary" />
                  Mass Role Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Save common role configurations (like "Sunday Morning Team")
                  to quickly assign roles to multiple masses.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/mass-role-templates">Manage Templates</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
```

**Option 2**: Enhance existing pages with better descriptions (if hub page not feasible)

---

### People, Groups & Locations

**Priority**: Low (Already in good shape)

**Issues to Fix**:
1. CSV download lacks context
2. Module descriptions could show relationships
3. Title consistency ("Our X" pattern)

**Recommended Changes**:

```typescript
// src/app/(main)/people/page.tsx
// Add tooltip to CSV button

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Wrap download button:
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button asChild variant="outline">
        <Link href="/api/people/csv">
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Link>
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Download includes: Name, Email, Phone, Address, Family</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// Enhance page description
description: "Your parish directory of members, families, and contacts.
              People can be assigned to events, groups, and liturgical roles."
```

---

## Testing Recommendations

After implementing changes, test with:

1. **New User Testing**
   - Have someone unfamiliar with the app try to:
     - Create their first Event Type
     - Create an event based on that type
     - Schedule masses
     - Understand the difference between modules

2. **Content Review**
   - Read all descriptions out loud
   - Ensure they're in plain language
   - Check that examples are concrete and relevant

3. **Consistency Audit**
   - Search codebase for all uses of key terms
   - Ensure terminology is consistent everywhere
   - Check translation keys are used correctly

---

## Success Metrics

Track these to measure UX improvement:

1. **Support Questions**
   - Reduction in "What's the difference between X and Y?" questions
   - Fewer "How do I..." questions for core workflows

2. **Feature Discovery**
   - More users creating Event Types before requesting help
   - More users finding Mass Management sub-modules

3. **Completion Rates**
   - Track how many users start Event Type creation and complete it
   - Monitor form abandonment rates

---

## Conclusion

The Outward Sign application has a **solid UX foundation** but needs **improved microcopy and contextual help**. The recommendations in this document focus on:

1. **Explaining concepts** before expecting users to use them
2. **Adding context** to show how features relate
3. **Using concrete examples** instead of generic descriptions
4. **Clarifying terminology** that may be unfamiliar

**Total Estimated Effort**: 28-42 hours across all improvements

**Recommended Approach**:
- Sprint 1: Immediate fixes (4-6 hours)
- Sprint 2: Short term improvements (8-12 hours)
- Sprint 3-4: Long term enhancements (16-24 hours)

**Expected Impact**: Significant reduction in user confusion, faster onboarding, and better feature discovery.
