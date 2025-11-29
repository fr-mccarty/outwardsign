# AI-Powered Pronunciation Generation for Person Names

**Date:** 2025-11-29
**Feature Type:** Enhancement
**Priority:** Medium
**Estimated Complexity:** Medium (3-5 days)

---

## Feature Overview

Add AI-powered pronunciation generation capability to the person picker and person forms. This feature will use the existing Claude AI integration (Anthropic API) to automatically generate phonetic pronunciation guides for first and last names, helping priests, deacons, and staff correctly pronounce names during sacraments and ceremonies.

**Key Context:**
- Pronunciation fields (`first_name_pronunciation`, `last_name_pronunciation`, `full_name_pronunciation`) already exist in the database and UI
- Fields were added on November 23, 2025 (see `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CHANGELOG_PRONUNCIATION_FIELDS.md`)
- Current implementation requires manual entry of pronunciations
- Application already has Claude AI integration (see `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/claude.ts`)
- Pronunciations are displayed in ceremony scripts, person views, and person picker selections

---

## Business Value

**Problem:**
Parish staff and presiders currently must manually enter pronunciation guides for names, which is time-consuming and requires knowledge of phonetic spelling. Many names from different cultural backgrounds are unfamiliar to presiders, leading to mispronunciations during ceremonies.

**Solution:**
AI-powered pronunciation generation provides instant, accurate phonetic guidance with a single click, saving time and improving the quality of liturgical celebrations.

**Impact:**
- Reduces data entry time for parish staff
- Improves accuracy of name pronunciation during ceremonies
- Shows respect to parishioners by correctly pronouncing their names
- Particularly valuable for multicultural parishes with diverse name origins

---

## User Stories

### Story 1: Generate Pronunciation for New Person (Standalone Form)
**As a** parish staff member
**I want to** generate AI pronunciation for a new person's name in the standalone person form
**So that** the presider can correctly pronounce the name during the ceremony

**Acceptance Criteria:**
- When creating a new person at `/people/create`, I can expand the pronunciation section
- I see a "Generate Pronunciations" button
- When I click it, AI generates phonetic spellings for both first and last names
- Generated pronunciations appear in the input fields
- I can edit the AI-generated pronunciations if needed
- Generated pronunciations are saved with the person record

### Story 2: Generate Pronunciation in Person Picker (Inline Creation)
**As a** parish staff member creating a wedding
**I want to** generate pronunciation when adding a new person inline
**So that** I don't have to leave the wedding form to add pronunciation

**Acceptance Criteria:**
- When adding a new person via person picker dialog, pronunciation section is available
- "Generate Pronunciations" button works in the picker dialog
- Generated pronunciations are saved when creating the person
- Selected person shows pronunciation in the picker field display

### Story 3: Regenerate Pronunciation After Name Change
**As a** parish staff member editing a person
**I want to** regenerate pronunciation when I correct a misspelled name
**So that** the pronunciation matches the corrected name

**Acceptance Criteria:**
- When editing first_name or last_name fields with existing pronunciation
- After saving changes, I see a notification offering to regenerate pronunciation
- I can choose to regenerate or keep existing pronunciation
- If I regenerate, new pronunciations replace the old ones

### Story 4: Manual Override of AI Pronunciation
**As a** parish staff member
**I want to** manually edit AI-generated pronunciations
**So that** I can correct any AI mistakes or use preferred pronunciations

**Acceptance Criteria:**
- Generated pronunciations appear in editable text fields
- I can immediately edit the generated text
- Manual edits are saved like any other form data
- No distinction in storage between AI-generated and manual pronunciations

### Story 5: View Pronunciation on Content Builder Cover Pages
**As a** presider reviewing the liturgical script before a ceremony
**I want to** see the pronunciation of the recipient's name on the cover page
**So that** I can practice pronouncing the name correctly before the ceremony

**Acceptance Criteria:**
- When a recipient (bride, groom, deceased, child, quinceañera) has pronunciation in their record, it appears on the cover page
- Pronunciation is displayed using the existing `formatPersonWithPronunciation()` helper
- Format: "Full Name (pronunciation)" (e.g., "Siobhan O'Sullivan (shi-VAWN oh-SUL-ih-van)")
- Pronunciation only appears if it exists (no empty placeholders)
- Applies to all modules: Weddings, Funerals, Baptisms, Presentations, Quinceañeras, Masses
- For weddings, both bride and groom pronunciations are shown (if they exist)
- Templates in both English and Spanish show pronunciations

---

## Technical Scope

---

## Content Builder Cover Page Integration

### Overview

In addition to generating pronunciations via AI, pronunciations must be **displayed on the cover pages** of liturgical scripts for all key modules. This helps presiders practice and correctly pronounce names during ceremonies.

### Current State

**Current Implementation:**
- All modules currently use `formatPersonWithPhone()` for recipient names on cover pages
- Format: `"Full Name — Phone Number"`
- Example: `"John Smith — 555-1234"`
- Pronunciations exist in the database but are NOT displayed in liturgical scripts

**Problem:**
- Presiders reviewing scripts before ceremonies cannot see how to pronounce unfamiliar names
- Pronunciation data exists but is only visible in the person record, not where it's needed most (the liturgical script)

### Required Changes

