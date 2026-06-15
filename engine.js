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

  /* ---------- Smart link classifier --------------------------------
     The "AI" behind the single Link Dump box: detects what each pasted
     URL is and labels it, so the entrepreneur never fills 8 fields. */
  const LINK_RULES = [
    [/facebook\.com|fb\.com|fb\.me/i, "Facebook", "facebook"],
    [/instagram\.com|instagr\.am/i, "Instagram", "instagram"],
    [/tiktok\.com/i, "TikTok", "tiktok"],
    [/linkedin\.com/i, "LinkedIn", "linkedin"],
    [/(youtube\.com|youtu\.be)/i, "YouTube", "youtube"],
    [/(wa\.me|whatsapp\.com|api\.whatsapp)/i, "WhatsApp", "whatsapp"],
    [/shopee\./i, "Shopee", "shopee"],
    [/lazada\./i, "Lazada", "lazada"],
    [/(maps\.google|goo\.gl\/maps|g\.page|maps\.app)/i, "Google Maps", "google"],
    [/(business\.google|g\.co)/i, "Google Business", "google"],
    [/(t\.me|telegram)/i, "Telegram", "telegram"],
    [/(twitter\.com|x\.com)/i, "X / Twitter", "twitter"],
    [/(carousell|mudah\.my)/i, "Marketplace", "shop"],
    [/(linktr\.ee|bio\.link|beacons)/i, "Link-in-bio", "link"]
  ];
  function classifyLink(raw) {
    let url = String(raw || "").trim();
    if (!url) return null;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    let host = "";
    try { host = new URL(url).hostname.replace(/^www\./, ""); } catch (_) { return null; }
    for (const [re, label, key] of LINK_RULES)
      if (re.test(url)) return { url, label, key, host };
    // default → treat as the business's own website
    return { url, label: "Website", key: "website", host };
  }
  // Map classified links onto the canonical record fields used everywhere.
  const KEY_TO_FIELD = {
    website: "websiteUrl", facebook: "facebook", instagram: "instagram",
    tiktok: "tiktok", linkedin: "linkedin", google: "google",
    shopee: "shopee", lazada: "lazada"
  };
  function ingestLinks(text, record) {
    const found = [];
    String(text || "").split(/[\s,;\n]+/).forEach(tok => {
      const c = classifyLink(tok);
      if (c) found.push(c);
    });
    // de-dupe by url
    const seen = new Set();
    const links = found.filter(l => !seen.has(l.url) && seen.add(l.url));
    record.links = links;
    // also project onto canonical fields (first of each type wins)
    const others = [];
    links.forEach(l => {
      const f = KEY_TO_FIELD[l.key];
      if (f && !record[f]) record[f] = l.url;
      else if (!f) others.push(l.url);
    });
    record.otherLinks = others;
    return links;
  }

  /* ---------- Smart file classifier --------------------------------- */
  function classifyFile(name) {
    const n = String(name || "").toLowerCase();
    const ext = (n.split(".").pop() || "");
    if (/logo|icon|brandmark|favicon/.test(n)) return "Logo";
    if (/cert|ssm|license|licence|halal|permit|sijil/.test(n)) return "Certificates";
    if (/profile|company.?profile|about|deck|corporate/.test(n)) return "Business Profile";
    if (/proposal|quote|quotation|invoice/.test(n)) return "Proposal";
    if (/menu|catalog|catalogue|price|product/.test(n)) return "Product Photos";
    if (/(banner|poster|flyer|ad|promo|marketing)/.test(n)) return "Marketing Materials";
    if (/(team|staff|office|shop|store|premise|outlet)/.test(n)) return "Company Photos";
    if (["jpg", "jpeg", "png", "webp", "gif", "heic"].includes(ext)) return "Product Photos";
    if (["pdf", "doc", "docx", "ppt", "pptx"].includes(ext)) return "Business Profile";
    return "Others";
  }

  /* ---------- Client Folder artifacts (the hybrid handoff) ----------
     One click in the dashboard → a structured folder your team feeds to
     ChatGPT, then NotebookLM (Profile2Website PDF), then zips back. */
  function slug(s) {
    return String(s || "client").trim().replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_").slice(0, 48) || "client";
  }

  function chatgptSuperPrompt(d) {
    const s = d.summary || summarize(d);
    return `You are a senior web strategist + conversion copywriter for KOBIS Berhad,
building a premium single-page business website under the Sarawak Digital
Champion initiative. Produce a complete website plan AND ready-to-use copy.

== CLIENT ==
Business: ${d.businessName || "—"}
Owner: ${d.ownerName || "—"}
Category: ${d.category || "—"} | Stage: ${d.stage || "—"}
Location: ${d.district || "—"}, Sarawak | Operating area: ${d.operatingArea || "—"}
Contact: ${d.mobile || "—"} | ${d.email || "—"}

== DISCOVERY ==
What they do: ${d.aiQ1 || d.description || "—"}
Ideal customers: ${d.aiQ2 || "—"}
Top revenue: ${d.aiQ3 || "—"}
Differentiator: ${d.aiQ4 || "—"}
Challenges: ${(d.challenges || []).join(", ") || "—"}
12-month success: ${d.aiQ6 || "—"}
Anything else: ${d.aiExtra || "—"}

== DIGITAL FOOTPRINT ==
${(d.links || []).map(l => `- ${l.label}: ${l.url}`).join("\n") || "- none provided"}

== NEEDS ==
${(d.needs || []).join(", ") || "—"}

== AI READ ==
Industry: ${s.industry} | Readiness: ${s.readiness}/10 | Lead score: ${s.leadScore}/100
Recommended: ${s.recommended.join(", ")}

== DELIVER ==
1. One-line value proposition + 3 hero headline options.
2. Site structure (sections in order) with one line of intent each.
3. Full section copy (About, Services/Products, Why Us, Contact CTA).
4. 8-12 SEO keywords + meta title + meta description.
5. Brand direction: 3-color palette (hex) + font pairing + tone.
6. WhatsApp + Google Maps CTA wording.
Write in clear English, ready to paste. Keep it specific to THIS business.`;
  }

  function notebookLmSource(d) {
    const s = d.summary || summarize(d);
    return `# ${d.businessName || "Business"} — Profile2Website Source

## Snapshot
- Owner: ${d.ownerName || "—"}
- Category / Industry: ${d.category || "—"} (${s.industry})
- Stage: ${d.stage || "—"}
- Location: ${d.district || "—"}, Sarawak
- Operating area: ${d.operatingArea || "—"}
- Contact: ${d.mobile || "—"}, ${d.email || "—"}
- Address: ${d.address || "—"}${(d.lat && d.lng) ? ` (${d.lat}, ${d.lng})` : ""}

## The Business
${d.aiQ1 || d.description || "—"}

## Ideal Customers
${d.aiQ2 || "—"}

## Main Revenue
${d.aiQ3 || "—"}

## What Makes Them Different
${d.aiQ4 || "—"}

## Challenges Today
${(d.challenges || []).map(c => `- ${c}`).join("\n") || "- —"}

## Vision (12 Months)
${d.aiQ6 || "—"}

## Digital Footprint
${(d.links || []).map(l => `- ${l.label}: ${l.url}`).join("\n") || "- none"}

## Competitors
${[d.comp1, d.comp2, d.comp3].filter(Boolean).map(c => `- ${c}`).join("\n") || "- —"}
Likes: ${d.compLike || "—"}
Improve: ${d.compBetter || "—"}

## Inspiration
${[d.insp1, d.insp2, d.insp3].filter(Boolean).map(c => `- ${c}`).join("\n") || "- —"}
Why: ${d.inspWhy || "—"}

## Requested Services
${(d.needs || []).map(n => `- ${n}`).join("\n") || "- —"}

## AI Assessment
- Digital readiness: ${s.readiness}/10
- Lead score: ${s.leadScore}/100
- Recommended build: ${s.recommended.join(", ")}
- Extra notes: ${d.aiExtra || "—"}
`;
  }

  // Returns the in-memory folder: array of { path, content } text files.
  function clientFolder(d) {
    const s = d.summary || summarize(d);
    const readme = `# Client Folder — ${d.businessName || "Business"}

Reference: ${d.id}
Exported: ${new Date().toISOString()}
Status: ${d.status || "New"}

## Your team's next 3 steps
1. Open 01_chatgpt-superprompt.txt → paste into ChatGPT → get the website plan + copy.
2. Open 02_notebooklm-source.md → load into NotebookLM → generate the Profile2Website PDF.
3. Put ChatGPT output + the PDF back in this folder, ZIP it, and drop it on the
   client's record in the dashboard (status → Build Ready). Claude takes it from there.

## Contents
- 00_READ_ME.md ............ this file
- 01_chatgpt-superprompt.txt  ready-to-paste ChatGPT prompt (pre-filled)
- 02_notebooklm-source.md ... clean source doc for NotebookLM
- 03_business-brief.json ... full structured record
- 04_business-summary.md ... human-readable AI summary
- 05_links.txt ............. categorized digital footprint
- 06_files-manifest.txt .... files the client uploaded (binaries via backend)
`;
    const summaryMd = `# AI Business Summary — ${s.business}

| Field | Value |
|---|---|
| Industry | ${s.industry} |
| Main customer | ${s.mainCustomer} |
| Key challenge | ${s.keyChallenge} |
| Digital readiness | ${s.readiness}/10 |
| Lead score | ${s.leadScore}/100 |

**Recommended build:** ${s.recommended.join(", ")}
`;
    const linksTxt = (d.links && d.links.length)
      ? d.links.map(l => `${l.label.padEnd(16)} ${l.url}`).join("\n")
      : "No links provided.";
    const filesTxt = (d.files && d.files.length)
      ? d.files.map(f => `[${f.category}] ${f.name}` + (f.size ? ` (${(f.size / 1024).toFixed(0)} KB)` : "")).join("\n")
      : "No files uploaded.";

    return {
      folderName: `Client_${slug(d.businessName)}_${(d.id || "").slice(-4)}`,
      files: [
        { path: "00_READ_ME.md", content: readme },
        { path: "01_chatgpt-superprompt.txt", content: chatgptSuperPrompt(d) },
        { path: "02_notebooklm-source.md", content: notebookLmSource(d) },
        { path: "03_business-brief.json", content: JSON.stringify(d, null, 2) },
        { path: "04_business-summary.md", content: summaryMd },
        { path: "05_links.txt", content: linksTxt },
        { path: "06_files-manifest.txt", content: filesTxt }
      ]
    };
  }

  window.SDC_ENGINE = {
    loadAll, saveAll, upsert, remove, uid,
    summarize, leadScore, digitalReadiness, recommend,
    websiteBrief, proposal, presenceLinks,
    classifyLink, ingestLinks, classifyFile,
    chatgptSuperPrompt, notebookLmSource, clientFolder, slug
  };
})();
