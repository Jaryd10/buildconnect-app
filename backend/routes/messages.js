const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * POST /messages/direct
 * Body: { from, to, text }
 */
router.post("/direct", async (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !to || !text) {
    return res.status(400).json({ error: "from, to and text required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO direct_messages (sender, receiver, message)
       VALUES ($1, $2, $3)
       RETURNING id, sender, receiver, message, created_at`,
      [from, to, text]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DM INSERT ERROR:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

/**
 * GET /messages/direct?userA=&userB=
 */
router.get("/direct", async (req, res) => {
  const { userA, userB } = req.query;

  if (!userA || !userB) {
    return res.status(400).json({ error: "Both users required" });
  }

  try {
    const result = await db.query(
      `SELECT id, sender, receiver, message, created_at
       FROM direct_messages
       WHERE (sender = $1 AND receiver = $2)
          OR (sender = $2 AND receiver = $1)
       ORDER BY created_at ASC`,
      [userA, userB]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DM FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