**New Implementation:**
- Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()` for primary recipients
- Format: `"Full Name (pronunciation) — Phone Number"`
- Example: `"Siobhan O'Sullivan (shi-VAWN oh-SUL-ih-van) — 555-1234"`
- Pronunciation only appears if it exists (no empty placeholders)

**Helper Function:**
- Function already exists: `formatPersonWithPronunciationWithPhone()` in `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/utils/formatters.ts`
- Automatically handles cases where pronunciation exists, doesn't exist, or is same as name
- Gracefully handles phone number presence/absence

### Modules Affected

**Modules with Primary Recipients (NEED UPDATES):**

| Module | Primary Recipient(s) | Current Function | New Function | Templates to Update |
|--------|---------------------|------------------|--------------|---------------------|
| **Weddings** | Bride, Groom | `formatPersonWithPhone()` | `formatPersonWithPronunciationWithPhone()` | 2 (EN, ES) |
| **Funerals** | Deceased | `formatPersonWithPhone()` | `formatPersonWithPronunciationWithPhone()` | 2 (EN, ES) |
| **Baptisms** | Child | `formatPersonWithPhone()` | `formatPersonWithPronunciationWithPhone()` | 2 (EN, ES) |
| **Presentations** | Child | `formatPersonWithPhone()` | `formatPersonWithPronunciationWithPhone()` | 5 (EN, ES, Simple EN, Simple ES, Bilingual) |
| **Quinceañeras** | Quinceañera | `formatPersonWithPhone()` | `formatPersonWithPronunciationWithPhone()` | 2 (EN, ES) |

**Modules Without Primary Recipients (NO CHANGES NEEDED):**

| Module | Reason | Action Required |
|--------|--------|-----------------|
| **Masses** | No specific recipient (parish Mass) | None - no pronunciation display needed |
| **Mass Intentions** | Intention for person, not primary ceremony participant | None - no pronunciation display needed |

**Total Templates to Update:** 13 templates across 5 modules

### Implementation Pattern

**Example - Wedding Template (English):**

**Before:**
```typescript
// Line 65-69 in full-script-english.ts
if (wedding.bride) {
  weddingRows.push({ label: 'Bride:', value: formatPersonWithPhone(wedding.bride) })
}
if (wedding.groom) {
  weddingRows.push({ label: 'Groom:', value: formatPersonWithPhone(wedding.groom) })
}
```

**After:**
```typescript
// Line 65-69 in full-script-english.ts
if (wedding.bride) {
  weddingRows.push({ label: 'Bride:', value: formatPersonWithPronunciationWithPhone(wedding.bride) })
}
if (wedding.groom) {
  weddingRows.push({ label: 'Groom:', value: formatPersonWithPronunciationWithPhone(wedding.groom) })
}
```

**Example - Funeral Template:**

**Before:**
```typescript
// Line 38 in full-script-english.ts
if (funeral.deceased) {
  funeralRows.push({ label: 'Deceased:', value: formatPersonWithPhone(funeral.deceased) })
}
```

**After:**
```typescript
// Line 38 in full-script-english.ts
if (funeral.deceased) {
  funeralRows.push({ label: 'Deceased:', value: formatPersonWithPronunciationWithPhone(funeral.deceased) })
}
```

**Example - Baptism Template:**

**Before:**
```typescript
// Line 44 in summary-english.ts
childRows.push({ label: 'Name:', value: formatPersonWithPhone(baptism.child) })
```

**After:**
```typescript
// Line 44 in summary-english.ts
childRows.push({ label: 'Name:', value: formatPersonWithPronunciationWithPhone(baptism.child) })
```

### Output Examples

**Wedding Cover Page (with pronunciation):**
```
Wedding
  Bride: Siobhan O'Sullivan (shi-VAWN oh-SUL-ih-van) — 555-1234
  Groom: Javier García (hah-vee-AIR gar-SEE-ah) — 555-5678
  Presider: Fr. John Smith — 555-9999
```

**Funeral Cover Page (with pronunciation):**
```
Funeral Service Information
  Deceased: Nguyễn Văn Minh (win van min) — 555-1111
  Family Contact: Maria Rodriguez — 555-2222
  Presider: Fr. Michael Jones — 555-3333
```

**Baptism Cover Page (with pronunciation):**
```
Child to be Baptized
  Name: Caoimhe Murphy (KEE-vah MUR-fee)

Parents
  Mother: Sarah Murphy — 555-4444
  Father: Patrick Murphy — 555-5555
```

### Edge Cases

1. **No pronunciation exists:**
   - Helper function returns name without pronunciation parentheses
   - Example: `"John Smith — 555-1234"` (no change from current)

2. **Pronunciation same as name:**
   - Helper function omits pronunciation (redundant to display)
   - Example: `"John Smith — 555-1234"` (pronunciation is "john smith", so omitted)

3. **No phone number:**
   - Helper function still displays pronunciation
   - Example: `"Siobhan O'Sullivan (shi-VAWN oh-SUL-ih-van)"`

4. **Both exist:**
   - Helper function displays both
   - Example: `"Siobhan O'Sullivan (shi-VAWN oh-SUL-ih-van) — 555-1234"`

### Testing Requirements

**Cover Page Pronunciation Display:**

1. **Template Rendering Test**
   - Create wedding with bride/groom having pronunciation
   - Generate liturgical script (HTML/PDF/Word)
   - Verify pronunciation appears on cover page in all formats

2. **Edge Case Tests**
   - Test with no pronunciation (should show name only)
   - Test with pronunciation same as name (should omit pronunciation)
   - Test with pronunciation but no phone (should show pronunciation)
   - Test with both pronunciation and phone (should show both)

3. **Multi-Module Test**
   - Verify pronunciation display in at least one template per affected module:
     - Wedding (bride/groom)
     - Funeral (deceased)
     - Baptism (child)
     - Presentation (child)
     - Quinceañera (quinceañera)

4. **Language Test**
   - Verify pronunciation displays correctly in both English and Spanish templates
   - Pronunciation text should be language-neutral (phonetic)

### Acceptance Criteria

**Cover Page Pronunciation Display:**
- [ ] Wedding templates show bride/groom pronunciation on cover page (if exists)
- [ ] Funeral templates show deceased pronunciation on cover page (if exists)
- [ ] Baptism templates show child pronunciation on cover page (if exists)
- [ ] Presentation templates show child pronunciation on cover page (if exists)
- [ ] Quinceañera templates show quinceañera pronunciation on cover page (if exists)
- [ ] Pronunciation only appears when it exists in the database
- [ ] Format matches: `"Full Name (pronunciation) — Phone"` or `"Full Name (pronunciation)"` (no phone)
- [ ] Works in all output formats: HTML (web view), PDF, Word
- [ ] Works in both English and Spanish templates
- [ ] No pronunciation shown when field is empty
- [ ] No pronunciation shown when pronunciation is identical to name

---

### UI Implications

**Modified Components:**

1. **Person Form - Standalone** (`/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/person-form.tsx`)
   - Add "Generate Pronunciations" button in pronunciation section
   - Button placement: Below the pronunciation toggle, above pronunciation input fields
   - Button only visible when pronunciation section is expanded
   - Button shows loading state during AI generation
   - Button is disabled if both first_name and last_name are empty
   - Available at `/people/create` and `/people/[id]/edit`

2. **Person Picker - Inline Form** (`/Users/joshmccarty/Code-2025Macbook/outwardsign/src/components/people-picker.tsx`)
   - Add same "Generate Pronunciations" button in PersonFormFields component
   - Ensure button works in both create and edit modes
   - Handle form state updates when AI generates pronunciations
   - Available when creating/editing persons inline in module forms (weddings, funerals, etc.)

3. **Person View** (no changes needed)
   - Already displays pronunciations correctly
   - No UI changes required

4. **Content Builder Templates - Cover Pages** (multiple files, see Implementation Locations)
   - Weddings: Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()` for bride and groom
   - Funerals: Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()` for deceased
   - Baptisms: Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()` for child
   - Presentations: Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()` for child
   - Quinceañeras: Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()` for quinceañera
   - Masses: No primary recipient, no changes needed
   - Mass Intentions: No primary recipient, no changes needed

