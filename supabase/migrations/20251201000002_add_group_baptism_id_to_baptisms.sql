-- Add group_baptism_id column to baptisms table
ALTER TABLE baptisms
ADD COLUMN group_baptism_id UUID REFERENCES group_baptisms(id) ON DELETE CASCADE;

-- Create index for group_baptism_id foreign key
CREATE INDEX idx_baptisms_group_baptism_id ON baptisms(group_baptism_id);

-- Add comment explaining the relationship
COMMENT ON COLUMN baptisms.group_baptism_id IS 'Links individual baptism to a group baptism ceremony. When group_baptism_id is NULL, baptism is standalone. When group_baptism is deleted, linked baptisms are also deleted (CASCADE).';
