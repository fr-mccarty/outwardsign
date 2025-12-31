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
| `bg-destructive` / `text-destructive-foreground` | Delete/error actions |
| `bg-warning` / `text-warning` | Warning messages |
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

### 5. Colors Reserved for Specific Uses (REQUIRED)

**Colors should ONLY be used for:**
1. **Liturgical Colors** - Green, White, Red, Purple, Rose, Black for liturgical seasons/occasions
2. **Status Indicators** - Success (green), Error (red/destructive), Warning states

**NEVER use colors for:**
- Decorative icons
- Visual differentiation of UI elements
- "Making things look nice"

❌ **WRONG:**
```tsx
<Users className="h-5 w-5 text-blue-500" />
<Home className="h-5 w-5 text-green-500" />
<Church className="h-5 w-5 text-purple-500" />
```

✅ **CORRECT:**
```tsx
<Users className="h-5 w-5 text-muted-foreground" />
<Home className="h-5 w-5 text-muted-foreground" />
<Church className="h-5 w-5 text-muted-foreground" />

// Status feedback (use semantic tokens)
<CheckCircle className="h-5 w-5 text-green-600" /> // Success status
<AlertCircle className="h-5 w-5 text-destructive" /> // Error status
<AlertTriangle className="h-5 w-5 text-warning" /> // Warning status
```

### 6. Font Family (FORBIDDEN)
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
