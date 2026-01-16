import "./BusinessCard.css";

export default function BusinessCard({ business }) {
  if (!business) return null;

  const name = business.name || "Business";
  const avatarLetter = name.charAt(0).toUpperCase();

  return (
    <div className="business-card">
      <div className="business-card-header">
        <div className="business-avatar">
          {avatarLetter}
        </div>

        <div className="business-meta">
          <h3>{name}</h3>
          <p className="business-sub">
            {[business.category, business.city].filter(Boolean).join(" • ")}
          </p>
        </div>
      </div>

      <p className="business-bio">
        {business.description || "Local professional providing reliable services in your area."}
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
