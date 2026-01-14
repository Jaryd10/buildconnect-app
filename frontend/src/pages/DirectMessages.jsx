import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:4000";

export default function DirectMessages() {
  const [searchParams] = useSearchParams();
  const preselectUser = searchParams.get("user");

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const myName = localStorage.getItem("username") || "Me";

  useEffect(() => {
    if (preselectUser) {
      setSelectedUser(preselectUser);
    }
  }, [preselectUser]);

  useEffect(() => {
    if (!selectedUser) return;

    fetch(
      `${API_URL}/messages?userA=${encodeURIComponent(
        myName
      )}&userB=${encodeURIComponent(selectedUser)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(console.error);
  }, [selectedUser, myName]);
useEffect(() => {
  if (!selectedUser) return;

  const interval = setInterval(() => {
    fetch(
      `${API_URL}/messages?userA=${encodeURIComponent(
        myName
      )}&userB=${encodeURIComponent(selectedUser)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(() => {});
  }, 3000); // every 3 seconds

  return () => clearInterval(interval);
}, [selectedUser, myName]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedUser || sending) return;

    setSending(true);

    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: myName,
          to: selectedUser,
          text,
        }),
      });

      if (!res.ok) {
        console.error("Message send failed");
        return;
      }

      setMessage("");

      const refreshed = await fetch(
        `${API_URL}/messages?userA=${encodeURIComponent(
          myName
        )}&userB=${encodeURIComponent(selectedUser)}`
      );

      const data = await refreshed.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-main dm-page" style={{ display: "flex", gap: 24 }}>
      {/* Conversations */}
      <div className="dm-list">
        <h3 className="dm-title">Messages</h3>

        {["John", "Jay"].map((user) => (
          <div
            key={user}
            className={`dm-conversation ${
              selectedUser === user ? "active" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <strong>{user}</strong>
          </div>
        ))}
      </div>

      {/* Conversation */}
      <div className="dm-panel">
        {!selectedUser ? (
          <div className="dm-placeholder">
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <h3 className="dm-title">
              Conversation with {selectedUser}
            </h3>

            <div className="dm-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`dm-message ${
                    m.from === myName ? "me" : "them"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="dm-input-row">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
              />
              <button onClick={sendMessage} disabled={sending}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
