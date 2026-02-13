-- Add regulation_name column to equipment table
-- This links each piece of equipment to a regulation (e.g., "40 CFR Part 63")
-- Values are sourced from the requirements.regulation_name field

ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS regulation_name TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN equipment.regulation_name IS 'Regulation name (e.g., 40 CFR Part 63) from requirements table';
