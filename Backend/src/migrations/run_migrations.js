const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

/**
 * Runs a SQL file as a single batch
 * @param {string} filePath - Path to the SQL file
 * @returns {Promise<boolean>} - Success status
 */
async function runSingleFile(filePath) {
  try {
    // Read SQL file
    console.log(`[LOG migration] ========= Running migration from ${path.basename(filePath)}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Load environment variables
    const {
      DB_HOST = 'localhost',
      DB_USER = 'root',
      DB_PASSWORD = '',
      DB_NAME = 'unihub_db',
      DB_PORT = '3306',
    } = process.env;
    
    console.log(`[LOG migration] ========= Connecting to database ${DB_NAME} at ${DB_HOST}`);
    
    // Get database connection with multipleStatements option
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: parseInt(DB_PORT),
      multipleStatements: true
    });
    
    console.log('[LOG migration] ========= Connected to database');
    
    // First ensure database exists and use it
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    await connection.query(`USE ${DB_NAME}`);
    
    console.log('[LOG migration] ========= Running SQL file as a batch...');
    
    // Execute the entire SQL file as a single batch
    await connection.query(sql);
    
    console.log('[LOG migration] ========= Migration completed successfully!');
    await connection.end();
    return true;
  } catch (error) {
    console.error('[LOG migration] ========= Error during migration:', error);
    return false;
  }
}

/**
 * Get all SQL files from the migrations directory
 * @returns {Array<string>} Array of file paths sorted by filename
 */
function getSqlFiles() {
  const migrationsDir = process.env.MIGRATIONS_DIR || __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .map(file => path.join(migrationsDir, file));
  
  // Sort files alphabetically so they run in order
  return files.sort();
}

async function runMigrations() {
  // Get all SQL migration files
  const migrationFiles = getSqlFiles();
  
  console.log(`[LOG migration] ========= Found ${migrationFiles.length} migration files to run:`);
  migrationFiles.forEach((file, index) => {
    console.log(`[LOG migration] ========= ${index + 1}. ${path.basename(file)}`);
  });
  
  let success = true;
  
  for (const sqlFile of migrationFiles) {
    const result = await runSingleFile(sqlFile);
    if (!result) {
      success = false;
      console.error(`[LOG migration] ========= Failed to run migration: ${path.basename(sqlFile)}`);
    }
  }
  
  return success;
}

// Run migrations when script is executed directly
if (require.main === module) {
  runMigrations().then(success => {
    if (!success) {
      process.exit(1);
    } else {
      console.log('[LOG migration] ========= All migrations completed successfully!');
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