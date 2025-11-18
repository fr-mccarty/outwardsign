"""
Metrics Tracking Module

Tracks compute metrics for orchestrator agents including:
- Token usage (input/output)
- API call counts
- Cost calculation
- Wall-clock time
- Success/failure rates
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from config.constants import (
    CLAUDE_API_INPUT_COST_PER_1M,
    CLAUDE_API_OUTPUT_COST_PER_1M,
    MAX_DAILY_COST_USD,
    COST_WARNING_THRESHOLD
)


@dataclass
class AgentMetrics:
    """Metrics for a single agent"""
    task_id: str
    agent_id: str
    started_at: str
    completed_at: Optional[str] = None
    status: str = "running"  # running, completed, blocked, failed, timeout
    input_tokens: int = 0
    output_tokens: int = 0
    api_calls: int = 0
    progress_percent: int = 0

    @property
    def total_tokens(self) -> int:
        """Total tokens used (input + output)"""
        return self.input_tokens + self.output_tokens

    @property
    def cost_usd(self) -> float:
        """Calculate cost in USD based on token usage"""
        input_cost = (self.input_tokens / 1_000_000) * CLAUDE_API_INPUT_COST_PER_1M
        output_cost = (self.output_tokens / 1_000_000) * CLAUDE_API_OUTPUT_COST_PER_1M
        return round(input_cost + output_cost, 2)

    @property
    def duration_seconds(self) -> Optional[float]:
        """Calculate duration in seconds"""
        if not self.completed_at:
            # Calculate duration from start to now
            start = datetime.fromisoformat(self.started_at)
            now = datetime.now()
            return (now - start).total_seconds()

        start = datetime.fromisoformat(self.started_at)
        end = datetime.fromisoformat(self.completed_at)
        return (end - start).total_seconds()

    @property
    def duration_formatted(self) -> str:
        """Format duration as human-readable string"""
        if not self.duration_seconds:
            return "N/A"

        seconds = int(self.duration_seconds)
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60

        if hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"

    def update_from_status_file(self, status_data: Dict) -> None:
        """Update metrics from agent status file"""
        self.status = status_data.get("status", self.status)
        self.progress_percent = status_data.get("progress_percent", self.progress_percent)

        tokens = status_data.get("tokens_used", {})
        self.input_tokens = tokens.get("input", self.input_tokens)
        self.output_tokens = tokens.get("output", self.output_tokens)

        self.api_calls = status_data.get("api_calls", self.api_calls)

        if self.status == "completed" and not self.completed_at:
            self.completed_at = datetime.now().isoformat()


class MetricsTracker:
    """Tracks metrics for all agents in a session"""

    def __init__(self):
        self.agents: Dict[str, AgentMetrics] = {}
        self.session_started_at = datetime.now().isoformat()

    def add_agent(self, task_id: str, agent_id: str) -> AgentMetrics:
        """Register a new agent"""
        metrics = AgentMetrics(
            task_id=task_id,
            agent_id=agent_id,
            started_at=datetime.now().isoformat()
        )
        self.agents[agent_id] = metrics
        return metrics

    def update_agent(self, agent_id: str, status_data: Dict) -> Optional[AgentMetrics]:
        """Update agent metrics from status file"""
        if agent_id not in self.agents:
            return None

        self.agents[agent_id].update_from_status_file(status_data)
        return self.agents[agent_id]

    def get_agent(self, agent_id: str) -> Optional[AgentMetrics]:
        """Get metrics for specific agent"""
        return self.agents.get(agent_id)

    @property
    def total_cost(self) -> float:
        """Total cost across all agents"""
        return round(sum(agent.cost_usd for agent in self.agents.values()), 2)

    @property
    def total_tokens(self) -> int:
        """Total tokens across all agents"""
        return sum(agent.total_tokens for agent in self.agents.values())

    @property
    def total_api_calls(self) -> int:
        """Total API calls across all agents"""
        return sum(agent.api_calls for agent in self.agents.values())

    @property
    def cost_remaining(self) -> float:
        """Remaining budget for the day"""
        return round(MAX_DAILY_COST_USD - self.total_cost, 2)

    @property
    def cost_percent_used(self) -> float:
        """Percentage of daily budget used"""
        return round((self.total_cost / MAX_DAILY_COST_USD) * 100, 1)

    @property
    def should_warn_cost(self) -> bool:
        """Should warn about approaching cost limit"""
        return self.cost_percent_used >= (COST_WARNING_THRESHOLD * 100)

    @property
    def should_halt_cost(self) -> bool:
        """Should halt due to cost limit"""
        return self.total_cost >= MAX_DAILY_COST_USD

    def get_completed_tasks(self) -> List[AgentMetrics]:
        """Get all completed task metrics"""
        return [a for a in self.agents.values() if a.status == "completed"]

    def get_in_progress_tasks(self) -> List[AgentMetrics]:
        """Get all in-progress task metrics"""
        return [a for a in self.agents.values() if a.status == "running"]

    def get_blocked_tasks(self) -> List[AgentMetrics]:
        """Get all blocked task metrics"""
        return [a for a in self.agents.values() if a.status == "blocked"]

    def get_failed_tasks(self) -> List[AgentMetrics]:
        """Get all failed task metrics"""
        return [a for a in self.agents.values() if a.status == "failed"]

    def get_summary(self) -> Dict:
        """Get summary statistics"""
        completed = len(self.get_completed_tasks())
        in_progress = len(self.get_in_progress_tasks())
        blocked = len(self.get_blocked_tasks())
        failed = len(self.get_failed_tasks())
        total = len(self.agents)

        return {
            "total_tasks": total,
            "completed": completed,
            "in_progress": in_progress,
            "blocked": blocked,
            "failed": failed,
            "total_cost": self.total_cost,
            "cost_limit": MAX_DAILY_COST_USD,
            "cost_percent": self.cost_percent_used,
            "cost_remaining": self.cost_remaining,
            "total_tokens": self.total_tokens,
            "total_api_calls": self.total_api_calls,
            "session_started": self.session_started_at
        }

    def save_to_file(self, filepath: str) -> None:
        """Save metrics to JSON file"""
        data = {
            "session_started_at": self.session_started_at,
            "summary": self.get_summary(),
            "agents": {
                agent_id: asdict(metrics)
                for agent_id, metrics in self.agents.items()
            }
        }

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def load_from_file(self, filepath: str) -> None:
        """Load metrics from JSON file"""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)

            self.session_started_at = data.get("session_started_at", self.session_started_at)

            for agent_id, agent_data in data.get("agents", {}).items():
                metrics = AgentMetrics(**agent_data)
                self.agents[agent_id] = metrics
        except FileNotFoundError:
            pass  # No existing metrics file

    def get_cost_breakdown_by_module(self) -> Dict[str, float]:
        """Group costs by module (extracted from task_id)"""
        breakdown = {}

        for agent in self.agents.values():
            # Extract module from task_id if possible
            # Assume task_id might contain module name
            module = "unknown"
            # This is simplified - in reality would parse from task data

            if module not in breakdown:
                breakdown[module] = 0.0
            breakdown[module] += agent.cost_usd

        return breakdown

    def get_average_cost_by_complexity(self) -> Dict[str, float]:
        """Calculate average cost by task complexity"""
        # This would require task complexity data from task file
        # Placeholder for now
        return {
            "low": 0.0,
            "medium": 0.0,
            "high": 0.0
        }


def format_metrics_summary(tracker: MetricsTracker) -> str:
    """Format metrics summary as human-readable string"""
    summary = tracker.get_summary()

    lines = [
        "=" * 60,
        "ORCHESTRATOR METRICS SUMMARY",
        "=" * 60,
        f"Tasks: {summary['completed']}/{summary['total_tasks']} completed",
        f"In Progress: {summary['in_progress']}",
        f"Blocked: {summary['blocked']}",
        f"Failed: {summary['failed']}",
        "",
        f"Total Cost: ${summary['total_cost']:.2f} / ${summary['cost_limit']:.2f}",
        f"Budget Used: {summary['cost_percent']:.1f}%",
        f"Remaining: ${summary['cost_remaining']:.2f}",
        "",
        f"Total Tokens: {summary['total_tokens']:,}",
        f"API Calls: {summary['total_api_calls']}",
        "=" * 60,
    ]

    return "\n".join(lines)
