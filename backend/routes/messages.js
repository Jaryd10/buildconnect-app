const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const router = express.Router();
const db = new Database(path.join(__dirname, "../buildconnect.db"));

/**
 * GET /messages?userA=&userB=
 * Load DM history (PERSISTENCE FIX)
 */
router.get("/", (req, res) => {
  const { userA, userB } = req.query;
  if (!userA || !userB) {
    return res.status(400).json({ error: "Both users required" });
  }

  const rows = db.prepare(`
    SELECT
      id,
      sender AS "from",
      receiver AS "to",
      text,
      attachment,
      reactions,
      created_at AS timestamp
    FROM direct_messages
    WHERE
      (sender = ? AND receiver = ?)
      OR
      (sender = ? AND receiver = ?)
    ORDER BY created_at ASC
  `).all(userA, userB, userB, userA);

  res.json(
    rows.map(r => ({
      ...r,
      attachment: r.attachment ? JSON.parse(r.attachment) : null,
      reactions: r.reactions ? JSON.parse(r.reactions) : {}
    }))
  );
});

module.exports = router;
