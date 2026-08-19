import { navigate } from "../router.js";

const features = [
  { icon: "globe", title: "Website Scanner", description: "Checks URLs for HTTPS, domain age, and brand-impersonation red flags.", tab: "website" },
  { icon: "mail", title: "Email Scanner", description: "Flags urgency language, spoofed senders, and phishing links in emails.", tab: "email" },
  { icon: "qr-code", title: "QR Scanner", description: "Decodes QR codes and analyzes the destination URL before you visit it.", tab: "qr" },
  { icon: "message-circle", title: "WhatsApp Scanner", description: "Detects lottery, OTP, courier, and investment scam message patterns.", tab: "whatsapp" },
  { icon: "briefcase", title: "Job Scam Detector", description: "Spots fake HR offers, joining fees, and unrealistic salary claims.", tab: "job" },
  { icon: "key-round", title: "Fake Login Detector", description: "Identifies phishing pages designed to imitate real login screens.", tab: "login" },
];

const stats = [
  { label: "Scan types", value: "9" },
  { label: "Signals analyzed", value: "40+" },
  { label: "Avg. scan time", value: "<1s" },
];

const readouts = [
  { text: "http://paypa1-secure-login.com", verdict: "92% Danger", tone: "text-danger" },
  { text: "Congrats! You won $10,000...", verdict: "88% Danger", tone: "text-danger" },
  { text: "https://github.com", verdict: "5% Safe", tone: "text-success" },
];

// Hex values, not Tailwind classes - applied via inline style so the color always
// renders immediately and reliably, regardless of when the CDN JIT compiler runs.
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
    <a href="/scam-detector?tab=${f.tab}" class="rounded-2xl p-8 flex flex-col gap-4 h-full group block animate-fade-in-up transition-shadow shadow-[0_8px_24px_-8px_rgba(120,120,120,0.4)] dark:shadow-[0_0_22px_-6px_rgba(255,255,255,0.15)] hover:shadow-[0_10px_30px_-6px_rgba(120,120,120,0.5)] dark:hover:shadow-[0_0_28px_-4px_rgba(255,255,255,0.22)]" style="animation-delay:${i * 0.06}s; background-color:${bg}; color:${text}">
      <i data-lucide="${f.icon}" class="w-6 h-6 opacity-90" stroke-width="1.5"></i>
      <h3 class="font-display font-normal text-2xl leading-tight mt-1">${f.title}</h3>
      <p class="text-sm leading-relaxed" style="color:${body}">${f.description}</p>
    </a>`;
}

export function render(root) {
  root.innerHTML = `
    <div>
      <section class="relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-[560px] pointer-events-none"
          style="background:linear-gradient(rgb(var(--color-background)), rgb(var(--color-background-alt)) 55%, transparent 100%)" aria-hidden="true"></div>

        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative text-center">
          <h1 class="font-display font-normal text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-ink animate-fade-in-up" style="animation-delay:.05s">
            See the scam <em class="italic text-primary">before</em> it sees you.
          </h1>

          <p class="mt-6 text-lg font-light text-muted max-w-lg mx-auto leading-relaxed animate-fade-in-up" style="animation-delay:.15s">
            Paste a link, email, message, or job offer. CyberSure analyzes it in under a second — before you click, reply, or pay.
          </p>

          <form id="home-prompt-form" class="mt-10 flex items-center gap-2 bg-black dark:bg-cardRaised border border-transparent rounded-2xl py-2 pl-[22px] pr-2 max-w-xl mx-auto animate-fade-in-up shadow-[0_8px_30px_-6px_rgba(120,120,120,0.35)] dark:shadow-[0_0_28px_-4px_rgba(255,255,255,0.18)]" style="animation-delay:.22s">
            <input id="home-prompt-input" type="text" placeholder="Paste a link, message, or email to check…" class="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none min-w-0" />
            <button type="submit" aria-label="Check now" class="shrink-0 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center">
              <i data-lucide="arrow-up-right" class="w-4 h-4 text-white"></i>
            </button>
          </form>

          <div class="mt-5 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style="animation-delay:.28s">
            <a href="/scam-detector" class="btn-primary">Start Scanning <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
            <a href="/about" class="btn-secondary">Learn More</a>
          </div>

          <div class="mt-14 text-left max-w-xl mx-auto space-y-2 font-mono text-xs animate-fade-in-up" style="animation-delay:.35s">
            ${readouts
              .map(
                (r) => `
              <div class="flex items-center justify-between gap-3 bg-card/60 rounded-2xl px-4 py-3 border border-ink/5">
                <span class="text-muted truncate">${r.text}</span>
                <span class="font-medium whitespace-nowrap ${r.tone}">${r.verdict}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="bg-[#cacaca] dark:bg-white rounded-2xl p-8 sm:p-10 grid grid-cols-3 gap-6 text-center animate-fade-in-up shadow-[0_8px_30px_-6px_rgba(120,120,120,0.35)] dark:shadow-[0_0_28px_-4px_rgba(255,255,255,0.18)]">
            ${stats
              .map(
                (s) => `
              <div>
                <div class="font-display font-normal text-3xl sm:text-4xl text-black">${s.value}</div>
                <div class="text-xs sm:text-sm font-mono uppercase tracking-wide text-black/60 mt-1">${s.label}</div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <div class="text-center mb-12">
          <h2 class="font-display font-normal text-3xl sm:text-4xl text-ink">Nine ways to check for scams</h2>
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
}
