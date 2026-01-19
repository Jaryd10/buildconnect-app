import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";
import EmojiPicker from "emoji-picker-react";
import "./DirectMessages.css";

export default function DirectMessages() {
  const navigate = useNavigate();
  const { id } = useParams(); // conversation/user id
  const { socket } = useSocket(); // ✅ CORRECT socket usage
  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const bottomRef = useRef(null);

  /* --- Load messages (mock / existing backend) --- */
  useEffect(() => {
    // keep safe fallback
    setMessages([]);
  }, [id]);

  /* --- Socket listeners --- */
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("direct_message", handleIncoming);

    return () => {
      socket.off("direct_message", handleIncoming);
    };
  }, [socket]);

  /* --- Auto scroll --- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* --- Send message --- */
  const sendMessage = () => {
    if (!text.trim() || !socket) return;

    const msg = {
      from: user.id,
      to: id,
      text,
      timestamp: Date.now(),
    };

    socket.emit("direct_message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
    setShowEmoji(false);
  };

  return (
    <div className="dm-page">
      {/* Header */}
      <div className="dm-header">
        <button className="dm-back" onClick={() => navigate("/public")}>
          ←
        </button>
        <span className="dm-name">John</span>
      </div>

      {/* Messages */}
      <div className="dm-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`dm-bubble ${
              m.from === user.id ? "sent" : "received"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="dm-input-bar">
        <button
          className="dm-emoji-btn"
          onClick={() => setShowEmoji((v) => !v)}
        >
          😊
        </button>

        <input
          className="dm-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button className="dm-send-btn" onClick={sendMessage}>
          Send
        </button>

        {showEmoji && (
          <div className="dm-emoji-picker">
            <EmojiPicker
              theme="dark"
              onEmojiClick={(e) => setText((t) => t + e.emoji)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
