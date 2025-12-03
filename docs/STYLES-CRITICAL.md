# STYLES - Critical Rules Only

> **Auto-injected for styling tasks. For complete details, see [STYLES.md](./STYLES.md)**

## Non-Negotiable Rules

### 1. Dark Mode Support (REQUIRED)
**NEVER use hardcoded colors:**

❌ **WRONG:**
```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
```

✅ **CORRECT:**
```tsx
<div className="bg-background text-foreground">
```

### 2. Semantic Color Tokens (REQUIRED)

**Always pair backgrounds with foregrounds:**

```tsx
// Cards
<Card className="bg-card text-card-foreground">

// Muted sections
<div className="bg-muted text-muted-foreground">

// Primary buttons
<Button className="bg-primary text-primary-foreground">

// Backgrounds
<div className="bg-background text-foreground">
```

### 3. Common Semantic Tokens

| Token | Use Case |
|-------|----------|
| `bg-background` / `text-foreground` | Page backgrounds |
| `bg-card` / `text-card-foreground` | Card components |
| `bg-muted` / `text-muted-foreground` | Secondary sections |
| `bg-primary` / `text-primary-foreground` | Primary actions |
| `bg-destructive` / `text-destructive-foreground` | Delete actions |
| `border` | All borders |

### 4. NEVER Use dark: Utilities (FORBIDDEN)
CSS variables handle dark mode automatically.

❌ **WRONG:**
```tsx
className="text-gray-900 dark:text-gray-100"
```

✅ **CORRECT:**
```tsx
className="text-foreground"
```

### 5. Font Family (FORBIDDEN)
**NEVER modify font-family** except in print views (`app/print/`).

System font stack is used everywhere:
- No custom fonts in UI
- Exception: Print/PDF views only

## Print Views Exception
Files in `app/print/` can use custom styling for PDF generation.
These views are not interactive.

## Reference
- Complete token reference: [STYLES.md](./STYLES.md)
- Print styling guide: [STYLES.md](./STYLES.md#print-views)
- Dark mode details: [STYLES.md](./STYLES.md#dark-mode)
