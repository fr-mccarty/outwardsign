# Getting Started with the Orchestrator

This guide will walk you through your first orchestrator run step-by-step.

## Prerequisites

### 1. Python 3.11+

Check your Python version:
```bash
python3 --version
```

### 2. Claude Code CLI

Verify Claude Code is installed and in PATH:
```bash
which claude
```

If not found, you'll need to install or configure Claude Code CLI first.

### 3. Install Dependencies

```bash
cd orchestrator
pip install -r requirements.txt
```

This installs:
- `pyyaml` - Task file parsing
- `pexpect` - Interactive CLI automation
- `requests` - Telegram API (optional)
- `python-telegram-bot` - Telegram integration (optional)
- `python-dateutil` - Date handling

## Configuration

### 1. Set Daily Cost Limit

Edit `config/constants.py` (line 14):

```python
MAX_DAILY_COST_USD = 10.00  # Start with $10 for testing
```

### 2. Configure Telegram (Optional but Recommended)

Create a Telegram bot:

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions to create bot
4. Copy the bot token
5. Start a chat with your new bot (send any message)
6. Get your chat ID from: `https://api.telegram.org/bot<TOKEN>/getUpdates`

Set environment variables:

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token-here"
export TELEGRAM_CHAT_ID="your-chat-id-here"
```

Or edit `config/constants.py`:

```python
TELEGRAM_ENABLED = True
TELEGRAM_BOT_TOKEN = "your-bot-token"
TELEGRAM_CHAT_ID = "your-chat-id"
```

### 3. Verify Project Root

The orchestrator should be run from the project root:

```bash
# You should be in: /Users/joshmccarty/Code-2025Macbook/outwardsign/
pwd
# Output: .../outwardsign
```

## First Test Run

### Test Task: Simple Documentation

Create a simple test task to verify the system works:

**File: `orchestrator/tasks/test-2025-11-19.yaml`**

```yaml
date: 2025-11-19
max_cost_usd: 5.00

tasks:
  - id: test-001
    name: "Test Task - Document Orchestrator System"
    description: |
      This is a simple test task to verify the orchestrator system works.

      Your task:
      1. Read the orchestrator README.md file
      2. Create a simple summary document explaining how the orchestrator works
      3. Write the summary to your workspace directory

      Keep it brief (1-2 paragraphs). This is just a test.

    module: orchestrator
    estimated_complexity: low
    context_files:
      - orchestrator/README.md
      - orchestrator/ORCHESTRATOR_DESIGN.md

    deliverables:
      - A summary file in your workspace directory
```

### Start the Orchestrator

```bash
cd /Users/joshmccarty/Code-2025Macbook/outwardsign
python3 orchestrator/orchestrator.py start orchestrator/tasks/example-2025-11-18.yaml
```

### What to Watch For

1. **Agent Starting**
   ```
   Starting agent for task: test-001
   ✓ Agent test-001 started successfully
   ```

2. **Monitoring Output**
   ```
   [HH:MM:SS] Running: 1 | Completed: 0 | Cost: $0.00
   ```

3. **Telegram Notifications** (if configured)
   - "Orchestrator Started" message
   - Any questions from the agent
   - "Task Completed" or "All Tasks Complete"

4. **Question Alerts** (if agent gets stuck)
   ```
   ❓ QUESTION from agent test-001
   Preview: ...
   Full question in: agent_questions/test-001.md
   ```

### What Should Happen

The agent should:
1. Read the README.md and DESIGN docs
2. Write a brief summary
3. Save it to its workspace
4. Update its status file
5. Complete within 2-5 minutes
6. Cost: $2-5 (small task)

### Manual Monitoring

In another terminal, check status:

```bash
python3 orchestrator/orchestrator.py status
```

Check agent logs:
```bash
tail -f orchestrator/agent_logs/test-001.log
```

Check agent status:
```bash
cat orchestrator/agent_status/test-001.json
```

### If Agent Asks a Question

Answer files are in `orchestrator/agent_questions/`:

1. Read the question: `cat orchestrator/agent_questions/test-001.md`
2. Create answer: `orchestrator/agent_questions/test-001-answer.md`

Example answer file:
```markdown
# Answer to test-001

