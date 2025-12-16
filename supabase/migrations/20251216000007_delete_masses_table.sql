-- Delete masses table
-- This is part of the Unified Event Data Model feature
-- GREENFIELD: All Mass data will be migrated to master_events + calendar_events

-- GREENFIELD: Delete masses table
-- All Mass data will be migrated to master_events + calendar_events
DROP TABLE IF EXISTS masses CASCADE;

-- Cleanup: Drop any remaining mass-related tables that are no longer needed
-- Note: mass_roles and mass_role_members tables are kept for existing scheduling system
-- These will be integrated with master_event_roles in future enhancement
