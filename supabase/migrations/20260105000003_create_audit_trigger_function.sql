-- Create generic audit trigger function that works with any table
-- This function captures INSERT, UPDATE, DELETE operations and logs them to audit_logs

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_source TEXT;
  v_conversation_id UUID;
  v_request_id TEXT;
  v_old_record JSONB;
  v_new_record JSONB;
  v_changes JSONB := '{}'::jsonb;
  v_parish_id UUID;
  v_record_id UUID;
  v_key TEXT;
  v_old_value JSONB;
  v_new_value JSONB;
BEGIN
  -- Get audit context
  v_user_id := get_audit_user_id();
  v_user_email := get_audit_user_email();
  v_source := get_audit_source();
  v_conversation_id := get_audit_conversation_id();
  v_request_id := get_audit_request_id();

  -- Build record JSON and extract parish_id/record_id
  IF TG_OP = 'DELETE' THEN
    v_old_record := to_jsonb(OLD);
    v_new_record := NULL;

    -- Extract parish_id (handle tables that may not have it)
    IF v_old_record ? 'parish_id' THEN
      v_parish_id := (v_old_record->>'parish_id')::uuid;
    END IF;

    -- Extract record_id
    IF v_old_record ? 'id' THEN
      v_record_id := (v_old_record->>'id')::uuid;
    END IF;

    -- For DELETE, the whole record is the "change"
    v_changes := v_old_record;

  ELSIF TG_OP = 'INSERT' THEN
    v_old_record := NULL;
    v_new_record := to_jsonb(NEW);

    -- Extract parish_id
    IF v_new_record ? 'parish_id' THEN
      v_parish_id := (v_new_record->>'parish_id')::uuid;
    END IF;

    -- Extract record_id
    IF v_new_record ? 'id' THEN
      v_record_id := (v_new_record->>'id')::uuid;
    END IF;

    -- For INSERT, all fields are "changes"
    v_changes := v_new_record;

  ELSE -- UPDATE
    v_old_record := to_jsonb(OLD);
    v_new_record := to_jsonb(NEW);

    -- Extract parish_id
    IF v_new_record ? 'parish_id' THEN
      v_parish_id := (v_new_record->>'parish_id')::uuid;
    END IF;

    -- Extract record_id
    IF v_new_record ? 'id' THEN
      v_record_id := (v_new_record->>'id')::uuid;
    END IF;

    -- Calculate field-level changes (exclude system fields that always change)
    FOR v_key IN SELECT jsonb_object_keys(v_new_record)
    LOOP
      -- Skip system timestamp fields (they always change on update)
      IF v_key IN ('updated_at') THEN
        CONTINUE;
      END IF;

      v_old_value := v_old_record->v_key;
      v_new_value := v_new_record->v_key;

      -- Compare values (handle NULL properly with IS DISTINCT FROM)
      IF v_old_value IS DISTINCT FROM v_new_value THEN
        v_changes := v_changes || jsonb_build_object(
          v_key,
          jsonb_build_object('old', v_old_value, 'new', v_new_value)
        );
      END IF;
    END LOOP;

    -- Skip UPDATE if no actual changes (just updated_at changed)
    IF v_changes = '{}'::jsonb THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Skip if parish_id is not set (system tables without parish scope)
  IF v_parish_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Skip if record_id is not set (shouldn't happen but be safe)
  IF v_record_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Insert audit log entry
  INSERT INTO audit_logs (
    parish_id,
    table_name,
    record_id,
    operation,
    changes,
    old_record,
    new_record,
    user_id,
    user_email,
    source,
    conversation_id,
    request_id
  ) VALUES (
    v_parish_id,
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    v_changes,
    v_old_record,
    v_new_record,
    v_user_id,
    v_user_email,
    v_source,
    v_conversation_id,
    v_request_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Grant execute (though it's only called by triggers)
GRANT EXECUTE ON FUNCTION audit_trigger_func TO authenticated;
GRANT EXECUTE ON FUNCTION audit_trigger_func TO service_role;

-- Comment
COMMENT ON FUNCTION audit_trigger_func IS 'Generic audit trigger function. Attach to any table to log INSERT/UPDATE/DELETE operations to audit_logs.';


-- Create rollback function for restoring previous state
CREATE OR REPLACE FUNCTION rollback_to_audit_log(
  p_audit_log_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit audit_logs%ROWTYPE;
  v_result JSONB;
  v_restore_values JSONB;
  v_update_sql TEXT;
  v_key TEXT;
  v_value JSONB;
  v_set_clauses TEXT[];
BEGIN
  -- Get the audit log entry
  SELECT * INTO v_audit
  FROM audit_logs
  WHERE id = p_audit_log_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Audit log entry not found: %', p_audit_log_id;
  END IF;

  -- Check user has admin access to this parish
  IF NOT EXISTS (
    SELECT 1 FROM parish_users
    WHERE user_id = auth.uid()
    AND parish_id = v_audit.parish_id
    AND 'admin' = ANY(roles)
    AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Only admins can perform rollbacks';
  END IF;

  -- Determine what to restore based on operation type
  CASE v_audit.operation
    WHEN 'INSERT' THEN
      -- Rollback INSERT = DELETE the record
      EXECUTE format(
        'DELETE FROM %I WHERE id = $1 AND parish_id = $2',
        v_audit.table_name
      ) USING v_audit.record_id, v_audit.parish_id;

      v_result := jsonb_build_object(
        'action', 'deleted',
        'table', v_audit.table_name,
        'record_id', v_audit.record_id
      );

    WHEN 'UPDATE' THEN
      -- Rollback UPDATE = restore old values
      -- Build dynamic UPDATE statement from old_record
      v_restore_values := v_audit.old_record;

      -- Build SET clauses for each field (exclude id, parish_id, created_at)
      FOR v_key, v_value IN SELECT * FROM jsonb_each(v_restore_values)
      LOOP
        IF v_key NOT IN ('id', 'parish_id', 'created_at') THEN
          v_set_clauses := array_append(
            v_set_clauses,
            format('%I = %L::jsonb->>%L', v_key, v_restore_values::text, v_key)
          );
        END IF;
      END LOOP;

      IF array_length(v_set_clauses, 1) > 0 THEN
        v_update_sql := format(
          'UPDATE %I SET %s WHERE id = $1 AND parish_id = $2',
          v_audit.table_name,
          array_to_string(v_set_clauses, ', ')
        );

        EXECUTE v_update_sql USING v_audit.record_id, v_audit.parish_id;
      END IF;

      v_result := jsonb_build_object(
        'action', 'restored',
        'table', v_audit.table_name,
        'record_id', v_audit.record_id,
        'restored_values', v_restore_values
      );

    WHEN 'DELETE' THEN
      -- Rollback DELETE = re-insert the old record
      EXECUTE format(
        'INSERT INTO %I SELECT * FROM jsonb_populate_record(null::%I, $1)',
        v_audit.table_name,
        v_audit.table_name
      ) USING v_audit.old_record;

      v_result := jsonb_build_object(
        'action', 'restored',
        'table', v_audit.table_name,
        'record_id', v_audit.record_id,
        'restored_record', v_audit.old_record
      );

    ELSE
      RAISE EXCEPTION 'Unknown operation type: %', v_audit.operation;
  END CASE;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION rollback_to_audit_log TO authenticated;

-- Comment
COMMENT ON FUNCTION rollback_to_audit_log IS 'Rollback a record to the state before the specified audit log entry. Admin only.';
