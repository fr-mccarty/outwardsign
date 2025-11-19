"""
Claude Code Agent Wrapper (Using pexpect)

This module provides an improved agent wrapper that uses pexpect to interact
with Claude Code CLI interactively. It can:
- Send instructions to Claude Code
- Monitor output in real-time
- Detect when Claude asks questions
- Capture work completed
- Enforce safety boundaries
"""

import os
import json
import time
import re
import threading
from datetime import datetime
from typing import Optional, Dict, List, Callable
from pathlib import Path

try:
    import pexpect
except ImportError:
    print("ERROR: pexpect not installed. Run: pip install pexpect")
    raise

from config.constants import (
    CLAUDE_CODE_BINARY,
    CLAUDE_CODE_TIMEOUT_SECONDS,
    AGENT_WORKSPACE_BASE,
    AGENT_STATUS_DIR,
    AGENT_LOGS_DIR,
    AGENT_QUESTIONS_DIR,
    DISALLOW_GIT_OPERATIONS,
    DISALLOW_DATABASE_EXECUTION
)


class AgentStatus:
    """Agent status constants"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    FAILED = "failed"
    TIMEOUT = "timeout"


class ClaudeCodeAgent:
    """
    Wrapper for a Claude Code CLI agent using pexpect for interactive control.

    This agent:
    1. Spawns a Claude Code session
    2. Sends initial instructions
    3. Monitors output in real-time
    4. Detects questions and blocks for answers
    5. Captures status updates
    6. Enforces safety rules
    """

    def __init__(self, task_id: str, task_data: Dict, project_root: str):
        self.task_id = task_id
        self.task_data = task_data
        self.project_root = project_root
        self.agent_id = f"agent-{task_id}"

        # Paths
        self.workspace_dir = os.path.join(project_root, AGENT_WORKSPACE_BASE, task_id)
        self.status_file = os.path.join(project_root, AGENT_STATUS_DIR, f"{task_id}.json")
        self.log_file = os.path.join(project_root, AGENT_LOGS_DIR, f"{task_id}.log")
        self.question_file = os.path.join(project_root, AGENT_QUESTIONS_DIR, f"{task_id}.md")
        self.answer_file = os.path.join(project_root, AGENT_QUESTIONS_DIR, f"{task_id}-answer.md")

        # Process
        self.process: Optional[pexpect.spawn] = None
        self.status = AgentStatus.PENDING
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None

        # Monitoring
        self.output_buffer = []
        self.log_handle = None
        self.monitor_thread: Optional[threading.Thread] = None
        self.should_monitor = False

        # Metrics (extracted from agent status files)
        self.input_tokens = 0
        self.output_tokens = 0
        self.api_calls = 0
        self.progress_percent = 0

        # Ensure directories exist
        os.makedirs(self.workspace_dir, exist_ok=True)
        os.makedirs(os.path.dirname(self.status_file), exist_ok=True)
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        os.makedirs(os.path.dirname(self.question_file), exist_ok=True)

    def generate_agent_instructions(self) -> str:
        """Generate instructions for this agent from template"""
        template_path = os.path.join(self.project_root, "orchestrator/config/agent_instructions.md")

        with open(template_path, 'r') as f:
            template = f.read()

        # Format deliverables
        deliverables = self.task_data.get("deliverables", [])
        deliverables_list = "\n".join(f"- {d}" for d in deliverables)

        # Format context files
        context_files = self.task_data.get("context_files", [])
        context_files_list = "\n".join(f"- {f}" for f in context_files)

        # Create replacements dict
        replacements = {
            '{task_id}': self.task_id,
            '{task_name}': self.task_data.get("name", "Unknown"),
            '{module}': self.task_data.get("module", "general"),
            '{estimated_complexity}': self.task_data.get("estimated_complexity", "medium"),
            '{task_description}': self.task_data.get("description", ""),
            '{deliverables_list}': deliverables_list,
            '{context_files_list}': context_files_list,
            '{workspace_path}': self.workspace_dir,
            '{status_file_path}': self.status_file,
            '{question_file_path}': self.question_file
        }

        # Replace placeholders using string replace (not .format())
        instructions = template
        for placeholder, value in replacements.items():
            instructions = instructions.replace(placeholder, value)

        return instructions

    def start(self) -> bool:
        """Start the Claude Code agent using pexpect"""
        if self.process is not None:
            print(f"Agent {self.agent_id} already running")
            return False

        try:
            # Generate instructions
            instructions = self.generate_agent_instructions()

            # Save instructions to workspace for reference
            instructions_file = os.path.join(self.workspace_dir, "agent_instructions.md")
            with open(instructions_file, 'w') as f:
                f.write(instructions)

            # Open log file
            self.log_handle = open(self.log_file, 'wb')

            # Start Claude Code using pexpect with shell wrapper
            # Using bash -lc to support aliases and properly load PATH
            command = f"bash -lc 'cd {self.project_root} && {CLAUDE_CODE_BINARY}'"
            self.process = pexpect.spawn(
                command,
                timeout=30,  # Timeout for expect operations (not total runtime)
                encoding='utf-8',
                logfile=self.log_handle
            )

            # Update status
            self.status = AgentStatus.RUNNING
            self.started_at = datetime.now()
            self.write_status()

            # Send instructions to Claude Code
            # Strategy: Send the full instruction as a message
            print(f"Sending instructions to agent {self.agent_id}...")
            self.process.sendline(instructions)

            # Start monitoring thread
            self.should_monitor = True
            self.monitor_thread = threading.Thread(target=self._monitor_output, daemon=True)
            self.monitor_thread.start()

            print(f"✓ Started agent {self.agent_id} (PID: {self.process.pid})")
            return True

        except Exception as e:
            print(f"✗ Failed to start agent {self.agent_id}: {e}")
            import traceback
            traceback.print_exc()  # Print full stack trace for debugging
            self.status = AgentStatus.FAILED
            try:
                self.write_status()
            except Exception as status_error:
                print(f"Also failed to write status: {status_error}")
            if self.log_handle:
                self.log_handle.close()
            return False

    def _monitor_output(self) -> None:
        """
        Monitor Claude Code output in real-time.
        Runs in separate thread.
        """
        while self.should_monitor and self.is_running():
            try:
                # Read output with short timeout
                line = self.process.readline()
                if line:
                    self.output_buffer.append(line)

                    # Check for patterns that indicate agent needs help
                    self._check_for_patterns(line)

                time.sleep(0.1)

            except pexpect.TIMEOUT:
                continue
            except pexpect.EOF:
                # Process ended
                print(f"Agent {self.agent_id} process ended")
                self.should_monitor = False
                break
            except Exception as e:
                print(f"Error monitoring agent {self.agent_id}: {e}")
                time.sleep(1)

    def _check_for_patterns(self, line: str) -> None:
        """
        Check output for important patterns:
        - Status file updates
        - Question indicators
        - Completion signals
        - Violations
        """
        # Check for status file updates
        if "status" in line.lower() and "file" in line.lower():
            self._read_status_file()

        # Check for forbidden operations
        if DISALLOW_GIT_OPERATIONS:
            forbidden_git = ['git add', 'git commit', 'git push', 'git stash']
            for cmd in forbidden_git:
                if cmd in line:
                    print(f"\n🔴 VIOLATION: Agent {self.task_id} attempted: {cmd}")
                    self._handle_violation(f"Attempted git operation: {cmd}")
                    return

        if DISALLOW_DATABASE_EXECUTION:
            forbidden_db = ['supabase db push', 'supabase db reset', 'npm run db:fresh']
            for cmd in forbidden_db:
                if cmd in line:
                    print(f"\n🔴 VIOLATION: Agent {self.task_id} attempted: {cmd}")
                    self._handle_violation(f"Attempted database operation: {cmd}")
                    return

    def _read_status_file(self) -> None:
        """Read and update from agent's status file"""
        try:
            if os.path.exists(self.status_file):
                with open(self.status_file, 'r') as f:
                    status_data = json.load(f)

                # Update metrics from status file
                tokens = status_data.get("tokens_used", {})
                self.input_tokens = tokens.get("input", self.input_tokens)
                self.output_tokens = tokens.get("output", self.output_tokens)
                self.api_calls = status_data.get("api_calls", self.api_calls)
                self.progress_percent = status_data.get("progress_percent", self.progress_percent)

                # Update status if agent reports completion
                agent_status = status_data.get("status", "")
                if agent_status in ["completed", "blocked", "failed"]:
                    self.status = agent_status
                    if agent_status == "completed" and not self.completed_at:
                        self.completed_at = datetime.now()

        except Exception as e:
            pass  # Ignore errors reading status file

    def _handle_violation(self, violation: str) -> None:
        """Handle a safety violation"""
        self.status = AgentStatus.FAILED
        self.write_status()
        self.stop(graceful=False)

    def write_status(self) -> None:
        """Write orchestrator's view of status (separate from agent's own status file)"""
        status_data = {
            "task_id": self.task_id,
            "agent_id": self.agent_id,
            "orchestrator_status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "last_updated": datetime.now().isoformat(),
            "process_id": self.process.pid if self.process else None,
            "workspace": self.workspace_dir,
            "log_file": self.log_file,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "api_calls": self.api_calls,
            "progress_percent": self.progress_percent
        }

        # Write to a separate orchestrator status file
        orch_status_file = self.status_file.replace('.json', '-orchestrator.json')
        with open(orch_status_file, 'w') as f:
            json.dump(status_data, f, indent=2)

    def read_status(self) -> Optional[Dict]:
        """Read status from agent's own status file"""
        try:
            if os.path.exists(self.status_file):
                with open(self.status_file, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return None

    def check_for_question(self) -> Optional[str]:
        """Check if agent has asked a question"""
        if os.path.exists(self.question_file):
            # Check if already answered
            if os.path.exists(self.answer_file):
                return None

            try:
                with open(self.question_file, 'r') as f:
                    question = f.read()
                return question
            except Exception as e:
                print(f"Error reading question file: {e}")
                return None

        return None

    def provide_answer(self, answer: str) -> bool:
        """Provide answer to agent's question"""
        try:
            with open(self.answer_file, 'w') as f:
                f.write(answer)
            print(f"✓ Provided answer to agent {self.agent_id}")

            # Notify agent via Claude Code (send a message)
            if self.process and self.is_running():
                self.process.sendline(f"The answer to your question has been provided in {self.answer_file}")

            return True
        except Exception as e:
            print(f"Error writing answer file: {e}")
            return False

    def is_running(self) -> bool:
        """Check if agent process is still running"""
        if self.process is None:
            return False
        return self.process.isalive()

    def stop(self, graceful: bool = True) -> bool:
        """Stop the agent"""
        if self.process is None:
            return False

        try:
            # Stop monitoring thread
            self.should_monitor = False

            if graceful:
                # Try to send exit command
                if self.process.isalive():
                    try:
                        self.process.sendline("/exit")
                        self.process.expect(pexpect.EOF, timeout=10)
                    except:
                        self.process.terminate(force=True)
            else:
                # Force kill
                self.process.terminate(force=True)

            # Wait for process to end
            if self.process.isalive():
                self.process.wait()

            # Close log file
            if self.log_handle:
                self.log_handle.close()
                self.log_handle = None

            if not self.completed_at:
                self.completed_at = datetime.now()

            self.write_status()

            print(f"✓ Stopped agent {self.agent_id}")
            return True

        except Exception as e:
            print(f"Error stopping agent {self.agent_id}: {e}")
            return False

    def check_forbidden_operations(self) -> List[str]:
        """Check log file for forbidden operations"""
        violations = []

        try:
            with open(self.log_file, 'rb') as f:
                log_content = f.read().decode('utf-8', errors='ignore')

            # Check for forbidden git operations
            if DISALLOW_GIT_OPERATIONS:
                forbidden_git = ['git add', 'git commit', 'git push', 'git stash']
                for cmd in forbidden_git:
                    if cmd in log_content:
                        violations.append(f"Forbidden git operation: {cmd}")

            # Check for forbidden database operations
            if DISALLOW_DATABASE_EXECUTION:
                forbidden_db = ['supabase db push', 'supabase db reset', 'npm run db:fresh']
                for cmd in forbidden_db:
                    if cmd in log_content:
                        violations.append(f"Forbidden database operation: {cmd}")

        except Exception as e:
            print(f"Error checking log file: {e}")

        return violations

    def get_duration_seconds(self) -> Optional[float]:
        """Get agent duration in seconds"""
        if not self.started_at:
            return None

        end = self.completed_at or datetime.now()
        return (end - self.started_at).total_seconds()

    def get_workspace_files(self) -> List[str]:
        """Get list of files in agent workspace"""
        files = []
        try:
            for root, _, filenames in os.walk(self.workspace_dir):
                for filename in filenames:
                    filepath = os.path.join(root, filename)
                    relpath = os.path.relpath(filepath, self.workspace_dir)
                    files.append(relpath)
        except Exception as e:
            print(f"Error listing workspace files: {e}")

        return files

    def get_summary_file(self) -> Optional[str]:
        """Read agent's summary file if it exists"""
        summary_path = os.path.join(self.workspace_dir, "summary.md")
        if os.path.exists(summary_path):
            try:
                with open(summary_path, 'r') as f:
                    return f.read()
            except Exception as e:
                print(f"Error reading summary file: {e}")
        return None


class AgentManager:
    """Manages multiple Claude Code agents"""

    def __init__(self, project_root: str):
        self.project_root = project_root
        self.agents: Dict[str, ClaudeCodeAgent] = {}

    def create_agent(self, task_id: str, task_data: Dict) -> ClaudeCodeAgent:
        """Create a new agent for a task"""
        agent = ClaudeCodeAgent(task_id, task_data, self.project_root)
        self.agents[task_id] = agent
        return agent

    def get_agent(self, task_id: str) -> Optional[ClaudeCodeAgent]:
        """Get agent by task ID"""
        return self.agents.get(task_id)

    def get_all_agents(self) -> List[ClaudeCodeAgent]:
        """Get all agents"""
        return list(self.agents.values())

    def get_running_agents(self) -> List[ClaudeCodeAgent]:
        """Get all running agents"""
        return [a for a in self.agents.values() if a.is_running()]

    def stop_all_agents(self, graceful: bool = True) -> None:
        """Stop all running agents"""
        for agent in self.get_running_agents():
            agent.stop(graceful=graceful)

    def check_all_for_questions(self) -> Dict[str, str]:
        """Check all agents for questions"""
        questions = {}
        for task_id, agent in self.agents.items():
            question = agent.check_for_question()
            if question:
                questions[task_id] = question
        return questions

    def check_all_for_violations(self) -> Dict[str, List[str]]:
        """Check all agents for forbidden operations"""
        violations = {}
        for task_id, agent in self.agents.items():
            agent_violations = agent.check_forbidden_operations()
            if agent_violations:
                violations[task_id] = agent_violations
        return violations
