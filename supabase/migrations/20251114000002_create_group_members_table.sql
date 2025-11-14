-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, person_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_person_id ON public.group_members(person_id);

-- Enable Row Level Security
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_members
-- Staff can view group members in their parish
CREATE POLICY "Staff can view group members in their parish"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id
      FROM public.groups
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Staff can add group members in their parish
CREATE POLICY "Staff can add group members in their parish"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id
      FROM public.groups
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Staff can update group members in their parish
CREATE POLICY "Staff can update group members in their parish"
  ON public.group_members
  FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT id
      FROM public.groups
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id
      FROM public.groups
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Staff can remove group members in their parish
CREATE POLICY "Staff can delete group members in their parish"
  ON public.group_members
  FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id
      FROM public.groups
      WHERE parish_id IN (
        SELECT parish_id
        FROM public.parish_users
        WHERE user_id = auth.uid()
      )
    )
  );
