import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/chat.css";

export default function DirectMessages() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/users").then(res => {
      setUsers(res.data);
    });
  }, []);

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {users.map(u => (
          <div key={u.username} className="bubble other">
            {u.username} {u.online ? "🟢" : "⚪"}
          </div>
        ))}
      </div>
    </div>
  );
}

