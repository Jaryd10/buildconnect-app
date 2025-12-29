import { useEffect, useState, useRef } from "react";

const API = "http://localhost:4000";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("Jay");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);

  // load messages repeatedly (simple polling)
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadMessages() {
    try {
      const res = await fetch(`${API}/api/public`);
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error("Load failed");
    }
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!text && !file) return;

    let fileUrl = null;
    let fileType = null;

    // upload file first
    if (file) {
      const fd = new FormData();
      fd.append("file", file);

      const uploadRes = await fetch(`${API}/api/upload`, {
        method: "POST",
        body: fd,
      });

      const uploaded = await uploadRes.json();
      fileUrl = uploaded.url;
      fileType = uploaded.mimetype;
    }

    await fetch(`${API}/api/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: username,
        text,
        file: fileUrl,
        fileType,
      }),
    });

    setText("");
    setFile(null);
    loadMessages();
  }

  function renderMedia(msg) {
    if (!msg.file) return null;

    if (msg.fileType?.startsWith("image")) {
      return <img src={`${API}${msg.file}`} className="media" />;
    }

    if (msg.fileType?.startsWith("video")) {
      return (
        <video controls className="media">
          <source src={`${API}${msg.file}`} />
        </video>
      );
    }

    return (
      <a href={`${API}${msg.file}`} target="_blank">
        📎 Download file
      </a>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Public Chat</h1>
        <select value={username} onChange={e => setUsername(e.target.value)}>
          <option>Jay</option>
          <option>John</option>
        </select>
      </header>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.user === username ? "me" : ""}`}>
            <strong>{m.user}</strong>
            <p>{m.text}</p>
            {renderMedia(m)}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="input">
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
        />
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message..."
        />
        <button>Send</button>
      </form>
    </div>
  );
}
