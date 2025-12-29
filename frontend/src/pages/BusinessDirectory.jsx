import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Business Directory</h1>
      <p>Find trusted trades and businesses near you</p>

      <input
        placeholder="Search by name, trade, or location..."
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 24,
        }}
      />

      {BUSINESSES.map((b) => (
        <div
          key={b.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            background: "#ffffff",
            color: "#111827",
          }}
        >
          <h3>{b.name}</h3>
          <p>
            {b.trade} • {b.location}
          </p>
          <p>{b.description}</p>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => navigate(`/directory/${b.id}`)}
              style={{ marginRight: 10 }}
            >
              View Profile
            </button>
            <button onClick={() => navigate("/dm")}>Message</button>
          </div>
        </div>
      ))}
    </div>
  );
}

