import { api, getToken, setToken, clearToken, getStoredUser, setStoredUser, clearStoredUser } from "./api.js";

// Simple pub/sub so the Navbar (and any other listener) re-renders on auth changes.
const listeners = new Set();
export const onAuthChange = (fn) => listeners.add(fn);
const notify = () => listeners.forEach((fn) => fn(state));

export const state = {
  user: getStoredUser(),
  loading: true,
};

export const isAuthenticated = () => !!state.user;
export const isAdmin = () => state.user?.role === "admin";

export async function initAuth() {
  const token = getToken();
  if (!token) {
    state.loading = false;
    notify();
    return;
  }
  try {
    const { user } = await api.get("/auth/me");
    state.user = user;
    setStoredUser(user);
  } catch {
    clearToken();
    clearStoredUser();
    state.user = null;
  } finally {
    state.loading = false;
    notify();
  }
}

export async function login(email, password) {
  const data = await api.post("/auth/login", { email, password }, { auth: false });
  setToken(data.token);
  setStoredUser(data.user);
  state.user = data.user;
  notify();
  return data.user;
}

export async function signup(name, email, password, confirmPassword) {
  const data = await api.post("/auth/signup", { name, email, password, confirmPassword }, { auth: false });
  setToken(data.token);
  setStoredUser(data.user);
  state.user = data.user;
  notify();
  return data.user;
}

export function logout() {
  clearToken();
  clearStoredUser();
  state.user = null;
  notify();
}
