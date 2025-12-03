# DATABASE - Critical Rules Only

> **Auto-injected for database tasks. For complete details, see [DATABASE.md](./DATABASE.md)**

## Non-Negotiable Rules

### 1. Migration-Only Changes (REQUIRED)
**NEVER use Supabase MCP or direct database commands during development.**

ALL database changes MUST go through migration files:
```bash
# Create migration
supabase migration new description_of_change

# Local development - reset and apply
npm run db:fresh

# Remote (maintainer only)
supabase db push
```

### 2. Migration File Structure (REQUIRED)
- **One table per migration file**
- Tables use **plural names** (`weddings`, `funerals`, `baptisms`)
- Columns use **singular names** (`person_id`, `event_id`)
- Keep migrations atomic and focused

### 3. Migration Timestamp (REQUIRED)
When creating new migration files, use timestamp within:
- **Current date** to **current date + 30 days**

### 4. Early Development Strategy
**Modify existing migrations** instead of creating new ones:
1. Edit the existing migration file
2. Run `npm run db:fresh` to reset database
3. Confirm with user at end of message

### 5. RLS Policies (REQUIRED)
Every table MUST have:
- Parish-scoped access (`parish_id` check)
- Role-based permissions (Admin, Staff, Ministry-Leader, Parishioner)
- Both `anon` and `authenticated` policies

Example:
```sql
CREATE POLICY "Users can view own parish weddings"
ON weddings FOR SELECT
TO authenticated
USING (parish_id IN (
  SELECT parish_id FROM profiles WHERE id = auth.uid()
));
```

## Common Migration Pattern
```sql
-- Create table
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  person1_id UUID NOT NULL REFERENCES people(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Add policies (see DATABASE.md for complete examples)
-- Add indexes
-- Add triggers for updated_at
```

## Reference
- Complete procedures: [DATABASE.md](./DATABASE.md)
- RLS patterns: [DATABASE.md](./DATABASE.md#row-level-security)
- Troubleshooting: [DATABASE.md](./DATABASE.md#troubleshooting)
