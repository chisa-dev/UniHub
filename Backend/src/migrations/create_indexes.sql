-- Create indexes for performance
-- These will be run manually if needed

-- Study sessions indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(study_date);

-- Topic progress indexes
CREATE INDEX idx_topic_progress_user_id ON topic_progress(user_id);
CREATE INDEX idx_topic_progress_topic_id ON topic_progress(topic_id);

-- Note progress indexes
CREATE INDEX idx_note_progress_user_id ON note_progress(user_id);
CREATE INDEX idx_note_progress_note_id ON note_progress(note_id);

-- Quiz progress indexes
CREATE INDEX idx_quiz_progress_user_id ON quiz_progress(user_id);
CREATE INDEX idx_quiz_progress_quiz_id ON quiz_progress(quiz_id); 