-- Add liturgical_color field to masses table
ALTER TABLE masses
ADD COLUMN liturgical_color TEXT;

COMMENT ON COLUMN masses.liturgical_color IS 'The liturgical color for this Mass (e.g., Green, White, Red, Purple, Rose)';

-- Create index for liturgical_color
CREATE INDEX idx_masses_liturgical_color ON masses(liturgical_color);
