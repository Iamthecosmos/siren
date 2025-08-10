const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

const DB_PATH = process.env.DATABASE_URL || './database/siren.db';

let db;

async function initializeDatabase() {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(DB_PATH);
    await fs.mkdir(dbDir, { recursive: true });

    // Initialize SQLite database
    db = new sqlite3.Database(DB_PATH);

    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');

    // Create tables
    await createTables();
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  // Users table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Community Safety Reports table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS community_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      incident_type TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      timestamp DATETIME NOT NULL,
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'disputed', 'removed')),
      photos_json TEXT, -- JSON array of photo URLs
      witness_count TEXT,
      police_notified BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Voice Contributions table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS voice_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      voice_type TEXT NOT NULL CHECK (voice_type IN ('emergency', 'casual', 'professional', 'family', 'custom')),
      gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
      age_range TEXT CHECK (age_range IN ('child', 'teen', 'adult', 'senior')),
      accent TEXT,
      language TEXT DEFAULT 'en',
      file_path TEXT NOT NULL,
      file_size INTEGER,
      duration REAL, -- Duration in seconds
      sample_rate INTEGER,
      format TEXT,
      is_approved BOOLEAN DEFAULT FALSE,
      is_featured BOOLEAN DEFAULT FALSE,
      download_count INTEGER DEFAULT 0,
      rating_average REAL DEFAULT 0.0,
      rating_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Report Verifications table (for tracking who verified which reports)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS report_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(report_id, user_id),
      FOREIGN KEY (report_id) REFERENCES community_reports (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Voice Ratings table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS voice_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voice_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(voice_id, user_id),
      FOREIGN KEY (voice_id) REFERENCES voice_contributions (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // User Sessions table (for JWT token management)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await runQuery('CREATE INDEX IF NOT EXISTS idx_reports_location ON community_reports (latitude, longitude)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON community_reports (timestamp)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_reports_type ON community_reports (incident_type)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_reports_severity ON community_reports (severity)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_voices_type ON voice_contributions (voice_type)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_voices_rating ON voice_contributions (rating_average)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_voices_downloads ON voice_contributions (download_count)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)');

  console.log('All tables created successfully');
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initializeDatabase,
  runQuery,
  getQuery,
  allQuery,
  getDatabase
};
