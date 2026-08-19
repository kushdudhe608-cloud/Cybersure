import { login } from "../auth.js";
import { navigate } from "../router.js";
import { toast, icons } from "../ui.js";

export function render(root) {
  root.innerHTML = `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-14">
      <div class="card p-8 w-full max-w-md animate-fade-in-up">
        <div class="flex flex-col items-center mb-6">
          <i data-lucide="shield" class="w-10 h-10 text-primary mb-2"></i>
          <h1 class="font-display text-2xl font-normal tracking-tight">Welcome back</h1>
          <p class="text-sm text-muted mt-1">Log in to your CyberSure account</p>
        </div>

        <form id="login-form" class="space-y-4">
          <div>
            <label class="label">Email</label>
            <input id="login-email" type="email" class="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label class="label">Password</label>
            <div class="relative">
              <input id="login-password" type="password" class="input-field pr-10" placeholder="••••••••" />
              <button type="button" id="login-toggle-pw" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted/70">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
            </div>
            <div class="text-right mt-1.5"><a href="#" class="text-xs text-primary hover:underline">Forgot Password?</a></div>
          </div>
          <button type="submit" id="login-submit" class="btn-primary w-full flex items-center justify-center gap-2">
            <span>Login</span>
          </button>
        </form>

        <p class="text-sm text-muted text-center mt-6">Don't have an account? <a href="/signup" class="text-primary hover:underline">Sign up</a></p>
        <p class="text-xs text-muted/70 text-center mt-4">Demo login: demo@cybersure.io / demo1234</p>
      </div>
    </div>`;

  const pwInput = root.querySelector("#login-password");
  root.querySelector("#login-toggle-pw").addEventListener("click", (e) => {
    const showing = pwInput.type === "text";
    pwInput.type = showing ? "password" : "text";
    e.currentTarget.innerHTML = `<i data-lucide="${showing ? "eye" : "eye-off"}" class="w-4 h-4"></i>`;
    icons();
  });

  root.querySelector("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = root.querySelector("#login-email").value.trim();
    const password = pwInput.value;
    if (!email || !password) return toast.error("Please fill in all fields");

    const btn = root.querySelector("#login-submit");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Logging in...";
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed");
      btn.disabled = false;
      btn.querySelector("span").textContent = "Login";
    }
  });
}
