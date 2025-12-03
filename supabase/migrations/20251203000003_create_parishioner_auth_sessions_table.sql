-- Create parishioner_auth_sessions table
CREATE TABLE IF NOT EXISTS public.parishioner_auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  email_or_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  last_accessed_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_parishioner_auth_sessions_token ON public.parishioner_auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_parishioner_auth_sessions_person_id ON public.parishioner_auth_sessions(person_id);
CREATE INDEX IF NOT EXISTS idx_parishioner_auth_sessions_parish_id ON public.parishioner_auth_sessions(parish_id);
CREATE INDEX IF NOT EXISTS idx_parishioner_auth_sessions_expires_at ON public.parishioner_auth_sessions(expires_at);

-- Grant permissions (service role only - no direct client access)
GRANT ALL ON public.parishioner_auth_sessions TO service_role;

-- Enable Row Level Security
ALTER TABLE public.parishioner_auth_sessions ENABLE ROW LEVEL SECURITY;

-- No RLS policies for parishioner_auth_sessions - service role only
-- This table is managed exclusively via server actions for security
