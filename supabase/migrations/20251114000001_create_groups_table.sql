-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_groups_parish_id ON public.groups(parish_id);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON public.groups(is_active);

-- Add updated_at trigger
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.groups TO anon;
GRANT ALL ON public.groups TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
-- Staff can view all groups in their parish
CREATE POLICY "Staff can view groups in their parish"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Staff can create groups in their parish
CREATE POLICY "Staff can create groups in their parish"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Staff can update groups in their parish
CREATE POLICY "Staff can update groups in their parish"
  ON public.groups
  FOR UPDATE
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

-- Staff can delete groups in their parish
CREATE POLICY "Staff can delete groups in their parish"
  ON public.groups
  FOR DELETE
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );
