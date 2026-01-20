const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const messagesRouter = require("./routes/messages");

const app = express();
const server = http.createServer(app);

/* -------------------- middleware -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- health -------------------- */
app.get("/", (req, res) => {
  res.send("BuildConnect backend is running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* -------------------- API ROUTES -------------------- */
/**
 * THIS IS THE CRITICAL LINE
 * Everything in routes/messages.js is mounted under /messages
 */
app.use("/messages", messagesRouter);

/* -------------------- sockets -------------------- */
const io = new Server(server, {
  cors: { origin: "*" },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  socket.on("registerUser", (username) => {
    if (!username) return;
    connectedUsers.set(username, socket.id);
  });

  socket.on("directMessage", (payload) => {
    const toSocket = connectedUsers.get(payload.to);
    const fromSocket = connectedUsers.get(payload.from);

    if (toSocket) io.to(toSocket).emit("directMessage", payload);
    if (fromSocket) io.to(fromSocket).emit("directMessage", payload);
  });

  socket.on("disconnect", () => {
    for (const [user, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(user);
        break;
      }
    }
  });
});

/* -------------------- start -------------------- */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
