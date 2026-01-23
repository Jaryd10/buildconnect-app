import { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import api from "../api/api";
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
  const [showEmojis, setShowEmojis] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef(null);

  /* =========================
     Load persisted messages
  ========================= */
  useEffect(() => {
    api.get("/public")
      .then(res => {
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        }
      })
      .catch(console.error);
  }, []);

  /* =========================
     Socket listeners
  ========================= */
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on("publicMessage", onMessage);
    return () => socket.off("publicMessage", onMessage);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     File selection + upload
  ========================= */
  const handleFileSelect = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadedFile({
        url: res.data.url,
        type: res.data.type,
        name: res.data.name,
      });
    } catch (err) {
      alert("Upload failed");
      console.error(err);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     Send message
  ========================= */
  const sendMessage = () => {
    if (!socket) return;
    if (!message.trim() && !uploadedFile) return;
    if (uploading) return;

    const username = user?.username || "Anonymous";

    const payload = {
      id: crypto.randomUUID(),
      user: username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: message || null,
      file: uploadedFile || null,
    };

    socket.emit("publicMessage", payload);

    setMessage("");
    setSelectedFile(null);
    setUploadedFile(null);
    setShowEmojis(false);
  };

  return (
    <div className="chat-container">

      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className="message">
            <div className="message-header">
              <Link to={`/profile/${m.user}`}>
                <img src={m.avatar} className="avatar" />
              </Link>
              <Link to={`/profile/${m.user}`} className="username">
                {m.user}
              </Link>
            </div>

            {m.text && <div className="message-text">{m.text}</div>}

            {m.file?.type === "image" && (
              <img src={m.file.url} className="chat-image" />
            )}

            {m.file?.type === "video" && (
              <video controls className="chat-video">
                <source src={m.file.url} />
              </video>
            )}

            <div className="time">{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Inline preview BEFORE sending */}
      {selectedFile && (
        <div className="file-preview">
          {selectedFile.type.startsWith("image/") && (
            <img
              src={URL.createObjectURL(selectedFile)}
              className="preview-image"
            />
          )}

          {selectedFile.type.startsWith("video/") && (
            <video className="preview-video" controls>
              <source src={URL.createObjectURL(selectedFile)} />
            </video>
          )}

          {!selectedFile.type.startsWith("image/") &&
           !selectedFile.type.startsWith("video/") && (
            <span>📎 {selectedFile.name}</span>
          )}

          <button onClick={() => {
            setSelectedFile(null);
            setUploadedFile(null);
          }}>
            ✖
          </button>
        </div>
      )}

      {showEmojis && (
        <div className="emoji-panel">
          {EMOJIS.map(e => (
            <span key={e} onClick={() => setMessage(m => m + e)}>
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
            accept="image/*,video/*"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </label>

        <input
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage} disabled={uploading}>
          {uploading ? "Uploading…" : "Send"}
        </button>
      </div>
    </div>
  );
}
