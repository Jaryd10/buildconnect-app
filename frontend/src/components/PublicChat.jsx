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
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);

  const bottomRef = useRef(null);

  /* Load history */
  useEffect(() => {
    api.get("/public")
      .then(res => Array.isArray(res.data) && setMessages(res.data))
      .catch(console.error);
  }, []);

  /* Socket */
  useEffect(() => {
    if (!socket) return;
    socket.on("publicMessage", msg =>
      setMessages(prev => [...prev, msg])
    );
    return () => socket.off("publicMessage");
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Upload immediately */
  const handleFileSelect = async (file) => {
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setUploading(true);

    try {
      const res = await api.post("/upload", form, {
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
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = () => {
    if (!socket) return;
    if (!message.trim() && !uploadedFile) return;

    const payload = {
      id: crypto.randomUUID(),
      user: user?.username || "Anonymous",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.username || "Anonymous"
      )}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: message || null,
      file: uploadedFile || null,
    };

    socket.emit("publicMessage", payload);

    setMessage("");
    setUploadedFile(null);
    setShowEmojis(false);
  };

  return (
    <div className="chat-container">

      {uploading && <div className="uploading">Uploading…</div>}

      <div className="messages">
        {messages.map(m => (
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

      {showEmojis && (
        <div className="emoji-panel">
          {EMOJIS.map(e => (
            <span key={e} onClick={() => setMessage(m => m + e)}>{e}</span>
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
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage} disabled={uploading}>
          Send
        </button>
      </div>
    </div>
  );
}
