# CLAUDE_CODE_SETTINGS.md

> **Documentation for AI Agents and Developers:** This file contains comprehensive information about Claude Code permission settings in Outward Sign. Use this as a reference when configuring what operations Claude can perform automatically.

---

## Table of Contents

- [Overview](#overview)
- [Configuration Files](#configuration-files)
- [Shared Team Settings](#shared-team-settings-settingsjson)
- [Personal Overrides](#personal-overrides-settingslocaljson)
- [Permission Categories](#permission-categories)
- [Why These Permissions](#why-these-permissions)
- [Making Changes](#making-changes)

---

## Overview

**Purpose:** Claude Code settings control which operations Claude can perform automatically without asking for permission. This improves workflow efficiency by allowing common safe operations to run freely.

**Location:**
- `.claude/settings.json` - Shared team permissions (committed to git)
- `.claude/settings.local.json` - Personal overrides (gitignored, optional)

---

## Configuration Files

### settings.json (Shared Team File)

**Purpose:** Contains permissions that all team members and AI agents should have.

**Status:** Committed to git, shared across the team

**What it contains:**
- Allowed bash commands (read-only operations)
- Build and test commands
- WebFetch domains for documentation
- Denied operations for security

---

### settings.local.json (Personal Overrides)

**Purpose:** Personal permission preferences that differ from team defaults.

**Status:** Gitignored - won't be tracked in version control

**When to use:**
- You need different test command preferences
- You want to allow additional WebFetch domains
- You need to temporarily enable/disable specific permissions
- You have personal workflow differences from the team

**Important:** Don't commit this file. It's for your personal use only.

---

## Shared Team Settings (settings.json)

### Allowed Bash Commands

**Read-only operations:**
- `ls`, `grep`, `cat`, `head`, `tail` - File viewing
- `diff`, `file`, `wc` - File comparison and analysis
- `git status`, `git log`, `git show`, `git diff`, `git branch`, `git remote` - Git read-only
- `find`, `xargs`, `tree` - File system navigation
- `pwd`, `du`, `stat`, `which`, `env`, `printenv` - System information
- `sort`, `uniq`, `cut`, `tr`, `awk`, `jq` - Data processing
- `basename`, `dirname`, `realpath`, `readlink` - Path utilities

**Build/Test commands:**
- `npm run build`
- `npm run lint`
- `npm run test` (and `npm run test:ui` for interactive debugging)

**Note:** Use `npm run test:*` commands instead of `npx playwright` directly.

---

### WebFetch Allowed Domains

**Documentation sites:**
- `github.com` - GitHub repositories and docs
- `www.npmjs.com` - npm package documentation
- `raw.githubusercontent.com` - Raw GitHub content
- `code.claude.com` - Claude Code documentation
- `docx.js.org` - Docx.js library documentation

**Purpose:** Allow Claude to fetch current documentation from trusted sources.

---

### Denied Operations

**Security protections:**
- Reading `.env` files - Prevents credential exposure
- Write operations - No file modifications without permission
- Destructive git commands - No commits, pushes, force operations
- System modifications - No package installs, config changes

---

## Personal Overrides (settings.local.json)

### Creating Personal Overrides

**Example settings.local.json:**

```json
{
  "allowedBashCommands": [
    // All team defaults, plus your additions
    "custom-script.sh"
  ],
  "webFetch": {
    "allowedDomains": [
      // All team defaults, plus your additions
      "example-docs.com"
    ]
  }
}
```

**Note:** This file is gitignored. Create it only if you need personal overrides.

---

## Permission Categories

### 1. Read Operations (Allowed)

**What:** Viewing files, running status checks, searching code

**Why:** Safe operations that don't modify anything

**Examples:**
- `cat CLAUDE.md` - Read documentation
- `git status` - Check repository status
- `grep "function" src/` - Search code

---

### 2. Build & Test (Allowed)

**What:** Running builds, tests, and linting

**Why:** Common operations during development that should run without prompts

**Examples:**
- `npm run build` - Build the application
- `npm test` - Run test suite
- `npm run lint` - Check code quality

---

### 3. Write Operations (Denied by Default)

**What:** Creating, modifying, or deleting files

**Why:** Requires explicit user permission for safety

**Examples:**
- Creating new files
- Modifying existing code
- Deleting files

**Note:** Claude will ask for permission before these operations.

---

### 4. Git Write Operations (Denied)

**What:** Committing, pushing, or modifying git history

**Why:** Critical operations that should be user-controlled

**Examples:**
- `git add`
- `git commit`
- `git push`
- `git reset --hard`

**Note:** Claude Code has NO permission for these operations.

---

## Why These Permissions

### No Write/Destructive Operations

**Reason:** Prevents accidental data loss or unwanted changes

**What's denied:**
- `git commit`, `git push` - Code commits must be intentional
- `rm`, `mv` - File deletion and moving
- Modifying critical config files

---

### Safe Read Operations Allowed

**Reason:** Improves efficiency by allowing harmless operations

**What's allowed:**
- Viewing files and directories
- Running status checks
- Searching code
- Checking git history

---

### Testing/Linting Automated

**Reason:** Common operations that should run freely

**What's allowed:**
- `npm run build`
- `npm run lint`
- `npm test`
- Playwright test commands

**Why:** These are safe, non-destructive operations that developers run frequently.

---

### Documentation Access

**Reason:** Claude can fetch current documentation from trusted sources

**What's allowed:**
- GitHub repositories
- npm package docs
- Official documentation sites

**Why:** Ensures Claude has access to up-to-date information.

---

### Environment Protection

**Reason:** Prevent credential exposure

**What's denied:**
- Reading `.env` files
- Reading `.env.local`, `.env.production`, etc.

**Why:** Environment files contain sensitive credentials and API keys.

---

## Making Changes

### Updating Team Settings

**File:** `.claude/settings.json`

**Process:**
1. Edit `.claude/settings.json` in your code editor
2. Add/remove permissions as needed
3. Commit changes to git
4. Other team members will get updates when they pull

**Example - Adding a new allowed command:**

```json
{
  "allowedBashCommands": [
    // ... existing commands ...
    "your-new-command"
  ]
}
```

---

### Creating Personal Overrides

**File:** `.claude/settings.local.json`

**Process:**
1. Create `.claude/settings.local.json` (if it doesn't exist)
2. Add your personal overrides
3. **DO NOT commit this file** (it's gitignored)
4. Restart Claude Code for changes to take effect

**Example:**

```json
{
  "allowedBashCommands": [
    "my-custom-script.sh"
  ],
  "webFetch": {
    "allowedDomains": [
      "my-favorite-docs.com"
    ]
  }
}
```

---

### Applying Changes

**After editing settings:**

1. **Save the file**
2. **Restart Claude Code** - Settings are loaded on startup
3. **Verify changes** - Try using the new permission

**Note:** Changes don't take effect until Claude Code is restarted.

---

## Best Practices

### 1. Keep Team Settings Conservative

Only add permissions that the entire team needs. Use personal overrides for individual preferences.

### 2. Document Why

When adding new permissions, document why they're needed in a comment or commit message.

### 3. Review Periodically

Periodically review settings to remove unused permissions and keep the configuration clean.

### 4. Security First

Never allow operations that could:
- Expose credentials
- Delete important files
- Modify git history
- Install packages without review

### 5. Use Personal Overrides for Experiments

Try new permissions in `.claude/settings.local.json` first before adding to team settings.

---

## Troubleshooting

### Permission Denied Errors

If Claude cannot perform an operation you expect it to:

1. Check `.claude/settings.json` for the permission
2. Add it if missing
3. Restart Claude Code
4. Try again

### Settings Not Taking Effect

**Solution:**
- Ensure you saved the file
- Restart Claude Code completely
- Check for JSON syntax errors

### Personal Overrides Not Working

**Solution:**
- Verify file is named `.claude/settings.local.json`
- Check JSON syntax is valid
- Ensure file is in `.claude/` directory
- Restart Claude Code

---

**Last Updated:** 2025-11-17
**Maintained By:** Outward Sign Development Team
