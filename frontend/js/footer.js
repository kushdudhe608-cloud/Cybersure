import { flogoSvg } from "./flogo.js";
import { icons } from "./ui.js";

export function renderFooter() {
  const root = document.getElementById("footer-root");
  root.innerHTML = `
    <footer class="relative border-t border-ink/10 bg-backgroundAlt mt-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div class="flex items-center gap-2 mb-2">
            ${flogoSvg("w-5 h-5")}
            <span class="font-display font-normal tracking-tight text-ink">CyberSure</span>
          </div>
          <p class="text-sm text-muted max-w-xs">
            Protect your digital life with trusted AI-powered security analysis. Fast, free, and easy to use.
          </p>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-ink/90 mb-3">Quick Links</h4>
          <ul class="space-y-2 text-sm text-muted">
            <li><a href="/scam-detector" class="hover:text-ink transition-colors">Scam Detector</a></li>
            <li><a href="/about" class="hover:text-ink transition-colors">About</a></li>
            <li><a href="/contact" class="hover:text-ink transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-ink/90 mb-3">Contact</h4>
          <ul class="space-y-2 text-sm text-muted font-mono">
            <li class="flex items-center gap-2 hover:text-primary transition-colors"><i data-lucide="mail" class="w-4 h-4"></i> hello@cybersure.io</li>
            <li class="flex items-center gap-2 hover:text-primary transition-colors"><i data-lucide="github" class="w-4 h-4"></i> github.com/cybersure</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-ink/5 py-4 text-center text-xs text-muted/70">
        Secure Your Digital Life &middot; &copy; ${new Date().getFullYear()} CyberSure
      </div>
    </footer>`;
  icons();
}
