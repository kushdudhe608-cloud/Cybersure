import { initAuth } from "./auth.js";
import { addRoute, setNotFound, render, installLinkInterceptor } from "./router.js";
import { renderNavbar } from "./navbar.js";
import { renderBottomNav } from "./bottomNav.js";
import { renderFooter } from "./footer.js";
import { showSplashIfNeeded } from "./splash.js";

import * as HomePage from "./pages/home.js";
import * as ScamDetectorPage from "./pages/scamDetector.js";
import * as AboutPage from "./pages/about.js";
import * as ContactPage from "./pages/contact.js";
import * as LoginPage from "./pages/login.js";
import * as SignupPage from "./pages/signup.js";
import * as DashboardPage from "./pages/dashboard.js";
import * as HistoryPage from "./pages/history.js";
import * as ProfilePage from "./pages/profile.js";
import * as AdminPage from "./pages/admin.js";
import * as NotFoundPage from "./pages/notfound.js";

addRoute("/", HomePage.render);
addRoute("/scam-detector", ScamDetectorPage.render);
addRoute("/about", AboutPage.render);
addRoute("/contact", ContactPage.render);
addRoute("/login", LoginPage.render);
addRoute("/signup", SignupPage.render);
addRoute("/dashboard", DashboardPage.render, { protected: true });
addRoute("/history", HistoryPage.render, { protected: true });
addRoute("/profile", ProfilePage.render, { protected: true });
addRoute("/admin", AdminPage.render, { protected: true, adminOnly: true });

setNotFound(async () => {
  const container = document.createElement("div");
  await NotFoundPage.render(container);
  return container.innerHTML;
});

async function boot() {
  renderNavbar();
  renderBottomNav();
  renderFooter();
  installLinkInterceptor();
  await initAuth();
  await render();
  renderNavbar(); // re-render once auth state is resolved (Login/Sign up <-> user menu)
  renderBottomNav();
}

showSplashIfNeeded(boot);
