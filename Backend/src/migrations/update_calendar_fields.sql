-- Create calendar_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS calendar_events (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  type ENUM('personal', 'tutoring', 'study_group') NOT NULL,
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT FALSE,
  meeting_link VARCHAR(255) NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create event_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_participants (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Make meeting_link nullable in calendar_events table if it exists
ALTER TABLE calendar_events MODIFY COLUMN meeting_link VARCHAR(255) NULL;

-- Make user_id nullable in event_participants table if it exists
ALTER TABLE event_participants MODIFY COLUMN user_id CHAR(36) NULL; 