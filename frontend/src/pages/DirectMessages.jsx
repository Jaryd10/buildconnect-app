
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useUser } from "../context/UserContext";
import EmojiPicker from "emoji-picker-react";
import "./DirectMessages.css";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

export default function DirectMessages() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { socket } = useSocket();
  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([]);
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("direct_message", handleIncoming);
    return () => socket.off("direct_message", handleIncoming);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- Attachments ---------- */

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setAttachment({
      file,
      url,
      type: file.type,
      name: file.name,
      size: Math.round(file.size / 1024) + " KB"
    });
  };

  /* ---------- Send ---------- */

  const sendMessage = () => {
    if (!socket || (!text.trim() && !attachment)) return;

    const msg = {
      from: user.id,
      to: id,
      text,
      attachment,
      reactions: {},
      timestamp: Date.now()
    };

    socket.emit("direct_message", msg);
    setMessages((prev) => [...prev, msg]);

    setText("");
    setAttachment(null);
    setShowEmoji(false);
  };

  /* ---------- Editing ---------- */

  const startEdit = (index, currentText) => {
    setEditingIndex(index);
    setEditText(currentText);
  };

  const saveEdit = (index) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, text: editText, edited: true } : m
      )
    );
    setEditingIndex(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  /* ---------- Reactions ---------- */

  const toggleReaction = (index, emoji) => {
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;

        const reactions = { ...(m.reactions || {}) };
        const users = reactions[emoji] || [];

        if (users.includes(user.id)) {
          reactions[emoji] = users.filter((u) => u !== user.id);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...users, user.id];
        }

        return { ...m, reactions };
      })
    );
  };

  /* ---------- Render helpers ---------- */

  const renderAttachment = (att) => {
    if (!att) return null;

    if (att.type.startsWith("image/")) {
      return <img src={att.url} alt="" className="dm-media" />;
    }

    if (att.type.startsWith("video/")) {
      return (
        <video controls className="dm-media">
          <source src={att.url} />
        </video>
      );
    }

    if (att.type === "application/pdf") {
      return <iframe src={att.url} title="PDF" className="dm-pdf" />;
    }

    return <div className="dm-file">📄 {att.name}</div>;
  };

  const renderReactions = (m, index) => {
    if (!m.reactions || Object.keys(m.reactions).length === 0) return null;

    return (
      <div className="dm-reactions">
        {Object.entries(m.reactions).map(([emoji, users]) => (
          <button
            key={emoji}
            className={`dm-reaction ${
              users.includes(user.id) ? "active" : ""
            }`}
            onClick={() => toggleReaction(index, emoji)}
          >
            {emoji} {users.length}
          </button>
        ))}
      </div>
    );
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
        {messages.map((m, i) => {
          const isOwn = m.from === user.id;
          const isEditing = editingIndex === i;

          return (
            <div
              key={i}
              className={`dm-bubble ${isOwn ? "sent" : "received"}`}
            >
              {isEditing ? (
                <>
                  <input
                    className="dm-edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(i);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                  />
                  <div className="dm-edit-actions">
                    <button onClick={() => saveEdit(i)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  {m.text && <div className="dm-text">{m.text}</div>}
                  {renderAttachment(m.attachment)}

                  {renderReactions(m, i)}

                  <div className="dm-reaction-bar">
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(i, emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {isOwn && (
                    <button
                      className="dm-edit-btn"
                      onClick={() => startEdit(i, m.text)}
                    >
                      ✏️
                    </button>
                  )}

                  {m.edited && (
                    <div className="dm-edited-label">edited</div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="dm-attachment-preview">
          {renderAttachment(attachment)}
          <button
            className="dm-remove-attachment"
            onClick={() => setAttachment(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="dm-input-bar">
        <button
          className="dm-emoji-btn"
          onClick={() => setShowEmoji((v) => !v)}
        >
          😊
        </button>

        <button
          className="dm-attach-btn"
          onClick={() => fileInputRef.current.click()}
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*,video/*,application/pdf"
          onChange={handleFileSelect}
        />

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
            <EmojiPicker onEmojiClick={(e) => setText((t) => t + e.emoji)} />
          </div>
        )}
      </div>
    </div>
  );
}
