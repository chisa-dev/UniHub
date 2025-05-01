-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id CHAR(36) PRIMARY KEY,
  topic_id CHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_file VARCHAR(255) NOT NULL,
  file_type ENUM('pdf', 'image', 'ppt', 'docx') NOT NULL,
  file_size INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
); 