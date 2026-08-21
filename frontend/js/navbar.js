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
let scrolled = false;

function themeToggleHtml() {
  const dark = getTheme() === "dark";
  return `
    <button class="theme-toggle-btn relative w-9 h-9 rounded-full border border-ink/10 bg-ink/5 hover:border-primary/30 hover:bg-primary/10 hover:rotate-12 flex items-center justify-center transition-all duration-300 overflow-hidden" aria-label="${dark ? "Switch to light mode" : "Switch to dark mode"}">
      <i data-lucide="${dark ? "moon" : "sun"}" class="w-4 h-4 ${dark ? "text-primary" : "text-accent"} animate-theme-icon-in"></i>
    </button>`;
}

function linkHtml(l, active, extra = "", index = 0) {
  return `<a href="${l.to}" class="relative text-sm font-medium transition-all duration-200 py-1 group/link ${active ? "text-primary" : "text-ink/70 hover:text-ink hover:-translate-y-0.5"} ${extra}" style="${extra.includes("mobile-link") ? `animation-delay:${index * 0.05}s` : ""}">
    ${active ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 align-middle animate-pulseSlow"></span>' : ""}${l.label}
    <span class="absolute -bottom-1 left-0 h-px bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out ${active ? "w-full" : "w-0 group-hover/link:w-full"}"></span>
  </a>`;
}

export function renderNavbar() {
  const root = document.getElementById("navbar-root");
  const path = currentPath();
  const links = [...publicLinks, ...(isAuthenticated() ? authedLinks : []), ...(isAdmin() ? [{ to: "/admin", label: "Admin" }] : [])];
  const isFirstRender = !root.dataset.rendered;
  root.dataset.rendered = "1";

  root.innerHTML = `
    <header class="sticky top-0 z-50 bg-background/85 backdrop-blur border-b transition-all duration-300 ${scrolled ? "border-ink/10 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.12)]" : "border-ink/5 shadow-none"} ${isFirstRender ? "animate-nav-in" : ""}">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}">
        <a href="/" class="flex items-center gap-2.5 group">
          <span class="relative flex items-center justify-center w-10 h-10">
            <span class="absolute inset-0 rounded-full bg-primary/20 blur-md group-hover:bg-primary/40 transition-colors animate-pulseSlow"></span>
            ${flogoSvg("w-7 h-7 relative group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300")}
          </span>
          <span class="font-display font-normal tracking-tight text-xl text-ink">CyberSure</span>
        </a>

        <div class="hidden md:flex items-center gap-8">
          ${links.map((l) => linkHtml(l, path === l.to)).join("")}
        </div>

        <div class="hidden md:flex items-center gap-3.5">
          ${themeToggleHtml()}
          ${
            isAuthenticated()
              ? `<a href="/profile" class="flex items-center gap-2 text-sm text-ink/70 hover:text-ink transition-colors"><i data-lucide="user" class="w-4 h-4"></i>${(authState.user?.name || "").split(" ")[0]}</a>
                 <button id="logout-btn" class="btn-secondary flex items-center gap-1.5 text-sm py-2 hover:shadow-md transition-shadow"><i data-lucide="log-out" class="w-4 h-4"></i> Logout</button>`
              : `<a href="/login" class="text-sm font-medium text-ink/70 hover:text-ink transition-colors">Login</a>
                 <a href="/signup" class="btn-primary text-sm hover:scale-105 hover:shadow-lg transition-all">Sign Up</a>`
          }
        </div>

        <div class="md:hidden flex items-center gap-3">
          ${themeToggleHtml()}
          <button id="mobile-toggle" class="text-ink w-9 h-9 flex items-center justify-center" aria-label="Toggle menu">
            <i data-lucide="${mobileOpen ? "x" : "menu"}" class="w-6 h-6 transition-transform duration-200 ${mobileOpen ? "rotate-90" : ""}"></i>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" class="md:hidden overflow-hidden border-t border-ink/5 transition-all duration-300 ease-out ${mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 border-t-0"}">
        <div class="px-4 py-4 flex flex-col gap-4">
          ${links.map((l, i) => linkHtml(l, path === l.to, mobileOpen ? "mobile-link animate-fade-in-up" : "mobile-link", i)).join("")}
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

  root.querySelectorAll(".theme-toggle-btn").forEach((btn) => btn.addEventListener("click", toggleTheme));
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

// Scroll-shrink effect: attached once to window, only re-renders the navbar
// when the scrolled state actually flips (not on every scroll pixel).
let scrollListenerAttached = false;
function attachScrollListener() {
  if (scrollListenerAttached) return;
  scrollListenerAttached = true;
  window.addEventListener(
    "scroll",
    () => {
      const shouldShrink = window.scrollY > 24;
      if (shouldShrink !== scrolled) {
        scrolled = shouldShrink;
        renderNavbar();
      }
    },
    { passive: true }
  );
}
attachScrollListener();

onAuthChange(() => renderNavbar());
onThemeChange(() => renderNavbar());
document.addEventListener("route:changed", () => renderNavbar());