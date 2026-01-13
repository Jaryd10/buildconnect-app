const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /directory
 * Optional query params:
 *  - category (slug)
 *  - city
 *  - region
 */
router.get("/", (req, res) => {
  const { category, city, region } = req.query;

  let sql = `
    SELECT
      b.id,
      b.name AS business_name,
      b.description,
      b.city,
      b.region,
      bc.label AS category
    FROM businesses b
    LEFT JOIN business_categories bc ON b.category_id = bc.id
    WHERE b.is_active = 1
  `;

  const params = [];

  if (category) {
    sql += " AND bc.slug = ?";
    params.push(category);
  }

  if (city) {
    sql += " AND b.city = ?";
    params.push(city);
  }

  if (region) {
    sql += " AND b.region = ?";
    params.push(region);
  }

  sql += " ORDER BY b.created_at DESC";

  try {
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    console.error("Directory query error:", err);
    res.status(500).json({ error: "Failed to load directory" });
  }
});

module.exports = router;
