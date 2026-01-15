const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);

/* =========================
   CONFIG
========================= */
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const SALT_ROUNDS = 10;

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   BASIC ROUTES
========================= */
app.get("/", (req, res) => {
  res.status(200).send("BuildConnect backend is running ✅");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* =========================
   SQLite (Render-safe)
========================= */
const dbPath = path.join(__dirname, "buildconnect.db");
const db = new Database(dbPath);

/* =========================
   USERS TABLE (AUTH)
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER
  )
`).run();

/* =========================
   PUBLIC CHAT TABLE
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS public_messages (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    text TEXT,
    file TEXT,
    created_at INTEGER
  )
`).run();

/* =========================
   DIRECTORY BUSINESSES TABLE
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS directory_businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    trade TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT,
    description TEXT
  )
`).run();

/* Seed directory once */
const count = db
  .prepare("SELECT COUNT(*) as count FROM directory_businesses")
  .get().count;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO directory_businesses
    (name, trade, location, phone, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  insert.run(
    "Smith Electrical",
    "Electrician",
    "George, WC",
    "072 123 4567",
    "Residential and commercial electrical installations"
  );

  insert.run(
    "Coastal Builders",
    "Builder",
    "Mossel Bay, WC",
    "083 987 6543",
    "Boundary walls, renovations, and small builds"
  );

  insert.run(
    "Precision Plumbing",
    "Plumber",
    "Knysna, WC",
    "071 555 8899",
    "Emergency plumbing and maintenance"
  );
}

/* =========================
   AUTH ROUTES
========================= */

/**
 * POST /api/auth/register
 * body: { username, email, password }
 */
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const existing = db
    .prepare(
      "SELECT id FROM users WHERE username = ? OR email = ?"
    )
    .get(username, email);

  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

  db.prepare(`
    INSERT INTO users (username, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `).run(username, email, passwordHash, Date.now());

  res.status(201).json({ message: "User registered successfully" });
});

/**
 * POST /api/auth/login
 * body: { identifier, password }
 * identifier = username OR email
 */
app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const user = db
    .prepare(
      "SELECT * FROM users WHERE username = ? OR email = ?"
    )
    .get(identifier, identifier);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = bcrypt.compareSync(
    password,
    user.password_hash
  );

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});

/* =========================
   API ROUTES (WIRED)
========================= */
app.get("/api/directory", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM directory_businesses")
    .all();
  res.json(rows);
});

app.get("/api/marketplace", (req, res) => {
  res.json([]);
});

app.get("/api/messages", (req, res) => {
  res.json([]);
});

app.get("/api/profile/:username", (req, res) => {
  res.json({
    username: req.params.username,
    role: "user",
    verified: false,
  });
});

/* =========================
   SOCKET.IO (LOCKED)
========================= */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  const history = db
    .prepare("SELECT * FROM public_messages ORDER BY created_at ASC")
    .all();

  socket.emit("publicHistory", history);

  socket.on("publicMessage", (msg) => {
    db.prepare(`
      INSERT INTO public_messages
      (id, username, text, file, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      msg.id,
      msg.user,
      msg.text || null,
      msg.file ? JSON.stringify(msg.file) : null,
      Date.now()
    );

    io.emit("publicMessage", msg);
  });

  socket.on("publicEdit", ({ id, text }) => {
    db.prepare(
      "UPDATE public_messages SET text = ? WHERE id = ?"
    ).run(text, id);

    io.emit("publicEdit", { id, text });
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
