import { api } from "../api.js";
import { isAuthenticated } from "../auth.js";
import { navigate } from "../router.js";
import { toast, icons, resultCardHtml, mountResultCard, escapeHtml } from "../ui.js";

const tabs = [
  { key: "website", label: "Website", icon: "globe" },
  { key: "email", label: "Email", icon: "mail" },
  { key: "whatsapp", label: "SMS", icon: "message-circle" },
  { key: "job", label: "Job Offer", icon: "briefcase" },
  { key: "qr", label: "QR Code", icon: "qr-code" },
  { key: "phone", label: "Phone Number", icon: "phone" },
  { key: "login", label: "Fake Login", icon: "key-round" },
  { key: "screenshot", label: "Screenshot", icon: "image" },
  { key: "document", label: "Document", icon: "file-text" },
];

function guardAuth() {
  if (!isAuthenticated()) {
    toast.error("Please login to run a scan");
    navigate("/login");
    return false;
  }
  return true;
}

async function runCheck(btn, requestFn) {
  const label = btn.querySelector("span");
  const originalText = label ? label.textContent : btn.textContent;
  btn.disabled = true;
  if (label) label.textContent = "Analyzing...";
  try {
    const { result } = await requestFn();
    return result;
  } catch (err) {
    toast.error(err.message || "Something went wrong");
    return null;
  } finally {
    btn.disabled = false;
    if (label) label.textContent = originalText;
  }
}

function submitButtonHtml() {
  return `<button type="submit" class="btn-primary flex items-center gap-2"><span>Analyze</span></button>`;
}

// ---------- Website / Email / SMS / Phone / Login: simple single-field checkers ----------

const SIMPLE_CHECKERS = {
  website: {
    title: "Website Scan",
    fieldLabel: "Website URL",
    placeholder: "https://example.com",
    icon: "globe",
    input: "text",
    endpoint: "/checkWebsite",
    buildBody: (v) => ({ url: v.trim() }),
    emptyError: "Please enter a website URL",
  },
  login: {
    title: "Fake Login Page Scan",
    fieldLabel: "Login Page URL",
    placeholder: "http://secure-bank-verify.net/login",
    icon: "key-round",
    input: "text",
    endpoint: "/checkLogin",
    buildBody: (v) => ({ url: v.trim() }),
    emptyError: "Please enter a login page URL",
  },
  phone: {
    title: "Phone Number Scan",
    fieldLabel: "Phone Number",
    placeholder: "+91 9999999999",
    icon: "phone",
    input: "text",
    endpoint: "/checkPhone",
    buildBody: (v) => ({ phoneNumber: v.trim() }),
    emptyError: "Please enter a phone number",
    extra: (result) => `
      <div class="card p-4 mt-3 flex gap-6 text-sm">
        <div><span class="text-muted/70">Country: </span><span class="text-ink/90">${escapeHtml(result.country)}</span></div>
        ${typeof result.simulatedReports === "number" ? `<div><span class="text-muted/70">Spam Reports: </span><span class="text-ink/90">${result.simulatedReports}</span></div>` : ""}
      </div>`,
  },
  email: {
    title: "Email Scan",
    fieldLabel: "Paste Email",
    placeholder: "From: support@paypal-secure.com\nSubject: Your account will be suspended...",
    icon: null,
    input: "textarea",
    endpoint: "/checkEmail",
    buildBody: (v) => ({ emailText: v.trim() }),
    emptyError: "Please paste the email content",
  },
  whatsapp: {
    title: "SMS Scan",
    fieldLabel: "Paste Message",
    placeholder: "Congratulations! You have won a lottery of $10,000...",
    icon: null,
    input: "textarea",
    endpoint: "/checkWhatsapp",
    buildBody: (v) => ({ message: v.trim() }),
    emptyError: "Please paste the message",
  },
};

