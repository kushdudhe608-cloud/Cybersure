// Intro splash shown once per browser session, right when the page first
// loads: a big "C" scales in, then "ybersure" slides in beside it to
// complete the "Cybersure" wordmark - matching the same C + ybersure
// treatment used in the navbar brand mark.
const SEEN_KEY = "cybersure-intro-seen";

export function showSplashIfNeeded(onDone) {
  if (sessionStorage.getItem(SEEN_KEY)) {
    onDone();
    return;
  }
  sessionStorage.setItem(SEEN_KEY, "1");

  const root = document.getElementById("splash");

  root.innerHTML = `
    <div id="splash-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden transition-opacity duration-500">
      <div class="relative flex flex-col items-center">
        <div class="absolute rounded-full bg-primary/25 blur-3xl splash-glow" style="width:220px;height:220px"></div>
        <div class="relative flex items-end">
          <span class="splash-c font-display font-bold leading-none text-ink opacity-0" style="font-size:4.5rem">C</span>
          <span class="splash-rest font-display font-normal leading-none text-ink opacity-0" style="font-size:3rem">ybersure</span>
        </div>
        <div class="h-px w-40 mt-5 bg-primary origin-left splash-rule" style="transform:scaleX(0)"></div>
        <p class="mt-3 text-xs font-mono tracking-widest text-muted uppercase splash-caption opacity-0">Scanning for fraud</p>
      </div>
    </div>
    <style>
      @keyframes splashGlowIn { 0% { transform: scale(0); opacity:0;} 40% { transform: scale(1.3); opacity:0.6;} 100% { transform: scale(1); opacity:0.3;} }
      .splash-glow { animation: splashGlowIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }

      @keyframes splashCIn {
        0% { opacity: 0; transform: scale(0.3) rotate(-12deg); }
        60% { opacity: 1; transform: scale(1.15) rotate(2deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      .splash-c { animation: splashCIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; }

      @keyframes splashRestIn {
        from { opacity: 0; transform: translateX(-18px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .splash-rest { animation: splashRestIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s forwards; }

      .splash-rule { animation: splashRuleIn 0.6s ease-in-out 1.3s forwards; }
      @keyframes splashRuleIn { to { transform: scaleX(1); } }
      .splash-caption { animation: splashFadeIn 0.5s ease 1.5s forwards; }
      @keyframes splashFadeIn { to { opacity:1; } }

      @media (prefers-reduced-motion: reduce) {
        .splash-c, .splash-rest, .splash-glow, .splash-rule, .splash-caption { animation: none !important; opacity: 1 !important; transform: none !important; }
      }
    </style>`;

  document.body.style.overflow = "hidden";
  const overlay = document.getElementById("splash-overlay");

  setTimeout(() => {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }, 2000);

  setTimeout(() => {
    document.body.style.overflow = "";
    root.innerHTML = "";
    onDone();
  }, 2600);
}