# LINTING.md

> **Documentation for AI Agents and Developers:** This file contains comprehensive information about linting in Outward Sign. Use this as a reference for code quality checks and ESLint configuration.

---

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [What ESLint Checks](#what-eslint-checks)
- [Configuration](#configuration)
- [Ignoring Files](#ignoring-files)
- [Common Linting Issues](#common-linting-issues)
- [Best Practices](#best-practices)

---

## Overview

**Command:** `npm run lint`

**Purpose:** Run ESLint to check code quality, catch potential bugs, and enforce coding standards across the codebase.

**When to Run:**
- Before committing code
- During development to catch errors early
- Automatically runs during `npm run build`
- In CI/CD pipelines

---

## Usage

### Check for Linting Errors

```bash
npm run lint
```

This will scan all files and report any linting errors or warnings.

### Automatically Fix Fixable Issues

```bash
npm run lint -- --fix
```

This will automatically fix issues that can be safely corrected (like formatting, unused imports, etc.).

**Note:** Some issues require manual fixes (like missing dependencies in `useEffect`, type errors, etc.)

---

## What ESLint Checks

ESLint checks for:

- **TypeScript type errors** - Type mismatches, incorrect types, any usage
- **React best practices** - Component patterns, prop usage, JSX syntax
- **React Hooks rules** - Dependencies, effect cleanup, hook ordering
- **Next.js specific patterns** - Image optimization, Link usage, metadata
- **Unused variables and imports** - Dead code detection
- **Code style and formatting** - Consistent code style

---

## Configuration

### 🔴 CRITICAL - Configuration File

**ESLint settings are saved in `eslint.config.mjs`**

**DO NOT use `.eslintignore` or `.eslintrc.json`** - These are deprecated.

**Location:** `eslint.config.mjs` (project root)

### Current Configuration

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      '.vercel/**',
      'playwright-report/**',
      'test-results/**',
      'dist/**',
      'scripts/**',
      '**/*.md',
      'docs/**',
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Custom rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;
```

### Extends

- **`next/core-web-vitals`** - Next.js recommended rules for Core Web Vitals
- **`next/typescript`** - TypeScript-specific rules for Next.js

---

## Ignoring Files

To ignore files or directories from linting, add them to the `ignores` array in `eslint.config.mjs`:

```javascript
{
  ignores: [
    '.next/**',
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    // Add more patterns here
  ],
}
```

**Pattern Matching:**
- `**` matches any number of directories
- `*` matches any characters within a directory
- Patterns are relative to the project root

**Examples:**
```javascript
'src/generated/**'     // Ignore all files in src/generated
'**/*.test.ts'         // Ignore all test files
'scripts/**'           // Ignore scripts directory
```

---

## Common Linting Issues

### 1. Unused Variables

**Error:**
```
'variableName' is defined but never used
```

**Fixes:**
- Remove the variable if it's truly unused
- Prefix with underscore if you need to keep it: `_variableName`
- Use it somewhere in your code

**Example:**
```typescript
// ❌ Wrong
const unusedVar = 'something'

// ✅ Correct - prefix with underscore if needed for future use
const _unusedVar = 'something'

// ✅ Better - remove it entirely
```

---

### 2. Missing Dependencies in useEffect

**Error:**
```
React Hook useEffect has missing dependencies: 'dependency1', 'dependency2'
```

**Fixes:**
- Add the dependencies to the dependency array
- Use eslint-disable comment if intentional
- Restructure code to avoid the issue

**Example:**
```typescript
// ❌ Wrong
useEffect(() => {
  fetchData(userId)
}, [])

// ✅ Correct - add dependency
useEffect(() => {
  fetchData(userId)
}, [userId])

// ✅ Intentionally ignoring (be careful!)
useEffect(() => {
  fetchData(userId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

---

### 2a. 🔴 CRITICAL - Picker Initialization Pattern (Always Ignore)

**Error:**
```
React Hook useEffect has missing dependencies: 'deceased', 'familyContact', 'coordinator', ...
```

**Context:** This error appears in form components when initializing picker state from existing entity data during edit mode.

**Why We Ignore:** Adding picker state objects to the dependency array would cause infinite re-render loops because the picker objects change on every render. The useEffect should only run once when the entity data loads, not every time a picker value changes.

**Pattern:**
```typescript
// Initialize form with entity data when editing
useEffect(() => {
  if (funeral) {
    // Set people pickers with existing data
    if (funeral.deceased) deceased.setValue(funeral.deceased)
    if (funeral.family_contact) familyContact.setValue(funeral.family_contact)
    if (funeral.coordinator) coordinator.setValue(funeral.coordinator)
    // ... etc for all pickers
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [funeral])  // Only depend on the entity prop, NOT picker state objects
```

**Rule:**
- **ALWAYS ignore** these warnings for picker initialization effects
- **NEVER add** picker state objects (`deceased`, `familyContact`, etc.) to dependency arrays
- **ONLY depend** on the entity prop (`funeral`, `wedding`, `quinceanera`, etc.)

**Where This Pattern Appears:**
- `funeral-form.tsx`
- `wedding-form.tsx`
- `quinceanera-form.tsx`
- `mass-intention-form.tsx`
- `event-form.tsx`
- Any other form that initializes picker state from existing entity data

---

### 3. Any Type Usage

**Error:**
```
Unexpected any. Specify a different type
```

**Fixes:**
- Replace with proper TypeScript types
- Use specific types or interfaces
- Use `unknown` if the type is truly unknown

**Example:**
```typescript
// ❌ Wrong
function processData(data: any) {
  return data.value
}

// ✅ Correct
interface DataType {
  value: string
}
function processData(data: DataType) {
  return data.value
}

// ✅ For truly unknown types
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value
  }
}
```

---

### 4. Missing Alt Text on Images

**Error:**
```
img elements must have an alt prop
```

**Fixes:**
- Add descriptive alt text for accessibility
- Use empty string for decorative images

**Example:**
```tsx
// ❌ Wrong
<img src="/logo.png" />

// ✅ Correct
<img src="/logo.png" alt="Company logo" />

// ✅ For decorative images
<img src="/decoration.png" alt="" />
```

---

## Best Practices

### 1. Run Lint Before Committing

Always run `npm run lint` before committing code to catch issues early.

### 2. Fix Auto-Fixable Issues

Use `npm run lint -- --fix` to automatically fix formatting and simple issues.

### 3. Don't Disable Rules Globally

Avoid turning off linting rules in `eslint.config.mjs` unless absolutely necessary.

**Instead:**
- Fix the issue properly
- Use inline eslint-disable comments for specific cases
- Document why a rule is disabled

### 4. Understand the Error

Don't blindly disable linting errors. Understand why the error exists and fix the underlying issue.

### 5. Keep Configuration Simple

Don't over-customize ESLint rules. The defaults from Next.js are well-tested and balanced.

---

## Troubleshooting

### Linting is Slow

**Possible causes:**
- Too many files being linted
- Missing ignore patterns for build artifacts

**Solutions:**
- Add build directories to `ignores` in `eslint.config.mjs`
- Ensure `.next/`, `node_modules/`, `dist/` are ignored

### Rules Conflict with Prettier

If using Prettier:
- Install `eslint-config-prettier` to disable conflicting rules
- Run Prettier separately from ESLint

### Cache Issues

If linting behaves unexpectedly:
```bash
# Clear ESLint cache
rm -rf .eslintcache
npm run lint
```

---

**Last Updated:** 2025-11-17
**Maintained By:** Outward Sign Development Team
