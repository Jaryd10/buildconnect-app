// backend/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");

const messagesRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

/* =====================
   Core middleware
===================== */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

/* =====================
   Health check
===================== */
app.get("/", (req, res) => {
  res.json({ status: "BuildConnect backend running ✅" });
});

/* =====================
   Messages API
===================== */
app.use("/messages", messagesRoutes);

/* =====================
   404 JSON fallback (IMPORTANT)
===================== */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =====================
   Start server
===================== */
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
