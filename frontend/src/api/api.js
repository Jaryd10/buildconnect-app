import { io } from "socket.io-client";

export const socket = io("http://localhost:4000");

// Join as a demo user for now
socket.emit("join", "You");

export async function getPublicMessages() {
  const res = await fetch("http://localhost:4000/api/messages/public");
  return res.json();
}

export async function sendPublicMessage(content) {
  await fetch("http://localhost:4000/api/messages/public", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "You",
      content,
    }),
  });
}

