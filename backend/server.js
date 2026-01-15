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
   Public Chat Table
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
   Directory Businesses Table
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

/* =========================
   Seed Directory (ONLY ONCE)
========================= */
const existing = db
  .prepare("SELECT COUNT(*) as count FROM directory_businesses")
  .get().count;

if (existing === 0) {
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

  console.log("✅ Directory seeded");
}

/* =========================
   Directory API
========================= */
app.get("/api/directory", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM directory_businesses")
      .all();

    res.json(rows);
  } catch (err) {
    console.error("Directory error:", err);
    res.status(500).json({ error: "Failed to load directory" });
  }
});

/* =========================
   Socket.io (UNCHANGED)
========================= */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
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
   Start Server
========================= */
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