**New UI Elements:**

- **Generate Pronunciations Button**
  - Label: "Generate Pronunciations with AI"
  - Icon: Sparkles icon from Lucide React
  - Variant: Secondary or outline
  - Size: Small
  - Displays loading spinner when generating
  - Shows toast notification on success/error

- **Name Change Notification** (future enhancement for Story 3)
  - Toast notification after saving person with changed name and existing pronunciation
  - Two action buttons: "Regenerate" and "Keep Current"
  - Appears only when name fields changed and pronunciation existed

**Styling:**
- Follow existing form button patterns (see `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/FORMS.md`)
- Use semantic color tokens for dark mode support
- Match existing pronunciation toggle button style

### Server Action Implications

**New Server Action:**

Create `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/generate-pronunciation.ts`

```typescript
'use server'

import Anthropic from '@anthropic-ai/sdk'

export interface GeneratePronunciationParams {
  firstName: string
  lastName: string
}

export interface GeneratedPronunciation {
  firstNamePronunciation: string
  lastNamePronunciation: string
}

export async function generatePronunciation(
  params: GeneratePronunciationParams
): Promise<GeneratedPronunciation>
```

**Function Behavior:**
- Accept first name and last name as parameters
- Call Claude API with pronunciation generation prompt
- Return structured response with both pronunciations
- Handle errors gracefully (network issues, API key missing, etc.)
- Use model: `claude-3-5-sonnet-20241022` (consistent with existing integrations)
- Max tokens: 500 (sufficient for name pronunciations)
- Timeout: 10 seconds max

**Error Handling:**
- If ANTHROPIC_API_KEY not configured, throw clear error
- If API call fails, throw user-friendly error message
- Log errors to console for debugging
- Return error to client for toast notification

**CRUD Operations:**
- No new CRUD operations needed
- Uses existing `createPerson()` and `updatePerson()` actions
- AI-generated pronunciations are saved like manually-entered data

### Interface Analysis

**No New Interfaces Required:**

All necessary TypeScript interfaces already exist:

- `Person` interface already includes pronunciation fields (see `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/types.ts:337-357`)
- `CreatePersonData` schema already includes pronunciation fields (see `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/schemas/people.ts`)
- New `GeneratePronunciationParams` and `GeneratedPronunciation` interfaces will be defined in the new server action file

### Styling Concerns

**Dark Mode:**
- All new UI elements must use semantic color tokens
- Follow existing button styling patterns
- Loading states must be visible in both light and dark modes

**Accessibility:**
- Generate button must have descriptive aria-label
- Loading state must be announced to screen readers
- Toast notifications must be keyboard accessible

**Print Views:**
N/A - No changes to print views required

### Component Analysis

**Existing Components to Reuse:**

1. **FormInput** (`/Users/joshmccarty/Code-2025Macbook/outwardsign/src/components/form-input.tsx`)
   - Already used for pronunciation input fields
   - No changes needed

2. **Button** (shadcn component)
   - Used for "Generate Pronunciations" button
   - Standard component, no customization needed

3. **Toast** (sonner)
   - Used for success/error notifications
   - Already in use throughout application

4. **Icons** (Lucide React)
   - Sparkles icon for AI generation button
   - Loader2 icon for loading state

**New Components:**
- None required - all UI can be built with existing components

**Missing Components:**
- None identified

### Implementation Locations

**New Files:**

1. `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/generate-pronunciation.ts`
   - New server action for AI pronunciation generation
   - Follows pattern from existing `generate-petitions.ts`

**Modified Files - AI Generation Button:**

1. `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/person-form.tsx`
   - Add "Generate Pronunciations" button
   - Add handler function for button click
   - Add loading state management
   - Lines to modify: ~130-148 (pronunciation fields section)

2. `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/components/people-picker.tsx`
   - Add "Generate Pronunciations" button to PersonFormFields component
   - Add handler function for button click in picker context
   - Lines to modify: ~275-315 (pronunciation fields section in PersonFormFields)

**Modified Files - Cover Page Pronunciation Display:**

3. **Wedding Templates (2 files):**
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/wedding/templates/full-script-english.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/wedding/templates/full-script-spanish.ts`
   - Change: Lines ~65-69 (bride and groom rows)
   - Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()`

4. **Funeral Templates (2 files):**
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/funeral/templates/full-script-english.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/funeral/templates/full-script-spanish.ts`
   - Change: Line ~38 (deceased row)
   - Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()`

5. **Baptism Templates (2 files):**
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/baptism/templates/summary-english.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/baptism/templates/summary-spanish.ts`
   - Change: Line ~44 (child row)
   - Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()`

6. **Presentation Templates (5 files):**
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/full-script-english.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/full-script-spanish.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/simple-english.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/simple-spanish.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/bilingual.ts`
   - Change: Child row in cover page section
   - Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()`

7. **Quinceañera Templates (2 files):**
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/quinceanera/templates/full-script-english.ts`
   - `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/quinceanera/templates/full-script-spanish.ts`
   - Change: Quinceañera row in cover page section
   - Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()`

**Total Files Modified:** 15 template files + 2 form files = 17 files

