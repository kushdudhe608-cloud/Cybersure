import { api } from "../api.js";
import { statusBadgeClass, escapeHtml, icons } from "../ui.js";

const TYPES = ["website", "email", "whatsapp", "job", "qr", "phone", "login", "screenshot", "document"];
const STATUSES = ["Safe", "Suspicious", "Dangerous"];

export function render(root) {
  const filters = { page: 1, search: "", type: "", status: "" };

  const load = async () => {
    const tbody = root.querySelector("#history-tbody-wrap");
    tbody.innerHTML = `<div class="py-16 flex justify-center"><div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>`;

    const params = new URLSearchParams({ page: filters.page, limit: 10 });
    if (filters.search) params.set("search", filters.search);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);

    let data;
    try {
      data = await api.get(`/history?${params.toString()}`);
    } catch {
      tbody.innerHTML = `<p class="text-sm text-muted/70 py-16 text-center">Could not load history.</p>`;
      return;
    }

    root.querySelector("#history-total").textContent = `${data.total} total scan${data.total !== 1 ? "s" : ""} recorded.`;

    if (data.items.length === 0) {
      tbody.innerHTML = `<p class="text-sm text-muted/70 py-16 text-center">No scans match your filters.</p>`;
    } else {
      tbody.innerHTML = `<div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-ink/5"><tr class="text-left text-muted">
          <th class="p-4 font-medium">Date</th><th class="p-4 font-medium">Type</th><th class="p-4 font-medium">Input</th>
          <th class="p-4 font-medium">Risk Score</th><th class="p-4 font-medium">Status</th>
        </tr></thead>
        <tbody>
          ${data.items
            .map(
              (item) => `
            <tr class="border-t border-ink/5 hover:bg-white/[0.02]">
              <td class="p-4 text-muted/70 whitespace-nowrap">${new Date(item.createdAt).toLocaleString()}</td>
              <td class="p-4 capitalize text-ink/70">${escapeHtml(item.type)}</td>
              <td class="p-4 text-muted max-w-[280px] truncate">${escapeHtml(item.input)}</td>
              <td class="p-4 text-ink/70">${item.riskScore}%</td>
              <td class="p-4"><span class="${statusBadgeClass(item.status)}">${item.status}</span></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table></div>`;
    }

    root.querySelector("#history-pagination").innerHTML =
      data.pages > 1
        ? `
        <button id="hist-prev" class="btn-secondary p-2" ${filters.page === 1 ? "disabled" : ""}><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
        <span class="text-sm text-muted">Page ${data.page} of ${data.pages}</span>
        <button id="hist-next" class="btn-secondary p-2" ${filters.page === data.pages ? "disabled" : ""}><i data-lucide="chevron-right" class="w-4 h-4"></i></button>`
        : "";
    icons();

    root.querySelector("#hist-prev")?.addEventListener("click", () => {
      filters.page = Math.max(1, filters.page - 1);
      load();
    });
    root.querySelector("#hist-next")?.addEventListener("click", () => {
      filters.page = Math.min(data.pages, filters.page + 1);
      load();
    });
  };

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-2xl font-normal tracking-tight mb-1">Scan History</h1>
      <p class="text-muted mb-6" id="history-total">Loading...</p>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <i data-lucide="search" class="w-4 h-4 text-muted/70 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
          <input id="hist-search" placeholder="Search by input (URL, message, filename)..." class="input-field pl-10" />
        </div>
        <select id="hist-type" class="input-field sm:w-48">
          <option value="">All Types</option>
          ${TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")}
        </select>
        <select id="hist-status" class="input-field sm:w-48">
          <option value="">All Statuses</option>
          ${STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
      </div>

      <div class="card overflow-hidden" id="history-tbody-wrap"></div>
      <div class="flex items-center justify-center gap-3 mt-6" id="history-pagination"></div>
    </div>`;

  let searchTimer;
  root.querySelector("#hist-search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filters.page = 1;
      filters.search = e.target.value;
      load();
    }, 300);
  });
  root.querySelector("#hist-type").addEventListener("change", (e) => {
    filters.page = 1;
    filters.type = e.target.value;
    load();
  });
  root.querySelector("#hist-status").addEventListener("change", (e) => {
    filters.page = 1;
    filters.status = e.target.value;
    load();
  });

  load();
}
