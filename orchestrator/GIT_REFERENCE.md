# Git Quick Reference for Orchestrator Branch

This guide provides the git commands needed to manage the orchestrator branch.

## Current Status

✅ You're on the `orchestrator` branch
✅ All orchestrator files are ready to commit
✅ Runtime files are gitignored (logs, state.json, response.json, .env)

## Initial Commit

### Step 1: Verify You're on Orchestrator Branch

```bash
git branch
# Should show:
#   main
# * orchestrator
```

If not on orchestrator branch:
```bash
git checkout orchestrator
```

### Step 2: Stage All Orchestrator Files

```bash
# Add all orchestrator files (gitignore will exclude runtime files)
git add orchestrator/
```

### Step 3: Verify What Will Be Committed

```bash
git status
```

**Should see:**
```
On branch orchestrator
Changes to be committed:
  new file:   orchestrator/.env.example
  new file:   orchestrator/.gitignore
  new file:   orchestrator/DEPLOYMENT.md
  new file:   orchestrator/GIT_REFERENCE.md
  new file:   orchestrator/INTERACTIVE_MODE.md
  new file:   orchestrator/N8N_SETUP_INSTRUCTIONS.md
  new file:   orchestrator/ORCHESTRATOR_PLAN.md
  new file:   orchestrator/QUICKSTART.md
  new file:   orchestrator/README.md
  new file:   orchestrator/UPDATES_NEEDED.md
  new file:   orchestrator/config.yaml
  new file:   orchestrator/examples/example-tasks.md
  new file:   orchestrator/orchestrator.py
  new file:   orchestrator/orchestrator_readme.md
  new file:   orchestrator/requirements.txt
  new file:   orchestrator/test_webhook.sh
  new file:   orchestrator/webhook_server.py
```

**Should NOT see (gitignored):**
- orchestrator/.env
- orchestrator/state.json
- orchestrator/response.json
- orchestrator/orchestrator_logs/
- orchestrator/test_output.md
- orchestrator/__pycache__/

### Step 4: Create Commit

```bash
git commit -m "Add orchestrator system - automated workflow with Claude CLI

- Core orchestrator.py with task execution engine
- Interactive mode with real-time Telegram updates
- Question/answer support via n8n webhooks
- webhook_server.py for remote control API
- Complete documentation suite:
  - README.md - Main overview
  - QUICKSTART.md - Quick start guide
  - DEPLOYMENT.md - Digital Ocean deployment
  - N8N_SETUP_INSTRUCTIONS.md - n8n workflow setup
  - INTERACTIVE_MODE.md - Interactive features
  - ORCHESTRATOR_PLAN.md - Architecture details
  - UPDATES_NEEDED.md - Manual code updates required
  - GIT_REFERENCE.md - This file
- Configuration files (config.yaml, .env.example)
- Example tasks and test scripts
- Proper gitignore for runtime files

Implements:
- Phase 1: Core orchestrator with task execution
- Phase 2: Webhook server for n8n integration
- Phase 3: Interactive mode with questions and status updates

Ready for deployment to Digital Ocean Ubuntu droplet."
```

### Step 5: Verify Commit

```bash
# View the commit
git log -1

# View files in commit
git show --name-only

# View full diff
git show
```

## Working with the Orchestrator Branch

### Making Changes

```bash
# Make sure you're on orchestrator branch
git checkout orchestrator

# Make your changes...

# Stage changes
git add orchestrator/

# Commit
git commit -m "Description of changes"
```

### Viewing History

```bash
# View commits on orchestrator branch
git log --oneline

# View specific file history
git log --oneline orchestrator/orchestrator.py

# View diff between branches
git diff main..orchestrator
```

### Pushing to Remote

```bash
# First time push (sets up tracking)
git push -u origin orchestrator

# Subsequent pushes
git push
```

## Merging to Main

### When You're Ready to Merge

**Option 1: Merge Locally**

```bash
# Switch to main branch
git checkout main

# Merge orchestrator branch (no fast-forward to preserve history)
git merge orchestrator --no-ff -m "Merge orchestrator system implementation"

# Push to remote
git push origin main
```

**Option 2: Create Pull Request (if using GitHub)**

```bash
# Push orchestrator branch
git push -u origin orchestrator

# Then on GitHub:
# 1. Go to your repository
# 2. Click "Pull Requests"
# 3. Click "New Pull Request"
# 4. Base: main, Compare: orchestrator
# 5. Create pull request
# 6. Review and merge
```

### After Merging

**Keep orchestrator branch for future work:**
```bash
# Stay on orchestrator for future orchestrator development
git checkout orchestrator

# Or delete it if done
git branch -d orchestrator
git push origin --delete orchestrator
```

## Keeping Branches in Sync

### Update Orchestrator Branch from Main

If main branch gets updates:

```bash
# Switch to orchestrator
git checkout orchestrator

# Fetch latest from remote
git fetch origin

# Merge main into orchestrator
git merge origin/main

# Or rebase orchestrator on top of main (cleaner history)
git rebase origin/main

# Push updated orchestrator
git push
```

### Cherry-Pick Specific Changes

To bring specific commits from orchestrator to main:

