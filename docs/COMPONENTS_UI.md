# UI Components (shadcn/ui)

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document provides a quick reference to shadcn/ui components used in the application.

---

## shadcn/ui Components

**🔴 CRITICAL:** Components in `src/components/ui/` are from shadcn/ui and should **NEVER be edited directly** unless adding a new component from the shadcn/ui library.

**Location:** `src/components/ui/`

**Documentation:** https://ui.shadcn.com

###Key shadcn/ui Components Used

**Layout & Structure:**
- `card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `dialog.tsx` - Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
- `popover.tsx` - Popover, PopoverTrigger, PopoverContent
- `dropdown-menu.tsx` - DropdownMenu, DropdownMenuItem, DropdownMenuContent
- `separator.tsx` - Separator
- `scroll-area.tsx` - ScrollArea
- `sheet.tsx` - Sheet (side drawer)
- `tabs.tsx` - Tabs, TabsList, TabsTrigger, TabsContent
- `collapsible.tsx` - Collapsible, CollapsibleTrigger, CollapsibleContent

**Form Elements:**
- `form.tsx` - Form context wrapper (React Hook Form integration)
- `label.tsx` - Label
- `input.tsx` - Input
- `textarea.tsx` - Textarea
- `select.tsx` - Select, SelectTrigger, SelectValue, SelectContent, SelectItem
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - RadioGroup, RadioGroupItem
- `switch.tsx` - Switch
- `slider.tsx` - Slider
- `calendar.tsx` - Calendar component

**Feedback:**
- `badge.tsx` - Badge
- `alert.tsx` - Alert, AlertDescription
- `toast.tsx` - Toast notification system (use via `useToast` hook)
- `progress.tsx` - Progress bar
- `skeleton.tsx` - Loading skeleton
- `avatar.tsx` - Avatar, AvatarImage, AvatarFallback

**Navigation:**
- `button.tsx` - Button
- `pagination.tsx` - Pagination controls
- `breadcrumb.tsx` - Breadcrumb navigation
- `command.tsx` - Command palette/menu

**Data Display:**
- `table.tsx` - Table, TableHeader, TableBody, TableRow, TableCell
- `tooltip.tsx` - Tooltip
- `hover-card.tsx` - HoverCard
- `accordion.tsx` - Accordion, AccordionItem, AccordionTrigger, AccordionContent

### Using shadcn/ui Components

**Installation:**
```bash
npx shadcn-ui@latest add [component-name]
```

**Import:**
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

**Customization:**
- Global theme customization: `tailwind.config.ts`
- Color scheme: `app/globals.css`
- Do NOT edit component files in `src/components/ui/`

### Custom Wrappers

If you need to customize a shadcn/ui component:
1. Create a **wrapper component** outside of `src/components/ui/`
2. Import and wrap the shadcn component
3. Add your custom logic/styling in the wrapper

Example:
```tsx
// src/components/custom-button.tsx
import { Button } from '@/components/ui/button'

export function CustomButton({ children, ...props }) {
  return (
    <Button {...props} className="your-custom-classes">
      {children}
    </Button>
  )
}
```

---

## See Also

- **shadcn/ui Documentation:** https://ui.shadcn.com
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index
- **[STYLES.md](./STYLES.md)** - Styling guidelines and dark mode support

---
