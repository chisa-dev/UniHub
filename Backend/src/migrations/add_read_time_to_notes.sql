-- Add read_time column to notes table for RAG note generation
ALTER TABLE notes
ADD COLUMN read_time VARCHAR(20) NULL COMMENT 'Estimated reading time for the note';

-- Update any existing notes to have a default read_time value
UPDATE notes 
SET read_time = '2 min read' 
WHERE read_time IS NULL; 