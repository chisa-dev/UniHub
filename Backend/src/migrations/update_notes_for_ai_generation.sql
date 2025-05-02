-- Add user_goal column to notes table if it doesn't exist
SET @query = CONCAT('SELECT COUNT(*) INTO @column_exists FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = "notes" AND column_name = "user_goal"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = CONCAT('SET @alter_statement = IF(@column_exists = 0, "ALTER TABLE notes ADD COLUMN user_goal TEXT NULL", "SELECT 1")');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = @alter_statement;
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add read_time column to notes table if it doesn't exist
SET @query = CONCAT('SELECT COUNT(*) INTO @column_exists FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = "notes" AND column_name = "read_time"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = CONCAT('SET @alter_statement = IF(@column_exists = 0, "ALTER TABLE notes ADD COLUMN read_time VARCHAR(255) NULL", "SELECT 1")');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = @alter_statement;
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make sure we have consistent naming for topic relation
ALTER TABLE notes MODIFY COLUMN topic_id CHAR(36) NULL;

-- Add index for faster lookup
ALTER TABLE notes ADD INDEX IF NOT EXISTS idx_notes_topic_id (topic_id);

-- Update the notes table to ensure we have all required columns
DESCRIBE notes;

-- Check if created_by column exists and rename it to user_id if it does
-- Use a more MySQL-compatible approach
SELECT 
  IF(COUNT(*) > 0, 
     CONCAT('ALTER TABLE notes CHANGE COLUMN created_by user_id CHAR(36) NOT NULL'), 
     'SELECT 1') INTO @sql 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notes' AND COLUMN_NAME = 'created_by';

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if creator_id column exists and rename it to user_id if it does
SELECT 
  IF(COUNT(*) > 0, 
     CONCAT('ALTER TABLE notes CHANGE COLUMN creator_id user_id CHAR(36) NOT NULL'), 
     'SELECT 1') INTO @sql 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notes' AND COLUMN_NAME = 'creator_id';

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 