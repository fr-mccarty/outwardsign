-- Add ocia_session_id column to people table to link candidates to OCIA sessions
ALTER TABLE people
ADD COLUMN ocia_session_id UUID REFERENCES ocia_sessions(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX idx_people_ocia_session_id ON people(ocia_session_id);
