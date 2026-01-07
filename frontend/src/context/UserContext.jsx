import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let username = localStorage.getItem("username");

    if (!username) {
      username = prompt("Enter your username");
      if (!username) username = "Guest";
      localStorage.setItem("username", username);
    }

    setUser({ username });
  }, []);

  if (!user) {
    return <div style={{ padding: 20 }}>Loading user...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
