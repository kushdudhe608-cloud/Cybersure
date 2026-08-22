import { navigate } from "../router.js";
import { api } from "../api.js";

const features = [
  { icon: "globe", title: "Website Scanner", description: "Checks URLs for HTTPS, domain age, and brand-impersonation red flags.", tab: "website" },
  { icon: "mail", title: "Email Scanner", description: "Flags urgency language, spoofed senders, and phishing links in emails.", tab: "email" },
  { icon: "qr-code", title: "QR Scanner", description: "Decodes QR codes and analyzes the destination URL before you visit it.", tab: "qr" },
  { icon: "message-circle", title: "SMS Scanner", description: "Detects lottery, OTP, courier, and investment scam message patterns.", tab: "whatsapp" },
  { icon: "briefcase", title: "Job Scam Detector", description: "Spots fake HR offers, joining fees, and unrealistic salary claims.", tab: "job" },
  { icon: "phone", title: "Phone Number Scanner", description: "Checks numbers against known spam-report patterns before you call back.", tab: "phone" },
];

const stats = [
  { id: "stat-scan-types", label: "Scan types", value: "0" },
  { id: "stat-signals-analyzed", label: "Signals analyzed", value: "…" },
  { id: "stat-scan-time", label: "Avg. scan time", value: "<1s" },
];

