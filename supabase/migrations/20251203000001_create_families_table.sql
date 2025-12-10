-- Create families table
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  family_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_families_parish_id ON public.families(parish_id);
CREATE INDEX IF NOT EXISTS idx_families_family_name ON public.families(family_name);

-- Grant permissions
GRANT ALL ON public.families TO anon;
GRANT ALL ON public.families TO authenticated;
GRANT ALL ON public.families TO service_role;

-- Enable Row Level Security
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
-- Admin and Staff can view families in their parish
CREATE POLICY "Parish members can view families in their parish"
  ON public.families
  FOR SELECT
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Admin and Staff can create families in their parish
CREATE POLICY "Parish members can create families in their parish"
  ON public.families
  FOR INSERT
  TO authenticated
  WITH CHECK (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Admin and Staff can update families in their parish
CREATE POLICY "Parish members can update families in their parish"
  ON public.families
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

-- Admin and Staff can delete families in their parish
CREATE POLICY "Parish members can delete families in their parish"
  ON public.families
  FOR DELETE
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM public.parish_users
      WHERE user_id = auth.uid()
    )
  );

-- Note: Parishioner policy for families is created in a later migration
-- after family_members table exists (see 20251203000002)

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
