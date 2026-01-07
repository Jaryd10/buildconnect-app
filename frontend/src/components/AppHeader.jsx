import React from "react";
import "./../styles/layout.css";

export default function AppHeader({ theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        <img
          src="/src/assets/buildconnect-logo.png"
          alt="BuildConnect Logo"
          className="app-logo"
        />
        <span className="app-title">BuildConnect</span>
      </div>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>
  );
}
