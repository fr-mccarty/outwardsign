-- Create a function to create a parish with admin
-- Uses SECURITY DEFINER to bypass RLS policies during parish creation
CREATE OR REPLACE FUNCTION create_parish_with_admin(
  p_user_id UUID,
  p_name TEXT,
  p_city TEXT,
  p_state TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL
)
RETURNS TABLE(parish_id UUID, success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parish_id UUID;
BEGIN
  -- Validate that the caller is authenticated
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'User not authenticated';
    RETURN;
  END IF;

  -- Validate that the caller is creating their own parish
  IF auth.uid() != p_user_id THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Cannot create parish for another user';
    RETURN;
  END IF;

  -- Create the parish
  INSERT INTO parishes (name, city, state, country)
  VALUES (p_name, p_city, p_state, p_country)
  RETURNING id INTO v_parish_id;

  -- Create the parish_users record with admin role
  INSERT INTO parish_users (user_id, parish_id, roles)
  VALUES (p_user_id, v_parish_id, ARRAY['admin']);

  -- Update user settings to select this parish
  UPDATE user_settings
  SET selected_parish_id = v_parish_id
  WHERE user_id = p_user_id;

  -- If no user_settings record exists, insert one
  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id, selected_parish_id)
    VALUES (p_user_id, v_parish_id)
    ON CONFLICT (user_id) DO UPDATE
    SET selected_parish_id = v_parish_id;
  END IF;

  RETURN QUERY SELECT v_parish_id, TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, SQLERRM;
END;
$$;
