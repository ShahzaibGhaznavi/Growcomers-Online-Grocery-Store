import axios from "axios";

export const NODE_BASE_URL =
  import.meta.env.VITE_NODE_API_URL || "http://localhost:4000";

export const PYTHON_BASE_URL =
  import.meta.env.VITE_PYTHON_API_URL || "http://localhost:5000";

export const NODE_API = axios.create({
  baseURL: NODE_BASE_URL,
});

export const PYTHON_API = axios.create({
  baseURL: PYTHON_BASE_URL,
});

export const PRIVATE_API = axios.create({
  baseURL: NODE_BASE_URL,
});

export const PRIVATE_PYTHON_API = axios.create({
  baseURL: PYTHON_BASE_URL,
});

PRIVATE_API.interceptors.request.use((req) => {
  if (localStorage.getItem("accessToken")) {
    req.headers.Authorization = `Bearer ${JSON.parse(
      localStorage.getItem("accessToken")
    )}`;
  }
  return req;
});

PRIVATE_PYTHON_API.interceptors.request.use((req) => {
  if (localStorage.getItem("accessToken")) {
    req.headers.Authorization = `Bearer ${JSON.parse(
      localStorage.getItem("accessToken")
    )}`;
  }
  return req;
});
