# Orchestrator Quick Reference

## Commands

```bash
# Start orchestrator with task file
python3 orchestrator/orchestrator.py start orchestrator/tasks/YYYY-MM-DD.yaml

# Check current status
python3 orchestrator/orchestrator.py status

# Generate/view report
python3 orchestrator/orchestrator.py report orchestrator/tasks/YYYY-MM-DD.yaml
```

## Directory Structure

```
orchestrator/
├── tasks/                    # Your daily task files (CREATE THESE)
├── feedback/                 # Your feedback files (CREATE THESE)
├── agent_workspaces/         # Agent working directories (AUTO-GENERATED)
├── agent_status/             # Agent status files (AUTO-GENERATED)
├── agent_logs/               # Agent execution logs (AUTO-GENERATED)
├── agent_questions/          # Agent Q&A (AUTO-GENERATED)
├── results/                  # Daily reports (AUTO-GENERATED)
└── config/                   # Configuration files
    ├── constants.py          # EDIT THIS: Set daily cost limit
    ├── orchestrator_rules.md
    ├── agent_instructions.md
    ├── task_execution_patterns.md
    └── code_quality_standards.md
```

## Task File Template

```yaml
# tasks/YYYY-MM-DD.yaml
date: 2025-11-19
max_cost_usd: 50.00

tasks:
  - id: task-001
    name: "Task Name"
    description: |
      Detailed description of what to do.
      Be specific and clear.

    module: weddings
    estimated_complexity: low|medium|high

    context_files:
      - CLAUDE.md
      - docs/MODULE_DEVELOPMENT.md
      - src/app/(main)/weddings/

    deliverables:
      - path/to/expected/file.ts
      - Updated docs/MODULE_REGISTRY.md
```

## Complexity Estimates

- **low** (1 hour, $5-15) - Documentation, small fixes, single-file changes
- **medium** (2.5 hours, $15-30) - Features, multi-file changes, test suites
- **high** (4 hours, $30-60) - New modules, complex refactors, major features

## Daily Workflow

### Morning (10 min)
1. Create `tasks/YYYY-MM-DD.yaml`
2. Run: `python3 orchestrator/orchestrator.py start tasks/YYYY-MM-DD.yaml`
3. Verify agents start successfully

### During Day (passive)
- Respond to Telegram alerts
- Answer questions in `agent_questions/`

### Evening (30 min)
1. Review `results/YYYY-MM-DD-report.md`
2. Check `agent_workspaces/` for deliverables
3. Test critical changes
4. Create `feedback/YYYY-MM-DD.md`
5. Commit good work with git (manually)

## Answering Agent Questions

When agent asks a question:

1. **Read:** `agent_questions/task-001.md`
2. **Answer:** Create `agent_questions/task-001-answer.md`

```markdown
# Answer to task-001

Use option A. Here's why:
[Your explanation]

Proceed with [specific guidance].
```

## Feedback Template

```markdown
# Feedback - YYYY-MM-DD

## task-001: Task Name
Rating: 4/5

✅ What worked:
- [Positive observation]

⚠️ What needs improvement:
- [Issue identified]

Action: [How to fix for next time]

## Orchestrator Performance
- Good: [What worked well]
- Improve: [What needs adjustment]

## Tomorrow's Adjustments
1. [Specific change to make]
2. [Another improvement]
```

## Configuration

### Set Daily Cost Limit

`config/constants.py` line 14:
```python
MAX_DAILY_COST_USD = 50.00  # Change this
```

### Configure Telegram

Environment variables:
```bash
export TELEGRAM_BOT_TOKEN="your-token"
export TELEGRAM_CHAT_ID="your-chat-id"
```

Or `config/constants.py`:
```python
TELEGRAM_ENABLED = True
TELEGRAM_BOT_TOKEN = "your-token"
TELEGRAM_CHAT_ID = "your-chat-id"
```

### Adjust Concurrent Agents

`config/constants.py` line 26:
```python
MAX_CONCURRENT_AGENTS = 3  # Start with 1-2
```

