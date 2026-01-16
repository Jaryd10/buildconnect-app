import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import api from "../api/api";
import "./DirectMessages.css";

export default function DirectMessages() {
  const [searchParams] = useSearchParams();
  const preselectUser = searchParams.get("user");

  const { socket } = useSocket();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);

  const myName = localStorage.getItem("username") || "Me";

  /* Preselect user from URL */
  useEffect(() => {
    if (preselectUser) setSelectedUser(preselectUser);
  }, [preselectUser]);

  /* Load DM history */
  useEffect(() => {
    if (!selectedUser) return;

    api
      .get("/messages", {
        params: { userA: myName, userB: selectedUser }
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        }
      })
      .catch(() => {});
  }, [selectedUser, myName]);

  /* Receive live DM */
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (
        (msg.from === myName && msg.to === selectedUser) ||
        (msg.from === selectedUser && msg.to === myName)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("directMessage", handler);
    return () => socket.off("directMessage", handler);
  }, [socket, selectedUser, myName]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
  const text = message.trim();
  if (!text || !selectedUser || !socket) return;

  const msg = {
    id: crypto.randomUUID(),
    from: myName,
    to: selectedUser,
    text
  };

  // 1️⃣ Send to backend
  socket.emit("directMessage", msg);

  // 2️⃣ IMMEDIATELY show it in UI (this was missing)
  setMessages(prev => [...prev, msg]);

  setMessage("");
};


  return (
    <div className="dm-container">
      {/* Sidebar */}
      <aside className="dm-sidebar">
        <h3>Messages</h3>
        {["John", "Jay"].map((user) => (
          <button
            key={user}
            className={`dm-user ${selectedUser === user ? "active" : ""}`}
            onClick={() => setSelectedUser(user)}
          >
            {user}
          </button>
        ))}
      </aside>

      {/* Chat */}
      <section className="dm-chat">
        {!selectedUser ? (
          <div className="dm-empty">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            <header className="dm-header">
              Conversation with {selectedUser}
            </header>

            <div className="dm-messages">
              {messages.length === 0 && (
                <div className="dm-no-messages">No messages yet</div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`dm-bubble ${
                    m.from === myName ? "me" : "them"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="dm-input">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message…"
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
