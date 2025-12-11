-- Update input_field_definitions table to support content picker
-- Add filter_tags column and 'content' type to support content library integration

-- Add filter_tags column to input_field_definitions table
ALTER TABLE input_field_definitions
ADD COLUMN filter_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update CHECK constraint to include 'content' type
ALTER TABLE input_field_definitions
DROP CONSTRAINT check_input_field_type;

ALTER TABLE input_field_definitions
ADD CONSTRAINT check_input_field_type CHECK (
  type IN (
    'person', 'group', 'location', 'event_link', 'list_item', 'document',
    'text', 'rich_text', 'content', -- 'content' is NEW
    'date', 'time', 'datetime', 'number', 'yes_no'
  )
);
