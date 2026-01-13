const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Routes
const publicRoutes = require("./routes/public");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);

/* =========================
   TEMP LAUNCH SEED (Directory)
   Replace with DB later
========================= */

const directorySeed = [
  {
    id: 1,
    name: "BrightSpark Electrical",
    category: "Electrician",
    city: "George, WC",
    services: ["Residential", "Solar", "COC"],
    description: "Trusted local electrician serving George and surrounds.",
  },
  {
    id: 2,
    name: "Bayview Plumbing",
    category: "Plumber",
    city: "Mossel Bay, WC",
    services: ["Repairs", "Installations", "Emergency"],
    description: "Reliable plumbing services, available 24/7.",
  },
  {
    id: 3,
    name: "Garden Route Builders",
    category: "Builder",
    city: "Knysna, WC",
    services: ["Renovations", "Extensions", "New Builds"],
    description: "Quality building work from foundation to finish.",
  },
];

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

/* =========================
   DIRECTORY API (LAUNCH READY)
========================= */

// GET /directory
app.get("/directory", (req, res) => {
  res.json(directorySeed);
});

/* =========================
   OTHER ROUTES
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
