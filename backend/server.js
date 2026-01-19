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

/* Public messages (LOCKED) */
db.prepare(`
  CREATE TABLE IF NOT EXISTS public_messages (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    text TEXT,
    file TEXT,
    created_at INTEGER
  )
`).run();

/* Direct messages (AUTHORITATIVE) */
db.prepare(`
  CREATE TABLE IF NOT EXISTS direct_messages (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    text TEXT,
    attachment TEXT,
    reactions TEXT,
    created_at INTEGER
  )
`).run();

/* =========================
   ROUTES
========================= */
const messagesRouter = require("./routes/messages");
app.use("/messages", messagesRouter);

/* =========================
   SOCKET.IO
========================= */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const userSockets = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("registerUser", (username) => {
    if (!username) return;
    userSockets[username] = socket.id;
  });

  /* PUBLIC CHAT (LOCKED) */
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
    db.prepare(`UPDATE public_messages SET text = ? WHERE id = ?`)
      .run(text, id);
    io.emit("publicEdit", { id, text });
  });

  /* DIRECT MESSAGE (PERSIST + EMIT) */
  socket.on("directMessage", (msg) => {
    const { id, from, to, text, attachment, reactions } = msg;

    db.prepare(`
      INSERT INTO direct_messages
      (id, sender, receiver, text, attachment, reactions, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      from,
      to,
      text || "",
      attachment ? JSON.stringify(attachment) : null,
      JSON.stringify(reactions || {}),
      Date.now()
    );

    const senderSocket = userSockets[from];
    const receiverSocket = userSockets[to];

    if (senderSocket) io.to(senderSocket).emit("directMessage", msg);
    if (receiverSocket) io.to(receiverSocket).emit("directMessage", msg);
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
   START SERVER
========================= */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
