/* =====================================================================
   dashboard.js — CRM + the hybrid build pipeline operations board
   Adds: Export Client Folder (ZIP), ChatGPT prompt + NotebookLM source,
   and the Profile2Website ZIP intake that flips a lead to "Build Ready".
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDC_DATA, E = window.SDC_ENGINE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  $("#statusFilter").innerHTML = `<option value="">All stages</option>` +
    D.STATUSES.map(s => `<option>${s}</option>`).join("");

  const scoreColor = n => n >= 75 ? "#1f9d6b" : n >= 50 ? "#e8a33d" : "#c2607f";

  /* ---------- KPIs (pipeline aware) -------------------------------- */
  function renderKpis(list) {
    const total = list.length;
    const avg = total ? Math.round(list.reduce((a, r) => a + (r.leadScore || 0), 0) / total) : 0;
    const buildReady = list.filter(r => ["Build Ready", "Website In Progress"].includes(r.status)).length;
    const live = list.filter(r => r.status === "Published").length;
    $("#kpis").innerHTML = `
      <div class="kpi accent"><strong>${total}</strong><span>Total registrations</span></div>
      <div class="kpi"><strong>${avg}</strong><span>Avg lead score</span></div>
      <div class="kpi"><strong>${buildReady}</strong><span>In build pipeline</span></div>
      <div class="kpi"><strong>${live}</strong><span>Published live</span></div>`;
  }

  /* ---------- table ------------------------------------------------- */
  function currentView() {
    let list = E.loadAll();
    const q = $("#search").value.trim().toLowerCase();
    const sf = $("#statusFilter").value;
    if (q) list = list.filter(r => [r.businessName, r.ownerName, r.district, r.category].join(" ").toLowerCase().includes(q));
    if (sf) list = list.filter(r => r.status === sf);
    const sort = $("#sortBy").value;
    list.sort((a, b) =>
      sort === "name" ? (a.businessName || "").localeCompare(b.businessName || "") :
      sort === "date" ? (b.submittedAt || "").localeCompare(a.submittedAt || "") :
      (b.leadScore || 0) - (a.leadScore || 0));
    return list;
  }
  function render() {
    const all = E.loadAll();
    renderKpis(all);
    const list = currentView(), tbody = $("#rows");
    $("#empty").style.display = all.length ? "none" : "block";
    tbody.innerHTML = list.map(r => `
      <tr data-id="${r.id}">
        <td><strong>${esc(r.businessName || "—")}</strong><br>
          <span style="color:var(--muted);font-size:.8rem">${esc(r.ownerName || "")}</span></td>
        <td class="hide-sm">${esc(r.district || "—")}</td>
        <td class="hide-sm">${esc(r.category || "—")}</td>
        <td><span class="score-pill" style="background:${scoreColor(r.leadScore || 0)}">${r.leadScore || 0}</span></td>
        <td><span class="status-tag">${esc(r.status || "New")}</span></td>
        <td class="hide-sm" style="color:var(--muted);font-size:.82rem">${(r.submittedAt || "").slice(0, 10)}</td>
      </tr>`).join("");
    $$("#rows tr").forEach(tr => tr.onclick = () => openDrawer(tr.dataset.id));
  }

  /* ---------- drawer ------------------------------------------------ */
  let active = null;
  function openDrawer(id) {
    const r = E.loadAll().find(x => x.id === id); if (!r) return;
    active = r;
    $("#dTitle").textContent = r.businessName || "Submission";
    $("#dBody").innerHTML = drawerHtml(r);
    wireDrawer(r);
    $("#drawer").classList.add("open"); $("#drawerBack").classList.add("open");
  }
  function closeDrawer() { $("#drawer").classList.remove("open"); $("#drawerBack").classList.remove("open"); active = null; }

  const row = (k, v) => v ? `<div class="d-row"><span class="k">${k}</span><span>${v}</span></div>` : "";
  const link = (k, u) => u ? `<div class="d-row"><span class="k">${k}</span><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></div>` : "";
  const listv = a => (a && a.length) ? a.map(esc).join(", ") : "—";

  // Embedded NotebookLM PDFs / extras held for the session so the complete
  // ZIP can be rebuilt and re-downloaded without a backend (hybrid mode).
  const ATTACHED = {};
  function pkgHtml(pkg) {
    const files = pkg.files || (pkg.name ? [{ name: pkg.name, size: pkg.size }] : []);
    return `<div class="zip-filled">
      <span class="zip-ic">📦</span>
      <div class="zip-info"><b>Package attached</b>
        ${files.map(f => `<span class="pf">${esc(f.name)} <em>${f.size ? (f.size / 1024).toFixed(0) + " KB" : ""}</em></span>`).join("")}
        <span class="zip-meta">attached ${(pkg.at || "").slice(0, 10)} · click to add more</span></div>
      <button class="icon-btn" id="zipRemove" title="Remove">×</button>
    </div>`;
  }

  function drawerHtml(r) {
    const s = r.summary || E.summarize(r);
    const links = (r.links && r.links.length)
      ? r.links.map(l => link(l.label, l.url)).join("")
      : E.presenceLinks(r).map(u => link("Link", u)).join("") || `<div class="d-row"><span class="k">Links</span><span>None</span></div>`;
    const files = (r.files || []).length
      ? r.files.map(f => `<div class="d-row"><span class="k">${esc(f.category)}</span><span>${esc(f.name)}</span></div>`).join("")
      : `<div class="d-row"><span class="k">Files</span><span>—</span></div>`;
    const statusSel = D.STATUSES.map(st => `<option ${st === r.status ? "selected" : ""}>${st}</option>`).join("");
    const pkg = r.buildPackage;
    const fb = E.clientFolder(r).nameBase;

    return `
      <div class="d-section">
        <h4>Lead Intelligence</h4>
        <div class="lead-head">
          <span class="score-pill big" style="background:${scoreColor(r.leadScore || 0)}">${r.leadScore || 0}</span>
          <div><strong>Lead Score</strong> · Readiness ${s.readiness}/10<br>
            <span style="color:var(--muted);font-size:.82rem">${esc(s.industry)} · ${esc(r.district || "Sarawak")}</span></div>
        </div>
        ${row("Recommended", "<ul class='rec'>" + s.recommended.map(x => `<li>${esc(x)}</li>`).join("") + "</ul>")}
        <div class="d-row"><span class="k">Pipeline stage</span><select id="statusEdit">${statusSel}</select></div>
      </div>

      <div class="d-section pipeline">
        <h4>🔄 Build Pipeline — 3 simple stages</h4>

        <p class="pipe-step">STAGE A · Download the client's input</p>
        <div class="d-actions">
          <button class="btn btn-dark btn-sm" id="dlFolder">⬇ Download “KSA - ${esc(fb)}.zip”</button>
          <button class="btn btn-ghost btn-sm" data-copy="prompt">Copy ChatGPT prompt</button>
          <button class="btn btn-ghost btn-sm" data-copy="notebook">Copy NotebookLM source</button>
        </div>

        <p class="pipe-step">STAGE B · Upload the NotebookLM PDF → get the complete pack</p>
        <div class="zip-zone ${pkg ? "filled" : ""}" id="zipZone">
          ${pkg ? pkgHtml(pkg) : `<span class="zip-ic">⬆️</span>
            <strong>Drop the NotebookLM PDF here</strong>
            <span class="hint">Builds &amp; downloads <b>KSB - ${esc(fb)}.zip</b> with the PDF embedded, and moves the stage to “Build Ready”.</span>`}
          <input type="file" id="zipInput" accept=".zip,.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp" multiple hidden />
        </div>
        ${pkg ? `<div class="d-actions"><button class="btn btn-dark btn-sm" id="rebuildZip">⬇ Re-download “KSB - ${esc(fb)}.zip”</button></div>` : ""}
        <p class="drive-note">📁 File both in Google Drive → <strong>${esc(D.DRIVE_ROOT)}</strong> (KSA in · KSB out)</p>
        <div id="genOut" class="gen-output" style="display:none"></div>
      </div>

      <div class="d-section pipeline">
        <h4>🤝 STAGE C · Preview, payment &amp; onboarding</h4>
        <p class="pipe-note">Share the finished site, take payment, then onboard.</p>
        <div class="preview-row">
          <input id="previewUrl" type="url" placeholder="Paste the website preview link (https://…)" value="${esc(r.previewUrl || "")}" />
          <button class="btn btn-ghost btn-sm" id="savePreview">Save</button>
        </div>
        <div class="d-actions">
          <a class="btn btn-dark btn-sm" id="waClient" target="_blank" rel="noopener">🟢 Send preview on WhatsApp</a>
          <button class="btn btn-ghost btn-sm" id="copyMsg">Copy message</button>
        </div>
        <p class="pipe-step" style="margin-top:.9rem">Move the client along</p>
        <div class="d-actions">
          <button class="btn btn-ghost btn-sm" data-set="Preview Sent">Preview Sent</button>
          <button class="btn btn-ghost btn-sm" data-set="Paid">Paid ✓</button>
          <button class="btn btn-ghost btn-sm" data-set="Onboarded">Onboarded</button>
          <button class="btn btn-ghost btn-sm" data-set="Published">Published 🎉</button>
        </div>
      </div>

      <div class="d-section"><h4>Business Profile</h4>
        ${row("Owner", esc(r.ownerName))}${row("WhatsApp", esc(r.mobile))}${row("Email", esc(r.email))}
        ${row("Category", esc(r.category))}${row("District", esc(r.district))}
        ${row("Operating area", esc(r.operatingArea))}${row("Stage", esc(r.stage))}
      </div>

      <div class="d-section"><h4>Links Repository (AI-sorted)</h4>${links}</div>

      <div class="d-section"><h4>AI Notes</h4>
        ${row("Does", esc(r.aiQ1 || r.description))}${row("Ideal customer", esc(r.aiQ2))}
        ${row("Differentiator", esc(r.aiQ4))}${row("Needs", listv(r.needs))}
        ${row("Competitor", esc(r.comp1))}${row("Inspiration", esc(r.insp1))}${row("Extra", esc(r.aiExtra))}
      </div>

      <div class="d-section"><h4>Uploaded Files</h4>${files}</div>

      <div class="d-section"><h4>Eligibility</h4>
        ${row("Join the 100", r.eligible ? "Yes ✓" : "No")}${row("Reference", esc(r.id))}
      </div>

      <button class="btn btn-ghost btn-sm" id="delBtn" style="color:#c2607f;border-color:#f0d2d8">Delete submission</button>
    `;
  }

  function wireDrawer(r) {
    $("#statusEdit").onchange = e => { r.status = e.target.value; E.upsert(r); render(); };

    // STAGE A — download the client's input as "KSA - Name.zip"
    $("#dlFolder").onclick = async () => {
      if (!window.JSZip) return alert("ZIP library not loaded.");
      const folder = E.clientFolder(r);
      const top = `KSA - ${folder.nameBase}`;
      const zip = new JSZip(), dir = zip.folder(top);
      folder.files.forEach(f => dir.file(f.path, f.content));
      dir.folder("uploads").file("_README.txt",
        "Client-uploaded files are referenced in 06_files-manifest.txt.\n" +
        "Binary files attach here once backend storage is enabled.");
      const blob = await zip.generateAsync({ type: "blob" });
      saveBlob(blob, top + ".zip");
      if (r.status === "New" || r.status === "Reviewing") { r.status = "Folder Exported"; E.upsert(r); render(); $("#statusEdit").value = r.status; }
    };

    // STAGE C — preview link, WhatsApp send, payment + onboarding stage buttons
    const pv = $("#previewUrl"), wa = $("#waClient");
    if (wa) wa.href = waHref(r);
    if (pv) {
      pv.oninput = () => { r.previewUrl = pv.value.trim(); if (wa) wa.href = waHref(r); };
      $("#savePreview").onclick = () => { r.previewUrl = pv.value.trim(); E.upsert(r); flashBtn($("#savePreview"), "Saved ✓"); };
    }
    const cm = $("#copyMsg");
    if (cm) cm.onclick = async () => {
      try { await navigator.clipboard.writeText(previewMessage(r)); flashBtn(cm, "Copied ✓"); }
      catch (_) { const out = $("#genOut"); out.style.display = "block"; out.textContent = previewMessage(r); }
    };
    $$("[data-set]").forEach(b => b.onclick = () => { r.status = b.dataset.set; E.upsert(r); openDrawer(r.id); render(); });

    // copy helpers
    $$("[data-copy]").forEach(b => b.onclick = async () => {
      const text = b.dataset.copy === "prompt" ? E.chatgptSuperPrompt(r) : E.notebookLmSource(r);
      try { await navigator.clipboard.writeText(text); const o = b.textContent; b.textContent = "Copied ✓"; setTimeout(() => b.textContent = o, 1400); }
      catch (_) { const out = $("#genOut"); out.style.display = "block"; out.textContent = text; }
    });

    // NotebookLM PDF intake → builds the complete client ZIP
    const zone = $("#zipZone"), input = $("#zipInput");
    if (zone && input) {
      zone.onclick = e => { if (!e.target.closest("#zipRemove")) input.click(); };
      zone.ondragover = e => { e.preventDefault(); zone.classList.add("drag"); };
      zone.ondragleave = () => zone.classList.remove("drag");
      zone.ondrop = e => { e.preventDefault(); zone.classList.remove("drag"); handleBuildFiles(r, e.dataTransfer.files); };
      input.onchange = () => handleBuildFiles(r, input.files);
    }
    const rb = $("#rebuildZip");
    if (rb) rb.onclick = () => downloadComplete(r);
    const rm = $("#zipRemove");
    if (rm) rm.onclick = e => { e.stopPropagation(); delete r.buildPackage; delete ATTACHED[r.id]; E.upsert(r); openDrawer(r.id); render(); };

    $("#delBtn").onclick = () => { if (confirm("Delete this submission permanently?")) { E.remove(r.id); closeDrawer(); render(); } };
  }

  // Read dropped files into session memory, record metadata, flip stage,
  // then build & download the complete ZIP with the PDF embedded.
  async function handleBuildFiles(r, fileList) {
    const files = Array.from(fileList || []); if (!files.length) return;
    ATTACHED[r.id] = (ATTACHED[r.id] || []).concat(files.map(f => ({ name: f.name, size: f.size, blob: f })));
    r.buildPackage = { files: ATTACHED[r.id].map(x => ({ name: x.name, size: x.size })), at: new Date().toISOString() };
    if (["New", "Reviewing", "Folder Exported"].includes(r.status)) r.status = "Build Ready";
    E.upsert(r);
    await downloadComplete(r);
    openDrawer(r.id); render();
  }

  // STAGE B — build "KSB - Name.zip" with the NotebookLM PDF embedded.
  async function downloadComplete(r) {
    if (!window.JSZip) return alert("ZIP library not loaded.");
    const folder = E.clientFolder(r);
    const top = `KSB - ${folder.nameBase}`;
    const zip = new JSZip(), dir = zip.folder(top);
    folder.files.forEach(f => dir.file(f.path, f.content));
    const sub = dir.folder("07_profile2website");
    const att = ATTACHED[r.id] || [];
    if (att.length) att.forEach(a => sub.file(a.name, a.blob));
    else sub.file("_DROP_THE_PDF_HERE.txt",
      "Re-drop the NotebookLM Profile2Website PDF on the dashboard to embed it here,\nthen this folder ships with the complete build package.");
    dir.file("00_READ_ME.md", folder.files.find(f => f.path === "00_READ_ME.md").content +
      `\n\n## Build package (KSB)\n- Profile2Website files embedded under 07_profile2website/: ` +
      (att.length ? att.map(a => a.name).join(", ") : "none yet") +
      `\n- Hand this COMPLETE (KSB) zip to the Claude build session.\n`);
    const blob = await zip.generateAsync({ type: "blob" });
    saveBlob(blob, top + ".zip");
  }

  /* ---------- Stage C helpers: WhatsApp preview message ------------- */
  function waNumber(mobile) {
    let d = String(mobile || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("60")) return d;
    if (d.startsWith("0")) return "60" + d.slice(1);
    return "60" + d;
  }
  function previewMessage(r) {
    return `Hi ${r.ownerName || "there"}, your new ${r.businessName || "business"} website preview is ready! 🎉\n\n` +
      `Preview: ${r.previewUrl || "(link coming)"}\n\n` +
      `Have a look — once you're happy, activation is RM500 (50% off, first 30 businesses). ` +
      `Reply here to go ahead and we'll get you live.\n\n— Khaaliq's Mission · Sarawak Digital Champion`;
  }
  function waHref(r) {
    const n = waNumber(r.mobile);
    const base = n ? `https://wa.me/${n}` : `https://wa.me/`;
    return `${base}?text=${encodeURIComponent(previewMessage(r))}`;
  }
  function flashBtn(b, txt) { if (!b) return; const o = b.textContent; b.textContent = txt; setTimeout(() => b.textContent = o, 1400); }

  /* ---------- exports ---------------------------------------------- */
  function saveBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function exportJson() { saveBlob(new Blob([JSON.stringify(E.loadAll(), null, 2)], { type: "application/json" }), `sdc-all-${Date.now()}.json`); }
  function exportCsv() {
    const cols = ["id", "businessName", "ownerName", "mobile", "email", "category", "district", "leadScore", "status", "eligible", "submittedAt"];
    const rows = E.loadAll().map(r => cols.map(c => {
      let v = r[c] == null ? "" : String(r[c]).replace(/"/g, '""');
      return /[",\n]/.test(v) ? `"${v}"` : v;
    }).join(","));
    saveBlob(new Blob([[cols.join(","), ...rows].join("\n")], { type: "text/csv" }), `sdc-all-${Date.now()}.csv`);
  }

  /* ---------- sample data ------------------------------------------ */
  function seed() {
    const base = [
      { businessName: "ABC Catering", ownerName: "Siti Rahman", mobile: "012-345 6789", email: "abc@catering.my",
        category: "Catering", district: "Kuching", aiQ1: "Halal catering for corporate and government events.",
        aiQ2: "Corporate & government organisers", aiQ4: "Reliable halal certification, on-time delivery",
        needs: ["Website", "Google Business Profile", "AI Chatbot", "WhatsApp Automation"], eligible: true,
        linkText: "https://facebook.com/abccatering https://instagram.com/abccatering" },
      { businessName: "Borneo Tech Repairs", ownerName: "James Anyi", mobile: "013-888 1122", email: "hello@borneotech.my",
        category: "Services", district: "Miri", aiQ1: "Fast laptop and phone repairs with warranty.",
        aiQ2: "Students and small businesses", needs: ["Website", "Booking System", "SEO"], eligible: true,
        linkText: "https://borneotech.my https://g.page/borneotech" },
      { businessName: "Dayang Handicrafts", ownerName: "Mary Jelani", mobile: "014-222 9090", email: "dayang@craft.my",
        category: "Retail", district: "Sibu", aiQ1: "Handmade traditional Sarawak crafts and beadwork.",
        aiQ2: "Tourists and cultural collectors", needs: ["Website", "E-Commerce", "Logo", "Branding"], eligible: true,
        linkText: "https://shopee.com.my/dayang https://tiktok.com/@dayangcraft" }
    ];
    const existing = new Set(E.loadAll().map(x => (x.businessName || "").toLowerCase()));
    base.forEach(b => {
      if (existing.has(b.businessName.toLowerCase())) return; // no duplicates
      const rec = Object.assign({ id: E.uid(), links: [], otherLinks: [], files: [],
        createdAt: new Date().toISOString(), submittedAt: new Date().toISOString(), status: "New" }, b);
      E.ingestLinks(b.linkText, rec);
      rec.summary = E.summarize(rec); rec.leadScore = rec.summary.leadScore;
      E.upsert(rec);
    });
    render();
  }

  /* ---------- events ----------------------------------------------- */
  $("#search").oninput = render;
  $("#statusFilter").onchange = render;
  $("#sortBy").onchange = render;
  $("#exportBtn").onclick = exportJson;
  $("#exportCsv").onclick = exportCsv;
  $("#dClose").onclick = closeDrawer;
  $("#drawerBack").onclick = closeDrawer;
  $("#seedBtn").onclick = () => { if (E.loadAll().length && !confirm("Add 3 sample businesses?")) return; seed(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

  render();
})();
