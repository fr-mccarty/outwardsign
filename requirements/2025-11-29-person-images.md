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
- Add a new column `avatar_url` to the `people` table
  - Type: TEXT (nullable)
  - Purpose: Store the storage path to the person's profile photo in Supabase Storage
  - Add a comment documenting this field references the 'person-avatars' bucket
  - No index needed (not used for queries or filtering)

**Table:** `people`
**New Column:** `avatar_url`
- Data Type: TEXT
- Nullable: Yes (photos are optional)
- Default Value: None
- Constraints: None (stores a string path to Supabase Storage)

**Notes:**
- Field is nullable since photos are optional
- No default value needed
- No foreign key constraint (simple string path)
- Existing RLS policies for people table remain unchanged

---

### 2. Supabase Storage Setup

**🔴 IMPORTANT - Bucket Setup Method:**
Supabase Storage buckets **cannot** be created via SQL migrations. The bucket must be created manually via:
- **Supabase Dashboard** (Settings → Storage → New Bucket), OR
- **Supabase CLI:** `supabase storage buckets create person-avatars`

**Bucket Configuration:**

**Bucket Name:** `person-avatars`
**Settings:**
- **Public: `false`** (private bucket, images accessed via signed URLs)
- File Size Limit: `5MB`
- Allowed MIME Types: `image/jpeg`, `image/png`, `image/webp`

**Why Private Bucket with Signed URLs:**
- Enhanced security - images not directly accessible without authentication
- Signed URLs have expiration (1 hour) for temporary access
- RLS policies enforce parish-scoped access control
- Better privacy for sensitive profile photos

**Folder Structure:**
```
person-avatars/
  ├── {parish_id}/
  │   ├── {person_id}.jpg
  │   ├── {person_id}.png
  │   └── {person_id}.webp
```

**RLS Policies for Storage:**

Four storage policies are needed to enforce parish-scoped access control:

1. **SELECT Policy (View Images):**
   - Name: "Parish members can view their parish person avatars"
   - Target: storage.objects table
   - Operation: SELECT
   - Users: authenticated only
   - Logic: Allow access if bucket is 'person-avatars' AND the folder name (first path segment) matches a parish_id where the user is a member

2. **INSERT Policy (Upload Images):**
   - Name: "Parish members can upload avatars for their parish"
   - Target: storage.objects table
   - Operation: INSERT
   - Users: authenticated only
   - Logic: Allow upload if bucket is 'person-avatars' AND the folder name (first path segment) matches a parish_id where the user is a member

3. **UPDATE Policy (Replace Images):**
   - Name: "Parish members can update avatars for their parish"
   - Target: storage.objects table
   - Operation: UPDATE
   - Users: authenticated only
   - Logic: Allow update if bucket is 'person-avatars' AND the folder name (first path segment) matches a parish_id where the user is a member

4. **DELETE Policy (Remove Images):**
   - Name: "Parish members can delete avatars for their parish"
   - Target: storage.objects table
   - Operation: DELETE
   - Users: authenticated only
   - Logic: Allow deletion if bucket is 'person-avatars' AND the folder name (first path segment) matches a parish_id where the user is a member

**Migration Approach:**
- Storage bucket must be created manually (see bucket setup method above)
- RLS policies CAN be created via migration (shown above)
- Migration file should include a comment noting that bucket must exist first

---

### 3. Type Definitions

**File:** `src/lib/types.ts`

**Changes Required:**
Add a new optional field to the existing Person interface:
- Field Name: `avatar_url`
- Type: `string` (optional/nullable)
- Purpose: Stores the storage path to the person's profile photo in Supabase Storage
- Example value: `"parish_uuid/person_uuid.jpg"`

**Notes:**
- Field is optional (nullable in database, optional in TypeScript)
- Type is `string` to match database column type (TEXT → string)
- Add this field alongside the existing Person interface fields (id, parish_id, first_name, last_name, email, phone_number, etc.)

---

### 4. Schema Validation

**File:** `src/lib/schemas/people.ts`

**Changes Required:**
Add validation for the new `avatar_url` field to both create and update schemas:
- Add `avatar_url` to the `createPersonSchema`
  - Validation: Must be a valid URL format (string with URL validation)
  - Optional: Yes
  - Nullable: Yes
  - Consistent with other optional person fields (phone_number, email, etc.)

The `updatePersonSchema` will automatically include this field since it's derived from `createPersonSchema.partial()`

**Validation Rules:**
- Must be a valid URL string format if provided
- Can be null or undefined (optional field)
- No minimum/maximum length requirements
- Consistent with existing optional field patterns in the schema

---

### 5. Server Actions

**File:** `src/lib/actions/people.ts`

**New Functions Required:**

Three new server actions are needed to handle avatar upload, deletion, and signed URL generation:

