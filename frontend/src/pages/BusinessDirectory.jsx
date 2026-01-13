import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BusinessCard from "../components/BusinessCard";

const API_URL = "http://localhost:4000";

const demoBusiness = {
  id: "demo-1",
  name: "BrightSpark Electrical",
  category: "Electrician",
  city: "George, WC",
  services: ["Residential", "Solar", "COC"],
  description:
    "Certified electricians offering residential, solar, and compliance services.",
};

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("q") || "";

  useEffect(() => {
    async function fetchDirectory() {
      try {
        const query = search ? `?q=${encodeURIComponent(search)}` : "";
        const res = await fetch(`${API_URL}/directory${query}`);
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load directory", err);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDirectory();
  }, [search]);

  const displayBusinesses =
    !loading && businesses.length === 0 ? [demoBusiness] : businesses;

  return (
    <div className="app-main directory-page">
      {/* HERO */}
      <section className="directory-hero">
        <div className="directory-hero-left">
          <h1 className="directory-title">Business Directory</h1>
          <p className="directory-subtitle">
            Find trusted trades and businesses near you
          </p>
        </div>

        <div className="directory-hero-center">
          <input
            type="text"
            className="directory-search"
            placeholder="Search by name, trade, or location..."
            value={search}
            onChange={(e) =>
              setSearchParams(e.target.value ? { q: e.target.value } : {})
            }
          />
        </div>

        <div className="directory-hero-right">
          {!loading && businesses.length === 0 && (
            <div className="directory-empty-text">
              <strong>No businesses found.</strong>
              <span>
                Showing an example listing below. Real businesses will appear
                here once they join.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className="directory-results">
        {loading && <p className="directory-loading">Loading directory…</p>}

        {!loading &&
          displayBusinesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
      </section>
    </div>
  );
}
