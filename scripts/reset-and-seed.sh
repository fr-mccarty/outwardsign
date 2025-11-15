#!/bin/bash

# Reset and Seed Development Database
# This script resets the database and seeds it with development data

set -e  # Exit on error

echo ""
echo "================================================================"
echo "🔄 Database Reset & Seed"
echo "================================================================"
echo ""
echo "This will:"
echo "  1. Reset the database (drop all data)"
echo "  2. Re-run all migrations"
echo "  3. Seed with development data"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Step 1/2: Resetting database..."
echo "================================================================"
supabase db reset

echo ""
echo "Step 2/2: Seeding development data..."
echo "================================================================"
npm run seed:dev

echo ""
echo "✅ All done!"
echo ""
