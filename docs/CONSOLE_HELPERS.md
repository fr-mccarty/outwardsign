# Console Helper Functions

> **Purpose:** Standardized console output utilities for consistent, professional logging in server actions and seeders.

---

## Overview

The console helper functions provide a uniform interface for logging messages with visual prefixes. All functions enforce strict character validation to ensure clean, professional output.

**Location:** `src/lib/utils/console.ts`

---

## Core Functions

### logSuccess(message)

Outputs success messages with `[OK]` prefix for successful operations.

**Usage:**
```typescript
import { logSuccess } from '@/lib/utils/console'

logSuccess('Created 5 users')
// Output: [OK] Created 5 users
```

**When to use:**
- Successful database operations
- Completed seeder steps
- Successful server action operations

---

### logWarning(message)

Outputs warning messages with `⚠️` prefix for non-critical issues requiring attention.

**Usage:**
```typescript
import { logWarning } from '@/lib/utils/console'

logWarning('No existing groups found, creating defaults')
// Output: ⚠️ No existing groups found, creating defaults
```

**When to use:**
- Non-critical issues during operations
- Missing data that will be auto-created
- Configuration issues that won't prevent operation

---

### logError(message)

Outputs error messages with `❌` prefix for critical failures.

**Usage:**
```typescript
import { logError } from '@/lib/utils/console'

logError('Failed to create parish')
// Output: ❌ Failed to create parish
```

**When to use:**
- Critical operation failures
- Database errors
- Validation failures that prevent operation
- Caught exceptions that need to be surfaced

---

### logInfo(message)

Outputs plain informational messages with no prefix.

**Usage:**
```typescript
import { logInfo } from '@/lib/utils/console'

logInfo('Creating sample locations...')
// Output: Creating sample locations...
```

**When to use:**
- Section headers in seeders
- General informational messages
- Progress updates during long operations

---

## Character Validation

**All functions validate messages before output.**

### Allowed Characters

- **Letters:** a-z, A-Z, including Spanish accented characters (ñÑáéíóúÁÉÍÓÚüÜ)
- **Numbers:** 0-9
- **Whitespace:** space, newline (\n), carriage return (\r), tab (\t)
- **Keyboard symbols:** !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

### Prohibited Characters

- **Emojis** (except in logWarning and logError prefixes which use ⚠️ and ❌)
- **Unicode symbols** (except Spanish accented characters)
- **Non-ASCII characters** (except Spanish accented characters)

### Validation Error

If a message contains prohibited characters, the function throws:

```
Error: Console message contains prohibited characters. Only standard ASCII keyboard characters are allowed (letters, numbers, space, and keyboard symbols).
Message: "[your message]"
```

**Example:**
```typescript
logSuccess('Task completed ✅')  // ❌ THROWS - emoji not allowed in message
logSuccess('Task completed')     // ✅ OK
```

---

## Use Cases

### Server Actions

**Reference:** `src/lib/actions/master-event-templates.ts`

```typescript
export async function createTemplateFromEvent(
  masterEventId: string,
  templateName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // ... operation code ...

    logInfo('Template created successfully: ' + JSON.stringify({ templateId: template.id }))
    return { success: true, template }
  } catch (error) {
    logError('Error in createTemplateFromEvent: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return { success: false, error: 'An unexpected error occurred' }
  }
}
```

### Database Seeders

**Pattern:** Section headers with info, operations with success/warning/error

```typescript
import { logInfo, logSuccess, logWarning, logError } from '@/lib/utils/console'

// Section header
logInfo('Creating sample locations...')

try {
  const location = await createLocation({ name: 'Main Church' })
  logSuccess('Created location: Main Church')
} catch (error) {
  logError('Failed to create location: ' + error.message)
}

if (!existingData) {
  logWarning('No existing data found, creating defaults')
}
```

---

## Best Practices

1. **Use appropriate severity** - Don't use logError for warnings or logSuccess for info
2. **Keep messages concise** - One line per message preferred
3. **Include context** - Add entity IDs or names when logging operations
4. **Validate user input** - Don't pass unvalidated user input directly (it may contain emojis)
5. **Consistent formatting** - Use JSON.stringify() for objects, not template literals with complex data

---

## Migration from console.log

**Before:**
```typescript
console.log('✅ Created user')              // Emoji in message (not allowed)
console.log('Error:', error)                 // No standard prefix
console.log(`Warning: ${someValue}`)         // Unclear severity
```

**After:**
```typescript
logSuccess('Created user')                   // Clean, prefixed
logError('Error: ' + error.message)          // Standard error prefix
logWarning('Warning: ' + someValue)          // Clear severity
```

---

## See Also

- **[CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md)** - General coding standards
- **[DATABASE.md](./DATABASE.md)** - Database seeding procedures
- **Server Actions** - See `src/lib/actions/` for usage examples
