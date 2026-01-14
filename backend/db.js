const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "buildconnect.db");
const db = new Database(dbPath);

// Create tables if they don’t exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS public_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;
