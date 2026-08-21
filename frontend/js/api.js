// Central API config. Change API_BASE to your deployed backend URL
// (e.g. "https://your-app.onrender.com/api") when you deploy the frontend.
export const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "/api";

const TOKEN_KEY = "cybersure_token";
const USER_KEY = "cybersure_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const setStoredUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const clearStoredUser = () => localStorage.removeItem(USER_KEY);

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// `body` may be a plain object (sent as JSON) or a FormData instance (sent as-is).
async function request(path, { method = "GET", body, headers = {}, auth = true } = {}) {
  const finalHeaders = { ...headers };
  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError("Could not reach the server. Is the backend running?", 0);
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    throw new ApiError(data.message || "Something went wrong", res.status);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
