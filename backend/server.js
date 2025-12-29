const express = require("express");
const cors = require("cors");
const path = require("path");

const publicRoutes = require("./routes/public");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = 4000;

// middleware
app.use(cors());
app.use(express.json());

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/public", publicRoutes);
app.use("/api/upload", uploadRoutes);

// health check
app.get("/", (req, res) => {
  res.send("BuildConnect backend running");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