Go ahead with option A. Keep the summary brief and focus on the daily workflow.
```

### Completion

When the agent completes (or you stop it with Ctrl+C), you'll see:

```
✓ All agents completed
Generating final report...
✓ Report saved to: results/2025-11-19-report.md
```

## Review Results

### 1. Check the Report

```bash
cat orchestrator/results/2025-11-19-report.md
```

Look for:
- Task status (completed/failed/timeout)
- Cost and token usage
- Duration
- Deliverables status

### 2. Check Agent Workspace

```bash
ls orchestrator/agent_workspaces/test-001/
cat orchestrator/agent_workspaces/test-001/summary.md
```

Look for:
- Agent's summary file
- Any notes or scratch files
- The deliverables

### 3. Check Agent Logs

```bash
cat orchestrator/agent_logs/test-001.log
```

Look for:
- Agent's thought process
- Any errors or warnings
- Tool usage

### 4. Check Metrics

```bash
cat orchestrator/results/2025-11-19-metrics.json
```

Look for:
- Exact token counts
- API call counts
- Cost breakdown

## Provide Feedback

Create `orchestrator/feedback/2025-11-19.md`:

```markdown
# Feedback - 2025-11-19

## test-001: Test Task - Document Orchestrator System
Rating: 5/5 (or 1-5 based on results)

✅ What worked well:
- Agent started successfully
- Completed task in reasonable time
- Cost was within budget

⚠️ What needs improvement:
- Instructions could be clearer
- Agent asked unnecessary questions
- Deliverable was not in expected format

## Orchestrator Performance

- Good: Monitoring worked well
- Improve: Telegram notifications were delayed
- Issue: Agent log was hard to read

## Adjustments for Next Run

1. Update agent instructions to be more specific
2. Add more context files for better understanding
3. Test with a more complex task
```

## Common Issues

### Issue: "claude: command not found"

**Solution:** Claude Code CLI is not in PATH.

1. Find where Claude Code is installed: `find ~ -name "claude" -type f 2>/dev/null`
2. Update `config/constants.py` with full path:
   ```python
   CLAUDE_CODE_BINARY = "/full/path/to/claude"
   ```

### Issue: Agent appears hung

**Solution:** Check agent logs and status.

```bash
# Check if process is running
ps aux | grep claude

# Check last status update
cat orchestrator/agent_status/test-001.json

# Check logs for errors
tail -50 orchestrator/agent_logs/test-001.log
```

If truly hung (no updates >15 minutes):
1. Stop orchestrator (Ctrl+C)
2. Kill process: `kill -9 <PID>`
3. Review logs to understand why it hung
4. Adjust task or instructions

### Issue: "pexpect.exceptions.EOF"

**Solution:** Claude Code process ended unexpectedly.

1. Check agent logs for error messages
2. Verify Claude Code works standalone: `claude`
3. Check if Claude Code requires authentication
4. Verify project permissions

### Issue: Cost Warning Immediately

**Solution:** Increase daily limit or reduce task complexity.

```python
# config/constants.py
MAX_DAILY_COST_USD = 20.00  # Increase limit
```

Or simplify task:
- Reduce context files
- Make instructions more focused
- Split into smaller tasks

### Issue: No Telegram Notifications

**Solution:** Verify Telegram configuration.

```bash
# Test Telegram bot manually
curl "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Test"
```

Check `config/constants.py`:
```python
TELEGRAM_ENABLED = True  # Must be True
TELEGRAM_BOT_TOKEN = "..."  # Must be set
TELEGRAM_CHAT_ID = "..."  # Must be set
```

## Next Steps

After successful test run:

### 1. Run a Real Task

Create a task for actual work:

```yaml
date: 2025-11-20
max_cost_usd: 25.00

