const db = require("../db");

const insert = db.prepare(`
  INSERT INTO businesses (
    name,
    category,
    description,
    city,
    region,
    owner_email
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const businesses = [
  {
    name: "Jay Electrical",
    category: "electrical",
    description: "Residential and commercial electrical services.",
    city: "George",
    region: "Western Cape",
    owner_email: "jay@jayelectrical.co.za"
  },
  {
    name: "BuildRight Construction",
    category: "construction",
    description: "Boundary walls, renovations, and small builds.",
    city: "Mossel Bay",
    region: "Western Cape",
    owner_email: "info@buildright.co.za"
  },
  {
    name: "FastFlow Plumbing",
    category: "plumbing",
    description: "Emergency plumbing and leak detection.",
    city: "George",
    region: "Western Cape",
    owner_email: "help@fastflow.co.za"
  }
];

for (const b of businesses) {
  try {
    insert.run(
      b.name,
      b.category,
      b.description,
      b.city,
      b.region,
      b.owner_email
    );
  } catch (err) {
    console.error("❌ Insert failed:", err.message);
  }
}

console.log("✅ Demo businesses seeded successfully");
