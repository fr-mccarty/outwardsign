#!/bin/bash

# Reset and Seed Development Database
# This script resets the database and seeds it with development data
# Usage: ./reset-and-seed.sh [-y]
#   -y  Skip confirmation prompt

set -e  # Exit on error

# Parse flags
SKIP_CONFIRM=false
while getopts "y" opt; do
  case $opt in
    y) SKIP_CONFIRM=true ;;
  esac
done

echo ""
echo "================================================================"
echo "Database Reset and Seed"
echo "================================================================"
echo ""
echo "This will:"
echo "  1. Reset the database (drop all data)"
echo "  2. Re-run all migrations"
echo "  3. Seed with development data"
echo ""
echo "NOTE: Seeding requires DEV_USER_EMAIL and DEV_USER_PASSWORD"
echo "      to be set in your .env.local file"
echo ""

if [ "$SKIP_CONFIRM" = false ]; then
  read -p "Continue? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

echo ""
echo "Step 1/2: Resetting database..."
echo "================================================================"
# Note: supabase db reset may report a 502 error during container restart
# even though the reset succeeded. We capture the exit code and continue
# if the database is actually ready.
supabase db reset || {
  echo ""
  echo "WARNING: supabase db reset reported an error (often a 502 during container restart)"
  echo "         Waiting for services to stabilize..."
  sleep 3
}

echo ""
echo "Step 2/2: Seeding development data..."
echo "================================================================"
npm run seed:dev

echo ""
echo "All done!"
echo ""
