import { useState } from "react";

const BUSINESSES = [
  {
    id: "1",
    name: "Jay Electrical",
    trade: "Electrical",
    location: "George, WC",
    description: "Residential and commercial electrical services.",
  },
  {
    id: "2",
    name: "BuildRight Construction",
    trade: "Construction",
    location: "Mossel Bay",
    description: "Boundary walls, renovations, and small builds.",
  },
];

export default function BusinessDirectory() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="app-main directory-page">
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          Business Directory
        </h1>

        <p
          className="directory-text"
          style={{ marginTop: 4 }}
        >
          Find trusted trades and businesses near you
        </p>

        <input
          placeholder="Search by name, trade, or location..."
          style={{
            width: "100%",
            padding: 12,
            margin: "24px 0",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />

        {BUSINESSES.map((b) => {
          const initials = b.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={b.id}
              className="directory-card"
              style={{
                display: "flex",
                gap: 16,
                padding: 20,
                marginBottom: 20,
                borderRadius: 16,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "#0284c7",
                  color: "#fff",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{b.name}</h3>

                <p
                  className="directory-sub"
                  style={{ margin: "4px 0" }}
                >
                  {b.trade} • {b.location}
                </p>

                <p className="directory-text" style={{ marginTop: 8 }}>
                  {b.description}
                </p>

                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => setShowModal(true)}
                    style={{ marginRight: 10 }}
                  >
                    View Profile
                  </button>
                  <button onClick={() => setShowModal(true)}>
                    Message
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
              Business profiles and direct messaging will be
              available closer to launch.
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
