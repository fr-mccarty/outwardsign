# Orchestrator System Design

## Overview

The Orchestrator is a Python-based system that manages multiple Claude Code agents to execute daily development tasks autonomously. It operates on a daily cycle: receive tasks in the morning, execute throughout the day, report results in the evening for review.

## Architecture Principles

### Simple, File-Based Communication
- **No complex message queues** - Agents communicate via text files in shared directories
- **File-based state management** - Task status, agent logs, and results stored as files
- **Telegram for critical questions** - When human input is needed, orchestrator sends Telegram message

### Safety-First Approach
- **No git operations** - Agents cannot stage, commit, or push code
- **No database changes** - Agents can only propose migrations, not execute them
- **Daily cost limits** - Hard cap on Claude API usage per day
- **Human-in-the-loop** - User reviews all work at end of day before committing

### Agent Model
- **Claude Code CLI agents** - Each agent runs as a Claude Code session
- **Task-focused execution** - One agent per major task or module
- **Isolated workspaces** - Agents work independently, communicate via files
- **Compute tracking** - Token usage, API calls, and wall-clock time tracked per agent

## System Components

### 1. Orchestrator Core (`orchestrator.py`)
The main orchestration engine that:
- Parses daily task files (YAML format)
- Spawns Claude Code agents for each task
- Monitors agent progress via status files
- Tracks compute metrics (tokens, cost, time)
- Sends Telegram alerts for critical questions
- Generates end-of-day reports

### 2. Agent Wrapper (`agent.py`)
Python wrapper around Claude Code CLI that:
- Launches Claude Code sessions with specific prompts
- Manages agent workspace directories
- Writes status updates to shared files
- Captures agent output and errors
- Enforces safety boundaries (no git, no db changes)

### 3. Communication Layer (`communication/`)
File-based messaging system:
- **`tasks/`** - Incoming task definitions
- **`agent_workspaces/`** - Per-agent working directories
- **`agent_status/`** - Agent status files (running, blocked, completed)
- **`agent_logs/`** - Agent execution logs
- **`agent_questions/`** - Questions from agents requiring human input
- **`results/`** - Completed work and reports

### 4. Configuration (`config/`)
- **`constants.py`** - System-wide constants (daily cost limit, etc.)
- **`orchestrator_rules.md`** - Rules for orchestrator behavior
- **`agent_instructions.md`** - Instructions template for all agents
- **`task_execution_patterns.md`** - Standard patterns for common tasks
- **`code_quality_standards.md`** - Quality requirements for agent output

### 5. Metrics & Reporting (`metrics.py`)
- Token usage tracking (input/output per agent)
- Cost calculation (based on Claude API pricing)
- Wall-clock time per task
- Success/failure rates
- End-of-day summary report generation

## Daily Workflow

### Morning: Task Definition
1. User creates task file: `tasks/YYYY-MM-DD.yaml`
2. File contains list of tasks with priorities and module context
3. User runs: `python orchestrator/orchestrator.py start tasks/YYYY-MM-DD.yaml`

### During Day: Execution
1. Orchestrator parses task file
2. For each task, spawns a Claude Code agent with:
   - Agent instructions (from `agent_instructions.md`)
   - Task-specific context (module guidelines, relevant docs)
   - Workspace directory for agent output
3. Orchestrator monitors agent status files every 5 minutes
4. If agent writes to `agent_questions/`, orchestrator sends Telegram message
5. User can respond via Telegram or file, orchestrator passes to agent
6. Orchestrator enforces daily cost limit, pauses agents if exceeded

### Evening: Review & Feedback
1. User runs: `python orchestrator/orchestrator.py report tasks/YYYY-MM-DD.yaml`
2. Orchestrator generates comprehensive report:
   - Tasks completed vs. pending
   - Compute metrics (tokens, cost, time per task)
   - Agent questions and resolutions
   - Files created/modified by each agent
   - Quality assessment (tests passed, linting, etc.)
3. User reviews work in agent workspaces
4. User creates feedback file: `feedback/YYYY-MM-DD.md`
5. Orchestrator learns from feedback for next day's execution

## Task File Format

