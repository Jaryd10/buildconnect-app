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
  const [file, setFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  /* Load history */
  useEffect(() => {
    api.get("/public")
      .then(res => Array.isArray(res.data) && setMessages(res.data))
      .catch(err => console.error(err));
  }, []);

  /* Live socket updates */
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

  const handleFileSelect = (f) => {
    setError("");
    if (!f) return;

    if (f.type.startsWith("video/")) {
      setError("Video uploads coming next.");
      return;
    }
    setFile(f);
  };

  const sendMessage = () => {
    if (!socket) return;
    if (!message.trim() && !file) return;

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
    };

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

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(m => (
          <div key={m.id} className="message">
            <div className="message-header">
              <Link to={`/profile/${m.user}`}>
                <img src={m.avatar} alt="" className="avatar" />
              </Link>
              <Link to={`/profile/${m.user}`} className="username">
                {m.user}
              </Link>
            </div>

            {m.text && <div className="message-text">{m.text}</div>}

            {m.file?.type?.startsWith("image/") && (
              <img src={m.file.data} className="chat-image" />
            )}

            <div className="time">{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ✅ SINGLE preview block (correct place) */}
      {file && (
        <div className="file-preview">
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="preview-image"
          />
          <button onClick={() => setFile(null)}>✖</button>
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

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
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </label>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
