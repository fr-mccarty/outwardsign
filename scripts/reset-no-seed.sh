#!/bin/bash

# Reset Database Without Seeding
# This script resets the database without seeding it with development data
# Usage: ./reset-no-seed.sh [-y]
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
echo "🔄 Database Reset (No Seed)"
echo "================================================================"
echo ""
echo "This will:"
echo "  1. Reset the database (drop all data)"
echo "  2. Re-run all migrations"
echo "  3. Skip seeding (no development data)"
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
echo "Resetting database..."
echo "================================================================"
supabase db reset --no-seed

echo ""
echo "✅ Database reset complete!"
echo "   All tables created, no seed data added."
echo ""
