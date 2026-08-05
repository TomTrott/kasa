import axios from "axios";
//baseURL: "http://localhost:3001",
const api = axios.create({
  baseURL: "https://kasa-e2qm.onrender.com/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;