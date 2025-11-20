# n8n Workflow Setup Instructions

This guide provides step-by-step instructions for creating n8n workflows to connect Telegram to your orchestrator.

## Overview

You'll create 2 workflows:

1. **Telegram → Orchestrator** - Forward Telegram commands to orchestrator webhook
2. **Orchestrator → Telegram** - Receive notifications from orchestrator and send to Telegram

---

## Prerequisites

- n8n instance running and accessible
- Telegram Bot created (get token from @BotFather)
- Orchestrator deployed and accessible via HTTP/HTTPS
- Webhook secret configured in orchestrator `.env` file

---

## Telegram Bot Setup

### 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow prompts to name your bot
4. Save the **Bot Token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Send `/setcommands` to set bot commands:
   ```
   start - Start orchestrator with daily tasks
   status - Get current status and progress
   approve - Approve and continue to next task
   pause - Pause orchestrator
   resume - Resume orchestrator
   skip - Skip current task
   logs - View recent logs
   help - Show available commands
   ```

### 2. Get Your Chat ID

1. Send a message to your bot in Telegram
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find `"chat":{"id":123456789}` - this is your Chat ID
4. Save this number

---

## Workflow 1: Telegram → Orchestrator

This workflow listens for Telegram commands and forwards them to your orchestrator.

### Nodes to Create:

#### Node 1: Telegram Trigger

1. **Add Node** → **Trigger** → **Telegram Trigger**
2. **Configuration:**
   - **Credential:** Create new Telegram API credential
     - Access Token: Your bot token from BotFather
   - **Updates:** `Message`
   - Save

#### Node 2: Filter Commands

1. **Add Node** → **Filter**
2. **Configuration:**
   - **Conditions:**
     - `{{ $json.message.text }}` starts with `/`
   - This ensures only commands (starting with /) are processed

#### Node 3: Extract Command

1. **Add Node** → **Code** (or use **Set** node)
2. **Configuration:**
   - **Mode:** Run Once for All Items
   - **JavaScript Code:**
   ```javascript
   // Extract command from message
   const message = $input.first().json.message.text;
   const command = message.split(' ')[0].replace('/', '');
   const chatId = $input.first().json.message.chat.id;

   return [{
     json: {
       command: command,
       chat_id: chatId,
       original_message: message
     }
   }];
   ```

#### Node 4: Route Commands

1. **Add Node** → **Switch**
2. **Configuration:**
   - **Mode:** Rules
   - **Rules:**
     - Rule 1: `{{ $json.command }}` equals `start` → Output 1
     - Rule 2: `{{ $json.command }}` equals `status` → Output 2
     - Rule 3: `{{ $json.command }}` equals `approve` → Output 3
     - Rule 4: `{{ $json.command }}` equals `pause` → Output 4
     - Rule 5: `{{ $json.command }}` equals `resume` → Output 5
     - Rule 6: `{{ $json.command }}` equals `skip` → Output 6
     - Rule 7: `{{ $json.command }}` equals `logs` → Output 7
     - Rule 8: `{{ $json.command }}` equals `help` → Output 8
   - **Fallback Output:** Output 9 (unknown command)

#### Node 5a: HTTP Request - Start

Connect to Switch Output 1

1. **Add Node** → **HTTP Request**
2. **Configuration:**
   - **Method:** POST
   - **URL:** `https://your-orchestrator.com/webhook/command`
   - **Authentication:** None (using secret in body)
   - **Send Body:** Yes
   - **Body Content Type:** JSON
   - **Specify Body:** Using JSON
   - **JSON:**
   ```json
   {
     "command": "start",
     "secret": "{{ $env.ORCHESTRATOR_SECRET }}",
     "params": {
       "task_file": "/opt/orchestrator/orchestrator_tasks/daily-tasks.md",
       "auto_approve": true
     }
   }
   ```
   - **Options:**
     - Timeout: 10000

**Note:** Add `ORCHESTRATOR_SECRET` as an environment variable in n8n settings.

#### Node 5b: HTTP Request - Status

Connect to Switch Output 2

1. **Add Node** → **HTTP Request**
2. **Configuration:**
   - **Method:** POST
   - **URL:** `https://your-orchestrator.com/webhook/status`
   - **Body Content Type:** JSON
   - **JSON:**
   ```json
   {
     "secret": "{{ $env.ORCHESTRATOR_SECRET }}"
   }
   ```

#### Node 5c: HTTP Request - Approve

Connect to Switch Output 3

1. **Add Node** → **HTTP Request**
2. **Configuration:**
   - **Method:** POST
   - **URL:** `https://your-orchestrator.com/webhook/command`
   - **JSON:**
   ```json
   {
     "command": "approve",
     "secret": "{{ $env.ORCHESTRATOR_SECRET }}"
   }
   ```

#### Node 5d-g: Similar HTTP Requests

Create similar HTTP Request nodes for:
- **Pause** (Output 4)
- **Resume** (Output 5)
- **Skip** (Output 6)
- **Logs** (Output 7)

Each with the appropriate command in the JSON body.

