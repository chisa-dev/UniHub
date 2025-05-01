-- Add is_private column to notes table
ALTER TABLE notes ADD COLUMN is_private BOOLEAN DEFAULT TRUE;
ALTER TABLE notes ADD COLUMN topic_id CHAR(36) NULL;
ALTER TABLE notes ADD FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;

-- Update existing notes to set is_private to true by default
UPDATE notes SET is_private = TRUE WHERE is_private IS NULL; 