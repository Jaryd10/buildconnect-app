import { useState } from "react";

const LISTINGS = [
  {
    id: "1",
    title: "Electrical Tools Bundle",
    category: "Tools",
    location: "George, WC",
    price: "R2,500",
    description: "Assorted electrical tools in good condition.",
  },
  {
    id: "2",
    title: "Building Sand (6m³)",
    category: "Materials",
    location: "Mossel Bay",
    price: "R1,200",
    description: "Clean building sand, delivery available.",
  },
];

export default function Marketplace() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="app-main marketplace-page">
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          Marketplace
        </h1>

        <p className="marketplace-text" style={{ marginTop: 4 }}>
          Buy and sell tools, materials, and services
        </p>

        <input
          placeholder="Search listings..."
          style={{
            width: "100%",
            padding: 12,
            margin: "24px 0",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />

        {LISTINGS.map((item) => (
          <div
            key={item.id}
            className="marketplace-card"
            style={{
              padding: 20,
              marginBottom: 20,
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p className="marketplace-sub" style={{ margin: "4px 0" }}>
                  {item.category} • {item.location}
                </p>
              </div>

              <div style={{ fontWeight: 700 }}>
                {item.price}
              </div>
            </div>

            <p className="marketplace-text" style={{ marginTop: 12 }}>
              {item.description}
            </p>

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowModal(true)}
                style={{ marginRight: 10 }}
              >
                View
              </button>
              <button onClick={() => setShowModal(true)}>
                Contact Seller
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              color: "#111827",
              padding: 32,
              borderRadius: 16,
              maxWidth: 420,
              width: "90%",
              textAlign: "center",
            }}
          >
            <h2>Coming Soon</h2>
            <p style={{ marginTop: 12 }}>
              Marketplace listings and seller contact
              will be available closer to launch.
            </p>

            <button
              style={{ marginTop: 20 }}
              onClick={() => setShowModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

