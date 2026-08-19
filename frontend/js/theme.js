const STORAGE_KEY = "cybersure-theme";
const listeners = new Set();
export const onThemeChange = (fn) => listeners.add(fn);

export function getTheme() {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function setTheme(theme) {
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
  localStorage.setItem(STORAGE_KEY, theme);
  listeners.forEach((fn) => fn(theme));
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}
