const express = require("express");
const router = express.Router();
const db = require("../db");

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

/* =========================
   EDIT MESSAGE
========================= */
router.put("/:dbId", (req, res) => {
  const { text } = req.body;
  const { dbId } = req.params;

  db.run(
    `UPDATE messages SET text = ? WHERE id = ?`,
    [text, dbId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Edit failed" });
      }
      res.sendStatus(200);
    }
  );
});

/* =========================
   DELETE MESSAGE
========================= */
router.delete("/messages/:dbId", (req, res) => {
  const { dbId } = req.params;

  db.run(
    `DELETE FROM messages WHERE id = ?`,
    [dbId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Delete failed" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.sendStatus(200);
    }
  );
});

module.exports = router;
