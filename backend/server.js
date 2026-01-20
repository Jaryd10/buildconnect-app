const express = require("express");
const cors = require("cors");

const messagesRoutes = require("./routes/messages");

const app = express();

app.use(cors());
app.use(express.json());

// 🔒 HARD-LOCK API PREFIX
app.use("/api/messages", messagesRoutes);

// health check
app.get("/", (req, res) => {
  res.send("BuildConnect backend running ✅");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
