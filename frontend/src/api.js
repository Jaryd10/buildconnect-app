const API_BASE = "http://localhost:4000";

export async function getPublicMessages() {
  const res = await fetch(`${API_BASE}/api/messages/public`);
  if (!res.ok) {
    throw new Error("Failed to load public messages");
  }
  return res.json();
}

export async function sendPublicMessage(text) {
  const res = await fetch(`${API_BASE}/api/messages/public`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: "Demo User",
      text,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send public message");
  }

  return res.json();
}

