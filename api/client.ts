import axios from "axios";

const BASE_URL = "http://10.20.6.251:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
