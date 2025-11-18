# Orchestrator System

> **Autonomous Development Agent System for Outward Sign**

The Orchestrator is a Python-based system that manages multiple Claude Code agents to execute daily development tasks autonomously. It provides a daily workflow: define tasks in the morning, let agents work throughout the day, review results in the evening.

## Quick Start

### 1. Install Dependencies

```bash
cd orchestrator
pip install -r requirements.txt
```

### 2. Create a Task File

Create a task file for today's work (e.g., `tasks/2025-11-18.yaml`):

```yaml
date: 2025-11-18
max_cost_usd: 50.00

tasks:
  - id: task-001
    name: "Your task name"
    description: |
      Detailed description of what needs to be done
    module: baptisms
    estimated_complexity: medium
    context_files:
      - CLAUDE.md
      - docs/MODULE_DEVELOPMENT.md
    deliverables:
      - path/to/expected/file.ts
```

See `tasks/example-2025-11-18.yaml` for a complete example.

### 3. Start the Orchestrator

```bash
python orchestrator.py start tasks/2025-11-18.yaml
```

The orchestrator will:
- Spawn Claude Code agents for each task
- Monitor their progress
- Track costs and tokens
- Alert you via Telegram when questions arise
- Generate an end-of-day report

### 4. Review Results

After agents complete (or at end of day):

```bash
python orchestrator.py report tasks/2025-11-18.yaml
```