**Directory Structure:**
```
src/
├── lib/
│   ├── actions/
│   │   └── generate-pronunciation.ts (NEW)
│   └── content-builders/
│       ├── wedding/templates/
│       │   ├── full-script-english.ts (MODIFIED - bride/groom pronunciation)
│       │   └── full-script-spanish.ts (MODIFIED - bride/groom pronunciation)
│       ├── funeral/templates/
│       │   ├── full-script-english.ts (MODIFIED - deceased pronunciation)
│       │   └── full-script-spanish.ts (MODIFIED - deceased pronunciation)
│       ├── baptism/templates/
│       │   ├── summary-english.ts (MODIFIED - child pronunciation)
│       │   └── summary-spanish.ts (MODIFIED - child pronunciation)
│       ├── presentation/templates/
│       │   ├── full-script-english.ts (MODIFIED - child pronunciation)
│       │   ├── full-script-spanish.ts (MODIFIED - child pronunciation)
│       │   ├── simple-english.ts (MODIFIED - child pronunciation)
│       │   ├── simple-spanish.ts (MODIFIED - child pronunciation)
│       │   └── bilingual.ts (MODIFIED - child pronunciation)
│       └── quinceanera/templates/
│           ├── full-script-english.ts (MODIFIED - quinceañera pronunciation)
│           └── full-script-spanish.ts (MODIFIED - quinceañera pronunciation)
├── app/
│   └── (main)/
│       └── people/
│           └── person-form.tsx (MODIFIED - AI button)
└── components/
    └── people-picker.tsx (MODIFIED - AI button)
```

### Documentation Impact

**Files to Update:**

1. `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/COMPONENT_REGISTRY.md`
   - Add reference to pronunciation generation feature under "Person Picker" section
   - Note: No new component, just enhanced functionality

2. `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CHANGELOG_PRONUNCIATION_FIELDS.md`
   - Add new section documenting AI generation feature
   - Include usage examples and screenshots

3. `/Users/joshmccarty/Code-2025Macbook/outwardsign/README.md`
   - Update features list to mention "AI-powered pronunciation generation"

**User Documentation:**

Consider adding to `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/documentation/content/` (both en/ and es/):
- New page: "using-ai-pronunciation-guide.md"
- Topic: How to use AI pronunciation generation, when to use it, how to override
- Screenshots showing the button and generated results

### Testing Requirements

**New Test File:**

Create `/Users/joshmccarty/Code-2025Macbook/outwardsign/tests/pronunciation-generation.spec.ts`

**Test Scenarios:**

1. **Person Form - Generate Pronunciations**
   - Navigate to /people/create
   - Expand pronunciation section
   - Enter first name and last name
   - Click "Generate Pronunciations with AI" button
   - Verify loading state appears
   - Verify pronunciations populate in input fields
   - Verify pronunciations can be edited
   - Save person and verify pronunciations are stored

2. **Person Picker - Generate Pronunciations**
   - Navigate to /weddings/create
   - Click bride picker
   - Click "Add New Person"
   - Expand pronunciation section
   - Enter names and generate pronunciations
   - Verify pronunciations appear
   - Save person and verify it appears selected with pronunciation

3. **Error Handling**
   - Mock API failure
   - Verify error toast appears with helpful message
   - Verify form remains functional after error

4. **Empty Name Handling**
   - Try to generate with empty first/last name
   - Verify button is disabled or shows appropriate error

5. **Edit Existing Person**
   - Open person with existing pronunciation
   - Regenerate pronunciations
   - Verify new pronunciations replace old ones

**Affected Existing Tests:**
- Person form tests may need to account for new button
- Person picker tests may need to account for new button
- No breaking changes expected

### README Impact

**Update Required:**

Add to Features section in `/Users/joshmccarty/Code-2025Macbook/outwardsign/README.md`:

```markdown
- **AI-Powered Pronunciation Generation:** Generate accurate phonetic pronunciations for names using Claude AI, helping presiders correctly pronounce names during ceremonies
```

### Code Reuse & Abstraction

**Existing Patterns to Follow:**

1. **AI Integration Pattern** (see `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/generate-petitions.ts`)
   - Use same Anthropic SDK setup
   - Follow same error handling pattern
   - Use same model and token approach
   - Server action pattern with 'use server'

2. **Form Integration Pattern** (see `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/person-form.tsx`)
   - Use `watch()` to get current name values
   - Use `setValue()` to populate generated pronunciations
   - Follow existing loading state patterns with `isSubmitting`

3. **Toast Notification Pattern**
   - Success: `toast.success('Pronunciations generated successfully')`
   - Error: `toast.error('Failed to generate pronunciations. Please try again.')`

**Abstraction Decisions:**

- **Single server action** for pronunciation generation (not separate actions per name)
- **No abstraction yet** - This is the first use case (Rule of Three)
- If we later add AI features for other fields, consider shared AI utility module

**No Duplication:**
- Reuse existing Anthropic API setup pattern
- Reuse existing form state management
- Reuse existing toast notification system

### Security Concerns

**Authentication/Authorization:**
- Server action uses existing authentication via `createClient()` and RLS policies
- No new permission checks needed
- Only authenticated parish members can generate pronunciations

**Data Validation:**
- Validate firstName and lastName are non-empty strings before calling AI
- Sanitize AI response before setting in form fields (remove any unexpected characters)
- Limit AI response to reasonable length (max 100 characters per pronunciation)

**API Key Security:**
- ANTHROPIC_API_KEY already stored in environment variables (Vercel secrets)
- Never expose API key to client
- Server action pattern ensures key stays server-side

**Rate Limiting Considerations:**
- Consider adding rate limiting to prevent API abuse
- Track API usage for cost monitoring
- Gracefully handle rate limit errors from Anthropic

**Data Privacy:**
- Names sent to Claude API for pronunciation generation
- No sensitive data (addresses, phone numbers) included in API calls
- Review Anthropic's data retention policy
- Consider adding opt-in/opt-out for AI features in future

### Database Changes

**No Database Changes Required**

- Pronunciation fields already exist:
  - `first_name_pronunciation TEXT` (optional)
  - `last_name_pronunciation TEXT` (optional)
  - `full_name_pronunciation TEXT GENERATED ALWAYS AS ...` (computed)

- Migration already applied: `20251031000000_create_people_table.sql`

- No new columns, indexes, or policies needed

- AI-generated pronunciations stored identically to manually-entered pronunciations

