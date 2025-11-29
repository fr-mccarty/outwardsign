# Person Images Feature

**Date:** 2025-11-29
**Last Updated:** 2025-11-29 (Added person picker create/edit photo upload capability)
**Feature Type:** Enhancement
**Priority:** Medium
**Estimated Complexity:** Medium-High (5-7 days)

## 📝 Recent Updates

**2025-11-29:** Updated requirements to include photo upload capability in person picker dialogs:
- ✅ **Person picker CREATE view** - Users can now upload photos when creating a person inline (e.g., adding a bride during wedding planning)
- ✅ **Person picker EDIT view** - Users can now change/remove photos when editing a person inline from the picker
- This ensures consistent photo management across all person creation/editing workflows

---

## Feature Overview

Add image upload capability for person records, allowing parish staff to upload, crop, and display profile photos for people in the directory. Images will be displayed throughout the application (person view, person list, person picker, PDF exports) to help staff visually identify parishioners.

**Display & Upload Locations:**
- ✅ Person create page (`/people/create`) - Upload photo during creation
- ✅ Person edit page (`/people/[id]/edit`) - Upload/change/remove photo
- ✅ Person view page (`/people/[id]`) - Display large profile photo
- ✅ Person list page (`/people`) - Display photo in list cards
- ✅ **Person picker list view** - Display photo next to each person in picker
- ✅ **Person picker CREATE dialog** - Upload photo when creating person inline
- ✅ **Person picker EDIT dialog** - Change/remove photo when editing person inline
- ✅ PDF exports - Include photo on cover pages for primary participants

**Key Context:**
- This is a new feature - no image functionality currently exists in the application
- Person records currently use text-based Avatar component from shadcn/ui showing initials
- Application uses Supabase as backend - will leverage Supabase Storage for cloud file storage
- Forms use react-hook-form + Zod for validation (see `/home/user/outwardsign/docs/FORMS.md`)
- All database changes require migration files (see `/home/user/outwardsign/docs/DATABASE.md`)

---

## Business Value

**Problem:**
Parish staff manage hundreds of parishioners and often struggle to remember faces, especially when multiple people share similar names. Without visual identification, it's challenging to confirm you're working with the correct person record, particularly during sacrament planning when accuracy is critical.

**Solution:**
Profile photos provide visual confirmation of identity, making it easier to identify and verify person records during data entry, sacrament planning, and ministry assignment.

**Impact:**
- Reduces data entry errors by providing visual confirmation
- Improves user experience with familiar profile photo patterns
- Helps staff quickly identify people they work with regularly
- Particularly valuable for large parishes with many parishioners
- Professional appearance for printed contact cards and liturgical scripts

---

## User Stories

### Story 1: Upload Photo for New Person
**As a** parish staff member creating a new person record
**I want to** upload a profile photo during person creation
**So that** the person is visually identifiable from the start

**Acceptance Criteria:**
- Photo upload field appears at the top of the person create form (above all other sections)
- Field is optional (not required)
- Simple file picker button (no drag-and-drop)
- After selecting a file, I see a cropping interface
- I can zoom in/out and adjust crop area to 400x400px
- Accepted formats: JPEG, PNG, WebP only
- Maximum file size: 5MB
- Client-side validation shows clear error messages for invalid files
- Cropped image is uploaded to Supabase Storage
- Image URL is saved to person record as `avatar_url`

### Story 2: Upload Photo for Existing Person
**As a** parish staff member editing an existing person
**I want to** add or replace their profile photo
**So that** their record is complete and visually identifiable

**Acceptance Criteria:**
- Photo field appears at top of person edit form
- If person has existing photo, I see the current image
- I can click to upload a new photo (replaces existing)
- New upload follows same crop flow as create form
- Old image is removed from storage when replaced

### Story 3: Remove Photo from Person Record
**As a** parish staff member
**I want to** remove a person's photo
**So that** I can delete outdated or incorrect images

**Acceptance Criteria:**
- When viewing person with existing photo, I see "Remove Photo" button
- Clicking button immediately removes photo (no confirmation dialog)
- Photo is deleted from Supabase Storage
- `avatar_url` is set to null in database
- UI reverts to initials fallback

### Story 4: View Person Photo in Person List
**As a** parish staff member browsing the people directory
**I want to** see profile photos in the list view
**So that** I can quickly visually identify people

**Acceptance Criteria:**
- Person cards in list view (`/people`) show profile photo if it exists
- If no photo, card shows initials in Avatar fallback (current behavior)
- Photos are displayed in small circular format (consistent with shadcn Avatar)
- Images load efficiently without slowing down page

### Story 5: View Person Photo in Person View Page
**As a** parish staff member viewing a person record
**I want to** see their profile photo prominently displayed
**So that** I can confirm I'm looking at the correct person

**Acceptance Criteria:**
- Person view page (`/people/[id]`) shows larger profile photo
- Photo appears in ModuleViewContainer header area
- If no photo, shows initials fallback
- Photo is clear and high quality

