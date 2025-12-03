# Brainstorming Folder

**Owner:** brainstorming-agent
**Purpose:** Initial feature visions, creative exploration, and user story capture

## What Goes Here

This folder contains **initial feature vision documents** created by the brainstorming-agent during the creative/exploratory phase of feature development.

**Document Format:** `YYYY-MM-DD-feature-name.md`

**Content Includes:**
- Feature overview (what the user wants)
- Problem statement (why this is needed)
- User stories (who, what, why)
- Success criteria (what "done" looks like)
- Scope (in scope vs. out of scope)
- Key user flows
- Integration points
- Open questions for requirements-agent

## Workflow

1. **brainstorming-agent** creates initial vision document here
2. **brainstorming-agent** moves document to `/requirements/` folder when brainstorming is complete
3. **requirements-agent** reads the vision and expands it with technical specifications

## Document Lifecycle

```
User idea
    ↓
brainstorming-agent creates vision in /brainstorming/
    ↓
User confirms vision
    ↓
brainstorming-agent moves file to /requirements/
    ↓
requirements-agent expands with technical details
```

## Status of Documents

- **Active brainstorming**: Document is in this folder and being refined
- **Ready for requirements**: Document will be moved to `/requirements/` folder
- **Archived**: Old/cancelled ideas stay here for reference (marked with status)

## Notes

- This folder should typically be **empty or nearly empty** - documents move to `/requirements/` quickly
- If you see many documents here, they're likely abandoned ideas or works-in-progress
- Completed visions live in `/requirements/` with full technical specifications
