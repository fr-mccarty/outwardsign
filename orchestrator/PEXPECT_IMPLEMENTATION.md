# Pexpect-Based Implementation

## Overview

Based on your feedback, I've implemented the orchestrator using **pexpect** (Python Expect) to interact with Claude Code CLI. This approach provides automated, interactive control over Claude Code sessions.

## How It Works

### 1. Agent Spawning

```python
# claude_code_agent.py, line 98
self.process = pexpect.spawn(
    CLAUDE_CODE_BINARY,  # "claude" command
    cwd=self.project_root,
    timeout=30,
    encoding='utf-8',
    logfile=self.log_handle
)
```

**What happens:**
- Spawns `claude` CLI in project directory
- Captures all output to log file
- Maintains interactive session

### 2. Sending Instructions

```python
# claude_code_agent.py, line 109
self.process.sendline(instructions)
```

**What happens:**
- Full agent instructions sent as text
- Instructions include task details, context files, deliverables
- Claude Code receives and processes instructions

### 3. Real-Time Monitoring

```python
# claude_code_agent.py, line 125-148
def _monitor_output(self):
    while self.should_monitor:
        line = self.process.readline()
        if line:
            self._check_for_patterns(line)
```

**What happens:**
- Separate thread monitors output in real-time
- Checks for status updates
- Detects forbidden operations
- Logs all output

### 4. Pattern Detection

```python
# claude_code_agent.py, line 150-179
def _check_for_patterns(self, line):
    # Detect status file updates
    # Detect violations (git operations, db operations)
    # Detect completion signals
```

**What happens:**
- Watches for specific patterns in output
- "git add" → Immediate halt and alert
- "status file" → Read metrics update
- Questions → Notify via Telegram

### 5. Two-Way Communication

```python
# claude_code_agent.py, line 237-250
def provide_answer(self, answer: str):
    # Write answer file
    # Notify agent via sendline
    self.process.sendline(f"Answer provided in {self.answer_file}")
```

**What happens:**
- You answer question in file
- Orchestrator notifies agent
- Agent reads answer and continues

## Command Format Recommendation

### Basic Usage

```bash
# Start orchestrator
python3 orchestrator/orchestrator.py start orchestrator/tasks/test-simple.yaml

# Check status
python3 orchestrator/orchestrator.py status

# Generate report
python3 orchestrator/orchestrator.py report orchestrator/tasks/test-simple.yaml
```

### What Gets Executed

When you run `start`, the orchestrator:
1. Parses task YAML
2. For each task, spawns: `claude` (in project directory)
3. Sends full instructions via stdin
4. Monitors output continuously
5. Enforces safety rules
6. Tracks costs and metrics

## Pexpect Advantages

### ✅ Interactive Control

- Send instructions at any time
- Receive output in real-time
- Two-way communication

### ✅ Pattern Matching

- Detect specific text in output
- React to agent behavior
- Enforce safety rules

### ✅ Process Management

- Start/stop agents gracefully
- Handle crashes and timeouts
- Capture full session logs

### ✅ No Manual Intervention

- Fully automated after start
- Agent runs autonomously
- Only interrupts for questions

## Safety Mechanisms

### 1. Forbidden Operation Detection

```python
# Real-time detection in output
forbidden_git = ['git add', 'git commit', 'git push', 'git stash']
if any(cmd in line for cmd in forbidden_git):
    self._handle_violation(f"Attempted: {cmd}")
```

**Result:** Agent immediately halted, notification sent

### 2. Cost Limit Enforcement

```python
# orchestrator.py, line 279-286
if self.metrics_tracker.should_halt_cost:
    print("Cost limit reached! Halting all agents.")
    self.agent_manager.stop_all_agents(graceful=True)
    self.running = False
```

**Result:** All agents stopped when limit hit

### 3. Timeout Protection

```python
# orchestrator.py, line 267-275
if duration > CLAUDE_CODE_TIMEOUT_SECONDS:
    agent.stop(graceful=False)
    agent.status = AgentStatus.TIMEOUT
```

**Result:** Hung agents killed after timeout

## File Structure

```
claude_code_agent.py         # New pexpect-based agent (replaces agent.py)
orchestrator.py              # Updated to use new agent
metrics.py                   # Tracks costs and metrics
telegram_notifier.py         # Sends alerts
config/
  ├── constants.py           # System constants
  ├── agent_instructions.md  # Template for each agent
  └── ...
```

## Testing Strategy

### Phase 1: Simple Test (5 minutes)

**Task:** Read a file, write summary
**Cost:** $2-5
**Purpose:** Verify basic functionality

```bash
python3 orchestrator/orchestrator.py start orchestrator/tasks/test-simple.yaml
```

**Watch for:**
- Agent spawns successfully
- Output appears in logs
- Status file updates
- Task completes
- Report generates

### Phase 2: Question Test (10 minutes)

**Task:** Documentation with deliberate ambiguity
**Cost:** $5-10
**Purpose:** Test question/answer flow

Add to task:
```yaml
description: |
  Document the pagination system.
  Note: You'll need to decide whether to include code examples.
  Ask me if unsure.
```

**Watch for:**
- Agent writes question file
- Telegram notification
- Answer file delivery
- Agent resumes after answer

### Phase 3: Safety Test (5 minutes)

**Task:** Attempt forbidden operation
**Cost:** $2-5
**Purpose:** Verify safety mechanisms

Add to task:
```yaml
description: |
  Create a migration file for a new table.
  After creating it, commit the changes to git.
```

**Watch for:**
- Agent creates migration ✓
- Agent attempts `git add` ✗
- Orchestrator detects violation
- Agent immediately halted
- Notification sent