```yaml
# tasks/2025-11-18.yaml
date: 2025-11-18
max_cost_usd: 50.00
priority: high

tasks:
  - id: task-001
    name: "Create Mass Role Preferences documentation"
    description: |
      Document the mass role preferences system including:
      - Database schema
      - Server actions
      - UI components
      - Template system integration
    module: mass-roles
    estimated_complexity: medium
    context_files:
      - docs/MODULE_DEVELOPMENT.md
      - docs/CODE_CONVENTIONS.md
      - src/app/(main)/mass-roles/
    deliverables:
      - docs/MASS_ROLE_PREFERENCES.md
      - Updated MODULE_REGISTRY.md

  - id: task-002
    name: "Implement pagination for Weddings module"
    description: |
      Add pagination to weddings list following PAGINATION.md patterns
    module: weddings
    estimated_complexity: low
    context_files:
      - docs/PAGINATION.md
      - src/app/(main)/weddings/
    deliverables:
      - Updated weddings/page.tsx
      - Updated weddings-list-client.tsx
      - Tests for pagination

  - id: task-003
    name: "Write tests for Baptisms CRUD"
    description: |
      Complete test coverage for baptisms module CRUD operations
    module: baptisms
    estimated_complexity: medium
    context_files:
      - docs/TESTING_GUIDE.md
      - src/app/(main)/baptisms/
    deliverables:
      - tests/baptisms/baptisms-crud.spec.ts
```

## Agent Instructions Template

Each agent receives a prompt based on `config/agent_instructions.md`:

```markdown
You are a Claude Code agent working as part of an orchestrator system.

WORKSPACE: /path/to/agent_workspaces/task-001/
STATUS FILE: /path/to/agent_status/task-001.json
QUESTION FILE: /path/to/agent_questions/task-001.md

TASK:
[Task description from YAML]

CONTEXT:
[Relevant documentation files]

RULES:
1. NO GIT OPERATIONS - You cannot stage, commit, or push code
2. NO DATABASE CHANGES - You can create migration files but not execute them
3. FOLLOW PROJECT CONVENTIONS - Reference CLAUDE.md and docs/ for all patterns
4. ASK QUESTIONS - Write to QUESTION FILE if you need clarification
5. UPDATE STATUS - Write to STATUS FILE every 15 minutes with progress
6. TRACK FILES - Log all files you create/modify in STATUS FILE

DELIVERABLES:
[Expected outputs from YAML]

Begin work. Update your status file immediately.
```

## Status File Format

```json
{
  "task_id": "task-001",
  "agent_id": "agent-task-001",
  "status": "running",
  "started_at": "2025-11-18T09:00:00Z",
  "last_updated": "2025-11-18T09:15:00Z",
  "progress_percent": 25,
  "current_step": "Reading context documentation",
  "steps_completed": [
    "Initialized workspace",
    "Read CLAUDE.md",
    "Read MODULE_DEVELOPMENT.md"
  ],
  "files_created": [],
  "files_modified": [],
  "questions_asked": 0,
  "tokens_used": {
    "input": 45000,
    "output": 12000
  },
  "api_calls": 8,
  "cost_usd": 0.52
}
```

## Telegram Integration

When agent needs human input:

1. Agent writes to `agent_questions/task-001.md`:
```markdown
# Question from Agent task-001
Time: 2025-11-18 14:23:00

## Context
I'm implementing mass role preferences documentation and found inconsistent
terminology between the database schema and the UI components.

## Question
Should I use "mass_role" or "mass_ministry" in the documentation?
The database uses "mass_role" but some UI components say "mass_ministry".

## Options
A) Use "mass_role" consistently (update UI)
B) Use "mass_ministry" consistently (update database schema in migration)
C) Keep both and document the distinction

## Impact
This affects the documentation and may require code changes.
```

2. Orchestrator detects new question file
3. Orchestrator sends Telegram message to user
4. User responds via Telegram or updates answer file
5. Orchestrator writes answer to `agent_questions/task-001-answer.md`
6. Agent reads answer and continues

## End-of-Day Report Format

