-- Add parishioner portal columns to people table
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS preferred_communication_channel TEXT DEFAULT 'email' CHECK (preferred_communication_channel IN ('email', 'sms')),
  ADD COLUMN IF NOT EXISTS parishioner_portal_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_portal_access TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es'));

-- Add index for portal-enabled people
CREATE INDEX IF NOT EXISTS idx_people_portal_enabled ON public.people(parishioner_portal_enabled) WHERE parishioner_portal_enabled = true;

-- Add index for preferred communication channel
CREATE INDEX IF NOT EXISTS idx_people_preferred_communication_channel ON public.people(preferred_communication_channel);

-- Add comments documenting the new columns
COMMENT ON COLUMN public.people.preferred_communication_channel IS 'How this person prefers to receive reminders and notifications (email or SMS)';
COMMENT ON COLUMN public.people.parishioner_portal_enabled IS 'Whether this person has access to the parishioner portal';
COMMENT ON COLUMN public.people.last_portal_access IS 'Last time this person accessed the parishioner portal (for engagement tracking)';
COMMENT ON COLUMN public.people.preferred_language IS 'Preferred language for portal and communications (en or es)';
