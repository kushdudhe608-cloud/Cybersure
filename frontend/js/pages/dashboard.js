import { api } from "../api.js";
import { state as authState } from "../auth.js";
import { getTheme } from "../theme.js";
import { spinner, statusBadgeClass, escapeHtml, icons } from "../ui.js";

const CHART_COLORS = {
  dark: { safe: "#34D399", suspicious: "#FBBF24", dangerous: "#F85149", bar: "#00B3DD", axis: "#9F9FA0", grid: "rgba(245,245,247,0.06)" },
  light: { safe: "#16A34A", suspicious: "#B46006", dangerous: "#DC2626", bar: "#4B49AA", axis: "#6A6B6B", grid: "rgba(15,16,17,0.08)" },
};

let pieChart, barChart;

export async function render(root) {
  root.innerHTML = spinner();
  let stats = null;
  try {
    stats = await api.get("/history/dashboard");
  } catch {
    /* leave stats null */
  }

  const colors = CHART_COLORS[getTheme()];
  const pieData = [
    { name: "Safe", value: stats?.safe || 0 },
    { name: "Suspicious", value: stats?.suspicious || 0 },
    { name: "Dangerous", value: stats?.dangerous || 0 },
  ];
  const COLORS = { Safe: colors.safe, Suspicious: colors.suspicious, Dangerous: colors.dangerous };
  const barData = (stats?.byType || []).map((t) => ({ type: t._id, count: t.count }));
  const recent = stats?.recentActivity || [];

  const cards = [
    { label: "Today's Scans", value: stats?.todayScans ?? 0, icon: "scan-line", color: "text-primary" },
    { label: "Safe", value: stats?.safe ?? 0, icon: "shield-check", color: "text-success" },
    { label: "Suspicious", value: stats?.suspicious ?? 0, icon: "alert-triangle", color: "text-warning" },
    { label: "Dangerous", value: stats?.dangerous ?? 0, icon: "shield-alert", color: "text-danger" },
  ];

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-2xl font-normal tracking-tight mb-1">Welcome back, ${escapeHtml((authState.user?.name || "").split(" ")[0] || "")}</h1>
      <p class="text-muted mb-8">Here's a snapshot of your scanning activity.</p>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${cards
          .map(
            (c, i) => `
          <div class="card p-5 animate-fade-in-up" style="animation-delay:${i * 0.05}s">
            <i data-lucide="${c.icon}" class="w-5 h-5 mb-3 ${c.color}"></i>
            <div class="font-display text-2xl font-normal tracking-tight">${c.value}</div>
            <div class="text-xs text-muted mt-1">${c.label}</div>
          </div>`
          )
          .join("")}
      </div>

      <div class="grid lg:grid-cols-2 gap-6 mb-8">
        <div class="card p-6">
          <h3 class="font-semibold mb-4">Result Breakdown</h3>
          ${
            pieData.every((d) => d.value === 0)
              ? `<p class="text-sm text-muted/70 py-10 text-center">No scans yet - run your first scan to see stats here.</p>`
              : `<div style="height:240px"><canvas id="pie-chart"></canvas></div>
                 <div class="flex justify-center gap-5 mt-2">
                   ${pieData.map((d) => `<div class="flex items-center gap-1.5 text-xs text-muted"><span class="w-2.5 h-2.5 rounded-full" style="background:${COLORS[d.name]}"></span>${d.name}</div>`).join("")}
                 </div>`
          }
        </div>

        <div class="card p-6">
          <h3 class="font-semibold mb-4">Scans by Type</h3>
          ${
            barData.length === 0
              ? `<p class="text-sm text-muted/70 py-10 text-center">No scan data yet.</p>`
              : `<div style="height:240px"><canvas id="bar-chart"></canvas></div>`
          }
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Recent Activity</h3>
          <a href="/history" class="text-sm text-primary hover:underline">View all</a>
        </div>
        ${
          recent.length === 0
            ? `<p class="text-sm text-muted/70 py-6 text-center">No scans yet. <a href="/scam-detector" class="text-primary hover:underline">Run your first scan</a>.</p>`
            : `<div class="overflow-x-auto"><table class="w-full text-sm">
                <thead><tr class="text-left text-muted/70 border-b border-ink/5">
                  <th class="pb-2 font-medium">Type</th><th class="pb-2 font-medium">Input</th><th class="pb-2 font-medium">Risk</th>
                  <th class="pb-2 font-medium">Status</th><th class="pb-2 font-medium">Date</th>
                </tr></thead>
                <tbody>
                  ${recent
                    .map(
                      (item) => `
                    <tr class="border-b border-ink/5 last:border-0">
                      <td class="py-3 capitalize text-ink/70">${escapeHtml(item.type)}</td>
                      <td class="py-3 text-muted max-w-[220px] truncate">${escapeHtml(item.input)}</td>
                      <td class="py-3 text-ink/70">${item.riskScore}%</td>
                      <td class="py-3"><span class="${statusBadgeClass(item.status)}">${item.status}</span></td>
                      <td class="py-3 text-muted/70">${new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table></div>`
        }
      </div>
    </div>`;
  icons();

  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  const pieCanvas = root.querySelector("#pie-chart");
  if (pieCanvas && window.Chart) {
    pieChart = new Chart(pieCanvas, {
      type: "doughnut",
      data: { labels: pieData.map((d) => d.name), datasets: [{ data: pieData.map((d) => d.value), backgroundColor: pieData.map((d) => COLORS[d.name]), borderWidth: 0 }] },
      options: { cutout: "55%", plugins: { legend: { display: false } } },
    });
  }

  const barCanvas = root.querySelector("#bar-chart");
  if (barCanvas && window.Chart) {
    barChart = new Chart(barCanvas, {
      type: "bar",
      data: { labels: barData.map((d) => d.type), datasets: [{ data: barData.map((d) => d.count), backgroundColor: colors.bar, borderRadius: 6, maxBarThickness: 36 }] },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: colors.axis, font: { size: 12 } }, grid: { color: colors.grid } },
          y: { ticks: { color: colors.axis, font: { size: 12 }, precision: 0 }, grid: { color: colors.grid } },
        },
      },
    });
  }
}