**Note:** Per user preference, we will NOT track whether pronunciations were AI-generated vs manually entered (no `pronunciation_source` field).

---

## AI Prompt Design

### Pronunciation Generation Prompt

**Requirements:**
- Generate detailed phonetic pronunciation with syllable breaks and stress marks
- Format: `shi-VAWN` style (lowercase with capitalized stressed syllable)
- Handle names from diverse cultural/linguistic backgrounds
- Provide pronunciation that can be quickly read aloud
- Consider common American English pronunciation patterns

**Prompt Template:**

```typescript
const prompt = `You are a pronunciation expert helping clergy and liturgical ministers correctly pronounce names during religious ceremonies.

TASK: Generate phonetic pronunciation guides for the following name:

First Name: ${firstName}
Last Name: ${lastName}

REQUIREMENTS:
1. Use detailed phonetic spelling with syllable breaks
2. Capitalize the stressed syllable (e.g., "shi-VAWN" for Siobhan)
3. Use simple, readable phonetics that can be pronounced by English speakers
4. Consider common pronunciations in American English
5. If multiple valid pronunciations exist, choose the most common one
6. For culturally diverse names, provide the authentic pronunciation

FORMAT:
- Lowercase letters with hyphens between syllables
- Capitalize ONLY the stressed syllable
- Examples:
  * "Siobhan" → "shi-VAWN"
  * "García" → "gar-SEE-ah"
  * "Nguyen" → "win" or "NWIN"
  * "Xavier" → "ZAY-vee-er"
  * "Caoimhe" → "KEE-vah"

Respond in this exact JSON format:
{
  "firstNamePronunciation": "phonetic-pronunciation-here",
  "lastNamePronunciation": "phonetic-pronunciation-here",
  "explanation": "Brief note on pronunciation origin or alternatives if relevant"
}

If a name is very common and straightforward (like "John" or "Smith"), you may return the name as-is or provide a simple phonetic guide.`
```

**Response Parsing:**
- Parse JSON response
- Extract `firstNamePronunciation` and `lastNamePronunciation`
- Optionally log `explanation` for debugging
- Validate response format before returning to client

---

## User Experience Flow

### Flow 1: Creating Person with AI Pronunciation

1. User navigates to `/people/create`
2. User enters first name: "Siobhan"
3. User enters last name: "O'Sullivan"
4. User clicks "Add pronunciation guide" toggle (existing)
5. Pronunciation section expands
6. User sees "Generate Pronunciations with AI" button
7. User clicks button
8. Button shows loading spinner
9. AI generates pronunciations (~1-2 seconds)
10. Toast notification: "Pronunciations generated successfully"
11. Fields populate:
    - First Name Pronunciation: "shi-VAWN"
    - Last Name Pronunciation: "oh-SUL-ih-van"
12. User reviews and can edit if needed
13. User saves person
14. Pronunciations stored in database

### Flow 2: Generating in Person Picker

1. User is creating a wedding at `/weddings/create`
2. User clicks "Select Bride" button
3. Person picker dialog opens
4. User clicks "Add New Person"
5. Create form appears in dialog
6. User enters name and clicks pronunciation toggle
7. User clicks "Generate Pronunciations with AI"
8. Same AI generation flow as above
9. User saves person
10. Person appears selected with pronunciation visible in picker field

### Flow 3: Editing Existing Pronunciation

1. User opens person edit page `/people/[id]/edit`
2. Pronunciation section already expanded (has existing data)
3. Shows current pronunciations
4. User clicks "Generate Pronunciations with AI" button
5. Confirmation dialog: "Overwrite existing pronunciations?"
6. User confirms
7. New pronunciations generated and populate fields
8. User can undo via browser back or re-edit

---

## Error Scenarios & Handling

### Scenario 1: API Key Not Configured

**Trigger:** ANTHROPIC_API_KEY environment variable missing

**Handling:**
- Server action throws error: "AI pronunciation generation is not configured"
- Toast error message: "Pronunciation generation unavailable. Please contact your administrator."
- Button remains clickable (for retry after configuration)
- Graceful degradation: Users can still manually enter pronunciations

### Scenario 2: Network/API Failure

**Trigger:** Network timeout, Anthropic API down, rate limit exceeded

**Handling:**
- Server action throws error with user-friendly message
- Toast error: "Failed to generate pronunciations. Please try again."
- Form state remains unchanged (no partial updates)
- User can retry immediately
- Log full error details to console for debugging

### Scenario 3: Empty Name Fields

**Trigger:** User clicks generate button with empty first_name or last_name

**Handling:**
- Button disabled state when either name field is empty
- If clicked anyway (edge case), show validation error
- Toast message: "Please enter both first and last name before generating pronunciations"

### Scenario 4: Invalid API Response

**Trigger:** Claude returns unexpected JSON format

**Handling:**
- Validate response structure before using
- If invalid, throw error
- Toast error: "Received unexpected response. Please try again."
- Log full response for debugging

### Scenario 5: Very Long/Unusual Names

**Trigger:** Names with special characters, multiple words, or excessive length

**Handling:**
- Send to API as-is (Claude handles complexity well)
- Validate response length (max 100 chars per pronunciation)
- If response too long, truncate with ellipsis
- User can manually edit to preferred format

---

## Edge Cases

### Edge Case 1: Name Contains Numbers or Special Characters

**Example:** "Mary-Kate", "O'Brien", "José"

**Handling:**
- Send to Claude API with special characters intact
- Claude understands context and generates appropriate pronunciation
- Test with sample data: "Mary-Kate" → "MAIR-ee-kate"

### Edge Case 2: Single-Word Names

**Example:** "Cher", "Madonna", first name only or last name only

**Handling:**
- Allow generation even if only one name field populated
- Button enabled if at least one name field has value
- API generates pronunciation for provided name(s) only
- Empty field remains empty

### Edge Case 3: Non-Latin Scripts

**Example:** Cyrillic, Chinese characters, Arabic

**Handling:**
- Claude can transliterate to phonetic English
- May require additional prompt guidance
- Consider adding note in UI: "Works best with Latin alphabet names"
- Future enhancement: Detect script and provide transliteration

### Edge Case 4: Multiple Pronunciations Valid

**Example:** "Rafael" (rah-fah-EL vs. RAY-fee-el)