**1. uploadPersonAvatar Function**
- Purpose: Upload a person's avatar image to Supabase Storage
- Parameters:
  - `personId` (string): ID of the person
  - `file` (string): Base64 encoded image data (already cropped on client)
  - `fileExtension` (string): File extension (jpg, png, or webp)
- Returns: Storage path (string) to be stored in avatar_url field
- Implementation steps:
  1. Require authentication using existing auth helpers (requireSelectedParish, ensureJWTClaims)
  2. Verify the person belongs to the user's parish (security check)
  3. Delete ALL existing avatar files for this person to prevent orphaned files
     - List all files in the parish folder with the person's ID as prefix
     - Delete each found file (handles .jpg, .png, .webp from previous uploads)
  4. Convert base64 string to buffer for upload
  5. Upload file to storage bucket at path: `{parish_id}/{person_id}.{extension}`
  6. Update person record in database with storage PATH (not full URL)
  7. Revalidate relevant paths for cache invalidation
  8. Return the storage path

**2. deletePersonAvatar Function**
- Purpose: Delete a person's avatar from Supabase Storage
- Parameters:
  - `personId` (string): ID of the person
- Returns: void (no return value)
- Implementation steps:
  1. Require authentication
  2. Verify person belongs to user's parish
  3. Fetch person record to get current avatar_url (storage path)
  4. Delete file from storage using the path
  5. Update person record in database (set avatar_url to null)
  6. Revalidate relevant paths

**3. getPersonAvatarSignedUrl Function**
- Purpose: Generate a temporary signed URL for viewing private avatar images
- Parameters:
  - `storagePath` (string): Storage path from person.avatar_url (e.g., "parish_id/person_id.jpg")
- Returns: Signed URL string with 1-hour expiry
- Implementation steps:
  1. Require authentication
  2. Extract parish_id from the storage path (first path segment)
  3. Verify the parish_id matches a parish where the user is a member (security check)
  4. Generate signed URL using Supabase Storage API with 1-hour expiry (3600 seconds)
  5. Return the temporary signed URL

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

**Component Props:**
The component should accept these props:
- `currentImageUrl` (optional string): Existing image URL for edit mode
- `onImageCropped` (callback function): Receives cropped base64 image and extension
- `onImageRemoved` (optional callback function): Called when photo is removed
- `label` (optional string): Field label text
- `description` (optional string): Helper text below label
- `disabled` (optional boolean): Disables upload controls
- `aspectRatio` (optional number): Crop aspect ratio, defaults to 1 (square)
- `targetWidth` (optional number): Target output width in pixels, defaults to 400
- `targetHeight` (optional number): Target output height in pixels, defaults to 400

**Implementation Approach:**
- Use shadcn Button component for file picker button
- Use shadcn Dialog component for crop modal window
- Integrate shadcn-image-cropper library for cropping interface
- Display current image using shadcn Avatar component
- Include "Remove Photo" button (no confirmation dialog needed)
- Show toast notifications for validation errors (file size, file type)

**Library Installation:**
Install the shadcn-image-cropper package via npm

#### Modified Component: PersonForm

**File:** `src/app/(main)/people/person-form.tsx`

**Changes Required:**

1. **Add Component State:**
   Add two new state variables to track avatar upload:
   - `avatarUrl`: Stores the current avatar URL (initialized from person.avatar_url if editing)
   - `isUploadingAvatar`: Boolean flag to track upload/deletion in progress

2. **Add Photo Upload Section:**
   Position the ImageCropUpload component at the TOP of the form (before all other form sections):
   - Pass current avatar URL from state
   - Connect to image cropped and removed handlers
   - Use label: "Profile Photo (Optional)"
   - Use description: "Upload a photo to help identify this person"
   - Disable when form is submitting or avatar is uploading
   - Wrap in a container with the existing FormSectionCard components

3. **Implement Image Crop Handler:**
   Create an async handler for when user crops an image:
   - **Create Mode** (no person.id yet):
     - Store base64 image in state temporarily
     - Don't upload to storage yet (person doesn't exist)
   - **Edit Mode** (person.id exists):
     - Set uploading flag to true
     - Call uploadPersonAvatar server action with person ID, base64 data, and extension
     - Update avatar URL in state with returned storage path
     - Show success toast message
     - Handle errors with error toast
     - Clear uploading flag when complete

4. **Implement Image Removal Handler:**
   Create an async handler for when user removes photo:
   - **Create Mode**:
     - Simply clear avatar URL from state
   - **Edit Mode**:
     - Set uploading flag to true
     - Call deletePersonAvatar server action
     - Clear avatar URL in state (set to null)
     - Show success toast message
     - Handle errors with error toast
     - Clear uploading flag when complete

