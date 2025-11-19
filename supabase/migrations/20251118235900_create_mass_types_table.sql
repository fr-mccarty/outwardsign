-- =====================================================
-- Mass Types Table
-- =====================================================
-- Purpose: Define customizable mass type categories for parishes
-- Allows parishes to create their own mass types beyond default types
-- Supports multilingual labels (English/Spanish)

-- Create mass_types table
CREATE TABLE IF NOT EXISTS mass_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Type identification
  key TEXT NOT NULL, -- 'WEEKEND', 'DAILY', 'HOLIDAY', 'SPECIAL', or custom key

  -- Multilingual labels
  label_en TEXT NOT NULL,
  label_es TEXT NOT NULL,

  -- Optional metadata
  description TEXT,
  color TEXT, -- Hex color for UI display (e.g., '#3b82f6')
  display_order INTEGER DEFAULT 0, -- Sort order in dropdowns

  -- Status
  active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false, -- System types cannot be deleted

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure unique keys per parish
  UNIQUE(parish_id, key)
);

-- Create indexes
CREATE INDEX idx_mass_types_parish_id ON mass_types(parish_id);
CREATE INDEX idx_mass_types_active ON mass_types(active);
CREATE INDEX idx_mass_types_display_order ON mass_types(display_order);

-- Enable RLS
ALTER TABLE mass_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view mass types from their parish"
  ON mass_types
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff and above can insert mass types"
  ON mass_types
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY "Staff and above can update mass types"
  ON mass_types
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY "Staff and above can delete non-system mass types"
  ON mass_types
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
    AND is_system = false -- Cannot delete system types
  );

-- Add trigger for updated_at
CREATE TRIGGER update_mass_types_updated_at
  BEFORE UPDATE ON mass_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Seed Default Mass Types for All Parishes
-- =====================================================
-- Insert default mass types for all existing parishes

INSERT INTO mass_types (parish_id, key, label_en, label_es, description, display_order, is_system)
SELECT
  p.id as parish_id,
  'WEEKEND' as key,
  'Weekend' as label_en,
  'Fin de Semana' as label_es,
  'Saturday vigil and Sunday masses' as description,
  1 as display_order,
  true as is_system
FROM parishes p;

INSERT INTO mass_types (parish_id, key, label_en, label_es, description, display_order, is_system)
SELECT
  p.id as parish_id,
  'DAILY' as key,
  'Daily' as label_en,
  'Diaria' as label_es,
  'Weekday masses' as description,
  2 as display_order,
  true as is_system
FROM parishes p;

INSERT INTO mass_types (parish_id, key, label_en, label_es, description, display_order, is_system)
SELECT
  p.id as parish_id,
  'HOLIDAY' as key,
  'Holiday' as label_en,
  'Día Festivo' as label_es,
  'Special liturgical days and holy days' as description,
  3 as display_order,
  true as is_system
FROM parishes p;

INSERT INTO mass_types (parish_id, key, label_en, label_es, description, display_order, is_system)
SELECT
  p.id as parish_id,
  'SPECIAL' as key,
  'Special' as label_en,
  'Especial' as label_es,
  'One-time or seasonal masses' as description,
  4 as display_order,
  true as is_system
FROM parishes p;
