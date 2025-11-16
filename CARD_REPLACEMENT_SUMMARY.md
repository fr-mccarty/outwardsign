# Card Component Replacement Summary

## Task
Replace all `Card` component patterns with `FormSectionCard` across module form files.

## Pattern to Replace

**FROM:**
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
    <CardDescription>Section description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* content */}
  </CardContent>
</Card>
```

**TO:**
```tsx
import { FormSectionCard } from "@/components/form-section-card"

<FormSectionCard
  title="Section Title"
  description="Section description"
>
  {/* content */}
</FormSectionCard>
```

## Files Completed (2/13)

### 1. ✅ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/weddings/wedding-form.tsx`
- **Sections replaced:** 4
  1. Other Liturgical Roles and Liturgical Selections
  2. Petitions
  3. Announcements
  4. Additional Details
- **Note:** First 3 sections (Key Information, Other Events, Key Liturgical Roles) were already using FormSectionCard

### 2. ✅ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/funerals/funeral-form.tsx`
- **Sections replaced:** 7
  1. Key Information
  2. Other Events
  3. Other People
  4. Key Liturgical Roles
  5. Other Liturgical Roles and Liturgical Selections
  6. Petition Reader
  7. Announcements
  8. Additional Details

## Files Remaining (11/13)

### 3. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/baptisms/baptism-form.tsx`
- **Estimated sections:** 6
  - Key Information
  - Other People
  - Key Liturgical Roles
  - Other Liturgical Roles and Liturgical Selections
  - Petitions
  - Announcements
  - Additional Details

### 4. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/presentations/presentation-form.tsx`
- **Estimated sections:** 6
  - Key Information
  - Other People in the Family
  - Key Liturgical Roles
  - Other Liturgical Roles and liturgical selections
  - Petitions
  - Announcements
  - Additional Details

### 5. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/quinceaneras/quinceanera-form.tsx`
- **Estimated sections:** 7
  - Key Information
  - Other Events
  - Other People
  - Key Liturgical Roles
  - Other Liturgical Roles and Liturgical Selections
  - Petition Reader
  - Announcements
  - Additional Details

### 6. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/masses/mass-form.tsx`
- **Estimated sections:** 5
  - Basic Information
  - Ministers
  - Mass Intention (conditional - only if isEditing)
  - Mass Role Assignments (conditional - only if isEditing)
  - Petitions
  - Announcements
  - Notes

### 7. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-intentions/mass-intention-form.tsx`
- **Estimated sections:** 3
  - Basic Information (Mass Intention Details)
  - Dates and Financial Information (Dates and Stipend)
  - Notes

### 8. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/mass-role-templates/mass-role-template-form.tsx`
- **Estimated sections:** 2
  - Basic Information (Template Information)
  - Helper card (conditional - only if !isEditing)

### 9. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/events/event-form.tsx`
- **Estimated sections:** 4
  - Basic Information
  - Date & Time
  - Details
  - Additional Information

### 10. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/person-form.tsx`
- **Estimated sections:** 1
  - Person Details

### 11. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/locations/location-form.tsx`
- **Estimated sections:** 3
  - Basic Information
  - Address
  - Contact Information

### 12. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/readings/reading-form.tsx`
- **Estimated sections:** 1
  - Reading Details

### 13. ⏳ `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/settings/petitions/petition-template-form.tsx`
- **Estimated sections:** 1
  - Template Information
- **Note:** This file has a different import path for FormField: `@/components/form-field` instead of `@/components/ui/form-field`

## Next Steps

For each remaining file:
1. Replace the Card import line with FormSectionCard import
2. Find each `<Card>` usage
3. Replace with `<FormSectionCard>` using title and description props
4. Remove `<CardHeader>`, `<CardTitle>`, `<CardDescription>` tags
5. Remove `<CardContent className="space-y-4">` wrapper
6. Close with `</FormSectionCard>` instead of `</Card>`

## Validation Checklist

After completing all files, verify:
- [ ] All form files import `FormSectionCard` instead of Card components
- [ ] No more `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` usage in form files
- [ ] All sections have proper `title` prop
- [ ] `description` prop is included where it was present originally (optional prop)
- [ ] Content is properly nested without the `CardContent` wrapper
