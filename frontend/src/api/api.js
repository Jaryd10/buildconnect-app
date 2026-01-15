import axios from "axios";

/**
 * Central Axios instance for BuildConnect
 * Backend: Render
 * Base URL locked and verified
 */
const api = axios.create({
  baseURL: "https://buildconnect-app.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Optional response interceptor (safe + clean)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API ERROR]", error?.response || error);
    return Promise.reject(error);
  }
);

export default api;
