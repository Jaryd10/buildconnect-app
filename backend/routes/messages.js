const express = require("express");
const router = express.Router();

/*
  v1 message store (username-based, permissive)
*/
const messages = [];

/**
 * GET /messages?userA=&userB=
 */
router.get("/", (req, res) => {
  const { userA, userB } = req.query;

  if (!userA || !userB) {
    return res.json([]);
  }

  const convo = messages.filter(
    (m) =>
      (m.from === userA && m.to === userB) ||
      (m.from === userB && m.to === userA)
  );

  res.json(convo);
});

/**
 * POST /messages
 * Body: { from, to, text }
 * v1: permissive – no hard validation
 */
router.post("/", (req, res) => {
  const { from, to, text } = req.body || {};

  const message = {
    from: from || "Unknown",
    to: to || "Unknown",
    text: String(text || ""),
    timestamp: Date.now(),
  };

  messages.push(message);
  res.json(message);
});

module.exports = router;
