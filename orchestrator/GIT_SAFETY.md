# Git Safety - Preventing Orchestrator from Making Commits

**🔴 CRITICAL:** The orchestrator should NEVER have permission to make git commits automatically.

## Why This Matters

The orchestrator executes Claude AI instructions autonomously. Allowing it to make git commits would mean:

❌ Unreviewed code changes committed automatically
❌ Potential for committing secrets or sensitive data
❌ Commits made without proper review or testing
❌ Difficult to track what changes were human vs AI
❌ Risk of breaking main branch without oversight

**Human oversight is essential for all git operations.**

## Implementation

### 1. Task Instructions - Explicit Prohibition

When creating task files, **NEVER** include git commit commands in Claude instructions.

**❌ WRONG:**
```markdown
**Claude Instruction:**
Create the baptisms migration file, then run:
```bash
git add supabase/migrations/
git commit -m "Add baptisms migration"
```
```

**✅ CORRECT:**
```markdown
**Claude Instruction:**
Create the baptisms migration file at supabase/migrations/YYYYMMDD_create_baptisms.sql

DO NOT run any git commands. The user will commit these changes manually.
```

### 2. Read-Only Git Commands

The orchestrator MAY use read-only git commands for context:

**✅ ALLOWED:**
```bash
git status        # Check current state
git log          # View history
git diff         # See changes
git show         # View commit details
git branch       # List branches
git remote       # List remotes
```

**❌ FORBIDDEN:**
```bash
git add          # Stage files
git commit       # Create commits
git push         # Push to remote
git pull         # Pull from remote
git merge        # Merge branches
git rebase       # Rebase branches
git reset        # Reset changes
git checkout     # Switch branches (can lose work)
```

### 3. Post-Task Manual Commit

After orchestrator completes tasks, the human reviews and commits:

```bash
# 1. Review what changed
git status
git diff

# 2. Test the changes
npm run build
npm test

# 3. Stage reviewed changes
git add supabase/migrations/20251120_create_baptisms.sql

# 4. Commit with descriptive message
git commit -m "Add baptisms migration

- Created baptisms table
- Added RLS policies
- Included parish scoping
- Follows weddings pattern"

# 5. Push when ready
git push
```

## Safeguards

### 1. Task File Template

Use this template for all task files to remind Claude:

```markdown
## Task X: [Title]
**Type:** ...
**Priority:** ...
**Requires Approval:** true
**Description:** ...
**Acceptance Criteria:**
- ...

**Claude Instruction:**
[Your instruction here]

IMPORTANT: Do not run any git commit, git add, or git push commands. The user will review and commit changes manually.
```

### 2. Monitoring

Watch orchestrator logs for unauthorized git attempts:

```bash
# Monitor logs in real-time
tail -f orchestrator/orchestrator_logs/task-*.log | grep -i "git commit\|git add\|git push"

# Check completed task logs
grep -r "git commit" orchestrator/orchestrator_logs/
```

If found, immediately:
1. Stop orchestrator (`/pause` or `Ctrl+C`)
2. Review what was attempted
3. Update task instructions to prevent recurrence

### 3. File System Permissions (Advanced)

On deployment server, restrict git access:

```bash
# Create a git wrapper script that blocks write operations
sudo nano /usr/local/bin/git-safe

# Content:
#!/bin/bash
if [[ "$1" == "add" || "$1" == "commit" || "$1" == "push" || "$1" == "merge" || "$1" == "rebase" ]]; then
    echo "ERROR: Git write operations not allowed by orchestrator"
    exit 1
fi
/usr/bin/git "$@"

# Make executable
sudo chmod +x /usr/local/bin/git-safe

# Configure orchestrator to use safe git
# In orchestrator's environment:
export PATH="/usr/local/bin:$PATH"
alias git='git-safe'
```

### 4. n8n Workflow Alert

Add alert in n8n workflow when git commands detected:

**In Workflow 2 (Orchestrator → Telegram):**

Add a node before "Send to Telegram":

```javascript
// Check for git write commands in message
const message = $input.first().json.message;

if (message.match(/git (add|commit|push|merge|rebase)/i)) {
  // Send alert
  return [{
    json: {
      chat_id: '{{ $env.TELEGRAM_CHAT_ID }}',
      text: '🚨 WARNING: Git write command detected in orchestrator output!\n\n' + message,
      parse_mode: 'Markdown'
    }
  }];
}

// Normal flow
return $input.all();
```

## Workflow After Orchestrator

### Daily Workflow

