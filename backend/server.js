const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const directoryRoutes = require("./routes/directory");
const messagesRoutes = require("./routes/messages");
const uploadRoutes = require("./routes/upload");

const app = express();
const server = http.createServer(app);

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   Health check (Render)
========================= */
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   API Routes (FIXED)
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/upload", uploadRoutes);

/* =========================
   Socket.io (DO NOT TOUCH)
========================= */
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register-user", (username) => {
    socket.username = username;
    console.log("Registered socket for user:", username);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
