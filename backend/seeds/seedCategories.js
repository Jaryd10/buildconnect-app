const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const categories = [
  { slug: "plumber", label: "Plumber" },
  { slug: "electrician", label: "Electrician" },
  { slug: "builder", label: "Builder" },
  { slug: "carpenter", label: "Carpenter" },
  { slug: "painter", label: "Painter" },
  { slug: "tiler", label: "Tiler" },
  { slug: "roofer", label: "Roofer" },
  { slug: "landscaping", label: "Landscaping" },
  { slug: "renovations", label: "Renovations" },
  { slug: "maintenance", label: "General Maintenance" },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO business_categories (id, slug, label)
  VALUES (?, ?, ?)
`);

db.transaction(() => {
  categories.forEach(cat => {
    insert.run(uuidv4(), cat.slug, cat.label);
  });
})();

console.log("✅ Business categories seeded successfully");
