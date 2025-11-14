# FormField Component Improvements

**Priority:** Medium
**Effort:** Medium
**Impact:** Improves maintainability, dark mode support, and type safety

## Current State

The application uses a custom `FormField` component (`src/components/ui/form-field.tsx`) instead of the standard shadcn `form.tsx` pattern with react-hook-form integration.

**Current component location:** `src/components/ui/form-field.tsx`

## Issues to Address

### 1. Hardcoded Colors (Dark Mode Incompatible)

**Problem:** Uses hardcoded red colors instead of semantic tokens.

**Current code:**
```tsx
// Error styling
className="border-red-500 focus-visible:ring-red-500"
error && "text-red-500"

// Required asterisk
<span className="text-red-500 ml-1">*</span>
```

**Should be:**
```tsx
// Error styling
className="border-destructive focus-visible:ring-destructive"
error && "text-destructive"

// Required asterisk
<span className="text-destructive ml-1">*</span>
```

**Files affected:** All forms using FormField (weddings, readings, masses, etc.)

### 2. Not Integrated with react-hook-form

**Problem:** Manual state management required for every form field.

**Current pattern:**
```tsx
const [notes, setNotes] = useState("")
<FormField
  id="notes"
  label="Notes"
  value={notes}
  onChange={setNotes}
/>
```

**Benefits of react-hook-form:**
- Automatic validation from Zod schemas
- Touched/dirty state tracking
- Better performance (less re-renders)
- Built-in async validation
- Form-level error handling

**Note:** The standard shadcn `form.tsx` already exists in the codebase but isn't being used.

### 3. Type Safety Issues

**Problem:** Type casting in multiple places.

```tsx
(props as TextareaFieldProps).placeholder  // Not type-safe
(props as InputFieldProps).min
(props as SelectFieldProps).options
```

**Solution:** Better TypeScript discriminated unions or separate components.

### 4. Two Form Systems Coexist

**Files:**
- `src/components/ui/form.tsx` - shadcn standard (unused)
- `src/components/ui/form-field.tsx` - custom simplified version (in use)

**Decision needed:** Pick one approach and standardize across the codebase.

## Options

### Option A: Fix FormField in Place (Easier)

**Changes:**
1. Replace hardcoded red colors with semantic `destructive` tokens
2. Improve TypeScript type safety
3. Keep simplified API for forms that don't need validation

**Pros:**
- Minimal code changes
- Works with existing forms
- Simple, cohesive API

**Cons:**
- Still manual state management
- No validation benefits
- Doesn't follow shadcn conventions

### Option B: Migrate to shadcn FormField (Better Long-term)

**Changes:**
1. Migrate forms to use react-hook-form + Zod validation
2. Use standard shadcn form pattern:
   ```tsx
   <FormField
     control={form.control}
     name="notes"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Notes</FormLabel>
         <FormControl>
           <Textarea {...field} />
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />
   ```
3. Update FORMS.md documentation to reflect this pattern

**Pros:**
- Better validation (dual client/server with Zod)
- Follows shadcn conventions
- Better developer experience
- Form-level error handling
- Performance optimizations

**Cons:**
- More verbose
- Requires refactoring all existing forms
- Steeper learning curve

### Option C: Hybrid Approach (Pragmatic)

**Changes:**
1. Fix color tokens in current FormField (quick win)
2. Create new forms with shadcn pattern going forward
3. Migrate existing forms gradually as they're touched

**Pros:**
- Quick improvement (dark mode support)
- Low risk
- Incremental migration path

**Cons:**
- Inconsistent patterns during transition
- Two form systems maintained

## Recommendation

**Start with Option C (Hybrid):**

1. **Immediate (Low effort):**
   - Replace `red-500` with `destructive` token in `form-field.tsx`
   - Test in dark mode
   - No form refactoring needed

2. **Next forms (Medium effort):**
   - Use shadcn FormField pattern for new/complex forms
   - Document pattern in FORMS.md with examples

3. **Future refactor (High effort):**
   - Migrate high-touch forms (weddings, masses) to react-hook-form
   - Eventually deprecate custom FormField

## Files to Change (Option C - Immediate)

**Quick fix (colors only):**
- [ ] `src/components/ui/form-field.tsx` - Replace color tokens

**Documentation:**
- [ ] `docs/FORMS.md` - Document both patterns and migration path

## Files Using FormField (For Future Migration)

```
src/app/(main)/weddings/wedding-form.tsx
src/app/(main)/readings/reading-form.tsx
src/app/(main)/masses/mass-form.tsx
src/app/(main)/funerals/funeral-form.tsx
src/app/(main)/baptisms/baptism-form.tsx
src/app/(main)/quinceaneras/quinceanera-form.tsx
// ... and others
```

## Related Issues

- Dark mode support (CRITICAL for color tokens)
- Form validation consistency across modules
- Testing forms with react-hook-form (if migrating)

## References

- [FORMS.md](../docs/FORMS.md) - Current form documentation
- [shadcn/ui Form docs](https://ui.shadcn.com/docs/components/form)
- [react-hook-form docs](https://react-hook-form.com/)

---

**Created:** 2025-11-15
**Status:** Pending
**Assigned:** TBD
