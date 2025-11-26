# React Hook Form Migration Tasks

Track progress of migrating forms from useState pattern to React Hook Form with Zod validation.

## Already Migrated

- [x] `src/app/(main)/groups/group-form.tsx`
- [x] `src/app/(main)/presentations/presentation-form.tsx`
- [x] `src/app/(main)/settings/petitions/petition-template-form.tsx`
- [x] `src/app/(main)/mass-times-templates/mass-time-form.tsx`
- [x] `src/components/event-form-fields.tsx` (shared component)

## Pending Migration

### Sacraments (4)

- [ ] `src/app/(main)/weddings/wedding-form.tsx`
- [ ] `src/app/(main)/funerals/funeral-form.tsx`
- [ ] `src/app/(main)/baptisms/baptism-form.tsx`
- [ ] `src/app/(main)/quinceaneras/quinceanera-form.tsx`

### Core Modules (6)

- [ ] `src/app/(main)/people/person-form.tsx`
- [ ] `src/app/(main)/events/event-form.tsx`
- [ ] `src/app/(main)/masses/mass-form.tsx`
- [ ] `src/app/(main)/readings/reading-form.tsx`
- [ ] `src/app/(main)/locations/location-form.tsx`
- [ ] `src/app/(main)/mass-intentions/mass-intention-form.tsx`

### Mass Roles (3)

- [ ] `src/app/(main)/mass-roles/mass-role-form.tsx`
- [ ] `src/app/(main)/mass-role-templates/mass-role-template-form.tsx`
- [ ] `src/app/(main)/mass-role-members/[id]/preferences/mass-role-preferences-form.tsx`

### Groups (2)

- [ ] `src/app/(main)/group-members/[id]/memberships/group-memberships-form.tsx`
- [ ] `src/components/groups/group-form-dialog.tsx`

### Settings Dialogs (2)

- [ ] `src/app/(main)/settings/event-types/event-type-form-dialog.tsx`
- [ ] `src/app/(main)/mass-types/mass-type-form-dialog.tsx`

### Auth/Setup (1)

- [ ] `src/app/select-parish/create-parish-form.tsx`

## Migration Reference

See `docs/REACT_HOOK_FORM_MIGRATION.md` for the complete migration guide.

### Quick Checklist

1. Add imports: `useForm`, `zodResolver`, `z`
2. Create Zod schema and type (`z.infer`)
3. Replace `useState` fields with `useForm({ resolver: zodResolver(schema), defaultValues })`
4. Rename `handleSubmit` to `onSubmit`, update signature to `(data: FormValues)`
5. Update form element: `onSubmit={form.handleSubmit(onSubmit)}`
6. Update FormInput fields:
   - `value={form.watch('field')}`
   - `onChange={(value) => form.setValue('field', value)}`
   - `error={form.formState.errors.field?.message}`
7. Remove unused imports (Label, Select components if replaced by FormInput)
8. Run `npm run build` to verify
