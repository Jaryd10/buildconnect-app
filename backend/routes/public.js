const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   GET LAST 100 PUBLIC MESSAGES
========================= */
router.get("/", (req, res) => {
  db.all(
    `
    SELECT id, user, text, file, created_at
    FROM messages
    ORDER BY id DESC
    LIMIT 100
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error("Public history fetch failed:", err);
        return res.status(500).json({ error: "Failed to load messages" });
      }

      // Oldest → newest for UI
      const messages = rows
        .reverse()
        .map((m) => ({
          id: m.id,
          user: m.user,
          text: m.text,
          file: m.file ? JSON.parse(m.file) : null,
          time: new Date(m.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

      res.json(messages);
    }
  );
});

module.exports = router;
