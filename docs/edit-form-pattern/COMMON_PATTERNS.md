# Edit Form Pattern - Common Patterns

> **Purpose:** Reusable patterns, advanced techniques, and examples for implementing edit forms across different module types.

## Table of Contents

- [Type Casting for Relations](#type-casting-for-relations)
- [Object.fromEntries Pattern](#objectfromentries-pattern)
- [Conditional Form Fields](#conditional-form-fields)
- [Loading Readings](#loading-readings)
- [Suggested Event Names](#suggested-event-names)
- [Nested Forms and Event Handling](#nested-forms-and-event-handling)
- [Module-Specific Examples](#module-specific-examples)
- [Advanced Patterns](#advanced-patterns)

---

## Type Casting for Relations

When accessing related entities that aren't included in the base type, you need type casting.

### The Problem

```tsx
// Wedding module - TypeScript error
const bride = wedding.bride
// Error: Property 'bride' does not exist on type 'Wedding'
```

### Solution 1: Type Casting (Quick)

```tsx
// Type cast when accessing relations
const bride = (wedding as any).bride
const groom = (wedding as any).groom

// Funeral module
const deceased = (funeral as any).deceased

// Baptism module
const child = (baptism as any).child
```

**When to use:** Quick implementation, prototyping, or when relations are optional.

### Solution 2: WithRelations Interface (Better)

Define a proper interface in your server actions file:

```tsx
// In lib/actions/weddings.ts
export interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  wedding_event?: Event | null
  first_reading?: IndividualReading | null
  second_reading?: IndividualReading | null
  gospel_reading?: IndividualReading | null
  // ... all relations
}

// Then use in edit page and form:
const bride = wedding.bride  // Type-safe, no casting needed
```

**When to use:** Production code, when relations are well-defined and consistent.

---

## Object.fromEntries Pattern

### The Problem

When updating entities, you want to only update fields that were actually changed, not overwrite everything with empty values.

### The Solution

In `update[Entity]` server actions, use `Object.fromEntries` to filter out undefined values:

```tsx
export async function updateWedding(
  id: string,
  data: CreateWeddingData
): Promise<Wedding> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values (filters out undefined)
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: wedding, error } = await supabase
    .from('weddings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating wedding:', error)
    throw new Error('Failed to update wedding')
  }

  revalidatePath('/weddings')
  revalidatePath(`/weddings/${id}`)
  revalidatePath(`/weddings/${id}/edit`)
  return wedding
}
```

### Why This Matters

**Without filtering:**
```tsx
const formData = {
  notes: "",  // Empty string overwrites existing notes
  status: "ACTIVE"
}
await updateEntity(id, formData)
// Result: notes field cleared in database
```

**With filtering:**
```tsx
const formData = {
  notes: undefined,  // User didn't change notes
  status: "ACTIVE"
}
// Object.fromEntries filters out undefined
// Result: { status: "ACTIVE" }
await updateEntity(id, formData)
// Result: only status updated, notes unchanged
```

### Form Implementation

In your form, pass `undefined` for unchanged optional fields:

```tsx
const formData: CreateWeddingData = {
  status: status || undefined,
  notes: notes || undefined,
  bride_id: bride.value?.id,  // undefined if not selected
  groom_id: groom.value?.id,
}
```

---

## Conditional Form Fields

Show/hide fields based on mode or other field values.

### Fields Only in Edit Mode

```tsx
{isEditing && (
  <FormField
    id="created-date"
    label="Created Date"
    value={new Date(entity.created_at).toLocaleDateString()}
    disabled
  />
)}

{isEditing && entity.updated_at && (
  <FormField
    id="updated-date"
    label="Last Updated"
    value={new Date(entity.updated_at).toLocaleDateString()}
    disabled
  />
)}
```

### Fields Only in Create Mode

```tsx
{!isEditing && (
  <Card>
    <CardHeader>
      <CardTitle>Initial Setup</CardTitle>
      <CardDescription>
        These settings can only be configured during creation
      </CardDescription>
    </CardHeader>
    <CardContent>
      <FormField
        id="initial-status"
        label="Initial Status"
        value={initialStatus}
        onChange={setInitialStatus}
        inputType="select"
        options={statusOptions}
      />
    </CardContent>
  </Card>
)}
```

### Fields Based on Other Values

```tsx
<FormField
  id="event-type"
  label="Event Type"
  value={eventType}
  onChange={setEventType}
  inputType="select"
  options={eventTypeOptions}
/>

{eventType === "WEDDING" && (
  <Card>
    <CardHeader>
      <CardTitle>Wedding Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <PersonPickerField label="Bride" {...} />
      <PersonPickerField label="Groom" {...} />
    </CardContent>
  </Card>
)}

{eventType === "FUNERAL" && (
  <Card>
    <CardHeader>
      <CardTitle>Funeral Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <PersonPickerField label="Deceased" {...} />
    </CardContent>
  </Card>
)}
```

---

## Loading Readings

Some modules (weddings, funerals, baptisms) need to load scripture readings from the database.

### Pattern

```tsx
import { getIndividualReadings } from '@/lib/actions/individual-readings'
import type { IndividualReading } from '@/lib/types'

export function WeddingForm({ wedding, formId, onLoadingChange }: WeddingFormProps) {
  // ... other state

  // Readings state
  const [readings, setReadings] = useState<IndividualReading[]>([])

  // Load readings on mount
  useEffect(() => {
    const loadReadings = async () => {
      try {
        const allReadings = await getIndividualReadings()
        setReadings(allReadings)
      } catch (error) {
        console.error('Failed to load readings:', error)
        toast.error('Failed to load readings')
      }
    }
    loadReadings()
  }, [])

  // ... rest of form
}
```

### Using Readings in Form

```tsx
<ReadingPickerModal
  isOpen={showFirstReadingPicker}
  onClose={() => setShowFirstReadingPicker(false)}
  onSelect={setFirstReading}
  selectedReading={firstReading}
  readings={readings}  // Pass loaded readings
/>
```

---

## Suggested Event Names

For better UX, suggest event names based on related person data.

### Wedding Example

```tsx
import { useMemo } from 'react'

export function WeddingForm({ wedding, formId, onLoadingChange }: WeddingFormProps) {
  const bride = usePickerState<Person>()
  const groom = usePickerState<Person>()
  const weddingEvent = usePickerState<Event>()

  // Compute suggested name based on couple
  const suggestedWeddingName = useMemo(() => {
    const brideLastName = bride.value?.last_name
    const groomLastName = groom.value?.last_name

    if (brideLastName && groomLastName) {
      return `${brideLastName}-${groomLastName} Wedding`
    } else if (brideLastName) {
      return `${brideLastName} Wedding`
    } else if (groomLastName) {
      return `${groomLastName} Wedding`
    }
    return "Wedding"
  }, [bride.value, groom.value])

  // Use in EventPickerField
  return (
    <form id={formId} onSubmit={handleSubmit}>
      <EventPickerField
        label="Wedding Ceremony"
        value={weddingEvent.value}
        onValueChange={weddingEvent.setValue}
        showPicker={weddingEvent.showPicker}
        onShowPickerChange={weddingEvent.setShowPicker}
        defaultCreateFormData={{ name: suggestedWeddingName }}  // Pre-fill name
        openToNewEvent={!weddingEvent.value}
      />
    </form>
  )
}
```

### Funeral Example

```tsx
const suggestedFuneralName = useMemo(() => {
  const deceasedLastName = deceased.value?.last_name
  const deceasedFirstName = deceased.value?.first_name

  if (deceasedFirstName && deceasedLastName) {
    return `${deceasedFirstName} ${deceasedLastName} Funeral`
  } else if (deceasedLastName) {
    return `${deceasedLastName} Funeral`
  }
  return "Funeral"
}, [deceased.value])
```

### Baptism Example

```tsx
const suggestedBaptismName = useMemo(() => {
  const childLastName = child.value?.last_name
  const childFirstName = child.value?.first_name

  if (childFirstName && childLastName) {
    return `${childFirstName} ${childLastName} Baptism`
  } else if (childLastName) {
    return `${childLastName} Baptism`
  }
  return "Baptism"
}, [child.value])
```

---

## Nested Forms and Event Handling

When you have pickers that open forms inside a form, you need to prevent event propagation.

### The Problem

```tsx
// Picker button inside form triggers form submission
<Button onClick={() => setShowPicker(true)}>
  Select Person
</Button>
// Clicking this submits the form instead of opening the picker
```

### The Solution

Use `type="button"` to prevent form submission:

```tsx
<Button
  type="button"  // CRITICAL: Prevents form submission
  onClick={() => setShowPicker(true)}
>
  Select Person
</Button>
```

**Why:** By default, buttons inside forms have `type="submit"`. Always specify `type="button"` for non-submit buttons.

### Event Propagation in Pickers

If you're creating custom picker components, stop propagation in click handlers:

```tsx
<div onClick={(e) => {
  e.stopPropagation()  // Prevent parent form events
  setShowPicker(true)
}}>
  Select Item
</div>
```

---

## Module-Specific Examples

### Wedding Module Complete Flow

**Edit Page (Layer 1):**
```tsx
const wedding = await getWeddingWithRelations(id)
const bride = (wedding as any).bride
const groom = (wedding as any).groom

let title = "Edit Wedding"
if (bride?.last_name && groom?.last_name) {
  title = `${bride.last_name}-${groom.last_name} Wedding`
}
```

**Form (Layer 3):**
```tsx
const bride = usePickerState<Person>()
const groom = usePickerState<Person>()
const weddingEvent = usePickerState<Event>()

useEffect(() => {
  if (wedding) {
    if (wedding.bride) bride.setValue(wedding.bride)
    if (wedding.groom) groom.setValue(wedding.groom)
    if (wedding.wedding_event) weddingEvent.setValue(wedding.wedding_event)
  }
}, [wedding])

const suggestedName = useMemo(() => {
  if (bride.value?.last_name && groom.value?.last_name) {
    return `${bride.value.last_name}-${groom.value.last_name} Wedding`
  }
  return "Wedding"
}, [bride.value, groom.value])
```

### Funeral Module Complete Flow

**Edit Page (Layer 1):**
```tsx
const funeral = await getFuneralWithRelations(id)
const deceased = (funeral as any).deceased

let title = "Edit Funeral"
if (deceased?.last_name) {
  title = `${deceased.first_name ? deceased.first_name + ' ' : ''}${deceased.last_name} Funeral`
}
```

**Form (Layer 3):**
```tsx
const deceased = usePickerState<Person>()
const funeralEvent = usePickerState<Event>()

useEffect(() => {
  if (funeral) {
    if (funeral.deceased) deceased.setValue(funeral.deceased)
    if (funeral.funeral_event) funeralEvent.setValue(funeral.funeral_event)
  }
}, [funeral])

const suggestedName = useMemo(() => {
  const name = deceased.value?.full_name
  return name ? `${name} Funeral` : "Funeral"
}, [deceased.value])
```

### Baptism Module Complete Flow

**Edit Page (Layer 1):**
```tsx
const baptism = await getBaptismWithRelations(id)
const child = (baptism as any).child

let title = "Edit Baptism"
if (child?.last_name) {
  title = `${child.first_name || ''} ${child.last_name} Baptism`.trim()
}
```

**Form (Layer 3):**
```tsx
const child = usePickerState<Person>()
const baptismEvent = usePickerState<Event>()
const father = usePickerState<Person>()
const mother = usePickerState<Person>()

useEffect(() => {
  if (baptism) {
    if (baptism.child) child.setValue(baptism.child)
    if (baptism.baptism_event) baptismEvent.setValue(baptism.baptism_event)
    if (baptism.father) father.setValue(baptism.father)
    if (baptism.mother) mother.setValue(baptism.mother)
  }
}, [baptism])

const suggestedName = useMemo(() => {
  const childName = child.value?.full_name
  return childName ? `${childName} Baptism` : "Baptism"
}, [child.value])
```

---

## Advanced Patterns

### Multi-Step Forms with Tabs

For complex forms, use tabs to organize sections:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ComplexForm({ entity, formId, onLoadingChange }: FormProps) {
  // ... state and logic

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="ceremony">Ceremony</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Basic fields */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people">
          <Card>
            <CardHeader>
              <CardTitle>People Involved</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Person pickers */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* More tabs... */}
      </Tabs>

      <FormBottomActions {...} />
    </form>
  )
}
```

### Form Validation with Error Display

```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

const validateForm = () => {
  const newErrors: Record<string, string> = {}

  if (!bride.value) {
    newErrors.bride = "Bride is required"
  }
  if (!groom.value) {
    newErrors.groom = "Groom is required"
  }
  if (!weddingEvent.value) {
    newErrors.event = "Wedding ceremony is required"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) {
    toast.error("Please fix the errors before submitting")
    return
  }

  // ... rest of submission
}

// In form:
<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={(value) => {
    bride.setValue(value)
    if (errors.bride) {
      setErrors({ ...errors, bride: "" })  // Clear error
    }
  }}
  error={errors.bride}  // Show error
/>
```

### Autosave Pattern

```tsx
import { useDebounce } from '@/hooks/use-debounce'

export function FormWithAutosave({ entity, formId }: FormProps) {
  const [notes, setNotes] = useState(entity?.notes || "")
  const debouncedNotes = useDebounce(notes, 1000)  // Wait 1 second after typing

  // Autosave when debounced value changes
  useEffect(() => {
    if (entity && debouncedNotes !== entity.notes) {
      const autosave = async () => {
        try {
          await updateEntity(entity.id, { notes: debouncedNotes })
          toast.success("Changes saved", { duration: 1000 })
        } catch (error) {
          console.error("Autosave failed:", error)
        }
      }
      autosave()
    }
  }, [debouncedNotes, entity])

  // ... rest of form
}
```

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - Understanding the 3-layer architecture
- **[EDIT_PAGE.md](./EDIT_PAGE.md)** - Layer 1: Server page patterns
- **[FORM_WRAPPER.md](./FORM_WRAPPER.md)** - Layer 2: Client wrapper patterns
- **[UNIFIED_FORM.md](./UNIFIED_FORM.md)** - Layer 3: Form component patterns
- **[FORMS.md](../FORMS.md)** - Form input styling and validation
- **[PICKERS.md](../PICKERS.md)** - Picker component patterns
- **[VALIDATION.md](../VALIDATION.md)** - Zod validation patterns
