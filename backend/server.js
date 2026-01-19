const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const messagesRouter = require("./routes/messages");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

/*
  Routes
*/
app.get("/", (_, res) => res.send("BuildConnect backend running"));
app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/messages", messagesRouter);

/*
  Socket.IO
*/
const io = new Server(server, {
  cors: { origin: "*" },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  socket.on("registerUser", (username) => {
    if (!username) return;
    connectedUsers.set(username, socket.id);
  });

  socket.on("directMessage", (msg) => {
    const toSocket = connectedUsers.get(msg.to);
    const fromSocket = connectedUsers.get(msg.from);

    if (toSocket) io.to(toSocket).emit("directMessage", msg);
    if (fromSocket) io.to(fromSocket).emit("directMessage", msg);
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

/*
  Start
*/
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