function mountSimpleChecker(root, key) {
  const cfg = SIMPLE_CHECKERS[key];
  const fieldHtml =
    cfg.input === "textarea"
      ? `<textarea id="sc-input" rows="${key === "email" ? 8 : 6}" class="input-field resize-none" placeholder="${escapeHtml(cfg.placeholder)}"></textarea>`
      : `<div class="relative">
          ${cfg.icon ? `<i data-lucide="${cfg.icon}" class="w-4 h-4 text-muted/70 absolute left-3.5 top-1/2 -translate-y-1/2"></i>` : ""}
          <input id="sc-input" type="text" class="input-field ${cfg.icon ? "pl-10" : ""}" placeholder="${escapeHtml(cfg.placeholder)}" />
        </div>`;

  root.innerHTML = `
    <div>
      <form id="sc-form" class="space-y-4">
        <div><label class="label">${cfg.fieldLabel}</label>${fieldHtml}</div>
        ${submitButtonHtml()}
      </form>
      <div id="sc-result"></div>
    </div>`;
  icons();

  root.querySelector("#sc-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = root.querySelector("#sc-input").value;
    if (!value.trim()) return toast.error(cfg.emptyError);
    if (!guardAuth()) return;

    const btn = root.querySelector('button[type="submit"]');
    const result = await runCheck(btn, () => api.post(cfg.endpoint, cfg.buildBody(value)));
    if (!result) return;

    const resultBox = root.querySelector("#sc-result");
    resultBox.innerHTML = resultCardHtml(result, cfg.title) + (cfg.extra ? cfg.extra(result) : "");
    icons();
    mountResultCard(resultBox);
  });
}

// ---------- Job checker: text OR PDF upload ----------

function mountJobChecker(root) {
  root.innerHTML = `
    <div>
      <form id="job-form" class="space-y-4">
        <div>
          <label class="label">Paste Job Offer Email</label>
          <textarea id="job-text" rows="6" class="input-field resize-none" placeholder="Dear candidate, you are selected... please pay Rs.2000 registration fee..."></textarea>
        </div>
        <div>
          <label class="label">Or Upload PDF Offer Letter</label>
          <label class="flex items-center justify-center gap-2 border border-dashed border-ink/15 rounded-lg py-6 cursor-pointer hover:border-ink/40 transition-colors text-sm text-muted">
            <i data-lucide="upload" class="w-4 h-4"></i><span id="job-filename">Click to upload PDF (max 10MB)</span>
            <input id="job-file" type="file" accept=".pdf" class="hidden" />
          </label>
        </div>
        ${submitButtonHtml()}
      </form>
      <div id="job-result"></div>
    </div>`;
  icons();

  const fileInput = root.querySelector("#job-file");
  fileInput.addEventListener("change", () => {
    root.querySelector("#job-filename").textContent = fileInput.files[0]?.name || "Click to upload PDF (max 10MB)";
  });

  root.querySelector("#job-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = root.querySelector("#job-text").value.trim();
    const file = fileInput.files[0];
    if (!text && !file) return toast.error("Paste the offer text or upload a PDF");
    if (!guardAuth()) return;

    const btn = root.querySelector('button[type="submit"]');
    const result = await runCheck(btn, () => {
      const formData = new FormData();
      if (text) formData.append("text", text);
      if (file) formData.append("document", file);
      return api.post("/checkJob", formData);
    });
    if (!result) return;

    const resultBox = root.querySelector("#job-result");
    resultBox.innerHTML = resultCardHtml(result, "Job Offer Scan");
    icons();
    mountResultCard(resultBox);
  });
}

// ---------- QR checker: image upload, decoded client-side with jsQR ----------

function decodeQrFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (code) resolve(code.data);
        else reject(new Error("Could not detect a QR code in this image"));
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function mountQrChecker(root) {
  let decodedUrl = "";
  root.innerHTML = `
    <div>
      <form id="qr-form" class="space-y-4">
        <div>
          <label class="label">Upload QR Code Image</label>
          <label class="flex items-center justify-center gap-2 border border-dashed border-ink/15 rounded-lg py-6 cursor-pointer hover:border-ink/40 transition-colors text-sm text-muted">
            <i data-lucide="qr-code" class="w-4 h-4"></i><span id="qr-filename">Click to upload a QR code image</span>
            <input id="qr-file" type="file" accept="image/*" class="hidden" />
          </label>
        </div>
        <div id="qr-decoded"></div>
        <button type="submit" class="btn-primary flex items-center gap-2" id="qr-submit" disabled><span>Analyze</span></button>
      </form>
      <div id="qr-result"></div>
    </div>`;
  icons();

  const fileInput = root.querySelector("#qr-file");
  fileInput.addEventListener("change", async () => {
    const f = fileInput.files[0];
    decodedUrl = "";
    root.querySelector("#qr-decoded").innerHTML = "";
    root.querySelector("#qr-result").innerHTML = "";
    root.querySelector("#qr-submit").disabled = true;
    if (!f) return;
    root.querySelector("#qr-filename").textContent = f.name;
    try {
      decodedUrl = await decodeQrFromFile(f);
      root.querySelector("#qr-decoded").innerHTML = `<div class="text-sm bg-background border border-ink/10 rounded-lg px-4 py-3 text-ink/70 break-all"><span class="text-muted/70">Decoded URL: </span>${escapeHtml(decodedUrl)}</div>`;
      root.querySelector("#qr-submit").disabled = false;
      toast.success("QR code decoded successfully");
    } catch (err) {
      toast.error(err.message);
    }
  });

  root.querySelector("#qr-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!decodedUrl) return toast.error("Upload a QR image to decode first");
    if (!guardAuth()) return;

    const btn = root.querySelector("#qr-submit");
    const result = await runCheck(btn, () => api.post("/checkQR", { decodedUrl }));
    if (!result) return;

    const resultBox = root.querySelector("#qr-result");
    resultBox.innerHTML = resultCardHtml(result, "QR Code Scan");
    icons();
    mountResultCard(resultBox);
  });
}

// ---------- Screenshot checker: image upload + preview ----------

function mountScreenshotChecker(root) {
  root.innerHTML = `
    <div>
      <form id="ss-form" class="space-y-4">
        <div>
          <label class="label">Upload Screenshot</label>
          <label class="flex items-center justify-center gap-2 border border-dashed border-ink/15 rounded-lg py-6 cursor-pointer hover:border-ink/40 transition-colors text-sm text-muted">
            <i data-lucide="image" class="w-4 h-4"></i><span id="ss-filename">Click to upload an image (max 10MB)</span>
            <input id="ss-file" type="file" accept="image/*" class="hidden" />
          </label>
        </div>
        <div id="ss-preview"></div>
        ${submitButtonHtml()}
      </form>
      <div id="ss-result"></div>
    </div>`;
  icons();

  const fileInput = root.querySelector("#ss-file");
  fileInput.addEventListener("change", () => {
    const f = fileInput.files[0];
    root.querySelector("#ss-result").innerHTML = "";
    if (!f) return;
    root.querySelector("#ss-filename").textContent = f.name;
    const url = URL.createObjectURL(f);
    root.querySelector("#ss-preview").innerHTML = `<div class="relative rounded-lg overflow-hidden border border-ink/10 max-h-72"><img src="${url}" alt="Preview" class="w-full object-cover max-h-72" /></div>`;
  });

  root.querySelector("#ss-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) return toast.error("Please upload a screenshot");
    if (!guardAuth()) return;

    const btn = root.querySelector('button[type="submit"]');
    const result = await runCheck(btn, () => {
      const formData = new FormData();
      formData.append("screenshot", file);
      return api.post("/checkScreenshot", formData);
    });
    if (!result) return;

    const areasHtml =
      result.suspiciousAreas?.length > 0
        ? `<div class="card p-4 mt-3">
            <h4 class="text-sm font-semibold text-ink/90 mb-2">Highlighted Suspicious Areas</h4>
            <div class="flex flex-wrap gap-2">${result.suspiciousAreas.map((a) => `<span class="text-xs bg-danger/10 text-danger border border-danger/30 rounded-full px-3 py-1">${escapeHtml(a)}</span>`).join("")}</div>
          </div>`
        : "";

    const resultBox = root.querySelector("#ss-result");
    resultBox.innerHTML = resultCardHtml(result, "Screenshot Scan") + areasHtml;
    icons();
    mountResultCard(resultBox);
  });
}

