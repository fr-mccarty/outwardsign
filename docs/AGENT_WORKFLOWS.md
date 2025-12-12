# AGENT_WORKFLOWS.md

**Agent Orchestration Guide for Outward Sign**

This document provides comprehensive workflows, decision trees, and integration patterns for the specialized AI agents used in the Outward Sign project.

## Table of Contents

- [Overview](#overview)
- [Agent Inventory](#agent-inventory)
- [Folder Ownership](#folder-ownership)
- [Decision Trees](#decision-trees)
- [Standard Workflow](#standard-workflow)
- [Optional Gates](#optional-gates)
- [Agent Hand-off Patterns](#agent-hand-off-patterns)
- [Common Scenarios](#common-scenarios)
- [Quality Gates](#quality-gates)
- [Best Practices](#best-practices)

---

## Overview

The Outward Sign project uses specialized agents to handle different aspects of software development. The workflow is designed around **two key phases**:

1. **Divergent Phase** (Creative) - Brainstorming and exploration
2. **Convergent Phase** (Technical) - Requirements analysis and implementation

**Key Principles:**
- **Specialization**: Each agent focuses on one aspect of development
- **Folder Ownership**: Each agent owns a specific folder
- **Documentation-First**: Capture vision before technical analysis
- **Optional Gates**: User can review at key decision points
- **Smart Loop-Back**: Issues are routed to the appropriate agent for fixes

---

## Agent Inventory

### Complete Agent List (14 agents)

| Agent | Folder | Role | Phase |
|-------|--------|------|-------|
| **brainstorming-agent** | `/brainstorming/` | Capture creative vision | Divergent |
| **requirements-agent** | `/requirements/` | Technical analysis | Convergent |
| **developer-agent** | `/src/` | Implementation | Execution |
| **test-writer** | `/tests/` | Test creation | Execution |
| **test-runner-debugger** | N/A (read-only) | Test execution | Execution |
| **project-documentation-writer** | `/docs/` | Developer docs | Execution |
| **code-review-agent** | N/A (read-only) | Code review | Execution |
| **user-documentation-writer** | `/src/app/documentation/content/` | End-user guides | Optional |
| **release-agent** | `/releases/` | Deployment | Optional |
| **explorer-agent** | N/A | Codebase exploration | As-needed |
| **refactor-agent** | N/A | Code improvement | As-needed |
| **qa-specialist** | N/A | Performance/security | As-needed |
| **ui-agent** | N/A (read-only) | Visual styling audits | As-needed |
| **ux-agent** | N/A (read-only) | User understanding audits | As-needed |

---

## Folder Ownership

Each agent "owns" a specific folder where it creates and manages files:

| Folder | Owner | Purpose | Lifecycle |
|--------|-------|---------|-----------|
| `/brainstorming/` | brainstorming-agent | Initial feature visions | Temporary (files move to /requirements/) |
| `/requirements/` | requirements-agent | Technical specifications | Permanent |
| `/src/` | developer-agent | Source code | Permanent |
| `/tests/` | test-writer | Test files | Permanent |
| `/docs/` | project-documentation-writer | Developer/agent docs | Permanent |
| `/releases/` | release-agent | Deployment logs | Permanent (audit trail) |
| `/src/app/documentation/content/` | user-documentation-writer | End-user guides | Permanent |

**Read-only agents** (no folder ownership):
- test-runner-debugger (runs tests)
- code-review-agent (reviews code)
- explorer-agent (explores codebase)
- refactor-agent (improves code in /src/)
- qa-specialist (audits quality)
- ui-agent (audits visual styling)
- ux-agent (audits user understanding)

---

## Decision Trees

### Primary Decision Tree: Which Agent Should I Use?

```
USER REQUEST
    │
    ├─ "I have an idea for a new feature"
    │   └─ brainstorming-agent → requirements-agent → developer-agent
    │
    ├─ "Create new [feature/module]"
    │   └─ brainstorming-agent → requirements-agent → developer-agent → test-writer → project-documentation-writer → code-review-agent
    │
    ├─ "Fix bug in [feature]"
    │   ├─ Bug is clear/simple → developer-agent → test-runner-debugger → code-review-agent
    │   └─ Bug is complex/unclear → explorer-agent → developer-agent → test-runner-debugger → code-review-agent
    │
    ├─ "How does [feature] work?"
    │   └─ explorer-agent
    │
    ├─ "Tests are failing"
    │   └─ test-runner-debugger
    │
    ├─ "Write tests for [feature]"
    │   └─ test-writer → test-runner-debugger
    │
    ├─ "Code has duplication/is messy"
    │   └─ explorer-agent → refactor-agent → test-runner-debugger → code-review-agent
    │
    ├─ "Update /docs/ documentation"
    │   └─ project-documentation-writer
    │
    ├─ "Create end-user guide"
    │   └─ user-documentation-writer
    │
    ├─ "Deploy to production"
    │   └─ qa-specialist → code-review-agent → release-agent
    │
    ├─ "Performance/accessibility issues"
    │   └─ qa-specialist → developer-agent (fix) → code-review-agent
    │
    ├─ "UI looks inconsistent/styling issues"
    │   └─ ui-agent → developer-agent (fix) → code-review-agent
    │
    └─ "Labels/navigation/descriptions unclear"
        └─ ux-agent → developer-agent (fix) → code-review-agent
```

---

## Standard Workflow

### The Complete 8-Step Workflow

```mermaid
graph LR
    A[User Idea] --> B[brainstorming-agent]
    B --> C[requirements-agent]
    C --> D[developer-agent]
    D --> E[test-writer]
    E --> F[test-runner-debugger]
    F --> G[project-documentation-writer]
    G --> H[code-review-agent]
    H --> I{Issues?}
    I -->|Yes| J[Loop Back]
    I -->|No| K[user-documentation-writer OPTIONAL]
    K --> L[DONE]
```

### Step-by-Step Breakdown

**1. brainstorming-agent (DIVERGENT - Creative)**
- **Input:** User's initial idea or problem
- **Folder:** `/brainstorming/`
- **Output:** Vision document with user stories, scope, success criteria
- **Action:** Creates `/brainstorming/YYYY-MM-DD-feature.md`, then moves to `/requirements/`
- **Next:** requirements-agent (reads vision, adds technical specs)

**2. requirements-agent (CONVERGENT - Analytical)**
- **Input:** Vision document from `/requirements/`
- **Folder:** `/requirements/`
- **Output:** Expanded document with database schema, server actions, UI components
- **Action:** Adds technical requirements to existing vision document
- **Next:** developer-agent (implements based on requirements)

**3. developer-agent (EXECUTION - Building)**
- **Input:** Requirements document from `/requirements/`
- **Folder:** `/src/`
- **Output:** Implemented features (migrations, server actions, UI components)
- **Special:** If multiple modules, can pause after first module for review
- **Next:** test-writer (creates tests for implementation)

**4. test-writer (EXECUTION - Quality Assurance)**
- **Input:** Implemented code in `/src/`
- **Folder:** `/tests/`
- **Output:** Test files covering happy path, errors, edge cases
- **Action:** Creates `tests/[module].spec.ts`, updates TESTING_REGISTRY.md
- **Next:** test-runner-debugger (runs tests)

**5. test-runner-debugger (EXECUTION - Verification)**
- **Input:** Test files in `/tests/`
- **Folder:** N/A (read-only)
- **Output:** Test results (pass/fail)
- **Action:** Runs `npm test`, debugs failures
- **Next:** project-documentation-writer (updates docs)

**6. project-documentation-writer (EXECUTION - Documentation)**
- **Input:** Completed, tested implementation
- **Folder:** `/docs/`
- **Output:** Updated MODULE_REGISTRY.md, COMPONENT_REGISTRY.md, guides
- **Action:** Documents new patterns, updates registries
- **Next:** code-review-agent (code review)

**7. code-review-agent (EXECUTION - Code Review)**
- **Input:** Completed implementation + tests + docs
- **Folder:** N/A (read-only)
- **Output:** Review report, verdict (READY / NEEDS ATTENTION / LOOP BACK)
- **Special:** Smart loop-back identifies which agent should fix issues
- **Next:** If issues → loop back to appropriate agent, else → DONE (or user-documentation-writer if requested)

**8. user-documentation-writer (OPTIONAL - End-User Guides)**
- **Input:** User request for end-user documentation
- **Folder:** `/src/app/documentation/content/`
- **Output:** Bilingual (en/es) user guides for parish staff
- **Action:** Creates step-by-step guides for non-technical users
- **Next:** DONE

---

## Optional Gates

Gates allow the user to review and approve before proceeding. All gates are **optional** and can be set to auto-continue.

### Gate 1: After Brainstorming
**Location:** Between brainstorming-agent and requirements-agent

**Question:** "Would you like to review the vision before I analyze technical requirements?"

**Options:**
- A) Auto-continue (default)
- B) Review and approve first

**When to use:** When the feature is complex or scope needs user confirmation

### Gate 2: After Requirements
**Location:** Between requirements-agent and developer-agent

**Question:** "Would you like to review the technical requirements before development starts?"

**Options:**
- A) Auto-continue (default)
- B) Review and approve first

**When to use:** When technical approach needs validation or has multiple options

### Gate 3: Multi-Module Implementation
**Location:** During developer-agent execution (after first module complete)

**Question:** "I see this requires implementing [X] modules. Would you like me to: A) Implement all modules without pausing, or B) Pause after the first module for review?"

**Options:**
- A) Implement all modules in sequence
- B) Pause after first module for review

**When to use:** When implementing multiple modules and want to verify first module before continuing

---

## Agent Hand-off Patterns

### Automatic Hand-offs

These hand-offs happen **automatically** (AI proactively triggers next agent):

| From Agent | To Agent | Trigger Condition |
|------------|----------|-------------------|
| brainstorming-agent | requirements-agent | Vision document moved to /requirements/ |
| requirements-agent | developer-agent | Requirements complete |
| developer-agent | test-writer | Implementation complete |
| test-writer | test-runner-debugger | Tests written |
| test-runner-debugger | project-documentation-writer | All tests pass |
| project-documentation-writer | code-review-agent | Docs updated |

### Smart Loop-Back (from code-review-agent)

code-review-agent identifies issues and recommends which agent should fix them:

| Issue Type | Loop Back To | Example |
|------------|--------------|---------|
| Build failures, TypeScript errors | developer-agent | "Build fails with errors in wedding-form.tsx" |
| Missing tests, test coverage gaps | test-writer | "No tests for Confirmations module" |
| Test failures | test-runner-debugger | "Wedding tests failing after form changes" |
| Documentation outdated/incomplete | project-documentation-writer | "MODULE_REGISTRY.md not updated" |
| Unclear requirements | requirements-agent | "Requirements don't specify sponsor table schema" |

---

## Common Scenarios

### Scenario 1: Creating a New Module

**User Request:** "Create a Confirmations module"

**Workflow:**
1. **brainstorming-agent**
   - Creates `/brainstorming/2025-12-02-confirmations-module.md`
   - Captures user stories, scope, success criteria
   - Moves to `/requirements/2025-12-02-confirmations-module.md`

2. **requirements-agent**
   - Reads vision document
   - Searches codebase for patterns
   - Adds database schema, server actions, UI components, testing needs

3. **developer-agent**
   - Creates migration for confirmations table
   - Implements 8 module files
   - Creates server actions

4. **test-writer**
   - Writes `tests/confirmations.spec.ts`
   - Updates TESTING_REGISTRY.md

5. **test-runner-debugger**
   - Runs tests, verifies all pass

6. **project-documentation-writer**
   - Updates MODULE_REGISTRY.md
   - Updates TESTING_REGISTRY.md
   - Creates module-specific docs if needed

7. **code-review-agent**
   - Reviews build, lint, tests, docs
   - Verdict: READY TO COMMIT

### Scenario 2: Debugging Test Failures

**User Report:** "Wedding tests are failing"

**Workflow:**
1. **test-runner-debugger**
   - Runs `npm test tests/weddings.spec.ts`
   - Analyzes error: missing <Label> in form
   - Identifies: App code issue (not test issue)

2. **developer-agent** (loop back)
   - Adds proper <Label> components
   - Follows FORMS.md patterns

3. **test-runner-debugger** (re-run)
   - Tests now pass

4. **code-review-agent**
   - Reviews form changes
   - Verdict: READY TO COMMIT

### Scenario 3: Performance Optimization

**User Report:** "Weddings list page is slow"

**Workflow:**
1. **qa-specialist**
   - Runs Lighthouse
   - Identifies: Rendering all 100 cards without virtualization
   - Creates `/requirements/2025-12-02-weddings-performance.md`

2. **developer-agent**
   - Implements virtualization
   - Optimizes queries

3. **test-runner-debugger**
   - Runs wedding tests
   - Verifies behavior unchanged

4. **qa-specialist** (re-check)
   - Confirms performance improved

5. **code-review-agent**
   - Final review

### Scenario 4: Deployment to Production

**User Request:** "Deploy Confirmations module to production"

**Workflow:**
1. **qa-specialist**
   - Performance audit
   - Security audit
   - Accessibility check

2. **code-review-agent**
   - Final code review
   - All quality gates pass

3. **release-agent**
   - Creates `/releases/2025-12-02-confirmations-module.md`
   - Validates environment
   - Deploys to staging
   - Smoke tests pass
   - Deploys to production
   - Updates release document with results

---

## Quality Gates

Each agent enforces specific quality gates before passing work to the next agent.

### brainstorming-agent → requirements-agent
- [ ] Vision document created in `/brainstorming/`
- [ ] Feature overview clear
- [ ] User stories documented
- [ ] Success criteria defined
- [ ] Scope defined (in/out)
- [ ] User confirmed vision
- [ ] Document moved to `/requirements/`

### requirements-agent → developer-agent
- [ ] Vision document expanded with technical specs
- [ ] Database schema specified
- [ ] Server actions listed
- [ ] UI components identified
- [ ] Testing requirements documented
- [ ] Codebase searched for patterns
- [ ] Status updated to "Ready for Development"

### developer-agent → test-writer
- [ ] Implementation complete
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] All required files created
- [ ] Follows project patterns
- [ ] Migration files created (if database changes)

### test-writer → test-runner-debugger
- [ ] Test file created in `/tests/`
- [ ] Tests cover happy path, errors, edge cases
- [ ] Test uses proper selectors (role > label > testId)
- [ ] TESTING_REGISTRY.md updated

### test-runner-debugger → project-documentation-writer
- [ ] All tests pass
- [ ] No test failures or errors
- [ ] Implementation stable

### project-documentation-writer → code-review-agent
- [ ] MODULE_REGISTRY.md updated (if applicable)
- [ ] COMPONENT_REGISTRY.md updated (if applicable)
- [ ] Guide docs updated with new patterns
- [ ] Cross-references added
- [ ] File size limits respected (<1000 lines)

### code-review-agent → release-agent (or DONE)
- [ ] Build passes
- [ ] Lint passes
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Database migrations safe (if any)
- [ ] No critical issues found
- [ ] Feedback file created in `/requirements/`

---

## Best Practices

### 1. Always Use the Right Agent for the Task
- **Brainstorming?** → brainstorming-agent (not requirements-agent)
- **Technical analysis?** → requirements-agent (not developer-agent)
- **Update /docs/?** → project-documentation-writer (not user-documentation-writer)
- **End-user guides?** → user-documentation-writer (not project-documentation-writer)

### 2. Respect Folder Ownership
- brainstorming-agent creates in `/brainstorming/`, moves to `/requirements/`
- requirements-agent expands files in `/requirements/`
- developer-agent creates in `/src/`
- test-writer creates in `/tests/`
- project-documentation-writer updates `/docs/`
- release-agent creates in `/releases/`

### 3. Use Gates Wisely
- **Don't skip gates for complex features** - Take time to review vision and requirements
- **Auto-continue for simple changes** - Speed up workflow when confident
- **Use multi-module gate** - Catch issues early before implementing all modules

### 4. Trust the Smart Loop-Back
- code-review-agent will identify the right agent to fix issues
- Don't manually route - let code-review-agent decide
- Follow the recommended order for multiple issues

### 5. Document Everything
- brainstorming-agent captures vision
- requirements-agent captures technical specs
- code-review-agent creates review feedback
- release-agent creates deployment logs
- This creates a complete audit trail

---

## Summary

**The Outward Sign workflow ensures:**
- ✅ Creative vision captured before technical analysis
- ✅ Clear folder ownership and organization
- ✅ Systematic quality gates at each step
- ✅ Smart loop-back for efficient issue resolution
- ✅ Complete documentation from idea to deployment
- ✅ Audit trail of all decisions and changes

**Key Takeaway:** When in doubt, start with brainstorming-agent for new features, and let the workflow guide you through the process.
