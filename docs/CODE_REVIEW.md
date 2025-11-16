# Code Review Checklist

This document contains a checklist of items to verify during code review. Use this with an AI agent to ensure code quality and consistency across the project.

## Form Components

- [ ] **All form inputs use FormField component** - Verify that all form inputs use the FormField component instead of manually composing Label + Input/Select/Textarea. FormField is an all-in-one component that takes props and internally renders the complete field structure. Direct usage of Input, Select, or Textarea components with manual Label composition is prohibited except in picker components or explicitly approved special cases.

- [ ] **No extra styling on form inputs** - Verify that form inputs (Input, Textarea, Select) do NOT have prohibited styling applied. According to [FORMS.md](./FORMS.md) § Form Input Styling, form inputs must use default shadcn/ui styling. **PROHIBITED:** font-family modifications (`font-mono`, `font-serif`, `font-sans`), font styles (`italic`), font weights (`font-bold`, `font-semibold`), border customizations (`border-*`, `rounded-*`), background changes (`bg-*`). **ALLOWED:** Text sizes (`text-sm`, `text-lg`), layout classes (`w-full`, `min-h-*`, padding, margin). Check all Input, Textarea, and Select components for compliance.

- [ ] **All cancel buttons use CancelButton component** - Verify that all cancel/back buttons in forms use the standardized `CancelButton` component from `src/components/cancel-button.tsx` instead of raw Button components. Forms should use `FormBottomActions` component which includes both SaveButton and CancelButton. **PROHIBITED:** Direct Button usage for cancel actions (e.g., `<Button variant="outline" onClick={() => router.push('/back')}>Cancel</Button>`). **REQUIRED:** Use `<CancelButton href="/back">Cancel</CancelButton>` or include `<FormBottomActions ... />` which uses CancelButton internally. Check all form components for cancel/back button compliance. See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) § CancelButton and FormBottomActions.

## Dark Mode Support

- [ ] **All elements use CSS variables for colors** - Verify that all components, pages, and modules use semantic CSS variable tokens instead of hardcoded colors. According to [STYLES.md](./STYLES.md) § Dark Mode Support, ensure compatibility with light, dark, and system themes. **PROHIBITED:** Hardcoded colors (`bg-white`, `bg-gray-100`, `text-gray-900`, `text-black`, hex colors like `#ffffff`), standalone `dark:` utility classes for basic colors. **REQUIRED:** Semantic color tokens (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `text-muted-foreground`, `bg-muted`, `border`), always pair backgrounds with foregrounds (`bg-card text-card-foreground`). **EXCEPTION:** Print views (`app/print/`) can use custom styling for PDF generation. Check all view pages, module components, and UI elements for compliance.

## Component Documentation

- [ ] **All components are documented in COMPONENT_REGISTRY.md** - Verify that all reusable components in `src/components/` are documented in [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md). Each component should have: component name, file path, purpose description, key features (if applicable), props documentation, and usage examples. **REQUIRED:** Compare the list of files in `src/components/` (using `ls src/components/*.tsx` and checking subdirectories) against the documented components in COMPONENT_REGISTRY.md. Any missing components should be added with complete documentation including props, purpose, and usage examples. **EXCEPTION:** Internal/private components that are only used within a single component file do not need documentation. See COMPONENT_REGISTRY.md for examples of proper component documentation format.

## Code Quality

- [ ] **Check for unused imports** - Verify that all imports are being used and delete any unused imports. Run the linter to identify unused imports automatically. 



