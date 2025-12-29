import { useEffect, useState } from "react";
import socket from "../api/socket";
import "../styles/chat.css";

export default function PublicChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socket.on("public_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("public_message");
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("public_message", { user: "Jay", text });
    setText("");
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className="message">
            <strong>{m.user}:</strong> {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

