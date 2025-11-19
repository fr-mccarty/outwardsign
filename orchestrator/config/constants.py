"""
Orchestrator System Constants

This file contains all system-wide configuration values and constants
for the orchestrator system.
"""

# Cost Management
MAX_DAILY_COST_USD = 50.00  # Maximum spend per day
COST_WARNING_THRESHOLD = 0.75  # Warn at 75% of daily limit
CLAUDE_API_INPUT_COST_PER_1M = 3.00  # Cost per 1M input tokens (Sonnet 4.5)
CLAUDE_API_OUTPUT_COST_PER_1M = 15.00  # Cost per 1M output tokens (Sonnet 4.5)

# Polling & Timing
STATUS_POLL_INTERVAL_SECONDS = 60  # Check agent status every 60 seconds
QUESTION_POLL_INTERVAL_SECONDS = 60  # Check for agent questions every 60 seconds
AGENT_HEARTBEAT_TIMEOUT_SECONDS = 900  # 15 minutes without update = potential hang

# Agent Configuration
MAX_CONCURRENT_AGENTS = 3  # Maximum number of agents running simultaneously
AGENT_WORKSPACE_BASE = "agent_workspaces"
AGENT_STATUS_DIR = "agent_status"
AGENT_LOGS_DIR = "agent_logs"
AGENT_QUESTIONS_DIR = "agent_questions"

# File Paths
TASKS_DIR = "tasks"
RESULTS_DIR = "results"
FEEDBACK_DIR = "feedback"
LEARNING_DIR = "learning"
CONFIG_DIR = "config"

# Communication
TELEGRAM_ENABLED = False  # Set to True when Telegram bot token is configured
TELEGRAM_BOT_TOKEN = ""  # Set via environment variable TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID = ""  # Set via environment variable TELEGRAM_CHAT_ID

# Task Execution
DEFAULT_TASK_TIMEOUT_HOURS = 4  # Maximum time for a single task
TASK_COMPLEXITY_ESTIMATES = {
    "low": 1.0,  # hours
    "medium": 2.5,  # hours
    "high": 4.0,  # hours
}

# Quality Standards
REQUIRE_TESTS_FOR_CODE = True  # All code changes should include tests
REQUIRE_LINT_CLEAN = True  # All code must pass linting
REQUIRE_DOCS_FOR_NEW_MODULES = True  # New modules must have documentation

# Reporting
REPORT_INCLUDE_TOKEN_DETAILS = True
REPORT_INCLUDE_FILE_DIFFS = False  # Set to True to include file diffs in reports
REPORT_INCLUDE_AGENT_LOGS = True

# Learning & Improvement
ENABLE_PATTERN_LEARNING = True  # Track successful patterns
MINIMUM_RATING_FOR_PATTERN = 4  # Only learn from tasks rated 4+ out of 5
PATTERN_CONFIDENCE_THRESHOLD = 3  # Pattern needs 3+ successes to be trusted

# Safety
DISALLOW_GIT_OPERATIONS = True  # Agents cannot stage, commit, or push
DISALLOW_DATABASE_EXECUTION = True  # Agents cannot execute migrations
DISALLOW_FILE_DELETION = False  # Agents can delete files (set to True to prevent)
ALLOWED_FILE_EXTENSIONS = [
    ".ts", ".tsx", ".js", ".jsx", ".py", ".md", ".json", ".yaml", ".yml",
    ".css", ".sql", ".txt", ".html", ".xml", ".sh"
]

# Claude Code CLI
CLAUDE_CODE_BINARY = "claude"  # Assumes claude is in PATH (not alias)
CLAUDE_CODE_TIMEOUT_SECONDS = 14400  # 4 hours max per agent session