**Handling:**
- Claude chooses most common pronunciation
- User can manually edit if different pronunciation preferred
- Future enhancement: Offer multiple options for user to choose

### Edge Case 5: Very Common Names

**Example:** "John Smith"

**Handling:**
- Claude may return simple phonetics: "JAHN SMITH"
- Acceptable even if pronunciation obvious
- User can skip generation for common names
- No harm in generating for completeness

### Edge Case 6: Concurrent Edits (Multi-User)

**Example:** Two staff members editing same person simultaneously

**Handling:**
- Standard database conflict resolution via updated_at timestamp
- Last save wins (standard behavior for all person edits)
- No special handling needed for pronunciation fields

---

## Performance Considerations

### API Call Performance

**Latency:**
- Expected: 1-2 seconds for Claude API response
- Max timeout: 10 seconds before error
- User sees loading spinner during generation

**Token Usage:**
- Prompt: ~500 tokens
- Response: ~100 tokens
- Total: ~600 tokens per generation
- Cost: Minimal (~$0.003 per generation with Claude Sonnet)

**Optimization:**
- No client-side caching (names are unique)
- No batch generation API (not needed for current use case)
- Consider caching at database level in future (pronunciation lookup table)

### UI Performance

**Loading States:**
- Button disabled during generation
- Loading spinner visible
- Form remains interactive (user can edit other fields)

**Responsiveness:**
- No impact on initial page load (feature is triggered on demand)
- Async server action doesn't block UI
- Toast notifications don't interrupt workflow

### Database Performance

**No Impact:**
- Reuses existing pronunciation fields
- No additional queries required
- No new indexes needed
- Same insert/update performance as before

---

## Dependencies and Blockers

### Dependencies

**Required:**
1. ✅ Anthropic API Key configured in environment variables
   - Already exists for petition/reading generation features
   - No new setup required

2. ✅ Pronunciation fields in database
   - Already exists (added November 23, 2025)
   - No migration required

3. ✅ Anthropic SDK installed
   - Already installed: `@anthropic-ai/sdk`
   - Check `package.json` for version

**Optional:**
- None

### Potential Blockers

**Technical:**
- None identified
- All necessary infrastructure exists

**Product:**
- User acceptance of AI-generated pronunciations
- Pronunciation accuracy for diverse name origins
- Mitigation: Allow manual editing, provide clear UI for overrides

**Cost:**
- API usage costs for pronunciation generation
- Estimated: $0.003 per generation, minimal at scale
- Monitor usage via Anthropic dashboard

**Legal/Privacy:**
- Names sent to Claude API
- Review Anthropic's data retention policy
- Consider adding privacy notice
- No blocker: Similar to existing petition/reading features

---

## Documentation Inconsistencies Found

### Inconsistency 1: CHANGELOG_PRONUNCIATION_FIELDS.md vs Actual Migration

**Location:** `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CHANGELOG_PRONUNCIATION_FIELDS.md:19`

**Issue:**
Changelog references migration file as `20251031000001_create_people_table.sql`, but actual migration is `20251031000000_create_people_table.sql` (note the different timestamp ending).

**Suggested Correction:**
Update changelog to reference correct migration file name: `20251031000000_create_people_table.sql`

### Inconsistency 2: Future Enhancements Mention AI

**Location:** `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CHANGELOG_PRONUNCIATION_FIELDS.md:373-382`

**Issue:**
"Future Enhancements" section mentions "Automatic Suggestions: AI-based pronunciation hints for common names" as item #3, but this is actually the feature being implemented now.

**Suggested Correction:**
Remove or update this item to reflect that AI generation is now being implemented as a core feature (not future).

### Inconsistency 3: FORMATTERS.md Documentation Completeness

**Location:** Unknown (need to verify)

**Issue:**
Need to verify that `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/FORMATTERS.md` documents the AI pronunciation generation feature once implemented.

**Suggested Correction:**
After implementation, add section to FORMATTERS.md explaining AI generation capability and usage.

---

## Implementation Phases

### Phase 1: Core AI Integration (Day 1-2)

**Tasks:**
1. Create `generate-pronunciation.ts` server action
2. Design and test Claude prompt
3. Implement JSON response parsing
4. Add error handling
5. Write unit tests for server action

**Deliverable:**
- Working server action that can be called from client components
- Tested with various name types (common, complex, multicultural)

### Phase 2: UI Integration - Person Form (Day 2-3)

**Tasks:**
1. Add "Generate Pronunciations with AI" button to person form
2. Implement click handler and loading state
3. Wire up server action call
4. Add toast notifications
5. Test in person create and edit flows

**Deliverable:**
- Fully functional pronunciation generation in person form
- Manual testing complete

### Phase 3: UI Integration - Person Picker (Day 3-4)

**Tasks:**
1. Add "Generate Pronunciations with AI" button to PersonFormFields
2. Ensure compatibility with picker dialog context
3. Test in various modules (weddings, funerals, baptisms, etc.)
4. Handle edge cases in picker

**Deliverable:**
- Fully functional pronunciation generation in person picker
- Works across all modules using person picker

### Phase 4: Testing & Polish (Day 4-5)

**Tasks:**
1. Write Playwright tests
2. Test error scenarios
3. Test with diverse name types
4. Verify dark mode compatibility
5. Accessibility review
6. Performance testing
7. Update documentation

**Deliverable:**
- Complete test coverage
- Documentation updated
- Feature ready for production

---

## Success Metrics

### Adoption Metrics

**Target:**
- 40%+ of new person records use AI pronunciation generation within first month
- 60%+ user satisfaction with pronunciation accuracy

**Measurement:**
- Track button click events (optional analytics)
- User feedback surveys
- Bug reports related to pronunciation accuracy

### Technical Metrics

**Target:**
- API response time: <2 seconds (95th percentile)
- Error rate: <1% of API calls
- Zero critical bugs in production

**Measurement:**
- Anthropic API dashboard for latency/errors
- Sentry error tracking
- User-reported issues

### Quality Metrics

**Target:**
- 90%+ pronunciation accuracy (user judgment)
- <5% of generated pronunciations manually overridden

**Measurement:**
- Sample audit of generated pronunciations
- Track edit frequency after generation (if analytics added)
- User feedback

