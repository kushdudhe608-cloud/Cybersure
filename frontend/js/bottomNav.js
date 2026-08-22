// Floating mobile-only bottom nav bar - white/black (light/dark) rounded bar
// with a notch cutout + dot above the active item. The active item shows its
// icon plus a small label underneath; inactive items are plain gray icons
// only. Desktop keeps the regular top navbar; this only ever renders on
// small screens (md:hidden).
import { isAuthenticated } from "./auth.js";
import { navigate, currentPath } from "./router.js";
import { onAuthChange } from "./auth.js";
import { onThemeChange } from "./theme.js";
import { icons } from "./ui.js";

function items() {
  const authed = isAuthenticated();
  return [
    { to: "/", icon: "home", label: "Home" },
    { to: "/scam-detector", icon: "search", label: "Scan" },
    { to: authed ? "/dashboard" : "/about", icon: authed ? "layout-dashboard" : "info", label: authed ? "Dashboard" : "About" },
    { to: authed ? "/history" : "/contact", icon: authed ? "bookmark" : "mail", label: authed ? "History" : "Contact" },
    { to: authed ? "/profile" : "/login", icon: "user", label: authed ? "Profile" : "Login" },
  ];
}

export function renderBottomNav() {
  const root = document.getElementById("bottom-nav-root");
  if (!root) return;
  const path = currentPath();
  const list = items();
  const activeIndex = Math.max(
    0,
    list.findIndex((i) => i.to === path)
  );
  const notchPercent = ((activeIndex + 0.5) / list.length) * 100;

  root.innerHTML = `
    <div class="md:hidden fixed bottom-4 inset-x-4 z-40 pointer-events-none">
      <div class="relative max-w-md mx-auto pointer-events-auto animate-fade-in-up" style="animation-delay:.1s">
        <div class="absolute -top-3 w-6 h-6 rounded-full bg-background transition-all duration-300 ease-out" style="left:${notchPercent}%; transform:translateX(-50%)">
          <span class="absolute left-1/2 top-1.5 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ink/70"></span>
        </div>
        <div class="relative flex items-center justify-between bg-cardRaised border border-ink/10 rounded-[1.75rem] px-2 py-3.5 shadow-[0_12px_34px_-6px_rgba(0,0,0,0.4)]">
          ${list
            .map((it, i) => {
              const active = i === activeIndex;
              return `
              <button data-to="${it.to}" aria-label="${it.label}" class="bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300">
                <i data-lucide="${it.icon}" class="transition-all duration-300 ${active ? "w-6 h-6 text-ink" : "w-5 h-5 text-ink/35"}"></i>
                <span class="text-[10px] font-medium tracking-tight transition-all duration-300 ${active ? "text-ink opacity-100 max-h-4" : "text-ink/35 opacity-0 max-h-0"}">${it.label}</span>
              </button>`;
            })
            .join("")}
        </div>
      </div>
    </div>`;

  icons();
  root.querySelectorAll(".bottom-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.to));
  });
}

onAuthChange(() => renderBottomNav());
onThemeChange(() => renderBottomNav());
document.addEventListener("route:changed", () => renderBottomNav());