### Story 6: View Person Photo in Person Picker
**As a** parish staff member selecting a person (e.g., for wedding bride/groom)
**I want to** see profile photos in the picker list view
**So that** I can visually confirm I'm selecting the correct person

**Acceptance Criteria:**
- Person picker list view shows photos next to each person's name
- Photos use Avatar component for consistency
- If no photo, shows initials fallback
- ✅ **Photos DO appear in person picker CREATE view** - inline form includes ImageCropUpload component
- ✅ **Photos can be changed in person picker EDIT view** - inline edit form includes ImageCropUpload component
- Photos appear in the picker after person is created and selected

### Story 6a: Upload Photo in Person Picker Create View
**As a** parish staff member creating a new person inline (e.g., adding a bride during wedding planning)
**I want to** upload a profile photo directly in the picker create form
**So that** the person is visually identifiable immediately without leaving the current workflow

**Acceptance Criteria:**
- Person picker create dialog includes ImageCropUpload component
- Upload follows same crop flow as main person create form
- After creating person with photo, photo displays in picker field
- Photo upload is optional (can skip and create person without photo)
- Client-side validation works same as main form (size, type)

### Story 6b: Change Photo in Person Picker Edit View
**As a** parish staff member editing a person inline from the picker
**I want to** add, replace, or remove their profile photo
**So that** I can update person details without navigating to the main person edit page

**Acceptance Criteria:**
- Person picker edit dialog includes ImageCropUpload component
- If person has existing photo, current photo displays
- Can upload new photo to replace existing photo
- Can remove photo with "Remove Photo" button
- Changes save immediately when edit dialog is submitted

### Story 7: View Person Photo in PDF Exports
**As a** presider reviewing a printed liturgical script
**I want to** see profile photos of key participants on the cover page
**So that** I can visually identify who will be at the ceremony

**Acceptance Criteria:**
- PDF exports include person photos when `avatar_url` exists
- Photos appear on cover pages for primary participants (bride, groom, deceased, child, quinceañera)
- If no photo, PDF shows no image placeholder (clean fallback)
- Images are properly sized and positioned in PDF layout
- Both portrait and landscape images render correctly

### Story 8: Client-Side Image Validation
**As a** parish staff member uploading an image
**I want to** receive immediate feedback on file issues
**So that** I don't waste time uploading invalid files

**Acceptance Criteria:**
- File size validation before upload (max 5MB)
- File type validation (JPEG, PNG, WebP only)
- Clear error messages via toast notifications
- Invalid files are rejected before crop interface opens
- Same validation applies to person picker create/edit forms

### Story 9: Image Cropping with shadcn-image-cropper
**As a** parish staff member uploading a photo
**I want to** crop the image to focus on the person's face
**So that** profile photos are consistent and professional

**Acceptance Criteria:**
- After file selection, cropping modal opens
- Cropper maintains 1:1 aspect ratio (square crop)
- Target output: 400x400px (optimized size)
- I can zoom in/out within the crop area
- I can drag to reposition the crop area
- Cropper UI matches application design (shadcn components)
- "Save" button applies crop and uploads image
- "Cancel" button discards selection

---

## Technical Scope

### 1. Database Changes

**Migration File:** `supabase/migrations/YYYYMMDDHHMMSS_add_person_avatar_url.sql`

**Changes Required:**
```sql
-- Add avatar_url column to people table
ALTER TABLE people ADD COLUMN avatar_url TEXT;

-- Add comment documenting the field
COMMENT ON COLUMN people.avatar_url IS 'URL to person profile photo stored in Supabase Storage (bucket: person-avatars)';

-- No index needed - avatar_url is not used for queries/filtering
```

**Table:** `people`
**Column:** `avatar_url TEXT` (nullable)
**Purpose:** Store Supabase Storage URL for person profile photo

**Notes:**
- Field is nullable (photos are optional)
- No default value
- No foreign key constraint (URL string pointing to Supabase Storage)
- RLS policies already exist for people table (no changes needed)

---

### 2. Supabase Storage Setup

**Bucket Configuration:**

**Bucket Name:** `person-avatars`
**Settings:**
- Public: `false` (authenticated access only)
- File Size Limit: `5MB`
- Allowed MIME Types: `image/jpeg`, `image/png`, `image/webp`

**Folder Structure:**
```
person-avatars/
  ├── {parish_id}/
  │   ├── {person_id}.jpg
  │   ├── {person_id}.png
  │   └── {person_id}.webp
```

**RLS Policies for Storage:**

1. **Select (View Images):**
   ```sql
   CREATE POLICY "Parish members can view their parish person avatars"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'person-avatars' AND
     (storage.foldername(name))[1] IN (
       SELECT parish_id::text FROM parish_users WHERE user_id = auth.uid()
     )
   );
   ```

