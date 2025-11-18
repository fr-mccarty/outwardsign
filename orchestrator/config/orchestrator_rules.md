# Orchestrator Rules

These rules govern the behavior of the orchestrator system itself (not the individual agents).

## Task Management

### Task Prioritization
1. Execute tasks in order listed in YAML file unless priority overrides
2. High priority tasks run first, regardless of order in file
3. If multiple tasks have same priority, run in YAML file order
4. Dependencies between tasks should be explicit in YAML (future feature)

### Task Allocation
1. Spawn one agent per task (one-to-one mapping)
2. Respect `MAX_CONCURRENT_AGENTS` limit from constants
3. Queue remaining tasks until an agent slot is available
4. Long-running tasks (>2 hours) should be split into subtasks (manual for now)

### Task Timeout Handling
1. If agent exceeds timeout, mark task as TIMEOUT
2. Save all agent output up to timeout point
3. Include timeout in end-of-day report
4. User decides whether to resume or restart task next day

## Cost Management

### Daily Limit Enforcement
1. Track cumulative cost across all agents
2. At 75% of daily limit, send warning notification
3. At 95% of daily limit, pause new task assignments
4. At 100% of daily limit, halt all agents gracefully
5. Never exceed `MAX_DAILY_COST_USD`

### Cost Calculation
1. Calculate cost after each agent status update
2. Use current Claude API pricing from constants
3. Include both input and output tokens
4. Round costs to 2 decimal places

### Cost Overrun Prevention
1. Estimate cost before starting task (based on complexity)
2. If estimated cost + current cost > daily limit, defer task
3. Log deferred tasks in report
4. Suggest reducing scope or increasing daily limit

## Agent Monitoring

### Status Polling
1. Check agent status files every `STATUS_POLL_INTERVAL_SECONDS`
2. Update orchestrator's internal state after each poll
3. Detect hung agents (no update in `AGENT_HEARTBEAT_TIMEOUT_SECONDS`)
4. Attempt graceful shutdown of hung agents, then force kill if needed

### Question Detection
1. Check agent questions directory every `QUESTION_POLL_INTERVAL_SECONDS`
2. When new question detected, immediately notify user
3. Mark agent as BLOCKED until answer provided
4. Resume agent after answer file is written

### Log Management
1. Capture all agent stdout/stderr to log files
2. Rotate logs if they exceed 10MB
3. Keep logs for 30 days, then archive or delete
4. Include relevant log excerpts in reports

## Communication

### Telegram Notifications
Send Telegram messages for:
1. Agent asks a question (HIGH priority)
2. Agent completes a task (NORMAL priority)
3. Cost warning threshold reached (HIGH priority)
4. Daily cost limit about to be exceeded (URGENT priority)
5. Agent timeout or hang detected (HIGH priority)
6. All tasks completed (NORMAL priority)

### File-Based Communication
1. Agents write to their own workspace directories only
2. Agents read from shared `config/` directory
3. Agents write questions to `agent_questions/{task_id}.md`
4. Orchestrator writes answers to `agent_questions/{task_id}-answer.md`
5. Use `.lock` files to prevent race conditions if needed

## Reporting

### End-of-Day Report
Generate comprehensive report including:
1. Summary statistics (tasks completed, cost, time)
2. Per-task results (status, deliverables, quality metrics)
3. All questions asked and answers provided
4. Files created/modified (grouped by task)
5. Recommendations for tomorrow based on patterns
6. Cost breakdown by task type or module

### Report Format
1. Markdown format for easy reading and version control
2. Save to `results/{YYYY-MM-DD}-report.md`
3. Include timestamp and orchestrator version
4. Link to agent workspaces for detailed review

### Report Delivery
1. Generate report automatically when all tasks complete or daily limit reached
2. User can also request report manually: `orchestrator.py report`
3. Send report summary via Telegram if enabled
4. Keep reports for historical analysis

## Safety & Permissions

### Git Operations
1. Agents MUST NOT run: `git add`, `git commit`, `git push`, `git stash`
2. Agents CAN run: `git status`, `git diff`, `git log` (read-only)
3. Orchestrator monitors agent logs for forbidden git commands
4. If forbidden command detected, immediately halt agent and warn user

### Database Operations
1. Agents CAN create migration files in `supabase/migrations/`
2. Agents MUST NOT run: `supabase db push`, `supabase db reset`
3. Agents MUST NOT use Supabase MCP server for schema changes
4. All migrations reviewed by user before execution

### File System Safety
1. Agents work in project root directory
2. Agents should not modify files outside project
3. Monitor for suspicious file operations (e.g., accessing `/etc/`, `~/.ssh/`)
4. Agents can create, modify, delete files within project (configurable)

## Learning & Improvement

### Feedback Processing
1. Parse feedback file after user creates it
2. Extract ratings, action items, and pattern observations
3. Update learning database (`learning/patterns.json`)
4. Adjust agent instructions for next day based on feedback

### Pattern Recognition
1. Track successful task executions (rating >= 4)
2. Identify common factors in successful tasks
3. Build library of proven patterns
4. Suggest patterns when similar tasks appear

### Instruction Refinement
1. Update `agent_instructions.md` based on feedback
2. Add successful patterns to task execution patterns
3. Document common mistakes and how to avoid them
4. Version control all instruction updates

### Performance Metrics
Track over time:
1. Average task completion time by complexity
2. Average cost per task by type (docs, implementation, testing)
3. Question frequency (aim to reduce via better instructions)
4. Success rate (tasks completed vs. timed out/failed)

## Error Handling

### Agent Crashes
1. Detect agent crash via status file or process monitoring
2. Capture final agent output and error logs
3. Mark task as FAILED with crash details
4. Include crash info in end-of-day report
5. User decides whether to retry task next day

### Invalid Task YAML
1. Validate task YAML before starting any agents
2. Report validation errors to user immediately
3. Do not start orchestrator if YAML is invalid
4. Suggest fixes for common YAML errors

### Missing Context Files
1. Before starting agent, verify all `context_files` exist
2. If context file missing, warn user but continue
3. Log missing files in agent status
4. Include warning in end-of-day report

### Disk Space
1. Check available disk space before starting agents
2. Warn if less than 1GB free
3. Halt agents if disk space falls below 500MB
4. Clean up old logs/workspaces if space is low

## Future Enhancements

### Agent-to-Agent Communication
1. Allow agents to share knowledge via shared files
2. One agent can request help from another
3. Orchestrator mediates agent-to-agent questions

### Automatic Context Selection
1. Orchestrator suggests context files based on task description
2. Use embeddings or keyword matching to find relevant docs
3. User can override suggestions in task YAML

### Parallel Task Execution
1. Identify independent tasks that can run in parallel
2. Respect `MAX_CONCURRENT_AGENTS` limit
3. Handle dependencies between tasks (DAG execution)

### Predictive Cost Modeling
1. Learn task cost patterns over time
2. Predict cost for new tasks based on similarity
3. Optimize task ordering to stay within daily limit
4. Warn user if daily task list likely exceeds budget
