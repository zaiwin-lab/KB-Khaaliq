/* =====================================================================
   app.js — Business Activation Portal wizard (12 steps)
   Builds the multi-step form, validates, autosaves a draft, generates
   the AI Business Summary, and stores the final submission.
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDC_DATA, E = window.SDC_ENGINE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- ticker ------------------------------------------------ */
  const gear = '<svg class="ticker-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2l-.4 2.6h-4l-.4-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 013 12c0-.4 0-.8.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L9.9 3h4l.4 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.1.4.1.8.1 1.2z"/></svg>';
  const msg = "Empowering 100 New Digital Presences Across Sarawak";
  $("#ticker").innerHTML =
    Array(8).fill(`<span class="ticker-item">${gear}${msg}</span>`).join("");

  /* ---------- options helpers -------------------------------------- */
  const opts = (arr, ph) =>
    `<option value="">${ph}</option>` +
    arr.map(o => `<option value="${o}">${o}</option>`).join("");
  const chips = (name, arr) => arr.map((o, i) =>
    `<label class="chip"><input type="checkbox" name="${name}" value="${o}"><span>${o}</span></label>`
  ).join("");
  const linkField = (name, label, ph) => `
    <div class="field">
      <label>${label}</label>
      <input type="url" data-field="${name}" placeholder="${ph}" />
    </div>`;

  /* ---------- step definitions ------------------------------------- */
  const STEPS = [
    { name: "Business Information", html: `
      <div class="step-kicker">Section A · Step 1</div>
      <h2>Business Information</h2>
      <p class="lead">Tell us who you are. Fields marked <span class="req">*</span> are required.</p>
      <div class="grid-2">
        <div class="field"><label>Business Name <span class="req">*</span></label>
          <input data-field="businessName" required /><div class="field-error">Required</div></div>
        <div class="field"><label>Owner Name <span class="req">*</span></label>
          <input data-field="ownerName" required /><div class="field-error">Required</div></div>
        <div class="field"><label>Mobile Number <span class="req">*</span></label>
          <input data-field="mobile" type="tel" placeholder="e.g. 012-345 6789" required /><div class="field-error">Required</div></div>
        <div class="field"><label>Email <span class="req">*</span></label>
          <input data-field="email" type="email" required /><div class="field-error">Enter a valid email</div></div>
        <div class="field"><label>Business Category <span class="req">*</span></label>
          <select data-field="category" required>${opts(D.CATEGORIES, "Select category…")}</select><div class="field-error">Required</div></div>
        <div class="field"><label>Business Stage</label>
          <select data-field="stage">${opts(D.STAGES, "Select stage…")}</select></div>
      </div>
      <div class="field"><label>Business Description</label>
        <textarea data-field="description" placeholder="A short description of your business…"></textarea></div>
      <div class="field"><label>District <span class="req">*</span></label>
        <select data-field="district" required>${opts(D.DISTRICTS, "Select district…")}</select><div class="field-error">Required</div></div>
    `},

    { name: "Digital Presence Audit", html: `
      <div class="step-kicker">Section B · Step 2</div>
      <h2>Business Digital Presence Audit</h2>
      <p class="lead">Where can people find you online today? Leave blank if not applicable.</p>
      ${linkField("websiteUrl", "Existing Website", "https://")}
      <div class="grid-2">
        ${linkField("facebook", "Facebook", "https://facebook.com/…")}
        ${linkField("instagram", "Instagram", "https://instagram.com/…")}
        ${linkField("tiktok", "TikTok", "https://tiktok.com/@…")}
        ${linkField("linkedin", "LinkedIn", "https://linkedin.com/…")}
        ${linkField("google", "Google Business Profile", "https://…")}
        ${linkField("shopee", "Shopee", "https://shopee.com.my/…")}
        ${linkField("lazada", "Lazada", "https://lazada.com.my/…")}
      </div>
      <div class="field"><label>Other Links</label>
        <div id="otherLinks"></div>
        <button type="button" class="link-add" id="addOtherLink">+ Add another link</button></div>
    `},

    { name: "Business Location", html: `
      <div class="step-kicker">Step 3</div>
      <h2>Business Location</h2>
      <p class="lead">Pin your location so customers can find you on the map.</p>
      <div class="map-frame"><iframe id="mapPreview" title="Location preview"
        src="https://www.google.com/maps?q=Kuching,Sarawak&output=embed"></iframe></div>
      <button type="button" class="btn btn-ghost btn-sm" id="useLocation">📍 Use my current location</button>
      <div class="field" style="margin-top:1rem"><label>Location Address</label>
        <textarea data-field="address" placeholder="Full business address…"></textarea>
        <div class="hint">Type your address then press “Preview on map”.</div>
        <button type="button" class="btn btn-ghost btn-sm" id="previewMap" style="margin-top:.5rem">Preview on map</button></div>
      <div class="grid-2">
        <div class="field"><label>Latitude</label><input data-field="lat" placeholder="Auto" /></div>
        <div class="field"><label>Longitude</label><input data-field="lng" placeholder="Auto" /></div>
      </div>
      <div class="field"><label>Business Operating Area</label>
        <select data-field="operatingArea">${opts(D.OPERATING_AREAS, "Select area…")}</select></div>
    `},

    { name: "AI Business Discovery", html: `
      <div class="step-kicker">Step 4 · Knowledge Base</div>
      <h2>AI Business Discovery</h2>
      <p class="lead">This is your future AI knowledge base — the more detail, the better we can build for you.</p>
      <div class="field"><label>1. What does your business do?</label>
        <div class="ai-hint">💡 Explain your business as if you are introducing it to a new customer.</div>
        <textarea data-field="aiQ1"></textarea></div>
      <div class="field"><label>2. Who are your ideal customers?</label>
        <textarea data-field="aiQ2"></textarea></div>
      <div class="field"><label>3. What products or services generate most of your revenue?</label>
        <textarea data-field="aiQ3"></textarea></div>
      <div class="field"><label>4. What makes your business different?</label>
        <textarea data-field="aiQ4"></textarea></div>
      <div class="field"><label>5. What are your biggest challenges today?</label>
        <div class="chips" data-chips>${chips("challenges", D.CHALLENGES)}</div>
        <textarea data-field="aiQ5Text" placeholder="Add detail (optional)…" style="margin-top:.7rem;min-height:60px"></textarea></div>
      <div class="field"><label>6. What would success look like after 12 months?</label>
        <textarea data-field="aiQ6"></textarea></div>
    `},

    { name: "Digital Needs Assessment", html: `
      <div class="step-kicker">Step 5</div>
      <h2>Digital Needs Assessment</h2>
      <p class="lead">Select everything you need. This drives our recommendations.</p>
      <div class="field"><label>I Need:</label>
        <div class="chips" data-chips>${chips("needs", D.NEEDS)}</div></div>
    `},

    { name: "Competitor Analysis", html: `
      <div class="step-kicker">Step 6</div>
      <h2>Competitor Analysis</h2>
      <p class="lead">Who are you up against? This helps us position you to win.</p>
      <div class="grid-2">
        ${linkField("comp1", "Competitor 1 — Website", "https://")}
        ${linkField("comp2", "Competitor 2 — Website", "https://")}
      </div>
      ${linkField("comp3", "Competitor 3 — Website", "https://")}
      <div class="field"><label>What do you like about these competitors?</label>
        <textarea data-field="compLike"></textarea></div>
      <div class="field"><label>What can be done better?</label>
        <textarea data-field="compBetter"></textarea></div>
    `},

    { name: "Inspiration Gallery", html: `
      <div class="step-kicker">Step 7</div>
      <h2>Inspiration Gallery</h2>
      <p class="lead">Show us websites you love — we’ll capture the style you’re drawn to.</p>
      <div class="grid-2">
        ${linkField("insp1", "Inspiration Website 1", "https://")}
        ${linkField("insp2", "Inspiration Website 2", "https://")}
      </div>
      ${linkField("insp3", "Inspiration Website 3", "https://")}
      <div class="field"><label>Why do you like these websites?</label>
        <textarea data-field="inspWhy"></textarea></div>
    `},

    { name: "File Vault", html: `
      <div class="step-kicker">Step 8</div>
      <h2>File Vault</h2>
      <p class="lead">Upload your business profile, logo, photos, certificates and more.</p>
      <div class="dropzone" id="dropzone">
        <strong>Drag &amp; drop files here</strong> or click to browse<br>
        <span class="hint">PDF · DOC · DOCX · PPT · PPTX · JPG · PNG · WEBP · ZIP</span>
        <input type="file" id="fileInput" multiple hidden
          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.zip" />
      </div>
      <div class="file-list" id="fileList"></div>
    `},

    { name: "AI Assistant", html: `
      <div class="step-kicker">Step 9 · The WOW Factor</div>
      <h2>AI Assistant</h2>
      <p class="lead">Tell us anything else — then generate your instant AI Business Summary.</p>
      <div class="field"><label>Tell us anything else.</label>
        <textarea data-field="aiExtra" placeholder="Anything we should know…"></textarea></div>
      <button type="button" class="btn btn-dark" id="genSummary">✨ Generate AI Business Summary</button>
      <div id="aiSummaryMount" style="margin-top:1.4rem"></div>
    `},

    { name: "Digital Champion Eligibility", html: `
      <div class="step-kicker">Step 10</div>
      <h2>Digital Champion Eligibility</h2>
      <p class="lead">Be part of the movement.</p>
      <div class="field"><label>Interested in becoming one of the <strong>100 New Digital Presences</strong>?</label>
        <div class="chips" data-radio>
          <label class="chip"><input type="radio" name="eligible" value="yes"><span>Yes</span></label>
          <label class="chip"><input type="radio" name="eligible" value="no"><span>No</span></label></div></div>
      <div class="field"><label>Would you like to be featured as a success story?</label>
        <div class="chips" data-radio>
          <label class="chip"><input type="radio" name="featured" value="yes"><span>Yes</span></label>
          <label class="chip"><input type="radio" name="featured" value="no"><span>No</span></label></div></div>
    `},

    { name: "Terms & Conditions", html: `
      <div class="step-kicker">Step 11</div>
      <h2>Terms &amp; Conditions</h2>
      <p class="lead">Please confirm before submitting.</p>
      <div class="field">
        <label class="chip" style="display:flex;width:100%;text-align:left">
          <input type="checkbox" data-tc value="1"><span>I confirm the information submitted is accurate.</span></label>
      </div>
      <div class="field">
        <label class="chip" style="display:flex;width:100%;text-align:left">
          <input type="checkbox" data-tc value="2"><span>I agree KOBIS Berhad and the Sarawak Digital Champion team may review and use the information solely for digital empowerment purposes.</span></label>
      </div>
      <div class="field">
        <label class="chip" style="display:flex;width:100%;text-align:left">
          <input type="checkbox" data-tc value="3"><span>I consent to being contacted regarding my application.</span></label>
      </div>
      <div class="field-error" id="tcError">Please accept all three to submit.</div>
    `},

    { name: "Submitted", html: `
      <div class="success-box">
        <div class="tick">✓</div>
        <h2>Application Received!</h2>
        <p class="lead">Thank you — your business profile is now in the Sarawak Digital Champion engine.
          Reference: <strong id="refId">—</strong></p>
        <div id="finalSummaryMount"></div>
        <div style="margin-top:1.5rem">
          <a class="btn btn-primary" href="index.html">Register Another Business</a>
          <a class="btn btn-ghost" href="admin.html">View Admin Dashboard</a>
        </div>
      </div>
    `}
  ];

  /* ---------- state ------------------------------------------------- */
  let current = 0;
  const TOTAL = STEPS.length - 1; // exclude success screen from count
  const data = loadDraft() || { id: E.uid(), otherLinks: [], files: [], createdAt: new Date().toISOString() };

  const form = $("#wizard");

  /* ---------- render ------------------------------------------------ */
  function render() {
    form.innerHTML = STEPS.map((s, i) =>
      `<section class="step ${i === current ? "active" : ""}" data-step="${i}">${s.html}</section>`
    ).join("") + navHtml();
    hydrate();
    wireStep();
    updateProgress();
  }
  function navHtml() {
    return `<div class="wizard-nav">
      <button type="button" class="btn btn-ghost" id="prevBtn">← Back</button>
      <span class="saved-tag" id="savedTag"></span>
      <button type="button" class="btn btn-primary" id="nextBtn">Continue →</button>
    </div>`;
  }

  /* ---------- hydrate fields from saved data ------------------------ */
  function hydrate() {
    $$("[data-field]").forEach(el => { if (data[el.dataset.field] != null) el.value = data[el.dataset.field]; });
    // checkboxes (challenges, needs)
    ["challenges", "needs"].forEach(name => {
      (data[name] || []).forEach(v => {
        const cb = $(`input[name="${name}"][value="${CSS.escape(v)}"]`);
        if (cb) { cb.checked = true; cb.closest(".chip").classList.add("checked"); }
      });
    });
    // radios
    ["eligible", "featured"].forEach(name => {
      const val = data[name];
      if (val === true || val === "yes") setRadio(name, "yes");
      else if (val === false || val === "no") setRadio(name, "no");
    });
    // other links
    renderOtherLinks();
    renderFiles();
  }
  function setRadio(name, val) {
    const r = $(`input[name="${name}"][value="${val}"]`);
    if (r) { r.checked = true; r.closest(".chip").classList.add("checked"); }
  }

  /* ---------- collect current step into data ------------------------ */
  function collect() {
    $$("[data-field]").forEach(el => { data[el.dataset.field] = el.value.trim(); });
    ["challenges", "needs"].forEach(name => {
      const sel = $$(`input[name="${name}"]:checked`).map(c => c.value);
      if ($(`input[name="${name}"]`)) data[name] = sel;
    });
    ["eligible", "featured"].forEach(name => {
      const r = $(`input[name="${name}"]:checked`);
      if (r) data[name] = r.value === "yes";
    });
    // other links
    const others = $$('#otherLinks input').map(i => i.value.trim()).filter(Boolean);
    if ($("#otherLinks")) data.otherLinks = others;
    saveDraft();
  }

  /* ---------- per-step wiring --------------------------------------- */
  function wireStep() {
    $("#prevBtn").onclick = prev;
    $("#nextBtn").onclick = next;

    // chip toggle visual
    $$('.chip input').forEach(inp => {
      inp.addEventListener("change", () => {
        const chip = inp.closest(".chip");
        if (inp.type === "radio") {
          $$(`input[name="${inp.name}"]`).forEach(o => o.closest(".chip").classList.remove("checked"));
        }
        chip.classList.toggle("checked", inp.checked);
      });
    });

    // autosave on input
    $$("[data-field]").forEach(el => el.addEventListener("input", () => {
      data[el.dataset.field] = el.value.trim(); saveDraft(true);
    }));

    // dynamic other links
    const add = $("#addOtherLink");
    if (add) add.onclick = () => { data.otherLinks.push(""); renderOtherLinks(); };

    // map step
    wireMap();
    // file step
    wireFiles();
    // AI summary step
    const gen = $("#genSummary");
    if (gen) gen.onclick = () => { collect(); $("#aiSummaryMount").innerHTML = summaryHtml(E.summarize(data)); };
  }

  /* ---------- other links ------------------------------------------ */
  function renderOtherLinks() {
    const wrap = $("#otherLinks");
    if (!wrap) return;
    wrap.innerHTML = (data.otherLinks.length ? data.otherLinks : [])
      .map((v, i) => `<div class="repeat-row">
        <input type="url" value="${v.replace(/"/g, '&quot;')}" placeholder="https://" data-other="${i}" />
        <button type="button" class="icon-btn" data-rm="${i}" title="Remove">×</button></div>`).join("");
    $$("[data-rm]", wrap).forEach(b => b.onclick = () => {
      data.otherLinks.splice(+b.dataset.rm, 1); renderOtherLinks(); saveDraft();
    });
    $$("[data-other]", wrap).forEach(i => i.oninput = () => {
      data.otherLinks[+i.dataset.other] = i.value.trim(); saveDraft(true);
    });
  }

  /* ---------- map --------------------------------------------------- */
  function wireMap() {
    const preview = $("#mapPreview");
    if (!preview) return;
    const setByQuery = q => { preview.src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`; };
    const setByLatLng = (la, ln) => { preview.src = `https://www.google.com/maps?q=${la},${ln}&output=embed`; };

    if (data.lat && data.lng) setByLatLng(data.lat, data.lng);
    else if (data.address) setByQuery(data.address);

    $("#previewMap").onclick = () => {
      const a = $('[data-field="address"]').value.trim();
      if (a) { data.address = a; setByQuery(a); saveDraft(); }
    };
    $("#useLocation").onclick = () => {
      if (!navigator.geolocation) return alert("Geolocation not supported on this device.");
      $("#useLocation").textContent = "Locating…";
      navigator.geolocation.getCurrentPosition(pos => {
        const la = pos.coords.latitude.toFixed(6), ln = pos.coords.longitude.toFixed(6);
        data.lat = la; data.lng = ln;
        $('[data-field="lat"]').value = la; $('[data-field="lng"]').value = ln;
        setByLatLng(la, ln); saveDraft();
        $("#useLocation").textContent = "📍 Location captured";
      }, () => { $("#useLocation").textContent = "📍 Use my current location"; alert("Could not get location."); });
    };
  }

  /* ---------- file vault ------------------------------------------- */
  function wireFiles() {
    const dz = $("#dropzone"), input = $("#fileInput");
    if (!dz) return;
    dz.onclick = () => input.click();
    dz.ondragover = e => { e.preventDefault(); dz.classList.add("drag"); };
    dz.ondragleave = () => dz.classList.remove("drag");
    dz.ondrop = e => { e.preventDefault(); dz.classList.remove("drag"); addFiles(e.dataTransfer.files); };
    input.onchange = () => addFiles(input.files);
  }
  function addFiles(list) {
    // Beta: store metadata only (name/size/type/category). Real binary upload
    // is wired to the backend/object-store in production.
    Array.from(list).forEach(f => data.files.push({
      name: f.name, size: f.size, type: f.type || "file", category: "Others"
    }));
    saveDraft(); renderFiles();
  }
  function renderFiles() {
    const wrap = $("#fileList");
    if (!wrap) return;
    wrap.innerHTML = data.files.map((f, i) => {
      const ext = (f.name.split(".").pop() || "").toUpperCase().slice(0, 4);
      const kb = f.size ? (f.size / 1024).toFixed(0) + " KB" : "";
      const cats = D.FILE_CATEGORIES.map(c =>
        `<option ${c === f.category ? "selected" : ""}>${c}</option>`).join("");
      return `<div class="file-item">
        <div class="fi-ic">${ext}</div>
        <div class="fi-meta"><b>${f.name}</b><span>${kb}</span></div>
        <select data-fcat="${i}">${cats}</select>
        <button type="button" class="icon-btn" data-frm="${i}" title="Remove">×</button></div>`;
    }).join("");
    $$("[data-frm]", wrap).forEach(b => b.onclick = () => { data.files.splice(+b.dataset.frm, 1); saveDraft(); renderFiles(); });
    $$("[data-fcat]", wrap).forEach(s => s.onchange = () => { data.files[+s.dataset.fcat].category = s.value; saveDraft(); });
  }

  /* ---------- AI summary html -------------------------------------- */
  function summaryHtml(s) {
    return `<div class="ai-panel">
      <h3>✨ AI Business Summary</h3>
      <div class="ai-rows">
        <div class="ai-row"><span class="k">Business</span><span class="v">${esc(s.business)}</span></div>
        <div class="ai-row"><span class="k">Industry</span><span class="v">${esc(s.industry)}</span></div>
        <div class="ai-row"><span class="k">Main Customer</span><span class="v">${esc(s.mainCustomer)}</span></div>
        <div class="ai-row"><span class="k">Key Challenge</span><span class="v">${esc(s.keyChallenge)}</span></div>
        <div class="ai-row"><span class="k">Recommended Solution</span>
          <span class="v"><ul>${s.recommended.map(r => `<li>${esc(r)}</li>`).join("")}</ul></span></div>
        <div class="ai-row"><span class="k">Digital Readiness</span>
          <span class="v readiness">${s.readiness}/10
            <span class="bar"><i style="width:${s.readiness * 10}%"></i></span></span></div>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <div class="score-badge">${s.leadScore}</div>
        <div><strong>Lead Score</strong><br><span style="color:#9fb4d1;font-size:.85rem">Auto-calculated readiness & opportunity (1–100)</span></div>
      </div>
    </div>`;
  }

  /* ---------- navigation -------------------------------------------- */
  function next() {
    if (current === TOTAL) return; // on T&C
    collect();
    if (!validateStep(current)) return;
    // T&C gate (step index TOTAL-1 = index 10 → Terms is index 10)
    if (STEPS[current].name === "Terms & Conditions") {
      const ok = $$("[data-tc]").every(c => c.checked);
      if (!ok) { $("#tcError").classList.add("show"); return; }
      return submit();
    }
    go(current + 1);
  }
  function prev() { if (current > 0) go(current - 1); }
  function go(i) { current = i; render(); window.scrollTo({ top: $("#register").offsetTop - 80, behavior: "smooth" }); }

  function validateStep(i) {
    const stepEl = $(`.step[data-step="${i}"]`);
    let ok = true;
    $$("[required]", stepEl).forEach(el => {
      const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
      el.classList.toggle("invalid", bad);
      const err = el.parentElement.querySelector(".field-error");
      if (err) err.classList.toggle("show", bad);
      if (bad) ok = false;
    });
    return ok;
  }

  /* ---------- submit ------------------------------------------------ */
  function submit() {
    collect();
    data.summary = E.summarize(data);
    data.leadScore = data.summary.leadScore;
    data.status = "New";
    data.submittedAt = new Date().toISOString();
    E.upsert(data);
    localStorage.removeItem(D.DRAFT_KEY);
    current = STEPS.length - 1; // success screen
    render();
    $("#refId").textContent = data.id;
    $("#finalSummaryMount").innerHTML = summaryHtml(data.summary);
    // hide nav on success
    const nav = $(".wizard-nav"); if (nav) nav.style.display = "none";
    $(".progress").style.display = "none";
  }

  /* ---------- draft persistence ------------------------------------ */
  let savedTimer;
  function saveDraft(quiet) {
    localStorage.setItem(D.DRAFT_KEY, JSON.stringify(data));
    if (!quiet) flashSaved();
    else { clearTimeout(savedTimer); savedTimer = setTimeout(flashSaved, 600); }
  }
  function flashSaved() {
    const tag = $("#savedTag"); if (!tag) return;
    tag.textContent = "✓ Draft saved"; clearTimeout(tag._t);
    tag._t = setTimeout(() => tag.textContent = "", 1800);
  }
  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(D.DRAFT_KEY)); } catch (_) { return null; }
  }

  /* ---------- progress --------------------------------------------- */
  function updateProgress() {
    const shown = Math.min(current + 1, TOTAL);
    $("#stepNum").textContent = shown;
    $("#stepTotal").textContent = TOTAL;
    $("#stepName").textContent = STEPS[Math.min(current, TOTAL - 1)].name;
    $("#progressFill").style.width = (shown / TOTAL * 100) + "%";
  }

  /* ---------- utils ------------------------------------------------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  render();
})();
