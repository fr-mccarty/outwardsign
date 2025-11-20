# Orchestrator - Automated Development Workflow System

> **A simple, effective orchestrator that works on one task at a time using Claude AI, controllable via Telegram.**

## 🎯 What It Does

The orchestrator automates your daily development workflow by:
- Loading tasks from markdown files
- Executing them one at a time using Claude CLI (`claude -p`)
- Sending progress updates to Telegram (via n8n)
- Allowing remote control from your phone
- Maintaining state for pause/resume capability
- Logging all operations comprehensively

## ✅ Current Status: Phase 3 Complete

All core functionality is implemented and ready for deployment:

- ✅ **Phase 1:** Core orchestrator with task execution
- ✅ **Phase 2:** Webhook server for remote control
- ✅ **Phase 3:** n8n integration with interactive mode
  - ✅ Real-time status updates to Telegram
  - ✅ Interactive question/answer support
  - ✅ Enhanced n8n workflow instructions

## 📁 Project Structure

```
orchestrator/
├── orchestrator.py              # Core orchestrator engine
├── webhook_server.py            # Flask webhook server
├── config.yaml                  # Configuration file
├── .env.example                 # Environment variables template
├── requirements.txt             # Python dependencies
├── .gitignore                   # Git ignore rules
│
├── README.md                    # This file
├── QUICKSTART.md                # Quick start guide
├── ORCHESTRATOR_PLAN.md         # Complete implementation plan
├── orchestrator_readme.md       # User documentation
├── DEPLOYMENT.md                # Digital Ocean deployment guide
├── N8N_SETUP_INSTRUCTIONS.md    # n8n workflow setup
│
├── examples/
│   └── example-tasks.md         # Example task file
│
├── orchestrator_tasks/          # Your task files
├── orchestrator_logs/           # Execution logs
├── daily_logs/                  # Daily work descriptions
│
├── state.json                   # Current session state (gitignored)
└── test_output.md               # Test file (gitignored)
```

## 🚀 Quick Start

### Local Testing

```bash
# 1. Navigate to orchestrator directory
cd orchestrator

# 2. Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Test core orchestrator
python3 orchestrator.py --task-file examples/example-tasks.md --auto-approve

# 5. Test webhook server (in separate terminal)
python3 webhook_server.py

# 6. Test webhooks (in another terminal)
./test_webhook.sh
```

### Deployment to Digital Ocean

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete Ubuntu deployment instructions.

Quick version:
```bash
# On Ubuntu droplet:
apt update && apt install python3 python3-pip git -y
cd /opt && git clone <your-repo>
cd /opt/orchestrator
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env  # Configure secrets
python3 webhook_server.py
```

### n8n + Telegram Setup

See **[N8N_SETUP_INSTRUCTIONS.md](N8N_SETUP_INSTRUCTIONS.md)** for detailed workflow creation.

Quick version:
1. Create Telegram bot with @BotFather
2. Get your chat ID
3. Create 2 n8n workflows (Telegram→Orchestrator, Orchestrator→Telegram)
4. Configure webhook URLs and secrets
5. Test with `/help` command

## 📚 Documentation

| File | Purpose |
|------|---------|
| **[QUICKSTART.md](QUICKSTART.md)** | Quick reference and basic usage |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Ubuntu/Digital Ocean deployment guide |
| **[N8N_SETUP_INSTRUCTIONS.md](N8N_SETUP_INSTRUCTIONS.md)** | n8n workflow creation instructions |
| **[INTERACTIVE_MODE.md](INTERACTIVE_MODE.md)** | Real-time updates and question/answer features |
| **[GIT_REFERENCE.md](GIT_REFERENCE.md)** | Git commands for orchestrator branch |
| **[GIT_SAFETY.md](GIT_SAFETY.md)** | Critical: Preventing unauthorized git commits |
| **[UPDATES_NEEDED.md](UPDATES_NEEDED.md)** | Manual code updates for interactive mode |
| **[ORCHESTRATOR_PLAN.md](ORCHESTRATOR_PLAN.md)** | Complete architecture and implementation plan |
| **[orchestrator_readme.md](orchestrator_readme.md)** | Comprehensive user documentation |

## 🎮 Usage

### Command Line

```bash
# Run tasks with manual approval
python3 orchestrator.py --task-file tasks.md

# Run with auto-approve (no prompts)
python3 orchestrator.py --task-file tasks.md --auto-approve

# Check status
python3 orchestrator.py --status

# Resume from saved state
python3 orchestrator.py --resume
```

### Via Telegram (After n8n Setup)

```
/start    - Start orchestrator with daily tasks
/status   - Get current status and progress
/approve  - Approve and continue to next task
/pause    - Pause orchestrator
/resume   - Resume orchestrator
/skip     - Skip current task
/answer   - Answer a pending question
/logs     - View recent logs
/help     - Show available commands
```

