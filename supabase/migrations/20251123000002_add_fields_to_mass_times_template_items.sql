-- Add new fields to mass_times_template_items table
ALTER TABLE mass_times_template_items
ADD COLUMN presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
ADD COLUMN length_of_time INTEGER, -- Duration in minutes
ADD COLUMN homilist_id UUID REFERENCES people(id) ON DELETE SET NULL,
ADD COLUMN lead_musician_id UUID REFERENCES people(id) ON DELETE SET NULL,
ADD COLUMN cantor_id UUID REFERENCES people(id) ON DELETE SET NULL;

-- Add comments documenting the new fields
COMMENT ON COLUMN mass_times_template_items.presider_id IS 'Default presider for masses created from this template item';
COMMENT ON COLUMN mass_times_template_items.location_id IS 'Default location for masses created from this template item';
COMMENT ON COLUMN mass_times_template_items.length_of_time IS 'Expected duration of the mass in minutes';
COMMENT ON COLUMN mass_times_template_items.homilist_id IS 'Default homilist for masses created from this template item';
COMMENT ON COLUMN mass_times_template_items.lead_musician_id IS 'Default lead musician for masses created from this template item';
COMMENT ON COLUMN mass_times_template_items.cantor_id IS 'Default cantor for masses created from this template item';

-- Create indexes for the new foreign key columns
CREATE INDEX idx_mass_times_template_items_presider_id ON mass_times_template_items(presider_id);
CREATE INDEX idx_mass_times_template_items_location_id ON mass_times_template_items(location_id);
CREATE INDEX idx_mass_times_template_items_homilist_id ON mass_times_template_items(homilist_id);
CREATE INDEX idx_mass_times_template_items_lead_musician_id ON mass_times_template_items(lead_musician_id);
CREATE INDEX idx_mass_times_template_items_cantor_id ON mass_times_template_items(cantor_id);
