# Tasks - Example

## Task 1: Create a simple test file
**Type:** documentation
**Priority:** low
**Requires Approval:** true
**Description:** Create a simple markdown file to test the orchestrator
**Acceptance Criteria:**
- File created at orchestrator/test_output.md
- Contains heading and some text
- File is readable

**Claude Instruction:**
Create a simple markdown file at orchestrator/test_output.md with a heading "Test File" and a paragraph explaining that this file was created by the orchestrator as a test. Use the Write tool to create this file.

---

## Task 2: List files in the orchestrator directory
**Type:** documentation
**Priority:** low
**Requires Approval:** false
**Description:** List all files in the orchestrator directory to verify structure
**Acceptance Criteria:**
- Command executes successfully
- Output shows directory structure

**Claude Instruction:**
Use the Bash tool to run `ls -la orchestrator/` and describe what files are present in the orchestrator directory. Confirm that orchestrator.py, requirements.txt, and the logs/tasks directories exist.

---

## Task 3: Check git status
**Type:** documentation
**Priority:** low
**Requires Approval:** false
**Description:** Check the current git status of the project
**Acceptance Criteria:**
- Git status command runs
- Shows current branch and changes

**Claude Instruction:**
Use the Bash tool to run `git status` and summarize what changes are currently staged or unstaged. Note any new files in the orchestrator directory.

---
