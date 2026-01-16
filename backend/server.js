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

/* Direct messages table (SAFE) */
db.prepare(`
  CREATE TABLE IF NOT EXISTS direct_messages (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER
  )
`).run();

/* =========================
   MOCK AUTH ROUTES (SAFE)
========================= */
app.post("/api/auth/register", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  res.json({
    success: true,
    user: { username, role: "user" }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  res.json({
    success: true,
    user: { username, role: "user" }
  });
});

app.get("/api/auth/me", (req, res) => {
  res.json({
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
      description:
        "Residential and commercial electrical installations, fault finding, and compliance certificates.",
      phone: "082 123 4567",
      email: "info@smithelectrical.co.za",
      services: ["Wiring", "DB Boards", "COCs", "Fault Finding"],
      verified: true
    },
    {
      id: "2",
      name: "Coastal Plumbing",
      category: "Plumber",
      location: "Mossel Bay, WC",
      description:
        "Emergency plumbing, geyser installations, leak detection, and general maintenance.",
      phone: "083 555 0198",
      email: "service@coastalplumbing.co.za",
      services: ["Geysers", "Leaks", "Drain Cleaning"],
      verified: true
    },
    {
      id: "3",
      name: "Garden Route Builders",
      category: "Builder",
      location: "Knysna, WC",
      description:
        "Small residential builds, renovations, boundary walls, and general construction.",
      phone: "072 884 2211",
      email: "projects@gardenroutebuilders.co.za",
      services: ["Renovations", "Boundary Walls", "Painting"],
      verified: false
    }
  ]);
});

/* =========================
   DIRECT MESSAGES (HTTP)
========================= */
app.get("/messages", (req, res) => {
  const { userA, userB } = req.query;

  if (!userA || !userB) {
    return res.status(400).json({ error: "Both users required" });
  }

  const messages = db.prepare(`
    SELECT * FROM direct_messages
    WHERE
      (sender = ? AND receiver = ?)
      OR
      (sender = ? AND receiver = ?)
    ORDER BY created_at ASC
  `).all(userA, userB, userB, userA);

  res.json(messages);
});

app.post("/messages", (req, res) => {
  const { id, from, to, text } = req.body;

  if (!id || !from || !to || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.prepare(`
    INSERT INTO direct_messages (id, sender, receiver, text, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, from, to, text, Date.now());

  res.json({ success: true });
});

/* =========================
   Socket.io (LOCKED + DM EXTENSION)
========================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* Track connected users for DMs */
const userSockets = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* Register user for direct messages */
  socket.on("registerUser", (username) => {
    userSockets[username] = socket.id;
  });

  /* Public chat history */
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

  /* Public chat message */
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

  /* Public chat edit */
  socket.on("publicEdit", ({ id, text }) => {
    db.prepare(`
      UPDATE public_messages
      SET text = ?
      WHERE id = ?
    `).run(text, id);

    io.emit("publicEdit", { id, text });
  });

  /* Direct message (live) */
  socket.on("directMessage", (msg) => {
    const { id, from, to, text } = msg;

    db.prepare(`
      INSERT INTO direct_messages (id, sender, receiver, text, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, from, to, text, Date.now());

    const receiverSocket = userSockets[to];
    if (receiverSocket) {
      io.to(receiverSocket).emit("directMessage", msg);
    }
  });

  socket.on("disconnect", () => {
    for (const user in userSockets) {
      if (userSockets[user] === socket.id) {
        delete userSockets[user];
        break;
      }
    }
  });
});

/* =========================
   Start server (Render-ready)
========================= */
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
