import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim()) return;

    localStorage.setItem("username", username);
    navigate("/public");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Choose a username</h2>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your name"
      />

      <br /><br />

      <button onClick={handleLogin}>Continue</button>
    </div>
  );
}

