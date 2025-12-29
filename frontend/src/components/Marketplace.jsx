import { useEffect, useState } from "react";
import "../styles/marketplace.css";

export default function Marketplace({ currentUser }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [form, setForm] = useState({
    type: "Item",
    title: "",
    description: "",
    price: "",
    location: "",
    image: ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch("http://localhost:4000/api/marketplace");
    const data = await res.json();
    setItems(data.reverse());
  };

  const postItem = async () => {
    if (!form.title || !form.location) return alert("Title & location required");

    await fetch("http://localhost:4000/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, owner: currentUser })
    });

    setForm({
      type: "Item",
      title: "",
      description: "",
      price: "",
      location: "",
      image: ""
    });

    fetchItems();
  };

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) &&
    i.location.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="marketplace-container">
      <h2>Marketplace</h2>

      {/* SEARCH */}
      <div className="marketplace-search">
        <input placeholder="Search item..." onChange={e => setSearch(e.target.value)} />
        <input placeholder="Location..." onChange={e => setLocation(e.target.value)} />
      </div>

      {/* POST */}
      <div className="marketplace-form">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option>Item</option>
          <option>Service</option>
        </select>

        <input placeholder="Title" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} />

        <input placeholder="Location" value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })} />

        <input placeholder="Price (optional)" value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })} />

        <input placeholder="Image URL (optional)"
          value={form.image}
          onChange={e => setForm({ ...form, image: e.target.value })} />

        {form.image && <img src={form.image} className="preview" />}

        <textarea placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })} />

        <button onClick={postItem}>Post Listing</button>
      </div>

      {/* LISTINGS */}
      <div className="marketplace-grid">
        {filtered.map(item => (
          <div className="marketplace-card" key={item.id}>
            {item.image && <img src={item.image} />}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span>{item.location}</span>
            {item.price && <strong>R {item.price}</strong>}
            <small>By {item.owner}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
