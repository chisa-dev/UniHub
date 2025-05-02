-- Add user_goal column to notes table for RAG note generation
ALTER TABLE notes
ADD COLUMN user_goal TEXT NULL COMMENT 'User goal for generating the note'; 