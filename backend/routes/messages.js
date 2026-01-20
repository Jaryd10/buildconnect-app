const express = require("express");
const router = express.Router();
const pool = require("../db");

/* -------------------- helpers -------------------- */
async function getOrCreateUser(username) {
  const { rows } = await pool.query(
    `
    INSERT INTO users (username)
    VALUES ($1)
    ON CONFLICT (username)
    DO UPDATE SET username = EXCLUDED.username
    RETURNING id
    `,
    [username]
  );
  return rows[0].id;
}

async function getOrCreateConversation(userA, userB) {
  const [a, b] = userA < userB ? [userA, userB] : [userB, userA];

  const { rows } = await pool.query(
    `
    INSERT INTO conversations (user_a, user_b)
    VALUES ($1, $2)
    ON CONFLICT (user_a, user_b)
    DO UPDATE SET user_a = EXCLUDED.user_a
    RETURNING id
    `,
    [a, b]
  );

  return rows[0].id;
}

/* =====================================================
   DIRECT MESSAGES
   ===================================================== */

/**
 * GET /messages/direct/:otherUser?me=MY_USERNAME
 */
router.get("/direct/:otherUser", async (req, res) => {
  try {
    const me = req.query.me;
    const other = req.params.otherUser;

    if (!me || !other) {
      return res.status(400).json({ error: "Missing users" });
    }

    const meId = await getOrCreateUser(me);
    const otherId = await getOrCreateUser(other);
    const conversationId = await getOrCreateConversation(meId, otherId);

    const { rows } = await pool.query(
      `
      SELECT
        m.id,
        m.body AS text,
        m.created_at AS timestamp,
        u.username AS from
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET DM error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

/**
 * POST /messages/direct
 */
router.post("/direct", async (req, res) => {
  try {
    const { from, to, text } = req.body;

    if (!from || !to || !text) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const fromId = await getOrCreateUser(from);
    const toId = await getOrCreateUser(to);
    const conversationId = await getOrCreateConversation(fromId, toId);

    const { rows } = await pool.query(
      `
      INSERT INTO messages (conversation_id, sender_id, body)
      VALUES ($1, $2, $3)
      RETURNING id, body, created_at
      `,
      [conversationId, fromId, text]
    );

    res.json({
      id: rows[0].id,
      from,
      to,
      text: rows[0].body,
      timestamp: rows[0].created_at,
    });
  } catch (err) {
    console.error("POST DM error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
