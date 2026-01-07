import { useState } from "react";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [name, setName] = useState("");
  const { login } = useUser();

  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome to BuildConnect</h2>
      <input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={() => name.trim() && login(name.trim())}
        style={{ marginLeft: 10 }}
      >
        Continue
      </button>
    </div>
  );
}
