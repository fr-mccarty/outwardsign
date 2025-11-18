"""
Telegram Notification Module

Sends notifications to user via Telegram when:
- Agent asks a question (HIGH priority)
- Cost warnings/limits reached
- Tasks complete
- Errors occur
"""

import os
import requests
from typing import Optional
from enum import Enum
from config.constants import TELEGRAM_ENABLED, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID


class Priority(Enum):
    """Notification priority levels"""
    URGENT = "🔴"
    HIGH = "🟠"
    NORMAL = "🟢"
    LOW = "⚪"


class TelegramNotifier:
    """Sends notifications via Telegram Bot API"""

    def __init__(self):
        # Get from environment if not in constants
        self.bot_token = TELEGRAM_BOT_TOKEN or os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.chat_id = TELEGRAM_CHAT_ID or os.getenv("TELEGRAM_CHAT_ID", "")
        self.enabled = TELEGRAM_ENABLED and bool(self.bot_token) and bool(self.chat_id)

    def send_message(self, message: str, priority: Priority = Priority.NORMAL) -> bool:
        """Send a message via Telegram"""
        if not self.enabled:
            # If Telegram not configured, just print to console
            print(f"\n[TELEGRAM {priority.name}] {message}\n")
            return False

        try:
            url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
            payload = {
                "chat_id": self.chat_id,
                "text": f"{priority.value} {message}",
                "parse_mode": "Markdown"
            }

            response = requests.post(url, json=payload, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")
            return False

    def notify_question(self, task_id: str, question_preview: str) -> bool:
        """Notify that an agent has asked a question"""
        message = (
            f"*Agent Question*\n\n"
            f"Task: `{task_id}`\n"
            f"Question: {question_preview[:200]}...\n\n"
            f"Check `agent_questions/{task_id}.md` for full question."
        )
        return self.send_message(message, Priority.HIGH)

    def notify_task_completed(self, task_id: str, task_name: str) -> bool:
        """Notify that a task has completed"""
        message = (
            f"*Task Completed*\n\n"
            f"Task: `{task_id}`\n"
            f"Name: {task_name}"
        )
        return self.send_message(message, Priority.NORMAL)

    def notify_task_failed(self, task_id: str, reason: str) -> bool:
        """Notify that a task has failed"""
        message = (
            f"*Task Failed*\n\n"
            f"Task: `{task_id}`\n"
            f"Reason: {reason}"
        )
        return self.send_message(message, Priority.HIGH)

    def notify_cost_warning(self, current_cost: float, limit: float, percent: float) -> bool:
        """Notify that cost is approaching limit"""
        message = (
            f"*Cost Warning*\n\n"
            f"Current: ${current_cost:.2f}\n"
            f"Limit: ${limit:.2f}\n"
            f"Used: {percent:.1f}%"
        )
        return self.send_message(message, Priority.HIGH)

    def notify_cost_limit_reached(self, total_cost: float, limit: float) -> bool:
        """Notify that cost limit has been reached"""
        message = (
            f"*Cost Limit Reached*\n\n"
            f"Total Cost: ${total_cost:.2f}\n"
            f"Daily Limit: ${limit:.2f}\n\n"
            f"All agents have been halted."
        )
        return self.send_message(message, Priority.URGENT)

    def notify_all_tasks_complete(self, completed: int, total: int, cost: float) -> bool:
        """Notify that all tasks are complete"""
        message = (
            f"*All Tasks Complete*\n\n"
            f"Completed: {completed}/{total}\n"
            f"Total Cost: ${cost:.2f}\n\n"
            f"Review results and provide feedback."
        )
        return self.send_message(message, Priority.NORMAL)

    def notify_agent_timeout(self, task_id: str, duration_hours: float) -> bool:
        """Notify that an agent has timed out"""
        message = (
            f"*Agent Timeout*\n\n"
            f"Task: `{task_id}`\n"
            f"Duration: {duration_hours:.1f} hours\n\n"
            f"Agent has been halted."
        )
        return self.send_message(message, Priority.HIGH)

    def notify_agent_hung(self, task_id: str, last_update_minutes: int) -> bool:
        """Notify that an agent appears to be hung"""
        message = (
            f"*Agent Appears Hung*\n\n"
            f"Task: `{task_id}`\n"
            f"Last Update: {last_update_minutes} minutes ago\n\n"
            f"No status updates received recently."
        )
        return self.send_message(message, Priority.HIGH)

    def notify_orchestrator_started(self, task_count: int, date: str) -> bool:
        """Notify that orchestrator has started"""
        message = (
            f"*Orchestrator Started*\n\n"
            f"Date: {date}\n"
            f"Tasks: {task_count}\n\n"
            f"Agents are now running."
        )
        return self.send_message(message, Priority.NORMAL)


# Singleton instance
_notifier: Optional[TelegramNotifier] = None


def get_notifier() -> TelegramNotifier:
    """Get singleton TelegramNotifier instance"""
    global _notifier
    if _notifier is None:
        _notifier = TelegramNotifier()
    return _notifier