5. **Update Form Submit Handler:**
   Modify the existing onSubmit function to handle avatar upload in create mode:
   - **Edit Mode**: No changes needed (avatar already uploaded immediately)
   - **Create Mode**:
     - After createPerson succeeds and returns new person ID
     - Check if avatarUrl exists and is base64 (starts with "data:")
     - If yes, extract file extension from data URL
     - Call uploadPersonAvatar with new person ID, base64 data, and extension
     - Wait for upload to complete before redirecting

**Notes:**
- Photo upload section appears ABOVE all other form sections (top of page)
- In create mode, avatar is stored as base64 in state, uploaded after person is created
- In edit mode, avatar is uploaded immediately when selected
- Existing form validation and submission flow unchanged

---

#### Modified Component: PersonViewClient

**File:** `src/app/(main)/people/[id]/person-view-client.tsx`

**Changes Required:**

1. **Convert to Client Component:**
   - Add 'use client' directive at top of file
   - Import Avatar components, useState, useEffect, and getPersonAvatarSignedUrl

2. **Add State for Signed URL:**
   - Add state variable to store the signed URL (nullable string)
   - Initialize to null

3. **Fetch Signed URL on Mount:**
   - Add useEffect hook that runs when component mounts or when person.avatar_url changes
   - Inside effect:
     - Check if person has avatar_url
     - If yes, call getPersonAvatarSignedUrl server action
     - Store result in state
     - Handle errors gracefully (set state to null on error)

4. **Create Initials Helper:**
   - Add helper function to generate person initials from first/last name
   - Take first character of first_name and last_name
   - Convert to uppercase
   - Return as string

5. **Add Avatar to Details Section:**
   - In the existing ModuleViewContainer details prop:
   - Add a centered container at the top (before existing details)
   - Render Avatar component (large size, e.g., 128x128px)
   - If signed URL exists, render AvatarImage with the signed URL
   - Always render AvatarFallback with person initials
   - Keep all existing details sections below the avatar

**Notes:**
- Component must be client component to use useState/useEffect
- Signed URL is fetched on mount and when avatar_url changes
- Error case is handled gracefully (falls back to initials)
- Signed URL is cached in state (valid for 1 hour)

---

#### Modified Component: PeopleListClient

**File:** `src/app/(main)/people/people-list-client.tsx`

**Changes Required:**

1. **Add State for Signed URLs:**
   - Add state variable to store signed URLs for all people
   - Use Record/object type with person.id as key and signed URL as value

2. **Batch Fetch Signed URLs on Mount:**
   - Add useEffect that runs when initialData changes
   - Filter initialData to get only people with avatar_url
   - Use Promise.all to fetch signed URLs in parallel for all people
   - For each person:
     - Call getPersonAvatarSignedUrl with their avatar_url
     - Store result in URLs object keyed by person.id
     - Handle errors gracefully (skip person if fetch fails)
   - Update state with all fetched URLs

3. **Create Initials Helper:**
   - Add helper function to generate initials from person's name
   - Extract first character from first_name and last_name
   - Convert to uppercase and return

4. **Update List Card Title:**
   - Modify the existing ListViewCard title prop
   - Wrap current title in a flex container with gap
   - Add Avatar component before the person name:
     - Small size (e.g., 40x40px)
     - If signed URL exists for this person, render AvatarImage with the URL
     - Always render AvatarFallback with person initials
   - Keep existing person name display after avatar

**Notes:**
- Signed URLs are fetched in parallel using Promise.all for efficiency
- URLs are stored in object/Record keyed by person.id
- Falls back to initials if URL fetch fails or avatar doesn't exist
- Existing list functionality remains unchanged

---

#### Modified Component: PeoplePicker

**File:** `src/components/people-picker.tsx`

**Changes Required:**

1. **Add State for Signed URLs:**
   - Add state variable to store signed URLs for all people in picker
   - Use Record/object type with person.id as key

2. **Batch Fetch Signed URLs:**
   - Add useEffect that runs when people list changes
   - Check if people list exists
   - Filter to get only people with avatar_url
   - Use Promise.all to fetch signed URLs in parallel
   - For each person, call getPersonAvatarSignedUrl
   - Store results in URLs object keyed by person.id
   - Handle errors gracefully (skip if fetch fails)
   - Update state with all URLs

3. **Update renderItem Function:**
   - Modify existing renderItem to include avatar
   - Add flex container with gap
   - Add Avatar component before person info:
     - Small size (e.g., 40x40px)
     - If signed URL exists for person, render AvatarImage
     - Always render AvatarFallback with initials
   - Keep existing person info (name, email, phone) after avatar

4. **✅ ADD ImageCropUpload to CREATE Form (Inline Dialog):**
   - Add ImageCropUpload component at top of inline create form in picker dialog
   - Follow same pattern as main person form
   - Photo upload is optional during inline creation
   - Store cropped base64 image in component state
   - Upload to storage after person is created (see Picker Create Flow below)

