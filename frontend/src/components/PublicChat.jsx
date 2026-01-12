import { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";
import "../styles/chat.css";
import { Link } from "react-router-dom";

const EMOJIS = [
  "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊",
  "😍","😘","😗","😙","😚","🙂","🤗","🤔","😐","😑",
  "😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫",
  "😴","😌","😛","😜","😝","🤤","😒","😓","😔","😕",
  "🙃","🤑","😲","☹️","🙁","😖","😞","😟","😤","😢",
  "😭","😦","😧","😨","😩","😬","😰","😱","😳","🤪",
  "😵","😡","😠","🤬","😷","🤒","🤕","🤢","🤮","🤧",
  "😇","🤠","🤡","🤥","🤫","🤭","🫣","🫠","🫡","💯",
  "❤️","🔥","👍","👎","🙏","👏","🎉"
];

export default function PublicChat() {
  const { socket } = useSocket();
  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);

  const [hoveredId, setHoveredId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onEdit = ({ id, text }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, text, edited: true } : m
        )
      );
    };

    socket.on("publicMessage", onMessage);
    socket.on("publicEdit", onEdit);

    return () => {
      socket.off("publicMessage", onMessage);
      socket.off("publicEdit", onEdit);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket) return;
    if (!message.trim() && !file) return;

    const username = user?.username || "Anonymous";

    const payload = {
      id: crypto.randomUUID(),
      user: username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}&background=0D8ABC&color=fff`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (message.trim()) payload.text = message;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("publicMessage", {
          ...payload,
          file: {
            name: file.name,
            type: file.type,
            data: reader.result,
          },
        });
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit("publicMessage", payload);
    }

    setMessage("");
    setFile(null);
    setShowEmojis(false);
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditText(m.text || "");
  };

  const saveEdit = (id) => {
    socket.emit("publicEdit", { id, text: editText });
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className="message"
            onMouseEnter={() => setHoveredId(m.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="message-header">
              {/* ✅ AVATAR → PROFILE */}
              <Link to={`/profile/${m.user}`}>
                <img src={m.avatar} alt="avatar" className="avatar" />
              </Link>

              {/* ✅ USERNAME → PROFILE */}
              <Link to={`/profile/${m.user}`} className="username">
                {m.user}
              </Link>

              {m.user === user?.username && hoveredId === m.id && (
                <span className="message-actions">
                  <span onClick={() => startEdit(m)}>✏️</span>
                </span>
              )}
            </div>

            {editingId === m.id ? (
              <div className="edit-box">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && saveEdit(m.id)
                  }
                  autoFocus
                />
                <button onClick={() => saveEdit(m.id)}>Save</button>
              </div>
            ) : (
              m.text && (
                <div className="message-text">
                  {m.text} {m.edited && <em>(edited)</em>}
                </div>
              )
            )}

            {m.file &&
              (m.file.type.startsWith("image/") ? (
                <img src={m.file.data} alt="" className="chat-image" />
              ) : (
                <a href={m.file.data} download={m.file.name}>
                  📎 {m.file.name}
                </a>
              ))}

            <div className="time">{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showEmojis && (
        <div className="emoji-panel">
          {EMOJIS.map((e) => (
            <span key={e} onClick={() => setMessage((m) => m + e)}>
              {e}
            </span>
          ))}
        </div>
      )}

      <div className="chat-input-bar">
        <button onClick={() => setShowEmojis(!showEmojis)}>😊</button>

        <label className="file-btn">
          📎
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <input
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
