const Database = require("better-sqlite3");

const db = new Database("buildconnect.db");

/* ---------- PUBLIC CHAT MESSAGES ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS public_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    text TEXT,
    file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

/* ---------- USERS ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

/* ---------- PROFILES ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

/* ---------- SUBSCRIPTIONS ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    billing TEXT,
    status TEXT DEFAULT 'active',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

/* ---------- BUSINESS CATEGORIES ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS business_categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    label TEXT
  )
`).run();

/* ---------- BUSINESSES ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT,
    name TEXT,
    category_id TEXT,
    description TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_user_id) REFERENCES users(id),
    FOREIGN KEY(category_id) REFERENCES business_categories(id)
  )
`).run();

/* ---------- CONVERSATIONS ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_one_id TEXT,
    user_two_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

/* ---------- DIRECT MESSAGES ---------- */
db.prepare(`
  CREATE TABLE IF NOT EXISTS direct_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    sender_user_id TEXT,
    body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id)
  )
`).run();

module.exports = db;
