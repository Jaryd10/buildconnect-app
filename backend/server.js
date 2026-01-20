// backend/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");

const messagesRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "BuildConnect backend running ✅" });
});

/**
 * 🔥 API PREFIX — THIS FIXES EVERYTHING
 */
app.use("/api/messages", messagesRoutes);

/**
 * JSON-only 404
 */
app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
