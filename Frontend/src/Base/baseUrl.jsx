export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : "https://shakhawat-hossain-shuvo.onrender.com")
).replace(/\/$/, "");

export default API_BASE_URL;
