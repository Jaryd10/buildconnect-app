const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/messages/direct
router.post("/direct", async (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !to || !text) {
    return res.status(400).json({ error: "Both users and text required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO direct_messages (sender, receiver, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [from, to, text]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/messages/direct?from=Jay&to=Mike
router.get("/direct", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Both users required" });
  }

  try {
    const result = await db.query(
      `SELECT * FROM direct_messages
       WHERE (sender=$1 AND receiver=$2)
          OR (sender=$2 AND receiver=$1)
       ORDER BY created_at ASC`,
      [from, to]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
