-- Create a function to create a parish with admin
-- Uses SECURITY DEFINER to bypass RLS policies during parish creation
CREATE OR REPLACE FUNCTION create_parish_with_admin(
  p_user_id UUID,
  p_name TEXT,
  p_city TEXT,
  p_state TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL
)
RETURNS TABLE(parish_id UUID, success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parish_id UUID;
  v_slug TEXT;
  v_base_slug TEXT;
  v_counter INT := 0;
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

  -- Generate slug if not provided
  IF p_slug IS NULL OR p_slug = '' THEN
    -- Convert name to lowercase, remove apostrophes, remove special chars, replace spaces with hyphens
    v_base_slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(p_name, '''', '', 'g'),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
    v_slug := v_base_slug;

    -- Ensure uniqueness by appending counter if needed
    WHILE EXISTS (SELECT 1 FROM parishes WHERE slug = v_slug) LOOP
      v_counter := v_counter + 1;
      v_slug := v_base_slug || '-' || v_counter;
    END LOOP;
  ELSE
    v_slug := p_slug;

    -- Check if provided slug already exists
    IF EXISTS (SELECT 1 FROM parishes WHERE slug = v_slug) THEN
      RETURN QUERY SELECT NULL::UUID, FALSE, 'Slug already exists';
      RETURN;
    END IF;
  END IF;

  -- Create the parish
  INSERT INTO parishes (name, slug, city, state, country)
  VALUES (p_name, v_slug, p_city, p_state, p_country)
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
