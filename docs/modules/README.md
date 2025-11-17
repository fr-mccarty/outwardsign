# Module People Picker Configuration - Index

This directory contains detailed documentation for people picker configuration across all modules.

## Available Module Documentation

1. **[Wedding](./wedding.md)** - Wedding module people picker configuration
2. **[Funeral](./funeral.md)** - Funeral module people picker configuration
3. **[Baptism](./baptism.md)** - Baptism module people picker configuration
4. **[Presentation](./presentation.md)** - Presentation module people picker configuration
5. **[Quinceañera](./quinceanera.md)** - Quinceañera module people picker configuration
6. **[Mass](./mass.md)** - Mass module people picker configuration

## Quick Reference Pattern

All modules follow a consistent pattern for people picker behavior:

### Opens to CREATE NEW PERSON:
- **One-time participants** - Bride, groom, deceased, child being baptized, quinceañera
- **Family members** - Parents, family contacts, godparents, witnesses
- **Readers** - First reader, psalm reader, second reader, gospel reader, petition reader (for family sacraments)

### Opens to SEARCH/LIST VIEW:
- **Clergy** - Presider, homilist
- **Recurring ministers** - Lead musician, cantor
- **Staff** - Coordinator

## Implementation Code Reference

### Create New Person
```tsx
<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
  placeholder="Select Bride"
  openToNewPerson={!bride.value}  // ← This prop makes it open to create new
/>
```

### Search for Person
```tsx
<PersonPickerField
  label="Presider"
  value={presider.value}
  onValueChange={presider.setValue}
  showPicker={presider.showPicker}
  onShowPickerChange={presider.setShowPicker}
  placeholder="Select Presider"
  autoSetSex="MALE"
  // ← No openToNewPerson prop = opens to search/list
/>
```

## Rationale

The pattern is based on likelihood of the person already being in the system:

- **Create New First** - For participants who are likely new to the parish database (sacrament recipients, family members)
- **Search First** - For people who serve regularly and are already in the system (clergy, musicians, staff)

This reduces friction and prevents duplicate entries while maintaining efficiency.

## Module-Specific Notes

- **Mass Module** - Uses Mass Role Templates system for most roles; all pickers open to search
- **Presentation Module** - Uses `visibleFields` prop to show additional contact information
- **Wedding/Funeral/Quinceañera** - Full liturgical celebrations with many reader roles

## See Also

- [COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) - Complete documentation on PersonPickerField component
- [PICKER_PATTERNS.md](../PICKER_PATTERNS.md) - General picker behavior patterns
