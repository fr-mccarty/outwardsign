#!/bin/bash

# Test Liturgy System
# Runs comprehensive tests of the centralized content and style system

echo "🧪 Running Liturgy System Tests..."
echo ""

# Run the test file using tsx (TypeScript execution)
npx tsx src/lib/__tests__/liturgy-system.test.ts

# Capture exit code
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Test completed successfully!"
else
  echo "❌ Test failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
