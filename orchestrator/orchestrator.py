#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Orchestrator - Simple task executor using Claude CLI

Loads tasks from markdown file and executes them one at a time.
"""

import os
import sys
import subprocess
import json
import argparse
from datetime import datetime
from pathlib import Path
import re
import time
import requests


class Task:
    """Represents a single task to be executed"""

    def __init__(self, task_id, title, task_type, priority, requires_approval,
                 description, acceptance_criteria, instruction):
        self.id = task_id
        self.title = title
        self.type = task_type
        self.priority = priority
        self.requires_approval = requires_approval
        self.description = description
        self.acceptance_criteria = acceptance_criteria
        self.instruction = instruction
        self.status = "pending"
        self.started_at = None
        self.completed_at = None
        self.result = None
        self.output_log = None

    def to_dict(self):
        """Convert task to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "title": self.title,
            "type": self.type,
            "priority": self.priority,
            "requires_approval": self.requires_approval,
            "description": self.description,
            "acceptance_criteria": self.acceptance_criteria,
            "instruction": self.instruction,
            "status": self.status,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "result": self.result,
            "output_log": self.output_log
        }


class Orchestrator:
    """Main orchestrator class"""

    def __init__(self, config_path=None):
        self.tasks = []
        self.current_task_index = 0
        self.status = "idle"
        self.session_id = None
        self.task_file = None
        self.started_at = None
        self.pending_question = None
        self.question_response = None

        # Paths
        self.base_dir = Path(__file__).parent
        self.logs_dir = self.base_dir / "orchestrator_logs"
        self.tasks_dir = self.base_dir / "orchestrator_tasks"
        self.state_file = self.base_dir / "state.json"
        self.response_file = self.base_dir / "response.json"

        # Create directories if they don't exist
        self.logs_dir.mkdir(exist_ok=True)
        self.tasks_dir.mkdir(exist_ok=True)

        # Config (will be loaded from file in future)
        self.config = {
            "claude_command": "claude -p",
            "claude_flags": "",
            "timeout": 300,  # 5 minutes
            "approval_mode": "required",
            "n8n_notify_url": os.getenv("N8N_NOTIFY_URL", "")
        }

    def notify_n8n(self, message, message_type='info', data=None):
        """Send notification to n8n webhook"""
        if not self.config.get('n8n_notify_url'):
            return

        try:
            payload = {
                'message': message,
                'type': message_type,
                'timestamp': datetime.now().isoformat(),
                'session_id': self.session_id,
                'data': data or {}
            }
            response = requests.post(
                self.config['n8n_notify_url'],
                json=payload,
                timeout=5
            )
            response.raise_for_status()
        except Exception as e:
            print(f"⚠️  Failed to notify n8n: {e}")

    def ask_question(self, question, options=None, timeout=300):
        """
        Ask a question via n8n/Telegram and wait for response

        Args:
            question: The question to ask
            options: List of possible responses (optional)
            timeout: How long to wait for response in seconds

        Returns:
            The user's response
        """
        self.pending_question = {
            'question': question,
            'options': options,
            'asked_at': datetime.now().isoformat()
        }
        self.status = 'waiting_for_input'
        self.save_state()

        # Send question to n8n
        self.notify_n8n(
            message=question,
            message_type='question',
            data={
                'options': options,
                'question_id': f"q-{self.session_id}-{self.current_task_index}"
            }
        )

        print(f"\n❓ {question}")
        if options:
            print(f"Options: {', '.join(options)}")
        print(f"⏳ Waiting for response from Telegram...")

        # Wait for response file to be created by webhook
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.response_file.exists():
                try:
                    with open(self.response_file, 'r') as f:
                        response_data = json.load(f)

                    # Clear response file
                    self.response_file.unlink()

                    self.question_response = response_data.get('response')
                    self.pending_question = None
                    self.status = 'running'

                    print(f"✅ Received response: {self.question_response}")
                    return self.question_response

                except Exception as e:
                    print(f"Error reading response: {e}")

            time.sleep(1)

        # Timeout
        self.notify_n8n("Question timed out", "warning")
        self.pending_question = None
        self.status = 'running'
        return None

    def send_status_update(self, update_type, message, data=None):
        """Send status update to n8n"""
        self.notify_n8n(
            message=message,
            message_type=update_type,
            data=data
        )

    def load_tasks(self, task_file):
        """Load tasks from markdown file"""
        self.task_file = task_file

        with open(task_file, 'r') as f:
            content = f.read()

        # Parse tasks from markdown
        # Expected format:
        # ## Task N: Title
        # **Type:** type
        # **Priority:** priority
        # **Requires Approval:** true/false
        # **Description:** description
        # **Acceptance Criteria:**
        # - criterion 1
        # - criterion 2
        # **Claude Instruction:**
        # instruction text

        task_pattern = r'## Task (\d+): (.+?)\n\*\*Type:\*\* (.+?)\n\*\*Priority:\*\* (.+?)\n\*\*Requires Approval:\*\* (.+?)\n\*\*Description:\*\* (.+?)\n\*\*Acceptance Criteria:\*\*\n((?:- .+?\n)+)\n\*\*Claude Instruction:\*\*\n(.+?)(?=\n---|\n##|\Z)'

        matches = re.finditer(task_pattern, content, re.DOTALL)

        for match in matches:
            task_id = int(match.group(1))
            title = match.group(2).strip()
            task_type = match.group(3).strip()
            priority = match.group(4).strip()
            requires_approval = match.group(5).strip().lower() == 'true'
            description = match.group(6).strip()
            acceptance_criteria = [
                line.strip('- ').strip()
                for line in match.group(7).strip().split('\n')
            ]
            instruction = match.group(8).strip()

            task = Task(
                task_id=task_id,
                title=title,
                task_type=task_type,
                priority=priority,
                requires_approval=requires_approval,
                description=description,
                acceptance_criteria=acceptance_criteria,
                instruction=instruction
            )

            self.tasks.append(task)

        print(f" Loaded {len(self.tasks)} tasks from {task_file}")
        return len(self.tasks)

    def get_current_task(self):
        """Get the current task to execute"""
        if self.current_task_index < len(self.tasks):
            return self.tasks[self.current_task_index]
        return None

    def execute_task(self, task):
        """Execute a single task using Claude CLI"""
        print(f"\n{'='*60}")
        print(f"�  Executing Task {task.id}/{len(self.tasks)}")
        print(f"=� {task.title}")
        print(f"Type: {task.type}")
        print(f"{'='*60}\n")

        task.status = "running"
        task.started_at = datetime.now().isoformat()

        # Send status update: task started
        self.send_status_update(
            'task_start',
            f"Starting Task {task.id}/{len(self.tasks)}: {task.title}",
            {
                'task_id': task.id,
                'task_title': task.title,
                'task_type': task.type,
                'total_tasks': len(self.tasks)
            }
        )

        # Create log file for this task
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        log_file = self.logs_dir / f"task-{task.id}-{timestamp}.log"
        task.output_log = str(log_file)

        # Build Claude command
        # echo "instruction" | claude -p "execute this following project conventions"
        claude_cmd = f'{self.config["claude_command"]} {self.config["claude_flags"]} "Execute this task following all project conventions and documentation"'

        try:
            # Execute using subprocess with piped input
            process = subprocess.Popen(
                claude_cmd,
                shell=True,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # Send task instruction as input
            stdout, stderr = process.communicate(
                input=task.instruction,
                timeout=self.config["timeout"]
            )

            # Write output to log file
            with open(log_file, 'w') as f:
                f.write(f"Task {task.id}: {task.title}\n")
                f.write(f"{'='*60}\n\n")
                f.write(f"INSTRUCTION:\n{task.instruction}\n\n")
                f.write(f"{'='*60}\n\n")
                f.write(f"OUTPUT:\n{stdout}\n\n")
                if stderr:
                    f.write(f"{'='*60}\n\n")
                    f.write(f"ERRORS:\n{stderr}\n")

            # Check result
            if process.returncode == 0:
                task.status = "completed"
                task.result = "success"
                task.completed_at = datetime.now().isoformat()

                print(f"\n Task {task.id} completed successfully!")
                print(f"=� Log: {log_file}")
            else:
                task.status = "failed"
                task.result = "error"
                task.completed_at = datetime.now().isoformat()

                print(f"\nL Task {task.id} failed!")
                print(f"=� Log: {log_file}")
                print(f"Error: {stderr}")

                return False

        except subprocess.TimeoutExpired:
            task.status = "failed"
            task.result = "timeout"
            task.completed_at = datetime.now().isoformat()

            print(f"\n�  Task {task.id} timed out after {self.config['timeout']} seconds")

            with open(log_file, 'a') as f:
                f.write(f"\n\nTIMEOUT: Task exceeded {self.config['timeout']} seconds")

            return False

        except Exception as e:
            task.status = "failed"
            task.result = "exception"
            task.completed_at = datetime.now().isoformat()

            print(f"\nL Task {task.id} failed with exception: {str(e)}")

            with open(log_file, 'a') as f:
                f.write(f"\n\nEXCEPTION: {str(e)}")

            return False

        return True

    def next_task(self):
        """Move to the next task"""
        self.current_task_index += 1

        if self.current_task_index >= len(self.tasks):
            self.status = "completed"
            return None

        task = self.get_current_task()

        if task.requires_approval:
            self.status = "waiting_approval"
        else:
            self.status = "ready"

        return task

    def run(self, auto_approve=False):
        """Run all tasks"""
        if not self.tasks:
            print("L No tasks loaded. Use load_tasks() first.")
            return

        self.session_id = datetime.now().strftime("%Y%m%d-%H%M%S")
        self.started_at = datetime.now().isoformat()
        self.status = "running"

        print(f"\n> Orchestrator Starting...")
        print(f"Session ID: {self.session_id}")
        print(f"Tasks: {len(self.tasks)}")
        print(f"Mode: {'Auto-approve' if auto_approve else 'Manual approval'}\n")

        while self.current_task_index < len(self.tasks):
            task = self.get_current_task()

            # Check if approval required
            if task.requires_approval and not auto_approve:
                print(f"\n�  Task {task.id} requires approval")
                print(f"=� {task.title}")
                print(f"Type: {task.type}")
                print(f"\nDescription: {task.description}")
                print(f"\nAcceptance Criteria:")
                for criterion in task.acceptance_criteria:
                    print(f"  - {criterion}")

                response = input(f"\n�  Execute this task? (y/n/skip): ").lower()

                if response == 'n':
                    print("\n=� Orchestrator stopped by user")
                    self.status = "paused"
                    self.save_state()
                    return
                elif response == 'skip':
                    print(f"�  Skipping task {task.id}")
                    task.status = "skipped"
                    self.next_task()
                    continue

            # Execute task
            success = self.execute_task(task)

            if not success:
                print(f"\nL Task {task.id} failed. Stop execution? (y/n): ", end='')
                response = input().lower()

                if response == 'y':
                    print("\n=� Orchestrator stopped due to task failure")
                    self.status = "failed"
                    self.save_state()
                    return

            # Move to next task
            self.next_task()

            # Show progress
            completed = sum(1 for t in self.tasks if t.status == "completed")
            print(f"\n=� Progress: {completed}/{len(self.tasks)} tasks completed")

        # All tasks completed
        self.status = "completed"
        print(f"\n{'='*60}")
        print(f" All tasks completed!")
        print(f"{'='*60}\n")

        self.print_summary()
        self.save_state()

    def print_summary(self):
        """Print summary of all tasks"""
        print("\n=� Task Summary:\n")

        for task in self.tasks:
            status_emoji = {
                "completed": "",
                "failed": "L",
                "skipped": "�",
                "pending": "�"
            }.get(task.status, "S")

            print(f"{status_emoji} Task {task.id}: {task.title}")
            print(f"   Status: {task.status}")
            if task.output_log:
                print(f"   Log: {task.output_log}")
            print()

    def save_state(self):
        """Save current state to JSON file"""
        state = {
            "session_id": self.session_id,
            "task_file": str(self.task_file),
            "current_task_index": self.current_task_index,
            "status": self.status,
            "tasks": [task.to_dict() for task in self.tasks],
            "started_at": self.started_at,
            "last_activity": datetime.now().isoformat()
        }

        with open(self.state_file, 'w') as f:
            json.dump(state, f, indent=2)

        print(f"=� State saved to {self.state_file}")

    def load_state(self):
        """Load state from JSON file"""
        if not self.state_file.exists():
            print("�  No state file found")
            return False

        with open(self.state_file, 'r') as f:
            state = json.load(f)

        self.session_id = state.get("session_id")
        self.task_file = state.get("task_file")
        self.current_task_index = state.get("current_task_index", 0)
        self.status = state.get("status", "idle")
        self.started_at = state.get("started_at")

        # Reconstruct tasks
        self.tasks = []
        for task_data in state.get("tasks", []):
            task = Task(
                task_id=task_data["id"],
                title=task_data["title"],
                task_type=task_data["type"],
                priority=task_data["priority"],
                requires_approval=task_data["requires_approval"],
                description=task_data["description"],
                acceptance_criteria=task_data["acceptance_criteria"],
                instruction=task_data["instruction"]
            )
            task.status = task_data.get("status", "pending")
            task.started_at = task_data.get("started_at")
            task.completed_at = task_data.get("completed_at")
            task.result = task_data.get("result")
            task.output_log = task_data.get("output_log")

            self.tasks.append(task)

        print(f" State loaded from {self.state_file}")
        print(f"Session: {self.session_id}")
        print(f"Status: {self.status}")
        print(f"Current task: {self.current_task_index + 1}/{len(self.tasks)}")

        return True

    def get_status(self):
        """Get current status"""
        current_task = self.get_current_task()
        completed = sum(1 for t in self.tasks if t.status == "completed")

        return {
            "session_id": self.session_id,
            "status": self.status,
            "current_task": self.current_task_index + 1 if current_task else None,
            "total_tasks": len(self.tasks),
            "completed": completed,
            "pending": len(self.tasks) - completed,
            "current_task_title": current_task.title if current_task else None
        }


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Orchestrator - Task executor using Claude CLI")
    parser.add_argument('--task-file', help='Path to task markdown file')
    parser.add_argument('--resume', action='store_true', help='Resume from saved state')
    parser.add_argument('--auto-approve', action='store_true', help='Auto-approve all tasks')
    parser.add_argument('--status', action='store_true', help='Show current status')

    args = parser.parse_args()

    orchestrator = Orchestrator()

    if args.status:
        # Show status
        if orchestrator.load_state():
            status = orchestrator.get_status()
            print(f"\n=� Orchestrator Status\n")
            print(f"Session: {status['session_id']}")
            print(f"Status: {status['status']}")
            print(f"Progress: {status['completed']}/{status['total_tasks']} tasks")
            if status['current_task_title']:
                print(f"Current: Task {status['current_task']} - {status['current_task_title']}")
        else:
            print("No active session")
        return

    if args.resume:
        # Resume from saved state
        if orchestrator.load_state():
            orchestrator.run(auto_approve=args.auto_approve)
        else:
            print("L No state to resume from")
        return

    if args.task_file:
        # Load tasks and run
        orchestrator.load_tasks(args.task_file)
        orchestrator.run(auto_approve=args.auto_approve)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
