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

function pillLinkHtml(l, active) {
  return `<a href="${l.to}" data-active="${active}" class="pill-nav-link relative z-10 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
    active ? "text-background" : "text-ink/65 hover:text-ink"
  }">${l.label}</a>`;
}

function mobileLinkHtml(l, active, index) {
  return `<a href="${l.to}" class="mobile-link relative text-sm font-medium py-1 ${active ? "text-primary" : "text-ink/70"} animate-fade-in-up" style="animation-delay:${index * 0.05}s">
    ${active ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 align-middle"></span>' : ""}${l.label}
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
        <a href="/" class="flex items-center gap-2.5 group shrink-0">
          <span class="font-display font-bold tracking-tight text-[2.1rem] leading-none text-ink -mr-1">C</span>
          <span class="font-display font-normal tracking-tight text-[1.4rem] text-ink">ybersure</span>
        </a>

        <div id="desktop-nav-pill" class="hidden md:flex items-center gap-0.5 relative bg-ink/5 dark:bg-white/5 backdrop-blur border border-ink/10 rounded-full p-1.5">
          <span id="nav-indicator" class="absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] rounded-full bg-ink transition-all duration-300 ease-out"></span>
          ${links.map((l) => pillLinkHtml(l, path === l.to)).join("")}
        </div>

        <div class="hidden md:flex items-center gap-3.5 shrink-0">
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
          ${links.map((l, i) => mobileLinkHtml(l, path === l.to, i)).join("")}
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
  positionNavIndicator(root);

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

function positionNavIndicator(root) {
  const container = root.querySelector("#desktop-nav-pill");
  const indicator = root.querySelector("#nav-indicator");
  const activeLink = container?.querySelector('[data-active="true"]');
  if (!container || !indicator || !activeLink) return;
  const cRect = container.getBoundingClientRect();
  const aRect = activeLink.getBoundingClientRect();
  indicator.style.width = `${aRect.width}px`;
  indicator.style.transform = `translateX(${aRect.left - cRect.left - 6}px)`;
}

let resizeListenerAttached = false;
function attachResizeListener() {
  if (resizeListenerAttached) return;
  resizeListenerAttached = true;
  window.addEventListener(
    "resize",
    () => positionNavIndicator(document.getElementById("navbar-root")),
    { passive: true }
  );
}
attachResizeListener();

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