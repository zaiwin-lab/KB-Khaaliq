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
        <h4>🔄 Hybrid Build Pipeline</h4>
        <p class="pipe-note">Folder → ChatGPT → NotebookLM (Profile2Website PDF) → zip back → Claude builds.</p>
        <div class="d-actions">
          <button class="btn btn-dark btn-sm" id="dlFolder">⬇ Export Client Folder (.zip)</button>
          <button class="btn btn-ghost btn-sm" data-copy="prompt">Copy ChatGPT prompt</button>
          <button class="btn btn-ghost btn-sm" data-copy="notebook">Copy NotebookLM source</button>
        </div>
        <p class="drive-note">📁 Shared home: Google Drive → <strong>${esc(D.DRIVE_ROOT)} / ${esc(E.clientFolder(r).folderName)}</strong></p>

        <div class="zip-zone ${pkg ? "filled" : ""}" id="zipZone">
          ${pkg
            ? `<div class="zip-filled"><span class="zip-ic">📦</span>
                 <div><b>${esc(pkg.name)}</b><span>${(pkg.size / 1024).toFixed(0)} KB · attached ${(pkg.at || "").slice(0,10)}</span></div>
                 <button class="icon-btn" id="zipRemove" title="Remove">×</button></div>`
            : `<span class="zip-ic">📦</span><strong>Drop the Profile2Website ZIP here</strong>
               <span class="hint">Folder + PDF, zipped. This flips the stage to “Build Ready”.</span>
               <input type="file" id="zipInput" accept=".zip,.pdf" hidden />`}
        </div>
        <div id="genOut" class="gen-output" style="display:none"></div>
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

    // Export Client Folder as a ZIP
    $("#dlFolder").onclick = async () => {
      const folder = E.clientFolder(r);
      if (!window.JSZip) return alert("ZIP library not loaded.");
      const zip = new JSZip(), dir = zip.folder(folder.folderName);
      folder.files.forEach(f => dir.file(f.path, f.content));
      dir.folder("uploads").file("_README.txt",
        "Client-uploaded files are referenced in 06_files-manifest.txt.\n" +
        "Binary files attach here once backend storage is enabled.");
      const blob = await zip.generateAsync({ type: "blob" });
      saveBlob(blob, folder.folderName + ".zip");
      if (r.status === "New" || r.status === "Reviewing") { r.status = "Folder Exported"; E.upsert(r); render(); $("#statusEdit").value = r.status; }
    };

    // copy helpers
    $$("[data-copy]").forEach(b => b.onclick = async () => {
      const text = b.dataset.copy === "prompt" ? E.chatgptSuperPrompt(r) : E.notebookLmSource(r);
      try { await navigator.clipboard.writeText(text); const o = b.textContent; b.textContent = "Copied ✓"; setTimeout(() => b.textContent = o, 1400); }
      catch (_) { const out = $("#genOut"); out.style.display = "block"; out.textContent = text; }
    });

    // ZIP intake
    const zone = $("#zipZone"), input = $("#zipInput");
    if (input) {
      zone.onclick = () => input.click();
      zone.ondragover = e => { e.preventDefault(); zone.classList.add("drag"); };
      zone.ondragleave = () => zone.classList.remove("drag");
      zone.ondrop = e => { e.preventDefault(); zone.classList.remove("drag"); attachZip(r, e.dataTransfer.files[0]); };
      input.onchange = () => attachZip(r, input.files[0]);
    }
    const rm = $("#zipRemove");
    if (rm) rm.onclick = e => { e.stopPropagation(); delete r.buildPackage; E.upsert(r); openDrawer(r.id); render(); };

    $("#delBtn").onclick = () => { if (confirm("Delete this submission permanently?")) { E.remove(r.id); closeDrawer(); render(); } };
  }

  function attachZip(r, file) {
    if (!file) return;
    r.buildPackage = { name: file.name, size: file.size, at: new Date().toISOString() };
    if (["New", "Reviewing", "Folder Exported"].includes(r.status)) r.status = "Build Ready";
    E.upsert(r); openDrawer(r.id); render();
  }

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
    base.forEach(b => {
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
