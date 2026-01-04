-- Add audit triggers to all parish-scoped tables
-- Using AFTER triggers to ensure the operation succeeds before logging

-- ============================================================================
-- CORE ENTITY TABLES
-- ============================================================================

-- People
CREATE TRIGGER audit_people_trigger
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Families
CREATE TRIGGER audit_families_trigger
  AFTER INSERT OR UPDATE OR DELETE ON families
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Family members
CREATE TRIGGER audit_family_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON family_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Groups
CREATE TRIGGER audit_groups_trigger
  AFTER INSERT OR UPDATE OR DELETE ON groups
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Group members
CREATE TRIGGER audit_group_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON group_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Group roles
CREATE TRIGGER audit_group_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON group_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Person blackout dates
CREATE TRIGGER audit_person_blackout_dates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON person_blackout_dates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- EVENT SYSTEM TABLES
-- ============================================================================

-- Event types
CREATE TRIGGER audit_event_types_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_types
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Master events
CREATE TRIGGER audit_master_events_trigger
  AFTER INSERT OR UPDATE OR DELETE ON master_events
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Calendar events
CREATE TRIGGER audit_calendar_events_trigger
  AFTER INSERT OR UPDATE OR DELETE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Input field definitions
CREATE TRIGGER audit_input_field_definitions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON input_field_definitions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- People event assignments
CREATE TRIGGER audit_people_event_assignments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON people_event_assignments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Event presets
CREATE TRIGGER audit_event_presets_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_presets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- CONTENT & LIBRARY TABLES
-- ============================================================================

-- Contents
CREATE TRIGGER audit_contents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON contents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Scripts
CREATE TRIGGER audit_scripts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON scripts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Sections
CREATE TRIGGER audit_sections_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sections
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Documents
CREATE TRIGGER audit_documents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- CONFIGURATION TABLES
-- ============================================================================

-- Locations
CREATE TRIGGER audit_locations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON locations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Parish settings
CREATE TRIGGER audit_parish_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON parish_settings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Custom lists
CREATE TRIGGER audit_custom_lists_trigger
  AFTER INSERT OR UPDATE OR DELETE ON custom_lists
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Custom list items
CREATE TRIGGER audit_custom_list_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON custom_list_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- TAGS & TEMPLATES
-- ============================================================================

-- Category tags
CREATE TRIGGER audit_category_tags_trigger
  AFTER INSERT OR UPDATE OR DELETE ON category_tags
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Tag assignments
CREATE TRIGGER audit_tag_assignments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tag_assignments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Petition templates
CREATE TRIGGER audit_petition_templates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON petition_templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- MASS-RELATED TABLES
-- ============================================================================

-- Mass times templates
CREATE TRIGGER audit_mass_times_templates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON mass_times_templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Mass times template items
CREATE TRIGGER audit_mass_times_template_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON mass_times_template_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Mass intentions
CREATE TRIGGER audit_mass_intentions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON mass_intentions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- NOTES
-- ============================================================================
-- Tables WITHOUT audit triggers (by design):
-- - parishes: Root table, changes here are rare and managed separately
-- - parish_users: User membership is not audit-logged (use separate access logs if needed)
-- - profiles: Linked to auth.users, managed by Supabase Auth
-- - user_settings: User preferences, not critical for audit
-- - parish_invitations: Invitation lifecycle managed separately
-- - parishioner_auth_sessions: Ephemeral session data
-- - parishioner_notifications: Ephemeral notification data
-- - parishioner_calendar_event_visibility: User preferences
-- - ai_chat_conversations: Chat history managed separately
-- - staff_chat_conversations: Chat history managed separately
-- - ai_activity_log: This IS the audit log for AI actions
-- - audit_logs: Cannot audit the audit table (would cause infinite loop)
-- - liturgical_calendar: Read-only reference data seeded from external source
