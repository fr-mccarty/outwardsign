# Workflow Changes Summary

**Date:** 2025-12-02
**Status:** In Progress - Awaiting User Review

## Overview

We are restructuring the agent workflow to separate creative brainstorming from technical requirements, introduce folder ownership, and add optional review gates.

## New Agent Structure

### Three Documentation Agents (Previously One)

1. **brainstorming-agent** (NEW - renamed from documentation-writer)
   - **Folder:** `/brainstorming/`
   - **Role:** Capture creative vision, explore possibilities, document user stories
   - **Output:** Vision document (moved to `/requirements/` when complete)
   - **Color:** Green (creative/divergent)

2. **project-documentation-writer** (NEW)
   - **Folder:** `/docs/`
   - **Role:** Maintain technical/developer documentation
   - **Output:** Updated MODULE_REGISTRY.md, FORMS.md, guides, etc.
   - **Color:** Blue

3. **user-documentation-writer** (EXISTING, but clarified)
   - **Folder:** `/src/app/documentation/content/`
   - **Role:** Create bilingual end-user guides for parish staff
   - **Output:** User-facing documentation
   - **Status:** OPTIONAL (only when requested)
   - **Color:** Blue

## Complete Workflow

```
1. brainstorming-agent
   ├─ Creates vision in /brainstorming/
   ├─ Collaborates with user
   └─ Moves to /requirements/ when ready
   ↓
   [OPTIONAL GATE: User can approve or auto-continue]
   ↓
2. requirements-agent
   ├─ Reads vision from /requirements/
   ├─ Analyzes codebase
   └─ Expands with technical specs
   ↓
   [OPTIONAL GATE: User can approve or auto-continue]
   ↓
3. developer-agent
   ├─ Implements in /src/
   └─ [NEW] If multiple modules: pauses after first for review
   ↓
4. test-writer
   └─ Creates tests in /tests/
   ↓
5. test-runner-debugger
   └─ Runs tests (read-only)
   ↓
6. project-documentation-writer
   └─ Updates /docs/
   ↓
7. finishing-agent
   ├─ QA review (read-only)
   └─ [NEW] Smart loop-back (identifies where to send issues)
   ↓
   [IF ISSUES: loops back to appropriate agent]
   ↓
8. user-documentation-writer (OPTIONAL)
   └─ Updates /src/app/documentation/content/
```

## Folder Ownership

| Folder | Owner Agent | Purpose |
|--------|-------------|---------|
| `/brainstorming/` | brainstorming-agent | Initial feature visions (temporary) |
| `/requirements/` | requirements-agent | Technical specifications |
| `/src/` | developer-agent | Source code |
| `/tests/` | test-writer | Test files |
| `/docs/` | project-documentation-writer | Developer/agent documentation |
| `/src/app/documentation/content/` | user-documentation-writer | End-user guides |
| `/releases/` | release-agent | Deployment logs, release notes |

## New Gates (All Optional)

### Gate 1: After Brainstorming
- **When:** brainstorming-agent completes vision
- **Question:** "Review vision before technical analysis?"
- **Default:** Auto-continue

### Gate 2: After Requirements
- **When:** requirements-agent completes technical specs
- **Question:** "Review requirements before development?"
- **Default:** Auto-continue

### Gate 3: Multi-Module Review
- **When:** developer-agent detects multiple modules in requirements
- **Question:** "Pause after first module for review?"
- **Default:** Ask user preference

## New Agent Capabilities

### brainstorming-agent
- ✅ Created and updated
- ✅ Uses `/brainstorming/` folder
- ✅ Moves files to `/requirements/` when ready
- ⏳ Needs integration in CLAUDE.md and AGENT_WORKFLOWS.md

### project-documentation-writer
- ✅ Created
- ✅ Focused on `/docs/` folder
- ⏳ Needs integration in CLAUDE.md and AGENT_WORKFLOWS.md

### user-documentation-writer
- ✅ Created (earlier)
- ⏳ Needs update to clarify it's optional
- ⏳ Needs integration in CLAUDE.md and AGENT_WORKFLOWS.md

### developer-agent
- ⏳ Needs multi-module gate added (Option 1: auto-detect and ask)

### finishing-agent
- ⏳ Needs smart loop-back capability (identify where issues should go)

### release-agent
- ⏳ Needs `/releases/` folder integration

### requirements-agent
- ⏳ Needs update to work with brainstorming-agent's vision documents

## Remaining Work

- [ ] Update user-documentation-writer to clarify optional status
- [ ] Update requirements-agent to read from brainstorming-agent
- [ ] Update developer-agent with multi-module gate
- [ ] Update finishing-agent with smart loop-back
- [ ] Update release-agent to use /releases/ folder
- [ ] Completely rewrite AGENT_WORKFLOWS.md with new workflow
- [ ] Update CLAUDE.md with all three agents and folder structure
- [ ] Update all cross-references in documentation

## Questions for Review

1. **Is this workflow structure correct?**
2. **Should all gates default to auto-continue, or should some require explicit approval?**
3. **Is the folder ownership clear and logical?**
4. **Anything missing from this summary?**

---

**Next Step:** User reviews and approves, then I complete remaining updates.
