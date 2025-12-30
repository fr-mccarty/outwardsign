-- Create staff_chat_conversations table for AI chat history
-- This is separate from parishioner chat (ai_chat_conversations)

CREATE TABLE IF NOT EXISTS public.staff_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_staff_chat_conversations_user_id ON public.staff_chat_conversations(user_id);
CREATE INDEX idx_staff_chat_conversations_parish_id ON public.staff_chat_conversations(parish_id);
CREATE INDEX idx_staff_chat_conversations_updated_at ON public.staff_chat_conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE public.staff_chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.staff_chat_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.staff_chat_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.staff_chat_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.staff_chat_conversations TO authenticated;
GRANT ALL ON public.staff_chat_conversations TO service_role;

-- Trigger for updated_at
CREATE TRIGGER update_staff_chat_conversations_updated_at
  BEFORE UPDATE ON public.staff_chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
