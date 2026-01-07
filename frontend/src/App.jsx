import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import AppHeader from "./components/AppHeader";
import PublicChat from "./components/PublicChat";
import "./styles/layout.css";

export default function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <>
      <AppHeader theme={theme} setTheme={setTheme} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<PublicChat />} />
        </Routes>
      </main>
    </>
  );
}