2. **Insert (Upload Images):**
   ```sql
   CREATE POLICY "Parish members can upload avatars for their parish"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'person-avatars' AND
     (storage.foldername(name))[1] IN (
       SELECT parish_id::text FROM parish_users WHERE user_id = auth.uid()
     )
   );
   ```

3. **Update (Replace Images):**
   ```sql
   CREATE POLICY "Parish members can update avatars for their parish"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'person-avatars' AND
     (storage.foldername(name))[1] IN (
       SELECT parish_id::text FROM parish_users WHERE user_id = auth.uid()
     )
   );
   ```

4. **Delete (Remove Images):**
   ```sql
   CREATE POLICY "Parish members can delete avatars for their parish"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'person-avatars' AND
     (storage.foldername(name))[1] IN (
       SELECT parish_id::text FROM parish_users WHERE user_id = auth.uid()
     )
   );
   ```

**Setup Method:**
- Storage bucket and RLS policies should be created via migration file
- Use `CREATE BUCKET` SQL commands in migration (supported by Supabase)

---

### 3. Type Definitions

**File:** `src/lib/types.ts`

**Changes Required:**
```typescript
export interface Person {
  id: string
  parish_id: string
  first_name: string
  first_name_pronunciation?: string
  last_name: string
  last_name_pronunciation?: string
  full_name: string
  full_name_pronunciation: string
  phone_number?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  sex?: 'Male' | 'Female'
  note?: string
  mass_times_template_item_ids?: string[]
  avatar_url?: string  // NEW: URL to profile photo in Supabase Storage
  created_at: string
  updated_at: string
}
```

**Notes:**
- `avatar_url` is optional (nullable in database)
- Type matches database column type (TEXT → string)

---

### 4. Schema Validation

**File:** `src/lib/schemas/people.ts`

**Changes Required:**
```typescript
import { z } from 'zod'

// Create person schema
export const createPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  first_name_pronunciation: z.string().optional().nullable(),
  last_name: z.string().min(1, 'Last name is required'),
  last_name_pronunciation: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipcode: z.string().optional().nullable(),
  sex: z.enum(['Male', 'Female']).optional().nullable(),
  note: z.string().optional().nullable(),
  mass_times_template_item_ids: z.array(z.string()).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),  // NEW: URL validation
})

// Update person schema (all fields optional)
export const updatePersonSchema = createPersonSchema.partial()

// Export types using z.infer
export type CreatePersonData = z.infer<typeof createPersonSchema>
export type UpdatePersonData = z.infer<typeof updatePersonSchema>
```

**Notes:**
- `avatar_url` validated as URL format
- Optional and nullable (consistent with other optional fields)

---

### 5. Server Actions

**File:** `src/lib/actions/people.ts`

**New Functions Required:**

```typescript
/**
 * Upload person avatar image to Supabase Storage
 *
 * @param personId - ID of the person
 * @param file - Base64 encoded image data (already cropped on client)
 * @param fileExtension - File extension (jpg, png, webp)
 * @returns avatar_url - Public URL of uploaded image
 */
export async function uploadPersonAvatar(
  personId: string,
  file: string, // base64 data URL
  fileExtension: string
): Promise<string>

/**
 * Delete person avatar image from Supabase Storage
 *
 * @param personId - ID of the person
 */
export async function deletePersonAvatar(personId: string): Promise<void>

/**
 * Get signed URL for person avatar (for authenticated viewing)
 *
 * @param avatarUrl - Storage path from person.avatar_url
 * @returns Signed URL with temporary access token
 */
export async function getPersonAvatarUrl(avatarUrl: string): Promise<string>
```

**Implementation Details:**

1. **uploadPersonAvatar:**
   - Requires authentication (use `requireSelectedParish()` and `ensureJWTClaims()`)
   - Verify person belongs to user's parish
   - Delete old avatar if it exists
   - Convert base64 to buffer
   - Upload to storage: `{parish_id}/{person_id}.{extension}`
   - Get public URL from storage
   - Update person record with new `avatar_url`
   - Revalidate paths: `/people`, `/people/{id}`, `/people/{id}/edit`
   - Return avatar_url

2. **deletePersonAvatar:**
   - Requires authentication
   - Verify person belongs to user's parish
   - Get person record to find avatar_url
   - Delete file from storage
   - Update person record (set `avatar_url` to null)
   - Revalidate paths: `/people`, `/people/{id}`, `/people/{id}/edit`

3. **getPersonAvatarUrl:**
   - For private storage access
   - Generate signed URL with 1-hour expiry
   - Return signed URL for authenticated viewing

**Existing Functions - No Changes:**
- `createPerson()` - already handles all person fields including new avatar_url
- `updatePerson()` - already handles all person fields including new avatar_url
- `getPerson()` - already returns all person fields including new avatar_url
- `getPeople()` - already returns all person fields including new avatar_url

---

### 6. UI Components

#### New Component: ImageCropUpload

**File:** `src/components/image-crop-upload.tsx`

