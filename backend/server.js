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
   BASIC HTTP ROUTES (LOCKED)
========================= */
app.get("/", (req, res) => {
  res.status(200).send("BuildConnect backend is running ✅");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* =========================
   SQLite setup (Render-safe)
========================= */
const dbPath = path.join(__dirname, "buildconnect.db");
const db = new Database(dbPath);

/* Public chat table (LOCKED) */
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
   MOCK AUTH ROUTES (SAFE)
========================= */

/**
 * POST /api/auth/register
 * Mock register — NO DB WRITE
 */
app.post("/api/auth/register", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  return res.json({
    success: true,
    user: {
      username,
      role: "user"
    }
  });
});

/**
 * POST /api/auth/login
 * Mock login — NO PASSWORD CHECK
 */
app.post("/api/auth/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  return res.json({
    success: true,
    user: {
      username,
      role: "user"
    }
  });
});

/**
 * GET /api/auth/me
 * Mock current user
 */
app.get("/api/auth/me", (req, res) => {
  return res.json({
    username: "testuser",
    role: "user",
    verified: false
  });
});

/* =========================
   BUSINESS DIRECTORY (SAFE)
========================= */
app.get("/directory", (req, res) => {
  res.json([
    {
      id: "1",
      name: "Smith Electrical",
      category: "Electrician",
      location: "George, WC",
      description: "Qualified electrician with residential and commercial experience."
    },
    {
      id: "2",
      name: "Coastal Plumbing",
      category: "Plumber",
      location: "Mossel Bay, WC",
      description: "Emergency and maintenance plumbing services."
    },
    {
      id: "3",
      name: "Garden Route Builders",
      category: "Builder",
      location: "Knysna, WC",
      description: "Small residential builds, renovations, and boundary walls."
    }
  ]);
});


/* =========================
   Socket.io (LOCKED)
========================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const history = db
    .prepare("SELECT * FROM public_messages ORDER BY created_at ASC")
    .all()
    .map(row => ({
      id: row.id,
      user: row.username,
      text: row.text,
      file: row.file ? JSON.parse(row.file) : null,
      time: new Date(row.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    }));

  socket.emit("publicHistory", history);

  socket.on("publicMessage", (msg) => {
    db.prepare(`
      INSERT INTO public_messages (id, username, text, file, created_at)
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
   Start server (Render-ready)
========================= */
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
