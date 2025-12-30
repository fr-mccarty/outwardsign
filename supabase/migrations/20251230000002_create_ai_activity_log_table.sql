-- Create ai_activity_log table for tracking AI-initiated changes
CREATE TABLE IF NOT EXISTS public.ai_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,

  -- Source portal
  source TEXT NOT NULL CHECK (source IN ('staff_chat', 'parishioner_chat')),

  -- Who initiated (staff user or parishioner person)
  initiated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  initiated_by_person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,

  -- What conversation (for traceability)
  conversation_id UUID,

  -- The action performed
  action TEXT NOT NULL, -- e.g., 'create_person', 'update_person', 'delete_person', 'add_blackout'
  entity_type TEXT NOT NULL, -- e.g., 'person', 'family', 'event', 'blackout_date'
  entity_id UUID, -- The affected record
  entity_name TEXT, -- Human-readable name for context

  -- Details of the change
  details JSONB, -- Store any additional context (e.g., what was changed)

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT ai_activity_log_initiator_check CHECK (
    (initiated_by_user_id IS NOT NULL AND initiated_by_person_id IS NULL) OR
    (initiated_by_user_id IS NULL AND initiated_by_person_id IS NOT NULL)
  )
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_parish_id ON public.ai_activity_log(parish_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_initiated_by_user_id ON public.ai_activity_log(initiated_by_user_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_initiated_by_person_id ON public.ai_activity_log(initiated_by_person_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_created_at ON public.ai_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_action ON public.ai_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_entity_type ON public.ai_activity_log(entity_type);

-- Grant permissions
GRANT ALL ON public.ai_activity_log TO anon;
GRANT ALL ON public.ai_activity_log TO authenticated;
GRANT ALL ON public.ai_activity_log TO service_role;

-- Enable Row Level Security
ALTER TABLE public.ai_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Staff can read activity logs for their parish
CREATE POLICY "Parish members can read ai activity logs"
  ON public.ai_activity_log
  FOR SELECT
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Only service_role can insert (AI chat runs with admin client)
CREATE POLICY "Service role can insert ai activity logs"
  ON public.ai_activity_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admin can delete old logs for cleanup
CREATE POLICY "Admins can delete ai activity logs"
  ON public.ai_activity_log
  FOR DELETE
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
      AND 'admin' = ANY(roles)
    )
  );
