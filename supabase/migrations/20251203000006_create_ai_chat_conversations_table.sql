-- Create ai_chat_conversations table
CREATE TABLE IF NOT EXISTS public.ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.parishioner_auth_sessions(id) ON DELETE CASCADE,
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_person_id ON public.ai_chat_conversations(person_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_parish_id ON public.ai_chat_conversations(parish_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_session_id ON public.ai_chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_created_at ON public.ai_chat_conversations(created_at DESC);

-- Grant permissions (service role only - no direct client access)
GRANT ALL ON public.ai_chat_conversations TO service_role;

-- Enable Row Level Security
ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;

-- No RLS policies for ai_chat_conversations - service role only
-- This table is managed exclusively via server actions for security and privacy

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_ai_chat_conversations_updated_at
  BEFORE UPDATE ON public.ai_chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment documenting the conversation_history structure
COMMENT ON COLUMN public.ai_chat_conversations.conversation_history IS 'JSONB array of message objects with structure: [{ "role": "user"|"assistant"|"system", "content": "message text", "timestamp": "ISO timestamp", "function_call": {...} (optional) }]';