```bash
# Switch to main
git checkout main

# Cherry-pick specific commit
git cherry-pick <commit-hash>

# Push to remote
git push
```

## Common Scenarios

### Scenario 1: Fix Bug in Orchestrator

```bash
# Make sure you're on orchestrator branch
git checkout orchestrator

# Make the fix
nano orchestrator/orchestrator.py

# Test the fix
python3 orchestrator/orchestrator.py --task-file orchestrator/examples/example-tasks.md

# Commit
git add orchestrator/orchestrator.py
git commit -m "Fix: Bug in task execution timeout handling"

# Push
git push
```

### Scenario 2: Add New Feature

```bash
# Create feature branch from orchestrator
git checkout orchestrator
git checkout -b orchestrator-feature-xyz

# Develop feature...
git add orchestrator/
git commit -m "Add feature XYZ"

# Merge back to orchestrator
git checkout orchestrator
git merge orchestrator-feature-xyz

# Push
git push

# Delete feature branch
git branch -d orchestrator-feature-xyz
```

### Scenario 3: Update Documentation Only

```bash
# On orchestrator branch
git checkout orchestrator

# Update docs
nano orchestrator/README.md

# Commit
git add orchestrator/README.md
git commit -m "Docs: Update README with new examples"

# Push
git push
```

### Scenario 4: Accidentally Committed Runtime Files

```bash
# Remove from git but keep on disk
git rm --cached orchestrator/state.json
git rm --cached orchestrator/.env

# Commit the removal
git commit -m "Remove accidentally committed runtime files"

# Make sure .gitignore is correct
cat orchestrator/.gitignore

# Push
git push
```

## Branch Strategy Recommendations

### Option A: Keep Separate (Recommended for Active Development)

**When to use:** Orchestrator is under active development

```
main               - Stable Outward Sign app
  ↓ rarely merge
orchestrator      - Orchestrator development
  ↓ frequently
feature branches  - Specific orchestrator features
```

**Pros:**
- Isolates orchestrator from main app
- Can break things without affecting main
- Clear separation of concerns

**Cons:**
- Need to remember to switch branches
- Main branch doesn't have orchestrator

### Option B: Merge Early

**When to use:** Orchestrator is stable and ready for use

```
main               - Everything including orchestrator
  ↓
feature branches  - For new features
```

**Pros:**
- Everything in one place
- Simpler workflow
- Easier deployments

**Cons:**
- Orchestrator bugs affect main branch

### Option C: Subtree (Advanced)

**When to use:** Orchestrator might become separate repo

```
main               - Outward Sign app
orchestrator repo  - Separate orchestrator repository
  ↓ subtree
main/orchestrator  - Subtree merged in
```

For now, **Option A** is recommended until orchestrator is stable.

## Git Hooks (Advanced)

### Pre-commit Hook: Prevent Committing Secrets

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check for .env files
if git diff --cached --name-only | grep -q "orchestrator/\.env$"; then
    echo "ERROR: Attempting to commit .env file!"
    echo "This file contains secrets and should not be committed."
    exit 1
fi

# Check for hardcoded secrets
if git diff --cached | grep -i "WEBHOOK_SECRET="; then
    echo "WARNING: Possible hardcoded secret in commit!"
    echo "Please verify this is not a real secret."
fi

exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Important Notes

### Files That Should NEVER Be Committed

❌ `orchestrator/.env` - Contains secrets
❌ `orchestrator/state.json` - Runtime session state
❌ `orchestrator/response.json` - Runtime question responses
❌ `orchestrator/orchestrator_logs/*` - Log files
❌ `orchestrator/__pycache__/*` - Python cache
❌ `orchestrator/test_output.md` - Test file

✅ `orchestrator/.env.example` - Template (safe to commit)
✅ `orchestrator/.gitignore` - Git ignore rules
✅ All Python source files
✅ All documentation files
✅ Configuration templates

### Checking for Sensitive Data

Before pushing:

```bash
# Search for potential secrets in staged changes
git diff --cached | grep -i "secret\|password\|token\|key"

# View all staged changes
git diff --cached

# If you find secrets, unstage and fix
git reset orchestrator/.env
```

### Recovering from Mistakes

**Uncommitted changes you want to discard:**
```bash
git checkout -- orchestrator/orchestrator.py
```

**Committed but not pushed:**
```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1
```

**Already pushed to remote:**
```bash
# DON'T use git push --force on shared branches!
# Instead, create a new commit that reverts:
git revert HEAD
git push
```

## Summary Checklist

Before committing orchestrator changes:

- [ ] On orchestrator branch (`git branch`)
- [ ] Made changes and tested locally
- [ ] Staged only source files (`git add orchestrator/`)
- [ ] No runtime files in staging (`git status`)
- [ ] No secrets in changes (`git diff --cached`)
- [ ] Written clear commit message
- [ ] Committed (`git commit`)
- [ ] Pushed to remote (optional: `git push`)

---

**Next Steps:**
1. Commit orchestrator files using commands above
2. Test orchestrator on your local machine
3. Deploy to Digital Ocean (see DEPLOYMENT.md)
4. Set up n8n workflows (see N8N_SETUP_INSTRUCTIONS.md)
5. Start using it via Telegram!
