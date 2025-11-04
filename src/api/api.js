import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8083/web_order/products", // Spring Boot backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;