/* =====================================================================
   app.js — Business Activation, the short "feel-good" flow
   4 moments: About you · Smart Link Dump · Smart File Dump · Your story.
   Smart dumps replace ~16 boxes; AI summary is the trust payoff.
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDC_DATA, E = window.SDC_ENGINE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ticker */
  const gear = '<svg class="ticker-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2l-.4 2.6h-4l-.4-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 013 12c0-.4 0-.8.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L9.9 3h4l.4 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.1.4.1.8.1 1.2z"/></svg>';
  $("#ticker").innerHTML = Array(8).fill(`<span class="ticker-item">${gear}Empowering 100 New Digital Presences Across Sarawak</span>`).join("");

  const opts = (arr, ph) => `<option value="">${ph}</option>` + arr.map(o => `<option value="${o}">${o}</option>`).join("");
  const chips = (name, arr) => arr.map(o =>
    `<label class="chip"><input type="checkbox" name="${name}" value="${o}"><span>${o}</span></label>`).join("");

  /* ---------- the 4 moments + success ------------------------------ */
  const STEPS = [
    { name: "About you", nameKey: "step.about", html: `
      <h2 data-i18n="f.about.title">First, the essentials</h2>
      <p class="lead" data-i18n="f.about.lead">Just enough to reach you and get started. Nothing more.</p>
      <div class="grid-2">
        <div class="field"><label><span data-i18n="f.biz">Business name</span> <span class="req">*</span></label>
          <input data-field="businessName" required autocomplete="organization" /><div class="field-error">Please add your business name</div></div>
        <div class="field"><label><span data-i18n="f.name">Your name</span> <span class="req">*</span></label>
          <input data-field="ownerName" required autocomplete="name" /><div class="field-error">Please add your name</div></div>
        <div class="field"><label><span data-i18n="f.wa">WhatsApp number</span> <span class="req">*</span></label>
          <input data-field="mobile" type="tel" placeholder="012-345 6789" required autocomplete="tel" /><div class="field-error">Please add a number</div></div>
        <div class="field"><label><span data-i18n="f.email">Email</span> <span class="req">*</span></label>
          <input data-field="email" type="email" required autocomplete="email" /><div class="field-error">Enter a valid email</div></div>
        <div class="field"><label><span data-i18n="f.cat">What kind of business?</span> <span class="req">*</span></label>
          <select data-field="category" required>${opts(D.CATEGORIES, "Choose one…")}</select><div class="field-error">Please choose</div></div>
        <div class="field"><label><span data-i18n="f.dist">District</span> <span class="req">*</span></label>
          <select data-field="district" required>${opts(D.DISTRICTS, "Choose your district…")}</select><div class="field-error">Please choose</div></div>
      </div>
    `},

    { name: "Your links", nameKey: "step.links", html: `
      <h2 data-i18n="f.links.title">Drop all your links here</h2>
      <p class="lead" data-i18n="f.links.lead">Website, Facebook, Instagram, TikTok, Shopee, Google Maps, anything.
        Paste them all in one go, any order. Our AI sorts and labels each one.</p>
      <div class="field">
        <textarea id="linkDump" data-field="linkDumpText" rows="5"
          placeholder="https://facebook.com/mybiz
https://instagram.com/mybiz
shopee.com.my/mybiz
https://mybiz.com"></textarea>
      </div>
      <div class="smart-detected" id="linkChips"></div>
      <p class="hint" id="linkHint">No links yet? No problem, you can skip this.</p>
    `},

    { name: "Your files", nameKey: "step.files", html: `
      <h2 data-i18n="f.files.title">Drop your files in one place</h2>
      <p class="lead" data-i18n="f.files.lead">Logo, business profile, product photos, certificates, PDFs.
        Drop everything together. Our AI sorts each one into the right category.</p>
      <div class="dropzone" id="dropzone">
        <div class="dz-ic">📎</div>
        <strong data-i18n="f.dz">Drag &amp; drop everything here</strong><span data-i18n="f.dz2"> or tap to browse</span>
        <span class="hint">PDF · DOC · PPT · JPG · PNG · WEBP · ZIP</span>
        <input type="file" id="fileInput" multiple hidden
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.zip" />
      </div>
      <div class="file-list" id="fileList"></div>
    `},

    { name: "Your story", nameKey: "step.story", html: `
      <h2 data-i18n="f.story.title">Tell us your story</h2>
      <p class="lead" data-i18n="f.story.lead">A couple of lines is plenty. The more you share, the smarter
        we build, but only what you're comfortable with.</p>
      <div class="field"><label data-i18n="f.q1">What does your business do?</label>
        <textarea data-field="aiQ1" placeholder="Introduce it like you would to a new customer…"></textarea></div>
      <div class="field"><label data-i18n="f.q2">Who are your ideal customers?</label>
        <textarea data-field="aiQ2" rows="2"></textarea></div>
      <div class="field"><label data-i18n="f.needs">What do you need help with?</label>
        <div class="chips" data-chips>${chips("needs", D.NEEDS)}</div></div>

      <details class="more-toggle">
        <summary data-i18n="f.more">Want sharper results? Add a little more (optional)</summary>
        <div class="field"><label data-i18n="f.diff">What makes you different?</label><textarea data-field="aiQ4" rows="2"></textarea></div>
        <div class="field"><label data-i18n="f.comp">A competitor or two you watch</label><textarea data-field="comp1" rows="2" placeholder="Names or links"></textarea></div>
        <div class="field"><label data-i18n="f.insp">Websites you love (inspiration)</label><textarea data-field="insp1" rows="2" placeholder="Links you like the look of"></textarea></div>
        <div class="field"><label data-i18n="f.extra">Anything else?</label><textarea data-field="aiExtra" rows="2"></textarea></div>
      </details>

      <button type="button" class="btn btn-dark" id="genSummary" style="margin:.4rem 0 1rem" data-i18n="f.gen">✨ Generate my AI Business Summary</button>
      <div id="aiSummaryMount"></div>

      <div class="consent-block">
        <label class="chip consent"><input type="checkbox" name="eligible" checked><span data-i18n="f.eligible">Yes, I'd like to be one of the <strong>100 New Digital Presences</strong>.</span></label>
        <label class="chip consent"><input type="checkbox" id="tcAll"><span data-i18n="f.consent">I confirm my details are accurate and agree Khaaliq &amp; the KOBIS Berhad team may contact me and use this info for digital empowerment purposes.</span></label>
        <div class="field-error" id="tcError">Please tick the confirmation to submit.</div>
      </div>
    `},

    { name: "Done", html: `
      <div class="success-box">
        <div class="tick">✓</div>
        <h2>You're in. Thank you!</h2>
        <p class="lead">Your business is now part of the Sarawak Digital Champion mission.<br>
          Reference: <strong id="refId">—</strong></p>
        <div id="finalSummaryMount"></div>
        <p class="hint" style="margin-top:1rem">We'll reach out on WhatsApp with your next step.</p>
        <div style="margin-top:1.4rem">
          <a class="btn btn-primary" href="index.html">Back to home</a>
          <a class="btn btn-ghost" href="activate.html" onclick="localStorage.removeItem('sdc_draft_v2')">Register another</a>
        </div>
      </div>
    `}
  ];

  const TOTAL = STEPS.length - 1;
  let current = 0;
  const data = loadDraft() || { id: E.uid(), links: [], otherLinks: [], files: [], createdAt: new Date().toISOString() };
  const form = $("#wizard");

  /* ---------- render ----------------------------------------------- */
  function render() {
    form.innerHTML = STEPS.map((s, i) =>
      `<section class="step ${i === current ? "active" : ""}" data-step="${i}">${s.html}</section>`).join("") + navHtml();
    hydrate(); wireStep(); updateProgress();
    if (window.applyLanguage) window.applyLanguage(window.SDC_LANG || localStorage.getItem("sdc-lang") || "en");
  }
  function navHtml() {
    if (current >= TOTAL) return "";
    const last = current === TOTAL - 1;
    return `<div class="wizard-nav">
      <button type="button" class="btn btn-ghost" id="prevBtn" data-i18n="nav.back" ${current === 0 ? "style=visibility:hidden" : ""}>← Back</button>
      <span class="saved-tag" id="savedTag"></span>
      <button type="button" class="btn btn-primary" id="nextBtn" data-i18n="${last ? "btn.submit" : "btn.continue"}">${last ? "Submit my business ✓" : "Continue →"}</button>
    </div>`;
  }

  function hydrate() {
    $$("[data-field]").forEach(el => { if (data[el.dataset.field] != null) el.value = data[el.dataset.field]; });
    (data.needs || []).forEach(v => {
      const cb = $(`input[name="needs"][value="${CSS.escape(v)}"]`);
      if (cb) { cb.checked = true; cb.closest(".chip").classList.add("checked"); }
    });
    const el = $('input[name="eligible"]'); if (el && data.eligible === false) el.checked = false;
    renderLinks(); renderFiles();
  }

  function collect() {
    $$("[data-field]").forEach(el => { data[el.dataset.field] = el.value.trim(); });
    if ($('input[name="needs"]')) data.needs = $$('input[name="needs"]:checked').map(c => c.value);
    const el = $('input[name="eligible"]'); if (el) data.eligible = el.checked;
    if ($("#linkDump")) E.ingestLinks($("#linkDump").value, data);
    saveDraft();
  }

  /* ---------- wiring ----------------------------------------------- */
  function wireStep() {
    if ($("#prevBtn")) $("#prevBtn").onclick = prev;
    if ($("#nextBtn")) $("#nextBtn").onclick = next;

    $$(".chip input").forEach(inp => inp.addEventListener("change", () =>
      inp.closest(".chip").classList.toggle("checked", inp.checked)));

    $$("[data-field]").forEach(el => el.addEventListener("input", () => {
      data[el.dataset.field] = el.value.trim(); saveDraft(true);
    }));

    // live link parsing
    const ld = $("#linkDump");
    if (ld) { const run = () => { E.ingestLinks(ld.value, data); renderLinks(); saveDraft(true); };
      ld.addEventListener("input", run); ld.addEventListener("paste", () => setTimeout(run, 30)); }

    wireFiles();

    const gen = $("#genSummary");
    if (gen) gen.onclick = () => {
      collect(); data.summary = E.summarize(data);
      $("#aiSummaryMount").innerHTML = summaryHtml(data.summary);
      $("#aiSummaryMount").scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    const tc = $("#tcError"); if (tc) $("#tcAll").addEventListener("change", () => tc.classList.remove("show"));
  }

  /* ---------- smart link chips ------------------------------------- */
  const LINK_EMOJI = { facebook: "📘", instagram: "📸", tiktok: "🎵", linkedin: "💼",
    youtube: "▶️", whatsapp: "🟢", shopee: "🛒", lazada: "🛍️", google: "📍",
    telegram: "✈️", twitter: "𝕏", website: "🌐", shop: "🏬", link: "🔗" };
  function renderLinks() {
    const wrap = $("#linkChips"); if (!wrap) return;
    const links = data.links || [];
    wrap.innerHTML = links.map(l =>
      `<span class="detected-chip"><span class="dc-ic">${LINK_EMOJI[l.key] || "🔗"}</span>${esc(l.label)}
        <span class="dc-host">${esc(l.host)}</span></span>`).join("");
    const hint = $("#linkHint");
    if (hint) hint.textContent = links.length
      ? `Nice — ${links.length} link${links.length > 1 ? "s" : ""} detected and sorted for you ✓`
      : "No links yet? No problem, you can skip this.";
  }

  /* ---------- smart file dump -------------------------------------- */
  function wireFiles() {
    const dz = $("#dropzone"), input = $("#fileInput"); if (!dz) return;
    dz.onclick = () => input.click();
    dz.ondragover = e => { e.preventDefault(); dz.classList.add("drag"); };
    dz.ondragleave = () => dz.classList.remove("drag");
    dz.ondrop = e => { e.preventDefault(); dz.classList.remove("drag"); addFiles(e.dataTransfer.files); };
    input.onchange = () => addFiles(input.files);
  }
  function addFiles(list) {
    Array.from(list).forEach(f => data.files.push({
      name: f.name, size: f.size, type: f.type || "file", category: E.classifyFile(f.name)
    }));
    saveDraft(); renderFiles();
  }
  function renderFiles() {
    const wrap = $("#fileList"); if (!wrap) return;
    wrap.innerHTML = (data.files || []).map((f, i) => {
      const ext = (f.name.split(".").pop() || "").toUpperCase().slice(0, 4);
      const kb = f.size ? (f.size / 1024).toFixed(0) + " KB" : "";
      const cats = D.FILE_CATEGORIES.map(c => `<option ${c === f.category ? "selected" : ""}>${c}</option>`).join("");
      return `<div class="file-item">
        <div class="fi-ic">${ext}</div>
        <div class="fi-meta"><b>${esc(f.name)}</b><span>AI sorted → </span></div>
        <select data-fcat="${i}">${cats}</select>
        <button type="button" class="icon-btn" data-frm="${i}" title="Remove">×</button></div>`;
    }).join("");
    $$("[data-frm]", wrap).forEach(b => b.onclick = () => { data.files.splice(+b.dataset.frm, 1); saveDraft(); renderFiles(); });
    $$("[data-fcat]", wrap).forEach(s => s.onchange = () => { data.files[+s.dataset.fcat].category = s.value; saveDraft(); });
  }

  /* ---------- AI summary panel ------------------------------------- */
  function summaryHtml(s) {
    return `<div class="ai-panel">
      <h3>✨ Your AI Business Summary</h3>
      <p class="ai-sub">Generated from what you shared. This is the brief we build from.</p>
      <div class="ai-rows">
        <div class="ai-row"><span class="k">Business</span><span class="v">${esc(s.business)}</span></div>
        <div class="ai-row"><span class="k">Industry</span><span class="v">${esc(s.industry)}</span></div>
        <div class="ai-row"><span class="k">Main customer</span><span class="v">${esc(s.mainCustomer)}</span></div>
        <div class="ai-row"><span class="k">Key challenge</span><span class="v">${esc(s.keyChallenge)}</span></div>
        <div class="ai-row"><span class="k">We recommend</span><span class="v"><ul>${s.recommended.map(r => `<li>${esc(r)}</li>`).join("")}</ul></span></div>
        <div class="ai-row"><span class="k">Digital readiness</span><span class="v readiness">${s.readiness}/10
          <span class="bar"><i style="width:${s.readiness * 10}%"></i></span></span></div>
      </div>
    </div>`;
  }

  /* ---------- navigation ------------------------------------------- */
  function next() {
    collect();
    if (!validateStep(current)) return;
    if (current === TOTAL - 1) {
      if (!$("#tcAll").checked) { $("#tcError").classList.add("show"); return; }
      return submit();
    }
    go(current + 1);
  }
  function prev() { if (current > 0) go(current - 1); }
  function go(i) { current = i; render(); window.scrollTo({ top: Math.max(0, $("#register").offsetTop - 80), behavior: "smooth" }); }

  function validateStep(i) {
    const stepEl = $(`.step[data-step="${i}"]`); let ok = true;
    $$("[required]", stepEl).forEach(el => {
      const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
      el.classList.toggle("invalid", bad);
      const err = el.parentElement.querySelector(".field-error");
      if (err) err.classList.toggle("show", bad);
      if (bad && ok) el.focus();
      if (bad) ok = false;
    });
    return ok;
  }

  function submit() {
    collect();
    data.summary = E.summarize(data);
    data.leadScore = data.summary.leadScore;
    data.status = "A · Analyze";
    data.submittedAt = new Date().toISOString();
    E.upsert(data);
    localStorage.removeItem(D.DRAFT_KEY);
    current = STEPS.length - 1; render();
    $("#refId").textContent = data.id;
    $("#finalSummaryMount").innerHTML = summaryHtml(data.summary);
    $(".progress").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- draft + progress ------------------------------------- */
  let savedTimer;
  function saveDraft(quiet) {
    localStorage.setItem(D.DRAFT_KEY, JSON.stringify(data));
    if (!quiet) flashSaved(); else { clearTimeout(savedTimer); savedTimer = setTimeout(flashSaved, 700); }
  }
  function flashSaved() { const t = $("#savedTag"); if (!t) return; t.textContent = "✓ Saved"; clearTimeout(t._t); t._t = setTimeout(() => t.textContent = "", 1600); }
  function loadDraft() { try { return JSON.parse(localStorage.getItem(D.DRAFT_KEY)); } catch (_) { return null; } }

  function updateProgress() {
    const shown = Math.min(current + 1, TOTAL);
    $("#stepNum").textContent = shown;
    $("#stepTotal").textContent = TOTAL;
    const st = STEPS[Math.min(current, TOTAL - 1)];
    $("#stepName").textContent = (window.SDC_I18N && st.nameKey && window.SDC_I18N.t(st.nameKey, window.SDC_LANG)) || st.name;
    $("#progressFill").style.width = (shown / TOTAL * 100) + "%";
  }

  render();
})();
