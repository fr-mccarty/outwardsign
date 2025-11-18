"""
Claude Code Agent Wrapper

Manages Claude Code CLI sessions for individual tasks.
Handles:
- Spawning Claude Code processes
- Managing agent workspaces
- Writing status files
- Capturing output
- Enforcing safety boundaries
"""

import os
import json
import subprocess
import threading
from datetime import datetime
from typing import Optional, Dict, List
from pathlib import Path

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


class ClaudeAgent:
    """Wrapper for a Claude Code CLI agent"""

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
        self.process: Optional[subprocess.Popen] = None
        self.status = AgentStatus.PENDING
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None

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

        # Replace placeholders
        instructions = template.format(
            task_id=self.task_id,
            task_name=self.task_data.get("name", "Unknown"),
            module=self.task_data.get("module", "general"),
            estimated_complexity=self.task_data.get("estimated_complexity", "medium"),
            task_description=self.task_data.get("description", ""),
            deliverables_list=deliverables_list,
            context_files_list=context_files_list,
            workspace_path=self.workspace_dir,
            status_file_path=self.status_file,
            question_file_path=self.question_file
        )

        return instructions

    def start(self) -> bool:
        """Start the Claude Code agent"""
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

            # Prepare Claude Code command
            # Note: This is a simplified version - actual Claude Code CLI usage may differ
            # The agent would receive instructions via the CLI
            command = [
                CLAUDE_CODE_BINARY,
                # Add appropriate CLI flags for Claude Code
                # This is a placeholder - actual implementation depends on Claude Code CLI API
            ]

            # Open log file
            log_file_handle = open(self.log_file, 'w')

            # Start process
            self.process = subprocess.Popen(
                command,
                cwd=self.project_root,
                stdout=log_file_handle,
                stderr=subprocess.STDOUT,
                stdin=subprocess.PIPE,
                text=True
            )

            # Send instructions to agent via stdin
            if self.process.stdin:
                self.process.stdin.write(instructions + "\n")
                self.process.stdin.flush()

            # Update status
            self.status = AgentStatus.RUNNING
            self.started_at = datetime.now()
            self.write_status()

            print(f"Started agent {self.agent_id} (PID: {self.process.pid})")
            return True

        except Exception as e:
            print(f"Failed to start agent {self.agent_id}: {e}")
            self.status = AgentStatus.FAILED
            self.write_status()
            return False

    def write_status(self) -> None:
        """Write current status to status file"""
        status_data = {
            "task_id": self.task_id,
            "agent_id": self.agent_id,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "last_updated": datetime.now().isoformat(),
            "process_id": self.process.pid if self.process else None,
            "workspace": self.workspace_dir,
            "log_file": self.log_file
        }

        with open(self.status_file, 'w') as f:
            json.dump(status_data, f, indent=2)

    def read_status(self) -> Optional[Dict]:
        """Read status from status file (written by agent itself)"""
        try:
            with open(self.status_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return None
        except json.JSONDecodeError:
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
            print(f"Provided answer to agent {self.agent_id}")
            return True
        except Exception as e:
            print(f"Error writing answer file: {e}")
            return False

    def is_running(self) -> bool:
        """Check if agent process is still running"""
        if self.process is None:
            return False

        return self.process.poll() is None

    def stop(self, graceful: bool = True) -> bool:
        """Stop the agent"""
        if self.process is None:
            return False

        try:
            if graceful:
                # Send termination signal
                self.process.terminate()
                # Wait up to 10 seconds
                try:
                    self.process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    # Force kill if doesn't terminate
                    self.process.kill()
                    self.process.wait()
            else:
                # Force kill immediately
                self.process.kill()
                self.process.wait()

            self.status = AgentStatus.COMPLETED
            self.completed_at = datetime.now()
            self.write_status()

            print(f"Stopped agent {self.agent_id}")
            return True

        except Exception as e:
            print(f"Error stopping agent {self.agent_id}: {e}")
            return False

    def check_forbidden_operations(self) -> List[str]:
        """Check log file for forbidden operations"""
        violations = []

        try:
            with open(self.log_file, 'r') as f:
                log_content = f.read()

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
    """Manages multiple agents"""

    def __init__(self, project_root: str):
        self.project_root = project_root
        self.agents: Dict[str, ClaudeAgent] = {}

    def create_agent(self, task_id: str, task_data: Dict) -> ClaudeAgent:
        """Create a new agent for a task"""
        agent = ClaudeAgent(task_id, task_data, self.project_root)
        self.agents[task_id] = agent
        return agent

    def get_agent(self, task_id: str) -> Optional[ClaudeAgent]:
        """Get agent by task ID"""
        return self.agents.get(task_id)

    def get_all_agents(self) -> List[ClaudeAgent]:
        """Get all agents"""
        return list(self.agents.values())

    def get_running_agents(self) -> List[ClaudeAgent]:
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
