# i18n Remaining Work

This document tracks hardcoded strings in shared components that should be translated for complete i18n support.

## Status: Build Successful ✅

The application builds successfully with no errors. The following components contain hardcoded English strings that should be translated:

---

## High Priority - Shared Components

### 1. **DeleteConfirmationDialog** (`src/components/delete-confirmation-dialog.tsx`)

**Hardcoded strings:**
- Line 31: `title = "Delete Item"`
- Line 34: `actionLabel = "Delete"`
- Line 59: `"Are you sure you want to delete"`
- Line 65: `"this item"`
- Line 67: `"? This action cannot be undone."`
- Line 79: `"Cancel"`
- Line 86: Dynamic action label with "ing" suffix

**Usage:** Used across the application for delete confirmations in all modules.

**Translation keys needed:**
```typescript
t('common.deleteItem')
t('common.delete')
t('common.areYouSureDelete')
t('common.thisItem')
t('common.cannotBeUndone')
t('common.cancel')
t('common.deleting')
```

---

### 2. **DataTable Components** (`src/components/data-table/`)

#### `data-table.tsx`
**Hardcoded strings:**
- Line 234: `"Loading more..."`

**Translation key needed:**
```typescript
t('common.loadingMore')
```

#### `data-table-actions.tsx`
**Hardcoded strings:**
- Line 40, 140: `"Open menu"` (sr-only, accessibility)
- Line 126, 192: `"Delete"`
- Line 184: `"Edit"`

**Translation keys needed:**
```typescript
t('common.openMenu')
t('common.delete')
t('common.edit')
```

#### `data-table-empty.tsx`
**Hardcoded strings:**
- Line 17: `title = "No data"`
- Line 18: `description = "No items found."`

**Translation keys needed:**
```typescript
t('common.noData')
t('common.noItemsFound')
```

#### `data-table-header.tsx`
**Hardcoded strings:**
- Line 19: `searchPlaceholder = "Search..."`

**Translation key needed:**
```typescript
t('common.search')
```

---

### 3. **CorePicker** (`src/components/core-picker.tsx`)

**Hardcoded strings (default prop values):**
- Line 113: `searchPlaceholder = 'Search...'`
- Line 123: `createButtonLabel = 'Create'`
- Line 125: `addNewButtonLabel = 'Add New'`
- Line 134: `updateButtonLabel = 'Update'`
- Line 137: `emptyMessage = 'No items found'`
- Line 138: `noResultsMessage = 'No results found'`

**Note:** CorePicker is a reusable component where these strings are often overridden by parent components. Most usages already pass translated labels. Only the default values need translation.

**Translation keys needed:**
```typescript
t('common.search')
t('common.create')
t('common.addNew')
t('common.update')
t('common.noItemsFound')
t('common.noResultsFound')
```

---

### 4. **DeleteButton** (`src/components/delete-button.tsx`)

**Hardcoded strings:**
- Line 109: `Are you sure you want to delete this ${entityType.toLowerCase()}? This action cannot be undone.`

**Translation key needed:**
```typescript
t('common.confirmDelete', { entityType })
```

---

### 5. **PickerField** (`src/components/picker-field.tsx`)

**Hardcoded strings:**
- Line 167: `Are you sure you want to remove the selected ${label.toLowerCase()}? This will not delete the ${label.toLowerCase()} itself, only remove it from this field.`

**Translation key needed:**
```typescript
t('common.confirmRemoveField', { label })
```

---

### 6. **MultiSelect** (`src/components/multi-select.tsx`)

**Hardcoded strings:**
- Line 99: `"No items found."`

**Translation key needed:**
```typescript
t('common.noItemsFound')
```

---

### 7. **CardListItem** (`src/components/list-card/card-list-item.tsx`)

**Hardcoded strings:**
- Line 28: `deleteConfirmDescription = 'Are you sure you want to delete this item? This action cannot be undone.'`

**Translation key needed:**
```typescript
t('common.confirmDeleteItem')
```

---

### 8. **PetitionPickerField** (`src/components/petition-picker-field.tsx`)

**Hardcoded strings:**
- Line 167: `"Create petitions for this event:"`
- Line 176: `"Create from Template"`
- Line 237: `"Edit"`
- Line 311: `"This will permanently delete these petitions. This action cannot be undone."`

**Translation keys needed:**
```typescript
t('petitions.createForEvent')
t('petitions.createFromTemplate')
t('common.edit')
t('petitions.confirmDeletePermanent')
```

---

### 9. **MassRoleTemplateItem** (`src/components/mass-role-template-item.tsx`)

**Hardcoded strings:**
- Line 67: `Are you sure you want to remove ${item.mass_role.name} from this template? This action cannot be undone.`

**Translation key needed:**
```typescript
t('massRoles.confirmRemoveFromTemplate', { name })
```

---

