-- =====================================================
-- Mass Times Table
-- =====================================================
-- Purpose: Define recurring mass schedules for different types of days/periods
-- Internal scheduling only - does not auto-create individual mass records
-- Supports weekend, daily, holiday, and special period schedules

-- Create mass_times table
CREATE TABLE IF NOT EXISTS mass_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Schedule configuration
  mass_type_id UUID NOT NULL REFERENCES mass_types(id) ON DELETE RESTRICT,

  -- Days and times (JSONB array of objects with day and time)
  -- Format: [{"day": "SUNDAY", "time": "09:00"}, {"day": "SATURDAY", "time": "17:00"}]
  -- Day: SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
  -- Time: 24-hour format (HH:MM)
  schedule_items JSONB NOT NULL,

  -- Mass details
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en', -- Lowercase ISO codes: en, es, la (Latin)
  special_designation TEXT, -- 'Youth Mass', 'Family Mass', 'Traditional Latin Mass', etc.

  -- Scheduling period
  effective_start_date DATE, -- When this schedule begins (null = always active)
  effective_end_date DATE,   -- When this schedule ends (null = no end date)

  -- Status and metadata
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_mass_times_parish_id ON mass_times(parish_id);
CREATE INDEX idx_mass_times_mass_type_id ON mass_times(mass_type_id);
CREATE INDEX idx_mass_times_location_id ON mass_times(location_id);
CREATE INDEX idx_mass_times_active ON mass_times(active);
CREATE INDEX idx_mass_times_effective_dates ON mass_times(effective_start_date, effective_end_date);

-- Enable RLS
ALTER TABLE mass_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view mass times from their parish"
  ON mass_times
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff and above can insert mass times"
  ON mass_times
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY "Staff and above can update mass times"
  ON mass_times
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY "Staff and above can delete mass times"
  ON mass_times
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_mass_times_updated_at
  BEFORE UPDATE ON mass_times
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
