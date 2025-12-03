# ACCESSIBILITY.md

**Accessibility Standards and Guidelines for Outward Sign**

This document defines the accessibility requirements for the Outward Sign application. All features must be usable by people with disabilities, including those who use screen readers, keyboard-only navigation, or other assistive technologies.

---

## Table of Contents

- [Why Accessibility Matters](#why-accessibility-matters)
- [Compliance Standards](#compliance-standards)
- [Quick Checklist](#quick-checklist)
- [Core Principles](#core-principles)
- [Semantic HTML](#semantic-html)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Readers](#screen-readers)
- [Color and Contrast](#color-and-contrast)
- [Forms and Inputs](#forms-and-inputs)
- [Interactive Components](#interactive-components)
- [Common Patterns](#common-patterns)
- [Testing Accessibility](#testing-accessibility)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)
- [Tools and Resources](#tools-and-resources)

---

## Why Accessibility Matters

**For Outward Sign users:**
- Parish staff may have visual, motor, or cognitive disabilities
- Aging priests and deacons may need assistive technologies
- Accessibility features benefit everyone (keyboard shortcuts, clear labels, good contrast)

**For the project:**
- Legal requirement (Section 508, ADA compliance for public-facing sites)
- Better UX for all users
- Improved testability (semantic HTML helps automated tests)
- SEO benefits (search engines rely on semantic structure)

---

## Compliance Standards

**Target:** WCAG 2.1 Level AA compliance

**What this means:**
- All functionality available via keyboard
- Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Clear labels for all form inputs
- Alternative text for images
- Proper heading hierarchy
- No time-based requirements without user control

**Reference:** [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Quick Checklist

Use this checklist when implementing any feature:

### Semantic HTML
- [ ] Use correct HTML elements (`<button>`, `<nav>`, `<main>`, `<article>`)
- [ ] Headings follow logical hierarchy (H1 → H2 → H3, no skipping levels)
- [ ] Lists use `<ul>`, `<ol>`, `<li>` (not `<div>` with bullets)
- [ ] Tables use `<table>`, `<thead>`, `<tbody>`, `<th>` for data tables

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab key
- [ ] Logical tab order (matches visual layout)
- [ ] Visible focus indicators on all interactive elements
- [ ] Escape key closes dialogs/modals
- [ ] Arrow keys work in menus/dropdowns

### Screen Readers
- [ ] All images have `alt` text (or `alt=""` if decorative)
- [ ] Icon-only buttons have `aria-label`
- [ ] Form errors announced to screen readers
- [ ] Dynamic content changes announced (use `aria-live` regions)
- [ ] Skip links provided for keyboard users

### Labels and Text
- [ ] All form inputs have associated `<Label>` with `htmlFor`
- [ ] Button text is descriptive (not just "Click here" or "Submit")
- [ ] Link text describes destination (not just "Read more")
- [ ] Error messages are clear and actionable

### Color and Contrast
- [ ] Text meets 4.5:1 contrast ratio (normal text)
- [ ] Large text meets 3:1 contrast ratio
- [ ] Information not conveyed by color alone
- [ ] Focus indicators meet 3:1 contrast ratio

---

## Core Principles

### 1. Perceivable
**Users must be able to perceive the content.**

- Provide text alternatives for non-text content
- Provide captions for audio/video
- Make content adaptable (responsive design)
- Use sufficient color contrast

### 2. Operable
**Users must be able to operate the interface.**

- All functionality available via keyboard
- Users have enough time to read and use content
- Don't design content that could cause seizures (no rapid flashing)
- Provide ways to navigate and find content

### 3. Understandable
**Users must be able to understand the content and interface.**

- Text is readable and understandable
- Content appears and operates in predictable ways
- Help users avoid and correct mistakes

### 4. Robust
**Content must be robust enough for assistive technologies.**

- Maximize compatibility with current and future tools
- Use valid, semantic HTML
- Provide name, role, value for all UI components

---

## Semantic HTML

**Rule:** Always use the correct HTML element for the job.

### ✅ DO: Use Semantic Elements

```tsx
// Buttons for actions
<button onClick={handleSave}>Save Wedding</button>

// Links for navigation
<a href="/weddings">View all weddings</a>

// Navigation landmarks
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/weddings">Weddings</a></li>
    <li><a href="/funerals">Funerals</a></li>
  </ul>
</nav>

// Main content area
<main>
  <h1>Weddings</h1>
  {/* Page content */}
</main>

// Complementary content
<aside>
  <h2>Quick Actions</h2>
  {/* Sidebar content */}
</aside>
```

### ❌ DON'T: Use Generic Elements

```tsx
// ❌ Don't use div as button
<div onClick={handleSave}>Save</div>

// ❌ Don't use span as link
<span onClick={() => router.push('/weddings')}>View all</span>

// ❌ Don't use div for navigation
<div className="nav">
  <div onClick={goToWeddings}>Weddings</div>
</div>
```

**Why it matters:**
- Screen readers announce element roles ("button", "link", "navigation")
- Keyboard users can't focus non-interactive elements
- Browsers provide default keyboard behavior for semantic elements

### Heading Hierarchy

**Rule:** Use headings in logical order (H1 → H2 → H3), never skip levels.

```tsx
// ✅ CORRECT - Logical hierarchy
<h1>Weddings</h1>
  <h2>Upcoming Weddings</h2>
    <h3>This Month</h3>
  <h2>Past Weddings</h2>

// ❌ WRONG - Skipped from H1 to H3
<h1>Weddings</h1>
  <h3>Upcoming Weddings</h3> {/* Skipped H2 */}
```

**Why it matters:**
- Screen reader users navigate by headings
- Headings provide document outline
- Skipped levels confuse navigation

---

## Keyboard Navigation

**Rule:** All functionality must be available via keyboard.

### Tab Order

**The Tab key should move focus in a logical order:**
1. Main navigation
2. Page content (top to bottom, left to right)
3. Sidebar/secondary content
4. Footer

```tsx
// ✅ Natural tab order (no tabIndex needed)
<form>
  <input name="bride_name" />
  <input name="groom_name" />
  <button type="submit">Save</button>
</form>

// ❌ Don't use positive tabIndex values
<input tabIndex={3} /> {/* Anti-pattern */}
<input tabIndex={1} /> {/* Anti-pattern */}
<input tabIndex={2} /> {/* Anti-pattern */}
```

**Only use `tabIndex` for:**
- `tabIndex={0}` - Make non-interactive element focusable
- `tabIndex={-1}` - Programmatically focus (modals, skip links)

### Focus Indicators

**Rule:** All interactive elements must have visible focus indicators.

**Good news:** Our Tailwind + shadcn/ui setup provides default focus rings automatically.

```tsx
// ✅ Default focus ring works automatically
<Button>Save</Button> // Blue focus ring appears on Tab

// ✅ Custom focus for special cases
<div
  tabIndex={0}
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
  Custom focusable element
</div>
```

**Never do this:**
```css
/* ❌ NEVER remove focus styles globally */
*:focus {
  outline: none;
}
```

### Keyboard Shortcuts

**Common keyboard patterns users expect:**

| Element | Expected Behavior |
|---------|-------------------|
| Dialog/Modal | `Escape` closes, focus trapped inside |
| Dropdown Menu | `Arrow keys` navigate, `Escape` closes |
| Form | `Enter` submits (inside input), `Tab` moves between fields |
| Tabs | `Arrow keys` switch tabs, `Tab` moves to tab panel |
| Lists | `Arrow keys` navigate items |

**Example: Dialog keyboard trap**
```tsx
// shadcn Dialog component handles this automatically
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* Focus trapped here, Escape closes */}
    <DialogTitle>Delete Wedding?</DialogTitle>
    <DialogDescription>This cannot be undone.</DialogDescription>
  </DialogContent>
</Dialog>
```

---

## Screen Readers

**Rule:** All content and functionality must be perceivable to screen reader users.

### Alternative Text for Images

```tsx
// ✅ Meaningful alt text
<img src="/priest.jpg" alt="Father John celebrating Mass" />

// ✅ Empty alt for decorative images
<img src="/decorative-border.png" alt="" />

// ❌ Missing alt
<img src="/priest.jpg" /> {/* Screen reader says "image" */}

// ❌ Redundant alt
<img src="/icon-wedding.png" alt="Wedding icon image" />
// Better:
<img src="/icon-wedding.png" alt="Wedding" />
```

### Icon-Only Buttons

**Rule:** Buttons with only icons must have `aria-label` or visible text.

```tsx
// ✅ aria-label for icon buttons
<Button aria-label="Delete wedding" variant="ghost" size="icon">
  <TrashIcon />
</Button>

// ✅ Visible text (preferred when possible)
<Button variant="ghost">
  <TrashIcon />
  Delete
</Button>

// ❌ Icon-only with no label
<Button variant="ghost" size="icon">
  <TrashIcon /> {/* Screen reader has no idea what this does */}
</Button>
```

**Common Outward Sign examples:**
- Edit buttons: `aria-label="Edit wedding"`
- Delete buttons: `aria-label="Delete wedding"`
- Close buttons: `aria-label="Close dialog"`
- Search buttons: `aria-label="Search"`

### ARIA Live Regions

**Use for dynamic content updates:**

```tsx
// ✅ Announce form errors
<div role="alert" aria-live="assertive">
  {error && <p>{error}</p>}
</div>

// ✅ Announce status updates
<div aria-live="polite" aria-atomic="true">
  {isLoading ? "Loading weddings..." : `${weddings.length} weddings found`}
</div>
```

**aria-live values:**
- `polite` - Announce after current speech (status updates, search results)
- `assertive` - Announce immediately (errors, urgent alerts)

**When NOT to use:**
- Don't announce every keystroke in a search input
- Don't announce decorative animations
- Don't overuse - causes "announcement fatigue"

### Hidden Content

```tsx
// ✅ Visually hidden but screen reader accessible
<span className="sr-only">Skip to main content</span>

// ✅ Hidden from everyone (including screen readers)
<div aria-hidden="true">
  <DecorativeIcon /> {/* Purely visual */}
</div>

// ❌ Visually hidden with display:none (also hidden from screen readers)
<span style={{ display: 'none' }}>Instructions</span>
```

**Outward Sign has `sr-only` utility class:**
```tsx
<span className="sr-only">Current page: Weddings</span>
```

---

## Color and Contrast

**Rule:** Text must meet minimum contrast ratios against background.

### Contrast Requirements

| Content Type | Ratio | Example |
|--------------|-------|---------|
| Normal text (< 18pt) | 4.5:1 | Black on white = 21:1 ✅ |
| Large text (≥ 18pt) | 3:1 | Gray on white = 3.2:1 ✅ |
| UI components (borders, icons) | 3:1 | Borders, focus rings |

**Good news:** Our theme system with semantic tokens (from STYLES.md) automatically provides good contrast in both light and dark modes.

```tsx
// ✅ Uses semantic tokens (good contrast automatically)
<div className="bg-card text-card-foreground">
  <h2 className="text-foreground">Wedding Details</h2>
  <p className="text-muted-foreground">Additional information</p>
</div>

// ❌ Hardcoded colors (may fail contrast in dark mode)
<div className="bg-white text-gray-400"> {/* 2.8:1 - fails! */}
  Low contrast text
</div>
```

### Color Alone

**Rule:** Don't rely on color alone to convey information.

```tsx
// ❌ Color only
<span className="text-red-500">Error</span>
<span className="text-green-500">Success</span>

// ✅ Color + icon + text
<span className="text-destructive flex items-center gap-2">
  <AlertCircle className="h-4 w-4" />
  Error: Wedding date is required
</span>

<span className="text-green-600 flex items-center gap-2">
  <CheckCircle className="h-4 w-4" />
  Wedding saved successfully
</span>
```

**Status indicators:**
```tsx
// ✅ Use ModuleStatusLabel component (includes icon + text + color)
<ModuleStatusLabel status="confirmed" module="weddings" />
// Renders: [✓ icon] Confirmed [green color]

// ❌ Don't use color-only badges
<Badge className="bg-green-500" /> {/* What does green mean? */}
```

### Testing Contrast

**Tools:**
- Chrome DevTools: Inspect element → Accessibility panel → Contrast
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

---

## Forms and Inputs

**Rule:** All form inputs must have associated labels.

### Labels

**Critical:** Every `<input>`, `<select>`, `<textarea>` needs a `<Label>`.

```tsx
// ✅ CORRECT - Using FormField (handles label automatically)
<FormField
  control={form.control}
  name="bride_name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bride Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
    </FormItem>
  )}
/>

// ✅ CORRECT - Using FormInput (handles label automatically)
<FormInput
  label="Bride Name"
  name="bride_name"
  value={brideName}
  onChange={(e) => setBrideName(e.target.value)}
/>

// ❌ WRONG - Input without label
<input name="bride_name" placeholder="Enter bride name" />
{/* Placeholder is NOT a label! */}
```

**Why placeholders aren't labels:**
- Placeholders disappear when you type
- Screen readers may not announce placeholders
- Low contrast (usually gray)

### Required Fields

```tsx
// ✅ Mark required fields clearly
<FormField
  control={form.control}
  name="bride_name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Bride Name <span className="text-destructive">*</span>
      </FormLabel>
      <FormControl>
        <Input {...field} required aria-required="true" />
      </FormControl>
    </FormItem>
  )}
/>

// ✅ Explain asterisk meaning at form top
<p className="text-sm text-muted-foreground">
  Fields marked with <span className="text-destructive">*</span> are required.
</p>
```

### Error Messages

**Rule:** Error messages must be associated with their inputs.

```tsx
// ✅ FormField handles error association automatically
<FormField
  control={form.control}
  name="bride_name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bride Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Error shown here, aria-describedby set automatically */}
    </FormItem>
  )}
/>

// Screen reader announces: "Bride Name, invalid, Bride name is required"
```

**Error announcement:**
```tsx
// ✅ Announce form errors to screen readers
{Object.keys(errors).length > 0 && (
  <div role="alert" className="text-destructive">
    Please fix {Object.keys(errors).length} error(s) before submitting.
  </div>
)}
```

### Input Types

**Use the correct input type for the data:**

```tsx
// ✅ Correct input types
<Input type="email" /> // Mobile keyboard shows @ key
<Input type="tel" />   // Mobile keyboard shows numbers
<Input type="date" />  // Shows date picker
<Input type="number" /> // Mobile keyboard shows numbers

// ❌ Wrong input type
<Input type="text" /> // For phone number - no mobile optimization
```

---

## Interactive Components

### Buttons vs Links

**Rule:** Use `<button>` for actions, `<a>` for navigation.

```tsx
// ✅ Button for actions (no href)
<Button onClick={handleSave}>Save Wedding</Button>
<Button onClick={handleDelete}>Delete</Button>

// ✅ Link for navigation (has href)
<Link href="/weddings/123">View Wedding Details</Link>
<Link href="/weddings/123/edit">Edit Wedding</Link>

// ❌ Button for navigation (should be link)
<Button onClick={() => router.push('/weddings')}>View Weddings</Button>

// ❌ Link for action (should be button)
<Link onClick={handleDelete}>Delete</Link>
```

**Why it matters:**
- Screen readers announce role ("button" vs "link")
- Users expect different behavior (buttons do things, links go places)
- Right-click → "Open in new tab" only works on links

### Dialogs and Modals

**shadcn Dialog component handles most accessibility automatically:**

```tsx
// ✅ Dialog with proper ARIA labels
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Delete Wedding</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Delete Wedding?</DialogTitle> {/* aria-labelledby */}
    <DialogDescription> {/* aria-describedby */}
      This will permanently delete the wedding for John and Jane.
      This action cannot be undone.
    </DialogDescription>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**What Dialog does automatically:**
- Focus trap (can't Tab outside dialog)
- Escape key closes dialog
- Focus management (returns to trigger on close)
- ARIA attributes (`role="dialog"`, `aria-labelledby`, `aria-describedby`)

### Dropdown Menus

```tsx
// ✅ shadcn DropdownMenu (accessible by default)
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Wedding actions">
      <MoreVertical />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>
      <Trash className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**What DropdownMenu does automatically:**
- Arrow key navigation
- Escape closes menu
- Focus management
- ARIA attributes

### Tables

**Use `<table>` for tabular data, not for layout.**

```tsx
// ✅ Semantic table with headers
<table>
  <thead>
    <tr>
      <th scope="col">Couple</th>
      <th scope="col">Date</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John & Jane</td>
      <td>July 15, 2025</td>
      <td>Confirmed</td>
    </tr>
  </tbody>
</table>
```

**DataTable component:**
The `DataTable` component already implements proper table semantics. No additional work needed.

---

## Common Patterns

### Skip Links

**Allow keyboard users to skip repetitive navigation:**

```tsx
// ✅ Skip link (hidden until focused)
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-primary"
>
  Skip to main content
</a>

{/* ... navigation ... */}

<main id="main-content">
  {/* Page content */}
</main>
```

**When to use:** Every page with navigation header.

### Breadcrumbs

```tsx
// ✅ Breadcrumbs with proper ARIA
<nav aria-label="Breadcrumb">
  <ol className="flex items-center gap-2">
    <li><Link href="/">Home</Link></li>
    <li aria-hidden="true">/</li>
    <li><Link href="/weddings">Weddings</Link></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">John & Jane</li>
  </ol>
</nav>
```

**Good news:** The `BreadcrumbSetter` component handles this automatically.

### Loading States

```tsx
// ✅ Announce loading to screen readers
{isLoading && (
  <div role="status" aria-live="polite">
    <Loader2 className="animate-spin" />
    <span className="sr-only">Loading weddings...</span>
  </div>
)}
```

### Empty States

```tsx
// ✅ Clear empty state with action
<div className="text-center py-12">
  <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-medium">No weddings found</h3>
  <p className="mt-2 text-muted-foreground">
    Get started by creating your first wedding.
  </p>
  <Button className="mt-4" asChild>
    <Link href="/weddings/create">Create Wedding</Link>
  </Button>
</div>
```

---

## Testing Accessibility

### Automated Testing

**1. ESLint Plugin**
```bash
npm install eslint-plugin-jsx-a11y --save-dev
```

Add to `eslint.config.mjs`:
```js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
```

**2. Pa11y (Automated Accessibility Testing)**
```bash
npm install pa11y-ci --save-dev
```

Create `.pa11yci.json`:
```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "runners": ["axe"]
  },
  "urls": [
    "http://localhost:3000/weddings",
    "http://localhost:3000/funerals",
    "http://localhost:3000/baptisms"
  ]
}
```

Add script to `package.json`:
```json
{
  "scripts": {
    "a11y": "pa11y-ci"
  }
}
```

**3. Playwright Accessibility Testing**

Add to existing Playwright tests:
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('weddings page should not have accessibility violations', async ({ page }) => {
  await page.goto('/weddings');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Manual Testing

**1. Keyboard Navigation Test**
- Unplug mouse
- Navigate entire app using only:
  - `Tab` (forward)
  - `Shift+Tab` (backward)
  - `Enter` (activate)
  - `Escape` (close)
  - `Arrow keys` (menus, dropdowns)

**Checklist:**
- [ ] Can reach all interactive elements
- [ ] Tab order is logical
- [ ] Focus indicator always visible
- [ ] Can operate all forms
- [ ] Can close all dialogs

**2. Screen Reader Test**

**macOS (VoiceOver):**
```
CMD + F5 to enable VoiceOver
```

**Windows (NVDA - free):**
Download from https://www.nvaccess.org/

**Basic screen reader test:**
1. Navigate page with Tab key
2. Listen to what's announced
3. Fill out a form
4. Trigger errors, listen to announcements

**Checklist:**
- [ ] All images have meaningful descriptions
- [ ] Form labels are announced
- [ ] Errors are announced
- [ ] Button purposes are clear
- [ ] Headings structure makes sense

**3. Zoom Test**

Browser zoom to 200%:
```
CMD/CTRL + Plus (+)
```

**Checklist:**
- [ ] All content still visible
- [ ] No horizontal scrolling (except data tables)
- [ ] Text doesn't overlap
- [ ] Controls still usable

**4. Color Blindness Test**

**Chrome Extension:** [Colorblinding](https://chrome.google.com/webstore/detail/colorblinding)

**Checklist:**
- [ ] Can distinguish status colors (confirmed, pending, cancelled)
- [ ] Error states visible without color
- [ ] Links distinguishable from text

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Div Soup

```tsx
// ❌ Bad - generic divs for everything
<div className="nav">
  <div onClick={goHome}>Home</div>
  <div onClick={goWeddings}>Weddings</div>
</div>

// ✅ Good - semantic HTML
<nav>
  <Link href="/">Home</Link>
  <Link href="/weddings">Weddings</Link>
</nav>
```

### ❌ Mistake 2: Missing Labels

```tsx
// ❌ Bad - placeholder as label
<input placeholder="Bride name" />

// ✅ Good - proper label
<Label htmlFor="bride-name">Bride Name</Label>
<Input id="bride-name" placeholder="e.g., Mary Smith" />
```

### ❌ Mistake 3: Click Handlers on Non-Interactive Elements

```tsx
// ❌ Bad - div with onClick
<div onClick={handleEdit}>Edit</div>

// ✅ Good - button
<Button onClick={handleEdit}>Edit</Button>
```

### ❌ Mistake 4: Icon-Only Buttons Without Labels

```tsx
// ❌ Bad - no label
<Button size="icon"><TrashIcon /></Button>

// ✅ Good - aria-label
<Button size="icon" aria-label="Delete wedding">
  <TrashIcon />
</Button>
```

### ❌ Mistake 5: Low Contrast Text

```tsx
// ❌ Bad - hardcoded low contrast
<p className="text-gray-400">Important information</p>

// ✅ Good - semantic token with good contrast
<p className="text-muted-foreground">Important information</p>
```

### ❌ Mistake 6: Removing Focus Indicators

```css
/* ❌ NEVER do this */
button:focus {
  outline: none;
}
```

### ❌ Mistake 7: Auto-Playing Media

```tsx
// ❌ Bad - auto-play video
<video autoPlay src="/welcome.mp4" />

// ✅ Good - user controls
<video controls src="/welcome.mp4">
  <track kind="captions" src="/captions.vtt" />
</video>
```

### ❌ Mistake 8: Nested Interactive Elements

```tsx
// ❌ Bad - button inside link
<Link href="/weddings/123">
  <Button>View Details</Button>
</Link>

// ✅ Good - Link styled as button
<Button asChild>
  <Link href="/weddings/123">View Details</Link>
</Button>
```

### ❌ Mistake 9: Missing Page Titles

```tsx
// ❌ Bad - no title
export default function WeddingsPage() {
  return <div>Weddings</div>;
}

// ✅ Good - descriptive title
export const metadata = {
  title: 'Weddings - Outward Sign',
};
```

### ❌ Mistake 10: Time-Based Content

```tsx
// ❌ Bad - toast disappears automatically
toast.success('Wedding saved', { duration: 2000 });
// User may not see it in time!

// ✅ Good - user dismisses manually
toast.success('Wedding saved', {
  duration: Infinity, // Or long duration
  dismissible: true,
});
```

---

## Tools and Resources

### Browser Extensions

- **axe DevTools** - Accessibility testing (Chrome, Firefox)
  https://www.deque.com/axe/devtools/

- **WAVE** - Web accessibility evaluation (Chrome, Firefox)
  https://wave.webaim.org/extension/

- **Lighthouse** - Built into Chrome DevTools
  Run accessibility audit: DevTools → Lighthouse → Accessibility

### Testing Tools

- **Pa11y** - Automated accessibility testing
  https://pa11y.org/

- **axe-core** - Accessibility engine for automated testing
  https://github.com/dequelabs/axe-core

- **@axe-core/playwright** - Axe integration for Playwright
  https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright

### Screen Readers

- **macOS:** VoiceOver (built-in, `CMD+F5`)
- **Windows:** NVDA (free) - https://www.nvaccess.org/
- **Windows:** JAWS (commercial) - https://www.freedomscientific.com/products/software/jaws/
- **Chrome Extension:** ChromeVox - https://chrome.google.com/webstore/detail/chromevox

### Learning Resources

- **WebAIM** - Accessibility guides and resources
  https://webaim.org/

- **MDN Web Accessibility** - Mozilla accessibility docs
  https://developer.mozilla.org/en-US/docs/Web/Accessibility

- **W3C WCAG 2.1** - Official guidelines
  https://www.w3.org/WAI/WCAG21/quickref/

- **A11y Project** - Community-driven accessibility checklist
  https://www.a11yproject.com/

- **Inclusive Components** - Accessible component patterns
  https://inclusive-components.design/

### Color Contrast Tools

- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Coolors Contrast Checker** - https://coolors.co/contrast-checker
- **Who Can Use** - https://www.whocanuse.com/ (shows how colors appear to people with different vision)

---

## Integration with Outward Sign Workflow

### When to Read This Document

**Per CLAUDE.md Documentation Context Rules:**

| Task | Required Reading |
|------|------------------|
| Create or edit interactive components | ACCESSIBILITY.md (this file) |
| Create or edit forms | FORMS.md + ACCESSIBILITY.md |
| Create or edit navigation | ACCESSIBILITY.md |
| Before finishing-agent review | Quick Checklist section |
| Before qa-specialist audit | Full ACCESSIBILITY.md review |

### Agent Responsibilities

**developer-agent:**
- Read ACCESSIBILITY.md before implementing interactive components
- Use semantic HTML by default
- Ensure all forms have proper labels
- Add `aria-label` to icon buttons

**test-writer:**
- Include keyboard navigation tests
- Test with accessibility selectors (role, label)
- Verify focus management

**finishing-agent:**
- Run `npm run lint` (check jsx-a11y rules)
- Verify Quick Checklist items
- Check for common mistakes

**qa-specialist:**
- Run `npm run a11y` (Pa11y CI)
- Run Lighthouse accessibility audit
- Generate comprehensive accessibility report
- Manual keyboard navigation test
- Manual screen reader spot-check

---

## Summary

**Accessibility is not optional.** It's a core requirement for Outward Sign.

**Key Takeaways:**
1. ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`)
2. ✅ All inputs need labels (use FormField/FormInput)
3. ✅ Icon buttons need `aria-label`
4. ✅ Keyboard navigation must work everywhere
5. ✅ Use semantic color tokens (good contrast automatically)
6. ✅ Test with keyboard, screen reader, and automated tools

**When in doubt:**
- Check the Quick Checklist
- Use semantic HTML
- Test with keyboard only
- Ask: "Can a screen reader user accomplish this task?"

---

**Last Updated:** 2025-12-02