function animateCountUp(el, target, suffix = "") {
  if (!el || !Number.isFinite(target)) return;
  const duration = 900;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const readouts = [
  { text: "http://paypa1-secure-login.com", verdict: "92% Danger", tone: "text-danger" },
  { text: "Congrats! You won $10,000...", verdict: "88% Danger", tone: "text-danger" },
  { text: "https://github.com", verdict: "5% Safe", tone: "text-success" },
];

const PALETTE = [
  { bg: "#847dff", text: "#ffffff", body: "rgba(255,255,255,0.8)" },
  { bg: "#00b3dd", text: "#ffffff", body: "rgba(255,255,255,0.8)" },
  { bg: "#dd90d8", text: "#ffffff", body: "rgba(255,255,255,0.8)" },
  { bg: "#90b8f0", text: "#ffffff", body: "rgba(255,255,255,0.8)" },
  { bg: "#4b49aa", text: "#ffffff", body: "rgba(255,255,255,0.8)" },
  { bg: "#d1c9ff", text: "#000000", body: "rgba(0,0,0,0.7)" },
];

function featureCardHtml(f, i) {
  const { bg, text, body } = PALETTE[i % PALETTE.length];
  return `
    <a href="/scam-detector?tab=${f.tab}" class="rounded-2xl p-8 flex flex-col gap-4 h-full group block animate-fade-in-up transition-all duration-300 shadow-[0_8px_24px_-8px_rgba(120,120,120,0.4)] dark:shadow-[0_0_22px_-6px_rgba(255,255,255,0.15)] hover:shadow-[0_14px_36px_-8px_rgba(120,120,120,0.55)] dark:hover:shadow-[0_0_32px_-4px_rgba(255,255,255,0.28)] hover:-translate-y-1.5" style="animation-delay:${i * 0.06}s; background-color:${bg}; color:${text}">
      <i data-lucide="${f.icon}" class="w-6 h-6 opacity-90 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" stroke-width="1.5"></i>
      <h3 class="font-display font-normal text-2xl leading-tight mt-1">${f.title}</h3>
      <p class="text-sm leading-relaxed" style="color:${body}">${f.description}</p>
      <span class="mt-auto inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wide opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" style="color:${text}">
        Try it <i data-lucide="arrow-right" class="w-3 h-3"></i>
      </span>
    </a>`;
}

export function render(root) {
  root.innerHTML = `
    <div>
      <section class="relative overflow-hidden">
                <div class="absolute inset-x-0 top-0 h-[560px] pointer-events-none"
          style="background:linear-gradient(rgb(var(--color-background)), rgb(var(--color-card)) 55%, transparent 100%)" aria-hidden="true"></div>
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative text-center">
          <h1 class="font-display font-normal text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-ink animate-fade-in-up" style="animation-delay:.05s">
            See the scam <em class="italic text-primary">before</em> it sees you.
          </h1>

          <p class="mt-6 text-lg font-light text-muted max-w-lg mx-auto leading-relaxed animate-fade-in-up" style="animation-delay:.15s">
            Paste a link, email, message, or job offer. CyberSure analyzes it in under a second — before you click, reply, or pay.
          </p>

          <form id="home-prompt-form" class="mt-10 flex items-center gap-2 bg-black dark:bg-cardRaised border border-transparent rounded-2xl py-2 pl-[22px] pr-2 max-w-xl mx-auto animate-fade-in-up shadow-[0_8px_30px_-6px_rgba(120,120,120,0.35)] dark:shadow-[0_0_28px_-4px_rgba(255,255,255,0.18)] transition-shadow duration-300 focus-within:shadow-[0_8px_36px_-4px_rgba(75,73,170,0.45)] dark:focus-within:shadow-[0_0_36px_-2px_rgba(255,255,255,0.3)]" style="animation-delay:.22s">
            <input id="home-prompt-input" type="text" placeholder="Paste a link, message, or email to check…" class="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none min-w-0" />
            <button type="submit" aria-label="Check now" class="shrink-0 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 hover:rotate-45 transition-all duration-300 flex items-center justify-center">
              <i data-lucide="arrow-up-right" class="w-4 h-4 text-white"></i>
            </button>
          </form>

          <div class="mt-5 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style="animation-delay:.28s">
            <a href="/scam-detector" class="btn-primary hover:scale-105 hover:shadow-lg transition-all duration-300">Start Scanning <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
            <a href="/about" class="btn-secondary hover:scale-105 transition-all duration-300">Learn More</a>
          </div>

          <div class="mt-14 text-left max-w-xl mx-auto space-y-2 font-mono text-xs animate-fade-in-up" style="animation-delay:.35s">
            ${readouts
              .map(
                (r, i) => `
              <div class="flex items-center justify-between gap-3 bg-card/60 rounded-2xl px-4 py-3 border border-ink/5 transition-transform duration-300 hover:scale-[1.02] hover:border-primary/20 ${i === 0 ? "animate-float" : i === 1 ? "animate-float-slow" : ""}">
                <span class="text-muted truncate">${r.text}</span>
                <span class="font-medium whitespace-nowrap ${r.tone}">${r.verdict}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div class="bg-[#eef0f5] dark:bg-white rounded-2xl p-8 sm:p-10 grid grid-cols-3 gap-6 text-center animate-fade-in-up shadow-[0_8px_30px_-6px_rgba(120,120,120,0.35)] dark:shadow-[0_0_28px_-4px_rgba(255,255,255,0.18)]" style="animation-delay:.4s">${stats
              .map(
                (s) => `
              <div class="transition-transform duration-300 hover:scale-105">
                <div id="${s.id}" class="font-display font-normal text-3xl sm:text-4xl text-black">${s.value}</div>
                <div class="text-xs sm:text-sm font-mono uppercase tracking-wide text-black/60 mt-1">${s.label}</div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <div class="text-center mb-12">
          <h2 class="font-display font-normal text-3xl sm:text-4xl text-ink">Eight ways to check for scams</h2>
          <p class="text-muted font-light mt-3 max-w-xl mx-auto">One platform, every common scam vector — pick a scanner and paste what you want checked.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          ${features.map(featureCardHtml).join("")}
        </div>
      </section>
    </div>`;

  root.querySelector("#home-prompt-form").addEventListener("submit", (e) => {
    e.preventDefault();
    navigate("/scam-detector");
  });

  animateCountUp(root.querySelector("#stat-scan-types"), 8);
  loadLiveStats(root);
}

async function loadLiveStats(root) {
  const el = root.querySelector("#stat-signals-analyzed");
  if (!el) return;
  try {
    const data = await api.get("/stats", { auth: false });
    animateCountUp(el, data.signalsAnalyzed, "+");
  } catch {
    el.textContent = "40+";
  }
}