**Plus Real-Time Notifications:**
- 🚀 Session start/complete
- ⚙️ Task start notifications
- ✅ Task completion with progress
- ❌ Task failure with error details
- ❓ Questions requiring your input

### Via Webhook API

```bash
# Start orchestrator
curl -X POST http://your-server:5000/webhook/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "start",
    "secret": "your-webhook-secret",
    "params": {
      "task_file": "/path/to/tasks.md",
      "auto_approve": true
    }
  }'

# Check status
curl -X POST http://your-server:5000/webhook/status \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-webhook-secret"}'
```

## 📝 Task File Format

Create markdown files with this structure:

```markdown
# Tasks - YYYY-MM-DD

## Task 1: Task Title
**Type:** database | backend | frontend | documentation | testing
**Priority:** high | medium | low
**Requires Approval:** true | false
**Description:** What this task does
**Acceptance Criteria:**
- Criterion 1
- Criterion 2

**Claude Instruction:**
Detailed instruction for Claude. Be specific and reference project conventions.

---

## Task 2: Another Task
...
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
WEBHOOK_SECRET=<generate-with-openssl-rand-hex-32>
N8N_NOTIFY_URL=https://your-n8n.com/webhook/orchestrator-notify
HOST=0.0.0.0
PORT=5000
DEBUG=false
```

### config.yaml

Customize orchestrator behavior:
- Approval modes
- Task type auto-approval
- Claude CLI settings
- Timeouts and paths

## 🔒 Security

- ✅ Webhook secret authentication
- ✅ Environment variable for secrets
- ✅ No secrets in code or config files
- ✅ UFW firewall on server
- ✅ Optional HTTPS with Nginx + Let's Encrypt

## 📊 Monitoring

### View Logs

```bash
# Systemd logs (if deployed)
journalctl -u orchestrator -f

# Task logs
tail -f orchestrator_logs/task-*.log

# State file
cat state.json | jq '.'
```

### Health Check

```bash
curl http://your-server:5000/health
```

## 🐛 Troubleshooting

### Common Issues

**Claude command not found:**
```bash
which claude  # Check if installed
# Install Claude CLI from claude.com
```

**Webhook server won't start:**
```bash
# Check port not in use
lsof -i :5000

# Check dependencies
pip install -r requirements.txt
```

**Tasks fail to execute:**
```bash
# Test Claude manually
echo "test" | claude -p "respond"

# Check task file exists
ls -la orchestrator_tasks/

# Check logs for details
cat orchestrator_logs/task-*.log
```

See documentation files for more detailed troubleshooting.

## 💰 Cost

**Minimal setup:**
- Digital Ocean Droplet: $6-12/month
- n8n: Free (self-hosted) or $20/month (cloud)
- Telegram: Free
- **Total: $6-32/month**

## 🔄 Workflow Example

**Morning (9 AM):**
```
[Scheduled n8n workflow triggers]
→ Orchestrator starts with daily tasks
→ Telegram: "🌅 Starting daily tasks..."
```

**During execution:**
```
→ Task 1 executes
→ Telegram: "✅ Task 1 completed"
→ Task 2 executes
→ You: /status
→ Telegram: "⚙️ Task 2/5 in progress..."
```

**If something fails:**
```
→ Telegram: "❌ Task 3 failed"
→ You: /logs
→ Telegram: [shows error details]
→ You: /pause
→ [Fix the issue]
→ You: /resume
→ Telegram: "▶️ Resuming from Task 3..."
```

## 🎯 Use Cases

1. **Daily Development Tasks**
   - Database migrations
   - Feature implementation
   - Documentation updates
   - Test creation

2. **Scheduled Maintenance**
   - Dependency updates
   - Security patches
   - Database cleanup
   - Backup verification

3. **Multi-step Workflows**
   - Deploy pipeline
   - Data migrations
   - Testing workflows
   - Code reviews

## 🚧 Future Enhancements

Possible additions (not currently planned):
- Task templates library
- Multi-project support
- Analytics dashboard
- GitHub integration for auto-PRs
- Slack/Discord notifications
- Task dependencies
- Rollback capability

## 📄 License

Same as main Outward Sign project.

## 🤝 Support

- Check documentation files first
- Review logs for errors
- Test components individually
- Verify configuration and secrets

## 🎉 Success Criteria

The orchestrator is working correctly when:

✅ You can start tasks from Telegram
✅ Tasks execute one at a time
✅ You receive progress updates
✅ You can pause/resume anytime
✅ State persists across restarts
✅ All operations are logged
✅ Setup takes < 30 minutes

---

**Ready to deploy?** Start with [DEPLOYMENT.md](DEPLOYMENT.md) for server setup, then [N8N_SETUP_INSTRUCTIONS.md](N8N_SETUP_INSTRUCTIONS.md) for Telegram integration.
