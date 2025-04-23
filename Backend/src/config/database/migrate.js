const { Sequelize } = require('sequelize');
const sequelize = require('./index');

async function migrate() {
  try {
    console.log('Starting database migration...');
    console.log('Testing database connection...');
    
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Users table
    console.log('Creating users table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created successfully.');

    // Topics table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id CHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        creator_id CHAR(36),
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // User_Topics (for tracking started/enrolled topics)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_topics (
        user_id CHAR(36),
        topic_id CHAR(36),
        progress INT DEFAULT 0,
        last_accessed TIMESTAMP NULL,
        status VARCHAR(20) DEFAULT 'started',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, topic_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);

    // Study_Materials table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS study_materials (
        id CHAR(36) PRIMARY KEY,
        topic_id CHAR(36),
        title VARCHAR(255) NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        content TEXT,
        file_url TEXT,
        created_by CHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Notes table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        topic_id CHAR(36),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        is_private BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);

    // Quizzes table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id CHAR(36) PRIMARY KEY,
        topic_id CHAR(36),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_by CHAR(36),
        is_ai_generated BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Quiz_Questions table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id CHAR(36) PRIMARY KEY,
        quiz_id CHAR(36),
        question TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        correct_answer TEXT NOT NULL,
        options JSON,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      );
    `);

    // Quiz_Attempts table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        quiz_id CHAR(36),
        score INT,
        completed_at TIMESTAMP NULL,
        answers JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      );
    `);

    // Calendar_Events table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(50),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        is_recurring BOOLEAN DEFAULT false,
        recurrence_rule TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Tutoring_Sessions table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tutoring_sessions (
        id CHAR(36) PRIMARY KEY,
        student_id CHAR(36),
        tutor_id CHAR(36),
        topic_id CHAR(36),
        status VARCHAR(50) DEFAULT 'scheduled',
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
      );
    `);

    // Audio_Recaps table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS audio_recaps (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        topic_id CHAR(36),
        title VARCHAR(255) NOT NULL,
        audio_url TEXT NOT NULL,
        duration INT,
        transcript TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);

    // AI_Assistance_History table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ai_assistance_history (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        query TEXT NOT NULL,
        response TEXT NOT NULL,
        context JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // User_Activity_Logs table (for insights)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        activity_type VARCHAR(50) NOT NULL,
        activity_details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Execute migration if this file is run directly
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = migrate; 