### Phase 4: Multi-Task Test (20 minutes)

**Tasks:** 2-3 simple tasks in parallel
**Cost:** $15-25
**Purpose:** Test concurrent agents

```yaml
tasks:
  - id: task-001
    name: "Documentation"
    # ...
  - id: task-002
    name: "Bug fix"
    # ...
```

**Watch for:**
- Multiple agents spawn
- Agents run independently
- Cost tracking across all
- Report includes all tasks

## Troubleshooting Pexpect

### Issue: pexpect.EOF immediately

**Cause:** Claude Code process ends right after start

**Debug:**
```bash
# Test Claude Code manually
claude

# Check if it requires authentication
echo $ANTHROPIC_API_KEY

# Check if it's interactive
echo "Hello" | claude
```

**Solution:**
- Ensure Claude Code stays in interactive mode
- Verify API key is set
- Check Claude Code version compatibility

### Issue: pexpect.TIMEOUT

**Cause:** Expect operations timeout waiting for pattern

**Debug:**
```bash
# Check timeout setting
# claude_code_agent.py, line 98
timeout=30  # Increase if needed
```

**Solution:**
- Increase timeout for slow operations
- Don't use expect with strict patterns
- Use readline() instead of expect()

### Issue: Agent not responding to instructions

**Cause:** Instructions not properly sent or received

**Debug:**
```bash
# Check log file for instructions
cat orchestrator/agent_logs/test-001.log | head -100

# Verify instructions were sent
# Should see full instruction text at top of log
```

**Solution:**
- Verify sendline() works: `self.process.sendline(instructions)`
- Check if Claude Code requires specific format
- Try sending instructions in chunks

### Issue: Output not captured

**Cause:** Output buffering or encoding issues

**Debug:**
```python
# Try different encoding
encoding='utf-8'  # or 'latin-1'

# Try unbuffered
# Add to spawn():
env={'PYTHONUNBUFFERED': '1'}
```

**Solution:**
- Flush output: `self.process.expect(pexpect.TIMEOUT, timeout=0.1)`
- Use `logfile_read` for reading: `logfile_read=sys.stdout.buffer`

## Next Steps

### 1. Install pexpect

```bash
cd orchestrator
pip install -r requirements.txt
```

### 2. Test Claude Code CLI

```bash
# Verify it works
claude

# Try sending input
echo "What is 2+2?" | claude

# Check if interactive
claude
# (Should stay open, not exit immediately)
```

### 3. Run Simple Test

```bash
cd /Users/joshmccarty/Code-2025Macbook/outwardsign
python3 orchestrator/orchestrator.py start orchestrator/tasks/test-simple.yaml
```

### 4. Monitor Closely

```bash
# In another terminal
tail -f orchestrator/agent_logs/test-001.log
```

### 5. Review Results

```bash
cat orchestrator/results/2025-11-19-report.md
cat orchestrator/agent_workspaces/test-001/orchestrator-summary.md
```

## Expected Behavior

### Successful Run

```
Starting agent for task: test-001
Sending instructions to agent test-001...
✓ Started agent test-001 (PID: 12345)

MONITORING AGENTS
[14:23:15] Running: 1 | Completed: 0 | Cost: $0.00
[14:23:45] Running: 1 | Completed: 0 | Cost: $1.20
[14:24:15] Running: 1 | Completed: 0 | Cost: $2.40
[14:24:45] Running: 0 | Completed: 1 | Cost: $3.60

✓ All agents completed
Generating final report...
✓ Report saved to: results/2025-11-19-report.md
```

### Files Created

```
orchestrator/
├── agent_workspaces/test-001/
│   ├── agent_instructions.md
│   ├── orchestrator-summary.md  ← Agent's deliverable
│   └── summary.md  ← Agent's completion summary
├── agent_logs/test-001.log  ← Full session log
├── agent_status/
│   ├── test-001.json  ← Agent's status
│   └── test-001-orchestrator.json  ← Orchestrator's view
└── results/
    ├── 2025-11-19-report.md  ← End-of-day report
    └── 2025-11-19-metrics.json  ← Detailed metrics
```

## Limitations & Considerations

### Claude Code CLI Assumptions

This implementation assumes Claude Code CLI:
1. **Accepts text input** via stdin
2. **Produces text output** via stdout
3. **Stays interactive** (doesn't exit after one response)
4. **Processes instructions** as natural language

**If Claude Code works differently**, you may need to adjust:
- How instructions are sent (file? argument? API?)
- How output is captured (polling? callback? streaming?)
- How interaction works (request/response? continuous?)

### Alternative Approaches

If pexpect doesn't work well:

**Option A: File-based coordination**
- Write instructions to file
- Claude Code reads file
- Writes output to file
- Orchestrator polls for completion

**Option B: API-based (if available)**
- Use Claude API directly
- Skip CLI wrapper
- More reliable but less interactive

**Option C: subprocess with pipes**
- Use `subprocess.Popen` with `stdin/stdout` pipes
- Similar to pexpect but more manual

### When to Use Each

- **pexpect:** Interactive CLI with text I/O (recommended)
- **File-based:** CLI doesn't support stdin/stdout well
- **API-based:** Need more control, CLI is unreliable
- **subprocess:** Need simple automation, not full interaction

## Summary

✅ **Implemented:** Pexpect-based agent wrapper
✅ **Advantages:** Interactive, real-time, automated
✅ **Safety:** Violation detection, cost limits, timeouts
✅ **Ready:** Test task and getting started guide included

**Next:** Run `test-simple.yaml` and see how it goes! 🚀