---

## Acceptance Criteria

**Feature is considered complete when:**

✅ **Functionality:**
- [ ] User can click "Generate Pronunciations with AI" button in person form
- [ ] User can click "Generate Pronunciations with AI" button in person picker
- [ ] AI generates phonetic pronunciations for both first and last names
- [ ] Generated pronunciations populate input fields
- [ ] User can manually edit generated pronunciations
- [ ] Generated pronunciations save correctly to database
- [ ] Loading state displays during generation
- [ ] Success/error toast notifications appear
- [ ] Button disabled when name fields empty

✅ **Quality:**
- [ ] Pronunciations follow detailed phonetic format (syllables, stress marks)
- [ ] Works with names from diverse cultural backgrounds
- [ ] Error handling graceful and user-friendly
- [ ] No impact on existing pronunciation functionality

✅ **Testing:**
- [ ] All Playwright tests pass
- [ ] Manual testing complete across all scenarios
- [ ] Error scenarios tested and handled
- [ ] Works in both light and dark modes
- [ ] Accessibility verified (keyboard, screen reader)

✅ **Documentation:**
- [ ] CHANGELOG_PRONUNCIATION_FIELDS.md updated
- [ ] COMPONENT_REGISTRY.md updated
- [ ] README.md updated
- [ ] Code comments added to server action

✅ **Performance:**
- [ ] API response time <3 seconds
- [ ] No performance degradation to form load times
- [ ] API error rate <1% in testing

---

## Summary Report

### Feature Overview
Add AI-powered pronunciation generation to person forms AND display pronunciations on liturgical script cover pages. This two-part feature helps parish staff generate accurate phonetic pronunciations with one click and ensures presiders can see and practice name pronunciations before ceremonies.

### Technical Scope Summary

**Part 1: AI Pronunciation Generation Button**
- **Location:** Person form (standalone) AND person picker (inline creation)
- **New Files:** 1 server action (`generate-pronunciation.ts`)
- **Modified Files:** 2 form files (person-form.tsx, people-picker.tsx)
- **Complexity:** Medium - AI integration, form state management, loading states

**Part 2: Cover Page Pronunciation Display**
- **Location:** Content builder templates across 5 modules
- **Modified Files:** 13 template files (Weddings, Funerals, Baptisms, Presentations, Quinceañeras)
- **Complexity:** Low - Simple function replacement, no new logic needed
- **Pattern:** Replace `formatPersonWithPhone()` with `formatPersonWithPronunciationWithPhone()`

**Total Files Modified:** 17 files (1 new, 2 forms, 13 templates, 1 documentation)

### Components Summary

**Reused Components:**
- ✅ `formatPersonWithPronunciationWithPhone()` helper - Already exists in formatters.ts
- ✅ FormInput component - Used for pronunciation input fields
- ✅ Button component (shadcn) - Used for "Generate Pronunciations" button
- ✅ Toast notifications (sonner) - Used for success/error messages
- ✅ Sparkles icon (Lucide) - Used for AI generation button
- ✅ Loader2 icon (Lucide) - Used for loading state

**New Components:**
- None - All functionality can be built with existing components

**Missing Components:**
- None identified

### Documentation Updates Needed

**Files to Update:**
1. `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/COMPONENT_REGISTRY.md`
   - Add reference to pronunciation generation feature under "Person Picker" section

2. `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CHANGELOG_PRONUNCIATION_FIELDS.md`
   - Add new section documenting AI generation feature
   - Update "Future Enhancements" section (AI generation is no longer future)

3. `/Users/joshmccarty/Code-2025Macbook/outwardsign/README.md`
   - Update features list to mention "AI-powered pronunciation generation"

4. `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/FORMATTERS.md` (verify completeness)
   - Ensure `formatPersonWithPronunciationWithPhone()` is documented

**User Documentation (Optional):**
- Consider adding bilingual user guide to `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/documentation/content/`
- Topic: "Using AI Pronunciation Generation"

### Testing Requirements Summary

