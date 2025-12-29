import { useParams, useNavigate } from "react-router-dom";

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

export default function BusinessProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const business = BUSINESSES.find((b) => b.id === id);

  if (!business) {
    return (
      <div>
        <h2>Business not found</h2>
        <button onClick={() => navigate("/directory")}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h1>{business.name}</h1>
      <p>
        <strong>{business.trade}</strong> • {business.location}
      </p>
      <p>{business.description}</p>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/dm")}>Message</button>
        <button
          style={{ marginLeft: 10 }}
          onClick={() => navigate("/directory")}
        >
          Back to Directory
        </button>
      </div>
    </div>
  );
}