5. **✅ ADD ImageCropUpload to EDIT View (Inline Dialog):**
   - Add ImageCropUpload component to inline edit dialog
   - Allow users to add, replace, or remove photos
   - Same handlers as main person form (upload immediately in edit mode)
   - No need to navigate to main person edit page

**Notes:**
- Avatars appear in picker LIST view with signed URLs
- ✅ **Avatars CAN be uploaded in picker CREATE form** (inline form includes ImageCropUpload)
- ✅ **Avatars CAN be changed in picker EDIT view** (inline edit includes ImageCropUpload)
- After person is created and selected, avatar appears in the PickerField display
- Same upload/crop flow as main person form (base64 in create mode, immediate upload in edit mode)

**🔴 CRITICAL - Picker Create Flow with Avatar:**
When a photo is uploaded in picker create mode:
1. User crops photo → ImageCropUpload stores base64 in picker component state
2. User submits inline create form → `createPerson()` is called
3. After `createPerson()` succeeds with new person ID:
   - Check if base64 avatar exists in picker state
   - If exists, call `uploadPersonAvatar(newPerson.id, base64Data, extension)`
   - Wait for upload to complete
4. Re-fetch people list to include new person with avatar_url
5. Display new person in picker with signed URL

**Implementation Location:** The picker component's inline create form submission handler must handle this flow.

---

### 7. Content Builder Updates

**File:** `src/lib/content-builders/person.ts`

**Changes Required:**

1. **Make Function Async:**
   - Change buildPersonContactCard to async function (required to fetch signed URL)

2. **Add Signed URL Import:**
   - Import getPersonAvatarSignedUrl from people actions

3. **Add Avatar to Cover Page:**
   - In the cover page sections array, before adding contact information:
   - Check if person.avatar_url exists
   - If yes:
     - Wrap in try-catch block
     - Call getPersonAvatarSignedUrl to get temporary signed URL
     - Add new cover page section:
       - Title: "Profile Photo"
       - Image object with properties:
         - url: use the signed URL (not storage path)
         - width: 150px
         - height: 150px
         - alignment: center
     - If signed URL fetch fails, silently skip (don't add image section)
   - Continue with existing contact information sections

**Notes:**
- Function MUST be async to await signed URL generation
- Image appears at top of PDF cover page before contact information
- Only included when avatar_url exists AND signed URL is successfully generated
- Sized appropriately for PDF layout (150x150px square)
- Centered alignment for professional appearance
- Errors are handled gracefully (image simply doesn't appear in PDF)

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
   - **Migration timestamp format:** `YYYYMMDDHHmmss` (e.g., `20251129143000`)
   - Use current timestamp within 30 days of creation date
   - Filename: `supabase/migrations/20251129143000_add_person_avatar_url.sql`
2. Create Supabase Storage bucket `person-avatars` **via Dashboard or CLI** (NOT via SQL)
   - Use Dashboard: Settings → Storage → New Bucket
   - OR use CLI: `supabase storage buckets create person-avatars`
   - Set to **Private** (Public: false)
   - Configure MIME types: `image/jpeg`, `image/png`, `image/webp`
   - Set file size limit: 5MB
3. Create RLS policies for storage bucket (can be in migration file)
4. Test migration locally with `npm run db:fresh`
5. Verify storage bucket created and accessible

**Deliverables:**
- Migration file: `supabase/migrations/20251129143000_add_person_avatar_url.sql`
- Storage bucket `person-avatars` created (private)
- RLS policies configured for storage bucket

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
1. **⚠️ Verify library compatibility FIRST:**
   - Check `shadcn-image-cropper` is maintained and compatible with current React/Next.js versions
   - Review library documentation and examples
   - **If issues found, consider alternatives:**
     - `react-easy-crop` (popular, well-maintained)
     - `react-image-crop` (official React cropper)
     - `cropperjs` (vanilla JS, needs React wrapper)
2. Install chosen library: `npm install shadcn-image-cropper` (or alternative)
3. Create `src/components/image-crop-upload.tsx`
4. Implement file picker button
5. Implement client-side validation (size, type)
6. Integrate cropping library
7. Implement crop to 400x400px square output
8. Add error handling with toast notifications
9. Test component in isolation

**Deliverables:**
- Verified library compatibility
- Fully functional ImageCropUpload component
- Client-side validation working
- Cropping interface working and tested

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
- Signed URL leakage or sharing

**Mitigations:**
- **Storage bucket is PRIVATE** - no direct URL access
- **Signed URLs with 1-hour expiry** - temporary authenticated access only
- **RLS policies enforce parish-scoped access** - users can only generate signed URLs for their parish
- **Parish ID in folder structure** for additional isolation
- **Server-side URL generation** - all signed URLs created by authenticated server actions
- Signed URLs cannot be used after expiration (must re-fetch)

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
