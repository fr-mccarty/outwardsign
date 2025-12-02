# Wizard Components

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document covers the multi-step wizard system used for complex workflows like mass scheduling.

---

## See Also

- **[MASS_SCHEDULING.md](./MASS_SCHEDULING.md)** - Mass scheduling wizard implementation
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index

---

## Wizard Components

### Wizard System
**Path:** `src/components/wizard/`

**Purpose:** Multi-step wizard/form flow system.

**Components:**
- `Wizard.tsx` - Main wizard container
- `WizardContainer.tsx` - Wizard layout wrapper
- `WizardSteps.tsx` - Step indicator/progress bar
- `WizardNavigation.tsx` - Next/back buttons
- `WizardStepContent.tsx` - Step content wrapper
- `WizardLoadingState.tsx` - Loading state for wizard

**Features:**
- Multi-step forms
- Progress indication
- Navigation controls
- Step validation
- Loading states
- Responsive design

---

### LiturgicalReadingsWizard
**Path:** `src/components/liturgical-readings-wizard.tsx`

**Purpose:** Wizard for selecting and configuring liturgical readings.

---

### PetitionWizard
**Path:** `src/components/petition-wizard.tsx`

**Purpose:** Wizard for creating and editing liturgical petitions.

---

