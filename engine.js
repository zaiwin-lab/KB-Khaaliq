/* =====================================================================
   engine.js — shared intelligence layer
   - Persistence (localStorage; swap to a backend API later)
   - Deterministic "AI" Business Summary
   - Lead Score (1-100) + Digital Readiness (x/10)
   - Website Brief + Proposal generators (placeholders, future LLM input)
   Exposes window.SDC_ENGINE.
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDC_DATA;

  /* ---------- Persistence -------------------------------------------
     NOTE: localStorage is the Beta data layer so the portal works with
     zero backend. To go production, replace load/saveAll/upsert with
     fetch() calls to your API — the record shape stays identical. */
  function loadAll() {
    try { return JSON.parse(localStorage.getItem(D.STORAGE_KEY)) || []; }
    catch (_) { return []; }
  }
  function saveAll(list) {
    localStorage.setItem(D.STORAGE_KEY, JSON.stringify(list));
  }
  function upsert(record) {
    const list = loadAll();
    const i = list.findIndex(r => r.id === record.id);
    if (i >= 0) list[i] = record; else list.push(record);
    saveAll(list);
    return record;
  }
  function remove(id) {
    saveAll(loadAll().filter(r => r.id !== id));
  }
  function uid() {
    return "SDC-" + Date.now().toString(36).toUpperCase() +
           "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  /* ---------- Helpers ------------------------------------------------ */
  const has = v => v != null && String(v).trim() !== "";
  function presenceLinks(d) {
    return ["websiteUrl", "facebook", "tiktok", "instagram", "linkedin",
            "google", "shopee", "lazada"]
      .map(k => d[k]).filter(has)
      .concat((d.otherLinks || []).filter(has));
  }

  /* ---------- Digital Readiness (x/10) ------------------------------- */
  function digitalReadiness(d) {
    let score = 0;
    const links = presenceLinks(d);
    score += Math.min(links.length, 5);            // up to 5 for channels
    if (has(d.websiteUrl)) score += 2;             // a live site matters most
    if (has(d.google)) score += 1;                 // GBP = local discovery
    if (d.stage === "Growing" || d.stage === "Established") score += 1;
    if (has(d.aiQ1) && has(d.aiQ3)) score += 1;    // clarity of offer
    return Math.max(1, Math.min(10, score));
  }

  /* ---------- Lead Score (1-100) ------------------------------------- */
  function leadScore(d) {
    // Completeness (40)
    const keyFields = [
      "businessName", "ownerName", "mobile", "email", "category",
      "description", "stage", "district", "address",
      "aiQ1", "aiQ2", "aiQ3", "aiQ4", "aiQ6"
    ];
    const filled = keyFields.filter(k => has(d[k])).length;
    const completeness = Math.round((filled / keyFields.length) * 40);

    // Existing digital presence (20)
    const presence = Math.min(presenceLinks(d).length * 4, 20);

    // Readiness (20): stage + eligibility
    const stageScore = { "Idea Stage": 4, "Startup": 8, "Operating": 14,
                         "Growing": 18, "Established": 20 }[d.stage] || 0;
    const readiness = Math.round(
      stageScore * 0.7 + (d.eligible ? 6 : 0)
    );

    // Needs / budget signals (20)
    const needs = d.needs || [];
    const hv = needs.filter(n => D.HIGH_VALUE_NEEDS.includes(n)).length;
    const needsScore = Math.min(needs.length * 1.5 + hv * 2, 20);

    return Math.max(1, Math.min(100,
      Math.round(completeness + presence + Math.min(readiness, 20) + needsScore)));
  }

  /* ---------- Recommended solution engine ---------------------------- */
  function recommend(d) {
    const recs = new Set();
    const challenges = d.challenges || [];
    const needs = d.needs || [];

    if (!has(d.websiteUrl)) recs.add("Business Website");
    if (!has(d.google)) recs.add("Google Business Profile");
    if (challenges.includes("Getting customers") || challenges.includes("Sales"))
      recs.add("AI Chatbot");
    if (challenges.includes("Marketing")) recs.add("Social Media + SEO");
    if (challenges.includes("Branding")) recs.add("Branding & Logo");
    if (d.category === "Restaurant" || d.category === "Catering" ||
        d.category === "Retail") recs.add("WhatsApp Automation");
    if (needs.includes("E-Commerce") || d.category === "Retail")
      recs.add("E-Commerce Store");
    needs.forEach(n => { if (D.HIGH_VALUE_NEEDS.includes(n)) recs.add(n); });

    if (recs.size === 0) recs.add("Business Website");
    return Array.from(recs).slice(0, 6);
  }

  /* ---------- AI Business Summary ------------------------------------ */
  const INDUSTRY = {
    Restaurant: "Food & Beverage", Catering: "Food & Beverage",
    Retail: "Retail & Trade", Services: "Professional Services",
    Construction: "Construction & Trades", Training: "Education & Training",
    Consultant: "Consulting", NGO: "Non-Profit / Social"
  };
  function summarize(d) {
    const challenges = d.challenges || [];
    const keyChallenge = challenges[0] ||
      (has(d.aiQ5Text) ? d.aiQ5Text : "Growing digital presence");
    return {
      business: d.businessName || "—",
      industry: INDUSTRY[d.category] || d.category || "—",
      mainCustomer: d.aiQ2 || "—",
      keyChallenge,
      recommended: recommend(d),
      readiness: digitalReadiness(d),
      leadScore: leadScore(d)
    };
  }

  /* ---------- Website Brief generator (future LLM input) ------------- */
  function websiteBrief(d) {
    const s = summarize(d);
    const colors = "Navy (#0B1F3A) · Orange (#F47C20) · White — premium, " +
                   "corporate, government-innovation aesthetic.";
    return {
      businessSummary: `${s.business} is a ${s.industry} business based in ` +
        `${d.district || "Sarawak"} (${d.stage || "—"} stage). ` +
        (d.aiQ1 || d.description || ""),
      brandDirection: d.aiQ4
        ? `Differentiator: ${d.aiQ4}`
        : "Trustworthy, modern, locally rooted Sarawak business.",
      websiteStructure: [
        "Hero — value proposition + primary CTA",
        "About / Story",
        s.industry === "Retail & Trade" ? "Products / Shop" : "Services",
        "Gallery", "Why Us / Differentiators",
        "Location & Google Map", "Contact / WhatsApp"
      ],
      suggestedCopy: `${s.business} — ${d.aiQ1 || d.description ||
        "your trusted Sarawak partner."}`.trim(),
      suggestedColors: colors,
      suggestedFeatures: s.recommended
    };
  }

  /* ---------- Proposal generator ------------------------------------- */
  function proposal(d, type) {
    const s = summarize(d);
    const titles = {
      website: "Website Activation Proposal",
      sales: "Sales Page Proposal",
      mvp: "MVP Proposal"
    };
    return {
      title: titles[type] || "Proposal",
      client: s.business,
      prepared: new Date().toISOString().slice(0, 10),
      overview: `Prepared for ${s.business} (${s.industry}, ${d.district ||
        "Sarawak"}). Digital readiness ${s.readiness}/10, lead score ` +
        `${s.leadScore}/100.`,
      scope: s.recommended,
      objective: d.aiQ6 || "Establish a credible, discoverable digital presence.",
      nextStep: "KOBIS Berhad team to confirm scope and activate within the " +
        "Sarawak Digital Champion 100-business initiative."
    };
  }

  window.SDC_ENGINE = {
    loadAll, saveAll, upsert, remove, uid,
    summarize, leadScore, digitalReadiness, recommend,
    websiteBrief, proposal, presenceLinks
  };
})();
