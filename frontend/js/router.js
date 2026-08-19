import { state as authState, isAuthenticated, isAdmin } from "./auth.js";

const routes = [];
let notFoundHandler = null;

export function addRoute(path, render, opts = {}) {
  routes.push({ path, render, ...opts });
}
export function setNotFound(render) {
  notFoundHandler = render;
}

function matchRoute(pathname) {
  for (const route of routes) {
    if (route.path === pathname) return { route, params: {} };
  }
  return null;
}

const mainRoot = () => document.getElementById("main-root");

export async function navigate(path, { replace = false } = {}) {
  if (replace) history.replaceState({}, "", path);
  else history.pushState({}, "", path);
  await render();
}

export async function render() {
  const url = new URL(window.location.href);
  // Normalize away a trailing "index.html" (e.g. served by tools like VS Code's
  // Live Server at ".../index.html" instead of "/") so it still matches the "/" route.
  const cleanedPath = url.pathname.replace(/\/index\.html$/i, "/");
  const pathname = cleanedPath.replace(/\/+$/, "") || "/";
  const query = Object.fromEntries(url.searchParams.entries());

  const match = matchRoute(pathname);
  const root = mainRoot();

  // Guard: never let a page load with scrolling locked (the splash screen is
  // the only thing that intentionally sets this, and it always clears it).
  document.body.style.overflow = "";
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  if (!match) {
    root.innerHTML = notFoundHandler ? await notFoundHandler() : "<div class='p-12 text-center'>Not found</div>";
    afterPageSwap();
    return;
  }

  const { route } = match;

  if (route.protected) {
    if (authState.loading) {
      // Wait briefly for the initial /auth/me check to resolve before deciding.
      await new Promise((resolve) => {
        const check = () => (authState.loading ? setTimeout(check, 30) : resolve());
        check();
      });
    }
    if (!isAuthenticated()) {
      history.replaceState({}, "", "/login");
      return render();
    }
    if (route.adminOnly && !isAdmin()) {
      history.replaceState({}, "", "/dashboard");
      return render();
    }
  }

  await route.render(root, { query });
  afterPageSwap();
}

function afterPageSwap() {
  if (window.lucide) window.lucide.createIcons();
  document.dispatchEvent(new CustomEvent("route:changed"));
}

// Intercepts clicks on same-origin, non-modified <a> clicks and routes them
// through the SPA router instead of a full page load.
export function installLinkInterceptor() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest("a");
    if (!anchor) return;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener("popstate", render);
}

export function currentPath() {
  const cleaned = window.location.pathname.replace(/\/index\.html$/i, "/");
  return cleaned.replace(/\/+$/, "") || "/";
}
