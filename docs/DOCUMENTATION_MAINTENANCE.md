# Documentation Maintenance Guide

> **Purpose:** Quick reference for maintaining documentation health and preventing bloat.
> **For:** AI agents and developers working on documentation

## Daily/Weekly Maintenance (As Needed)

### When Creating New Documentation

✅ **Before Writing:**
1. Check if documentation already exists (avoid duplication)
2. Determine correct location (`/docs` vs `src/app/documentation/content/`)
3. Review related documentation for patterns

✅ **While Writing:**
1. Keep focused on one topic
2. Use clear headings and structure
3. Add TOC if file will exceed 300 lines
4. Link to related documentation

✅ **After Writing:**
1. Update CLAUDE.md if it's critical documentation
2. Update relevant registry files (COMPONENT_REGISTRY, MODULE_REGISTRY, etc.)
3. Verify all internal links work
4. Check file size: warn if >800 lines

### When Updating Existing Documentation

✅ **Check Before Editing:**
1. Read the full file to understand context
2. Check if content should be elsewhere (split files, registries)
3. Look for duplication that can be consolidated

✅ **During Editing:**
1. Remove outdated content (don't just add on top)
2. Update cross-references if moving content
3. Maintain consistent formatting with existing style

✅ **After Editing:**
1. Verify file size hasn't exceeded limits
2. Update "Last Updated" dates if present
3. Test that links still work

## Quarterly Maintenance (Every 3 Months)

### File Size Review

Run this command to check file sizes:
```bash
find docs -name "*.md" -type f -exec wc -l {} + | awk '$1 >= 800 {print $1, $2}' | sort -rn
```

**Action Thresholds:**
- **950+ lines:** MUST split or trim immediately
- **800-950 lines:** Add monitoring note, plan to split if it grows
- **<800 lines:** No action needed

### Health Check

1. **Review DOCUMENTATION_HEALTH_SUMMARY.md**
   - Check files in WARNING zone (800-900 lines)
   - Verify no files in CRITICAL zone (900-1000 lines)

2. **Update File Counts**
   - Total files: `find docs -name "*.md" -type f | wc -l`
   - Total lines: `find docs -name "*.md" -type f -exec wc -l {} + | awk '{sum+=$1} END {print sum}'`
   - Average: Total lines ÷ Total files

3. **Scan for Common Issues**
   - Duplicate content across files
   - Outdated information (check git blame for old files)
   - Broken internal links
   - Missing TOCs for files >300 lines

## File Size Management

### Soft Limit: 600 lines
**Action:** Consider if file could be more focused

### Warning: 800 lines
**Action:** Add monitoring note, watch for growth

### Hard Limit: 1000 lines
**Action:** MUST split or trim immediately

### How to Split Large Files

**Pattern 1: Topic-Based Split (Recommended)**
1. Create subdirectory: `docs/[topic]/`
2. Create `README.md` as navigation hub with quick links
3. Split into focused files by major sections
4. Update cross-references in CLAUDE.md and other docs
5. Move original to `docs/archive/[filename].md`

**Example:** `MASSES.md` → `docs/masses/` with 6 focused files

**Pattern 2: Content Trimming (For Verbose Files)**
1. Identify repetitive examples or verbose explanations
2. Condense to essential patterns and best practices
3. Replace step-by-step details with pattern references
4. Keep all critical information intact

**Example:** `REPORT_BUILDER_SYSTEM.md` reduced from 925 → 564 lines

### Navigation Hub Template

```markdown
# [Topic Name]

> **Navigation Hub:** This file provides an overview and quick navigation to detailed [topic] documentation.

## Quick Links

- **[Subtopic 1](./[topic]/SUBTOPIC1.md)** - Brief description
- **[Subtopic 2](./[topic]/SUBTOPIC2.md)** - Brief description
- **[Subtopic 3](./[topic]/SUBTOPIC3.md)** - Brief description

## Overview

[Brief 2-3 paragraph overview of the topic]

## See Also

- [Related Topic 1](./RELATED1.md)
- [Related Topic 2](./RELATED2.md)
```

## Content Quality Standards

### Required Elements

1. **Clear Purpose Statement** at the top
2. **Table of Contents** for files >300 lines
3. **Priority Markers** (🔴 for critical sections)
4. **Cross-References** to related documentation
5. **Code Examples** where applicable (commented and runnable)

### Writing Style

- **Concise:** Avoid verbose explanations
- **Scannable:** Use headings, lists, tables
- **Actionable:** Tell the reader what to do, not just concepts
- **Current:** Remove outdated patterns, focus on current approach
- **Agent-Friendly:** Clear structure, descriptive filenames, linked network

## Duplication Prevention

### Before Creating New Content

1. **Search existing docs:** `grep -r "keyword" docs/`
2. **Check registries:** COMPONENT_REGISTRY, MODULE_REGISTRY, TEMPLATE_REGISTRY
3. **Review CLAUDE.md:** "Required Reading by Task" table

### If Content Exists Elsewhere

- **Link to it** instead of duplicating
- **Consolidate** if there's overlap (choose single source of truth)
- **Update** existing content instead of creating new

### When to Allow Duplication

- **High-level overviews** can reference details from other files
- **Quick reference** sections can summarize detailed documentation
- **Context-specific examples** can show same pattern in different contexts

## Archive Strategy

### When to Archive

- **Obsolete patterns** (replaced by new approach)
- **Migration guides** (after migration is complete)
- **Old changelogs** (not actively referenced)
- **Historical notes** (interesting but not needed for development)

### Archive Structure

```
docs/archive/
├── migrations/          # Migration documentation
├── changelogs/         # Historical changelogs
├── deprecated/         # Obsolete patterns and approaches
└── [original-file].md  # Split files kept for reference
```

### Archiving Process

1. Move file to appropriate archive subdirectory
2. Add date to filename: `[YYYY-MM-DD]-[original-name].md`
3. Update cross-references to point elsewhere or note archived
4. Add note in file: `> **Archived:** [Date] - [Reason]`

## Red Flags (Issues to Address Immediately)

🚨 **File Size**
- Any file exceeds 1000 lines
- Multiple files in 950-1000 range

🚨 **Content Issues**
- Same information in 3+ places
- Contradictory instructions in different files
- References to deprecated patterns without "archived" markers

🚨 **Structure Issues**
- Files without clear purpose
- No TOC for files >300 lines
- Broken internal links

🚨 **Maintenance Debt**
- Documentation not updated when code changes
- New modules without documentation entries
- New components not in COMPONENT_REGISTRY

## Related Files

- **[DOCUMENTATION_HEALTH_SUMMARY.md](./DOCUMENTATION_HEALTH_SUMMARY.md)** - Current file size tracking
- **[DOCUMENTATION_AUDIT_2025.md](./DOCUMENTATION_AUDIT_2025.md)** - Original audit findings
- **[README.md](./README.md)** - Documentation purpose and standards
- **[CLAUDE.md](../CLAUDE.md)** - Main documentation reference

---

**Last Updated:** 2025-12-02
**Next Review:** 2026-03-02 (Quarterly)
