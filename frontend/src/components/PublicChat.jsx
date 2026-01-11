import { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";
import "../styles/chat.css";

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

  /* =====================
     SOCKET LISTENERS
     ===================== */

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      setMessages((prev) => [
        ...prev,
        { id: msg.id || crypto.randomUUID(), ...msg },
      ]);
    };

    const onEdit = ({ id, text }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, text, edited: true } : m
        )
      );
    };

    const onDelete = ({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    socket.on("publicMessage", onMessage);
    socket.on("publicEdit", onEdit);
    socket.on("publicDelete", onDelete);

    return () => {
      socket.off("publicMessage", onMessage);
      socket.off("publicEdit", onEdit);
      socket.off("publicDelete", onDelete);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =====================
     SEND MESSAGE
     ===================== */

  const sendMessage = () => {
    if (!socket) return;
    if (!message.trim() && !file) return;

    const payload = {
      id: crypto.randomUUID(),
      user: user?.username || "Anonymous",
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

  /* =====================
     EDIT / DELETE
     ===================== */

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditText(m.text || "");
  };

  const saveEdit = (id) => {
    socket.emit("publicEdit", { id, text: editText });
    setEditingId(null);
    setEditText("");
  };

  const deleteMessage = (id) => {
    if (!window.confirm("Delete this message?")) return;
    socket.emit("publicDelete", { id });
  };

  /* =====================
     RENDER
     ===================== */

  return (
    <div className="chat-container">
      <h1>Public Chat</h1>

      <div className="messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className="message"
            onMouseEnter={() => setHoveredId(m.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="message-header">
              <strong>{m.user}</strong>

              {m.user === user?.username && hoveredId === m.id && (
                <span className="message-actions">
                  <span onClick={() => startEdit(m)}>✏️</span>
                  <span onClick={() => deleteMessage(m.id)}>🗑</span>
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
                <div>
                  {m.text} {m.edited && <em>(edited)</em>}
                </div>
              )
            )}

            {m.file &&
              (m.file.type.startsWith("image/") ? (
                <img
                  src={m.file.data}
                  alt=""
                  className="chat-image"
                />
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
