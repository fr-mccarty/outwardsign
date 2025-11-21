# Outward Sign Style Guide

> **Purpose:** Detailed styling patterns and implementation examples for specific contexts.
> **General Principles:** See [CLAUDE.md](./CLAUDE.md) § Styling for high-level guidelines.

---

## Table of Contents

- [Homepage Styling](#homepage-styling)
- [Module Styling](#module-styling)
- [Card Styling](#card-styling)
- [Button Styling](#button-styling)
- [Typography Patterns](#typography-patterns)
- [Color Token Reference](#color-token-reference)
- [Common Mistakes](#common-mistakes)

---

## Homepage Styling

The homepage (`src/app/page.tsx`) demonstrates key patterns for public-facing pages.

### Navigation Bar

```tsx
<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Navigation content */}
  </div>
</nav>
```

**Key Features:**
- `border-b` - Bottom border using semantic token
- `bg-background/95` - Semi-transparent background
- `backdrop-blur` - Glass effect
- `sticky top-0 z-50` - Sticky positioning

### Hero Section

```tsx
<div className="text-center space-y-8 py-12 md:py-20">
  <div className="flex justify-center gap-3 mb-6 flex-wrap">
    <Badge variant="secondary" className="px-4 py-2 text-sm">
      <Church className="h-4 w-4 mr-2" />
      For Catholic Parishes
    </Badge>
  </div>

  <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
    {title}
    <span className="text-primary block mt-2">{titleHighlight}</span>
  </h1>

  <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
    {subtitle}
  </p>
</div>
```

**Pattern Notes:**
- Responsive text sizes: `text-4xl md:text-6xl`
- Brand color on highlight: `text-primary`
- Secondary text: `text-muted-foreground`
- Responsive padding: `py-12 md:py-20`

### Feature Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Church className="h-6 w-6 text-primary" />
        </div>
        Feature Title
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-4">
        Description text
      </p>
      <ul className="text-sm space-y-2 text-muted-foreground">
        {features.map((feature) => (
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
</div>
```

**Pattern Notes:**
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Icon container: `bg-primary/10` (10% opacity background)
- Hover effects: `hover:shadow-lg hover:border-primary/20`
- List items with icon: `flex items-start gap-2`

### Sacrament Showcase Cards

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
  <Card className="bg-card text-card-foreground text-center hover:shadow-lg transition-all hover:border-primary/20 border">
    <CardContent className="pt-8 pb-8">
      <VenusAndMars className="h-12 w-12 text-primary mx-auto mb-4" />
      <h3 className="font-semibold text-lg mb-2">Weddings</h3>
      <p className="text-sm text-muted-foreground">
        Description
      </p>
    </CardContent>
  </Card>
</div>
```

**Pattern Notes:**
- 5-column grid on large screens: `lg:grid-cols-5`
- Centered content: `text-center`
- Large icons: `h-12 w-12`
- Vertical spacing: `pt-8 pb-8`

### Callout Banner

```tsx
<Card className="border-2 border-primary/20 bg-primary/5">
  <CardContent className="p-8">
    <p className="text-lg text-muted-foreground leading-relaxed">
      <span className="font-semibold text-foreground">Bold statement.</span>
      {" "}Supporting text.
    </p>
  </CardContent>
</Card>
```

**Pattern Notes:**
- Emphasized border: `border-2 border-primary/20`
- Subtle background tint: `bg-primary/5`
- Mixed text weights: `font-semibold text-foreground` + `text-muted-foreground`

### Gradient Background Section

```tsx
<div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border-2 border-primary/20">
  <div className="max-w-4xl mx-auto text-center space-y-4">
    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
      Title
    </h3>
    <p className="text-lg text-muted-foreground leading-relaxed">
      Description
    </p>
  </div>
</div>
```

**Pattern Notes:**
- Gradient: `from-primary/10 via-primary/5 to-primary/10`
- Large border radius: `rounded-2xl`
- Generous padding: `p-8`

### CTA Card (Final Call-to-Action)

```tsx
<Card className="bg-card text-card-foreground border-2 border-primary/20 rounded-2xl p-12 md:p-16 text-center space-y-8">
  <div className="space-y-4">
    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
      Beautiful Celebrations Are Evangelization
    </h2>
    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
      Subtitle text
    </p>
  </div>

  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Button asChild size="lg" className="text-lg px-8 h-12">
      <Link href="/signup">Primary Action</Link>
    </Button>
    <Button asChild size="lg" variant="outline" className="text-lg px-8 h-12">
      <Link href="/login">Secondary Action</Link>
    </Button>
  </div>
</Card>
```

**Pattern Notes:**
- Large padding: `p-12 md:p-16`
- Responsive button layout: `flex-col sm:flex-row`
- Large buttons: `size="lg" className="text-lg px-8 h-12"`

---

## Module Styling

Styling patterns for CRUD modules (weddings, funerals, presentations, etc.).

### List Page Layout

```tsx
<PageContainer
  title="Weddings"
  description="Manage wedding celebrations"
  maxWidth="7xl"
>
  {/* Search/Filter Card */}
  <Card className="bg-card text-card-foreground border mb-6">
    <CardContent className="pt-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Search..." />
        <Select>...</Select>
      </div>
    </CardContent>
  </Card>

  {/* Results Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Entity cards */}
  </div>
</PageContainer>
```

**Pattern Notes:**
- PageContainer with maxWidth
- Search/filter in separate card
- Responsive grid for results

### Entity Card (List Item)

```tsx
<Link href={`/weddings/${wedding.id}`}>
  <Card className="bg-card text-card-foreground border hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <VenusAndMars className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{name}</CardTitle>
        </div>
        <Badge variant="secondary">{status}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{date}</p>
        <p>{location}</p>
      </div>
    </CardContent>
  </Card>
</Link>
```

**Pattern Notes:**
- Entire card is clickable (wrapped in Link)
- `cursor-pointer` for UX clarity
- Status badge in header
- Module icon: `text-primary`
- Details: `text-sm text-muted-foreground`

### Form Layout

```tsx
<PageContainer title="Edit Wedding" maxWidth="4xl">
  <Card className="bg-card text-card-foreground border">
    <CardContent className="pt-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" className="w-full" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t border-border">
          <CancelButton />
          <SaveButton loading={isLoading} />
        </div>
      </form>
    </CardContent>
  </Card>
</PageContainer>
```

**Pattern Notes:**
- Narrower maxWidth for forms: `4xl`
- Form spacing: `space-y-6`
- Field spacing: `space-y-4`
- Buttons at bottom: `justify-end pt-6 border-t`

### View Page with Side Panel

```tsx
<PageContainer title="Wedding Details" maxWidth="7xl">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Side panel */}
    <div className="lg:col-span-1">
      <Card className="bg-card text-card-foreground border sticky top-4">
        <CardContent className="pt-6">
          {/* Actions, metadata */}
        </CardContent>
      </Card>
    </div>

    {/* Main content */}
    <div className="lg:col-span-3">
      <Card className="bg-card text-card-foreground border">
        <CardContent className="pt-6">
          {/* Liturgy content */}
        </CardContent>
      </Card>
    </div>
  </div>
</PageContainer>
```

**Pattern Notes:**
- 4-column grid: `grid-cols-1 lg:grid-cols-4`
- Sticky sidebar: `sticky top-4`
- 1:3 ratio: `lg:col-span-1` and `lg:col-span-3`

### Empty State

```tsx
<Card className="bg-card text-card-foreground border">
  <CardContent className="pt-12 pb-12 text-center">
    <VenusAndMars className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No weddings yet</h3>
    <p className="text-muted-foreground mb-6">
      Get started by creating your first wedding.
    </p>
    <Button asChild>
      <Link href="/weddings/create">
        <Plus className="h-4 w-4 mr-2" />
        Create Wedding
      </Link>
    </Button>
  </CardContent>
</Card>
```

**Pattern Notes:**
- Vertical spacing: `pt-12 pb-12`
- Large muted icon: `h-12 w-12 text-muted-foreground`
- Clear hierarchy: heading → description → action

---

## Card Styling

### Standard Card (Default)

**Use this for most cards:**

```tsx
<Card className="bg-card text-card-foreground border">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Content</p>
  </CardContent>
</Card>
```

**Required classes:**
- `bg-card text-card-foreground` - ALWAYS required for dark mode
- `border` - Standard border (not `border-2`)

### Interactive Card (Clickable/Hoverable)

```tsx
<Card className="bg-card text-card-foreground border hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer">
  {/* Content */}
</Card>
```

**Added classes:**
- `hover:shadow-lg` - Shadow on hover
- `hover:border-primary/20` - Subtle border color change
- `transition-all` - Smooth transitions
- `cursor-pointer` - Indicate clickability

### Emphasized Card

```tsx
<Card className="bg-card text-card-foreground border-2 border-primary/20">
  {/* Content */}
</Card>
```

**Changed classes:**
- `border-2` instead of `border` - Thicker border
- `border-primary/20` - Brand color tint

### Card with Icon Header

```tsx
<Card className="bg-card text-card-foreground border">
  <CardHeader>
    <CardTitle className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      Title Text
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Pattern:**
- Icon container: `p-2 bg-primary/10 rounded-lg`
- Icon size: `h-6 w-6 text-primary`
- Gap between icon and text: `gap-3`

### Card Content Hierarchy

```tsx
<Card className="bg-card text-card-foreground border">
  <CardHeader>
    {/* Title inherits card foreground */}
    <CardTitle>Main Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Primary text */}
    <p className="text-foreground font-medium mb-2">
      Important information
    </p>

    {/* Secondary text */}
    <p className="text-muted-foreground text-sm mb-4">
      Supporting details
    </p>

    {/* List items */}
    <ul className="space-y-2">
      <li className="flex items-start gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <span>List item</span>
      </li>
    </ul>
  </CardContent>
</Card>
```

### Common Card Mistakes

#### ❌ Missing Background/Foreground
```tsx
// WRONG - Card will be white in dark mode
<Card className="border-2">
```

#### ❌ Using border-2 by Default
```tsx
// WRONG - Too heavy for standard cards
<Card className="bg-card text-card-foreground border-2">
```

#### ❌ Hardcoded Colors
```tsx
// WRONG - Breaks dark mode
<Card className="bg-white text-black">
```

#### ✅ Correct Pattern
```tsx
// CORRECT - Standard card
<Card className="bg-card text-card-foreground border">

// CORRECT - Emphasized card
<Card className="bg-card text-card-foreground border-2 border-primary/20">
```

---

## Button Styling

### Button Variants

```tsx
// Primary (default)
<Button>Submit</Button>
<Button variant="default">Submit</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Outline
<Button variant="outline">Learn More</Button>

// Ghost (minimal)
<Button variant="ghost">Skip</Button>

// Destructive
<Button variant="destructive">Delete</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>      // h-9 (36px)
<Button size="default">Default</Button> // h-10 (40px)
<Button size="lg">Large</Button>      // h-11 (44px)

// Custom large button (e.g., homepage CTA)
<Button size="lg" className="text-lg px-8 h-12">
  Get Started
</Button>
```

### Buttons with Icons

```tsx
// Icon before text
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

// Icon after text
<Button>
  Learn More
  <ArrowRight className="h-4 w-4 ml-2" />
</Button>

// Icon only
<Button size="sm" variant="ghost">
  <X className="h-4 w-4" />
</Button>
```

**Icon sizing:**
- Small buttons: `h-3 w-3` or `h-4 w-4`
- Default buttons: `h-4 w-4` or `h-5 w-5`
- Large buttons: `h-5 w-5`

### Button Groups

```tsx
// Horizontal button group
<div className="flex gap-3 justify-end">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>

// Vertical button stack
<div className="flex flex-col gap-2">
  <Button className="w-full">Option 1</Button>
  <Button className="w-full" variant="outline">Option 2</Button>
</div>
```

### Button States

```tsx
// Loading state (use SaveButton component)
<SaveButton loading={isLoading} />

// Disabled state
<Button disabled>Submit</Button>

// Custom disabled appearance
<Button disabled className="opacity-50 cursor-not-allowed">
  Submit
</Button>
```

### Link Buttons

```tsx
<Button asChild>
  <Link href="/weddings/create">Create Wedding</Link>
</Button>

// Variant with icon
<Button asChild variant="outline">
  <Link href="/help">
    <HelpCircle className="h-4 w-4 mr-2" />
    Help
  </Link>
</Button>
```

### Button Best Practices

✅ **Do:**
- Use `variant` prop for different styles
- Use `size` prop for sizing
- Let icons inherit button text color
- Use `asChild` with Link components
- Use semantic button text ("Save Wedding" not just "Save")

❌ **Don't:**
- Manually style buttons with Tailwind classes
- Use hardcoded icon colors in buttons
- Create custom button components (use variants instead)
- Use `<a>` tags styled as buttons

---

## Typography Patterns

### Heading Hierarchy

```tsx
// Page title (hero)
<h1 className="text-4xl md:text-6xl font-bold tracking-tight">

// Section heading
<h2 className="text-3xl md:text-4xl font-bold">

// Subsection heading
<h3 className="text-2xl md:text-3xl font-bold">

// Card title
<h3 className="text-xl font-semibold">

// Small heading
<h4 className="text-lg font-semibold">
```

### Body Text

```tsx
// Large body text (hero subtitle)
<p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">

// Standard body text
<p className="text-base text-foreground">

// Secondary text
<p className="text-sm text-muted-foreground">

// Fine print
<p className="text-xs text-muted-foreground">
```

### Text Colors

```tsx
// Primary content
<p className="text-foreground">Main content</p>

// Secondary/helper content
<p className="text-muted-foreground">Supporting text</p>

// Brand/accent
<span className="text-primary">Highlighted</span>

// Error/destructive
<span className="text-destructive">Error message</span>
```

### Text Styling

```tsx
// Bold
<span className="font-semibold">Important</span>
<span className="font-bold">Very Important</span>

// Italic
<em className="italic">Emphasized</em>

// Leading (line height)
<p className="leading-relaxed">  // 1.625
<p className="leading-loose">    // 2

// Truncation
<p className="line-clamp-1">Single line with ellipsis</p>
<p className="line-clamp-2">Two lines with ellipsis</p>
<p className="truncate">Truncate long text...</p>

// 🔴 Truncating titles in flex containers (e.g., card headers)
// Use flex-1 overflow-hidden on the container + line-clamp-1 on the title
<div className="flex items-start justify-between gap-2">
  <div className="flex-1 overflow-hidden">
    <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
  </div>
  <Button>Action</Button>
</div>
```

---

## Color Token Reference

### Background/Foreground Pairs

| Background | Foreground | Usage |
|------------|------------|-------|
| `bg-background` | `text-foreground` | Page backgrounds, primary text |
| `bg-card` | `text-card-foreground` | Card components |
| `bg-popover` | `text-popover-foreground` | Popovers, dropdowns |
| `bg-primary` | `text-primary-foreground` | Primary buttons only |
| `bg-secondary` | `text-secondary-foreground` | Secondary buttons |
| `bg-muted` | `text-muted-foreground` | Muted backgrounds |
| `bg-accent` | `text-accent-foreground` | Hover states |
| `bg-destructive` | `text-destructive-foreground` | Delete buttons |

### Standalone Text Colors

These work on any background:

- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `text-primary` - Brand color (icons, accents)
- `text-destructive` - Errors, liturgical red

### Border Colors

- `border-border` - Standard borders
- `border-input` - Input borders
- `border-primary/20` - Brand-tinted borders (20% opacity)

### Focus Rings

- `ring-ring` - Focus ring color
- `focus-visible:ring-2 focus-visible:ring-ring` - Standard focus style

---

## Common Mistakes

### 1. Card Without Background/Foreground

**Problem:** White cards in dark mode.

```tsx
// ❌ WRONG
<Card className="border">

// ✅ CORRECT
<Card className="bg-card text-card-foreground border">
```

### 2. Hardcoded Colors

**Problem:** Colors don't adapt to theme.

```tsx
// ❌ WRONG
<div className="bg-white text-gray-900">
<p style={{ color: '#c41e3a' }}>Red text</p>

// ✅ CORRECT
<div className="bg-background text-foreground">
<p className="text-destructive">Red text</p>
```

### 3. Using Primary Background for Large Sections

**Problem:** Large colored sections are overwhelming and hard to read in dark mode.

```tsx
// ❌ WRONG
<div className="bg-primary text-primary-foreground p-12">
  <h2>Large CTA Section</h2>
  <p>Long description...</p>
</div>

// ✅ CORRECT
<Card className="bg-card text-card-foreground border-2 border-primary/20 p-12">
  <h2 className="text-foreground">Large CTA Section</h2>
  <p className="text-muted-foreground">Long description...</p>
</Card>
```

### 4. Overusing border-2

**Problem:** Too much visual weight everywhere.

```tsx
// ❌ WRONG - Don't use border-2 for everything
<Card className="bg-card text-card-foreground border-2">

// ✅ CORRECT - Use border for standard cards
<Card className="bg-card text-card-foreground border">

// ✅ CORRECT - Use border-2 only for emphasis
<Card className="bg-card text-card-foreground border-2 border-primary/20">
```

### 5. Manual Button Styling

**Problem:** Inconsistent button appearance, broken dark mode.

```tsx
// ❌ WRONG
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click Me
</button>

// ✅ CORRECT
<Button>Click Me</Button>
<Button variant="outline">Click Me</Button>
```

### 6. Icon Colors in Buttons

**Problem:** Unnecessary, can break with theme changes.

```tsx
// ❌ WRONG - Don't manually color icons in buttons
<Button>
  <Plus className="h-4 w-4 mr-2 text-white" />
  Add
</Button>

// ✅ CORRECT - Icons inherit button color
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add
</Button>
```

---

## Quick Checklist

Before committing any UI component, verify:

- [ ] **Cards:** Uses `bg-card text-card-foreground border`
- [ ] **Buttons:** Uses variant props, not manual styling
- [ ] **Text:** Uses semantic color tokens
- [ ] **Borders:** Uses `border` by default, `border-2` only for emphasis
- [ ] **Icons:** No hardcoded colors, uses `text-primary` or inherits
- [ ] **Colors:** Zero hardcoded hex/RGB/gray values
- [ ] **Spacing:** Uses consistent Tailwind spacing utilities
- [ ] **Responsive:** Uses responsive breakpoints (`sm:`, `md:`, `lg:`)

---

## Testing Checklist

Test all new components in both themes:

1. Toggle to dark mode via theme switcher
2. Verify cards have visible backgrounds and readable text
3. Check borders are visible in both modes
4. Ensure buttons maintain proper contrast
5. Verify icons and accents are appropriately colored
6. Test hover and focus states

---

## Related Documentation

- **[CLAUDE.md](./CLAUDE.md) § Styling** - General principles and form input rules
- **Tailwind CSS** - https://tailwindcss.com/docs
- **shadcn/ui** - https://ui.shadcn.com
- **Lucide Icons** - https://lucide.dev
