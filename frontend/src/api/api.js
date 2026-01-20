import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:4000/api"
      : "https://buildconnect-app.onrender.com/api",
  withCredentials: false,
});

export default api;
