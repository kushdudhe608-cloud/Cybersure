// Re-scans the DOM for data-lucide="..." elements and renders the icon SVGs.
// Call this after injecting any new HTML that contains icon placeholders.
export function icons() {
  if (window.lucide) window.lucide.createIcons();
}

const TOAST_ICON = { success: "check-circle", error: "x-circle" };
const TOAST_COLOR = { success: "text-success", error: "text-danger" };

export function toast(message, type = "success") {
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className =
    "animate-toast-in flex items-center gap-2 bg-card text-ink border border-primary/15 rounded-lg px-4 py-3 text-sm shadow-soft max-w-xs";
  el.innerHTML = `<i data-lucide="${TOAST_ICON[type] || "info"}" class="w-4 h-4 shrink-0 ${TOAST_COLOR[type] || ""}"></i><span>${escapeHtml(message)}</span>`;
  root.appendChild(el);
  icons();
  setTimeout(() => {
    el.style.transition = "opacity .25s ease";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 250);
  }, 3200);
}
toast.success = (m) => toast(m, "success");
toast.error = (m) => toast(m, "error");

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STATUS_COLORS = {
  Safe: { bar: "bg-success", text: "text-success", bg: "bg-success/10", border: "border-success/30" },
  Suspicious: { bar: "bg-warning", text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  Dangerous: { bar: "bg-danger", text: "text-danger", bg: "bg-danger/10", border: "border-danger/30" },
};

export function statusBadgeClass(status) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Suspicious;
  return `text-xs font-semibold px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`;
}

function riskMeterHtml(score, status) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Suspicious;
  return `
    <div class="rounded-xl border ${c.border} ${c.bg} p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-ink/70">Risk Score</span>
        <span class="font-mono text-2xl font-bold ${c.text}">${score}%</span>
      </div>
      <div class="w-full h-2.5 rounded-full bg-ink/10 overflow-hidden">
        <div class="h-full rounded-full ${c.bar} transition-all duration-700 ease-out" style="width:0%" data-risk-bar="${score}"></div>
      </div>
      <div class="mt-3 flex justify-end">
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${c.bg} ${c.text} border ${c.border}">${status}</span>
      </div>
    </div>`;
}

// Renders the shared result card: risk meter + reasons + copy/download/share actions.
// Call `mountResultCard(container, result, title)` after inserting into the DOM.
export function resultCardHtml(result, title) {
  if (!result) return "";
  const reasons = (result.reasons || [])
    .map((r) => `<li class="text-sm text-ink/70 flex gap-2"><span class="text-muted/70">&bull;</span>${escapeHtml(r)}</li>`)
    .join("");
  return `
    <div class="card p-6 mt-6 animate-fade-in-up" data-result-card='${escapeHtml(JSON.stringify({ ...result, title }))}'>
      ${riskMeterHtml(result.riskScore, result.status)}
      <div class="mt-5">
        <h4 class="text-sm font-semibold text-ink/90 mb-2 flex items-center gap-1.5">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-warning"></i> Analysis Reasons
        </h4>
        <ul class="space-y-2">${reasons}</ul>
      </div>
      <div class="mt-5 grid grid-cols-1 xs:grid-cols-3 sm:flex sm:flex-wrap gap-2">
  <button data-action="copy-result" class="btn-secondary text-xs py-2.5 sm:py-2 flex items-center justify-center gap-1.5"><i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Result</button>
  <button data-action="download-result" class="btn-secondary text-xs py-2.5 sm:py-2 flex items-center justify-center gap-1.5"><i data-lucide="download" class="w-3.5 h-3.5"></i> Download Report</button>
  <button data-action="share-result" class="btn-secondary text-xs py-2.5 sm:py-2 flex items-center justify-center gap-1.5"><i data-lucide="share-2" class="w-3.5 h-3.5"></i> Share Report</button>
</div>
    </div>`;
}

// Animates the risk bar width in and wires up copy/download/share buttons.
// Safe to call multiple times; only affects elements inside `root`.
export function mountResultCard(root) {
  const bar = root.querySelector("[data-risk-bar]");
  if (bar) requestAnimationFrame(() => (bar.style.width = `${bar.dataset.riskBar}%`));

  const card = root.querySelector("[data-result-card]");
  if (!card) return;
  const result = JSON.parse(card.dataset.resultCard);

  const buildText = () =>
    `${result.title} Result\nRisk Score: ${result.riskScore}%\nStatus: ${result.status}\nReasons:\n${(result.reasons || [])
      .map((r) => `- ${r}`)
      .join("\n")}`;

  card.querySelector('[data-action="copy-result"]')?.addEventListener("click", () => {
    navigator.clipboard.writeText(buildText());
    toast.success("Result copied to clipboard");
  });

  card.querySelector('[data-action="download-result"]')?.addEventListener("click", async () => {
  const text = `CyberSure Security Report\n\n${buildText()}\n\nGenerated: ${new Date().toLocaleString()}`;
  const filename = `cybersure-report-${Date.now()}.txt`;

  const file = new File([text], filename, { type: "text/plain" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "CyberSure Security Report" });
      toast.success("Report ready to save");
      return;
    } catch {
      return;
    }
  }

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
});

  card.querySelector('[data-action="share-result"]')?.addEventListener("click", async () => {
    const text = `CyberSure security scan result: ${result.status} (${result.riskScore}% risk)`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "CyberSure Security Report", text });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Share text copied to clipboard");
    }
  });
}

export function spinner(size = "w-10 h-10") {
  return `<div class="min-h-[60vh] flex items-center justify-center"><div class="${size} border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>`;
}
