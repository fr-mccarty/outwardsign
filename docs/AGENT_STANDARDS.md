# AGENT_STANDARDS.md

**Baseline standards for agent prompts, settings, and workflows in the Outward Sign project.**

This document defines what "good" looks like for the agent ecosystem. The agent-audit-agent uses this as the baseline for audits.

## Table of Contents

- [Agent File Standards](#agent-file-standards)
- [Creep Resistance Patterns](#creep-resistance-patterns)
- [Boundary Clarity Requirements](#boundary-clarity-requirements)
- [Settings Standards](#settings-standards)
- [Hook Standards](#hook-standards)
- [Documentation Alignment](#documentation-alignment)
- [Gold Standard Example](#gold-standard-example)

---

## Agent File Standards

All agent files live in `.claude/agents/` and follow this structure:

### Required Frontmatter

Every agent MUST have these frontmatter fields:

```yaml
---
name: agent-name
description: [Description with examples - see below]
model: sonnet | opus | haiku
color: [any valid color]
---
```

### Description Format

The description field MUST include:

1. **One-sentence purpose** - What the agent does
2. **When to use** - Trigger conditions
3. **Examples** - At least 2-3 `<example>` blocks showing:
   - Context
   - User message
   - Assistant response
   - Commentary (optional)

**Example of good description:**

```yaml
description: Use this agent when you need to [purpose]. This agent should be launched when [trigger conditions].\n\nExamples:\n\n<example>\nContext: [situation]\nuser: "[user message]"\nassistant: "[assistant response]"\n<commentary>[explanation]</commentary>\n</example>
```

### Body Structure

Agent prompt bodies SHOULD follow this general pattern:

1. **Identity Statement** - "You are..." (1-2 sentences)
2. **Core Purpose/Responsibilities** - What you do (bulleted list)
3. **What You Do NOT Do** - Explicit boundaries
4. **Process/Workflow** - How to approach tasks
5. **Output Format** - What to produce (if applicable)
6. **Communication Style** - Tone and approach
7. **Startup Behavior** - What to do when launched

Not all sections are required for every agent, but this structure promotes consistency.

---

## Creep Resistance Patterns

Agents should be designed to resist context drift (losing focus as conversations get longer).

### Lean Prompts

- **Shorter is better** - Concise prompts drift less
- **No redundancy** - Don't repeat the same instruction multiple ways
- **Target length**: 100-200 lines for complex agents, less for simple ones

### Anchoring Statements

Include statements that reinforce core purpose:

- "Your primary job is..."
- "Remember that..."
- "Always prioritize..."
- "Your core purpose is..."

Place anchoring statements:
- At the beginning (identity)
- In the middle (before complex sections)
- At the end (summary/remember section)

### Scope Limiters

Explicit boundary statements prevent scope creep:

- "You do NOT..."
- "Never..."
- "Leave X to [other-agent]"
- "This is NOT your responsibility..."

---

## Boundary Clarity Requirements

Each agent should have clear, non-overlapping responsibilities.

### Single Responsibility

Each agent should have ONE primary function:

| Agent | Primary Function |
|-------|-----------------|
| brainstorming-agent | Capture creative vision |
| requirements-agent | Technical analysis |
| developer-agent | Code implementation |
| test-writer | Test creation |
| code-review-agent | Code review |

### Exit Criteria

Agents should know when to stop and hand off:

- "When [condition], hand off to [next-agent]"
- "Your work is complete when..."
- "Stop when..."

### Overlap Prevention

If two agents seem to do similar things, clarify the distinction:

- **project-documentation-writer** vs **user-documentation-writer**: Developer docs (/docs/) vs end-user guides (/src/app/documentation/content/)
- **explorer-agent** vs **refactor-agent**: Understanding code vs improving code
- **ui-agent** vs **ux-agent**: Visual styling vs user understanding

---

## Settings Standards

### File Location

- **ONLY** use `.claude/settings.json` (committed to repo)
- **NEVER** use `.claude/settings.local.json`
- If local settings exist, migrate to main settings and delete local file

### Permissions Structure

```json
{
  "permissions": {
    "deny": [
      // Critical operations that should never be allowed
    ],
    "allow": [
      // Approved operations
    ]
  }
}
```

**Guidelines:**
- `deny` takes precedence over `allow`
- Be specific rather than overly broad
- No duplicates between allow and deny
- Group related permissions together

### Hooks Structure

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "[pattern]",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "[reminder text]"
          }
        ]
      }
    ]
  }
}
```

---

## Hook Standards

### When Hooks Are Required

Create hooks for operations that require reading specific documentation first:

| Operation Pattern | Required Doc Reference |
|-------------------|----------------------|
| `Edit(**/*form*.tsx)` | FORMS-CRITICAL.md |
| `Edit(**/*-list-client.tsx)` | LIST-VIEW-CRITICAL.md |
| `Edit(**/page.tsx)` | MODULE-PATTERNS-CRITICAL.md |
| `Write(**/migrations/*.sql)` | DATABASE-CRITICAL.md |
| `Edit(tests/*.spec.ts)` | testing/TESTING.md |
| `Edit(src/lib/actions/*.ts)` | ARCHITECTURE.md |
| `Edit(docs/**/*.md)` | docs/README.md |

### Hook Prompt Format

```
CRITICAL DOCUMENTATION REMINDER:

You are about to [action]. Before proceeding, you MUST read [doc].

Key rules:
- [Rule 1]
- [Rule 2]
- [Rule 3]

Have you read [doc]? If not, read it now before proceeding.

Tool being used: $ARGUMENTS
```

### Hook Coverage Gaps

Compare hooks against CLAUDE.md's "Required Reading by Task" table. Each task type should have corresponding hook coverage for its file patterns.

---

## Documentation Alignment

### CLAUDE.md Accuracy

The agent orchestration table in CLAUDE.md must match:
- All agents in `.claude/agents/` should be listed
- Folder assignments should be accurate
- Purpose descriptions should match agent prompts

### AGENT_WORKFLOWS.md Accuracy

- Agent Inventory should list all agents
- Decision Trees should reference all relevant agents
- Folder Ownership should match actual agent behavior
- Quality Gates should reflect current requirements

---

## Gold Standard Example

Reference: `.claude/agents/developer-agent.md`

This agent demonstrates:

1. **Complete frontmatter** - name, description with examples, model, color
2. **Clear identity** - "You are an expert full-stack developer..."
3. **Numbered responsibilities** - Easy to scan
4. **Explicit constraints** - "Important Constraints" section
5. **Startup workflow** - What to do when launched
6. **Quality standards** - Clear expectations
7. **What NOT to do** - Git operations section shows boundaries

### What Makes It Good

- **Lean but complete** - ~150 lines covers everything needed
- **Anchored** - Core purpose reinforced throughout
- **Bounded** - Clear what it does and doesn't do
- **Actionable** - Specific guidance, not vague platitudes
- **Exit criteria** - Knows when to stop (after code-review-agent)

---

## Audit Checklist

When auditing an agent, check:

- [ ] Has all required frontmatter fields
- [ ] Description includes examples
- [ ] Body follows recommended structure
- [ ] Has anchoring statements
- [ ] Has explicit scope limiters
- [ ] Single clear responsibility
- [ ] No overlap with other agents
- [ ] Exit criteria defined
- [ ] Prompt is lean (no redundancy)
- [ ] References correct documentation
