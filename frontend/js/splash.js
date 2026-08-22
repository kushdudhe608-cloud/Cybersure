// Intro splash shown once per browser session, right when the page first
// loads: the full logo mark (the "C" thumb glyph) scales in big, centered -
// then "ybersure" appears beside it one letter at a time to complete the
// wordmark, matching the same logo + "ybersure" pairing used in the navbar.
import { flogoSvg } from "./flogo.js";

const REST_OF_WORD = "ybersure";
const SEEN_KEY = "cybersure-intro-seen";

export function showSplashIfNeeded(onDone) {
  if (sessionStorage.getItem(SEEN_KEY)) {
    onDone();
    return;
  }
  sessionStorage.setItem(SEEN_KEY, "1");

  const root = document.getElementById("splash");

  const letters = REST_OF_WORD.split("")
    .map((ch, i) => `<span style="animation-delay:${0.85 + i * 0.07}s" class="splash-letter inline-block opacity-0 text-ink">${ch}</span>`)
    .join("");

  root.innerHTML = `
    <div id="splash-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden transition-opacity duration-500">
      <div class="relative flex items-center">
        <div class="absolute rounded-full bg-primary/25 blur-3xl splash-glow" style="width:220px;height:220px"></div>
        <div class="splash-mark relative w-24 h-24 sm:w-28 sm:h-28">
          ${flogoSvg("w-full h-full text-ink")}
        </div>
        <h1 class="relative font-display font-normal text-4xl sm:text-5xl text-ink -ml-1">${letters}</h1>
      </div>
    </div>
    <style>
      @keyframes splashGlowIn { 0% { transform: scale(0); opacity:0;} 40% { transform: scale(1.3); opacity:0.6;} 100% { transform: scale(1); opacity:0.3;} }
      .splash-glow { animation: splashGlowIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }

      @keyframes splashMarkIn {
        0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
        60% { opacity: 1; transform: scale(1.15) rotate(2deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      .splash-mark { animation: splashMarkIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; opacity: 0; }

      @keyframes splashLetterIn { from { opacity:0; transform: translateY(10px) scale(0.7);} to { opacity:1; transform: translateY(0) scale(1);} }
      .splash-letter { animation: splashLetterIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }

      @media (prefers-reduced-motion: reduce) {
        .splash-mark, .splash-letter, .splash-glow { animation: none !important; opacity: 1 !important; transform: none !important; }
      }
    </style>`;

  document.body.style.overflow = "hidden";
  const overlay = document.getElementById("splash-overlay");

  setTimeout(() => {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }, 2200);

  setTimeout(() => {
    document.body.style.overflow = "";
    root.innerHTML = "";
    onDone();
  }, 2800);
}