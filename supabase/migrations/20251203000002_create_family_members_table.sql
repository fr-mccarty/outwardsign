-- Create family_members table (junction table)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  relationship TEXT,
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, person_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_person_id ON public.family_members(person_id);

-- Grant permissions
GRANT ALL ON public.family_members TO anon;
GRANT ALL ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;

-- Enable Row Level Security
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
-- Admin and Staff can view family members in their parish
CREATE POLICY "Parish members can view family members in their parish"
  ON public.family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT id
      FROM public.families
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Admin and Staff can add family members in their parish
CREATE POLICY "Parish members can add family members in their parish"
  ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT id
      FROM public.families
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Admin and Staff can update family members in their parish
CREATE POLICY "Parish members can update family members in their parish"
  ON public.family_members
  FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT id
      FROM public.families
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT id
      FROM public.families
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Admin and Staff can delete family members in their parish
CREATE POLICY "Parish members can delete family members in their parish"
  ON public.family_members
  FOR DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT id
      FROM public.families
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Parishioners can read family members for families they belong to
CREATE POLICY "Parishioners can read their family members"
  ON public.family_members
  FOR SELECT
  TO anon
  USING (
    family_id IN (
      SELECT family_id
      FROM public.family_members
      WHERE person_id IN (
        SELECT id FROM public.people WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      )
    )
  );
