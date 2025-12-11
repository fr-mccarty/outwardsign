-- Function: get_person_family_data(person_id UUID)
-- Purpose: Retrieve all family members and their related data for AI chat context
CREATE OR REPLACE FUNCTION public.get_person_family_data(p_person_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  person_data JSONB;
  family_ids UUID[];
  family_members_data JSONB;
  mass_assignments_data JSONB;
  blackout_dates_data JSONB;
BEGIN
  -- Get the person's own data
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'email', p.email,
    'phone_number', p.phone_number,
    'parish_id', p.parish_id
  )
  INTO person_data
  FROM public.people p
  WHERE p.id = p_person_id;

  -- Get all family IDs this person belongs to
  SELECT array_agg(DISTINCT fm.family_id)
  INTO family_ids
  FROM public.family_members fm
  WHERE fm.person_id = p_person_id;

  -- If person doesn't belong to any family, use empty array
  IF family_ids IS NULL THEN
    family_ids := ARRAY[]::UUID[];
  END IF;

  -- Get all family members (all people in the same families)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'relationship', fm.relationship,
      'family_id', fm.family_id,
      'family_name', f.family_name
    )
  )
  INTO family_members_data
  FROM public.family_members fm
  JOIN public.people p ON p.id = fm.person_id
  JOIN public.families f ON f.id = fm.family_id
  WHERE fm.family_id = ANY(family_ids)
    AND fm.person_id != p_person_id;  -- Exclude the person themselves

  -- Get all mass assignments for person + family members
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', ma.id,
      'person_id', ma.person_id,
      'person_name', p.full_name,
      'mass_id', ma.mass_id,
      'role', ma.role,
      'date', m.date,
      'time', m.time,
      'name', m.name
    )
  )
  INTO mass_assignments_data
  FROM public.mass_assignments ma
  JOIN public.people p ON p.id = ma.person_id
  LEFT JOIN public.masses m ON m.id = ma.mass_id
  WHERE ma.person_id = p_person_id
     OR ma.person_id IN (
       SELECT fm.person_id
       FROM public.family_members fm
       WHERE fm.family_id = ANY(family_ids)
     );

  -- Get all blackout dates for person + family members
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', pbd.id,
      'person_id', pbd.person_id,
      'person_name', p.full_name,
      'start_date', pbd.start_date,
      'end_date', pbd.end_date,
      'reason', pbd.reason
    )
  )
  INTO blackout_dates_data
  FROM public.person_blackout_dates pbd
  JOIN public.people p ON p.id = pbd.person_id
  WHERE pbd.person_id = p_person_id
     OR pbd.person_id IN (
       SELECT fm.person_id
       FROM public.family_members fm
       WHERE fm.family_id = ANY(family_ids)
     );

  -- Build final result
  result := jsonb_build_object(
    'person', person_data,
    'family_members', COALESCE(family_members_data, '[]'::jsonb),
    'mass_assignments', COALESCE(mass_assignments_data, '[]'::jsonb),
    'blackout_dates', COALESCE(blackout_dates_data, '[]'::jsonb)
  );

  RETURN result;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.get_person_family_data(UUID) TO service_role;

-- Function: cleanup_expired_auth_sessions()
-- Purpose: Automatically remove expired parishioner auth sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_auth_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired or revoked sessions
  DELETE FROM public.parishioner_auth_sessions
  WHERE expires_at < NOW()
     OR is_revoked = true;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.cleanup_expired_auth_sessions() TO service_role;

-- Add comments documenting the functions
COMMENT ON FUNCTION public.get_person_family_data(UUID) IS 'Retrieve all family members and their related data (mass assignments, blackout dates) for AI chat context';
COMMENT ON FUNCTION public.cleanup_expired_auth_sessions() IS 'Remove expired or revoked parishioner auth sessions. Should be run daily via cron job.';
