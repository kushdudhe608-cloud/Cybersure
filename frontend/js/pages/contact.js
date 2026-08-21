import { toast } from "../ui.js";

export function render(root) {
  root.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="text-center mb-12">
        <h1 class="font-display text-3xl font-normal tracking-tight">Get in Touch</h1>
        <p class="text-muted mt-2">Questions, feedback, or want to report a false result? Reach out.</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <form id="contact-form" class="card p-6 space-y-4 animate-fade-in-up">
          <div>
            <label class="label">Name</label>
            <input id="contact-name" class="input-field" placeholder="Your name" />
          </div>
          <div>
            <label class="label">Email</label>
            <input id="contact-email" type="email" class="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label class="label">Message</label>
            <textarea id="contact-message" rows="5" class="input-field resize-none" placeholder="How can we help?"></textarea>
          </div>
          <button type="submit" id="contact-submit" class="btn-primary flex items-center gap-2">
            <i data-lucide="send" class="w-4 h-4"></i> <span>Send Message</span>
          </button>
        </form>

        <div class="space-y-4 animate-fade-in-up">
          <div class="card p-6 flex items-start gap-4">
            <i data-lucide="mail" class="w-5 h-5 text-primary mt-0.5"></i>
                       <div><div class="font-semibold text-sm">Email</div><div class="text-sm text-muted">cybersure2k26@gmail.com</div></div>
          </div>
          <div class="card p-6 flex items-start gap-4">
            <i data-lucide="phone" class="w-5 h-5 text-primary mt-0.5"></i>
            <div><div class="font-semibold text-sm">Phone</div><div class="text-sm text-muted">+91 70380 79775</div></div>
          <div class="card p-6 flex items-start gap-4">
            <i data-lucide="map-pin" class="w-5 h-5 text-primary mt-0.5"></i>
            <div><div class="font-semibold text-sm">Location</div><div class="text-sm text-muted">Pune, Maharashtra, India</div></div>
          </div>
          <div class="card overflow-hidden h-56 flex items-center justify-center text-muted/70 text-sm">Google Map Placeholder</div>
        </div>
      </div>
    </div>`;

  root.querySelector("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = root.querySelector("#contact-name").value.trim();
    const email = root.querySelector("#contact-email").value.trim();
    const message = root.querySelector("#contact-message").value.trim();
    if (!name || !email || !message) return toast.error("Please fill in all fields");

    const btn = root.querySelector("#contact-submit");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Sending...";
    setTimeout(() => {
      btn.disabled = false;
      btn.querySelector("span").textContent = "Send Message";
      root.querySelector("#contact-name").value = "";
      root.querySelector("#contact-email").value = "";
      root.querySelector("#contact-message").value = "";
      toast.success("Message sent! We'll get back to you soon.");
    }, 900);
  });
}
