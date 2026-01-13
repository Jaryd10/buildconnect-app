const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Routes
const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");
const directoryRoutes = require("./routes/directory");

const app = express();
const server = http.createServer(app);

/* =========================
   EXPRESS MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use("/directory", directoryRoutes);

/* =========================
   REST ROUTES
========================= */

app.use("/public", publicRoutes);
app.use("/auth", authRoutes);

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("publicMessage", (data) => {
    io.emit("publicMessage", data);
  });

  socket.on("publicEdit", (data) => {
    io.emit("publicEdit", data);
  });

  socket.on("publicDelete", (data) => {
    io.emit("publicDelete", data.id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* =========================
   START SERVER
========================= */

server.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
