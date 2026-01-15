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
   BASIC HTTP ROUTES
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

/* =========================
   Public chat table
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
   DIRECTORY API (seeded)
========================= */
app.get("/api/directory", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Smith Electrical",
      trade: "Electrician",
      location: "George, WC",
      phone: "072 123 4567",
      description: "Residential and commercial electrical installations"
    },
    {
      id: 2,
      name: "Coastal Builders",
      trade: "Builder",
      location: "Mossel Bay, WC",
      phone: "083 987 6543",
      description: "Boundary walls, renovations, and small builds"
    },
    {
      id: 3,
      name: "Precision Plumbing",
      trade: "Plumber",
      location: "Knysna, WC",
      phone: "071 555 8899",
      description: "Emergency plumbing and maintenance"
    }
  ]);
});

/* =========================
   PLACEHOLDER API ROUTES
   (Wiring only – no auth)
========================= */

// Marketplace
app.get("/api/marketplace", (req, res) => {
  res.json([]);
});

// Messages (non-socket placeholder)
app.get("/api/messages", (req, res) => {
  res.json([]);
});

// Public profile placeholder
app.get("/api/profile/:username", (req, res) => {
  const { username } = req.params;

  res.json({
    username,
    role: "user",
    joined: "2026-01-01",
    bio: "Public profile placeholder",
    verified: false
  });
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
