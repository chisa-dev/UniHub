-- Add user_id indexes to tables
ALTER TABLE topics ADD INDEX idx_topics_user_id (user_id);
ALTER TABLE notes ADD INDEX idx_notes_user_id (user_id);
ALTER TABLE quizzes ADD INDEX idx_quizzes_user_id (user_id);

-- Try to add user_id column to materials table
ALTER TABLE materials ADD COLUMN user_id CHAR(36) NOT NULL;
ALTER TABLE materials ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE materials ADD INDEX idx_materials_user_id (user_id); 