**Purpose:** Reusable image upload component with cropping functionality

**Key Features:**
- File picker button (no drag-and-drop)
- Client-side file validation (size, type)
- Integration with shadcn-image-cropper library
- Crop to 400x400px square
- Base64 output for upload
- Error handling with toast notifications

**Props:**
```typescript
interface ImageCropUploadProps {
  currentImageUrl?: string | null  // Existing image URL (for edit mode)
  onImageCropped: (croppedImage: string, extension: string) => Promise<void>  // Callback with base64 data
  onImageRemoved?: () => Promise<void>  // Callback for remove button
  label?: string  // Field label
  description?: string  // Helper text
  disabled?: boolean  // Disable upload
  aspectRatio?: number  // Default: 1 (square)
  targetWidth?: number  // Default: 400
  targetHeight?: number  // Default: 400
}
```

**Implementation Notes:**
- Use shadcn Button component for file picker
- Use shadcn Dialog component for crop modal
- Use shadcn-image-cropper for cropping interface
- Display current image using shadcn Avatar component
- "Remove Photo" button (no confirmation dialog)
- Toast notifications for errors (file size, file type)

**Installation Required:**
```bash
npm install shadcn-image-cropper
```

#### Modified Component: PersonForm

**File:** `src/app/(main)/people/person-form.tsx`

**Changes Required:**

1. **Add state for avatar:**
   ```typescript
   const [avatarUrl, setAvatarUrl] = useState<string | null>(person?.avatar_url || null)
   const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
   ```

2. **Add photo upload section at TOP of form (before FormSectionCard):**
   ```tsx
   <div className="space-y-6">
     <ImageCropUpload
       currentImageUrl={avatarUrl}
       onImageCropped={handleImageCropped}
       onImageRemoved={handleImageRemoved}
       label="Profile Photo (Optional)"
       description="Upload a photo to help identify this person"
       disabled={isSubmitting || isUploadingAvatar}
     />

     <FormSectionCard title="Person Details" description="...">
       {/* Existing form fields */}
     </FormSectionCard>
   </div>
   ```

3. **Add handler for image crop:**
   ```typescript
   const handleImageCropped = async (croppedImage: string, extension: string) => {
     if (!person?.id) {
       // Create mode - store temporarily, upload after person is created
       setAvatarUrl(croppedImage)
       return
     }

     // Edit mode - upload immediately
     try {
       setIsUploadingAvatar(true)
       const newAvatarUrl = await uploadPersonAvatar(person.id, croppedImage, extension)
       setAvatarUrl(newAvatarUrl)
       toast.success('Photo uploaded successfully')
     } catch (error) {
       console.error('Failed to upload photo:', error)
       toast.error('Failed to upload photo. Please try again.')
     } finally {
       setIsUploadingAvatar(false)
     }
   }
   ```

4. **Add handler for image removal:**
   ```typescript
   const handleImageRemoved = async () => {
     if (!person?.id) {
       // Create mode - just clear state
       setAvatarUrl(null)
       return
     }

     // Edit mode - delete from storage
     try {
       setIsUploadingAvatar(true)
       await deletePersonAvatar(person.id)
       setAvatarUrl(null)
       toast.success('Photo removed successfully')
     } catch (error) {
       console.error('Failed to remove photo:', error)
       toast.error('Failed to remove photo. Please try again.')
     } finally {
       setIsUploadingAvatar(false)
     }
   }
   ```

5. **Update form submit to handle avatar in create mode:**
   ```typescript
   const onSubmit = async (data: CreatePersonData) => {
     try {
       if (isEditing) {
         await updatePerson(person.id, personData)
         // Avatar already uploaded in edit mode
         toast.success('Person updated successfully')
         router.refresh()
       } else {
         const newPerson = await createPerson(personData)

         // Upload avatar if one was selected
         if (avatarUrl && avatarUrl.startsWith('data:')) {
           const extension = avatarUrl.match(/data:image\/(\w+);/)?.[1] || 'jpg'
           await uploadPersonAvatar(newPerson.id, avatarUrl, extension)
         }

         toast.success('Person created successfully!')
         router.push(`/people/${newPerson.id}/edit`)
       }
     } catch (error) {
       console.error(`Failed to ${isEditing ? 'update' : 'create'} person:`, error)
       toast.error(`Failed to ${isEditing ? 'update' : 'create'} person. Please try again.`)
     }
   }
   ```

**Notes:**
- Photo upload section appears ABOVE all other form sections (top of page)
- In create mode, avatar is stored as base64 in state, uploaded after person is created
- In edit mode, avatar is uploaded immediately when selected
- Existing form validation and submission flow unchanged

---

#### Modified Component: PersonViewClient

**File:** `src/app/(main)/people/[id]/person-view-client.tsx`

**Changes Required:**

