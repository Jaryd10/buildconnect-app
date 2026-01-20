// backend/routes/messages.js
const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   POST /messages/public
========================= */
router.post("/public", async (req, res) => {
  const { from, text } = req.body;

  if (!from || !text) {
    return res.status(400).json({ error: "from and text required" });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO messages (from_user, to_user, text, is_direct)
      VALUES ($1, NULL, $2, false)
      RETURNING *
      `,
      [from, text]
    );

    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error("PUBLIC MESSAGE ERROR:", err);
    res.status(500).json({ error: "Failed to send public message" });
  }
});

/* =========================
   POST /messages/direct
========================= */
router.post("/direct", async (req, res) => {
  const { from, to, text } = req.body;

  if (!from || !to || !text) {
    return res.status(400).json({ error: "Both users required" });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO messages (from_user, to_user, text, is_direct)
      VALUES ($1, $2, $3, true)
      RETURNING *
      `,
      [from, to, text]
    );

    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error("DIRECT MESSAGE ERROR:", err);
    res.status(500).json({ error: "Failed to send direct message" });
  }
});

/* =========================
   GET /messages/public
========================= */
router.get("/public", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT * FROM messages
      WHERE is_direct = false
      ORDER BY created_at ASC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("FETCH PUBLIC ERROR:", err);
    res.status(500).json({ error: "Failed to load public messages" });
  }
});

/* =========================
   GET /messages/direct
========================= */
router.get("/direct", async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Both users required" });
  }

  try {
    const result = await db.query(
      `
      SELECT * FROM messages
      WHERE is_direct = true
        AND (
          (from_user = $1 AND to_user = $2)
          OR
          (from_user = $2 AND to_user = $1)
        )
      ORDER BY created_at ASC
      `,
      [user1, user2]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("FETCH DIRECT ERROR:", err);
    res.status(500).json({ error: "Failed to load direct messages" });
  }
});

module.exports = router;
