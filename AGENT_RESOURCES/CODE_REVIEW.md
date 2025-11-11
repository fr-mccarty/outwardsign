# Code Review Checklist

This document contains a checklist of items to verify during code review. Use this with an AI agent to ensure code quality and consistency across the project.

## Form Components

- [ ] **All form inputs use FormField component** - Verify that all Input, Select, and Textarea components in forms are wrapped with the FormField component. Direct usage of these components without FormField wrapper is prohibited except in picker components or explicitly approved special cases.

- [ ] **No extra styling on form inputs** - Verify that form inputs (Input, Textarea, Select) do NOT have prohibited styling applied. According to [FORMS.md](./FORMS.md) § Form Input Styling, form inputs must use default shadcn/ui styling. **PROHIBITED:** font-family modifications (`font-mono`, `font-serif`, `font-sans`), font styles (`italic`), font weights (`font-bold`, `font-semibold`), border customizations (`border-*`, `rounded-*`), background changes (`bg-*`). **ALLOWED:** Text sizes (`text-sm`, `text-lg`), layout classes (`w-full`, `min-h-*`, padding, margin). Check all Input, Textarea, and Select components for compliance.

## Dark Mode Support

- [ ] **All elements use CSS variables for colors** - Verify that all components, pages, and modules use semantic CSS variable tokens instead of hardcoded colors. According to [STYLES.md](./STYLES.md) § Dark Mode Support, ensure compatibility with light, dark, and system themes. **PROHIBITED:** Hardcoded colors (`bg-white`, `bg-gray-100`, `text-gray-900`, `text-black`, hex colors like `#ffffff`), standalone `dark:` utility classes for basic colors. **REQUIRED:** Semantic color tokens (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `text-muted-foreground`, `bg-muted`, `border`), always pair backgrounds with foregrounds (`bg-card text-card-foreground`). **EXCEPTION:** Print views (`app/print/`) can use custom styling for PDF generation. Check all view pages, module components, and UI elements for compliance.

