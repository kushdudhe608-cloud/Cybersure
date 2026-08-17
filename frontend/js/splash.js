import { flogoSvg } from "./flogo.js";

const WORDMARK = "CYBERSURE";
const SEEN_KEY = "cybersure-intro-seen";

export function showSplashIfNeeded(onDone) {
  if (sessionStorage.getItem(SEEN_KEY)) {
    onDone();
    return;
  }
  sessionStorage.setItem(SEEN_KEY, "1");

  const root = document.getElementById("splash");
  const letters = WORDMARK.split("")
    .map(
      (ch, i) =>
        `<span style="animation-delay:${1.05 + i * 0.055}s" class="splash-letter inline-block opacity-0 text-primary">${ch}</span>`
    )
    .join("");

  root.innerHTML = `
    <div id="splash-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden transition-opacity duration-500">
      <div class="relative flex flex-col items-center">
        <div class="absolute rounded-full bg-primary/30 blur-3xl splash-glow" style="width:180px;height:180px"></div>
        <div class="relative w-24 h-24 sm:w-28 sm:h-28 mb-5 splash-mark-wrap" style="filter:drop-shadow(0 0 30px rgb(var(--color-primary) / 0.35))">
          <div class="relative w-full h-full splash-mark">
            ${flogoSvg("w-full h-full text-primary splash-mark-svg")}
            <div class="absolute inset-x-0 splash-scanline"></div>
          </div>
        </div>
        <h1 class="font-display font-normal tracking-tight text-2xl sm:text-3xl flex" style="letter-spacing:0.15em">${letters}</h1>
        <div class="h-px w-40 mt-4 bg-primary origin-left splash-rule" style="transform:scaleX(0)"></div>
        <p class="mt-3 text-xs font-mono tracking-widest text-muted uppercase splash-caption opacity-0">Scanning for fraud</p>
      </div>
    </div>
    <style>
      @keyframes splashLetterIn { from { opacity:0; transform: translateY(14px) scale(0.6);} to { opacity:1; transform: translateY(0) scale(1);} }
      .splash-letter { animation: splashLetterIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
      @keyframes splashMarkIn { 0% { transform: scale(0.2) rotate(-6deg); opacity:0;} 60% { transform: scale(1.18) rotate(0); opacity:1;} 100% { transform: scale(1) rotate(0);} }
      .splash-mark-wrap { animation: splashMarkIn 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }

      /* "Logo generating" reveal: the mark materializes bottom-to-top like it's
         being scanned/drawn in, instead of just popping in already-formed. */
      .splash-mark-svg {
        clip-path: inset(100% 0 0 0);
        animation: splashMarkReveal 1s cubic-bezier(0.65,0,0.35,1) 0.15s forwards;
      }
      @keyframes splashMarkReveal {
        0% { clip-path: inset(100% 0 0 0); }
        100% { clip-path: inset(0 0 0 0); }
      }
      /* Thin scan-line that sweeps up through the mark in sync with the reveal,
         reinforcing the "scanning for fraud" idea. Adapts with the mark since
         it's colored from the same --color-primary token. */
      .splash-scanline {
        top: 100%;
        height: 2px;
        background: rgb(var(--color-primary));
        box-shadow: 0 0 10px 2px rgb(var(--color-primary) / 0.8), 0 0 24px 6px rgb(var(--color-primary) / 0.4);
        opacity: 0;
        animation: splashScanSweep 1s cubic-bezier(0.65,0,0.35,1) 0.15s forwards;
      }
      @keyframes splashScanSweep {
        0% { top: 100%; opacity: 0.95; }
        85% { opacity: 0.95; }
        100% { top: -4%; opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .splash-mark-svg { clip-path: none; animation: none; }
        .splash-scanline { display: none; }
      }
      @keyframes splashGlowIn { 0% { transform: scale(0); opacity:0;} 40% { transform: scale(1.3); opacity:0.7;} 100% { transform: scale(1); opacity:0.35;} }
      .splash-glow { animation: splashGlowIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
      .splash-rule { animation: splashRuleIn 0.6s ease-in-out 1.9s forwards; }
      @keyframes splashRuleIn { to { transform: scaleX(1); } }
      .splash-caption { animation: splashFadeIn 0.5s ease 2.1s forwards; }
      @keyframes splashFadeIn { to { opacity:1; } }
    </style>`;

  document.body.style.overflow = "hidden";
  const overlay = document.getElementById("splash-overlay");

  setTimeout(() => {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }, 2600);

  setTimeout(() => {
    document.body.style.overflow = "";
    root.innerHTML = "";
    onDone();
  }, 3200);
}
