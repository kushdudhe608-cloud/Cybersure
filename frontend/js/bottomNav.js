// Floating mobile-only bottom nav bar, styled after a rounded "app tab bar"
// with a notch cutout + dot above the active item. Desktop keeps the regular
// top navbar; this only ever renders on small screens (md:hidden).
import { isAuthenticated } from "./auth.js";
import { navigate, currentPath } from "./router.js";
import { onAuthChange } from "./auth.js";
import { onThemeChange } from "./theme.js";
import { icons } from "./ui.js";

function items() {
  const authed = isAuthenticated();
  return [
    { to: "/", icon: "home" },
    { to: "/scam-detector", icon: "search" },
    { to: authed ? "/dashboard" : "/about", icon: authed ? "layout-dashboard" : "info" },
    { to: authed ? "/history" : "/contact", icon: authed ? "bookmark" : "mail" },
    { to: authed ? "/profile" : "/login", icon: "user" },
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
      <div class="relative max-w-sm mx-auto pointer-events-auto animate-fade-in-up" style="animation-delay:.1s">
        <div class="absolute -top-2.5 w-5 h-5 rounded-full bg-background transition-all duration-300 ease-out" style="left:${notchPercent}%; transform:translateX(-50%)">
          <span class="absolute left-1/2 top-1 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ink/60"></span>
        </div>
        <div class="relative flex items-center justify-between bg-cardRaised border border-ink/10 rounded-full px-3 py-2.5 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.35)]">
          ${list
            .map((it, i) => {
              const active = i === activeIndex;
              return `
              <button data-to="${it.to}" aria-label="${it.icon}" class="bottom-nav-item relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${active ? "bg-primary scale-110 shadow-[0_4px_14px_-2px_rgba(75,73,170,0.55)]" : "hover:bg-ink/5"}">
                <i data-lucide="${it.icon}" class="w-[18px] h-[18px] transition-colors ${active ? "text-white" : "text-ink/45"}"></i>
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