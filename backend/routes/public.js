const express = require("express");
const multer = require("multer");
const db = require("../db");

const router = express.Router();

/* ---------- UPLOAD CONFIG ---------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ---------- GET MESSAGES ---------- */
router.get("/", (req, res) => {
  const messages = db
    .prepare("SELECT * FROM messages ORDER BY id ASC")
    .all();
  res.json(messages);
});

/* ---------- POST MESSAGE ---------- */
router.post("/", upload.single("file"), (req, res) => {
  const { user, text } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!user || (!text && !file)) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const result = db
    .prepare(
      `INSERT INTO messages (user, text, file)
       VALUES (?, ?, ?)`
    )
    .run(user, text || null, file);

  const saved = db
    .prepare("SELECT * FROM messages WHERE id = ?")
    .get(result.lastInsertRowid);

  res.json(saved);
});

module.exports = router;
