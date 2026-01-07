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

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("publicMessage", handler);
    return () => socket.off("publicMessage", handler);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket) return;
    if (!message.trim() && !file) return;

    const payload = {
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

  return (
    <div className="chat-container">
      <h1>Public Chat</h1>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className="message">
            <strong>{m.user}</strong>
            {m.text && <div>{m.text}</div>}
            {m.file && (
              m.file.type.startsWith("image/")
                ? <img src={m.file.data} alt="" className="chat-image" />
                : <a href={m.file.data} download={m.file.name}>
                    📎 {m.file.name}
                  </a>
            )}
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
