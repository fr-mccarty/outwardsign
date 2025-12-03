-- Create parishioner_calendar_event_visibility table
CREATE TABLE IF NOT EXISTS public.parishioner_calendar_event_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  event_source TEXT NOT NULL CHECK (event_source IN ('parish', 'liturgical', 'mass_assignment')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  visible_to_person_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, event_source)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_parishioner_calendar_event_visibility_event_id ON public.parishioner_calendar_event_visibility(event_id);
CREATE INDEX IF NOT EXISTS idx_parishioner_calendar_event_visibility_parish_id ON public.parishioner_calendar_event_visibility(parish_id);
CREATE INDEX IF NOT EXISTS idx_parishioner_calendar_event_visibility_event_source ON public.parishioner_calendar_event_visibility(event_source);
CREATE INDEX IF NOT EXISTS idx_parishioner_calendar_event_visibility_is_public ON public.parishioner_calendar_event_visibility(is_public);
CREATE INDEX IF NOT EXISTS idx_parishioner_calendar_event_visibility_person_ids ON public.parishioner_calendar_event_visibility USING GIN (visible_to_person_ids);

-- Grant permissions
GRANT ALL ON public.parishioner_calendar_event_visibility TO anon;
GRANT ALL ON public.parishioner_calendar_event_visibility TO authenticated;
GRANT ALL ON public.parishioner_calendar_event_visibility TO service_role;

-- Enable Row Level Security
ALTER TABLE public.parishioner_calendar_event_visibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parishioner_calendar_event_visibility
-- Admin/Staff/Ministry-Leader can create/update visibility settings in their parish
CREATE POLICY "Parish members can manage event visibility in their parish"
  ON public.parishioner_calendar_event_visibility
  FOR ALL
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Parishioners can read visibility settings for events they have access to
CREATE POLICY "Parishioners can read event visibility"
  ON public.parishioner_calendar_event_visibility
  FOR SELECT
  TO anon
  USING (
    -- Public events are visible to all parishioners
    is_public = true
    OR
    -- Private events visible only to people in visible_to_person_ids
    (
      is_public = false
      AND
      EXISTS (
        SELECT 1 FROM public.people
        WHERE id = ANY(visible_to_person_ids)
        AND email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_parishioner_calendar_event_visibility_updated_at
  BEFORE UPDATE ON public.parishioner_calendar_event_visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
