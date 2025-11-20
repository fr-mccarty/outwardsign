#!/bin/bash
# Test webhook server endpoints

BASE_URL="http://localhost:5000"
SECRET="changeme"  # Default secret for testing

echo "🧪 Testing Orchestrator Webhook Server"
echo "======================================"
echo ""

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
curl -s $BASE_URL/health | jq '.'
echo ""
echo ""

# Test 2: Root endpoint
echo "2️⃣ Testing root endpoint..."
curl -s $BASE_URL/ | jq '.'
echo ""
echo ""

# Test 3: Status (no active session)
echo "3️⃣ Testing status endpoint (no session)..."
curl -s -X POST $BASE_URL/webhook/status \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$SECRET\"}" | jq '.'
echo ""
echo ""

# Test 4: Start orchestrator with example tasks
echo "4️⃣ Starting orchestrator with example tasks..."
curl -s -X POST $BASE_URL/webhook/command \
  -H "Content-Type: application/json" \
  -d "{
    \"command\": \"start\",
    \"secret\": \"$SECRET\",
    \"params\": {
      \"task_file\": \"examples/example-tasks.md\",
      \"auto_approve\": true
    }
  }" | jq '.'
echo ""
echo ""

# Wait a bit for execution
echo "⏳ Waiting 5 seconds for tasks to start..."
sleep 5
echo ""

# Test 5: Check status
echo "5️⃣ Checking status..."
curl -s -X POST $BASE_URL/webhook/status \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$SECRET\"}" | jq '.'
echo ""
echo ""

# Wait for completion
echo "⏳ Waiting 30 seconds for tasks to complete..."
sleep 30
echo ""

# Test 6: Final status
echo "6️⃣ Final status check..."
curl -s -X POST $BASE_URL/webhook/status \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$SECRET\"}" | jq '.'
echo ""
echo ""

# Test 7: Get logs
echo "7️⃣ Getting recent logs..."
curl -s -X POST $BASE_URL/webhook/logs \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$SECRET\", \"lines\": 10}" | jq '.file'
echo ""
echo ""

# Test 8: Invalid secret
echo "8️⃣ Testing invalid secret (should fail)..."
curl -s -X POST $BASE_URL/webhook/status \
  -H "Content-Type: application/json" \
  -d '{"secret": "wrong"}' | jq '.'
echo ""
echo ""

echo "✅ Tests complete!"
echo ""
echo "Check the webhook server terminal for detailed output."