1. **Add avatar display to ModuleViewContainer:**

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function PersonViewClient({ person }: PersonViewClientProps) {
  // Helper to get person initials
  const getInitials = () => {
    const firstName = person.first_name?.charAt(0) || ''
    const lastName = person.last_name?.charAt(0) || ''
    return (firstName + lastName).toUpperCase()
  }

  // Add avatar to details section
  const details = (
    <>
      {/* NEW: Avatar display */}
      <div className="flex justify-center mb-4">
        <Avatar className="h-32 w-32">
          {person.avatar_url && (
            <AvatarImage src={person.avatar_url} alt={person.full_name} />
          )}
          <AvatarFallback className="text-2xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Existing details */}
      {(person.first_name_pronunciation || person.last_name_pronunciation) && (
        // ... existing pronunciation display
      )}
      {/* ... rest of existing details */}
    </>
  )

  return (
    <ModuleViewContainer
      // ... existing props
      details={details}
    />
  )
}
```

---

#### Modified Component: PeopleListClient

**File:** `src/app/(main)/people/people-list-client.tsx`

**Changes Required:**

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function PeopleListClient({ initialData, stats }: PeopleListClientProps) {
  // Helper to get person initials
  const getPersonInitials = (person: Person) => {
    const firstName = person.first_name?.charAt(0) || ''
    const lastName = person.last_name?.charAt(0) || ''
    return (firstName + lastName).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* ... existing search card */}

      {/* People List */}
      {initialData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.map((person) => (
            <ListViewCard
              key={person.id}
              title={
                <div className="flex items-center gap-3">
                  {/* NEW: Avatar in list */}
                  <Avatar className="h-10 w-10">
                    {person.avatar_url && (
                      <AvatarImage src={person.avatar_url} alt={person.full_name} />
                    )}
                    <AvatarFallback>
                      {getPersonInitials(person)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{person.first_name} {person.last_name}</span>
                </div>
              }
              editHref={`/people/${person.id}/edit`}
              viewHref={`/people/${person.id}`}
            >
              {/* ... existing card content */}
            </ListViewCard>
          ))}
        </div>
      ) : (
        // ... existing empty state
      )}
    </div>
  )
}
```

---

#### Modified Component: PeoplePicker

**File:** `src/components/people-picker.tsx`

**Changes Required:**

