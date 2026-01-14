import { io } from "socket.io-client";

/**
 * Backend base URL
 * - Local dev: http://localhost:4000
 * - Production (Render): https://buildconnect-app.onrender.com
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ---------------- SOCKET ---------------- */

export const socket = io(API_BASE_URL, {
  transports: ["websocket"],
});

// Join as a demo user for now
socket.emit("join", "You");

/* ---------------- API ---------------- */

export async function getPublicMessages() {
  const res = await fetch(`${API_BASE_URL}/api/messages/public`);
  return res.json();
}

export async function sendPublicMessage(content) {
  await fetch(`${API_BASE_URL}/api/messages/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "You",
      content,
    }),
  });
}
