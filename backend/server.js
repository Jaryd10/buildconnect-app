const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const directoryRoutes = require("./routes/directory");
const publicRoutes = require("./routes/public");
const uploadRoutes = require("./routes/upload");
const messagesRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messagesRoutes); // 🔥 THIS IS THE KEY LINE

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.send("BuildConnect backend is running ✅");
});

/* ---------- SOCKETS (UNCHANGED) ---------- */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (username) => {
    socket.username = username;
    console.log("Registering socket for user:", username);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