#### Node 5h: Help Command

Connect to Switch Output 8

1. **Add Node** → **Set**
2. **Configuration:**
   - **Mode:** Manual
   - **Fields:**
     - Name: `response`
     - Value:
     ```
     🤖 Orchestrator Commands:

     /start - Start orchestrator with daily tasks
     /status - Get current status and progress
     /approve - Approve and continue to next task
     /pause - Pause orchestrator
     /resume - Resume orchestrator from last state
     /skip - Skip current task
     /logs - View recent logs (last 20 lines)
     /help - Show this help message
     ```

#### Node 6: Format Response

Merge all HTTP Request outputs here.

1. **Add Node** → **Code**
2. **Configuration:**
   - **JavaScript Code:**
   ```javascript
   // Format the orchestrator response for Telegram
   const data = $input.first().json;

   let message = "";

   // Handle status response
   if (data.status) {
     if (data.status === 'idle') {
       message = "⏸️ Orchestrator is idle\n\nNo active session. Use /start to begin.";
     } else if (data.status === 'running') {
       message = `⚙️ Orchestrator is running\n\n`;
       message += `📊 Progress: ${data.completed}/${data.total_tasks} tasks\n`;
       if (data.current_task_title) {
         message += `\nCurrent: Task ${data.current_task}\n`;
         message += `📝 ${data.current_task_title}`;
       }
     } else if (data.status === 'completed') {
       message = `✅ All tasks completed!\n\n`;
       message += `Total: ${data.total_tasks} tasks`;
     }
   }

   // Handle logs response
   else if (data.logs) {
     message = `📜 Recent Logs:\n\n\`\`\`\n${data.logs}\n\`\`\`\n\nFile: ${data.file}`;
   }

   // Handle command response
   else if (data.message) {
     const emoji = {
       'ok': '✅',
       'error': '❌',
       'warning': '⚠️'
     }[data.status] || 'ℹ️';

     message = `${emoji} ${data.message}`;
   }

   // Default
   else {
     message = JSON.stringify(data, null, 2);
   }

   return [{
     json: {
       chat_id: $('Extract Command').first().json.chat_id,
       text: message,
       parse_mode: 'Markdown'
     }
   }];
   ```

#### Node 7: Send to Telegram

1. **Add Node** → **Telegram**
2. **Configuration:**
   - **Resource:** Message
   - **Operation:** Send Message
   - **Chat ID:** `{{ $json.chat_id }}`
   - **Text:** `{{ $json.text }}`
   - **Additional Fields:**
     - Parse Mode: `{{ $json.parse_mode }}`

### Connect the Nodes:

```
Telegram Trigger
    ↓
Filter Commands
    ↓
Extract Command
    ↓
Route Commands (Switch)
    ↓ (multiple outputs)
HTTP Requests (5a-h)
    ↓ (merge)
Format Response
    ↓
Send to Telegram
```

---

## Workflow 2: Orchestrator → Telegram

This workflow receives notifications from orchestrator and sends them to Telegram.

### Nodes to Create:

#### Node 1: Webhook Trigger

1. **Add Node** → **Trigger** → **Webhook**
2. **Configuration:**
   - **HTTP Method:** POST
   - **Path:** `orchestrator-notify` (or your choice)
   - **Response Mode:** Last Node
   - **Response Data:** First Entry JSON
   - Copy the **Production URL** - this is your `N8N_NOTIFY_URL`

#### Node 2: Format Message

1. **Add Node** → **Code**
2. **Configuration:**
   - **JavaScript Code:**
   ```javascript
   // Format notification for Telegram
   const data = $input.first().json;

   const emoji = {
     'info': 'ℹ️',
     'success': '✅',
     'error': '❌',
     'warning': '⚠️',
     'task_start': '⚙️',
     'task_complete': '✅',
     'task_failed': '❌'
   }[data.type] || 'ℹ️';

   const message = `${emoji} ${data.message}`;

   return [{
     json: {
       chat_id: '{{ $env.TELEGRAM_CHAT_ID }}',
       text: message
     }
   }];
   ```

**Note:** Add `TELEGRAM_CHAT_ID` as an environment variable in n8n settings.

#### Node 3: Send to Telegram

1. **Add Node** → **Telegram**
2. **Configuration:**
   - **Resource:** Message
   - **Operation:** Send Message
   - **Chat ID:** `{{ $json.chat_id }}`
   - **Text:** `{{ $json.text }}`

#### Node 4: Respond to Orchestrator

1. **Add Node** → **Respond to Webhook**
2. **Configuration:**
   - **Respond With:** JSON
   - **Response Body:**
   ```json
   {
     "status": "ok",
     "delivered": true
   }
   ```

### Connect the Nodes:

```
Webhook Trigger
    ↓
Format Message
    ↓
Send to Telegram
    ↓
Respond to Webhook
```

---

## Configuration Steps

### 1. n8n Environment Variables

Add these variables in n8n Settings → Environment:

```bash
ORCHESTRATOR_SECRET=your-webhook-secret-from-env-file
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### 2. Update Orchestrator .env

