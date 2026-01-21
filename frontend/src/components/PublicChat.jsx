import { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";
import "../styles/chat.css";
import { Link } from "react-router-dom";
import api from "../api/api";

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

  /* =====================================================
     1️⃣ LOAD PERSISTED MESSAGES (DB)
     Runs ONCE on page load
  ===================================================== */
  useEffect(() => {
    let active = true;

    api.get("/public")
      .then((res) => {
        if (active && Array.isArray(res.data)) {
          setMessages(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load public messages", err);
      });

    return () => {
      active = false;
    };
  }, []);

  /* =====================================================
     2️⃣ SOCKET LIVE UPDATES (append only)
  ===================================================== */
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

  /* =====================================================
     AUTO SCROLL
  ===================================================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =====================================================
     SEND MESSAGE (text + file)
  ===================================================== */
  const sendMessage = () => {
    if (!socket) return;
    if (!message.trim() && !file) return;

    const username = user?.username || "Anonymous";

    const basePayload = {
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

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("publicMessage", {
          ...basePayload,
          text: message || null,
          file: {
            name: file.name,
            type: file.type,
            data: reader.result,
          },
        });
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit("publicMessage", {
        ...basePayload,
        text: message.trim(),
      });
    }

    setMessage("");
    setFile(null);
    setShowEmojis(false);
  };

  /* =====================================================
     EDIT HANDLERS
  ===================================================== */
  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText || "");
  };

  const saveEdit = (id) => {
    if (!socket || !editText.trim()) return;
    socket.emit("publicEdit", { id, text: editText });
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  /* =====================================================
     RENDER
  ===================================================== */
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
              <Link to={`/profile/${m.user}`}>
                <img src={m.avatar} alt="avatar" className="avatar" />
              </Link>

              <Link to={`/profile/${m.user}`} className="username">
                {m.user}
              </Link>

              {m.user === user?.username && hoveredId === m.id && (
                <span className="message-actions">
                  <span onClick={() => startEdit(m.id, m.text)}>✏️</span>
                </span>
              )}
            </div>

            {editingId === m.id ? (
              <div className="edit-box">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(m.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                />
                <button onClick={() => saveEdit(m.id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
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
