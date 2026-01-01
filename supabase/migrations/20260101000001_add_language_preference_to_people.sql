-- Add language preference column to people table
-- Stores the user's preferred language for communications and UI
-- Default is NULL (will fall back to English)

ALTER TABLE people
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN people.language_preference IS 'Preferred language code (e.g., "en", "es"). NULL means use default (English).';

-- Create index for filtering by language
CREATE INDEX IF NOT EXISTS idx_people_language_preference ON people(language_preference) WHERE language_preference IS NOT NULL;