**New Test File:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/tests/pronunciation-generation.spec.ts`

**Test Scenarios:**
1. Person form - Generate pronunciations (create and edit)
2. Person picker - Generate pronunciations (inline creation)
3. Error handling - API failures, empty names
4. Cover page display - Verify pronunciation appears in all modules and formats (HTML, PDF, Word)
5. Edge cases - No pronunciation, pronunciation same as name, no phone

**Affected Existing Tests:**
- Person form tests may need updates to account for new button
- Person picker tests may need updates to account for new button
- No breaking changes expected

### README Impact
Add to Features section:
- "AI-Powered Pronunciation Generation: Generate accurate phonetic pronunciations for names using Claude AI, helping presiders correctly pronounce names during ceremonies"

### Code Reuse & Abstraction

**Following Existing Patterns:**
1. ✅ AI Integration Pattern (from `generate-petitions.ts`)
   - Same Anthropic SDK setup
   - Same error handling pattern
   - Server action pattern with 'use server'

2. ✅ Form Integration Pattern (from `person-form.tsx`)
   - Use `watch()` to get current name values
   - Use `setValue()` to populate generated pronunciations
   - Follow existing loading state patterns

3. ✅ Toast Notification Pattern
   - Success: `toast.success('Pronunciations generated successfully')`
   - Error: `toast.error('Failed to generate pronunciations. Please try again.')`

**Abstraction Decisions:**
- ✅ Single server action for pronunciation generation (not separate actions per name)
- ✅ No abstraction yet - This is the first use case (Rule of Three)
- ⚠️ If we later add AI features for other fields, consider shared AI utility module

**No Duplication:**
- ✅ Reuse existing Anthropic API setup pattern
- ✅ Reuse existing form state management
- ✅ Reuse existing toast notification system
- ✅ Reuse existing `formatPersonWithPronunciationWithPhone()` helper

### Security Concerns

**Authentication/Authorization:**
- ✅ Server action uses existing authentication via `createClient()` and RLS policies
- ✅ No new permission checks needed
- ✅ Only authenticated parish members can generate pronunciations

**Data Validation:**
- ⚠️ Validate firstName and lastName are non-empty strings before calling AI
- ⚠️ Sanitize AI response before setting in form fields
- ⚠️ Limit AI response to reasonable length (max 100 characters per pronunciation)

**API Key Security:**
- ✅ ANTHROPIC_API_KEY already stored in environment variables (Vercel secrets)
- ✅ Never expose API key to client
- ✅ Server action pattern ensures key stays server-side

**Rate Limiting Considerations:**
- ⚠️ Consider adding rate limiting to prevent API abuse
- ⚠️ Track API usage for cost monitoring
- ⚠️ Gracefully handle rate limit errors from Anthropic

**Data Privacy:**
- ⚠️ Names sent to Claude API for pronunciation generation
- ✅ No sensitive data (addresses, phone numbers) included in API calls
- ⚠️ Review Anthropic's data retention policy
- ⚠️ Consider adding opt-in/opt-out for AI features in future

### Database Changes
**No Database Changes Required**
- ✅ Pronunciation fields already exist (added November 23, 2025)
- ✅ Migration already applied: `20251031000000_create_people_table.sql`
- ✅ No new columns, indexes, or policies needed
- ✅ AI-generated pronunciations stored identically to manually-entered pronunciations

### Dependencies and Blockers

**Dependencies:**
- ✅ Anthropic API Key configured (already exists)
- ✅ Pronunciation fields in database (already exists)
- ✅ Anthropic SDK installed (`@anthropic-ai/sdk`)
- ✅ `formatPersonWithPronunciationWithPhone()` helper (already exists)

**Potential Blockers:**
- None identified - All necessary infrastructure exists

**Cost:**
- API usage: Estimated $0.003 per generation, minimal at scale
- Requires product owner approval

**Privacy:**
- Names sent to Claude API
- Requires review of Anthropic's data retention policy
- Similar to existing petition/reading features (precedent set)

### Estimated Complexity

**Overall:** Medium (3-5 days of focused development)

**Breakdown:**
- **Part 1 (AI Button):** Medium complexity
  - AI server action setup: 4 hours
  - Person form integration: 4 hours
  - Person picker integration: 4 hours
  - Testing: 4 hours
  - **Subtotal:** 16 hours (2 days)

- **Part 2 (Cover Pages):** Low complexity
  - Template updates (13 files): 4 hours (repetitive, simple find-replace)
  - Testing cover pages (all formats): 4 hours
  - **Subtotal:** 8 hours (1 day)

- **Documentation & Polish:** 8 hours (1 day)

**Total Estimated Effort:** 32 hours (4 days)

---

## Next Steps After Approval

1. **Create feature branch:** `feature/ai-pronunciation-generation`
2. **Phase 1:** Implement core AI server action (generate-pronunciation.ts)
3. **Phase 2:** Integrate into person form (standalone)
4. **Phase 3:** Integrate into person picker (inline)
5. **Phase 4:** Update content builder templates (13 files)
6. **Phase 5:** Testing (AI generation + cover page display)
7. **Phase 6:** Documentation updates
8. **Code review:** Review with maintainer
9. **Merge to main:** After approval and testing
10. **Deploy to production:** Via Vercel

**Estimated Timeline:** 4-5 days of focused development

---

## Questions for Product Owner

Before implementation begins, please confirm:

1. ✅ **Trigger mechanism confirmed:** Manual "Generate" button (answered)
2. ✅ **Availability confirmed:** Person form and person picker (answered)
3. ✅ **Name change behavior confirmed:** Offer to regenerate (answered)
4. ✅ **Detail level confirmed:** Detailed phonetic (shi-VAWN style) (answered)
5. ✅ **Source tracking confirmed:** Do not track AI vs manual (answered)
6. ✅ **Button placement confirmed:** Single button for both names (answered)
7. ❓ **Cost approval:** Estimated $0.003 per generation - acceptable for production?
8. ❓ **Privacy policy:** Does current privacy policy cover sending names to Claude API?
9. ❓ **User documentation:** Should we create bilingual user guide for this feature?
10. ❓ **Analytics:** Should we track usage metrics (button clicks, edit frequency)?

---

## Appendix: Reference Files

**Database Schema:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/supabase/migrations/20251031000000_create_people_table.sql`

**Type Definitions:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/types.ts` (lines 337-357)
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/schemas/people.ts`

**Existing Components:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/app/(main)/people/person-form.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/components/people-picker.tsx`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/components/person-picker-field.tsx`

**AI Integration Examples:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/claude.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/actions/generate-petitions.ts`

**Helper Functions:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/utils/formatters.ts`
  - `formatPersonWithPronunciationWithPhone()` (lines 109-131)
  - `formatPersonWithPronunciation()` (lines 78-94)

**Content Builder Templates (Cover Page Updates):**

**Wedding Templates:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/wedding/templates/full-script-english.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/wedding/templates/full-script-spanish.ts`

**Funeral Templates:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/funeral/templates/full-script-english.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/funeral/templates/full-script-spanish.ts`

**Baptism Templates:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/baptism/templates/summary-english.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/baptism/templates/summary-spanish.ts`

**Presentation Templates:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/full-script-english.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/full-script-spanish.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/simple-english.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/simple-spanish.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/presentation/templates/bilingual.ts`

**Quinceañera Templates:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/quinceanera/templates/full-script-english.ts`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/src/lib/content-builders/quinceanera/templates/full-script-spanish.ts`

**Documentation:**
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CHANGELOG_PRONUNCIATION_FIELDS.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/FORMATTERS.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/FORMS.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/COMPONENT_REGISTRY.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CONTENT_BUILDER_SECTIONS.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/LITURGICAL_SCRIPT_SYSTEM.md`
- `/Users/joshmccarty/Code-2025Macbook/outwardsign/docs/CONTENT_BUILDER_STRUCTURE.md`

---

**Document Version:** 2.0
**Last Updated:** 2025-11-29
**Author:** Requirements Analysis (AI Agent)
**Status:** Updated with Additional Requirements - Pending Approval
**Changes in v2.0:**
- Added User Story 5: View Pronunciation on Content Builder Cover Pages
- Added "Content Builder Cover Page Integration" section with detailed implementation patterns
- Updated Implementation Locations to include 13 content builder template files
- Updated Summary Report with Part 2 (Cover Page Pronunciation Display)
- Updated testing requirements to include cover page rendering tests
- Added Appendix references to all content builder template files and related documentation
