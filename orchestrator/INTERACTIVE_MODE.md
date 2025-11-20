# Interactive Mode - Questions & Real-Time Updates

The orchestrator now supports interactive mode with real-time status updates and the ability to ask questions during task execution.

## Features

### 1. Real-Time Status Updates

The orchestrator sends notifications to n8n/Telegram at key points:

**Status Update Types:**
- `session_start` - Session begins
- `task_start` - Task execution starts
- `task_complete` - Task completes successfully
- `task_failed` - Task fails or times out
- `session_complete` - All tasks finished
- `question` - Orchestrator asks a question
- `info` / `warning` / `error` - General notifications

**Example Telegram Messages:**
```
🚀 Starting orchestrator session with 5 tasks

⚙️ Starting Task 1/5: Create baptisms migration

✅ Task 1/5 completed: Create baptisms migration
📊 Progress: 1/5 tasks

⚙️ Starting Task 2/5: Create server actions

❌ Task 2 failed: Create server actions
Error: Migration file not found

🎉 Session complete! 4/5 tasks succeeded
```

### 2. Interactive Questions

The orchestrator can pause and ask questions via Telegram during task execution.

**How It Works:**
1. Orchestrator encounters a question in task execution
2. Sends question to n8n with type `question`
3. n8n forwards to Telegram
4. User responds via Telegram
5. n8n sends response to orchestrator `/webhook/command` with `answer` command
6. Orchestrator receives answer and continues

**Response Mechanism:**
- Orchestrator creates `response.json` file (gitignored)
- Webhook endpoint writes user's response to this file
- Orchestrator polls the file (every 1 second)
- Once response received, orchestrator continues
- Timeout after 5 minutes (configurable)

## n8n Workflow Updates

### Workflow 2: Enhanced Orchestrator → Telegram

Update the "Format Message" node to handle new message types:

```javascript
// Format notification for Telegram
const data = $input.first().json;

// Map message types to emojis
const emoji = {
  'session_start': '🚀',
  'session_complete': '🎉',
  'task_start': '⚙️',
  'task_complete': '✅',
  'task_failed': '❌',
  'question': '❓',
  'info': 'ℹ️',
  'success': '✅',
  'error': '❌',
  'warning': '⚠️'
}[data.type] || 'ℹ️';

let message = `${emoji} ${data.message}`;

// Add extra data if present
if (data.data && Object.keys(data.data).length > 0) {
  // For questions, add options
  if (data.type === 'question' && data.data.options) {
    message += `\n\nOptions: ${data.data.options.join(', ')}`;
    message += `\n\nReply with: /answer <your choice>`;
  }

  // For progress updates
  if (data.data.completed !== undefined) {
    message += `\n📊 Progress: ${data.data.completed}/${data.data.total_tasks}`;
  }

  // For errors
  if (data.data.error) {
    message += `\n\n\`\`\`\n${data.data.error.substring(0, 200)}\n\`\`\``;
  }
}

return [{
  json: {
    chat_id: '{{ $env.TELEGRAM_CHAT_ID }}',
    text: message,
    parse_mode: 'Markdown'
  }
}];
```

### New Command: /answer

Add this to Workflow 1 (Telegram → Orchestrator):

#### In Switch Node

Add new output for `answer` command:
- Rule: `{{ $json.command }}` equals `answer` → Output 9

#### New HTTP Request Node

Connect to Switch Output 9:

**Configuration:**
- **Method:** POST
- **URL:** `https://your-orchestrator.com/webhook/command`
- **JSON:**
```json
{
  "command": "answer",
  "secret": "{{ $env.ORCHESTRATOR_SECRET }}",
  "params": {
    "response": "{{ $json.answer_text }}"
  }
}
```

#### Extract Answer Text

Before the HTTP Request, add a Code node:

```javascript
// Extract answer from message
// User sends: /answer yes
// Or just: yes (if in answer context)

const message = $input.first().json.message.text;
const parts = message.split(' ');

let answer = '';
if (parts[0] === '/answer') {
  // "/answer yes" format
  answer = parts.slice(1).join(' ');
} else {
  // Just "yes" format
  answer = message.trim();
}

return [{
  json: {
    command: 'answer',
    answer_text: answer,
    chat_id: $input.first().json.message.chat.id
  }
}];
```

## Task Instructions for Questions

To use questions in your tasks, the Claude instruction needs to be aware they exist. However, this is complex because Claude executing the task doesn't have direct access to the orchestrator's `ask_question` method.

### Workaround: Manual Questions

For now, questions work best when:
1. Task identifies a decision point
2. Task fails with specific message: "QUESTION: Should I overwrite existing file?"
3. Orchestrator detects failure message starting with "QUESTION:"
4. Orchestrator asks question via Telegram
5. User responds
6. Orchestrator retries task with answer in context

**This requires orchestrator enhancement - see UPDATES_NEEDED.md**

### Future: Native Question Support

Once implemented, questions would work like:

```markdown
**Claude Instruction:**
Check if baptisms migration exists. If it does, ask: "Baptisms migration exists. Overwrite?" with options ["yes", "no"].

If answer is "no", skip migration creation.
If answer is "yes", delete existing and create new migration.
```

