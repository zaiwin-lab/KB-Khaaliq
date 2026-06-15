/* =====================================================================
   admin.js — CRM / Business Intelligence dashboard
   Reads submissions from the engine, lets the team triage, manage status,
   and generate Website Briefs + Proposals (future LLM input).
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDC_DATA, E = window.SDC_ENGINE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let activeId = null;

  /* ---------- status filter options -------------------------------- */
  $("#statusFilter").innerHTML = `<option value="">All statuses</option>` +
    D.STATUSES.map(s => `<option>${s}</option>`).join("");

  /* ---------- score color ------------------------------------------ */
  function scoreColor(n) {
    if (n >= 75) return "#1f9d6b";
    if (n >= 50) return "#e8a33d";
    return "#c2607f";
  }

  /* ---------- KPIs -------------------------------------------------- */
  function renderKpis(list) {
    const total = list.length;
    const avg = total ? Math.round(list.reduce((a, r) => a + (r.leadScore || 0), 0) / total) : 0;
    const eligible = list.filter(r => r.eligible).length;
    const active = list.filter(r => ["Website In Progress", "Website Delivered", "Activated"].includes(r.status)).length;
    $("#kpis").innerHTML = `
      <div class="kpi accent"><strong>${total}</strong><span>Total registrations</span></div>
      <div class="kpi"><strong>${avg}</strong><span>Avg lead score</span></div>
      <div class="kpi"><strong>${eligible}</strong><span>Want to join the 100</span></div>
      <div class="kpi"><strong>${active}</strong><span>In build / activated</span></div>`;
  }

  /* ---------- table ------------------------------------------------- */
  function currentView() {
    let list = E.loadAll();
    const q = $("#search").value.trim().toLowerCase();
    const sf = $("#statusFilter").value;
    if (q) list = list.filter(r =>
      [r.businessName, r.ownerName, r.district, r.category].join(" ").toLowerCase().includes(q));
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
    const list = currentView();
    const tbody = $("#rows");
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
  function openDrawer(id) {
    const r = E.loadAll().find(x => x.id === id);
    if (!r) return;
    activeId = id;
    $("#dTitle").textContent = r.businessName || "Submission";
    $("#dBody").innerHTML = drawerHtml(r);
    wireDrawer(r);
    $("#drawer").classList.add("open");
    $("#drawerBack").classList.add("open");
  }
  function closeDrawer() {
    $("#drawer").classList.remove("open");
    $("#drawerBack").classList.remove("open");
    activeId = null;
  }

  function row(k, v) { return v ? `<div class="d-row"><span class="k">${k}</span><span>${v}</span></div>` : ""; }
  function link(k, url) { return url ? `<div class="d-row"><span class="k">${k}</span><a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></div>` : ""; }
  function list(arr) { return (arr && arr.length) ? arr.map(esc).join(", ") : "—"; }

  function drawerHtml(r) {
    const s = r.summary || E.summarize(r);
    const others = (r.otherLinks || []).filter(Boolean).map(u => link("Other", u)).join("");
    const files = (r.files || []).map(f =>
      `<div class="d-row"><span class="k">${esc(f.category)}</span><span>${esc(f.name)} <span style="color:var(--muted)">(${f.size ? (f.size/1024).toFixed(0)+' KB' : ''})</span></span></div>`).join("") || `<div class="d-row"><span class="k">Files</span><span>—</span></div>`;
    const statusSel = D.STATUSES.map(st => `<option ${st === r.status ? "selected" : ""}>${st}</option>`).join("");

    return `
      <div class="d-section">
        <h4>Lead Intelligence</h4>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.6rem">
          <span class="score-pill" style="background:${scoreColor(r.leadScore||0)};height:36px;min-width:48px;font-size:1rem">${r.leadScore||0}</span>
          <div><strong>Lead Score</strong> · Readiness ${s.readiness}/10</div>
        </div>
        ${row("Recommended", "<ul style='margin:.2rem 0;padding-left:1.1rem'>" + s.recommended.map(x=>`<li>${esc(x)}</li>`).join("") + "</ul>")}
        <div class="d-row"><span class="k">Status</span>
          <select id="statusEdit">${statusSel}</select></div>
      </div>

      <div class="d-section">
        <h4>Business Profile</h4>
        ${row("Owner", esc(r.ownerName))}
        ${row("Mobile", esc(r.mobile))}
        ${row("Email", esc(r.email))}
        ${row("Category", esc(r.category))}
        ${row("Stage", esc(r.stage))}
        ${row("District", esc(r.district))}
        ${row("Operating area", esc(r.operatingArea))}
        ${row("Description", esc(r.description))}
        ${row("Address", esc(r.address))}
        ${(r.lat && r.lng) ? row("Coordinates", esc(r.lat)+", "+esc(r.lng)) : ""}
      </div>

      <div class="d-section">
        <h4>Links Repository</h4>
        ${link("Website", r.websiteUrl)}${link("Facebook", r.facebook)}${link("Instagram", r.instagram)}
        ${link("TikTok", r.tiktok)}${link("LinkedIn", r.linkedin)}${link("Google", r.google)}
        ${link("Shopee", r.shopee)}${link("Lazada", r.lazada)}${others}
        ${!E.presenceLinks(r).length ? '<div class="d-row"><span class="k">Links</span><span>None provided</span></div>' : ""}
      </div>

      <div class="d-section">
        <h4>AI Notes (Discovery)</h4>
        ${row("Does", esc(r.aiQ1))}
        ${row("Ideal customer", esc(r.aiQ2))}
        ${row("Top revenue", esc(r.aiQ3))}
        ${row("Differentiator", esc(r.aiQ4))}
        ${row("Challenges", list(r.challenges))}
        ${row("12-mo success", esc(r.aiQ6))}
        ${row("Needs", list(r.needs))}
        ${row("Extra notes", esc(r.aiExtra))}
      </div>

      <div class="d-section">
        <h4>Competitors</h4>
        ${link("Competitor 1", r.comp1)}${link("Competitor 2", r.comp2)}${link("Competitor 3", r.comp3)}
        ${row("Likes", esc(r.compLike))}${row("Improve", esc(r.compBetter))}
      </div>

      <div class="d-section">
        <h4>Inspiration References</h4>
        ${link("Inspiration 1", r.insp1)}${link("Inspiration 2", r.insp2)}${link("Inspiration 3", r.insp3)}
        ${row("Why", esc(r.inspWhy))}
      </div>

      <div class="d-section">
        <h4>Uploaded Files</h4>
        ${files}
      </div>

      <div class="d-section">
        <h4>AI Generators <span style="color:var(--muted);font-weight:400;text-transform:none">· future LLM input</span></h4>
        <div class="d-actions">
          <button class="btn btn-dark btn-sm" data-gen="brief">Generate Website Brief</button>
          <button class="btn btn-ghost btn-sm" data-gen="website">Website Proposal</button>
          <button class="btn btn-ghost btn-sm" data-gen="sales">Sales Page Proposal</button>
          <button class="btn btn-ghost btn-sm" data-gen="mvp">MVP Proposal</button>
        </div>
        <div class="gen-output" id="genOut" style="display:none"></div>
      </div>

      <div class="d-section">
        <h4>Eligibility</h4>
        ${row("Join the 100", r.eligible ? "Yes ✓" : "No")}
        ${row("Feature story", r.featured ? "Yes ✓" : "No")}
        ${row("Reference", esc(r.id))}
      </div>

      <button class="btn btn-ghost btn-sm" id="delBtn" style="color:#c2607f;border-color:#f0d2d8">Delete submission</button>
    `;
  }

  function wireDrawer(r) {
    $("#statusEdit").onchange = e => {
      r.status = e.target.value; E.upsert(r); render();
    };
    $$("[data-gen]").forEach(b => b.onclick = () => {
      const out = $("#genOut"); out.style.display = "block";
      const kind = b.dataset.gen;
      const obj = kind === "brief" ? E.websiteBrief(r) : E.proposal(r, kind);
      out.textContent = JSON.stringify(obj, null, 2);
    });
    $("#delBtn").onclick = () => {
      if (confirm("Delete this submission permanently?")) { E.remove(r.id); closeDrawer(); render(); }
    };
  }

  /* ---------- export ------------------------------------------------ */
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportJson() {
    download(`sdc-submissions-${Date.now()}.json`, JSON.stringify(E.loadAll(), null, 2), "application/json");
  }
  function exportCsv() {
    const list = E.loadAll();
    const cols = ["id", "businessName", "ownerName", "mobile", "email", "category",
      "stage", "district", "operatingArea", "leadScore", "status", "eligible", "submittedAt"];
    const head = cols.join(",");
    const rows = list.map(r => cols.map(c => {
      let v = r[c]; if (v == null) v = "";
      v = String(v).replace(/"/g, '""');
      return /[",\n]/.test(v) ? `"${v}"` : v;
    }).join(","));
    download(`sdc-submissions-${Date.now()}.csv`, [head, ...rows].join("\n"), "text/csv");
  }

  /* ---------- sample data ------------------------------------------ */
  function seed() {
    const samples = [
      { businessName: "ABC Catering", ownerName: "Siti Rahman", mobile: "012-345 6789",
        email: "abc@catering.my", category: "Catering", stage: "Operating", district: "Kuching",
        description: "Halal corporate & event catering.", operatingArea: "Kuching",
        facebook: "https://facebook.com/abccatering", aiQ1: "We provide halal catering for corporate and government events.",
        aiQ2: "Corporate & government event organisers", aiQ3: "Bulk event catering packages",
        aiQ4: "Reliable halal certification and on-time delivery", challenges: ["Getting customers", "Marketing"],
        aiQ6: "Become the go-to caterer for government events in Kuching",
        needs: ["Website", "Google Business Profile", "AI Chatbot", "WhatsApp Automation"],
        eligible: true, featured: true },
      { businessName: "Borneo Tech Repairs", ownerName: "James Anyi", mobile: "013-888 1122",
        email: "hello@borneotech.my", category: "Services", stage: "Growing", district: "Miri",
        description: "Laptop & phone repair specialists.", operatingArea: "Miri",
        websiteUrl: "https://borneotech.my", instagram: "https://instagram.com/borneotech",
        google: "https://g.page/borneotech", aiQ1: "Fast laptop and phone repairs with warranty.",
        aiQ2: "Students and small businesses", aiQ3: "Screen and battery replacements",
        aiQ4: "Same-day service with 6-month warranty", challenges: ["Branding", "Website"],
        aiQ6: "Open a second branch", needs: ["Website", "Booking System", "SEO"], eligible: true, featured: false },
      { businessName: "Dayang Handicrafts", ownerName: "Mary Jelani", mobile: "014-222 9090",
        email: "dayang@craft.my", category: "Retail", stage: "Startup", district: "Sibu",
        description: "Traditional Sarawak handicrafts.", operatingArea: "Sarawak Wide",
        aiQ1: "We sell handmade traditional Sarawak crafts and beadwork.",
        aiQ2: "Tourists and cultural collectors", aiQ3: "Beaded accessories",
        aiQ4: "Authentic indigenous craftsmanship", challenges: ["Getting customers", "Sales"],
        aiQ6: "Sell nationwide online", needs: ["Website", "E-Commerce", "Logo", "Branding", "Social Media"],
        eligible: true, featured: true }
    ];
    samples.forEach(s => {
      const rec = Object.assign({ id: E.uid(), otherLinks: [], files: [],
        createdAt: new Date().toISOString(), submittedAt: new Date().toISOString(), status: "New" }, s);
      rec.summary = E.summarize(rec); rec.leadScore = rec.summary.leadScore;
      E.upsert(rec);
    });
    render();
  }

  /* ---------- events ------------------------------------------------ */
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