```
1. Morning: Start orchestrator via Telegram
   ↓
2. Orchestrator executes tasks (no git commits)
   ↓
3. You receive completion notification
   ↓
4. SSH to server (or check locally)
   ↓
5. Review changes:
   - git status
   - git diff
   - npm run build
   - npm test
   ↓
6. If good, commit:
   - git add <files>
   - git commit -m "message"
   - git push
   ↓
7. If issues, fix manually and commit
```

### Example

**Orchestrator completes:**
```
✅ Task 1/3 completed: Create baptisms migration
✅ Task 2/3 completed: Create server actions
✅ Task 3/3 completed: Create UI components
🎉 Session complete! 3/3 tasks succeeded
```

**You review:**
```bash
# Check what was created
git status
# Shows:
# - supabase/migrations/20251120_create_baptisms.sql (new)
# - src/app/(main)/baptisms/actions.ts (new)
# - src/app/(main)/baptisms/page.tsx (new)
# - ...

# Review each file
git diff supabase/migrations/20251120_create_baptisms.sql

# Test
npm run build
# Success!

npm test
# All pass!

# Commit
git add supabase/migrations/20251120_create_baptisms.sql \
        src/app/\(main\)/baptisms/

git commit -m "Add baptisms module

Orchestrator session 20251120-093015:
- Created baptisms database migration
- Implemented server actions (CRUD)
- Built UI components following weddings pattern
- All tests passing

Co-authored-by: Claude (Orchestrator) <noreply@anthropic.com>"

git push
```

## Exception: Documentation Commits

**Question:** Should orchestrator commit documentation changes?

**Answer:** No, even documentation should be reviewed.

**Rationale:**
- Documentation can contain sensitive information
- Typos or errors should be caught before commit
- Documentation changes should be intentional
- Maintains consistent review process

If you want to auto-commit docs (not recommended):
1. Create separate task type: `documentation`
2. Use different orchestrator instance with limited scope
3. Only allow commits to docs/ directory
4. Still review before merging to main

## Red Flags

Watch for these patterns in task instructions or logs:

🚨 `git commit` - Never should appear
🚨 `git add .` - Never should appear
🚨 `git push` - Never should appear
🚨 `--no-verify` - Bypassing hooks
🚨 `--force` - Force pushing
🚨 `commit -m` - Creating commits

If any appear:
1. **STOP** orchestrator immediately
2. Review what happened
3. Check if commit was made (`git log`)
4. If commit made, review it carefully
5. Decide: keep, amend, or revert
6. Update task instructions to prevent recurrence

## Recovery

### If Orchestrator Made Unauthorized Commit

**Scenario:** Orchestrator somehow committed and you didn't want it.

**Local only (not pushed):**
```bash
# View the commit
git log -1

# If you want to keep changes but redo commit:
git reset --soft HEAD~1
git status  # Changes still staged
# Review, modify if needed, then:
git commit -m "Better commit message"

# If you want to discard everything:
git reset --hard HEAD~1
```

**Already pushed to remote:**
```bash
# DO NOT use git push --force on shared branches!

# Option 1: Revert the commit (creates new commit)
git revert HEAD
git push

# Option 2: If absolutely necessary and you're sure:
git reset --hard HEAD~1
git push --force

# But first: Make sure no one else has pulled!
```

## Future Consideration: Controlled Git Access

If you ever want orchestrator to commit (again, not recommended now):

1. **Separate Git User:**
   ```bash
   git config user.name "Orchestrator Bot"
   git config user.email "orchestrator@outwardsign.church"
   ```

2. **Commit to Feature Branch Only:**
   - Never commit to main
   - Always create feature branch
   - Require human PR review

3. **Limited Scope:**
   - Only specific directories (e.g., migrations/)
   - Only specific file types
   - With approval workflow

4. **Full Audit Trail:**
   - Log every git command
   - Send notification for every commit
   - Require approval before push

5. **Rollback Mechanism:**
   - Easy way to undo orchestrator commits
   - Automatic backup before git operations

**But for now: No git commits by orchestrator. Period.**

## Checklist

Before deploying orchestrator:

- [ ] Reviewed all task instructions - no git commit commands
- [ ] Added "DO NOT commit" reminder to task template
- [ ] Set up monitoring for git command attempts
- [ ] Tested that orchestrator doesn't have git write access
- [ ] Documented manual commit process for team
- [ ] Configured n8n alerts for git commands (optional)
- [ ] Added git-safe wrapper (optional, advanced)

After each orchestrator session:

- [ ] Review all changes with `git status` and `git diff`
- [ ] Test changes (`npm run build`, `npm test`)
- [ ] Stage only intended changes
- [ ] Write descriptive commit message
- [ ] Push to remote

---

**Summary:** Humans commit. Orchestrator executes. Always.