tasks:
  - id: task-001
    name: "Update PAGINATION.md Documentation"
    description: |
      Review all modules for pagination implementation and update PAGINATION.md
      to document the current standardized approach.

      Include:
      - Current standard pattern (from weddings module)
      - Which modules use pagination
      - Example code snippets
      - Known inconsistencies

    module: documentation
    estimated_complexity: medium
    context_files:
      - docs/PAGINATION.md
      - src/app/(main)/weddings/page.tsx
      - src/app/(main)/weddings/weddings-list-client.tsx
      - src/app/(main)/funerals/page.tsx
      - src/app/(main)/baptisms/page.tsx

    deliverables:
      - Updated docs/PAGINATION.md with standardized patterns
```

### 2. Try Multiple Tasks

Create a task file with 2-3 tasks:

```yaml
date: 2025-11-20
max_cost_usd: 50.00

tasks:
  - id: task-001
    name: "Documentation Task"
    # ... (low complexity)

  - id: task-002
    name: "Bug Fix Task"
    # ... (low complexity)

  - id: task-003
    name: "Test Writing Task"
    # ... (medium complexity)
```

### 3. Establish Daily Routine

**Morning (10 minutes):**
1. Review yesterday's feedback
2. Create today's task YAML
3. Start orchestrator
4. Monitor first 5 minutes for issues

**During Day (passive):**
- Respond to Telegram questions
- Check status occasionally

**Evening (30 minutes):**
1. Review report
2. Test critical changes
3. Provide feedback
4. Commit good work
5. Plan tomorrow's tasks

### 4. Iterate and Improve

After 5-10 runs:
- Refine agent instructions based on patterns
- Update task execution patterns with learnings
- Adjust cost limits based on actual usage
- Automate common workflows

## Tips for Success

### Task Definition

✅ **Good task definition:**
```yaml
- id: task-001
  name: "Add Dark Mode Support to Presentations Module"
  description: |
    Audit presentations module for hardcoded colors and replace with semantic tokens.

    Steps:
    1. Search for: bg-white, text-gray-900, hex colors
    2. Replace with: bg-background, text-foreground, etc.
    3. Test in both light and dark mode
    4. Document changes in workspace notes

  context_files:
    - docs/STYLES.md
    - src/app/(main)/presentations/
  deliverables:
    - Updated presentation module files
    - List of files changed in workspace notes
```

❌ **Bad task definition:**
```yaml
- id: task-001
  name: "Fix presentations"
  description: "Make it work better"
  context_files: []
  deliverables: []
```

### Monitoring

- **First run:** Watch closely, check logs every 5 minutes
- **Stable runs:** Check status every 30 minutes
- **Production runs:** Trust system, respond to Telegram alerts only

### Cost Management

- **Start small:** Single simple task, $5-10 limit
- **Learn costs:** Track actual costs vs. estimates
- **Adjust limits:** Based on task types and daily workload
- **Buffer:** Set limit 20% higher than expected usage

### Feedback Quality

- **Be specific:** "Good" doesn't help learning
- **Note patterns:** "Always forgets tests" → Update instructions
- **Rate honestly:** Don't inflate ratings
- **Action items:** Turn observations into instruction updates

## Getting Help

### Documentation

- `README.md` - Quick reference
- `ORCHESTRATOR_DESIGN.md` - Complete architecture
- `IMPLEMENTATION_SUMMARY.md` - Design decisions
- `GETTING_STARTED.md` - This file

### Debugging

1. **Check logs:** `agent_logs/task-*.log`
2. **Check status:** `agent_status/task-*.json`
3. **Check output:** `agent_workspaces/task-*/`
4. **Check report:** `results/YYYY-MM-DD-report.md`

### Support

Include when asking for help:
- Task YAML used
- Command run
- Error messages
- Agent logs
- Status files
- Expected vs. actual behavior

---

**Ready to start?** Run the test task above and see how it goes! 🚀
