import axios from "axios";

const BASE_URL = "https://shop-syra-backend.vercel.app/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
