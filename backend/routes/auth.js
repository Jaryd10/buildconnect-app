const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_later";

/**
 * POST /auth/register
 */
router.post("/register", (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);

  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const userId = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    `INSERT INTO users (id, email, password_hash)
     VALUES (?, ?, ?)`
  ).run(userId, email, passwordHash);

  db.prepare(
    `INSERT INTO profiles (id, user_id, display_name)
     VALUES (?, ?, ?)`
  ).run(uuidv4(), userId, displayName);

  db.prepare(
    `INSERT INTO subscriptions (id, user_id, plan)
     VALUES (?, ?, 'free')`
  ).run(uuidv4(), userId);

  const token = jwt.sign(
    { userId, role: "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

/**
 * POST /auth/login
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

/**
 * GET /auth/me
 */
router.get("/me", (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Not authenticated" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db
      .prepare("SELECT id, email, role FROM users WHERE id = ?")
      .get(decoded.userId);

    const profile = db
      .prepare("SELECT * FROM profiles WHERE user_id = ?")
      .get(decoded.userId);

    const subscription = db
      .prepare("SELECT plan, status FROM subscriptions WHERE user_id = ?")
      .get(decoded.userId);

    res.json({ user, profile, subscription });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
