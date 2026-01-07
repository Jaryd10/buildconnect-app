import { Outlet, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";

export default function Layout() {
  const { username, setUser } = useUser();

  // Ask once per browser if no username exists
  useEffect(() => {
    if (!username) {
      const name = prompt("Choose your username:");
      if (name && name.trim()) {
        setUser(name.trim());
      }
    }
  }, [username, setUser]);

  // Prevent rendering app before username is set
  if (!username) {
    return (
      <div style={{ color: "#fff", padding: 20 }}>
        Setting up your profile…
      </div>
    );
  }

  const linkStyle = {
    color: "#a855f7",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          padding: 20,
          background: "linear-gradient(180deg, #0b1220, #020617)",
          color: "#fff",
        }}
      >
        <h2>BuildConnect</h2>

        <div style={{ marginBottom: 16, opacity: 0.8 }}>
          Logged in as:
          <br />
          <strong>{username}</strong>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link to="/" style={linkStyle}>Public Chat</Link>
          <Link to="/dm" style={linkStyle}>Direct Messages</Link>
          <Link to="/marketplace" style={linkStyle}>Marketplace</Link>
          <Link to="/followers" style={linkStyle}>Followers</Link>
          <Link to="/businesses" style={linkStyle}>Businesses</Link>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