## Monitoring

### Check Agent Status
```bash
python3 orchestrator/orchestrator.py status
```

### View Agent Logs (Real-time)
```bash
tail -f orchestrator/agent_logs/task-001.log
```

### Check Cost
```bash
cat orchestrator/results/YYYY-MM-DD-metrics.json | grep cost
```

### View Agent Workspace
```bash
ls orchestrator/agent_workspaces/task-001/
cat orchestrator/agent_workspaces/task-001/summary.md
```

## Emergency Procedures

### Stop All Agents
```
Ctrl+C in orchestrator terminal
```
(Agents stop gracefully)

### Force Kill Agent
```bash
ps aux | grep claude
kill -9 <PID>
```

### Reset Everything
```bash
rm -rf orchestrator/agent_*
rm -rf orchestrator/results/
rm -rf orchestrator/learning/
```
(Keeps tasks, feedback, config)

## Common Issues

### "claude: command not found"
**Fix:** Set full path in `config/constants.py`:
```python
CLAUDE_CODE_BINARY = "/full/path/to/claude"
```

### Agent appears hung
**Debug:**
```bash
cat orchestrator/agent_status/task-001.json
tail -50 orchestrator/agent_logs/task-001.log
```

### Cost warning immediately
**Fix:** Increase limit or simplify task:
```python
MAX_DAILY_COST_USD = 100.00
```

### No Telegram notifications
**Test:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Test"
```

## Cost Management

### Current Pricing (Sonnet 4.5)
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

### Typical Costs
- Simple doc task: $5-10
- Medium implementation: $15-25
- Complex module: $30-50

### Budget Recommendations
- Testing: $10-20/day (1-2 tasks)
- Light: $30-40/day (2-3 tasks)
- Normal: $50-75/day (3-5 tasks)
- Heavy: $100+/day (5-10 tasks)

## Safety Features

### What Agents CANNOT Do
- ❌ `git add`, `git commit`, `git push`
- ❌ `supabase db push`, `npm run db:fresh`
- ❌ Exceed daily cost limit
- ❌ Access files outside project

### What Agents CAN Do
- ✅ Create/modify code files
- ✅ Create migration files (not execute)
- ✅ Run tests and linting
- ✅ Read documentation
- ✅ Ask questions

### Violations
- Detected in real-time
- Agent immediately halted
- Telegram notification sent

## Files You Create

### Required Daily
- `tasks/YYYY-MM-DD.yaml` - Define today's work

### Required Evening
- `feedback/YYYY-MM-DD.md` - Rate tasks, provide feedback

### Optional
- `agent_questions/task-*-answer.md` - Answer agent questions

## Files Auto-Generated

- `agent_workspaces/` - Agent scratch space
- `agent_status/` - Real-time status
- `agent_logs/` - Full session logs
- `results/` - Daily reports
- `learning/` - Pattern database

## Documentation

- `README.md` - Overview and quick start
- `ORCHESTRATOR_DESIGN.md` - Complete architecture
- `GETTING_STARTED.md` - Step-by-step first run
- `PEXPECT_IMPLEMENTATION.md` - Technical details
- `QUICK_REFERENCE.md` - This file
- `IMPLEMENTATION_SUMMARY.md` - Design decisions

## Getting Help

### Read First
1. `GETTING_STARTED.md` - Walkthrough
2. `README.md` - Daily usage
3. `PEXPECT_IMPLEMENTATION.md` - Troubleshooting

### Debug Checklist
- [ ] Check agent logs
- [ ] Check agent status
- [ ] Check orchestrator output
- [ ] Check cost tracking
- [ ] Verify Claude Code works standalone

### Include When Reporting Issues
- Task YAML used
- Command run
- Error messages
- Agent logs (last 50 lines)
- Status files
- Expected vs. actual behavior

---

**Quick Start:** Run test task
```bash
python3 orchestrator/orchestrator.py start orchestrator/tasks/test-simple.yaml
```