// ---------- Document checker: PDF/DOCX/image upload ----------

function mountDocumentChecker(root) {
  root.innerHTML = `
    <div>
      <form id="doc-form" class="space-y-4">
        <div>
          <label class="label">Upload Document (PDF, DOCX, or Image)</label>
          <label class="flex items-center justify-center gap-2 border border-dashed border-ink/15 rounded-lg py-6 cursor-pointer hover:border-ink/40 transition-colors text-sm text-muted">
            <i data-lucide="file-text" class="w-4 h-4"></i><span id="doc-filename">Click to upload (max 10MB)</span>
            <input id="doc-file" type="file" accept=".pdf,.docx,.doc,image/*" class="hidden" />
          </label>
        </div>
        ${submitButtonHtml()}
      </form>
      <div id="doc-result"></div>
    </div>`;
  icons();

  const fileInput = root.querySelector("#doc-file");
  fileInput.addEventListener("change", () => {
    root.querySelector("#doc-filename").textContent = fileInput.files[0]?.name || "Click to upload (max 10MB)";
  });

  root.querySelector("#doc-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) return toast.error("Please upload a document");
    if (!guardAuth()) return;

    const btn = root.querySelector('button[type="submit"]');
    const result = await runCheck(btn, () => {
      const formData = new FormData();
      formData.append("document", file);
      return api.post("/checkDocument", formData);
    });
    if (!result) return;

    const flagsHtml = result.flags
      ? `<div class="card p-4 mt-3 flex gap-4 text-sm">
          <span class="${result.flags.fakeLogo ? "text-danger" : "text-success"}">${result.flags.fakeLogo ? "⚠ Possible fake logo" : "✓ Logo looks consistent"}</span>
          <span class="${result.flags.edited ? "text-danger" : "text-success"}">${result.flags.edited ? "⚠ Possibly edited" : "✓ No edit indicators"}</span>
        </div>`
      : "";

    const resultBox = root.querySelector("#doc-result");
    resultBox.innerHTML = resultCardHtml(result, "Document Scan") + flagsHtml;
    icons();
    mountResultCard(resultBox);
  });
}

const CHECKER_MOUNTERS = {
  website: (r) => mountSimpleChecker(r, "website"),
  email: (r) => mountSimpleChecker(r, "email"),
  whatsapp: (r) => mountSimpleChecker(r, "whatsapp"),
  job: mountJobChecker,
  qr: mountQrChecker,
  phone: (r) => mountSimpleChecker(r, "phone"),
  login: (r) => mountSimpleChecker(r, "login"),
  screenshot: mountScreenshotChecker,
  document: mountDocumentChecker,
};

export function render(root, { query }) {
  let active = tabs.find((t) => t.key === query.tab)?.key || "website";

  const draw = () => {
    root.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="mb-8 text-center">
          <h1 class="font-display text-3xl font-normal tracking-tight">Scam Detector</h1>
          <p class="text-muted mt-2">Choose a scan type and paste what you'd like CyberSure to analyze.</p>
        </div>

        <div class="flex flex-nowrap gap-2 mb-6 overflow-x-auto pb-2" id="sd-tabs">
          ${tabs
            .map(
              (t) => `
            <button data-tab="${t.key}" class="flex items-center gap-1.5 whitespace-nowrap shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                active === t.key ? "bg-primary text-onPrimary border-primary" : "bg-card text-ink/70 border-ink/5 hover:border-ink/20"
              }">
              <i data-lucide="${t.icon}" class="w-4 h-4"></i>${t.label}
            </button>`
            )
            .join("")}
        </div>

        <div class="card p-6 sm:p-8 animate-fade-in-up" id="sd-panel"></div>
      </div>`;
    icons();

    root.querySelectorAll("#sd-tabs [data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.dataset.tab;
        history.replaceState({}, "", `/scam-detector?tab=${active}`);
        draw();
      });
    });

    const panel = root.querySelector("#sd-panel");
    (CHECKER_MOUNTERS[active] || CHECKER_MOUNTERS.website)(panel);
  };

  draw();
}