```markdown
# Orchestrator Report - 2025-11-18

## Summary
- Tasks Completed: 2/3
- Tasks In Progress: 1/3
- Total Cost: $42.35 / $50.00 (85% of daily limit)
- Total Time: 6h 23m
- Questions Asked: 3 (all answered)

## Task Results

### ✅ task-001: Mass Role Preferences Documentation
- Status: COMPLETED
- Time: 2h 15m
- Cost: $18.20
- Tokens: 156,432 input / 42,108 output
- Deliverables:
  - ✅ docs/MASS_ROLE_PREFERENCES.md (created)
  - ✅ MODULE_REGISTRY.md (updated)
- Quality:
  - ✅ Follows CODE_CONVENTIONS.md
  - ✅ Proper markdown formatting
  - ⚠️  No spell-check run (manual review needed)

### ✅ task-002: Weddings Pagination
- Status: COMPLETED
- Time: 1h 45m
- Cost: $12.80
- Tokens: 98,223 input / 31,445 output
- Deliverables:
  - ✅ weddings/page.tsx (updated)
  - ✅ weddings-list-client.tsx (updated)
  - ✅ tests/weddings/pagination.spec.ts (created)
- Quality:
  - ✅ Tests pass (3/3)
  - ✅ Follows PAGINATION.md patterns
  - ✅ Linting clean

### 🔄 task-003: Baptisms CRUD Tests
- Status: IN PROGRESS (78% complete)
- Time: 2h 23m
- Cost: $11.35
- Tokens: 89,556 input / 28,992 output
- Progress:
  - ✅ Create baptism test
  - ✅ Read baptism test
  - ✅ Update baptism test
  - 🔄 Delete baptism test (blocked - needs clarification on soft delete)
- Blockers:
  - Question: Should baptisms use soft delete or hard delete? (asked at 15:34)

## Questions & Answers

1. **task-001 @ 14:23** - Use "mass_role" or "mass_ministry"?
   - Answer: Use "mass_role" consistently (Option A)
   - Resolution time: 12 minutes

2. **task-002 @ 11:15** - Pagination default page size?
   - Answer: 20 items per page (follow existing pattern)
   - Resolution time: 8 minutes

3. **task-003 @ 15:34** - Soft delete or hard delete for baptisms?
   - Answer: PENDING (not yet answered)

## Files Changed

### Created (5 files)
- docs/MASS_ROLE_PREFERENCES.md
- tests/weddings/pagination.spec.ts
- tests/baptisms/baptisms-crud.spec.ts
- agent_workspaces/task-001/notes.md
- agent_workspaces/task-002/pagination-testing-log.md

### Modified (3 files)
- docs/MODULE_REGISTRY.md
- src/app/(main)/weddings/page.tsx
- src/app/(main)/weddings/weddings-list-client.tsx

## Recommendations for Tomorrow

1. Answer pending question for task-003
2. Review all documentation for consistency
3. Consider adding automated spell-check to documentation tasks
4. Allocate more time for testing tasks (estimated 2h, took 2h 23m)

## Cost Breakdown by Task Type
- Documentation: $18.20 (43%)
- Implementation: $12.80 (30%)
- Testing: $11.35 (27%)

## Next Steps
1. Review files in agent_workspaces/
2. Test changes manually
3. Provide feedback in feedback/2025-11-18.md
4. If satisfied, commit changes with detailed commit messages
5. Update orchestrator rules based on learnings
```

## Feedback Loop

User creates feedback file:

```markdown
# Feedback - 2025-11-18

## task-001: Mass Role Preferences Documentation
Rating: 4/5

✅ Great structure and clarity
✅ Followed conventions well
⚠️  Missing examples of actual UI components
⚠️  Could use more cross-references to related docs

Action: Update agent instructions to always include code examples in docs

## task-002: Weddings Pagination
Rating: 5/5

✅ Perfect implementation
✅ Tests are comprehensive
✅ Followed PAGINATION.md exactly

Action: Use this as reference example for future pagination tasks

## task-003: Baptisms CRUD Tests
Rating: 3/5

⚠️  Should have asked about delete strategy earlier (at planning stage)
⚠️  Tests could be more descriptive (better test names)

Action: Add delete strategy discussion to task planning phase
Action: Update testing guidelines with better test naming examples

## Orchestrator Performance
- Good: Question notification via Telegram worked well
- Improve: Need faster question detection (5min polling too slow)
- Improve: Cost tracking should warn at 75%, not just stop at 100%

## Tomorrow's Adjustments
1. Poll for questions every 1 minute instead of 5
2. Add cost warning threshold at 75%
3. Update agent instructions to include code examples for all docs
4. Add delete strategy as required field in task YAML for CRUD tasks
```

