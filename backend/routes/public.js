const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   GET MESSAGE HISTORY
========================= */
router.get("/", (req, res) => {
  db.all(
    `SELECT id, user, text, file, created_at
     FROM messages
     ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Fetch failed" });
      }

      const messages = rows.map((m) => ({
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

/* =========================
   SAVE MESSAGE
========================= */
router.post("/", (req, res) => {
  const { user, text, file } = req.body;

  db.run(
    `INSERT INTO messages (user, text, file)
     VALUES (?, ?, ?)`,
    [user, text || null, file ? JSON.stringify(file) : null],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Insert failed" });
      }

      res.json({ dbId: this.lastID });
    }
  );
});

module.exports = router;
