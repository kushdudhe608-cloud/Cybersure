import { api } from "../api.js";
import { spinner, escapeHtml, icons } from "../ui.js";

export async function render(root) {
  root.innerHTML = spinner();
  let stats = null;
  try {
    stats = await api.get("/admin/stats");
  } catch {
    /* leave stats null */
  }

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: "users" },
    { label: "Total Scans", value: stats?.totalScans ?? 0, icon: "scan-line" },
    { label: "Today's Scans", value: stats?.todayScans ?? 0, icon: "calendar-clock" },
    { label: "Most Common Scam", value: stats?.mostCommonScam ?? "N/A", icon: "trending-up", isText: true },
  ];

  const reports = stats?.latestReports || [];

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-2xl font-normal tracking-tight mb-1">Admin Panel</h1>
      <p class="text-muted mb-8">Platform-wide statistics and the latest scam reports.</p>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${cards
          .map(
            (c, i) => `
          <div class="card p-5 animate-fade-in-up" style="animation-delay:${i * 0.05}s">
            <i data-lucide="${c.icon}" class="w-5 h-5 mb-3 text-primary"></i>
            <div class="font-display font-normal tracking-tight ${c.isText ? "text-lg capitalize" : "text-2xl"}">${escapeHtml(String(c.value))}</div>
            <div class="text-xs text-muted mt-1">${c.label}</div>
          </div>`
          )
          .join("")}
      </div>

      <div class="card p-6">
        <h3 class="font-semibold mb-4">Latest Scam Reports</h3>
        ${
          reports.length === 0
            ? `<p class="text-sm text-muted/70 py-6 text-center">No user-submitted reports yet.</p>`
            : `<div class="overflow-x-auto"><table class="w-full text-sm">
                <thead><tr class="text-left text-muted/70 border-b border-ink/5">
                  <th class="pb-2 font-medium">User</th><th class="pb-2 font-medium">Scam Type</th>
                  <th class="pb-2 font-medium">Description</th><th class="pb-2 font-medium">Status</th><th class="pb-2 font-medium">Date</th>
                </tr></thead>
                <tbody>
                  ${reports
                    .map(
                      (r) => `
                    <tr class="border-b border-ink/5 last:border-0">
                      <td class="py-3 text-ink/70">${escapeHtml(r.user?.name || "Unknown")}</td>
                      <td class="py-3 capitalize text-ink/70">${escapeHtml(r.scamType)}</td>
                      <td class="py-3 text-muted max-w-[240px] truncate">${escapeHtml(r.description)}</td>
                      <td class="py-3 text-muted">${escapeHtml(r.status)}</td>
                      <td class="py-3 text-muted/70">${new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table></div>`
        }
      </div>
    </div>`;
  icons();
}
