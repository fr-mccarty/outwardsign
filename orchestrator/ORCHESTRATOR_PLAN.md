# Orchestrator Implementation Plan

## Vision

A **simple, effective orchestrator** that:
- Works on **one task at a time** using Claude CLI
- Communicates via **Telegram** (through n8n webhooks)
- Requires **human approval** at key checkpoints
- Maintains **state** for pause/resume capability
- Keeps **comprehensive logs** of all operations

---

## Architecture Overview

```
┌─────────────┐
│   Telegram  │ User sends commands (/start, /approve, /status)
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐
│     n8n     │ Workflow automation & webhook routing
└──────┬──────┘
       │ HTTP POST
       ↓
┌─────────────────────────────────────┐
│  Orchestrator (Flask + Python)     │
│  ┌─────────────────────────────┐   │
│  │ Webhook Endpoints           │   │
│  │ - /command (Telegram cmds)  │   │
│  │ - /status (get progress)    │   │
│  │ - /approve (continue)       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Orchestrator Core           │   │
│  │ - Load tasks                │   │
│  │ - Execute one at a time     │   │
│  │ - Track state               │   │
│  │ - Send updates to n8n       │   │
│  └─────────────────────────────┘   │
└──────────┬──────────────────────────┘
           │ subprocess call
           ↓
    ┌──────────────┐
    │  Claude CLI  │ echo "task" | claude -p "execute"
    └──────────────┘
```

---

## Core Components

### 1. Orchestrator Core (`orchestrator.py`)

**Responsibilities:**
- Load task list from markdown file
- Execute tasks one at a time using `claude -p`
- Track current state (which task, status)
- Log all operations
- Handle pause/resume
- Send notifications to n8n

**Key Functions:**
```python
class Orchestrator:
    def __init__(config_path):
        # Load config, initialize state

    def load_tasks(task_file):
        # Parse markdown task file

    def execute_current_task():
        # Run: echo "task" | claude -p "instruction"
        # Capture output
        # Update state

    def next_task():
        # Move to next task
        # Check if requires approval

    def get_status():
        # Return current progress

    def pause():
        # Set paused state

    def resume():
        # Continue from current task
```

### 2. Webhook Server (`webhook_server.py`)

**Responsibilities:**
- Receive commands from n8n
- Execute orchestrator commands
- Return responses to n8n
- Handle authentication

**Endpoints:**

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/webhook/command` | POST | Execute command | `{"command": "start", "secret": "xxx"}` | `{"status": "ok", "message": "Started"}` |
| `/webhook/status` | POST | Get status | `{"secret": "xxx"}` | `{"task": 2, "total": 5, "status": "waiting_approval"}` |
| `/webhook/approve` | POST | Approve & continue | `{"secret": "xxx"}` | `{"status": "ok", "message": "Executing task 3"}` |
| `/webhook/pause` | POST | Pause execution | `{"secret": "xxx"}` | `{"status": "ok"}` |
| `/webhook/resume` | POST | Resume | `{"secret": "xxx"}` | `{"status": "ok"}` |
| `/webhook/skip` | POST | Skip current task | `{"secret": "xxx"}` | `{"status": "ok", "message": "Skipped task 2"}` |
| `/webhook/logs` | POST | Get recent logs | `{"secret": "xxx", "lines": 20}` | `{"logs": "..."}` |

### 3. n8n Workflows

**Workflow 1: Telegram → Orchestrator**
```
Telegram Trigger
    ↓
Extract command (/start, /status, etc.)
    ↓
HTTP Request to Orchestrator
    ↓
Format response
    ↓
Send to Telegram
```

**Workflow 2: Orchestrator → Telegram**
```
Webhook Trigger (from orchestrator)
    ↓
Format message for Telegram
    ↓
Send to Telegram chat
```

**Workflow 3: Daily Startup (Optional)**
```
Cron Trigger (9 AM daily)
    ↓
HTTP Request: POST /webhook/command {"command": "start"}
    ↓
