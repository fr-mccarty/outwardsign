# Updates Needed for Interactive Mode

This file documents the updates that need to be made to `orchestrator.py` to add interactive question support and real-time status updates.

## Changes Already Made

✅ Added imports: `time` and `requests`
✅ Added to `__init__`:
   - `self.pending_question = None`
   - `self.question_response = None`
   - `self.response_file = self.base_dir / "response.json"`
   - `"n8n_notify_url": os.getenv("N8N_NOTIFY_URL", "")` in config

✅ Added methods:
   - `notify_n8n(message, message_type, data)`
   - `ask_question(question, options, timeout)`
   - `send_status_update(update_type, message, data)`

✅ Added status update in `execute_task()` at line ~256 (task started)

## Changes Still Needed

### 1. Add Status Update After Task Success (around line 312)

After the line:
```python
print(f"📄 Log: {log_file}")
```

Add:
```python
# Send status update: task completed
self.send_status_update(
    'task_complete',
    f"✅ Task {task.id}/{len(self.tasks)} completed: {task.title}",
    {
        'task_id': task.id,
        'task_title': task.title,
        'completed': sum(1 for t in self.tasks if t.status == "completed"),
        'total_tasks': len(self.tasks)
    }
)
```

### 2. Add Status Update After Task Error (around line 320)

After the line:
```python
print(f"Error: {stderr}")
```

Add:
```python
# Send status update: task failed
self.send_status_update(
    'task_failed',
    f"❌ Task {task.id} failed: {task.title}",
    {
        'task_id': task.id,
        'task_title': task.title,
        'error': stderr[:500]  # First 500 chars of error
    }
)
```

### 3. Add Status Update After Timeout (around line 332)

After the line:
```python
f.write(f"\n\nTIMEOUT: Task exceeded {self.config['timeout']} seconds")
```

Add:
```python
# Send status update: task timeout
self.send_status_update(
    'task_failed',
    f"⏱️ Task {task.id} timed out after {self.config['timeout']}s",
    {
        'task_id': task.id,
        'task_title': task.title,
        'timeout': self.config['timeout']
    }
)
```

### 4. Add Status Update in Exception Handler (around line 343)

After the line:
```python
f.write(f"\n\nEXCEPTION: {str(e)}")
```

Add:
```python
# Send status update: task exception
self.send_status_update(
    'task_failed',
    f"❌ Task {task.id} exception: {str(e)[:100]}",
    {
        'task_id': task.id,
        'task_title': task.title,
        'error': str(e)
    }
)
```

### 5. Add Status Update in `run()` Method

At the start of `run()` method (after session_id is set), add:
```python
# Send session start notification
self.send_status_update(
    'session_start',
    f"🚀 Starting orchestrator session with {len(self.tasks)} tasks",
    {
        'session_id': self.session_id,
        'total_tasks': len(self.tasks),
        'task_file': str(self.task_file)
    }
)
```

At the end of `run()` method (when all tasks completed), add:
```python
# Send session complete notification
completed = sum(1 for t in self.tasks if t.status == "completed")
self.send_status_update(
    'session_complete',
    f"🎉 Session complete! {completed}/{len(self.tasks)} tasks succeeded",
    {
        'session_id': self.session_id,
        'completed': completed,
        'failed': sum(1 for t in self.tasks if t.status == "failed"),
        'skipped': sum(1 for t in self.tasks if t.status == "skipped"),
        'total_tasks': len(self.tasks)
    }
)
```

### 6. Update `.gitignore`

Add to `.gitignore`:
```
response.json
```

### 7. Update `requirements.txt`

Ensure `requests` is added (already done).

## Manual Application

Due to unicode encoding issues in the file, these changes need to be applied manually:

1. Open `orchestrator.py` in your text editor
2. Find each location mentioned above
3. Add the corresponding code snippet
4. Save the file

## Testing After Updates

```bash
# Test status updates
python3 orchestrator.py --task-file examples/example-tasks.md --auto-approve

# Check that notifications are being sent (if N8N_NOTIFY_URL is configured)
```

## Example Usage of Interactive Questions

Once implemented, tasks can ask questions like this in their Claude instructions:

```markdown
**Claude Instruction:**
First check if the database migration already exists. If it does, use the orchestrator's ask_question method to ask the user: "Migration already exists. Overwrite it?" with options ["yes", "no"]. If the response is "no", skip this task.
```

Note: This requires Claude to be aware of the orchestrator's question-asking capability, which may need additional context in the task instructions.
