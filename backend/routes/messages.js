const express = require("express");
const router = express.Router();
const pool = require("../db"); // pg pool

// Ensure user exists, return id
async function getUserId(username) {
  const { rows } = await pool.query(
    `INSERT INTO users (username)
     VALUES ($1)
     ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
     RETURNING id`,
    [username]
  );
  return rows[0].id;
}

// Ensure conversation exists, return id
async function getConversationId(userA, userB) {
  const [a, b] = userA < userB ? [userA, userB] : [userB, userA];

  const { rows } = await pool.query(
    `INSERT INTO conversations (user_a, user_b)
     VALUES ($1, $2)
     ON CONFLICT (user_a, user_b) DO UPDATE SET user_a = EXCLUDED.user_a
     RETURNING id`,
    [a, b]
  );
  return rows[0].id;
}

// Fetch messages for a conversation
router.get("/:withUser", async (req, res) => {
  try {
    const me = req.query.me;
    const other = req.params.withUser;

    const meId = await getUserId(me);
    const otherId = await getUserId(other);
    const convoId = await getConversationId(meId, otherId);

    const { rows } = await pool.query(
      `SELECT m.id, m.body, m.created_at, u.username AS sender
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [convoId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET messages error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

// Send message
router.post("/", async (req, res) => {
  try {
    const { from, to, body } = req.body;

    const fromId = await getUserId(from);
    const toId = await getUserId(to);
    const convoId = await getConversationId(fromId, toId);

    const { rows } = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, body, created_at`,
      [convoId, fromId, body]
    );

    res.json({
      id: rows[0].id,
      body: rows[0].body,
      sender: from,
      created_at: rows[0].created_at,
    });
  } catch (err) {
    console.error("POST message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