Notify user on Telegram
```

### 4. State Management (`state.json`)

**Structure:**
```json
{
  "session_id": "20251120-093015",
  "task_file": "orchestrator_tasks/2025-11-20-tasks.md",
  "current_task_index": 2,
  "status": "waiting_approval",
  "tasks": [
    {
      "id": 1,
      "title": "Create baptisms migration",
      "type": "database",
      "status": "completed",
      "started_at": "2025-11-20T09:30:15",
      "completed_at": "2025-11-20T09:32:45",
      "result": "success",
      "output_log": "orchestrator_logs/task-1-output.log"
    },
    {
      "id": 2,
      "title": "Create server actions for baptisms",
      "type": "backend",
      "status": "pending",
      "requires_approval": true
    },
    {
      "id": 3,
      "title": "Create UI components",
      "type": "frontend",
      "status": "pending"
    }
  ],
  "started_at": "2025-11-20T09:30:00",
  "paused_at": null,
  "last_activity": "2025-11-20T09:32:50"
}
```

---

## Implementation Steps

### Phase 1: Core Orchestrator (No Webhooks)

**Goal:** Get basic task execution working

**Tasks:**
1. ✅ Create `orchestrator.py` with basic structure
2. ✅ Implement task loading from markdown file
3. ✅ Implement single task execution using `subprocess` + `claude -p`
4. ✅ Add logging to file
5. ✅ Test with simple 2-3 task list

**Deliverable:** Can run `python orchestrator.py --task-file tasks.md` and it executes tasks one by one

### Phase 2: State Management

**Goal:** Add pause/resume capability

**Tasks:**
1. ✅ Create state.json structure
2. ✅ Implement state save/load
3. ✅ Add resume logic (skip completed tasks)
4. ✅ Add pause capability
5. ✅ Test pause and resume

**Deliverable:** Can pause orchestrator, restart, and it continues from where it left off

### Phase 3: Webhook Server

**Goal:** Add HTTP API for external control

**Tasks:**
1. ✅ Set up Flask application
2. ✅ Implement `/webhook/command` endpoint
3. ✅ Implement `/webhook/status` endpoint
4. ✅ Implement `/webhook/approve` endpoint
5. ✅ Add webhook secret authentication
6. ✅ Add outbound webhook to notify n8n
7. ✅ Test with curl/Postman

**Deliverable:** Can control orchestrator via HTTP POST requests

### Phase 4: n8n Integration

**Goal:** Connect Telegram to orchestrator via n8n

**Tasks:**
1. ✅ Create n8n workflow: Telegram → Orchestrator
2. ✅ Create n8n workflow: Orchestrator → Telegram
3. ✅ Configure webhook URLs in orchestrator config
4. ✅ Test Telegram commands end-to-end
5. ✅ Add error handling and retries

**Deliverable:** Can control orchestrator from Telegram app

### Phase 5: Polish & Documentation

**Goal:** Make it production-ready

**Tasks:**
1. ✅ Add comprehensive error handling
2. ✅ Create configuration examples
3. ✅ Write setup guide
4. ✅ Add example task files
5. ✅ Test full daily workflow
6. ✅ Document common issues

**Deliverable:** Anyone can set up and use the orchestrator

---

## File Structure

```
orchestrator/
├── orchestrator.py              # Main orchestrator logic
├── webhook_server.py            # Flask app for webhooks
├── config.yaml                  # Configuration
├── config.example.yaml          # Example config (for repo)
├── requirements.txt             # Python dependencies
├── state.json                   # Current state (gitignored)
├── .env                         # Secrets (gitignored)
├── orchestrator_readme.md       # User documentation
├── ORCHESTRATOR_PLAN.md         # This file
│
├── daily_logs/                  # Daily work descriptions
│   └── 2025-11-20.md
│
├── orchestrator_tasks/          # Generated task lists
│   └── 2025-11-20-tasks.md
│
├── orchestrator_logs/           # Execution logs
│   ├── 2025-11-20.log
│   ├── task-1-output.log
│   └── task-2-output.log
│
├── n8n_workflows/               # n8n workflow exports
│   ├── telegram-to-orchestrator.json
│   ├── orchestrator-to-telegram.json
│   └── daily-startup.json
│
└── examples/                    # Example files
    ├── example-daily-log.md
    ├── example-tasks.md
    └── example-config.yaml
```

---

## Configuration

### `config.yaml`

```yaml
# Orchestrator Configuration

