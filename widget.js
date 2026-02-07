(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    const cfg = {
      header: "👋 Need help?",
      intro: "Tell us what’s going on and we’ll get this straight to the team.",
      fontFamily: "Arial, Helvetica, sans-serif",
      privacyUrl: "/privacy",
      endpoint: "https://aismarthub-chat-widget.netlify.app/.netlify/functions/enquiry",

      // Button
      buttonText: "👋 Need help?",
      buttonBg: "#2563eb",
      buttonColor: "#ffffff",

      // Panel sizing
      panelWidth: 420,
      panelHeight: 520,

      // OPTIONAL: where to send the form (we can wire this later)
      // endpoint: "https://ai-smart-hub-chat-widget.netlify.app/.netlify/functions/enquiry",
      endpoint: "https://ai-smart-hub-chat-widget.netlify.app/.netlify/functions/enquiry",

      ...((window.MYCW_CONFIG) ? window.MYCW_CONFIG : {})
     

    };

    // Prevent double-inject
    if (window.__MYCW_LOADED__) return;
    window.__MYCW_LOADED__ = true;

    // Basic HTML escape
    const esc = (s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    /* ---------- Styles ---------- */
    const style = document.createElement("style");
    style.innerHTML = `
      :root .mycw-root,
      :root .mycw-root *,
      :root .mycw-fab,
      :root .mycw-panel,
      :root .mycw-panel * {
        font-family: ${cfg.fontFamily} !important;
        box-sizing: border-box;
      }

      .mycw-fab {
        position: fixed;
        right: 20px;
        bottom: calc(20px + env(safe-area-inset-bottom, 0px));
        z-index: 2147483647;

        background: ${cfg.buttonBg};
        color: ${cfg.buttonColor};
        border-radius: 999px;
        padding: 12px 16px;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        font-weight: 700;
        box-shadow: 0 10px 30px rgba(0,0,0,.20);
      }

      .mycw-panel {
        position: fixed;
        right: 16px;
        left: auto;
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        z-index: 2147483647;

        width: min(${Number(cfg.panelWidth) || 420}px, calc(100vw - 32px));

        --mycw-vcap: calc(
          100dvh - 32px
          - env(safe-area-inset-top, 0px)
          - env(safe-area-inset-bottom, 0px)
        );
        --mycw-vcap2: calc(
          100svh - 32px
          - env(safe-area-inset-top, 0px)
          - env(safe-area-inset-bottom, 0px)
        );

        height: min(${Number(cfg.panelHeight) || 520}px, var(--mycw-vcap));
        height: min(${Number(cfg.panelHeight) || 520}px, var(--mycw-vcap2));
        max-height: var(--mycw-vcap);
        max-height: var(--mycw-vcap2);

        display: flex;
        flex-direction: column;

        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,.25);
      }

      .mycw-header {
        position: sticky;
        top: 0;
        z-index: 2;

        background: #000;
        color: #fff;
        padding: 14px 52px 14px 16px;
        font-weight: 700;
      }

      .mycw-close {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 3;

        cursor: pointer;
        font-size: 22px;
        line-height: 1;
        padding: 6px 8px;
        -webkit-tap-highlight-color: transparent;
      }

      .mycw-body {
        padding: 16px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;

        flex: 1 1 auto;
        min-height: 0;
      }

      .mycw-privacy {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 12px;
      }
      .mycw-privacy a { color: inherit; }

      /* Form */
      .mycw-form { margin-top: 12px; }
      .mycw-row { margin-bottom: 10px; }
      .mycw-label { display:block; font-size: 12px; opacity:.8; margin-bottom: 6px; }
      .mycw-input, .mycw-textarea {
        width: 100%;
        border: 1px solid rgba(0,0,0,.15);
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
      }
      .mycw-textarea { min-height: 90px; resize: vertical; }

      .mycw-actions { display:flex; gap:10px; align-items:center; margin-top: 10px; }
      .mycw-btn {
        background: ${cfg.buttonBg};
        color: ${cfg.buttonColor};
        border: none;
        border-radius: 10px;
        padding: 10px 12px;
        font-weight: 700;
        cursor: pointer;
        flex: 0 0 auto;
      }
      .mycw-btn[disabled] { opacity:.6; cursor:not-allowed; }

      .mycw-status {
        font-size: 12px;
        opacity: .85;
        line-height: 1.3;
      }

      /* honeypot hidden */
      .mycw-hp {
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        height: 1px !important;
        width: 1px !important;
        overflow: hidden !important;
      }

      @media (max-width: 520px) {
        .mycw-panel {
          right: 16px;
          left: 16px;
          width: auto;
        }
        .mycw-fab { right: 16px; }
      }
    `;
    document.head.appendChild(style);

    /* ---------- Markup ---------- */
    const fab = document.createElement("div");
    fab.className = "mycw-fab";
    fab.textContent = cfg.buttonText || "Need help?";

    const panel = document.createElement("div");
    panel.className = "mycw-panel";
    panel.style.display = "none";

    panel.innerHTML = `
      <div class="mycw-header">
        ${esc(cfg.header)}
        <span class="mycw-close" aria-label="Close" role="button">&times;</span>
      </div>

      <div class="mycw-body">
        <p>${esc(cfg.intro)}</p>

        <form class="mycw-form">
          <div class="mycw-hp">
            <label>Leave this empty</label>
            <input class="mycw-input" name="website" autocomplete="off" />
          </div>

          <div class="mycw-row">
            <label class="mycw-label">Name</label>
            <input class="mycw-input" name="name" placeholder="Your name" />
          </div>

          <div class="mycw-row">
            <label class="mycw-label">Email</label>
            <input class="mycw-input" name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div class="mycw-row">
            <label class="mycw-label">Phone</label>
            <input class="mycw-input" name="phone" placeholder="Optional" />
          </div>

          <div class="mycw-row">
            <label class="mycw-label">Message</label>
            <textarea class="mycw-textarea" name="message" placeholder="How can we help?" required></textarea>
          </div>

          <div class="mycw-actions">
            <button class="mycw-btn" type="submit">Send</button>
            <div class="mycw-status" aria-live="polite"></div>
          </div>
        </form>

        <div class="mycw-privacy">
          By submitting this enquiry you agree to our
          <a href="${esc(cfg.privacyUrl)}" target="_blank" rel="noopener">privacy policy</a>.
        </div>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    /* ---------- Behaviour ---------- */
    function openWidget() {
      panel.style.display = "flex";
      fab.style.display = "none";
    }

    function closeWidget() {
      panel.style.display = "none";
      fab.style.display = "block";
    }

    fab.addEventListener("click", openWidget);

    const closeBtn = panel.querySelector(".mycw-close");
    if (closeBtn) closeBtn.addEventListener("click", closeWidget);

    // Form logic
    const form = panel.querySelector(".mycw-form");
    const statusEl = panel.querySelector(".mycw-status");
    const submitBtn = panel.querySelector(".mycw-btn");

    function setStatus(msg) {
      if (statusEl) statusEl.textContent = msg || "";
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const data = new FormData(form);
      const payload = {
        name: (data.get("name") || "").toString().trim(),
        email: (data.get("email") || "").toString().trim(),
        phone: (data.get("phone") || "").toString().trim(),
        message: (data.get("message") || "").toString().trim(),
        website: (data.get("website") || "").toString().trim(), // honeypot
        pageUrl: window.location.href,
        ts: new Date().toISOString()
      };

      // Honeypot hit => silently pretend success
      if (payload.website) {
        form.reset();
        setStatus("Thanks — we’ve received your enquiry.");
        return;
      }

      if (!payload.email || !isValidEmail(payload.email)) {
        setStatus("Please enter a valid email address.");
        return;
      }
      if (!payload.message) {
        setStatus("Please type a message.");
        return;
      }

      submitBtn.disabled = true;
      setStatus("Sending…");

      try {
        // If endpoint not wired yet, keep UX smooth but don’t break
        if (!cfg.endpoint) {
          // For now just show success (we’ll wire the endpoint next)
          form.reset();
          setStatus("Thanks — we’ve received your enquiry.");
          submitBtn.disabled = false;
          return;
        }

        const res = await fetch(cfg.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "cors"
        });

        if (!res.ok) {
          throw new Error("Bad response: " + res.status);
        }

        form.reset();
        setStatus("Thanks — we’ve received your enquiry.");
      } catch (err) {
        console.warn("[Widget] Enquiry send failed:", err);
        setStatus("Sorry — couldn’t send right now. Please try again in a moment.");
      } finally {
        submitBtn.disabled = false;
      }
    });
  });
})();
