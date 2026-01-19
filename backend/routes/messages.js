import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * GET /messages
 * Load direct message history between two users
 */
router.get("/", async (req, res) => {
  const { userA, userB } = req.query;

  if (!userA || !userB) {
    return res.status(400).json({ error: "Missing users" });
  }

  try {
    const rows = await db.all(
      `
      SELECT
        sender AS "from",
        receiver AS "to",
        text,
        attachment,
        reactions,
        created_at AS timestamp
      FROM direct_messages
      WHERE (sender = ? AND receiver = ?)
         OR (sender = ? AND receiver = ?)
      ORDER BY created_at ASC
      `,
      [userA, userB, userB, userA]
    );

    const parsed = rows.map((r) => ({
      ...r,
      attachment: r.attachment ? JSON.parse(r.attachment) : null,
      reactions: r.reactions ? JSON.parse(r.reactions) : {}
    }));

    res.json(parsed);
  } catch (err) {
    console.error("Failed to load DM history", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

/**
 * POST /messages
 * Persist a direct message (HTTP fallback)
 */
router.post("/", async (req, res) => {
  const { from, to, text, attachment, reactions, timestamp } = req.body;

  try {
    await db.run(
      `
      INSERT INTO direct_messages
      (sender, receiver, text, attachment, reactions, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        from,
        to,
        text || "",
        attachment ? JSON.stringify(attachment) : null,
        JSON.stringify(reactions || {}),
        timestamp || Date.now()
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to persist DM", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

export default router;
