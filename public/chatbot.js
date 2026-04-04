(function () {
  "use strict";

  // --- Config ---
  var scriptTag = document.currentScript;
  var scriptSrc = scriptTag ? scriptTag.src : "";
  var clientId = new URL(scriptSrc).searchParams.get("client") || "test";
  var BASE_URL = scriptSrc.split("/chatbot.js")[0];

  // --- State ---
  var messages = [];
  var isOpen = false;
  var isLoading = false;
  var leadCaptured = false;
  var clientConfig = null;

  // --- Styles ---
  var styles = `
    #skypo-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #111;
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      z-index: 99998;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      font-size: 22px;
    }
    #skypo-chat-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(0,0,0,0.3);
    }
    #skypo-chat-panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      max-height: 540px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      z-index: 99999;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      transform: scale(0.95) translateY(8px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    #skypo-chat-panel.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    #skypo-chat-header {
      background: #111;
      color: #fff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    #skypo-chat-header-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
      flex-shrink: 0;
    }
    #skypo-chat-header-name {
      font-weight: 600;
      font-size: 14px;
      flex: 1;
    }
    #skypo-chat-header-sub {
      font-size: 11px;
      opacity: 0.65;
    }
    #skypo-chat-close {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
    }
    #skypo-chat-close:hover { opacity: 1; }
    #skypo-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f9f9f9;
    }
    .skypo-msg {
      max-width: 82%;
      padding: 10px 13px;
      border-radius: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .skypo-msg-bot {
      background: #fff;
      color: #111;
      border: 1px solid #e5e5e5;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .skypo-msg-user {
      background: #111;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .skypo-typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 10px 13px;
    }
    .skypo-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #aaa;
      animation: skypo-bounce 1.2s infinite;
    }
    .skypo-dot:nth-child(2) { animation-delay: 0.2s; }
    .skypo-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes skypo-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
    #skypo-chat-input-row {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #eee;
      background: #fff;
      flex-shrink: 0;
    }
    #skypo-chat-input {
      flex: 1;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
      resize: none;
      font-family: inherit;
      max-height: 80px;
      overflow-y: auto;
    }
    #skypo-chat-input:focus { border-color: #111; }
    #skypo-chat-send {
      background: #111;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0 14px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    #skypo-chat-send:hover { background: #333; }
    #skypo-chat-send:disabled { background: #ccc; cursor: not-allowed; }
    #skypo-chat-branding {
      text-align: center;
      font-size: 10px;
      color: #bbb;
      padding: 6px;
      background: #fff;
      border-top: 1px solid #f0f0f0;
    }
    #skypo-chat-branding a { color: #bbb; text-decoration: none; }
    @media (max-width: 420px) {
      #skypo-chat-panel {
        width: calc(100vw - 32px);
        bottom: 84px;
        right: 16px;
      }
      #skypo-chat-btn { right: 16px; bottom: 16px; }
    }
  `;

  function injectStyles() {
    var el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
  }

  function createWidget() {
    var businessName = (clientConfig && clientConfig.name) || "Chat with us";

    // Button
    var btn = document.createElement("button");
    btn.id = "skypo-chat-btn";
    btn.setAttribute("aria-label", "Open chat");
    btn.innerHTML = "💬";
    btn.onclick = toggleChat;

    // Panel
    var panel = document.createElement("div");
    panel.id = "skypo-chat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat");
    panel.innerHTML = `
      <div id="skypo-chat-header">
        <div id="skypo-chat-header-dot"></div>
        <div>
          <div id="skypo-chat-header-name">${escapeHtml(businessName)}</div>
          <div id="skypo-chat-header-sub">Typically replies instantly</div>
        </div>
        <button id="skypo-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div id="skypo-chat-messages"></div>
      <div id="skypo-chat-input-row">
        <textarea id="skypo-chat-input" placeholder="Type a message..." rows="1"></textarea>
        <button id="skypo-chat-send" aria-label="Send">➤</button>
      </div>
      <div id="skypo-chat-branding">Powered by <a href="https://skypomedia.com" target="_blank">Skypomedia</a></div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    document.getElementById("skypo-chat-close").onclick = toggleChat;
    document.getElementById("skypo-chat-send").onclick = sendMessage;
    document.getElementById("skypo-chat-input").onkeydown = function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    // Greeting message
    var greeting = clientConfig
      ? "Hi there! I'm here to help with any questions about " + clientConfig.name + ". What can I help you with?"
      : "Hi there! How can I help you today?";
    appendBotMessage(greeting);
    messages.push({ role: "assistant", content: greeting });
  }

  function toggleChat() {
    isOpen = !isOpen;
    var panel = document.getElementById("skypo-chat-panel");
    var btn = document.getElementById("skypo-chat-btn");
    if (isOpen) {
      panel.classList.add("open");
      btn.innerHTML = "✕";
      setTimeout(function () {
        var input = document.getElementById("skypo-chat-input");
        if (input) input.focus();
      }, 200);
    } else {
      panel.classList.remove("open");
      btn.innerHTML = "💬";
    }
  }

  function appendBotMessage(text) {
    // Strip LEAD_CAPTURED line before displaying
    var displayText = text.replace(/LEAD_CAPTURED:.*$/m, "").trim();
    var container = document.getElementById("skypo-chat-messages");
    var el = document.createElement("div");
    el.className = "skypo-msg skypo-msg-bot";
    el.textContent = displayText;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
  }

  function appendUserMessage(text) {
    var container = document.getElementById("skypo-chat-messages");
    var el = document.createElement("div");
    el.className = "skypo-msg skypo-msg-user";
    el.textContent = text;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    var container = document.getElementById("skypo-chat-messages");
    var el = document.createElement("div");
    el.className = "skypo-msg skypo-msg-bot skypo-typing";
    el.id = "skypo-typing-indicator";
    el.innerHTML = '<div class="skypo-dot"></div><div class="skypo-dot"></div><div class="skypo-dot"></div>';
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById("skypo-typing-indicator");
    if (el) el.remove();
  }

  function sendMessage() {
    if (isLoading) return;
    var input = document.getElementById("skypo-chat-input");
    var text = input.value.trim();
    if (!text) return;

    input.value = "";
    input.style.height = "auto";
    appendUserMessage(text);
    messages.push({ role: "user", content: text });

    isLoading = true;
    document.getElementById("skypo-chat-send").disabled = true;
    showTyping();

    fetch(BASE_URL + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages, clientId: clientId }),
    })
      .then(function (res) {
        removeTyping();
        if (!res.ok) throw new Error("Chat API error");

        var botMsgEl = null;
        var fullText = "";
        var reader = res.body.getReader();
        var decoder = new TextDecoder();

        function read() {
          return reader.read().then(function (result) {
            if (result.done) {
              // Done streaming
              messages.push({ role: "assistant", content: fullText });
              checkForLead(fullText);
              isLoading = false;
              document.getElementById("skypo-chat-send").disabled = false;
              return;
            }
            var chunk = decoder.decode(result.value, { stream: true });
            fullText += chunk;

            if (!botMsgEl) {
              botMsgEl = document.createElement("div");
              botMsgEl.className = "skypo-msg skypo-msg-bot";
              document.getElementById("skypo-chat-messages").appendChild(botMsgEl);
            }
            // Show text without LEAD_CAPTURED line
            var display = fullText.replace(/LEAD_CAPTURED:.*$/m, "").trim();
            botMsgEl.textContent = display;
            document.getElementById("skypo-chat-messages").scrollTop = 99999;

            return read();
          });
        }

        return read();
      })
      .catch(function (err) {
        removeTyping();
        appendBotMessage("Sorry, something went wrong. Please try again.");
        isLoading = false;
        document.getElementById("skypo-chat-send").disabled = false;
        console.error("[Skypo]", err);
      });
  }

  function checkForLead(text) {
    if (leadCaptured) return;
    var match = text.match(/LEAD_CAPTURED:\s*(.+?)\s*\|\s*(.+)/);
    if (match) {
      var name = match[1].trim();
      var phone = match[2].trim();
      leadCaptured = true;

      // Build a short summary from recent messages
      var summary = messages
        .filter(function (m) { return m.role === "user"; })
        .map(function (m) { return m.content; })
        .slice(-3)
        .join(" / ");

      fetch(BASE_URL + "/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId,
          name: name,
          phone: phone,
          summary: summary,
        }),
      }).catch(function (e) {
        console.error("[Skypo] Lead save failed:", e);
      });
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // --- Init ---
  function init() {
    injectStyles();
    fetch(BASE_URL + "/api/config/" + clientId)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (config) {
        clientConfig = config;
        createWidget();
      })
      .catch(function () {
        clientConfig = null;
        createWidget();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
