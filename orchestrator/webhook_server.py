#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Webhook Server for Orchestrator

Flask server that provides HTTP API endpoints for controlling the orchestrator
remotely (from n8n, Telegram, etc.)
"""

import os
import sys
import threading
import time
from pathlib import Path
from datetime import datetime

from flask import Flask, request, jsonify
from dotenv import load_dotenv
import yaml

# Import orchestrator
from orchestrator import Orchestrator

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Global orchestrator instance
orchestrator = None
orchestrator_thread = None
orchestrator_lock = threading.Lock()

# Configuration
config = {
    'webhook_secret': os.getenv('WEBHOOK_SECRET', 'changeme'),
    'n8n_notify_url': os.getenv('N8N_NOTIFY_URL', ''),
    'host': os.getenv('HOST', '0.0.0.0'),
    'port': int(os.getenv('PORT', 5000)),
    'debug': os.getenv('DEBUG', 'false').lower() == 'true'
}


def load_config():
    """Load configuration from config.yaml if it exists"""
    config_file = Path(__file__).parent / 'config.yaml'
    if config_file.exists():
        with open(config_file, 'r') as f:
            yaml_config = yaml.safe_load(f)
            if yaml_config:
                # Merge with default config
                config.update(yaml_config.get('server', {}))
                config.update(yaml_config.get('webhooks', {}))


def verify_secret(request_data):
    """Verify webhook secret"""
    secret = request_data.get('secret', '')
    if secret != config['webhook_secret']:
        return False
    return True


def notify_n8n(message, message_type='info'):
    """Send notification to n8n webhook"""
    if not config['n8n_notify_url']:
        return

    import requests
    try:
        payload = {
            'message': message,
            'type': message_type,
            'timestamp': datetime.now().isoformat()
        }
        requests.post(config['n8n_notify_url'], json=payload, timeout=5)
    except Exception as e:
        print(f"Failed to notify n8n: {e}")


def run_orchestrator_async(task_file, auto_approve=False):
    """Run orchestrator in background thread"""
    global orchestrator

    try:
        with orchestrator_lock:
            if orchestrator and orchestrator.status == 'running':
                notify_n8n("Orchestrator is already running", "warning")
                return

            orchestrator = Orchestrator()
            orchestrator.load_tasks(task_file)

        notify_n8n(f"Starting orchestrator with {len(orchestrator.tasks)} tasks", "info")

        # Run orchestrator
        orchestrator.run(auto_approve=auto_approve)

        notify_n8n(f"Orchestrator completed all tasks", "success")

    except Exception as e:
        notify_n8n(f"Orchestrator error: {str(e)}", "error")
        print(f"Orchestrator error: {e}")


@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Orchestrator Webhook Server',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': [
            'POST /webhook/command',
            'POST /webhook/status',
            'POST /webhook/approve',
            'POST /webhook/pause',
            'POST /webhook/resume',
            'POST /webhook/skip',
            'POST /webhook/logs',
            'GET /health'
        ]
    })


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/webhook/command', methods=['POST'])
def handle_command():
    """
    Handle commands from Telegram/n8n

    Expected payload:
    {
        "command": "start" | "status" | "approve" | "pause" | "resume" | "skip" | "answer",
        "secret": "webhook_secret",
        "params": {
            "task_file": "path/to/tasks.md",  # for start command
            "auto_approve": true/false,        # for start command
            "response": "user's answer"        # for answer command
        }
    }
    """
    try:
        data = request.get_json()

        # Verify secret
        if not verify_secret(data):
            return jsonify({'error': 'Invalid secret'}), 401

        command = data.get('command', '').lower()
        params = data.get('params', {})

        # Route to appropriate handler
        if command == 'start':
            return handle_start(params)
        elif command == 'status':
            return handle_status()
        elif command == 'approve':
            return handle_approve()
        elif command == 'pause':
            return handle_pause()
        elif command == 'resume':
            return handle_resume(params)
        elif command == 'skip':
            return handle_skip()
        elif command == 'answer':
            return handle_answer(params)
        else:
            return jsonify({'error': f'Unknown command: {command}'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def handle_start(params):
    """Start orchestrator with task file"""
    global orchestrator_thread

    task_file = params.get('task_file')
    auto_approve = params.get('auto_approve', True)

    if not task_file:
        return jsonify({'error': 'task_file parameter required'}), 400

    # Check if already running
    with orchestrator_lock:
        if orchestrator and orchestrator.status == 'running':
            return jsonify({
                'status': 'error',
                'message': 'Orchestrator is already running'
            }), 400

    # Start in background thread
    orchestrator_thread = threading.Thread(
        target=run_orchestrator_async,
        args=(task_file, auto_approve),
        daemon=True
    )
    orchestrator_thread.start()

    return jsonify({
        'status': 'ok',
        'message': 'Orchestrator started',
        'task_file': task_file,
        'auto_approve': auto_approve
    })


def handle_status():
    """Get orchestrator status"""
    with orchestrator_lock:
        if not orchestrator:
            return jsonify({
                'status': 'idle',
                'message': 'No active session'
            })

        status = orchestrator.get_status()
        return jsonify(status)


def handle_approve():
    """Approve current task and continue"""
    # Note: This is simplified for auto-approve mode
    # In manual mode, would need more sophisticated inter-thread communication
    return jsonify({
        'status': 'ok',
        'message': 'Task approved (auto-approve mode)'
    })


def handle_pause():
    """Pause orchestrator"""
    with orchestrator_lock:
        if not orchestrator:
            return jsonify({'error': 'No active session'}), 400

        orchestrator.status = 'paused'
        orchestrator.save_state()

    return jsonify({
        'status': 'ok',
        'message': 'Orchestrator paused'
    })


def handle_resume(params):
    """Resume orchestrator from saved state"""
    global orchestrator_thread

    auto_approve = params.get('auto_approve', True)

    # Check if already running
    with orchestrator_lock:
        if orchestrator and orchestrator.status == 'running':
            return jsonify({
                'status': 'error',
                'message': 'Orchestrator is already running'
            }), 400

    def resume_async():
        global orchestrator
        try:
            with orchestrator_lock:
                orchestrator = Orchestrator()
                if not orchestrator.load_state():
                    notify_n8n("No state to resume from", "error")
                    return

            notify_n8n("Resuming orchestrator", "info")
            orchestrator.run(auto_approve=auto_approve)
            notify_n8n("Orchestrator completed", "success")

        except Exception as e:
            notify_n8n(f"Resume error: {str(e)}", "error")

    # Start in background thread
    orchestrator_thread = threading.Thread(target=resume_async, daemon=True)
    orchestrator_thread.start()

    return jsonify({
        'status': 'ok',
        'message': 'Orchestrator resumed'
    })


def handle_skip():
    """Skip current task"""
    with orchestrator_lock:
        if not orchestrator:
            return jsonify({'error': 'No active session'}), 400

        current_task = orchestrator.get_current_task()
        if current_task:
            current_task.status = 'skipped'
            orchestrator.next_task()
            orchestrator.save_state()

    return jsonify({
        'status': 'ok',
        'message': 'Task skipped'
    })


def handle_answer(params):
    """Answer a pending question"""
    response = params.get('response')

    if not response:
        return jsonify({'error': 'response parameter required'}), 400

    # Write response to file for orchestrator to read
    response_file = Path(__file__).parent / 'response.json'
    try:
        with open(response_file, 'w') as f:
            json.dump({'response': response}, f)

        return jsonify({
            'status': 'ok',
            'message': f'Response recorded: {response}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/webhook/status', methods=['POST'])
def webhook_status():
    """Dedicated status endpoint"""
    try:
        data = request.get_json()

        # Verify secret
        if not verify_secret(data):
            return jsonify({'error': 'Invalid secret'}), 401

        return handle_status()

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/webhook/logs', methods=['POST'])
def webhook_logs():
    """Get recent logs"""
    try:
        data = request.get_json()

        # Verify secret
        if not verify_secret(data):
            return jsonify({'error': 'Invalid secret'}), 401

        lines = data.get('lines', 20)

        # Get most recent log file
        logs_dir = Path(__file__).parent / 'orchestrator_logs'
        if not logs_dir.exists():
            return jsonify({'logs': 'No logs yet'})

        log_files = sorted(logs_dir.glob('task-*.log'), key=lambda p: p.stat().st_mtime, reverse=True)

        if not log_files:
            return jsonify({'logs': 'No task logs yet'})

        # Read last N lines from most recent log
        with open(log_files[0], 'r') as f:
            all_lines = f.readlines()
            recent_lines = all_lines[-lines:]
            logs = ''.join(recent_lines)

        return jsonify({
            'logs': logs,
            'file': str(log_files[0].name),
            'total_log_files': len(log_files)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    """404 handler"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """500 handler"""
    return jsonify({'error': 'Internal server error'}), 500


def main():
    """Start the webhook server"""
    print("=" * 60)
    print("🌐 Orchestrator Webhook Server")
    print("=" * 60)

    # Load config
    load_config()

    print(f"\nServer configuration:")
    print(f"  Host: {config['host']}")
    print(f"  Port: {config['port']}")
    print(f"  Debug: {config['debug']}")
    print(f"  Webhook secret: {'***' if config['webhook_secret'] != 'changeme' else 'changeme (INSECURE!)'}")
    print(f"  n8n notify URL: {config['n8n_notify_url'] or 'Not configured'}")

    if config['webhook_secret'] == 'changeme':
        print("\n⚠️  WARNING: Using default webhook secret!")
        print("   Set WEBHOOK_SECRET environment variable for production")

    print(f"\n🚀 Starting server on http://{config['host']}:{config['port']}")
    print("\nEndpoints:")
    print("  GET  /              - Server info")
    print("  GET  /health        - Health check")
    print("  POST /webhook/command - Execute commands")
    print("  POST /webhook/status  - Get status")
    print("  POST /webhook/logs    - Get logs")
    print("\nPress Ctrl+C to stop")
    print("=" * 60)

    # Start Flask server
    app.run(
        host=config['host'],
        port=config['port'],
        debug=config['debug']
    )


if __name__ == '__main__':
    main()