## Testing Interactive Mode

### 1. Test Status Updates

```bash
# Start orchestrator with N8N_NOTIFY_URL configured
N8N_NOTIFY_URL=https://your-n8n.com/webhook/orchestrator-notify \
python3 orchestrator.py --task-file examples/example-tasks.md --auto-approve
```

Watch your Telegram for updates:
- Session start
- Each task start
- Each task completion
- Session complete

### 2. Test Question Flow

**Manual Test (without full implementation):**

```bash
# Terminal 1: Start webhook server
python3 webhook_server.py

# Terminal 2: Send test question
curl -X POST http://localhost:5000/webhook/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "answer",
    "secret": "changeme",
    "params": {
      "response": "yes"
    }
  }'

# Check that response.json was created
cat response.json
```

### 3. Full Integration Test

1. Deploy orchestrator to Digital Ocean
2. Configure N8N_NOTIFY_URL in .env
3. Create n8n workflows with interactive support
4. Create test task that triggers question
5. Start via Telegram: `/start`
6. Watch for real-time updates
7. When question appears, respond with `/answer yes`
8. Verify orchestrator continues

## Configuration

### Environment Variables

```bash
# In orchestrator/.env
N8N_NOTIFY_URL=https://your-n8n-instance.com/webhook/orchestrator-notify
```

### config.yaml

```yaml
orchestrator:
  # Question timeout in seconds
  question_timeout: 300

  # Poll interval for response file (seconds)
  response_poll_interval: 1

webhooks:
  # Enable status updates
  send_status_updates: true
```

## Benefits

### 1. Real-Time Visibility

No need to SSH into server or check logs - see progress on your phone.

### 2. Early Failure Detection

Know immediately when a task fails, not at the end of the day.

### 3. Interactive Decisions

Handle edge cases without pre-programming all scenarios.

### 4. Progress Tracking

See completion percentage and estimated remaining work.

### 5. Mobile Control

Pause, resume, or answer questions from anywhere.

## Use Cases

### Daily Development Workflow

```
9:00 AM  🚀 Starting orchestrator session with 8 tasks
9:01 AM  ⚙️ Starting Task 1/8: Create baptisms migration
9:02 AM  ✅ Task 1/8 completed: Create baptisms migration
         📊 Progress: 1/8 tasks
9:02 AM  ⚙️ Starting Task 2/8: Create server actions
...
9:45 AM  🎉 Session complete! 8/8 tasks succeeded
```

### Error Handling

```
10:15 AM  ⚙️ Starting Task 3/5: Run database migration
10:16 AM  ❌ Task 3 failed: Run database migration
          Error: Connection refused - is database running?

[You check server, restart database]

10:20 AM  You: /resume
10:20 AM  Bot: ▶️ Resuming orchestrator
10:20 AM  ⚙️ Starting Task 3/5: Run database migration
10:21 AM  ✅ Task 3/5 completed: Run database migration
```

### Interactive Decisions

```
2:30 PM  ⚙️ Starting Task 4/6: Update production database
2:31 PM  ❓ Production database has pending changes. Continue anyway?
         Options: yes, no
         Reply with: /answer <your choice>

2:32 PM  You: /answer no
2:32 PM  Bot: ✅ Response recorded: no
2:32 PM  ⏭️ Skipping task 4
2:32 PM  ⚙️ Starting Task 5/6: Generate report
```

## Limitations

### Current Implementation

1. **Questions require manual orchestrator updates** - See UPDATES_NEEDED.md for code additions
2. **One question at a time** - Can't have multiple pending questions
3. **No question history** - Past questions not logged
4. **Timeout only** - No retry mechanism for failed questions
5. **File-based communication** - response.json polling (works but not ideal)

### Future Enhancements

1. Database-backed question queue
2. Multiple concurrent questions
3. Question history and analytics
4. Retry with escalation (ask again, then notify admin)
5. WebSocket for real-time communication
6. Rich question types (multiple choice with buttons, etc.)

## Troubleshooting

### Status updates not appearing in Telegram

1. Check N8N_NOTIFY_URL is set correctly
2. Verify n8n workflow 2 is activated
3. Test notify URL directly:
   ```bash
   curl -X POST $N8N_NOTIFY_URL \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "type": "info"}'
   ```
4. Check orchestrator logs for HTTP errors

### Questions timing out

1. Check response.json file permissions
2. Verify /answer command works:
   ```bash
   curl -X POST http://your-orchestrator:5000/webhook/command \
     -H "Content-Type: application/json" \
     -d '{"command": "answer", "secret": "your-secret", "params": {"response": "test"}}'
   ```
3. Check orchestrator has write permissions to its directory
4. Increase timeout in config (default 300s)

### Duplicate notifications

1. Check n8n workflow isn't duplicated
2. Verify only one orchestrator instance running
3. Check systemd service isn't running multiple copies

---

**Ready for interactive mode?** Complete the manual updates in UPDATES_NEEDED.md, redeploy, and update your n8n workflows!
