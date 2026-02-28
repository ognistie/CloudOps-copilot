// ============================================================
// chat.js — CloudOps Copilot Chatbot
// Multi-turno, histórico de conversa, markdown básico
// ============================================================

(function () {

  // ── Elementos ──────────────────────────────────────────────
  const messagesEl = document.getElementById("chatMessages");
  const inputEl    = document.getElementById("chatInput");
  const sendBtn    = document.getElementById("sendBtn");
  const clearBtn   = document.getElementById("clearBtn");
  const statusDot  = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const charCount  = document.getElementById("charCount");
  const topicCards = document.querySelectorAll(".topic-card");

  if (!messagesEl || !inputEl || !sendBtn) return;

  const API_URL    = "http://127.0.0.1:8001/chat";
  const MAX_CHARS  = 500;

  // Histórico de conversa (mantém contexto multi-turno)
  let history = [];
  let isLoading = false;

  // ── Status do servidor ────────────────────────────────────
  async function checkStatus() {
    try {
      const res = await fetch("http://127.0.0.1:8001/health");
      const data = await res.json();
      if (data.key_loaded) {
        setStatus("online", "CloudOps IA • Online");
      } else {
        setStatus("error", "API Key não carregada");
      }
    } catch {
      setStatus("error", "Servidor offline — inicie o backend");
    }
  }

  function setStatus(state, text) {
    statusDot.className = "status-dot " + state;
    statusText.textContent = text;
  }

  checkStatus();

  // ── Auto-resize textarea ──────────────────────────────────
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
    const len = inputEl.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS}`;
    charCount.style.color = len > MAX_CHARS * 0.9
      ? "rgba(239,68,68,.8)"
      : "rgba(243,244,255,.35)";
  });

  // ── Envio com Enter (Shift+Enter = nova linha) ────────────
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // ── Tópicos rápidos ───────────────────────────────────────
  topicCards.forEach(card => {
    card.addEventListener("click", () => {
      const prompt = card.dataset.prompt;
      if (prompt && !isLoading) {
        inputEl.value = prompt;
        inputEl.dispatchEvent(new Event("input"));
        sendMessage();
      }
    });
  });

  // ── Limpar conversa ───────────────────────────────────────
  clearBtn.addEventListener("click", () => {
    history = [];
    // Remove todas as mensagens exceto a de boas-vindas
    const msgs = messagesEl.querySelectorAll(".chat-msg");
    msgs.forEach((m, i) => { if (i > 0) m.remove(); });
  });

  // ── Formata hora atual ────────────────────────────────────
  function nowTime() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  // ── Markdown básico → HTML ────────────────────────────────
  function parseMarkdown(text) {
    return text
      // Blocos de código
      .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) =>
        `<pre><code>${escHtml(code.trim())}</code></pre>`)
      // Código inline
      .replace(/`([^`]+)`/g, (_, c) => `<code>${escHtml(c)}</code>`)
      // Negrito
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Itálico
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Títulos
      .replace(/^### (.+)$/gm, "<h4>$1</h4>")
      .replace(/^## (.+)$/gm,  "<h3>$1</h3>")
      .replace(/^# (.+)$/gm,   "<h2>$1</h2>")
      // Listas com -
      .replace(/^[-•] (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      // Quebras de linha
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");
  }

  function escHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // ── Adiciona mensagem do usuário ──────────────────────────
  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg--user";
    div.innerHTML = `
      <div class="chat-msg__avatar">👤</div>
      <div class="chat-msg__bubble"><p>${escHtml(text)}</p></div>
      <div class="chat-msg__time">${nowTime()}</div>`;
    messagesEl.appendChild(div);
    scrollBottom();
  }

  // ── Adiciona indicador de digitação ──────────────────────
  function addTyping() {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg--bot chat-msg--typing";
    div.id = "typingIndicator";
    div.innerHTML = `
      <div class="chat-msg__avatar">🤖</div>
      <div class="chat-msg__bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    messagesEl.appendChild(div);
    scrollBottom();
  }

  function removeTyping() {
    document.getElementById("typingIndicator")?.remove();
  }

  // ── Adiciona resposta do bot ──────────────────────────────
  function addBotMessage(text) {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg--bot";
    div.innerHTML = `
      <div class="chat-msg__avatar">🤖</div>
      <div class="chat-msg__bubble"><p>${parseMarkdown(text)}</p></div>
      <div class="chat-msg__time">${nowTime()}</div>`;
    messagesEl.appendChild(div);
    scrollBottom();
  }

  // ── Adiciona mensagem de erro ─────────────────────────────
  function addErrorMessage(text) {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg--bot";
    div.innerHTML = `
      <div class="chat-msg__avatar">⚠️</div>
      <div class="chat-msg__bubble" style="border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.08);">
        <p style="color:#fca5a5;">❌ ${escHtml(text)}</p>
      </div>
      <div class="chat-msg__time">${nowTime()}</div>`;
    messagesEl.appendChild(div);
    scrollBottom();
  }

  // ── Scroll para o fim ─────────────────────────────────────
  function scrollBottom() {
    setTimeout(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 50);
  }

  // ── Enviar mensagem principal ─────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;
    if (text.length > MAX_CHARS) {
      addErrorMessage(`Mensagem muito longa. Máximo ${MAX_CHARS} caracteres.`);
      return;
    }

    // Limpa input
    inputEl.value = "";
    inputEl.style.height = "auto";
    charCount.textContent = `0 / ${MAX_CHARS}`;

    // Mostra mensagem do usuário
    addUserMessage(text);

    // Adiciona ao histórico
    history.push({ role: "user", content: text });

    // UI loading
    isLoading = true;
    sendBtn.disabled = true;
    addTyping();
    setStatus("online", "CloudOps IA • Pensando...");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.detail || "Erro desconhecido do servidor.";
        removeTyping();
        addErrorMessage(errMsg);
        // Remove a última mensagem do histórico (não foi processada)
        history.pop();
        setStatus("error", "Erro na resposta");
        return;
      }

      const reply = data.reply || "Sem resposta.";

      // Adiciona resposta ao histórico
      history.push({ role: "assistant", content: reply });

      removeTyping();
      addBotMessage(reply);
      setStatus("online", "CloudOps IA • Online");

    } catch (e) {
      removeTyping();
      history.pop();
      if (e.message.includes("fetch")) {
        addErrorMessage("Não foi possível conectar ao backend. Verifique se o servidor está rodando em http://127.0.0.1:8001");
      } else {
        addErrorMessage(e.message || "Erro inesperado.");
      }
      setStatus("error", "Servidor offline");
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

})();