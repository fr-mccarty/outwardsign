-- Update input_field_definitions to rename 'occasion' → 'calendar_event'
-- This is part of the Unified Event Data Model feature

-- Update CHECK constraint to rename 'occasion' → 'calendar_event'
ALTER TABLE input_field_definitions DROP CONSTRAINT IF EXISTS check_input_field_type;

ALTER TABLE input_field_definitions
ADD CONSTRAINT check_input_field_type
CHECK (type IN (
  'person', 'group', 'location', 'event_link', 'list_item', 'document',
  'text', 'rich_text', 'content', 'petition',
  'calendar_event',  -- RENAMED from 'occasion'
  'date', 'time', 'datetime', 'number', 'yes_no', 'mass-intention', 'spacer'
));

-- Update existing data: 'occasion' → 'calendar_event'
UPDATE input_field_definitions
SET type = 'calendar_event'
WHERE type = 'occasion';

-- Update CHECK constraint for is_primary
ALTER TABLE input_field_definitions DROP CONSTRAINT IF EXISTS check_is_primary_only_for_occasion;

ALTER TABLE input_field_definitions
ADD CONSTRAINT check_is_primary_only_for_calendar_event
CHECK (is_primary = false OR type = 'calendar_event');

-- Update unique index for primary calendar_event
DROP INDEX IF EXISTS idx_input_field_definitions_primary_occasion;

CREATE UNIQUE INDEX idx_input_field_definitions_primary_calendar_event
ON input_field_definitions(event_type_id)
WHERE is_primary = true AND type = 'calendar_event' AND deleted_at IS NULL;
