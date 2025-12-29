import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [username, setUsernameState] = useState(null);
  const [publicMessages, setPublicMessages] = useState([]);

  // 🔹 Load username from localStorage on app start
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsernameState(savedUsername);
    }
  }, []);

  // 🔹 Save username to state + localStorage
  const setUsername = (name) => {
    setUsernameState(name);
    localStorage.setItem("username", name);
  };

  // 🔹 Logout helper (for later use)
  const logout = () => {
    setUsernameState(null);
    localStorage.removeItem("username");
  };

  // 🔹 Load public messages
  const loadPublicMessages = async () => {
    try {
      const res = await axios.get("http://localhost:4000/public");
      setPublicMessages(res.data);
    } catch (err) {
      console.error("Failed to load public messages", err);
    }
  };

  // 🔹 Send public message
  const sendPublicMessage = async (text) => {
    if (!username || !text.trim()) return;

    try {
      await axios.post("http://localhost:4000/public", {
        sender: username,
        message: text,
      });
      await loadPublicMessages();
    } catch (err) {
      console.error("Failed to send public message", err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        username,
        setUsername,
        logout,
        publicMessages,
        loadPublicMessages,
        sendPublicMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
};

