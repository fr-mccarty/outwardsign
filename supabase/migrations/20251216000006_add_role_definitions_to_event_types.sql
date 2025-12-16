-- Add role_definitions JSONB column to event_types
-- This is part of the Unified Event Data Model feature

-- Add role_definitions JSONB column to event_types
ALTER TABLE event_types
ADD COLUMN role_definitions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add GIN index for JSONB queries
CREATE INDEX idx_event_types_role_definitions_gin ON event_types USING GIN (role_definitions);

-- Comment
COMMENT ON COLUMN event_types.role_definitions IS 'JSONB array of role definitions for this event type. Example: {"roles": [{"id": "presider", "name": "Presider", "required": true}]}';
