/* =====================================================================
   ai-bot.js — "KSDC AI Assistant" floating greeter widget (Phase 1)
   Self-contained: injects its own styles + markup, no dependencies.
   Static / deterministic — zero backend, zero API cost.
   Drop the mascot image at assets/ai-bot.png (falls back to 🤖 if missing).
   To remove: delete this file + its <script> tag in index.html.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- knowledge (pre-written answers, no AI cost) ---------- */
  var REPLIES = {
    price: "Your professional business website is just <b>RM500</b> — that's <b>64% off</b> " +
      "the usual RM1,380 (first 30 businesses). It includes design, 1-year hosting + domain, " +
      "SSL, WhatsApp button, Google Maps &amp; SEO — plus free bonuses. Optional add-ons: " +
      "<b>AI Chatbot (RM200)</b> or <b>E-Commerce store (RM600)</b>.",
    included: "Every build includes: a mobile-responsive business website, WhatsApp click-to-chat, " +
      "contact form, Google Map, domain &amp; hosting (1 year), SSL security, basic SEO, an easy " +
      "dashboard, 4-language support — and free copywriting, gallery &amp; promotion modules. " +
      "One complete package. 🎁",
    how: "Three simple steps:<br>① <b>Register</b> in minutes.<br>② <b>We build</b> with AI + human " +
      "craft.<br>③ <b>You go live</b>, fully in control. 🚀",
    lang: "This site speaks <b>4 languages</b> — English, Bahasa Malaysia, 中文 and Iban (IB). " +
      "Your website can too, so you reach every customer in Sarawak. 🌍"
  };

  var QUICK = [
    { k: "price",    label: "💰 Pricing" },
    { k: "included", label: "📦 What's included" },
    { k: "how",      label: "⚙️ How it works" },
    { k: "lang",     label: "🌐 Languages" }
  ];

  /* ---------- styles ---------- */
  var css = ''
  + '#aiBot,#aiBot *{box-sizing:border-box;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif}'
  + '#aiLauncher{position:fixed;left:18px;bottom:18px;z-index:320;width:64px;height:64px;cursor:pointer;'
    + 'border:none;background:none;padding:0;animation:aiFloat 3.2s ease-in-out infinite}'
  + '@keyframes aiFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}'
  + '#aiLauncher .ring{position:absolute;inset:0;border-radius:50%;'
    + 'background:radial-gradient(circle at 50% 35%,#3b6fd4,#0b2a52);'
    + 'box-shadow:0 10px 26px rgba(11,42,82,.45),0 0 0 4px rgba(59,111,212,.18)}'
  + '#aiLauncher .av{position:absolute;inset:5px;border-radius:50%;overflow:hidden;'
    + 'display:flex;align-items:center;justify-content:center;background:#0b1f3a;font-size:30px}'
  + '#aiLauncher .av img{width:100%;height:100%;object-fit:cover;transform:scale(1.7);transform-origin:50% 18%}'
  + '#aiLauncher .pulse{position:absolute;right:2px;top:2px;width:14px;height:14px;border-radius:50%;'
    + 'background:#2ecc71;border:2px solid #fff;box-shadow:0 0 0 0 rgba(46,204,113,.7);animation:aiPulse 1.8s infinite}'
  + '@keyframes aiPulse{0%{box-shadow:0 0 0 0 rgba(46,204,113,.6)}70%{box-shadow:0 0 0 10px rgba(46,204,113,0)}100%{box-shadow:0 0 0 0 rgba(46,204,113,0)}}'
  + '#aiBubble{position:fixed;left:90px;bottom:46px;z-index:319;background:#fff;color:#0b2a52;'
    + 'font-weight:800;font-size:13px;padding:10px 14px;border-radius:14px 14px 14px 4px;'
    + 'box-shadow:0 10px 26px rgba(11,42,82,.22);max-width:190px;opacity:0;transform:translateY(8px) scale(.9);'
    + 'transition:all .35s cubic-bezier(.2,.9,.3,1);pointer-events:none}'
  + '#aiBubble.show{opacity:1;transform:none}'
  + '#aiBubble small{display:block;font-weight:500;color:#5d728f;font-size:10.5px;margin-top:2px}'
  + '#aiBubble .zap{color:#F47C20}'
  + '#aiPanel{position:fixed;left:18px;bottom:18px;z-index:321;width:340px;max-width:calc(100vw - 36px);'
    + 'height:480px;max-height:calc(100vh - 40px);background:#fff;border-radius:20px;overflow:hidden;'
    + 'box-shadow:0 24px 60px rgba(8,24,47,.34);display:none;flex-direction:column;'
    + 'transform-origin:bottom left;animation:aiPop .28s cubic-bezier(.2,.9,.3,1)}'
  + '@keyframes aiPop{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}'
  + '#aiPanel.open{display:flex}'
  + '.aiHead{background:linear-gradient(135deg,#0b2a52,#0a1830);color:#fff;padding:15px 16px;display:flex;align-items:center;gap:11px}'
  + '.aiHead .ha{width:42px;height:42px;border-radius:50%;overflow:hidden;background:#13294d;flex:none;'
    + 'display:flex;align-items:center;justify-content:center;font-size:22px;border:2px solid rgba(255,255,255,.18)}'
  + '.aiHead .ha img{width:100%;height:100%;object-fit:cover;transform:scale(1.7);transform-origin:50% 18%}'
  + '.aiHead .ht b{font-size:14.5px;display:block;letter-spacing:.2px}'
  + '.aiHead .ht span{font-size:11px;color:#9fd6b4;display:flex;align-items:center;gap:5px}'
  + '.aiHead .ht span i{width:7px;height:7px;border-radius:50%;background:#2ecc71;display:inline-block}'
  + '.aiHead .hx{margin-left:auto;background:rgba(255,255,255,.12);border:none;color:#fff;width:30px;height:30px;'
    + 'border-radius:9px;cursor:pointer;font-size:17px;line-height:1}'
  + '.aiBody{flex:1;overflow-y:auto;padding:16px 14px;background:#f4f7fb}'
  + '.aiMsg{max-width:86%;padding:10px 13px;border-radius:14px;font-size:12.5px;line-height:1.5;margin-bottom:10px;'
    + 'background:#fff;color:#13233d;border:1px solid #e6edf6;border-bottom-left-radius:5px;box-shadow:0 1px 2px rgba(11,42,82,.04)}'
  + '.aiMsg.me{margin-left:auto;background:#0b2a52;color:#fff;border:none;border-radius:14px;border-bottom-right-radius:5px}'
  + '.aiMsg b{color:inherit}'
  + '.aiType{display:flex;gap:4px;padding:12px 14px}'
  + '.aiType i{width:7px;height:7px;border-radius:50%;background:#9fb3cd;animation:aiBlink 1.2s infinite}'
  + '.aiType i:nth-child(2){animation-delay:.2s}.aiType i:nth-child(3){animation-delay:.4s}'
  + '@keyframes aiBlink{0%,60%,100%{opacity:.3}30%{opacity:1}}'
  + '.aiQuick{padding:10px 12px 6px;background:#f4f7fb;border-top:1px solid #e6edf6;display:flex;flex-wrap:wrap;gap:7px}'
  + '.aiQuick button{background:#fff;border:1px solid #d7e3f2;color:#0b2a52;font-size:11.5px;font-weight:700;'
    + 'padding:7px 11px;border-radius:20px;cursor:pointer;transition:.15s}'
  + '.aiQuick button:hover{background:#0b2a52;color:#fff;border-color:#0b2a52}'
  + '.aiCta{padding:10px 12px 13px;background:#f4f7fb}'
  + '.aiCta a{display:block;text-align:center;background:#F47C20;color:#fff;font-weight:800;font-size:13px;'
    + 'padding:12px;border-radius:12px;text-decoration:none;box-shadow:0 8px 18px rgba(244,124,32,.32)}'
  + '.aiCta a:hover{filter:brightness(1.05)}'
  + '@media(max-width:420px){#aiPanel{height:calc(100vh - 32px)}}';

  /* ---------- mascot avatar (real image, graceful fallback) ---------- */
  function avatar() {
    return '<img src="assets/ai-bot.png" alt="AI Assistant" '
         + 'onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'🤖\'">';
  }

  /* ---------- build DOM ---------- */
  function init() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

    var wrap = document.createElement("div"); wrap.id = "aiBot";
    wrap.innerHTML = ''
      + '<button id="aiLauncher" aria-label="Open AI Assistant">'
        + '<span class="ring"></span><span class="av">' + avatar() + '</span><span class="pulse"></span>'
      + '</button>'
      + '<div id="aiBubble">AI GOT YOUR BACK! <span class="zap">⚡</span>'
        + '<small>Tap me — I can answer in seconds.</small></div>'
      + '<div id="aiPanel" role="dialog" aria-label="AI Assistant">'
        + '<div class="aiHead">'
          + '<div class="ha">' + avatar() + '</div>'
          + '<div class="ht"><b>KSDC AI Assistant</b><span><i></i>Online · replies instantly</span></div>'
          + '<button class="hx" aria-label="Close">✕</button>'
        + '</div>'
        + '<div class="aiBody" id="aiBody"></div>'
        + '<div class="aiQuick" id="aiQuick"></div>'
        + '<div class="aiCta"><a href="activate.html">✨ Get my FREE AI Business Summary →</a></div>'
      + '</div>';
    document.body.appendChild(wrap);

    var launcher = document.getElementById("aiLauncher");
    var bubble   = document.getElementById("aiBubble");
    var panel    = document.getElementById("aiPanel");
    var body     = document.getElementById("aiBody");
    var quick    = document.getElementById("aiQuick");
    var greeted  = false;

    function addMsg(html, me) {
      var m = document.createElement("div");
      m.className = "aiMsg" + (me ? " me" : "");
      m.innerHTML = html;
      body.appendChild(m); body.scrollTop = body.scrollHeight;
      return m;
    }
    function typing() {
      var t = document.createElement("div");
      t.className = "aiMsg aiType"; t.innerHTML = "<i></i><i></i><i></i>";
      body.appendChild(t); body.scrollTop = body.scrollHeight; return t;
    }
    function botSay(html, delay) {
      var t = typing();
      setTimeout(function () { t.remove(); addMsg(html); }, delay || 650);
    }

    QUICK.forEach(function (q) {
      var b = document.createElement("button");
      b.textContent = q.label;
      b.onclick = function () { addMsg(q.label, true); botSay(REPLIES[q.k]); };
      quick.appendChild(b);
    });

    function openPanel() {
      bubble.classList.remove("show");
      panel.classList.add("open");
      launcher.style.display = "none";
      if (!greeted) {
        greeted = true;
        botSay("Hi there! 👋 I'm the KSDC AI Assistant. I can help you get a professional " +
               "business website from <b>RM500</b>. What would you like to know?", 400);
      }
    }
    function closePanel() {
      panel.classList.remove("open");
      launcher.style.display = "block";
    }

    launcher.addEventListener("click", openPanel);
    panel.querySelector(".hx").addEventListener("click", closePanel);

    // auto-greeting bubble after 3s (once)
    setTimeout(function () {
      if (!panel.classList.contains("open")) {
        bubble.classList.add("show");
        setTimeout(function () { bubble.classList.remove("show"); }, 7000);
      }
    }, 3000);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
