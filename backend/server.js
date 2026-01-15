const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const Database = require("better-sqlite3");
const path = require("path");
const directoryRoutes = require("./routes/directory");

const app = express();
const server = http.createServer(app);

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(express.json());
app.use("/api/directory", directoryRoutes);

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
   BUSINESS DIRECTORY TABLE
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trade TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT
  )
`).run();

/* =========================
   DIRECTORY API (NEW)
========================= */
app.get("/directory", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  let rows = db.prepare(`
    SELECT * FROM businesses
  `).all();

  if (q) {
    rows = rows.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.trade.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    );
  }

  res.status(200).json(rows);
});

/* =========================
   Socket.io (UNCHANGED)
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
   Start server
========================= */
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
