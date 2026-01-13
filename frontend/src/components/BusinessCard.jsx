import "./BusinessCard.css";

export default function BusinessCard({ business }) {
  return (
    <div className="business-card">
      <div className="business-card-header">
        <div className="business-avatar">
          {business.name.charAt(0)}
        </div>

        <div className="business-meta">
          <h3>{business.name}</h3>
          <p className="business-sub">
            {business.category} • {business.city}
          </p>
        </div>
      </div>

      <p className="business-bio">
        {business.bio || "Trusted local professional serving the area."}
      </p>

      <div className="business-tags">
        {(business.services || []).slice(0, 3).map((service, i) => (
          <span key={i}>{service}</span>
        ))}
      </div>

      <div className="business-actions">
        <button className="btn-secondary">View Profile</button>
        <button className="btn-primary">Contact</button>
      </div>
    </div>
  );
}
