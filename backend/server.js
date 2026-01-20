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
app.use(cors());
app.use(express.json());

/* =====================
   Health check
===================== */
app.get("/", (req, res) => {
  res.send("BuildConnect backend is running ✅");
});

/* =====================
   Routes
===================== */
app.use("/messages", messagesRoutes);

/* =====================
   Start server
===================== */
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