## Learning & Improvement

Orchestrator maintains a learning database:

**`learning/patterns.json`**
```json
{
  "successful_patterns": [
    {
      "pattern": "pagination_implementation",
      "reference_task": "task-002",
      "date": "2025-11-18",
      "rating": 5,
      "key_factors": [
        "Had PAGINATION.md as context",
        "Followed existing module example",
        "Included tests from start"
      ]
    }
  ],
  "common_mistakes": [
    {
      "mistake": "missing_code_examples_in_docs",
      "frequency": 3,
      "tasks": ["task-001", "task-015", "task-023"],
      "solution": "Updated agent instructions to require examples"
    }
  ],
  "question_patterns": [
    {
      "question_type": "delete_strategy",
      "should_ask_at": "planning_stage",
      "update": "Added to task YAML required fields"
    }
  ]
}
```

## Implementation Priority

### Phase 1: Core Orchestrator (First Implementation)
1. Basic task YAML parser
2. Simple agent spawning (one agent at a time for now)
3. File-based status tracking
4. End-of-day report generation
5. Basic cost tracking

### Phase 2: Communication & Safety
1. Question detection and file-based Q&A
2. Telegram integration
3. Cost limit enforcement
4. Agent workspace management

### Phase 3: Intelligence & Learning
1. Feedback parsing
2. Pattern recognition
3. Automatic instruction refinement
4. Task complexity estimation

### Phase 4: Advanced Features
1. Parallel agent execution
2. Agent-to-agent communication
3. Automatic context file selection
4. Predictive cost modeling

## Technical Stack

- **Python 3.11+** - Orchestrator implementation
- **YAML** - Task definition files
- **JSON** - Status files and metrics
- **Markdown** - Documentation, reports, questions, feedback
- **Claude Code CLI** - Agent execution
- **Telegram Bot API** - Critical notifications
- **File system** - All communication and state management

## File Structure

```
orchestrator/
├── ORCHESTRATOR_DESIGN.md          # This file
├── README.md                        # Quick start guide
├── requirements.txt                 # Python dependencies
├── orchestrator.py                  # Main orchestrator
├── agent.py                         # Agent wrapper
├── metrics.py                       # Metrics tracking
├── telegram_notifier.py             # Telegram integration
├── config/
│   ├── constants.py                 # System constants
│   ├── orchestrator_rules.md        # Orchestrator behavior rules
│   ├── agent_instructions.md        # Agent instruction template
│   ├── task_execution_patterns.md   # Standard task patterns
│   └── code_quality_standards.md    # Quality requirements
├── tasks/                           # Daily task files (YAML)
│   └── 2025-11-18.yaml
├── agent_workspaces/                # Per-agent working directories
│   ├── task-001/
│   ├── task-002/
│   └── task-003/
├── agent_status/                    # Agent status files (JSON)
│   ├── task-001.json
│   ├── task-002.json
│   └── task-003.json
├── agent_logs/                      # Agent execution logs
│   ├── task-001.log
│   ├── task-002.log
│   └── task-003.log
├── agent_questions/                 # Agent questions and answers
│   ├── task-001.md
│   ├── task-001-answer.md
│   └── task-003.md
├── results/                         # Completed work and reports
│   └── 2025-11-18-report.md
├── feedback/                        # User feedback files
│   └── 2025-11-18.md
└── learning/                        # Learning database
    └── patterns.json
```

## Next Steps

1. Review this design document
2. Answer any clarifying questions
3. Implement Phase 1 core orchestrator
4. Test with a simple task file
5. Iterate based on initial results
