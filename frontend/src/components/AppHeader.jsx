import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./../styles/layout.css";

export default function AppHeader({ theme, setTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showAiModal, setShowAiModal] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
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

          {/* 🤖 AI Assistant (Pro feature placeholder) */}
          <button
            className="nav-btn"
            onClick={() => setShowAiModal(true)}
          >
            🤖 AI Assistant
          </button>
        </nav>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </header>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div
          onClick={() => setShowAiModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              color: "#111827",
              padding: 32,
              borderRadius: 16,
              maxWidth: 420,
              width: "90%",
              textAlign: "center",
            }}
          >
            <h2>AI Assistant</h2>
            <p style={{ marginTop: 12 }}>
              The AI Assistant is a <strong>Pro feature</strong> and will be
              available with monthly or yearly subscriptions.
            </p>

            <p style={{ marginTop: 8, opacity: 0.8 }}>
              Coming soon 🚀
            </p>

            <button
              style={{ marginTop: 20 }}
              onClick={() => setShowAiModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
