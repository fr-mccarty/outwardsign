-- Create functions for setting and getting audit context within a transaction
-- These allow the application to pass user/source information to the audit trigger

-- Function to set audit context for the current transaction
-- Call this at the start of any transaction that modifies data
CREATE OR REPLACE FUNCTION set_audit_context(
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'application',
  p_conversation_id UUID DEFAULT NULL,
  p_request_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set session variables for the current transaction only (true = local)
  PERFORM set_config('audit.user_id', COALESCE(p_user_id::text, ''), true);
  PERFORM set_config('audit.user_email', COALESCE(p_user_email, ''), true);
  PERFORM set_config('audit.source', COALESCE(p_source, 'application'), true);
  PERFORM set_config('audit.conversation_id', COALESCE(p_conversation_id::text, ''), true);
  PERFORM set_config('audit.request_id', COALESCE(p_request_id, ''), true);
END;
$$;

-- Function to get current audit user ID
-- Falls back to auth.uid() if audit context not set
CREATE OR REPLACE FUNCTION get_audit_user_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- First try audit context
  v_user_id := current_setting('audit.user_id', true);
  IF v_user_id IS NOT NULL AND v_user_id != '' THEN
    RETURN v_user_id::uuid;
  END IF;

  -- Fall back to auth.uid() (from JWT)
  RETURN auth.uid();
END;
$$;

-- Function to get current audit user email
CREATE OR REPLACE FUNCTION get_audit_user_email()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_email TEXT;
  v_user_id UUID;
BEGIN
  -- First try audit context
  v_email := current_setting('audit.user_email', true);
  IF v_email IS NOT NULL AND v_email != '' THEN
    RETURN v_email;
  END IF;

  -- Fall back to looking up from auth.users
  v_user_id := get_audit_user_id();
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = v_user_id;
    RETURN v_email;
  END IF;

  RETURN NULL;
END;
$$;

-- Function to get current audit source
CREATE OR REPLACE FUNCTION get_audit_source()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_source TEXT;
BEGIN
  v_source := current_setting('audit.source', true);
  IF v_source IS NOT NULL AND v_source != '' THEN
    RETURN v_source;
  END IF;
  RETURN 'application';
END;
$$;

-- Function to get current conversation ID (for AI chat tracing)
CREATE OR REPLACE FUNCTION get_audit_conversation_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_conversation_id TEXT;
BEGIN
  v_conversation_id := current_setting('audit.conversation_id', true);
  IF v_conversation_id IS NOT NULL AND v_conversation_id != '' THEN
    RETURN v_conversation_id::uuid;
  END IF;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Function to get current request ID (for request correlation)
CREATE OR REPLACE FUNCTION get_audit_request_id()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_request_id TEXT;
BEGIN
  v_request_id := current_setting('audit.request_id', true);
  IF v_request_id IS NOT NULL AND v_request_id != '' THEN
    RETURN v_request_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_audit_context TO authenticated;
GRANT EXECUTE ON FUNCTION set_audit_context TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_user_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_user_id TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_user_email TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_user_email TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_source TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_source TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_conversation_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_conversation_id TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_request_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_request_id TO service_role;

-- Comments
COMMENT ON FUNCTION set_audit_context IS 'Sets audit context (user, source, etc.) for the current transaction. Call before any data modifications.';
COMMENT ON FUNCTION get_audit_user_id IS 'Gets the current audit user ID. Falls back to auth.uid() if context not set.';
COMMENT ON FUNCTION get_audit_user_email IS 'Gets the current audit user email. Falls back to looking up from auth.users.';
COMMENT ON FUNCTION get_audit_source IS 'Gets the current audit source (application, ai_chat, mcp, etc.). Defaults to application.';
