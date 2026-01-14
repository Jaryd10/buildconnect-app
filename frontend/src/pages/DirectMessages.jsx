import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./DirectMessages.css";

const API_URL = "http://localhost:4000";

export default function DirectMessages() {
  const [searchParams] = useSearchParams();
  const preselectUser = searchParams.get("user");

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const myName = localStorage.getItem("username") || "Me";
  const bottomRef = useRef(null);

  /* Preselect user from URL */
  useEffect(() => {
    if (preselectUser) setSelectedUser(preselectUser);
  }, [preselectUser]);

  /* Initial load */
  useEffect(() => {
    if (!selectedUser) return;

    fetch(
      `${API_URL}/messages?userA=${encodeURIComponent(
        myName
      )}&userB=${encodeURIComponent(selectedUser)}`
    )
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setMessages(data))
      .catch(() => {});
  }, [selectedUser, myName]);

  /* Polling */
  useEffect(() => {
    if (!selectedUser) return;

    const interval = setInterval(() => {
      fetch(
        `${API_URL}/messages?userA=${encodeURIComponent(
          myName
        )}&userB=${encodeURIComponent(selectedUser)}`
      )
        .then((res) => res.json())
        .then((data) => Array.isArray(data) && setMessages(data))
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedUser, myName]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedUser || sending) return;

    setSending(true);

    await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: myName,
        to: selectedUser,
        text,
      }),
    });

    setMessage("");
    setSending(false);
  };

  return (
    <div className="dm-container">
      {/* Conversations */}
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
                <div className="dm-no-messages">
                  No messages yet
                </div>
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
                disabled={sending}
              />
              <button onClick={sendMessage} disabled={sending}>
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
