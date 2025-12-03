# FORMS - Critical Rules Only

> **Auto-injected for all form-related tasks. For complete details, see [FORMS.md](./FORMS.md)**

## Non-Negotiable Rules

### 1. FormField Component (REQUIRED)
**ALL** form inputs, selects, and textareas MUST use the FormField component:

```tsx
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label Text</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**NEVER use standalone Input/Select/Textarea components.**

### 2. Form Input Styling (FORBIDDEN)
**NEVER modify these properties on form inputs:**
- `font-family` - Always use system default
- `border` - Let FormField handle borders
- `background` - Let theme system handle backgrounds

### 3. Form Buttons (REQUIRED)
Use shared button components ONLY:
- `<SaveButton />` for save actions
- `<CancelButton />` for cancel actions

**NEVER create custom save/cancel buttons.**

### 4. Validation (REQUIRED)
All forms MUST use Zod schemas for validation:

```tsx
const schema = z.object({
  field: z.string().min(1, "Required")
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema)
})
```

### 5. Form Structure (REQUIRED)
```tsx
// Unified form pattern - handles both create and edit
export function EntityForm({ entity }: { entity?: EntityWithRelations }) {
  const isEditing = !!entity
  // Form redirects to view page after save
}
```

## Reference
- Complete patterns: [FORMS.md](./FORMS.md)
- Validation details: [VALIDATION.md](./VALIDATION.md)
- Component registry: [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)
