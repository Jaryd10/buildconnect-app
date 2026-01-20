const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/messages/direct
router.post("/direct", async (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !to || !text) {
    return res.status(400).json({ error: "from, to, and text required" });
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
    console.error("DM insert error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/messages/direct?user1=Jay&user2=Mike
router.get("/direct", async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Both users required" });
  }

  try {
    const result = await db.query(
      `SELECT *
       FROM direct_messages
       WHERE (sender=$1 AND receiver=$2)
          OR (sender=$2 AND receiver=$1)
       ORDER BY created_at ASC`,
      [user1, user2]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DM fetch error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
