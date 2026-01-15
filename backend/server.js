const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const server = http.createServer(app);

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
   PUBLIC CHAT TABLE (UNCHANGED)
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
   DIRECT MESSAGES TABLE (NEW)
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS direct_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user TEXT NOT NULL,
    to_user TEXT NOT NULL,
    text TEXT NOT NULL,
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
   API ROUTES
========================= */

/* Directory */
app.get("/api/directory", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM directory_businesses")
    .all();
  res.json(rows);
});

/* Marketplace (placeholder) */
app.get("/api/marketplace", (req, res) => {
  res.json([]);
});

/* Profiles (placeholder) */
app.get("/api/profile/:username", (req, res) => {
  res.json({
    username: req.params.username,
    role: "user",
    verified: false,
  });
});

/* =========================
   DIRECT MESSAGES API (NEW)
========================= */

/**
 * GET /api/messages?from=Alice&to=Bob
 */
app.get("/api/messages", (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.json([]);
  }

  const messages = db.prepare(`
    SELECT from_user AS "from",
           to_user AS "to",
           text,
           created_at
    FROM direct_messages
    WHERE
      (from_user = ? AND to_user = ?)
      OR
      (from_user = ? AND to_user = ?)
    ORDER BY created_at ASC
  `).all(from, to, to, from);

  res.json(messages);
});

/**
 * POST /api/messages
 * body: { from, to, text }
 */
app.post("/api/messages", (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !to || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.prepare(`
    INSERT INTO direct_messages
    (from_user, to_user, text, created_at)
    VALUES (?, ?, ?, ?)
  `).run(from, to, text, Date.now());

  res.status(201).json({ success: true });
});

/* =========================
   SOCKET.IO (PUBLIC CHAT ONLY)
========================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const history = db
    .prepare("SELECT * FROM public_messages ORDER BY created_at ASC")
    .all()
    .map((row) => ({
      id: row.id,
      user: row.username,
      text: row.text,
      file: row.file ? JSON.parse(row.file) : null,
      time: new Date(row.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

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
    db.prepare(`
      UPDATE public_messages
      SET text = ?
      WHERE id = ?
    `).run(text, id);

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
