# USER_DOCUMENTATION.md

> **Documentation for AI Agents & Developers:** This file explains the structure and implementation of the user-facing documentation system in Outward Sign. Use this as a reference when adding new documentation pages, creating new sections, or maintaining the documentation structure.

---

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [File Organization](#file-organization)
- [Adding New Documentation](#adding-new-documentation)
- [The Sidebar Navigation](#the-sidebar-navigation)
- [Breadcrumbs](#breadcrumbs)
- [Language Support](#language-support)
- [Search Functionality](#search-functionality)
- [Markdown Rendering](#markdown-rendering)
- [Best Practices](#best-practices)

---

## Overview

The user documentation system is a **public-facing, bilingual documentation platform** built with Next.js App Router. It provides comprehensive guides, tutorials, and references for Outward Sign users.

**Key Features:**
- 📖 Public access (no authentication required)
- 🌍 Bilingual support (English and Spanish)
- 🔍 Search functionality
- 📱 Responsive design with mobile navigation
- 🎨 Dark mode support
- 📝 Markdown-based content

**Location:** `/src/app/documentation/`

---

## Directory Structure

```
src/app/documentation/
├── page.tsx                    # Landing page (language selection)
├── layout.tsx                  # Root layout (no auth, minimal)
├── [lang]/                     # Language-specific routes
│   ├── page.tsx               # Documentation home (lang-specific)
│   ├── layout.tsx             # Layout with sidebar + search
│   └── [...slug]/
│       └── page.tsx           # Dynamic markdown page renderer
└── content/                    # Markdown content files
    ├── en/                    # English documentation
    │   ├── faq.md
    │   ├── for-developers.md
    │   ├── sponsor.md
    │   ├── getting-started/
    │   │   ├── introduction.md
    │   │   ├── quick-start.md
    │   │   └── parish-setup.md
    │   ├── user-guides/
    │   │   ├── staff-guide.md
    │   │   ├── inviting-staff.md
    │   │   ├── people.md
    │   │   └── events.md
    │   └── features/
    │       ├── weddings.md
    │       └── masses.md
    └── es/                    # Spanish documentation (mirrors en/)
        ├── faq.md
        ├── for-developers.md
        ├── sponsor.md
        ├── getting-started/
        │   ├── introduction.md
        │   ├── quick-start.md
        │   └── parish-setup.md
        ├── user-guides/
        │   ├── staff-guide.md
        │   ├── inviting-staff.md
        │   ├── people.md
        │   └── events.md
        └── features/
            ├── weddings.md
            └── masses.md
```

**Components:**
```
src/components/
├── documentation-sidebar.tsx          # Main navigation sidebar
├── documentation-search.tsx           # Search component
└── documentation-language-selector.tsx # Language switcher
```

---

## File Organization

### Markdown Content Files

**Location:** `src/app/documentation/content/{lang}/`

Each markdown file represents a documentation page. The file path determines the URL:

```
File: content/en/getting-started/quick-start.md
URL:  /documentation/en/getting-started/quick-start

File: content/es/user-guides/staff-guide.md
URL:  /documentation/es/user-guides/staff-guide
```

**File Naming Conventions:**
- Use **kebab-case** for file names (e.g., `parish-setup.md`, `inviting-staff.md`)
- Mirror the structure in both `en/` and `es/` directories
- Keep file names consistent between languages (only content differs)

### Content Categories

Organize documentation into logical categories:

1. **getting-started/** - Onboarding, setup, initial configuration
2. **user-guides/** - Role-based guides, workflows, common tasks
3. **features/** - Specific feature documentation (weddings, masses, etc.)
4. **Top-level files** - FAQ, developer guides, sponsorship info

---

## Adding New Documentation

### Step 1: Create Markdown Files

Create the markdown file in both language directories:

```bash
# Create English version
touch src/app/documentation/content/en/user-guides/new-guide.md

# Create Spanish version
touch src/app/documentation/content/es/user-guides/new-guide.md
```

**Markdown Structure:**

```markdown
# Page Title

Brief introduction to the topic.

## First Section

Content here with examples.

### Subsection

More detailed information.

## Another Section

Additional content.

## Related Resources

- [Link to Related Page](../other-category/related-page)
- [External Link](https://example.com)
```

**Markdown Guidelines:**
- Start with a single `#` heading (page title)
- Use `##` for main sections
- Use `###` for subsections
- Use plain code blocks (no language specifiers like ```bash or ```typescript)
- Keep paragraphs concise and scannable
- Include "Related Resources" or "Need Help?" section at the end

### Step 2: Update the Sidebar

Edit `src/components/documentation-sidebar.tsx` to add navigation link:

```typescript
const navigation: NavItem[] = [
  // ... existing items
  {
    title: lang === 'en' ? 'User Guides' : 'Guías de Usuario',
    icon: Users,
    items: [
      // ... existing items
      {
        title: lang === 'en' ? 'New Guide Title' : 'Título de Nueva Guía',
        href: `/documentation/${lang}/user-guides/new-guide`,
      },
    ],
  },
]
```

**Navigation Structure:**
- Top-level items can have an icon
- Top-level items with `items` array create collapsible sections
- Items without sub-items link directly to pages
- Always provide both English and Spanish titles

### Step 3: Update Static Paths (Optional)

For better SEO and build optimization, add to `generateStaticParams()` in `[...slug]/page.tsx`:

```typescript
export async function generateStaticParams() {
  const pages = [
    // ... existing pages
    { lang: 'en', slug: ['user-guides', 'new-guide'] },
    { lang: 'es', slug: ['user-guides', 'new-guide'] },
  ]
  return pages
}
```

### Step 4: Add to Popular Topics (Optional)

If this is a commonly accessed page, add it to the documentation home page in `[lang]/page.tsx`:

```typescript
topics: [
  // ... existing topics
  {
    title: 'New Guide Title',
    href: '/documentation/en/user-guides/new-guide'
  },
],
```

---

## The Sidebar Navigation

**Component:** `src/components/documentation-sidebar.tsx`

### Structure

The sidebar uses a hierarchical navigation structure:

```typescript
interface NavItem {
  title: string      // Display text
  href?: string      // Link URL (for leaf items)
  icon?: any         // Lucide React icon (for top-level items)
  items?: NavItem[]  // Sub-items (creates collapsible section)
}
```

### Adding a New Category

To add a new top-level category:

```typescript
const navigation: NavItem[] = [
  // ... existing items
  {
    title: lang === 'en' ? 'New Category' : 'Nueva Categoría',
    icon: NewIcon,  // Import from lucide-react
    items: [
      {
        title: lang === 'en' ? 'First Page' : 'Primera Página',
        href: `/documentation/${lang}/new-category/first-page`,
      },
      {
        title: lang === 'en' ? 'Second Page' : 'Segunda Página',
        href: `/documentation/${lang}/new-category/second-page`,
      },
    ],
  },
]
```

### Adding a Page to Existing Category

To add a page to an existing category, find the category object and add to its `items` array:

```typescript
{
  title: lang === 'en' ? 'User Guides' : 'Guías de Usuario',
  icon: Users,
  items: [
    // ... existing items
    {
      title: lang === 'en' ? 'New Page' : 'Nueva Página',
      href: `/documentation/${lang}/user-guides/new-page`,
    },
  ],
},
```

### Mobile Navigation

The sidebar automatically becomes a hamburger menu on mobile devices:
- Hamburger icon appears in top-left on mobile
- Opens as a drawer/sheet on click
- Maintains same navigation structure
- Closes automatically after navigation

---

## Breadcrumbs

**Implementation:** `src/app/documentation/[lang]/[...slug]/page.tsx`

Breadcrumbs are **automatically generated** from the URL path:

```
URL: /documentation/en/user-guides/staff-guide

Breadcrumbs:
Documentation > English > User Guides > Staff Guide
```

**How It Works:**

1. **Root:** "Documentation" (links to `/documentation`)
2. **Language:** "English" or "Español" (links to `/documentation/{lang}`)
3. **Path Segments:** Each URL segment converted to readable text
   - Kebab-case → Title Case
   - `staff-guide` → "Staff Guide"
   - `parish-setup` → "Parish Setup"

**Breadcrumb Component Structure:**

```tsx
<nav className="flex items-center gap-2 text-sm text-muted-foreground">
  <Link href="/documentation">Documentation</Link>
  <ChevronRight className="h-4 w-4" />
  <Link href={`/documentation/${lang}`}>
    {lang === 'en' ? 'English' : 'Español'}
  </Link>
  {slug.map((segment, index) => (
    <div key={index} className="flex items-center gap-2">
      <ChevronRight className="h-4 w-4" />
      <span>{formatSegment(segment)}</span>
    </div>
  ))}
</nav>
```

**Customization:**

Currently breadcrumbs are auto-generated. To customize specific breadcrumb text, you would need to:
1. Create a mapping object for segment → custom label
2. Update the breadcrumb rendering logic
3. Maintain bilingual labels for custom segments

---

## Language Support

The documentation system supports **English (en) and Spanish (es)**.

### Language Structure

**URL Pattern:** `/documentation/{lang}/{category}/{page}`

Examples:
- `/documentation/en/getting-started/introduction`
- `/documentation/es/getting-started/introduction`

### Adding a New Language

To add a new language (e.g., French):

#### 1. Create Content Directory

```bash
mkdir -p src/app/documentation/content/fr
```

Copy the structure from `en/` or `es/` and translate all `.md` files.

#### 2. Update Static Params

In `[lang]/layout.tsx`:

```typescript
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' },
    { lang: 'fr' },  // Add new language
  ]
}
```

#### 3. Update Sidebar

In `documentation-sidebar.tsx`, add French translations:

```typescript
const navigation: NavItem[] = [
  {
    title: lang === 'en' ? 'Home' : lang === 'es' ? 'Inicio' : 'Accueil',
    href: `/documentation/${lang}`,
    icon: Home,
  },
  // ... update all navigation items
]
```

**Better Approach:** Use a translation object:

```typescript
const translations = {
  en: { home: 'Home', userGuides: 'User Guides', /* ... */ },
  es: { home: 'Inicio', userGuides: 'Guías de Usuario', /* ... */ },
  fr: { home: 'Accueil', userGuides: 'Guides Utilisateur', /* ... */ },
}

const t = translations[lang]
```

#### 4. Update Language Selector

Update the language selector component to include the new language option.

#### 5. Update Documentation Home

In `[lang]/page.tsx`, add French content:

```typescript
const content = {
  en: { /* ... */ },
  es: { /* ... */ },
  fr: {
    title: 'Bienvenue dans la Documentation Outward Sign',
    subtitle: '...',
    // ... all French translations
  },
}
```

### Language Best Practices

1. **Mirror Structure:** Keep identical file structure across all languages
2. **Same File Names:** Use the same file names (only content differs)
3. **Consistent URLs:** URLs should differ only by language code
4. **Complete Translations:** Don't leave partial translations
5. **Review by Native Speakers:** Have native speakers review translations

---

## Search Functionality

**Component:** `src/components/documentation-search.tsx`

The search component appears in the top bar on all documentation pages.

**Current Implementation:**
- Client-side search component
- Placeholder for future implementation
- Position: Sticky top bar, next to language selector

**Future Enhancement Ideas:**
- Full-text search across all markdown files
- Search results modal/dropdown
- Keyboard shortcuts (Cmd/Ctrl + K)
- Search result highlighting
- Language-specific search (only search current language)

---

## Markdown Rendering

**Implementation:** `src/app/documentation/[lang]/[...slug]/page.tsx`

The system uses a **simple regex-based markdown renderer** for basic formatting.

### Supported Markdown Features

```markdown
# H1 Heading
## H2 Heading
### H3 Heading

**Bold text**
*Italic text*

`Inline code`

```
Code block (plain, no syntax highlighting)
```

[Link text](url)

- List item
- Another item
```

### Rendered HTML

```html
<h1 class="text-3xl font-bold text-foreground mb-6">H1 Heading</h1>
<h2 class="text-2xl font-semibold text-foreground mt-8 mb-4">H2 Heading</h2>
<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">H3 Heading</h3>

<strong class="font-semibold">Bold text</strong>
<em class="italic">Italic text</em>

<code class="bg-muted px-1.5 py-0.5 rounded text-sm">Inline code</code>

<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4">
  <code class="text-sm">Code block</code>
</pre>

<a href="url" class="text-primary hover:underline">Link text</a>

<ul class="list-disc list-inside space-y-2 my-4">
  <li class="ml-4">List item</li>
  <li class="ml-4">Another item</li>
</ul>
```

### Styling

All rendered content is wrapped in:

```tsx
<article className="prose prose-neutral dark:prose-invert max-w-none">
  {/* Rendered markdown */}
</article>
```

This uses Tailwind Typography with dark mode support.

### Upgrading Markdown Rendering

For more robust markdown support, consider:

1. **react-markdown** - Full markdown support with React components
2. **MDX** - Markdown with JSX components
3. **remark/rehype** - Unified markdown processing pipeline

**Example with react-markdown:**

```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {docContent.content}
</ReactMarkdown>
```

---

## Best Practices

### Content Guidelines

1. **Start with a clear H1 heading** - Every page should have exactly one H1
2. **Use descriptive headings** - Headings should clearly describe content
3. **Keep paragraphs scannable** - Short paragraphs, bullet points, examples
4. **Include code examples** - Show, don't just tell
5. **Link related pages** - Help users discover related content
6. **End with help/support** - Always provide a path to get more help

### File Organization

1. **Group by category** - Related pages in same directory
2. **Logical hierarchy** - Max 2-3 levels deep
3. **Consistent naming** - Use kebab-case, be descriptive
4. **Mirror structure** - Keep English and Spanish identical
5. **Delete unused files** - Don't leave orphaned content

### Navigation

1. **Logical grouping** - Group related items in sidebar
2. **Limit depth** - Avoid deep nesting (max 2 levels)
3. **Alphabetical when appropriate** - Or by workflow order
4. **Icon consistency** - Use same icons across similar sections
5. **Test mobile** - Ensure navigation works on small screens

### Maintenance

1. **Review quarterly** - Update outdated information
2. **Check links** - Ensure internal links work
3. **Update screenshots** - Keep images current
4. **Sync languages** - When updating one language, update all
5. **Monitor user feedback** - Watch for common questions

### Accessibility

1. **Proper heading hierarchy** - H1 → H2 → H3 (don't skip levels)
2. **Descriptive link text** - Not "click here"
3. **Alt text for images** - When adding images
4. **Keyboard navigation** - Test sidebar, search, navigation
5. **Screen reader friendly** - Test with screen readers

### SEO

1. **Descriptive titles** - H1 should match page title
2. **Clear URLs** - Readable, descriptive slugs
3. **Internal linking** - Link between related pages
4. **Meta descriptions** - Add if implementing
5. **Structured content** - Use headings properly

---

## Common Tasks

### Adding a New Section

1. Create markdown files in both `en/` and `es/`
2. Add category to sidebar navigation
3. Add icon (if top-level category)
4. Test both languages
5. Add to static params
6. Verify breadcrumbs work

### Updating Existing Page

1. Edit markdown file in `content/{lang}/`
2. Check internal links still work
3. Update both languages
4. Verify rendering in browser
5. Check mobile view

### Reorganizing Content

1. Move/rename markdown files
2. Update sidebar navigation paths
3. Update all internal links
4. Update static params
5. Add redirects for old URLs (if needed)
6. Test thoroughly

### Translating New Content

1. Write content in primary language (English)
2. Translate to Spanish (or use translator + review)
3. Keep structure identical
4. Verify links work in both languages
5. Test navigation in both languages

---

## Technical Details

### Route Handling

- **Root:** `/documentation` → Language selection landing page
- **Home:** `/documentation/{lang}` → Documentation home with popular topics
- **Pages:** `/documentation/{lang}/{...slug}` → Dynamic markdown pages

### Layouts

1. **Root layout** (`documentation/layout.tsx`)
   - Minimal layout
   - No authentication required
   - Sets page metadata

2. **Language layout** (`[lang]/layout.tsx`)
   - Includes sidebar
   - Includes search bar
   - Includes language selector
   - Responsive layout

### Static Generation

Pages are statically generated at build time using `generateStaticParams()`.

**Benefits:**
- Fast page loads
- SEO friendly
- No server-side rendering needed
- Deploy as static files

### Styling

- **Theme:** Inherits from main app theme (supports dark mode)
- **Typography:** Tailwind Typography plugin
- **Responsive:** Mobile-first design
- **Components:** Shadcn UI components (Card, Button, etc.)

---

## Future Enhancements

**Potential Improvements:**

1. **Full-text search** - Search across all documentation
2. **Version control** - Documentation versions for different app versions
3. **Contribution system** - Allow users to suggest edits (GitHub integration)
4. **Analytics** - Track popular pages, search queries
5. **Feedback widget** - "Was this helpful?" on each page
6. **Related pages** - Automatic suggestions based on content
7. **Table of contents** - On-page TOC for long articles
8. **Code syntax highlighting** - Proper code highlighting
9. **Printable version** - Print-optimized view
10. **Video embeds** - Support for tutorial videos

---

## Troubleshooting

### Page Not Found (404)

**Cause:** Markdown file missing or incorrect path
**Solution:**
1. Verify file exists in `content/{lang}/` with correct path
2. Check file has `.md` extension
3. Verify file name matches URL slug (kebab-case)

### Sidebar Link Not Working

**Cause:** Incorrect href in sidebar navigation
**Solution:**
1. Check href matches file path structure
2. Verify language parameter is correct
3. Ensure file exists at that path

### Breadcrumbs Wrong

**Cause:** URL structure doesn't match expectations
**Solution:**
1. Breadcrumbs are auto-generated from URL
2. Check URL path is correct
3. File structure should match URL structure

### Content Not Rendering

**Cause:** Markdown formatting issue or rendering bug
**Solution:**
1. Check markdown syntax
2. Look for regex edge cases in renderer
3. Verify no special characters breaking regex
4. Use plain code blocks (no language specifiers)

### Language Switch Not Working

**Cause:** Content missing in target language
**Solution:**
1. Verify both `en/` and `es/` have same structure
2. Check file exists in target language
3. Ensure language selector is properly configured

---

**Last Updated:** 2025-11-15
**Maintained By:** Outward Sign Development Team
