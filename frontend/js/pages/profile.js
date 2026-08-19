import { api } from "../api.js";
import { state as authState } from "../auth.js";
import { toast, icons } from "../ui.js";

export async function render(root) {
  let user = authState.user;

  const draw = () => {
    const initials = (user?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    root.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="card p-8 flex flex-col sm:flex-row items-center gap-6 mb-8 animate-fade-in-up">
          <div class="w-20 h-20 rounded-full bg-primary/20 border-2 border-ink/20 flex items-center justify-center text-2xl font-bold text-primary">${initials}</div>
          <div class="text-center sm:text-left">
            <h1 class="font-display text-2xl font-normal tracking-tight">${user?.name || ""}</h1>
            <p class="text-muted flex items-center gap-1.5 justify-center sm:justify-start mt-1"><i data-lucide="mail" class="w-4 h-4"></i> ${user?.email || ""}</p>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4 mb-8">
          <div class="card p-6 flex items-center gap-4">
            <div class="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center"><i data-lucide="scan-line" class="w-5 h-5 text-primary"></i></div>
            <div><div class="font-display text-xl font-normal tracking-tight">${user?.totalScans ?? 0}</div><div class="text-xs text-muted">Total Scans</div></div>
          </div>
          <div class="card p-6 flex items-center gap-4">
            <div class="w-11 h-11 rounded-lg bg-danger/10 flex items-center justify-center"><i data-lucide="shield-alert" class="w-5 h-5 text-danger"></i></div>
            <div><div class="font-display text-xl font-normal tracking-tight">${user?.scamReports ?? 0}</div><div class="text-xs text-muted">Scam Reports</div></div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold mb-4 flex items-center gap-2"><i data-lucide="settings" class="w-4 h-4"></i> Account Settings</h3>
          <form id="profile-form" class="space-y-4">
            <div><label class="label">Name</label><input id="profile-name" class="input-field" value="${user?.name || ""}" /></div>
            <div><label class="label">Email</label><input class="input-field" value="${user?.email || ""}" disabled /></div>
            <button type="submit" class="btn-primary flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i> Save Changes</button>
          </form>
        </div>
      </div>`;
    icons();
    root.querySelector("#profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      toast.success("Settings saved (demo only - not persisted)");
    });
  };

  draw();
  try {
    const { user: fresh } = await api.get("/auth/me");
    user = fresh;
    draw();
  } catch {
    /* keep cached user */
  }
}
