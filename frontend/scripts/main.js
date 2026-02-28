// ============================================================
// main.js — CloudOps Copilot (COMPLETO)
// Inclui: particles, scroll reveal, mobile drawer + copilot
// ============================================================

// ── 1. PARTICLES ────────────────────────────────────────────
(function () {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, dots = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeDot() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.6 + 0.2,
      hue: Math.random() < 0.33 ? "255,60,172"
         : Math.random() < 0.5  ? "0,245,255"
         :                         "255,106,0"
    };
  }

  function init() {
    resize();
    dots = Array.from({ length: 90 }, makeDot);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.hue},${d.a})`;
      ctx.fill();

      d.x += d.dx;
      d.y += d.dy;
      if (d.x < 0 || d.x > W) d.dx *= -1;
      if (d.y < 0 || d.y > H) d.dy *= -1;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  init();
  draw();
})();


// ── 2. SCROLL REVEAL ────────────────────────────────────────
(function () {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  function showAll() {
    reveals.forEach(el => el.classList.add("on"));
  }

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    reveals.forEach(el => obs.observe(el));

    // Segurança: após 600ms mostra tudo que ainda não apareceu
    setTimeout(showAll, 600);
  } else {
    showAll();
  }
})();


// ── 3. MOBILE DRAWER ────────────────────────────────────────
(function () {
  const menuBtn  = document.getElementById("menuBtn");
  const menuClose = document.getElementById("menuClose");
  const drawer   = document.getElementById("drawer");
  const backdrop = document.getElementById("drawerBackdrop");

  if (!menuBtn || !drawer) return;

  function open()  { drawer.classList.add("open");  drawer.setAttribute("aria-hidden", "false"); }
  function close() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }

  menuBtn.addEventListener("click", open);
  if (menuClose) menuClose.addEventListener("click", close);
  if (backdrop)  backdrop.addEventListener("click", close);

  drawer.querySelectorAll(".drawer__link").forEach(a => a.addEventListener("click", close));
})();


// ── 4. CLOUDOPS COPILOT ─────────────────────────────────────
(function () {
  const input  = document.getElementById("planPrompt");
  const btn    = document.getElementById("generatePlanBtn");
  const out    = document.getElementById("planResult");
  const chips  = Array.from(document.querySelectorAll(".mock__chip[data-category]"));

  if (!input || !btn || !out) return;

  let selectedCategory =
    chips.find(c => c.classList.contains("is-active"))?.dataset.category || "deploy";

  function setActiveChip(cat) {
    selectedCategory = cat;
    chips.forEach(c => c.classList.toggle("is-active", c.dataset.category === cat));
  }
  chips.forEach(chip => chip.addEventListener("click", () => setActiveChip(chip.dataset.category)));

  function safeList(v) { return Array.isArray(v) && v.length > 0 ? v : null; }
  function setOut(html) { out.innerHTML = html; }
  function renderError(msg) { setOut(`<div class="plan-error">❌ ${msg}</div>`); }

  function renderSection(icon, title, items) {
    if (!items || !items.length) return "";
    const lis = items.map(item => {
      if (typeof item === "string") return `<li>${item}</li>`;
      const actions = Array.isArray(item.actions)
        ? `<ul class="plan-sub">${item.actions.map(a => `<li>${a}</li>`).join("")}</ul>`
        : "";
      const expected = item.expected ? `<span class="plan-expected">→ ${item.expected}</span>` : "";
      return `<li><strong>${item.title || item}</strong>${actions}${expected}</li>`;
    }).join("");
    return `<div class="plan-section"><h4>${icon} ${title}</h4><ul>${lis}</ul></div>`;
  }

  function renderKeyValue(icon, title, obj) {
    if (!obj || typeof obj !== "object") return "";
    const rows = Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join("");
    if (!rows) return "";
    return `<div class="plan-section"><h4>${icon} ${title}</h4><ul>${rows}</ul></div>`;
  }

  function renderPlan(data) {
    if (!data || typeof data !== "object") { renderError("Resposta inválida do servidor."); return; }

    const title    = data.title    || "Plano gerado";
    const summary  = data.summary  || "";
    const decision = data.decision || "";
    const category = data.category || selectedCategory;

    const html = `
      <div class="plan-card">
        <div class="plan-header">
          <span class="plan-category">${category.toUpperCase()}</span>
          <h3 class="plan-title">📌 ${title}</h3>
          ${summary  ? `<p class="plan-summary">${summary}</p>` : ""}
          ${decision ? `<p class="plan-decision">💡 <em>${decision}</em></p>` : ""}
        </div>
        ${renderSection("🔮", "Premissas",       safeList(data.assumptions))}
        ${renderSection("🏗",  "Arquitetura",     safeList(data.architecture))}
        ${renderSection("✅", "Passos",           safeList(data.steps))}
        ${renderKeyValue("⚙️", "Cache / CDN",     data.cdn_cache)}
        ${renderKeyValue("🔒", "HTTPS / Domínio", data.https_domain)}
        ${renderSection("🧪", "Validação",        safeList(data.validation))}
        ${renderSection("💰", "Custos",           safeList(data.cost_notes))}
        ${renderSection("⚠️", "Problemas comuns", safeList(data.common_issues))}
        ${safeList(data.estimated_services) ? `
          <div class="plan-section plan-services">
            <h4>☁️ Serviços estimados</h4>
            <div class="plan-tags">
              ${data.estimated_services.map(s => `<span class="plan-tag">${s}</span>`).join("")}
            </div>
          </div>` : ""}
      </div>`;

    setOut(html);
  }

  async function generate() {
    const userInput = (input.value || "").trim();
    if (!userInput) { out.textContent = "Digite seu cenário acima."; input.focus(); return; }

    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = "Gerando...";
    setOut('<div class="plan-loading">⏳ Gerando plano, aguarde...</div>');

    try {
      const res = await fetch("http://127.0.0.1:8001/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, input: userInput })
      });

      let data;
      try { data = await res.json(); } catch {
        renderError("Resposta inválida do servidor."); return;
      }
      if (Array.isArray(data)) data = data[0];

      if (!res.ok) {
        renderError("Erro do servidor: " + (data?.detail ?? JSON.stringify(data))); return;
      }
      renderPlan(data);

    } catch (e) {
      renderError(
        "Não foi possível conectar ao backend.<br>" +
        "<small>Verifique se o servidor está rodando em http://127.0.0.1:8001</small>"
      );
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  }

  btn.addEventListener("click", generate);
  input.addEventListener("keydown", e => { if (e.key === "Enter") generate(); });
})();






