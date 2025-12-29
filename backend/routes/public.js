const express = require("express");
const router = express.Router();

let messages = [];

// GET all messages
router.get("/", (req, res) => {
  res.json(messages);
});

// POST new message
router.post("/", (req, res) => {
  const { user, text, file, fileType } = req.body;

  // allow text OR file (or both)
  if (!user || (!text && !file)) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const message = {
    user,
    text: text || "",
    file: file || null,
    fileType: fileType || null,
    createdAt: Date.now(),
  };

  messages.push(message);
  res.json(message);
});

module.exports = router;
