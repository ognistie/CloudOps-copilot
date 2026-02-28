// ============================================================
// comunidade.js — CloudOps Copilot Community Page
// ============================================================

(function () {

  const feedEl      = document.getElementById("comFeed");
  const emptyEl     = document.getElementById("comEmpty");
  const submitBtn   = document.getElementById("comSubmit");
  const submitLabel = document.getElementById("submitLabel");
  const nameEl      = document.getElementById("comName");
  const msgEl       = document.getElementById("comMsg");
  const charEl      = document.getElementById("comChar");
  const toastEl     = document.getElementById("comToast");
  const toastMsg    = document.getElementById("toastMsg");
  const filterBtns  = document.querySelectorAll(".com-filter");
  const statTotal   = document.getElementById("statTotal");
  const statVotes   = document.getElementById("statVotes");
  const statToday   = document.getElementById("statToday");

  if (!feedEl || !submitBtn) return;

  const STORAGE_KEY = "cloudops_community_v2";
  const VOTES_KEY   = "cloudops_votes_v2";

  let selectedType = "sugestão";
  let selectedMood = "ok";
  let activeFilter = "all";

  // SVG moods map
  const moodSvg = {
    love:  `<svg viewBox="0 0 24 24" fill="#ff3cac" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    fire:  `<svg viewBox="0 0 24 24" fill="none" stroke="#ff6a00" stroke-width="1.5"><path d="M12 2c0 6-6 8-6 14a6 6 0 0012 0c0-6-6-8-6-14z"/><path d="M12 12c0 3-2 4-2 6a2 2 0 004 0c0-2-2-3-2-6z"/></svg>`,
    ok:    `<svg viewBox="0 0 24 24" fill="none" stroke="#00f5ff" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    think: `<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    bad:   `<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
  };

  const moodBg = {
    love: "rgba(255,60,172,.12)", fire: "rgba(255,106,0,.12)",
    ok: "rgba(0,245,255,.10)", think: "rgba(124,58,237,.10)", bad: "rgba(239,68,68,.10)"
  };

  // Avatar SVG
  const avatarSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  // Storage
  function loadPosts() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
  function savePosts(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
  function loadVotes() { try { return JSON.parse(localStorage.getItem(VOTES_KEY) || "{}"); } catch { return {}; } }
  function saveVotes(v) { localStorage.setItem(VOTES_KEY, JSON.stringify(v)); }

  // Tipo
  document.querySelectorAll(".com-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".com-type-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedType = btn.dataset.type;
    });
  });

  // Mood
  document.querySelectorAll(".com-mood-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".com-mood-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedMood = btn.dataset.mood;
    });
  });

  // Char count
  msgEl.addEventListener("input", () => {
    const len = msgEl.value.length;
    charEl.textContent = `${len} / 400`;
    charEl.style.color = len > 360 ? "rgba(239,68,68,.8)" : "rgba(243,244,255,.30)";
  });

  // Filtros
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.dataset.filter;
      renderFeed();
    });
  });

  // Toast
  let toastTimer;
  function showToast(msg, warn = false) {
    toastMsg.textContent = msg;
    toastEl.classList.toggle("toast--warn", warn);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  function relTime(ts) {
    const d = Date.now() - ts;
    if (d < 60000)    return "agora mesmo";
    if (d < 3600000)  return `${Math.floor(d/60000)}min atrás`;
    if (d < 86400000) return `${Math.floor(d/3600000)}h atrás`;
    return new Date(ts).toLocaleDateString("pt-BR");
  }

  function escHtml(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  const typeLabel = { sugestão:"Sugestão", feedback:"Feedback", bug:"Bug", ideia:"Ideia" };

  function createCard(post, voted) {
    const div = document.createElement("div");
    div.className = "com-card";
    div.dataset.id = post.id;

    const mood = moodSvg[post.mood] || moodSvg.ok;
    const bg   = moodBg[post.mood]  || moodBg.ok;

    div.innerHTML = `
      <div class="com-card__top">
        <div class="com-card__meta">
          <div class="com-card__avatar">${avatarSvg}</div>
          <div class="com-card__mood-icon" style="background:${bg};border:1px solid ${bg.replace('.10','0.28').replace('.12','0.28')}">${mood}</div>
          <div>
            <div class="com-card__name">${escHtml(post.name)}</div>
            <div class="com-card__time">${relTime(post.ts)}</div>
          </div>
        </div>
        <span class="com-card__badge badge--${post.type}">${typeLabel[post.type] || post.type}</span>
      </div>
      <p class="com-card__msg">${escHtml(post.msg)}</p>
      <div class="com-card__footer">
        <button class="com-vote ${voted ? "voted" : ""}" data-id="${post.id}">
          <svg viewBox="0 0 24 24" fill="${voted ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span class="com-vote__count">${post.votes}</span>
        </button>
      </div>`;

    div.querySelector(".com-vote").addEventListener("click", () => handleVote(post.id));
    return div;
  }

  function handleVote(id) {
    const votes = loadVotes();
    const posts = loadPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    if (votes[id]) {
      post.votes = Math.max(0, post.votes - 1);
      delete votes[id];
      showToast("Voto removido", true);
    } else {
      post.votes += 1;
      votes[id] = true;
      showToast("Obrigado pelo voto!");
    }
    savePosts(posts); saveVotes(votes);
    renderFeed(); updateStats();
  }

  function renderFeed() {
    const posts = loadPosts();
    const votes = loadVotes();
    const filtered = activeFilter === "all" ? posts : posts.filter(p => p.type === activeFilter);

    feedEl.querySelectorAll(".com-card").forEach(c => c.remove());

    if (filtered.length === 0) { emptyEl.style.display = "block"; return; }
    emptyEl.style.display = "none";

    [...filtered].sort((a,b) => b.votes - a.votes || b.ts - a.ts)
      .forEach(post => feedEl.appendChild(createCard(post, !!votes[post.id])));
  }

  function animateNum(el, target) {
    if (!el) return;
    const cur = parseInt(el.textContent) || 0;
    if (cur === target) return;
    const step = target > cur ? 1 : -1;
    const iv = setInterval(() => {
      const n = parseInt(el.textContent) || 0;
      if (n === target) { clearInterval(iv); return; }
      el.textContent = n + step;
    }, 40);
  }

  function updateStats() {
    const posts = loadPosts();
    const today = new Date().toDateString();
    animateNum(statTotal, posts.length);
    animateNum(statVotes, posts.reduce((s,p) => s + p.votes, 0));
    animateNum(statToday, posts.filter(p => new Date(p.ts).toDateString() === today).length);
  }

  submitBtn.addEventListener("click", () => {
    const msg = msgEl.value.trim();
    if (!msg) { showToast("Escreva sua mensagem antes de enviar", true); msgEl.focus(); return; }
    if (msg.length > 400) { showToast("Mensagem muito longa (máx 400)", true); return; }

    const post = {
      id:    Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      name:  nameEl.value.trim() || "Anônimo",
      msg, type: selectedType, mood: selectedMood,
      votes: 0, ts: Date.now()
    };

    const posts = loadPosts();
    posts.unshift(post);
    savePosts(posts);

    msgEl.value = ""; nameEl.value = ""; charEl.textContent = "0 / 400";
    submitBtn.disabled = true; submitLabel.textContent = "Enviado!";
    setTimeout(() => { submitBtn.disabled = false; submitLabel.textContent = "Enviar contribuição"; }, 2000);

    showToast("Contribuição enviada! Obrigado.");
    activeFilter = "all";
    filterBtns.forEach(b => b.classList.toggle("is-active", b.dataset.filter === "all"));
    renderFeed(); updateStats();
  });

  renderFeed();
  updateStats();

  setInterval(() => {
    feedEl.querySelectorAll(".com-card__time").forEach(el => {
      const card = el.closest(".com-card");
      if (!card) return;
      const post = loadPosts().find(p => p.id === card.dataset.id);
      if (post) el.textContent = relTime(post.ts);
    });
  }, 60000);

})();