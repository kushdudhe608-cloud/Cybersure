export function render(root) {
  root.innerHTML = `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div class="relative mb-6 animate-fade-in-up">
        <div class="absolute inset-0 rounded-full bg-danger/20 blur-2xl animate-pulseSlow"></div>
        <i data-lucide="shield-off" class="w-14 h-14 text-danger relative"></i>
      </div>
      <div class="eyebrow mb-4 border-danger/20 bg-danger/10 text-danger">
        <span class="font-mono">404</span> No signal on this frequency
      </div>
      <h1 class="font-display text-3xl font-normal tracking-tight mb-2">Page not found</h1>
      <p class="text-muted mb-6 max-w-sm">The radar swept every ring and came up empty. This page doesn't exist, or it moved.</p>
      <a href="/" class="btn-primary flex items-center gap-2"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back to home</a>
    </div>`;
}
