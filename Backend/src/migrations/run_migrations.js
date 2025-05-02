const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

/**
 * Runs all SQL statements from a file
 * @param {string} filePath - Path to the SQL file
 * @returns {Promise<boolean>} - Success status
 */
async function runSingleFile(filePath) {
  // Read SQL file
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);
  
  // Load environment variables
  const {
    DB_HOST = 'localhost',
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'unihub_db',
  } = process.env;
  
  console.log(`[LOG migration] ========= Running migration from ${path.basename(filePath)}`);
  console.log(`[LOG migration] ========= Connecting to database ${DB_NAME} at ${DB_HOST}`);
  
  // Get database connection
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true
    });
    
    console.log('[LOG migration] ========= Connected to database');
    console.log('[LOG migration] ========= Running migrations...');
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`[LOG migration] ========= Executing: ${statement.substring(0, 60)}...`);
      try {
        await connection.execute(`${statement};`);
      } catch (err) {
        console.error(`[LOG migration] ========= Error executing statement: ${err.message}`);
        console.error(statement);
        // Continue with other statements
      }
    }
    
    console.log('[LOG migration] ========= Migrations completed!');
    await connection.end();
    return true;
  } catch (error) {
    console.error('[LOG migration] ========= Error connecting to database:', error);
    return false;
  }
}

async function runMigrations() {
  // Migration files to run in order
  const migrationFiles = [
    path.join(__dirname, 'create_statistics_tables.sql'),
    path.join(__dirname, 'create_materials_table.sql'),
    path.join(__dirname, 'create_indexes.sql'),
    path.join(__dirname, 'add_is_private_to_notes.sql'),
    path.join(__dirname, 'add_user_relations.sql'),
    path.join(__dirname, 'update_calendar_fields.sql'),
    path.join(__dirname, 'update_notes_for_ai_generation.sql'),
    path.join(__dirname, 'add_read_time_to_notes.sql'),
    path.join(__dirname, 'add_user_goal_to_notes.sql')
  ];
  
  let success = true;
  
  for (const sqlFile of migrationFiles) {
    const result = await runSingleFile(sqlFile);
    if (!result) {
      success = false;
    }
  }
  
  return success;
}

// Run migrations when script is executed directly
if (require.main === module) {
  runMigrations().then(success => {
    if (!success) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('[LOG migration] ========= Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { 
  runMigrations,
  runSingleFile 
}; 