server:
  host: "0.0.0.0"
  port: 5000
  debug: false

orchestrator:
  # How to handle approvals: 'required' | 'auto' | 'manual'
  approval_mode: 'required'

  # Checkpoint after each task or after task types
  checkpoint_after:
    - database  # Always pause after database tasks
    - deployment  # Always pause after deployments

  # Auto-approve these task types
  auto_approve:
    - documentation
    - testing

webhooks:
  # Webhook secret for authentication
  secret: "${WEBHOOK_SECRET}"  # From .env

  # n8n webhook URL to send notifications
  n8n_notify_url: "https://your-n8n.com/webhook/orchestrator-notify"

  # Enable/disable webhook server
  enabled: true

claude:
  # Claude CLI command
  command: "claude -p"

  # Additional flags
  flags: "--dangerously-skip-permissions"

  # Timeout per task (seconds)
  timeout: 300

paths:
  # Where to find/store files
  tasks_dir: "orchestrator_tasks"
  logs_dir: "orchestrator_logs"
  daily_dir: "daily_logs"
  state_file: "state.json"

logging:
  # Log level: DEBUG | INFO | WARNING | ERROR
  level: "INFO"

  # Log format
  format: "[%(asctime)s] %(levelname)s: %(message)s"

  # Separate log file per task
  task_logs: true

telegram:
  # Your Telegram chat ID (for notifications)
  chat_id: "${TELEGRAM_CHAT_ID}"  # From .env

  # Commands enabled
  commands:
    - start
    - status
    - approve
    - pause
    - resume
    - skip
    - logs
    - help
```

### `.env`

```bash
# Webhook secret (generate with: openssl rand -hex 32)
WEBHOOK_SECRET=your-secret-key-here

# Your Telegram chat ID
TELEGRAM_CHAT_ID=123456789

# n8n webhook URL
N8N_NOTIFY_URL=https://your-n8n-instance.com/webhook/orchestrator-notify

# Optional: Claude CLI path if not in PATH
CLAUDE_CLI_PATH=/usr/local/bin/claude
```

---

## Task File Format

### Daily Log (`daily_logs/2025-11-20.md`)

```markdown
# Daily Work - 2025-11-20

## Goals
- Implement baptisms module
- Update documentation
- Fix failing tests

## Context
Following the wedding module pattern for baptisms

## Notes
- Database migration should come first
- Ensure all 9 main files are created
```

### Generated Tasks (`orchestrator_tasks/2025-11-20-tasks.md`)

```markdown
# Tasks - 2025-11-20

## Task 1: Create baptisms migration
**Type:** database
**Priority:** high
**Requires Approval:** true
**Description:** Create database migration for baptisms table following wedding pattern
**Acceptance Criteria:**
- Migration file created in supabase/migrations/
- Table uses plural form (baptisms)
- RLS policies created
- Parish scoping included

**Claude Instruction:**
Create a database migration for the baptisms table. Follow the exact pattern used in the weddings table migration. Include all necessary columns, RLS policies, and parish scoping. The migration file should be named with today's timestamp.

---

## Task 2: Create baptisms server actions
**Type:** backend
**Priority:** high
**Requires Approval:** true
**Description:** Create server actions for CRUD operations on baptisms
**Acceptance Criteria:**
- File created at src/app/(main)/baptisms/actions.ts
- Implements create, update, delete, get, list
- Uses WithRelations pattern
- Includes proper error handling

**Claude Instruction:**
Create server actions file for the baptisms module at src/app/(main)/baptisms/actions.ts. Follow the exact pattern from weddings/actions.ts. Include all CRUD operations and the WithRelations interface for fetching baptisms with related data.

---

## Task 3: Create baptisms UI - List page
**Type:** frontend
**Priority:** high
**Requires Approval:** false
**Description:** Create the main list page for baptisms module
**Acceptance Criteria:**
- page.tsx created (server component)
- baptisms-list-client.tsx created
- Search and filter functionality
- Empty state with create button
- Uses ModuleListPanel

**Claude Instruction:**
Create the baptisms list page following the wedding module pattern. Create both page.tsx (server) and baptisms-list-client.tsx (client) files. Implement search, filtering, and the entity grid display.

