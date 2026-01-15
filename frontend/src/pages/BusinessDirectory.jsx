import { useEffect, useState } from "react";
import api from "../api/api";
import BusinessCard from "../components/BusinessCard";

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDirectory() {
      try {
        const res = await api.get("/api/directory");

        if (isMounted) {
          setBusinesses(res.data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load directory", err);
        if (isMounted) {
          setError("Failed to load directory");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDirectory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="directory-page">
      <h1 className="directory-title">Business Directory</h1>
      <p className="directory-subtitle">
        Find trusted trades and businesses near you
      </p>

      <input
        className="directory-search"
        placeholder="Search by name, trade, or location..."
        disabled
      />

      {loading && <p className="directory-status">Loading businesses…</p>}

      {error && <p className="directory-status error">{error}</p>}

      {!loading && !error && businesses.length === 0 && (
        <p className="directory-status">
          No businesses found. Try again later.
        </p>
      )}

      <div className="directory-grid">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} />
        ))}
      </div>
    </div>
  );
}
