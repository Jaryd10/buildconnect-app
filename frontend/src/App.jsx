import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Profile from "./pages/Profile";


import AppHeader from "./components/AppHeader";
import PublicChat from "./components/PublicChat";

import BusinessDirectory from "./pages/BusinessDirectory";
import Marketplace from "./pages/Marketplace";
import DirectMessages from "./pages/DirectMessages";

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
          <Route path="/directory" element={<BusinessDirectory />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/messages" element={<DirectMessages />} />
        </Routes>
      </main>
    </>
  );
}
