import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import api from "./api/api";


import App from "./App";
import { SocketProvider } from "./context/SocketContext";
import { UserProvider } from "./context/UserContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
