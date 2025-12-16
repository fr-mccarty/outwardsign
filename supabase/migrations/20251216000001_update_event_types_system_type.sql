-- Rename category column to system_type and update values
-- This is part of the Unified Event Data Model feature

-- Rename category column to system_type
ALTER TABLE event_types RENAME COLUMN category TO system_type;

-- Drop old CHECK constraint
ALTER TABLE event_types DROP CONSTRAINT IF EXISTS event_types_category_check;

-- Add new CHECK constraint with updated values
ALTER TABLE event_types
ADD CONSTRAINT event_types_system_type_check
CHECK (system_type IN ('mass', 'special-liturgy', 'sacrament', 'event'));

-- Update existing data: 'special_liturgy' → 'special-liturgy'
UPDATE event_types
SET system_type = 'special-liturgy'
WHERE system_type = 'special_liturgy';

-- Update index
DROP INDEX IF EXISTS idx_event_types_category;
CREATE INDEX idx_event_types_system_type
ON event_types(parish_id, system_type)
WHERE deleted_at IS NULL;

-- Update comment
COMMENT ON COLUMN event_types.system_type IS 'System type for UI organization (mass, special-liturgy, sacrament, event)';