Review:
- Report in `results/2025-11-18-report.md`
- Agent workspaces in `agent_workspaces/task-*/`
- Changed files (agents don't commit, so files are unstaged)

### 5. Provide Feedback

Create `feedback/2025-11-18.md` with your assessment:

```markdown
## task-001: Task Name
Rating: 4/5

✅ Great implementation
⚠️  Missing tests

Action: Update agent instructions to require tests for all code changes
```

The orchestrator will learn from your feedback and improve future task execution.

## Daily Workflow

### Morning

1. **Define Tasks** - Create YAML file with today's work
2. **Start Orchestrator** - `python orchestrator.py start tasks/YYYY-MM-DD.yaml`
3. **Go about your day** - Agents work autonomously

### During Day

- **Telegram alerts** - When agents ask questions
- **Answer questions** - Via Telegram or update `agent_questions/{task-id}-answer.md`
- **Monitor status** - `python orchestrator.py status` (optional)

### Evening

1. **Review report** - Read `results/YYYY-MM-DD-report.md`
2. **Check workspaces** - Review agent outputs in `agent_workspaces/`
3. **Test changes** - Manually verify critical changes
4. **Provide feedback** - Create `feedback/YYYY-MM-DD.md`
5. **Commit work** - If satisfied, commit changes to git yourself
6. **Update orchestrator** - Adjust rules/instructions based on learnings

## Architecture

### Components

1. **orchestrator.py** - Main controller
   - Spawns and monitors agents
   - Tracks costs and metrics
   - Sends notifications
   - Generates reports

2. **agent.py** - Agent wrapper
   - Manages Claude Code CLI sessions
   - Enforces safety rules (no git, no db execution)
   - Captures output and logs

3. **metrics.py** - Metrics tracking
   - Token usage and costs
   - Task duration
   - Success/failure rates

4. **telegram_notifier.py** - Telegram integration
   - Critical alerts
   - Question notifications
   - Status updates

5. **config/** - Configuration
   - `constants.py` - System constants
   - `orchestrator_rules.md` - Orchestrator behavior
   - `agent_instructions.md` - Agent instruction template
   - `task_execution_patterns.md` - Proven patterns
   - `code_quality_standards.md` - Quality requirements

### File Structure

```
orchestrator/
├── orchestrator.py              # Main script
├── agent.py                     # Agent manager
├── metrics.py                   # Metrics tracker
├── telegram_notifier.py         # Telegram integration
├── config/                      # Configuration files
├── tasks/                       # Daily task files
├── agent_workspaces/            # Agent working directories
│   └── task-001/
│       ├── agent_instructions.md
│       ├── summary.md
│       └── notes.md
├── agent_status/                # Agent status files (JSON)
├── agent_logs/                  # Agent execution logs
├── agent_questions/             # Agent Q&A files
├── results/                     # Daily reports
└── feedback/                    # Your feedback files
```

## Commands

### Start Orchestrator

```bash
python orchestrator.py start tasks/YYYY-MM-DD.yaml
```

Loads tasks and starts agents. Runs until all agents complete or cost limit reached.

### Generate Report

```bash
python orchestrator.py report tasks/YYYY-MM-DD.yaml
```

Generate (or regenerate) the end-of-day report.

### Check Status

```bash
python orchestrator.py status
```

Show current status of all agents.

## Configuration

### Cost Limits

Edit `config/constants.py`:

```python
MAX_DAILY_COST_USD = 50.00  # Maximum spend per day
COST_WARNING_THRESHOLD = 0.75  # Warn at 75%
```

Or set in task YAML:

```yaml
max_cost_usd: 50.00
```

### Telegram Integration

Set environment variables:

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_CHAT_ID="your-chat-id"
```

Or edit `config/constants.py`:

```python
TELEGRAM_ENABLED = True
TELEGRAM_BOT_TOKEN = "your-token"
TELEGRAM_CHAT_ID = "your-chat-id"
```

To create a Telegram bot:
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token
4. Start a chat with your bot
5. Get your chat ID from https://api.telegram.org/bot<TOKEN>/getUpdates

### Concurrent Agents

Edit `config/constants.py`:

```python
MAX_CONCURRENT_AGENTS = 3  # Max parallel agents
```

Start with 1-2 agents to test, then increase as comfortable.

## Task File Format

See `tasks/example-2025-11-18.yaml` for complete example.

### Minimal Task

```yaml
date: 2025-11-18

tasks:
  - id: task-001
    name: "Task name"
    description: "What to do"
    module: funerals
    estimated_complexity: medium
    deliverables:
      - path/to/file.ts
```

### Full Task Specification

```yaml
date: 2025-11-18
max_cost_usd: 50.00
priority: high

tasks:
  - id: task-001
    name: "Create documentation"
    description: |
      Multi-line description
      with details
    module: baptisms
    estimated_complexity: low|medium|high
    context_files:
      - CLAUDE.md
      - docs/TESTING_GUIDE.md
      - src/app/(main)/baptisms/
    deliverables:
      - docs/NEW_DOC.md
      - Updated docs/MODULE_REGISTRY.md
```

### Complexity Estimates

- **low** (1 hour) - Small changes, simple fixes, documentation updates
- **medium** (2.5 hours) - Features, multi-file changes, test suites
- **high** (4 hours) - New modules, complex features, major refactors

## Safety Features

### What Agents CANNOT Do

- ❌ Stage, commit, or push to git
- ❌ Execute database migrations
- ❌ Delete project files (configurable)
- ❌ Access files outside project
- ❌ Exceed daily cost limit

### What Agents CAN Do

- ✅ Create and modify code files
- ✅ Create migration files (not execute)
- ✅ Run tests
- ✅ Run linting
- ✅ Read documentation
- ✅ Ask questions when stuck

### Monitoring

The orchestrator monitors for:
- Forbidden git operations
- Forbidden database operations
- Cost overruns
- Hung/crashed agents
- Agent questions

Violations result in immediate agent halt and notification.

## Question Handling

When an agent needs clarification:

1. **Agent writes question** → `agent_questions/task-001.md`
2. **Orchestrator detects** → Sends Telegram alert
3. **You provide answer** → Reply via Telegram or edit `task-001-answer.md`
4. **Agent resumes** → Reads answer and continues

Example question file:

```markdown
# Question from Agent task-001

## Context
I'm implementing pagination and found two different patterns...

## Question
Which pattern should I follow?

## Options
A) Pattern from weddings module
B) Pattern from PAGINATION.md

## Impact
Affects consistency across modules
```

Example answer file:

```markdown
# Answer to task-001

Use Pattern B (from PAGINATION.md). This is the newer, standardized pattern.
We should update the weddings module to match eventually.
```

## Learning & Improvement

The orchestrator learns from feedback to improve over time.

### Feedback Format

Create `feedback/YYYY-MM-DD.md`:

```markdown
# Feedback - 2025-11-18

## task-001: Documentation Task
Rating: 5/5

✅ Perfect structure
✅ Great examples

## task-002: Pagination Implementation
Rating: 3/5

⚠️  Forgot to write tests
⚠️  Didn't follow PAGINATION.md exactly

Action: Make testing mandatory in agent instructions
Action: Add PAGINATION.md to default context for pagination tasks

## Orchestrator Performance
- Good: Cost tracking worked well
- Improve: Question notifications were delayed

## Tomorrow's Adjustments
1. Reduce question poll interval to 30 seconds
2. Add automated test running to quality checks
```

### What Gets Learned

High-rated tasks (4-5/5):
- Successful patterns are identified
- Context file selections noted
- Execution approaches documented

Low-rated tasks (1-2/5):
- Common mistakes catalogued
- Missing context files identified
- Instructions updated

Over time, the orchestrator gets better at:
- Selecting relevant context files
- Estimating task complexity and cost
- Avoiding repeated mistakes
- Following proven patterns

## Troubleshooting

### Agents Not Starting

1. Check Claude Code CLI is installed: `which claude`
2. Verify task file is valid YAML
3. Check context files exist
4. Review `agent_logs/task-*.log` for errors

### Cost Limit Hit Too Soon

1. Reduce number of tasks
2. Increase `max_cost_usd` in constants or task file
3. Review task complexity (may be overestimated)
4. Check for agents getting stuck in loops

### Agent Appears Hung

1. Check `agent_status/task-*.json` for last update time
2. Review `agent_logs/task-*.log` for errors
3. Manually kill process if needed
4. Restart with simplified task

### Questions Not Detected

1. Check `QUESTION_POLL_INTERVAL_SECONDS` in constants
2. Verify question file format is correct
3. Check Telegram integration is working
4. Review orchestrator logs

### Report Missing Information

1. Ensure agents write status files regularly
2. Check agent summary files exist
3. Verify metrics tracking is working
4. Re-run: `python orchestrator.py report tasks/YYYY-MM-DD.yaml`

## Best Practices

### Task Definition

- **Be specific** - Clear descriptions get better results
- **Include context** - List all relevant documentation files
- **Set realistic complexity** - Don't underestimate
- **List concrete deliverables** - Makes success measurable

### Monitoring

- **Check in periodically** - Don't let agents run completely unsupervised
- **Answer questions promptly** - Blocked agents waste time and budget
- **Watch costs** - Don't ignore warning notifications
- **Review logs** - If agent seems stuck, check logs for issues

### Feedback

- **Be specific** - "Good job" doesn't help learning
- **Identify patterns** - Note what worked across multiple tasks
- **Update instructions** - Turn learnings into better agent guidance
- **Iterate gradually** - Small improvements compound over time

### Scaling Up

Start small:
1. Begin with 1 agent, simple tasks
2. Review results carefully
3. Refine instructions based on feedback
4. Gradually increase to 2-3 concurrent agents
5. Add more complex tasks as confidence grows

## Future Enhancements

Planned features (not yet implemented):

- [ ] Agent-to-agent communication
- [ ] Automatic context file selection
- [ ] Parallel independent task execution
- [ ] Cost prediction before task start
- [ ] Automated quality checks (linting, tests)
- [ ] Pattern library and recommendations
- [ ] Web dashboard for monitoring
- [ ] Integration with project management tools

## Support

### Getting Help

1. Check `ORCHESTRATOR_DESIGN.md` for architecture details
2. Review configuration files in `config/`
3. Examine example task file: `tasks/example-2025-11-18.yaml`
4. Read agent instruction template: `config/agent_instructions.md`

### Reporting Issues

When reporting issues, include:
- Task file used
- Orchestrator command run
- Error messages
- Relevant log files
- Agent status files

## License

This orchestrator system is part of the Outward Sign project.
