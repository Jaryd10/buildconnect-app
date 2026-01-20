const express = require("express");
const cors = require("cors");
const http = require("http");

const messagesRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

/* Health check */
app.get("/", (req, res) => {
  res.send("BuildConnect backend is running ✅");
});

/* API routes */
app.use("/api/messages", messagesRoutes);

/* Fallback */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
