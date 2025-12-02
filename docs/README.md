# Developer Documentation

**This directory contains technical documentation for developers and AI agents working on the Outward Sign project.**

## Purpose

The `/docs` directory is the **exclusive location for developer/AI technical documentation**. This documentation is:

- **For Developers & AI Agents** - Implementation guides, architecture patterns, coding standards, and reference material
- **Future-Oriented** - Documents the current state and desired direction of the application, not historical approaches or deprecated patterns
- **Technical & Actionable** - Focuses on how to build features correctly using established patterns

## What Goes Here

✅ **Developer Documentation** (this directory):
- Architecture and design patterns
- Component implementation guides
- Module creation checklists
- Testing guides and patterns
- Form patterns and validation
- Database schemas and migrations
- Code conventions and standards
- API references and registries

❌ **User Documentation** (NOT in this directory):
- End-user guides → `src/app/documentation/content/`
- User-facing tutorials → `src/app/documentation/content/`
- Bilingual help content → `src/app/documentation/content/`

## Documentation Standards

All documentation in this directory must follow these standards:

1. **File Size Limit** - Maximum 1000 lines per file. Split larger topics into linked files.
2. **Future-Oriented** - Document current patterns only. Remove outdated information.
3. **Scannable Structure** - Clear headings, TOC for files over 300 lines, priority markers (🔴 for critical)
4. **Agent-Friendly** - Network of links, descriptive filenames, summary at top
5. **Code Examples** - Show implementation with commented, runnable examples

## Key Documentation Files

**Getting Started:**
- [DEFINITIONS.md](./DEFINITIONS.md) - Liturgical and application terminology

**Core Patterns:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture, authentication, permissions
- [FORMS.md](./FORMS.md) - 🔴 Form patterns, validation, styling (required reading for forms)
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - 🔴 The 8-file module structure
- [LIST_VIEW_PATTERN.md](./LIST_VIEW_PATTERN.md) - 🔴 List page pattern

**Development Guides:**
- [MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md) - Complete checklist for creating new modules
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Test patterns, authentication, debugging
- [CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md) - Coding standards and conventions
- [DATABASE.md](./DATABASE.md) - Database management procedures

**Component References:**
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Complete component library reference
- [MODULE_REGISTRY.md](./MODULE_REGISTRY.md) - All modules with routes and labels
- [TEMPLATE_REGISTRY.md](./TEMPLATE_REGISTRY.md) - All liturgical script templates

**See [CLAUDE.md](../CLAUDE.md) for complete table of contents and quick reference guide.**

## For AI Agents

When you need to create or update documentation:
1. **Always write to this directory** (`/docs`) - never create developer docs elsewhere
2. **Read CLAUDE.md first** - understand the project context and patterns
3. **Link related docs** - create a network of interconnected documentation
4. **Keep files focused** - one topic per file, split at 1000 lines
5. **Update cross-references** - add new docs to CLAUDE.md and relevant registry files

## Maintenance

Documentation should be:
- **Updated** when code patterns change
- **Split** when files exceed 1000 lines
- **Cleaned** of outdated or deprecated information
- **Linked** to related documentation throughout the project
