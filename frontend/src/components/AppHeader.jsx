import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./../styles/layout.css";

export default function AppHeader({ theme, setTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <div
        className="app-header-left"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img
          src="/src/assets/buildconnect-logo.png"
          alt="BuildConnect Logo"
          className="app-logo"
        />
        <span className="app-title">BuildConnect</span>
      </div>

      <nav className="app-nav">
        <button
          className={`nav-btn ${isActive("/") ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          Public
        </button>

        <button
          className={`nav-btn ${isActive("/directory") ? "active" : ""}`}
          onClick={() => navigate("/directory")}
        >
          Directory
        </button>

        <button
          className={`nav-btn ${isActive("/marketplace") ? "active" : ""}`}
          onClick={() => navigate("/marketplace")}
        >
          Marketplace
        </button>

        <button
          className={`nav-btn ${isActive("/messages") ? "active" : ""}`}
          onClick={() => navigate("/messages")}
        >
          Messages
        </button>
      </nav>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? "🌙" : "☀️"}
      </button>
    </header>
  );
}
