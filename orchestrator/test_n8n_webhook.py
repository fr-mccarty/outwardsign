#!/usr/bin/env python3
"""
Simple test script to verify n8n webhook connection

USAGE:
    1. Make sure N8N_NOTIFY_URL is set in your .env file:

       N8N_NOTIFY_URL=https://your-n8n.com/webhook/orchestrator-notify

    2. Activate virtual environment:

       source venv/bin/activate

    3. Run this script:

       python3 test_n8n_webhook.py

    4. Check your n8n workflow to see if the test message arrived

WHAT IT DOES:
    - Reads N8N_NOTIFY_URL from .env file
    - Sends a test JSON payload to that webhook
    - Shows the response from n8n
    - Confirms the connection is working

EXAMPLE OUTPUT (Success):
    🔗 Testing webhook URL: https://your-n8n.com/webhook/orchestrator-notify
    📤 Sending test payload: {...}
    📥 Response Status: 200
    ✅ SUCCESS! Webhook is working

TROUBLESHOOTING:
    - If you get "N8N_NOTIFY_URL not set": Add it to .env file
    - If you get "Connection Error": Check n8n is running and URL is correct
    - If you get "Timeout": n8n might be slow or unreachable
    - If you get status code other than 200: Check n8n workflow configuration
"""

import os
import json
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

def test_n8n_webhook():
    """Test sending a message to n8n webhook"""

    # Get webhook URL from environment
    webhook_url = os.getenv('N8N_NOTIFY_URL')

    if not webhook_url:
        print("❌ ERROR: N8N_NOTIFY_URL not set in .env file")
        print("\nPlease add to .env:")
        print("N8N_NOTIFY_URL=https://your-n8n.com/webhook/orchestrator-notify")
        return False

    print(f"🔗 Testing webhook URL: {webhook_url}")
    print()

    # Create test payload
    payload = {
        'message': 'Test notification from orchestrator',
        'type': 'info',
        'timestamp': datetime.now().isoformat(),
        'session_id': 'test-session',
        'data': {
            'test': True,
            'source': 'test_n8n_webhook.py'
        }
    }

    print("📤 Sending test payload:")
    print(json.dumps(payload, indent=2))
    print()

    try:
        # Send POST request
        response = requests.post(
            webhook_url,
            json=payload,
            timeout=10
        )

        # Check response
        print(f"📥 Response Status: {response.status_code}")

        if response.status_code == 200:
            print("✅ SUCCESS! Webhook is working")
            print()
            print("Response body:")
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text)
            return True
        else:
            print(f"⚠️  WARNING: Received status code {response.status_code}")
            print("Response:")
            print(response.text)
            return False

    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out after 10 seconds")
        print("Check that your n8n instance is accessible")
        return False

    except requests.exceptions.ConnectionError as e:
        print("❌ ERROR: Could not connect to webhook URL")
        print(f"Details: {str(e)}")
        print()
        print("Possible causes:")
        print("- n8n instance is not running")
        print("- Webhook URL is incorrect")
        print("- Network/firewall blocking the connection")
        return False

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 n8n Webhook Test")
    print("=" * 60)
    print()

    success = test_n8n_webhook()

    print()
    print("=" * 60)

    if success:
        print("✅ Test PASSED - Webhook is working correctly!")
        print()
        print("Next steps:")
        print("1. Check your n8n workflow to see the test message")
        print("2. Run: python3 orchestrator.py --task-file examples/example-tasks.md --auto-approve")
        print("3. You should see real-time notifications in n8n")
    else:
        print("❌ Test FAILED - Please fix the issues above")
        print()
        print("Troubleshooting:")
        print("1. Verify N8N_NOTIFY_URL is correct in .env")
        print("2. Check that n8n workflow is active")
        print("3. Test webhook URL in browser or Postman")

    print("=" * 60)
