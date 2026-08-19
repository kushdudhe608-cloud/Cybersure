import { signup } from "../auth.js";
import { navigate } from "../router.js";
import { toast } from "../ui.js";

export function render(root) {
  root.innerHTML = `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-14">
      <div class="card p-8 w-full max-w-md animate-fade-in-up">
        <div class="flex flex-col items-center mb-6">
          <i data-lucide="shield" class="w-10 h-10 text-primary mb-2"></i>
          <h1 class="font-display text-2xl font-normal tracking-tight">Create your account</h1>
          <p class="text-sm text-muted mt-1">Start scanning for scams in seconds</p>
        </div>

        <form id="signup-form" class="space-y-4">
          <div><label class="label">Name</label><input id="su-name" class="input-field" placeholder="Jane Doe" /></div>
          <div><label class="label">Email</label><input id="su-email" type="email" class="input-field" placeholder="you@example.com" /></div>
          <div><label class="label">Password</label><input id="su-password" type="password" class="input-field" placeholder="At least 6 characters" /></div>
          <div><label class="label">Confirm Password</label><input id="su-confirm" type="password" class="input-field" placeholder="Re-enter your password" /></div>
          <button type="submit" id="signup-submit" class="btn-primary w-full flex items-center justify-center gap-2"><span>Sign Up</span></button>
        </form>

        <p class="text-sm text-muted text-center mt-6">Already have an account? <a href="/login" class="text-primary hover:underline">Login</a></p>
      </div>
    </div>`;

  root.querySelector("#signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = root.querySelector("#su-name").value.trim();
    const email = root.querySelector("#su-email").value.trim();
    const password = root.querySelector("#su-password").value;
    const confirmPassword = root.querySelector("#su-confirm").value;

    if (!name || !email || !password || !confirmPassword) return toast.error("Please fill in all fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    const btn = root.querySelector("#signup-submit");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Creating account...";
    try {
      await signup(name, email, password, confirmPassword);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Signup failed");
      btn.disabled = false;
      btn.querySelector("span").textContent = "Sign Up";
    }
  });
}