---
```

---

## Telegram Interaction Flow

### Starting a Session

```
User: /start

Bot: 🤖 Orchestrator Starting...

     📋 Loading tasks from: orchestrator_tasks/2025-11-20-tasks.md

     Found 3 tasks:
     1. Create baptisms migration (database)
     2. Create baptisms server actions (backend)
     3. Create baptisms UI - List page (frontend)

     ▶️ Ready to begin!

     Commands: /approve /status /pause /help

User: /approve

Bot: ⚙️ Executing Task 1/3
     📝 Create baptisms migration
     Type: database

     Please wait...

[30 seconds later]

Bot: ✅ Task 1/3 Complete!

     Migration created: 20251120_create_baptisms.sql

     📊 Progress: 1/3 (33%)

     ──────────────────

     Next: Task 2/3
     📝 Create baptisms server actions
     Type: backend

     /approve to continue, /skip to skip, /pause to pause

User: /status

Bot: 📊 Orchestrator Status

     Session: 20251120-093015
     Status: ⏸️ Waiting for approval

     Progress: 1/3 tasks (33%)
     ✅ Completed: 1
     ⏭️ Pending: 2

     Current: Task 2 - Create baptisms server actions

     Started: 9:30 AM
     Runtime: 5 minutes

     /approve /skip /pause

User: /logs

Bot: 📜 Recent Logs (last 10 lines)

     [09:30:15] Task 1 started
     [09:30:18] Executing: echo "Create migration..." | claude -p
     [09:30:45] Claude response received
     [09:30:46] Migration file created
     [09:30:47] Task 1 completed: SUCCESS
     [09:30:48] Waiting for approval for task 2

     Full logs: orchestrator_logs/2025-11-20.log
```

### Pausing & Resuming

```
User: /pause

Bot: ⏸️ Orchestrator Paused

     Current: Task 2/3
     Completed: 1/3

     State saved. Use /resume to continue.

[Later...]

User: /resume

Bot: ▶️ Orchestrator Resumed

     Continuing from: Task 2/3
     📝 Create baptisms server actions

     /approve to execute, /status for details
```

---

## n8n Workflow Details

### Workflow 1: Telegram → Orchestrator

**Nodes:**

1. **Telegram Trigger**
   - Listens for messages in your chat
   - Filters for commands starting with `/`

2. **Switch (Command Router)**
   - Routes to different branches based on command
   - Cases: start, status, approve, pause, resume, skip, logs, help

3. **HTTP Request (to Orchestrator)**
   - URL: `http://your-orchestrator:5000/webhook/command`
   - Method: POST
   - Body:
     ```json
     {
       "command": "{{ $json.message.text }}",
       "secret": "{{ $env.WEBHOOK_SECRET }}"
     }
     ```

4. **Format Response**
   - Converts orchestrator JSON response to readable text
   - Adds emojis and formatting

5. **Send Telegram Message**
   - Sends formatted response back to user

**Export:** Save as `n8n_workflows/telegram-to-orchestrator.json`

### Workflow 2: Orchestrator → Telegram

**Nodes:**

1. **Webhook Trigger**
   - URL: `/webhook/orchestrator-notify`
   - Method: POST
   - Receives: `{"message": "Task completed", "type": "success"}`

2. **Format Message**
   - Adds appropriate emoji based on type
   - Formats for Telegram (markdown)

3. **Send to Telegram**
   - Sends to configured chat ID

**Export:** Save as `n8n_workflows/orchestrator-to-telegram.json`

---

## Error Handling

### Orchestrator Errors

**Scenario:** Claude command fails
```python
try:
    result = subprocess.run(
        claude_command,
        capture_output=True,
        timeout=config.timeout
    )
except subprocess.TimeoutExpired:
    log_error("Task timed out")
    notify_telegram("⚠️ Task timed out after 5 minutes")
    mark_task_failed()
except Exception as e:
    log_error(f"Task failed: {str(e)}")
    notify_telegram(f"❌ Task failed: {str(e)}")
    mark_task_failed()
```

**Scenario:** State file corrupted
```python
try:
    state = load_state()
except json.JSONDecodeError:
    log_error("State file corrupted, backing up and creating new")
    backup_state()
    state = create_new_state()
```

### n8n Errors

