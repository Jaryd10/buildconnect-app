import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    s.on("connect", () => {
      console.log("🟢 Socket connected:", s.id);
      setSocket(s);
    });

    s.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setSocket(null);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return ctx;
}