### 10. **DocumentationSearch** (`src/components/documentation-search.tsx`)

**Hardcoded strings:**
- Line 149: `'No results found. Try a different search term.'`

**Translation key needed:**
```typescript
t('documentation.noResultsTryDifferent')
```

---

## Medium Priority - Less Common Components

### 11. **IconSelector** (`src/components/icon-selector.tsx`)
- Line 128: `placeholder="Search icons..."`

### 12. **PetitionTemplatePickerDialog** (`src/components/petition-template-picker-dialog.tsx`)
- Line 132: `placeholder="Search by title or description..."`
- Line 185: `"Loading templates..."`
- Line 243: `"Cancel"`

### 13. **MassRoleTemplateItemList** (`src/components/mass-role-template-item-list.tsx`)
- Line 103: `"Loading mass roles..."`
- Line 117: `addButtonLabel="Add Role"`
- Line 134: `placeholder="Search for a mass role..."`

### 14. **MassRoleAssignments** (`src/components/mass-role-assignments.tsx`)
- Line 117: `"Loading role assignments..."`
- Line 136: `"Edit the Mass to select a role template."`
- Line 243: `"Add ${templateItem.mass_role.name}"`
- Line 257: `placeholder="Search for a person to assign..."`

---

## Low Priority - Internal/Technical

### Language Selector (`src/components/language-selector.tsx`)
**Status:** ✅ Working correctly
- Line 48: `placeholder="Language"` (acceptable to leave in English)
- Line 51: `"English"` (language names are typically not translated)
- Line 52: `"Español"` (language names are typically not translated)

**Note:** Language names are conventionally shown in their native form, not translated.

---

## Recommended Translation Keys Structure

Based on the analysis, these common translation keys should be added to `src/lib/i18n/translations.ts`:

```typescript
// Common actions
delete: { en: 'Delete', es: 'Eliminar' }
deleting: { en: 'Deleting...', es: 'Eliminando...' }
edit: { en: 'Edit', es: 'Editar' }
cancel: { en: 'Cancel', es: 'Cancelar' }
create: { en: 'Create', es: 'Crear' }
update: { en: 'Update', es: 'Actualizar' }
save: { en: 'Save', es: 'Guardar' }
addNew: { en: 'Add New', es: 'Agregar Nuevo' }
remove: { en: 'Remove', es: 'Quitar' }

// Search and filtering
search: { en: 'Search...', es: 'Buscar...' }
noItemsFound: { en: 'No items found', es: 'No se encontraron elementos' }
noResultsFound: { en: 'No results found', es: 'No se encontraron resultados' }
noData: { en: 'No data', es: 'Sin datos' }
loadingMore: { en: 'Loading more...', es: 'Cargando más...' }

// Confirmations
areYouSureDelete: { en: 'Are you sure you want to delete', es: '¿Está seguro de que desea eliminar' }
thisItem: { en: 'this item', es: 'este elemento' }
cannotBeUndone: { en: 'This action cannot be undone.', es: 'Esta acción no se puede deshacer.' }
deleteItem: { en: 'Delete Item', es: 'Eliminar Elemento' }
confirmDeleteItem: {
  en: 'Are you sure you want to delete this item? This action cannot be undone.',
  es: '¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.'
}

// Accessibility
openMenu: { en: 'Open menu', es: 'Abrir menú' }
```

---

## Implementation Priority

1. **Phase 1 (High Priority):**
   - DeleteConfirmationDialog
   - DataTable components (all 4 files)
   - CorePicker defaults

2. **Phase 2 (Medium Priority):**
   - DeleteButton
   - PickerField
   - MultiSelect
   - CardListItem
   - PetitionPickerField
   - MassRoleTemplateItem
   - DocumentationSearch

3. **Phase 3 (Low Priority):**
   - IconSelector
   - PetitionTemplatePickerDialog
   - MassRoleTemplateItemList
   - MassRoleAssignments

---

## Notes

- **Toast notifications:** Most toast messages throughout the app use dynamic strings and would need i18n integration with the `sonner` library.
- **Error messages:** Server action error messages are currently hardcoded in English and would need translation.
- **Validation messages:** Zod validation messages are in English and would need custom error maps for translation.
- **Accessibility strings:** Screen reader text (`sr-only`) should be translated for full accessibility in both languages.

---

## Testing Checklist

When implementing translations for these components:

1. ✅ Verify build passes (`npm run build`)
2. ✅ Test language switching in browser
3. ✅ Check localStorage persistence
4. ✅ Verify all translated strings display correctly in both English and Spanish
5. ✅ Test with longer Spanish translations (ensure UI doesn't break)
6. ✅ Verify accessibility labels are translated
7. ✅ Check toast notifications display in correct language
8. ✅ Test delete confirmations in both languages
9. ✅ Verify empty states show correct language
10. ✅ Check search placeholders in both languages