**Scenario:** Orchestrator unreachable
- Retry 3 times with exponential backoff
- Send Telegram message: "⚠️ Orchestrator not responding"

**Scenario:** Invalid webhook secret
- Return 401 Unauthorized
- Log attempt
- Don't execute command

---

## Security Considerations

1. **Webhook Secret**
   - Generate strong secret: `openssl rand -hex 32`
   - Store in `.env`, never commit
   - Verify on every webhook request

2. **Telegram Chat ID**
   - Whitelist only your chat ID
   - Reject messages from unknown chats

3. **n8n Authentication**
   - Use n8n's built-in webhook authentication
   - Or add custom header authentication

4. **File System**
   - Validate all file paths (prevent directory traversal)
   - Never execute arbitrary code from tasks
   - Sanitize all inputs

5. **Network**
   - Run orchestrator on private network or localhost
   - Use ngrok/Tailscale for external access if needed
   - Consider VPN for n8n ↔ orchestrator communication

---

## Testing Strategy

### Unit Tests
- Test task parsing from markdown
- Test state save/load
- Test webhook authentication
- Test Claude command execution (mocked)

### Integration Tests
- Test full task execution flow
- Test pause/resume
- Test webhook endpoints with curl

### End-to-End Tests
1. Create test task file
2. Start orchestrator via Telegram
3. Approve task via Telegram
4. Verify task executes
5. Check state file updated
6. Check logs created
7. Pause and resume
8. Complete all tasks

---

## Monitoring & Observability

### Logs
- Main log: `orchestrator_logs/YYYY-MM-DD.log`
- Per-task logs: `orchestrator_logs/task-N-output.log`
- Webhook access log: `orchestrator_logs/webhook-access.log`

### Metrics (Future)
- Tasks completed per day
- Success/failure rate
- Average task duration
- Time to approval (human response time)

### Health Checks
- Endpoint: `/health`
- Returns: `{"status": "ok", "version": "1.0", "uptime": 3600}`

---

## Deployment

### Local Development
```bash
# Terminal 1: Start orchestrator
cd orchestrator
python webhook_server.py

# Terminal 2: Tail logs
tail -f orchestrator_logs/*.log

# Terminal 3: Test with curl
curl -X POST http://localhost:5000/webhook/command \
  -H "Content-Type: application/json" \
  -d '{"command": "status", "secret": "your-secret"}'
```

### Production (VPS/Cloud)

**Option 1: systemd service**
```ini
# /etc/systemd/system/orchestrator.service
[Unit]
Description=Orchestrator Service
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/outwardsign/orchestrator
ExecStart=/usr/bin/python3 webhook_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

**Option 2: Docker**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "webhook_server.py"]
```

**Option 3: Process Manager (PM2)**
```bash
pm2 start webhook_server.py --name orchestrator --interpreter python3
pm2 save
pm2 startup
```

---

## Future Enhancements

### Phase 2 Features
- [ ] Task templating (reusable task patterns)
- [ ] Multi-day sessions (continue across days)
- [ ] Task dependencies (task B requires task A)
- [ ] Rollback capability (undo last task)
- [ ] Task scheduling (run at specific time)

### Phase 3 Features
- [ ] Multiple concurrent sessions (different projects)
- [ ] Team collaboration (multiple users)
- [ ] Task library (pre-built task templates)
- [ ] Analytics dashboard (web UI)
- [ ] Integration with GitHub (auto-PR creation)

---

## Success Criteria

The orchestrator is successful when:

✅ You can start a work session from Telegram
✅ Tasks execute one at a time with Claude CLI
✅ You can approve/pause/resume from Telegram
✅ State persists across restarts
✅ All operations are logged
✅ You can complete a full day's work through the orchestrator
✅ Setup takes < 15 minutes for new users
✅ Documentation is clear and complete

---

## Next Steps

**Immediate:**
1. Review this plan
2. Approve approach
3. Start Phase 1 implementation

**Questions to Answer:**
1. Where will orchestrator run? (local machine, VPS, cloud)
2. Is your n8n instance already set up?
3. Do you have a Telegram bot token ready?
4. What's your preferred approval mode? (approve each task, or auto-approve some types)

Let me know if you'd like to proceed with implementation!
