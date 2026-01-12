import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const MOCK_CONVERSATIONS = [
  {
    id: "1",
    user: "John",
    lastMessage: "Hey, are you available this week?",
  },
  {
    id: "2",
    user: "Jay",
    lastMessage: "Thanks, I’ll confirm shortly.",
  },
];

const MOCK_MESSAGES = {
  John: [
    { from: "John", text: "Hey, are you available this week?" },
    { from: "Me", text: "Yes, I should be." },
  ],
  Jay: [
    { from: "Jay", text: "Can you send a quote?" },
    { from: "Me", text: "Sure, will do." },
  ],
};

export default function DirectMessages() {
  const [searchParams] = useSearchParams();
  const preselectUser = searchParams.get("user");

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (preselectUser) {
      setSelectedUser(preselectUser);
    }
  }, [preselectUser]);

  const messages = selectedUser
    ? MOCK_MESSAGES[selectedUser] || []
    : [];

  return (
    <div className="app-main dm-page">
      {/* Conversations list */}
      <div className="dm-list">
        <h3 className="dm-title">Messages</h3>

        {MOCK_CONVERSATIONS.map((c) => (
          <div
            key={c.id}
            className={`dm-conversation ${
              selectedUser === c.user ? "active" : ""
            }`}
            onClick={() => setSelectedUser(c.user)}
          >
            <strong>{c.user}</strong>
            <p className="dm-sub">{c.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Conversation panel */}
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
                    m.from === "Me" ? "me" : "them"
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
              />
              <button disabled>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
