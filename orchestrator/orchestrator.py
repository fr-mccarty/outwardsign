#!/usr/bin/env python3
"""
Orchestrator Main Script

Manages Claude Code agents to execute daily development tasks.

Usage:
    python orchestrator.py start tasks/2025-11-18.yaml
    python orchestrator.py report tasks/2025-11-18.yaml
    python orchestrator.py status
"""

import sys
import os
import yaml
import time
import signal
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Add orchestrator directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from claude_code_agent import AgentManager, AgentStatus
from metrics import MetricsTracker, format_metrics_summary
from telegram_notifier import get_notifier, Priority
from config import constants


class Orchestrator:
    """Main orchestrator controller"""

    def __init__(self, project_root: str):
        self.project_root = project_root
        self.agent_manager = AgentManager(project_root)
        self.metrics_tracker = MetricsTracker()
        self.notifier = get_notifier()
        self.running = False
        self.task_file_path: Optional[str] = None
        self.tasks: List[Dict] = []
        self.cost_warning_sent = False

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print("\n\nReceived shutdown signal. Stopping all agents gracefully...")
        self.stop()
        sys.exit(0)

    def load_task_file(self, task_file: str) -> bool:
        """Load and parse task YAML file"""
        try:
            with open(task_file, 'r') as f:
                data = yaml.safe_load(f)

            self.task_file_path = task_file
            self.tasks = data.get('tasks', [])

            # Validate task file
            if not self.tasks:
                print("Error: No tasks found in task file")
                return False

            # Set max cost if specified
            if 'max_cost_usd' in data:
                constants.MAX_DAILY_COST_USD = data['max_cost_usd']

            print(f"Loaded {len(self.tasks)} tasks from {task_file}")
            return True

        except FileNotFoundError:
            print(f"Error: Task file not found: {task_file}")
            return False
        except yaml.YAMLError as e:
            print(f"Error parsing YAML file: {e}")
            return False

    def start(self) -> None:
        """Start the orchestrator and spawn agents"""
        if not self.tasks:
            print("Error: No tasks loaded. Use load_task_file() first.")
            return

        self.running = True
        print("=" * 60)
        print("ORCHESTRATOR STARTING")
        print("=" * 60)
        print(f"Tasks: {len(self.tasks)}")
        print(f"Max Daily Cost: ${constants.MAX_DAILY_COST_USD:.2f}")
        print(f"Max Concurrent Agents: {constants.MAX_CONCURRENT_AGENTS}")
        print("=" * 60)

        # Notify via Telegram
        date_str = datetime.now().strftime("%Y-%m-%d")
        self.notifier.notify_orchestrator_started(len(self.tasks), date_str)

        # Start agents for tasks (respecting MAX_CONCURRENT_AGENTS)
        for task_data in self.tasks:
            task_id = task_data.get('id', 'unknown')

            # Wait if we've hit max concurrent agents
            while len(self.agent_manager.get_running_agents()) >= constants.MAX_CONCURRENT_AGENTS:
                print(f"Waiting for agent slot (max concurrent: {constants.MAX_CONCURRENT_AGENTS})...")
                time.sleep(30)
                self._check_agents()

            # Check cost limit before starting new agent
            if self.metrics_tracker.should_halt_cost:
                print("\n⚠️  Cost limit reached. Halting new agent starts.")
                self.notifier.notify_cost_limit_reached(
                    self.metrics_tracker.total_cost,
                    constants.MAX_DAILY_COST_USD
                )
                break

            # Create and start agent
            print(f"\nStarting agent for task: {task_id}")
            agent = self.agent_manager.create_agent(task_id, task_data)
            self.metrics_tracker.add_agent(task_id, agent.agent_id)

            if agent.start():
                print(f"✓ Agent {task_id} started successfully")
            else:
                print(f"✗ Failed to start agent {task_id}")

        # Main monitoring loop
        print("\n" + "=" * 60)
        print("MONITORING AGENTS")
        print("=" * 60)

        try:
            self._monitor_loop()
        except KeyboardInterrupt:
            print("\n\nKeyboard interrupt received. Stopping...")
            self.stop()

    def _monitor_loop(self) -> None:
        """Main monitoring loop"""
        last_question_check = time.time()
        last_status_check = time.time()

        while self.running:
            current_time = time.time()

            # Check agent status
            if current_time - last_status_check >= constants.STATUS_POLL_INTERVAL_SECONDS:
                self._check_agents()
                last_status_check = current_time

            # Check for questions
            if current_time - last_question_check >= constants.QUESTION_POLL_INTERVAL_SECONDS:
                self._check_questions()
                last_question_check = current_time

            # Check if all agents complete
            if not self.agent_manager.get_running_agents():
                print("\n✓ All agents completed")
                self.running = False
                break

            # Sleep briefly
            time.sleep(5)

        # Generate final report
        print("\nGenerating final report...")
        self.generate_report()

    def _check_agents(self) -> None:
        """Check status of all agents"""
        for agent in self.agent_manager.get_all_agents():
            # Read status file (written by agent)
            status_data = agent.read_status()
            if status_data:
                # Update metrics
                self.metrics_tracker.update_agent(agent.agent_id, status_data)

            # Check if agent is still running
            if agent.status == AgentStatus.RUNNING and not agent.is_running():
                print(f"\n⚠️  Agent {agent.task_id} process stopped unexpectedly")
                agent.status = AgentStatus.FAILED
                agent.write_status()

                self.notifier.notify_task_failed(
                    agent.task_id,
                    "Process stopped unexpectedly"
                )

            # Check for forbidden operations
            violations = agent.check_forbidden_operations()
            if violations:
                print(f"\n🔴 VIOLATION DETECTED in agent {agent.task_id}:")
                for violation in violations:
                    print(f"  - {violation}")

                # Stop agent
                agent.stop(graceful=False)
                self.notifier.notify_task_failed(
                    agent.task_id,
                    f"Forbidden operation: {violations[0]}"
                )

            # Check for timeout
            duration = agent.get_duration_seconds()
            if duration and duration > constants.CLAUDE_CODE_TIMEOUT_SECONDS:
                print(f"\n⏰ Agent {agent.task_id} timed out")
                agent.stop(graceful=False)
                agent.status = AgentStatus.TIMEOUT
                agent.write_status()

                self.notifier.notify_agent_timeout(
                    agent.task_id,
                    duration / 3600
                )

        # Check cost
        if self.metrics_tracker.should_warn_cost and not self.cost_warning_sent:
            print(f"\n⚠️  Cost warning: {self.metrics_tracker.cost_percent_used}% of daily limit used")
            self.notifier.notify_cost_warning(
                self.metrics_tracker.total_cost,
                constants.MAX_DAILY_COST_USD,
                self.metrics_tracker.cost_percent_used
            )
            self.cost_warning_sent = True

        if self.metrics_tracker.should_halt_cost:
            print(f"\n🔴 Cost limit reached! Halting all agents.")
            self.agent_manager.stop_all_agents(graceful=True)
            self.notifier.notify_cost_limit_reached(
                self.metrics_tracker.total_cost,
                constants.MAX_DAILY_COST_USD
            )
            self.running = False

        # Print status summary
        print(f"\r[{datetime.now().strftime('%H:%M:%S')}] "
              f"Running: {len(self.agent_manager.get_running_agents())} | "
              f"Completed: {len(self.metrics_tracker.get_completed_tasks())} | "
              f"Cost: ${self.metrics_tracker.total_cost:.2f}", end='')

    def _check_questions(self) -> None:
        """Check for agent questions"""
        questions = self.agent_manager.check_all_for_questions()

        for task_id, question_text in questions.items():
            agent = self.agent_manager.get_agent(task_id)
            if agent:
                # Update agent status to blocked
                agent.status = AgentStatus.BLOCKED
                agent.write_status()

                # Extract question preview
                lines = question_text.split('\n')
                preview = ' '.join(lines[:5])  # First 5 lines

                print(f"\n\n❓ QUESTION from agent {task_id}")
                print(f"Preview: {preview[:200]}...")
                print(f"Full question in: {agent.question_file}")

                # Send Telegram notification
                self.notifier.notify_question(task_id, preview)

    def stop(self) -> None:
        """Stop all agents and clean up"""
        print("\nStopping all agents...")
        self.agent_manager.stop_all_agents(graceful=True)
        self.running = False

        # Save metrics
        metrics_file = os.path.join(
            self.project_root,
            constants.RESULTS_DIR,
            f"{datetime.now().strftime('%Y-%m-%d')}-metrics.json"
        )
        self.metrics_tracker.save_to_file(metrics_file)
        print(f"Metrics saved to: {metrics_file}")

    def generate_report(self) -> str:
        """Generate end-of-day report"""
        report_lines = []

        # Header
        date_str = datetime.now().strftime("%Y-%m-%d")
        report_lines.extend([
            "# Orchestrator Report - " + date_str,
            "",
            "## Summary",
            f"- Tasks Completed: {len(self.metrics_tracker.get_completed_tasks())}/{len(self.tasks)}",
            f"- Tasks In Progress: {len(self.metrics_tracker.get_in_progress_tasks())}",
            f"- Tasks Blocked: {len(self.metrics_tracker.get_blocked_tasks())}",
            f"- Tasks Failed: {len(self.metrics_tracker.get_failed_tasks())}",
            f"- Total Cost: ${self.metrics_tracker.total_cost:.2f} / ${constants.MAX_DAILY_COST_USD:.2f}",
            f"- Budget Used: {self.metrics_tracker.cost_percent_used:.1f}%",
            "",
            "## Task Results",
            ""
        ])

        # Task details
        for task_data in self.tasks:
            task_id = task_data.get('id', 'unknown')
            agent = self.agent_manager.get_agent(task_id)

            if not agent:
                continue

            metrics = self.metrics_tracker.get_agent(agent.agent_id)

            # Status emoji
            status_emoji = {
                AgentStatus.COMPLETED: "✅",
                AgentStatus.RUNNING: "🔄",
                AgentStatus.BLOCKED: "⏸️",
                AgentStatus.FAILED: "❌",
                AgentStatus.TIMEOUT: "⏰"
            }.get(agent.status, "❓")

            report_lines.extend([
                f"### {status_emoji} {task_id}: {task_data.get('name', 'Unknown')}",
                f"- Status: {agent.status.upper()}",
                f"- Module: {task_data.get('module', 'N/A')}",
                f"- Complexity: {task_data.get('estimated_complexity', 'N/A')}",
            ])

            if metrics:
                report_lines.extend([
                    f"- Duration: {metrics.duration_formatted}",
                    f"- Cost: ${metrics.cost_usd:.2f}",
                    f"- Tokens: {metrics.input_tokens:,} input / {metrics.output_tokens:,} output",
                    f"- API Calls: {metrics.api_calls}",
                ])

            # Deliverables
            expected_deliverables = task_data.get('deliverables', [])
            if expected_deliverables:
                report_lines.append("- Deliverables:")
                for deliverable in expected_deliverables:
                    # Check if file exists
                    deliverable_path = os.path.join(self.project_root, deliverable)
                    exists = os.path.exists(deliverable_path)
                    check = "✅" if exists else "❌"
                    report_lines.append(f"  - {check} {deliverable}")

            # Workspace files
            workspace_files = agent.get_workspace_files()
            if workspace_files:
                report_lines.append("- Workspace Files:")
                for wf in workspace_files[:5]:  # Show first 5
                    report_lines.append(f"  - {wf}")
                if len(workspace_files) > 5:
                    report_lines.append(f"  - ... and {len(workspace_files) - 5} more")

            # Summary
            summary = agent.get_summary_file()
            if summary:
                report_lines.extend([
                    "- Agent Summary:",
                    "  ```",
                    "  " + summary[:500] + ("..." if len(summary) > 500 else ""),
                    "  ```"
                ])

            report_lines.append("")

        # Overall metrics summary
        report_lines.extend([
            "## Overall Metrics",
            "",
            f"- Total Tokens: {self.metrics_tracker.total_tokens:,}",
            f"- Total API Calls: {self.metrics_tracker.total_api_calls}",
            f"- Total Cost: ${self.metrics_tracker.total_cost:.2f}",
            f"- Average Cost per Task: ${self.metrics_tracker.total_cost / len(self.tasks):.2f}",
            "",
            "## Next Steps",
            "",
            "1. Review agent workspaces and deliverables",
            "2. Test changes manually if needed",
            "3. Create feedback file: `feedback/" + date_str + ".md`",
            "4. If satisfied, commit changes with git",
            "5. Run any migrations or build steps as needed",
            ""
        ])

        # Save report
        report_content = "\n".join(report_lines)
        report_file = os.path.join(
            self.project_root,
            constants.RESULTS_DIR,
            f"{date_str}-report.md"
        )

        os.makedirs(os.path.dirname(report_file), exist_ok=True)
        with open(report_file, 'w') as f:
            f.write(report_content)

        print(f"\n✓ Report saved to: {report_file}")

        # Also print to console
        print("\n" + "=" * 60)
        print(report_content)
        print("=" * 60)

        # Notify via Telegram
        completed = len(self.metrics_tracker.get_completed_tasks())
        self.notifier.notify_all_tasks_complete(
            completed,
            len(self.tasks),
            self.metrics_tracker.total_cost
        )

        return report_content

    def show_status(self) -> None:
        """Show current status"""
        print(format_metrics_summary(self.metrics_tracker))

        print("\nAgent Status:")
        for agent in self.agent_manager.get_all_agents():
            metrics = self.metrics_tracker.get_agent(agent.agent_id)
            duration = metrics.duration_formatted if metrics else "N/A"
            cost = f"${metrics.cost_usd:.2f}" if metrics else "$0.00"

            print(f"  {agent.task_id}: {agent.status.upper()} | {duration} | {cost}")


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python orchestrator.py start <task-file.yaml>")
        print("  python orchestrator.py report <task-file.yaml>")
        print("  python orchestrator.py status")
        sys.exit(1)

    command = sys.argv[1]
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    orchestrator = Orchestrator(project_root)

    if command == "start":
        if len(sys.argv) < 3:
            print("Error: Task file required")
            print("Usage: python orchestrator.py start <task-file.yaml>")
            sys.exit(1)

        task_file = sys.argv[2]
        if not os.path.isabs(task_file):
            task_file = os.path.join(project_root, "orchestrator", task_file)

        if orchestrator.load_task_file(task_file):
            orchestrator.start()

    elif command == "report":
        if len(sys.argv) < 3:
            print("Error: Task file required")
            print("Usage: python orchestrator.py report <task-file.yaml>")
            sys.exit(1)

        task_file = sys.argv[2]
        if not os.path.isabs(task_file):
            task_file = os.path.join(project_root, "orchestrator", task_file)

        if orchestrator.load_task_file(task_file):
            orchestrator.generate_report()

    elif command == "status":
        orchestrator.show_status()

    else:
        print(f"Unknown command: {command}")
        print("Available commands: start, report, status")
        sys.exit(1)


if __name__ == "__main__":
    main()