1. **Add avatars to list view:**

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function PeoplePicker({ ... }: PeoplePickerProps) {
  // ... existing state and logic

  // Modify renderItem to include avatar
  const renderItem = (person: Person, isSelected: boolean) => (
    <div className="flex items-center gap-3">
      {/* NEW: Avatar in picker list */}
      <Avatar className="h-10 w-10">
        {person.avatar_url && (
          <AvatarImage src={person.avatar_url} alt={person.full_name} />
        )}
        <AvatarFallback>
          {getPersonInitials(person)}
        </AvatarFallback>
      </Avatar>

      {/* Existing person info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {getPersonDisplayName(person)}
        </div>
        {person.email && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {person.email}
          </div>
        )}
        {person.phone_number && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {person.phone_number}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <CorePicker
      // ... existing props
      renderItem={renderItem}
    />
  )
}
```

2. **✅ NEW: Add ImageCropUpload to CREATE form (inline dialog):**

The person picker create dialog should include the ImageCropUpload component at the top of the inline form, following the same pattern as the main person form. Photo upload is optional during inline creation.

3. **✅ NEW: Add ImageCropUpload to EDIT view (inline dialog):**

The person picker edit dialog should include the ImageCropUpload component, allowing users to add, replace, or remove photos without navigating to the main person edit page.

**Notes:**
- Avatars appear in picker LIST view
- ✅ **Avatars CAN be uploaded in picker CREATE form** (inline form includes ImageCropUpload)
- ✅ **Avatars CAN be changed in picker EDIT view** (inline edit includes ImageCropUpload)
- After person is created and selected, avatar appears in the PickerField display
- Same upload/crop flow as main person form (base64 in create mode, immediate upload in edit mode)

---

### 7. Content Builder Updates

**File:** `src/lib/content-builders/person.ts`

**Changes Required:**

Add image to PDF cover page when avatar exists:

```typescript
export function buildPersonContactCard(person: Person): LiturgyDocument {
  const sections: ContentSection[] = []

  // 1. COVER PAGE
  const coverSections: CoverPageSection[] = []

  // NEW: Add profile photo section if avatar exists
  if (person.avatar_url) {
    coverSections.push({
      title: 'Profile Photo',
      image: {
        url: person.avatar_url,
        width: 150,
        height: 150,
        alignment: 'center'
      }
    })
  }

  // Contact Information subsection
  // ... existing contact rows

  // ... rest of existing implementation
}
```

**Notes:**
- Image appears at top of PDF cover page
- Only included when `avatar_url` exists
- Sized appropriately for PDF layout (150x150px)
- Centered alignment

---

### 8. Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `supabase/migrations/YYYYMMDDHHMMSS_add_person_avatar_url.sql` | NEW | Database migration for avatar_url column + storage bucket + RLS policies |
| `src/lib/types.ts` | MODIFIED | Add `avatar_url?: string` to Person interface |
| `src/lib/schemas/people.ts` | MODIFIED | Add `avatar_url` field to createPersonSchema with URL validation |
| `src/lib/actions/people.ts` | MODIFIED | Add uploadPersonAvatar(), deletePersonAvatar(), getPersonAvatarUrl() |
| `src/components/image-crop-upload.tsx` | NEW | Reusable image upload component with cropping |
| `src/app/(main)/people/person-form.tsx` | MODIFIED | Add ImageCropUpload component, upload handlers, create flow |
| `src/app/(main)/people/[id]/person-view-client.tsx` | MODIFIED | Display avatar in view page |
| `src/app/(main)/people/people-list-client.tsx` | MODIFIED | Display avatars in list cards |
| `src/components/people-picker.tsx` | MODIFIED | Display avatars in picker list view, add ImageCropUpload to create/edit dialogs |
| `src/lib/content-builders/person.ts` | MODIFIED | Include avatar in PDF cover page |

---

### 9. Testing Requirements

**Unit Tests:** (Not currently implemented - follow existing patterns)

**Playwright E2E Tests:**

**File:** `tests/people-images.spec.ts`

**Test Scenarios:**

1. **Upload photo during person creation**
   - Navigate to `/people/create`
   - Fill out required fields (first_name, last_name)
   - Click "Upload Photo" button
   - Select valid image file (JPEG, <5MB)
   - Verify crop modal opens
   - Adjust crop area
   - Click "Save"
   - Submit form
   - Verify person created with avatar
   - Navigate to person view page
   - Verify avatar displays

2. **Upload photo for existing person**
   - Navigate to person edit page
   - Click "Upload Photo" button
   - Select valid image file
   - Crop and save
   - Verify photo updates immediately
   - Verify toast success message

3. **Remove photo from person**
   - Navigate to person with existing photo
   - Click "Remove Photo" button
   - Verify photo removed immediately
   - Verify initials fallback displays
   - Verify toast success message

4. **File validation - file too large**
   - Attempt to upload 6MB file
   - Verify error toast: "File size must be under 5MB"
   - Verify crop modal does not open

5. **File validation - invalid file type**
   - Attempt to upload .gif file
   - Verify error toast: "Only JPEG, PNG, and WebP images are supported"
   - Verify crop modal does not open

6. **Avatar displays in person list**
   - Create person with avatar
   - Navigate to `/people`
   - Verify avatar appears in list card
   - Verify initials fallback for people without avatars

7. **Avatar displays in person picker list**
   - Create person with avatar
   - Open wedding form
   - Open bride picker
   - Verify avatars appear in picker list next to person names
   - Verify initials fallback for people without avatars

8. **✅ NEW: Upload photo in person picker create view**
   - Navigate to wedding form
   - Open bride picker
   - Click "Create New Person" button in picker dialog
   - Fill required fields (first_name, last_name)
   - Click "Upload Photo" in inline create form
   - Select valid image file (JPEG, <5MB)
   - Verify crop modal opens
   - Crop and save photo
   - Submit inline create form
   - Verify person created with avatar
   - Verify photo displays in bride picker field after selection

9. **✅ NEW: Change photo in person picker edit view**
   - Navigate to wedding form with assigned bride
   - Click edit icon on bride picker field
   - Verify inline edit dialog opens with current photo displayed
   - Click "Upload Photo" to replace existing photo
   - Select new image file
   - Crop and save
   - Submit edit dialog
   - Verify photo updated in bride picker field

10. **Avatar displays in PDF export**
   - Create person with avatar
   - Navigate to person view
   - Click "Download PDF"
   - Verify PDF includes avatar on cover page

**Test Data:**
- Use test images in `tests/fixtures/images/`
- Include valid JPEG, PNG, WebP files (<5MB)
- Include invalid files for testing (>5MB, .gif, .pdf)

---

### 10. Documentation Updates

#### COMPONENT_REGISTRY.md

**Section:** Custom Components

**Add:**
```markdown
### ImageCropUpload

**Location:** `src/components/image-crop-upload.tsx`

**Purpose:** Reusable image upload component with client-side cropping for profile photos

**Key Props:**
- `currentImageUrl?: string | null` - Existing image URL
- `onImageCropped: (croppedImage: string, extension: string) => Promise<void>` - Upload callback
- `onImageRemoved?: () => Promise<void>` - Remove callback
- `aspectRatio?: number` - Default: 1 (square)
- `targetWidth?: number` - Default: 400
- `targetHeight?: number` - Default: 400

**Features:**
- File picker button (no drag-and-drop)
- Client-side validation (size, type)
- shadcn-image-cropper integration
- Base64 output for upload
- Toast error notifications

**Usage:**
```tsx
<ImageCropUpload
  currentImageUrl={person?.avatar_url}
  onImageCropped={handleImageCropped}
  onImageRemoved={handleImageRemoved}
  label="Profile Photo"
  description="Upload a photo to identify this person"
/>
```
```

#### FORMATTERS.md

**Section:** Data Formatters

**Add:**
```markdown
### getPersonAvatarInitials

Get person initials for Avatar fallback display

**Location:** `src/lib/utils/formatters.ts`

**Signature:**
```typescript
function getPersonAvatarInitials(person: Person): string
```

**Behavior:**
- Returns uppercase initials (e.g., "JS" for "John Smith")
- Handles missing first or last name gracefully
- Used in Avatar fallback when no photo exists

**Example:**
```typescript
const initials = getPersonAvatarInitials(person) // "JS"
```
```

#### README.md

**Section:** Features

**Update:**
```markdown
### People Directory
- Comprehensive contact management for parishioners
- **Profile photos with client-side cropping** ← NEW
- Advanced search across names, email, phone
- Mass attendance tracking
- AI-powered pronunciation generation
- Contact card exports (PDF, Word)
```

---

## Implementation Plan

### Phase 1: Database & Storage Setup (Day 1)

**Tasks:**
1. Create migration file for `avatar_url` column
2. Create migration for Supabase Storage bucket `person-avatars`
3. Create RLS policies for storage bucket
4. Test migration locally with `npm run db:fresh`
5. Verify storage bucket created and accessible

**Deliverables:**
- Migration file: `supabase/migrations/YYYYMMDDHHMMSS_add_person_avatar_url.sql`
- Storage bucket with RLS policies configured

---

### Phase 2: Type Definitions & Validation (Day 1)

**Tasks:**
1. Update Person interface in `src/lib/types.ts`
2. Update person schemas in `src/lib/schemas/people.ts`
3. Run `npm run build` to verify no TypeScript errors

**Deliverables:**
- Person interface includes `avatar_url?: string`
- Schema validation includes URL validation for avatar_url

---

### Phase 3: Server Actions (Day 2)

**Tasks:**
1. Implement `uploadPersonAvatar()` server action
2. Implement `deletePersonAvatar()` server action
3. Implement `getPersonAvatarUrl()` server action
4. Test actions with temporary test script
5. Verify RLS policies work correctly

**Deliverables:**
- 3 new server actions in `src/lib/actions/people.ts`
- Actions tested and working

---

### Phase 4: ImageCropUpload Component (Day 3)

**Tasks:**
1. Install shadcn-image-cropper: `npm install shadcn-image-cropper`
2. Create `src/components/image-crop-upload.tsx`
3. Implement file picker button
4. Implement client-side validation (size, type)
5. Integrate shadcn-image-cropper
6. Implement crop to 400x400px
7. Add error handling with toast notifications
8. Test component in isolation

**Deliverables:**
- Fully functional ImageCropUpload component
- Client-side validation working
- Cropping interface working

---

### Phase 5: Person Form Integration (Day 4)

**Tasks:**
1. Update `person-form.tsx` to add ImageCropUpload at top
2. Implement `handleImageCropped` for create and edit modes
3. Implement `handleImageRemoved` for create and edit modes
4. Update form submission to handle avatar upload in create mode
5. Test create flow with photo
6. Test edit flow with photo
7. Test remove photo functionality

**Deliverables:**
- Person create form supports photo upload
- Person edit form supports photo upload/replace/remove
- Both flows working correctly

---

### Phase 6: Display Components (Day 5)

**Tasks:**
1. Update `person-view-client.tsx` to display avatar
2. Update `people-list-client.tsx` to display avatars in cards
3. Update `people-picker.tsx` to display avatars in list view
4. ✅ **NEW:** Update `people-picker.tsx` to add ImageCropUpload to create dialog (inline form)
5. ✅ **NEW:** Update `people-picker.tsx` to add ImageCropUpload to edit dialog (inline edit)
6. ✅ **NEW:** Implement avatar upload handlers in picker create flow (base64 state pattern)
7. ✅ **NEW:** Implement avatar upload handlers in picker edit flow (immediate upload pattern)
8. Test avatar display in all locations (view, list, picker)
9. Test avatar upload in picker create dialog
10. Test avatar change in picker edit dialog
11. Test initials fallback when no photo

**Deliverables:**
- Avatars display in person view page
- Avatars display in person list cards
- Avatars display in person picker list
- ✅ **NEW:** Avatars can be uploaded in person picker create dialog
- ✅ **NEW:** Avatars can be changed in person picker edit dialog
- Fallback to initials works correctly

---

### Phase 7: PDF Export Integration (Day 6)

**Tasks:**
1. Update `person.ts` content builder to include avatar
2. Test PDF generation with avatar
3. Test PDF generation without avatar (fallback)
4. Verify image sizing and layout in PDF

**Deliverables:**
- PDFs include avatars when they exist
- PDFs render correctly without avatars

---

### Phase 8: Testing & Documentation (Day 7)

**Tasks:**
1. Write Playwright E2E tests (`tests/people-images.spec.ts`)
2. Run all tests: `npm test`
3. Fix any failing tests
4. Update COMPONENT_REGISTRY.md
5. Update FORMATTERS.md
6. Update README.md
7. Create pull request

**Deliverables:**
- All E2E tests passing
- Documentation updated
- Feature ready for review

---

## Security Considerations

### 1. File Upload Security

**Risks:**
- Malicious file uploads (executables disguised as images)
- Oversized files (DoS attack)
- Invalid file types

**Mitigations:**
- Client-side validation (file size, MIME type)
- Server-side validation in upload action
- Supabase Storage bucket MIME type restrictions
- Maximum file size limit (5MB)

### 2. Storage Access Control

**Risks:**
- Unauthorized access to person photos
- Cross-parish data access

**Mitigations:**
- RLS policies enforce parish-scoped access
- Storage bucket is private (not public)
- Signed URLs for temporary access
- Parish ID in folder structure for isolation

### 3. Data Privacy

**Risks:**
- Person photos visible to unauthorized users
- Photos included in unintended exports

**Mitigations:**
- Photos only visible to authenticated parish members
- RLS policies prevent cross-parish access
- Photos only in person-specific exports (not bulk exports)

### 4. Image Processing

**Risks:**
- Client-side processing of malicious images
- XSS through image metadata

**Mitigations:**
- Use trusted image cropping library (shadcn-image-cropper)
- Process images in sandboxed canvas element
- Strip metadata during crop/resize
- Output as clean base64 data URL

---

## Dependencies

### NPM Packages

**New:**
- `shadcn-image-cropper` - Image cropping component

**Existing (already installed):**
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Supabase SSR helpers
- `@radix-ui/react-avatar` - Avatar component (via shadcn)
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `sonner` - Toast notifications

### Supabase Features

**Required:**
- Supabase Storage (cloud file storage)
- Storage RLS policies (access control)
- PostgreSQL (database)

---

## Open Questions & Decisions

### Resolved Decisions

1. **Storage Location:** Supabase Storage (cloud buckets)
2. **Max File Size:** 5MB
3. **File Formats:** JPEG, PNG, WebP only
4. **Image Processing:** Client-side cropping before upload
5. **Crop Library:** shadcn-image-cropper
6. **Upload Method:** File picker button (no drag-and-drop)
7. **Display Locations:** Person view, list, picker (list view only), PDFs
8. **Photo Required:** No (optional field)
9. **Fallback:** Text initials (no graphical placeholder)
10. **Remove Confirmation:** No dialog (immediate removal)
11. **Image Size:** 400x400px (optimized)

### Potential Future Enhancements

**Not in Scope for Initial Implementation:**

1. **Bulk Photo Import:** Upload multiple photos at once via CSV/batch import
2. **Auto-Detect Faces:** AI-powered face detection to auto-crop photos
3. **Image Gallery:** Multiple photos per person (profile, family, etc.)
4. **Thumbnail Generation:** Server-side thumbnail generation for performance
5. **CDN Integration:** Cloudflare CDN for faster image delivery
6. **Image Compression:** Server-side compression to reduce storage
7. **Progressive Loading:** Low-quality placeholders while images load
8. **Photo Moderation:** Admin approval workflow for uploaded photos

---

## Success Criteria

**Feature is considered complete when:**

1. ✅ Database migration applied and tested
2. ✅ Supabase Storage bucket created with RLS policies
3. ✅ Server actions implemented and working
4. ✅ ImageCropUpload component created and functional
5. ✅ Person create form supports photo upload
6. ✅ Person edit form supports photo upload/replace/remove
7. ✅ Avatars display in person view page
8. ✅ Avatars display in person list cards
9. ✅ Avatars display in person picker list view
10. ✅ Avatars included in PDF exports
11. ✅ All E2E tests passing
12. ✅ Documentation updated
13. ✅ No TypeScript errors
14. ✅ No linting errors
15. ✅ Build succeeds: `npm run build`

---

## Notes

**Development Environment:**
- Work on feature branch: `feature/person-images`
- Test locally with `npm run dev`
- Reset database as needed: `npm run db:fresh`
- Run tests before committing: `npm test`

**Code Review Checklist:**
- [ ] Migration file follows one-table-per-file rule
- [ ] TypeScript types updated correctly
- [ ] Server actions follow existing patterns (auth, parish scoping, revalidation)
- [ ] Client components use react-hook-form patterns
- [ ] Error handling with toast notifications
- [ ] All file paths are absolute (not relative)
- [ ] Avatar component used consistently
- [ ] No hardcoded colors (semantic tokens only)
- [ ] Tests cover happy path and error cases
- [ ] Documentation updated

**Rollback Plan:**
If issues arise in production:
1. Revert migration: Remove `avatar_url` column
2. Delete storage bucket: `person-avatars`
3. Revert code changes
4. Person records continue working without photos
