-- Create parishioner_notifications table
CREATE TABLE IF NOT EXISTS public.parishioner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('ministry_message', 'schedule_update', 'reminder', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_parishioner_notifications_person_id ON public.parishioner_notifications(person_id);
CREATE INDEX IF NOT EXISTS idx_parishioner_notifications_parish_id ON public.parishioner_notifications(parish_id);
CREATE INDEX IF NOT EXISTS idx_parishioner_notifications_is_read ON public.parishioner_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_parishioner_notifications_created_at ON public.parishioner_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parishioner_notifications_person_unread ON public.parishioner_notifications(person_id, is_read);

-- Grant permissions
GRANT ALL ON public.parishioner_notifications TO anon;
GRANT ALL ON public.parishioner_notifications TO authenticated;
GRANT ALL ON public.parishioner_notifications TO service_role;

-- Enable Row Level Security
ALTER TABLE public.parishioner_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parishioner_notifications
-- Parishioners can read only their own notifications
CREATE POLICY "Parishioners can read their own notifications"
  ON public.parishioner_notifications
  FOR SELECT
  TO anon
  USING (
    person_id IN (
      SELECT id FROM public.people WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Admin/Staff/Ministry-Leader can create notifications for parishioners in their parish
CREATE POLICY "Parish members can create notifications for parishioners"
  ON public.parishioner_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Parishioners can update is_read and read_at on their own notifications
CREATE POLICY "Parishioners can update their own notifications"
  ON public.parishioner_notifications
  FOR UPDATE
  TO anon
  USING (
    person_id IN (
      SELECT id FROM public.people WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  )
  WITH CHECK (
    person_id IN (
      SELECT id FROM public.people WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- No delete permission for parishioners (preserve audit trail)
-- Admin/Staff can delete notifications in their parish
CREATE POLICY "Parish members can delete notifications in their parish"
  ON public.parishioner_notifications
  FOR DELETE
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );
