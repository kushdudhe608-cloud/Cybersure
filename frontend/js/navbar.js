import { flogoSvg } from "./flogo.js";
import { state as authState, isAuthenticated, isAdmin, logout, onAuthChange } from "./auth.js";
import { getTheme, toggleTheme, onThemeChange } from "./theme.js";
import { navigate, currentPath } from "./router.js";
import { icons } from "./ui.js";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/scam-detector", label: "Scam Detector" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];
const authedLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
];

let mobileOpen = false;

function themeToggleHtml() {
  const dark = getTheme() === "dark";
  return `
    <button id="theme-toggle" aria-label="${dark ? "Switch to light mode" : "Switch to dark mode"}"
      class="relative w-9 h-9 rounded-full border border-ink/10 bg-ink/5 hover:border-ink/25 hover:bg-primary/10 flex items-center justify-center transition-colors overflow-hidden">
      <i data-lucide="${dark ? "moon" : "sun"}" class="w-4 h-4 ${dark ? "text-primary" : "text-accent"}"></i>
    </button>`;
}

function linkHtml(l, active, extra = "") {
  return `<a href="${l.to}" class="relative text-sm font-medium transition-colors py-1 group/link ${active ? "text-primary" : "text-ink/70 hover:text-ink"} ${extra}">
    ${l.label}
    <span class="absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${active ? "w-full" : "w-0 group-hover/link:w-full"}"></span>
  </a>`;
}

export function renderNavbar() {
  const root = document.getElementById("navbar-root");
  const path = currentPath();
  const links = [...publicLinks, ...(isAuthenticated() ? authedLinks : []), ...(isAdmin() ? [{ to: "/admin", label: "Admin" }] : [])];

  root.innerHTML = `
    <header class="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-ink/5">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 group">
          <span class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inset-0 rounded-full bg-primary/20 blur-md group-hover:bg-primary/40 transition-colors animate-pulseSlow"></span>
            ${flogoSvg("w-6 h-6 relative group-hover:scale-110 transition-transform")}
          </span>
          <span class="font-display font-normal tracking-tight text-lg text-ink">CyberSure</span>
        </a>

        <div class="hidden md:flex items-center gap-7">
          ${links.map((l) => linkHtml(l, path === l.to)).join("")}
        </div>

        <div class="hidden md:flex items-center gap-3">
          ${themeToggleHtml()}
          ${
            isAuthenticated()
              ? `<a href="/profile" class="flex items-center gap-2 text-sm text-ink/70 hover:text-ink transition-colors"><i data-lucide="user" class="w-4 h-4"></i>${(authState.user?.name || "").split(" ")[0]}</a>
                 <button id="logout-btn" class="btn-secondary flex items-center gap-1.5 text-sm py-2"><i data-lucide="log-out" class="w-4 h-4"></i> Logout</button>`
              : `<a href="/login" class="text-sm font-medium text-ink/70 hover:text-ink transition-colors">Login</a>
                 <a href="/signup" class="btn-primary text-sm">Sign Up</a>`
          }
        </div>

        <div class="md:hidden flex items-center gap-3">
          ${themeToggleHtml()}
          <button id="mobile-toggle" class="text-ink" aria-label="Toggle menu">
            <i data-lucide="${mobileOpen ? "x" : "menu"}" class="w-6 h-6"></i>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" class="md:hidden overflow-hidden border-t border-ink/5 ${mobileOpen ? "" : "hidden"}">
        <div class="px-4 py-4 flex flex-col gap-4">
          ${links.map((l) => linkHtml(l, path === l.to, "mobile-link")).join("")}
          <div class="h-px bg-ink/10"></div>
          ${
            isAuthenticated()
              ? `<a href="/profile" class="text-sm text-ink/70 mobile-link">Profile</a>
                 <button id="logout-btn-mobile" class="btn-secondary text-sm text-left">Logout</button>`
              : `<a href="/login" class="text-sm text-ink/70 mobile-link">Login</a>
                 <a href="/signup" class="btn-primary text-sm text-center mobile-link">Sign Up</a>`
          }
        </div>
      </div>
    </header>`;

  icons();

  root.querySelector("#theme-toggle")?.addEventListener("click", toggleTheme);
  root.querySelectorAll(".mobile-link").forEach((el) => el.addEventListener("click", () => (mobileOpen = false)));
  root.querySelector("#mobile-toggle")?.addEventListener("click", () => {
    mobileOpen = !mobileOpen;
    renderNavbar();
  });
  const doLogout = () => {
    logout();
    mobileOpen = false;
    navigate("/");
  };
  root.querySelector("#logout-btn")?.addEventListener("click", doLogout);
  root.querySelector("#logout-btn-mobile")?.addEventListener("click", doLogout);
}

onAuthChange(() => renderNavbar());
onThemeChange(() => renderNavbar());
document.addEventListener("route:changed", () => renderNavbar());
