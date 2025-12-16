-- Add status column to master_events
-- This is part of the Unified Event Data Model feature

-- Add status column to master_events
ALTER TABLE master_events
ADD COLUMN status TEXT NOT NULL DEFAULT 'PLANNING';

-- Add CHECK constraint for status
ALTER TABLE master_events
ADD CONSTRAINT master_events_status_check
CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED'));

-- Add index for status filtering
CREATE INDEX idx_master_events_status ON master_events(status) WHERE deleted_at IS NULL;

-- Comment
COMMENT ON COLUMN master_events.status IS 'Event status: PLANNING (not yet scheduled), ACTIVE (scheduled and ongoing), COMPLETED (finished), CANCELLED (will not occur)';
