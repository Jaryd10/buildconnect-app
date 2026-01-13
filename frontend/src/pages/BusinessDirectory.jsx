import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function BusinessDirectory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryParam = searchParams.get("category");
  const cityParam = searchParams.get("city");

  // Fetch directory from backend
  useEffect(() => {
    async function fetchDirectory() {
      try {
        const res = await fetch("http://localhost:4000/directory");
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid directory response");
        }

        setBusinesses(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load directory");
      } finally {
        setLoading(false);
      }
    }

    fetchDirectory();
  }, []);

  // Auto-filter ONLY if URL params exist
  useEffect(() => {
    if (!categoryParam && !cityParam) return;

    let results = businesses;

    if (categoryParam) {
      results = results.filter(b =>
        b.category?.toLowerCase() === categoryParam.toLowerCase()
      );
    }

    if (cityParam) {
      results = results.filter(b =>
        b.city?.toLowerCase().includes(cityParam.toLowerCase())
      );
    }

    setFiltered(results);
  }, [categoryParam, cityParam, businesses]);

  // Manual search
  useEffect(() => {
    if (!search) {
      setFiltered(businesses);
      return;
    }

    const q = search.toLowerCase();
    setFiltered(
      businesses.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      )
    );
  }, [search, businesses]);

  if (loading) {
    return <div className="app-main directory-page">Loading directory…</div>;
  }

  if (error) {
    return <div className="app-main directory-page">{error}</div>;
  }

  return (
    <div className="app-main directory-page">
      <h1>Business Directory</h1>
      <p className="directory-sub">
        Find trusted trades and businesses near you
      </p>

      <input
        className="directory-search"
        placeholder="Search by name, trade, or location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <p className="directory-sub">No businesses found.</p>
      )}

      {filtered.map((biz) => (
        <div key={biz.id} className="directory-card">
          <div className="directory-avatar">
            {biz.name?.charAt(0)}
          </div>

          <div className="directory-info">
            <h3>{biz.name}</h3>
            <p className="directory-sub">
              {biz.category} • {biz.city}
            </p>
            <p>{biz.description}</p>

            <div className="directory-actions">
              <button
                onClick={() =>
                  navigate(`/profile/${biz.owner_username || ""}`)
                }
              >
                View Profile
              </button>

              <button
                onClick={() =>
                  navigate(`/messages?user=${biz.owner_username || ""}`)
                }
              >
                Message
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
