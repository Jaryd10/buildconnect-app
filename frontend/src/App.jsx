import { Routes, Route } from "react-router-dom";
import PublicChat from "./components/PublicChat";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicChat />} />
    </Routes>
  );
}