Add the n8n webhook URL to your orchestrator:

```bash
# In /opt/orchestrator/.env
N8N_NOTIFY_URL=https://your-n8n-instance.com/webhook/orchestrator-notify
```

Restart orchestrator:
```bash
systemctl restart orchestrator
```

### 3. Activate Workflows

1. In n8n, activate both workflows (toggle switches to ON)
2. Test each workflow

---

## Testing

### Test Workflow 1 (Telegram → Orchestrator)

1. Open Telegram and message your bot: `/help`
2. You should receive the help message
3. Send `/status`
4. You should receive "Orchestrator is idle"

### Test Workflow 2 (Orchestrator → Telegram)

From your orchestrator server:

```bash
curl -X POST https://your-n8n-instance.com/webhook/orchestrator-notify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test notification from orchestrator",
    "type": "info"
  }'
```

You should receive a Telegram message.

### Full Integration Test

1. Create a test task file on your orchestrator
2. Send `/start` to your Telegram bot
3. Watch for notifications as tasks execute
4. Send `/status` to check progress
5. Send `/logs` to view recent logs

---

## Troubleshooting

### Bot doesn't respond

1. Check workflow is activated in n8n
2. Check bot token is correct
3. Test with curl:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```

### Orchestrator not receiving commands

1. Check orchestrator URL is accessible from n8n
2. Test with curl from n8n server:
   ```bash
   curl http://your-orchestrator:5000/health
   ```
3. Check webhook secret matches in both places
4. Check n8n execution logs for errors

### Not receiving notifications

1. Check N8N_NOTIFY_URL is set in orchestrator .env
2. Test webhook URL directly with curl
3. Check Telegram chat ID is correct
4. Check n8n workflow 2 is activated

### Commands return errors

1. Check orchestrator logs:
   ```bash
   journalctl -u orchestrator -f
   ```
2. Verify task file paths are absolute
3. Check file permissions on orchestrator
4. Verify Claude CLI is working:
   ```bash
   echo "test" | claude -p "respond"
   ```

---

## Advanced: Scheduled Daily Start

Create a third workflow to auto-start orchestrator each morning.

### Workflow 3: Daily Auto-Start

#### Node 1: Schedule Trigger

1. **Add Node** → **Trigger** → **Schedule**
2. **Configuration:**
   - **Trigger Times:** Cron
   - **Cron Expression:** `0 9 * * 1-5` (9 AM Monday-Friday)
   - Or use **Trigger Intervals** for simpler UI

#### Node 2: HTTP Request - Start Orchestrator

1. **Add Node** → **HTTP Request**
2. **Configuration:**
   - **Method:** POST
   - **URL:** `https://your-orchestrator.com/webhook/command`
   - **JSON:**
   ```json
   {
     "command": "start",
     "secret": "{{ $env.ORCHESTRATOR_SECRET }}",
     "params": {
       "task_file": "/opt/orchestrator/orchestrator_tasks/daily-tasks.md",
       "auto_approve": true
     }
   }
   ```

#### Node 3: Send Notification

1. **Add Node** → **Telegram**
2. **Configuration:**
   - **Chat ID:** `{{ $env.TELEGRAM_CHAT_ID }}`
   - **Text:** `🌅 Good morning! Starting daily orchestrator tasks...`

Activate this workflow and you'll get automatic daily starts!

---

## Workflow Management Tips

1. **Test in Development First**
   - n8n allows duplicate workflows
   - Create test versions before modifying production

2. **Use Execution Logs**
   - View execution history in n8n
   - Check for failed executions
   - Debug with execution data

3. **Add Error Handling**
   - Add error workflows
   - Send alerts on failures
   - Implement retries where needed

4. **Monitor Regularly**
   - Check n8n execution logs weekly
   - Verify workflows are triggering
   - Review orchestrator logs

5. **Keep Credentials Secure**
   - Never hardcode secrets in workflows
   - Use n8n environment variables
   - Rotate secrets periodically

---

## Example Daily Workflow

Here's a complete daily workflow scenario:

**Morning (9 AM - Automated):**
1. Schedule workflow triggers
2. Orchestrator starts with daily tasks
3. You receive Telegram notification: "Starting daily tasks..."

**During Execution:**
1. Orchestrator runs tasks one by one
2. You receive notifications: "Task 1 completed", "Task 2 completed"
3. Send `/status` anytime to check progress

**If Issues Occur:**
1. Receive error notification: "Task 3 failed"
2. Send `/logs` to see what happened
3. Send `/pause` to pause execution
4. Fix the issue
5. Send `/resume` to continue

**End of Day:**
1. Final notification: "All tasks completed!"
2. Send `/status` for summary
3. Review logs if needed

---

## Next Steps

After workflows are set up:

1. ✅ Create your first daily task file
2. ✅ Test full workflow end-to-end
3. ✅ Set up scheduled daily starts
4. ✅ Monitor for a few days
5. ✅ Refine task templates based on results

See `ORCHESTRATOR_PLAN.md` for more advanced features and Phase 4 planning.
