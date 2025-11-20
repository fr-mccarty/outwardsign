# Orchestrator Quick Start Guide

## ✅ Phase 1 Complete!

The core orchestrator is now working and can execute tasks one at a time using Claude CLI.

## What Works Now

- ✅ Load tasks from markdown file
- ✅ Execute tasks one at a time using `claude -p`
- ✅ Save state to JSON file (pause/resume capability)
- ✅ Comprehensive logging per task
- ✅ Auto-approve or manual approval modes
- ✅ Task status tracking (completed, failed, skipped)

## Quick Test

```bash
cd orchestrator
python3 orchestrator.py --task-file examples/example-tasks.md --auto-approve
```

This will:
1. Load 3 example tasks
2. Execute each one automatically (no approval needed)
3. Create log files in `orchestrator_logs/`
4. Save state to `state.json`

## Basic Usage

### Run with Manual Approval

```bash
python3 orchestrator.py --task-file your-tasks.md
```

You'll be prompted to approve each task before it runs.

### Run with Auto-Approve

```bash
python3 orchestrator.py --task-file your-tasks.md --auto-approve
```

All tasks run automatically without prompts.

### Check Status

```bash
python3 orchestrator.py --status
```

Shows current session status, progress, and current task.

### Resume After Pause

```bash
python3 orchestrator.py --resume
```

Continues from where you left off (skips completed tasks).

## Task File Format

Create a markdown file with this structure:

```markdown
# Tasks - YYYY-MM-DD

## Task 1: Task Title
**Type:** database | backend | frontend | documentation | testing
**Priority:** high | medium | low
**Requires Approval:** true | false
**Description:** Brief description of what this task does
**Acceptance Criteria:**
- Criterion 1
- Criterion 2
- Criterion 3

**Claude Instruction:**
Detailed instruction for Claude on how to execute this task. This text is piped directly to Claude CLI.

---

## Task 2: Another Task
**Type:** backend
...
```

## What Happens When You Run

1. **Load Tasks** - Parses markdown file and extracts all tasks
2. **Start Session** - Creates unique session ID (timestamp)
3. **For Each Task:**
   - Check if approval required (if not auto-approve mode)
   - Execute: `echo "instruction" | claude -p "execute following conventions"`
   - Capture output to log file
   - Update task status
   - Save state
4. **Complete** - Show summary of all tasks

## File Structure After Running

```
orchestrator/
├── orchestrator.py              # Main script
├── state.json                   # Current session state
├── test_output.md               # Example output file
│
├── orchestrator_logs/
│   ├── task-1-20251120-220258.log
│   ├── task-2-20251120-220316.log
│   └── task-3-20251120-220341.log
│
├── examples/
│   └── example-tasks.md         # Example task file
│
└── orchestrator_tasks/          # Your task files go here
```

## State File (`state.json`)

Tracks everything about the current session:

```json
{
  "session_id": "20251120-220258",
  "task_file": "examples/example-tasks.md",
  "current_task_index": 3,
  "status": "completed",
  "tasks": [
    {
      "id": 1,
      "title": "Create a simple test file",
      "status": "completed",
      "result": "success",
      "output_log": "/path/to/log"
    }
  ],
  "started_at": "2025-11-20T22:02:58",
  "last_activity": "2025-11-20T22:03:58"
}
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `python3 orchestrator.py --task-file FILE` | Load and run tasks from FILE |
| `python3 orchestrator.py --task-file FILE --auto-approve` | Run without asking for approval |
| `python3 orchestrator.py --resume` | Continue from last session |
| `python3 orchestrator.py --status` | Show current status |

## During Execution

When running in manual approval mode, you'll see prompts like:

```
⏸️  Task 1 requires approval
📝 Create a simple test file
Type: documentation

Description: Create a simple markdown file to test the orchestrator

Acceptance Criteria:
  - File created at orchestrator/test_output.md
  - Contains heading and some text
  - File is readable

▶️  Execute this task? (y/n/skip):
```

**Options:**
- `y` - Execute the task
- `n` - Stop the orchestrator (state is saved)
- `skip` - Skip this task and move to next

## Logs

Each task creates its own log file with:
- Task ID and title
- Full instruction sent to Claude
- Complete output from Claude
- Any errors or stderr output

Example log (`task-1-20251120-220258.log`):
```
Task 1: Create a simple test file
============================================================

INSTRUCTION:
Create a simple markdown file at orchestrator/test_output.md...

============================================================

OUTPUT:
I've successfully created the test markdown file...
```

## What's Next?

**Phase 2: Webhook Server** (Next step)
- Add Flask server with webhook endpoints
- Enable external control via HTTP POST
- Prepare for n8n integration

**Phase 3: n8n Integration**
- Create n8n workflows
- Connect to Telegram
- Control orchestrator from Telegram app

**Phase 4: Daily Workflow**
- Auto-generate tasks from daily logs
- Morning startup routine
- Evening summary reports

## Testing Your Own Tasks

1. **Create a task file:**
   ```bash
   cp examples/example-tasks.md orchestrator_tasks/my-tasks.md
   vim orchestrator_tasks/my-tasks.md
   ```

2. **Edit with your tasks** following the format above

3. **Run:**
   ```bash
   python3 orchestrator.py --task-file orchestrator_tasks/my-tasks.md
   ```

4. **Check logs:**
   ```bash
   ls -la orchestrator_logs/
   cat orchestrator_logs/task-1-*.log
   ```

## Tips

- **Start small** - Test with 2-3 simple tasks first
- **Be specific** - Claude instructions should be detailed and clear
- **Reference docs** - Tell Claude to follow project conventions and docs
- **Check logs** - Always review logs to see what Claude actually did
- **Use state** - If something goes wrong, you can resume from where you left off

## Troubleshooting

**Problem:** `claude: command not found`
- Solution: Install Claude Code CLI or add to PATH

**Problem:** Tasks fail with timeout
- Solution: Increase timeout in orchestrator.py config (currently 300 seconds)

**Problem:** State file corrupted
- Solution: Delete `state.json` and start fresh

**Problem:** Task doesn't execute correctly
- Solution: Make instruction more specific, reference exact file paths and patterns

## Examples of Good Task Instructions

**Good:**
```
Create a database migration for the baptisms table at supabase/migrations/.
Follow the exact pattern from the weddings migration.
Include parish_id, RLS policies, and all standard fields.
Name the file with today's timestamp in format YYYYMMDD_create_baptisms.sql
```

**Not as good:**
```
Create baptisms migration
```

The more specific and detailed your instructions, the better Claude can execute them!

---

**Ready to proceed to Phase 2?** The webhook server will enable remote control of the orchestrator, which is essential for Telegram integration.
