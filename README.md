# Sarawak Digital Champion — Business Activation Portal (Beta)

> **Empowering 100 New Digital Presences Across Sarawak**
>
> Register your business today and let AI help us understand your needs before
> building your digital presence.

A **Business Intelligence Collection Engine** for the Sarawak Digital Champion
initiative. Instead of collecting business info one-by-one over WhatsApp, every
entrepreneur fills one structured, AI-ready profile that doubles as a CRM record,
project brief, knowledge base, website requirement form, and onboarding system.

Built for **KOBIS Berhad** as the front end of the longer-term *Website Growth
Engine* — each submission becomes a structured digital asset that can later feed
automated website generation, proposal generation and chatbot creation.

---

## What's in here

| File | Purpose |
|------|---------|
| `index.html` | Landing hero + 12-step registration wizard |
| `admin.html` | CRM / Business Intelligence dashboard |
| `style.css`  | Design system (Navy · Orange · White, poster-inspired) |
| `data.js`    | Reference data — 45 districts, categories, needs, statuses |
| `engine.js`  | Shared intelligence: persistence, AI summary, lead score, brief/proposal generators |
| `app.js`     | Wizard logic (validation, autosave draft, file vault, map, AI summary) |
| `admin.js`   | Dashboard: triage, status pipeline, exports, AI generators |

No build step, no dependencies. Just static files + vanilla JS.

---

## The 12-step flow

1. **Business Information** — name, owner, contact, category, stage, district
2. **Digital Presence Audit** — website, FB, IG, TikTok, LinkedIn, Google, Shopee, Lazada + dynamic links
3. **Business Location** — map preview, geolocation capture, lat/long, operating area
4. **AI Business Discovery** — 6 knowledge-base questions (the future AI brain)
5. **Digital Needs Assessment** — 16 multi-select services
6. **Competitor Analysis** — 3 competitors + likes / improvements
7. **Inspiration Gallery** — 3 reference sites + why
8. **File Vault** — drag & drop uploads, categorised
9. **AI Assistant** — free text + instant **AI Business Summary** (the WOW factor)
10. **Eligibility** — join the 100 / feature as success story
11. **Terms & Conditions** — three required consents
12. **Confirmation** — reference ID + final AI summary

Progress is **autosaved as a draft** to the browser, so entrepreneurs can resume.

---

## AI / Intelligence features (Beta = deterministic, production = LLM)

The Beta ships a **deterministic, offline intelligence layer** in `engine.js`
so everything works today with zero API keys:

- **AI Business Summary** — industry, main customer, key challenge, recommended
  solutions, digital readiness.
- **Lead Score (1–100)** — weighted by completeness, existing digital presence,
  readiness/stage, and needs/budget signals.
- **Digital Readiness (x/10)**.
- **Website Brief generator** — business summary, brand direction, site structure,
  suggested copy, colors, features.
- **Proposal generators** — Website / Sales Page / MVP.

> **Going production:** replace the deterministic functions in `engine.js`
> (`summarize`, `websiteBrief`, `proposal`) with calls to the Claude API, and
> swap `loadAll/saveAll/upsert` for your backend API. The record shape stays
> identical, so the UI needs no changes.

---

## Admin dashboard

`admin.html` reads the same records and provides:

- KPI cards (total, avg lead score, want-to-join-100, in-build/activated)
- Search, status filter, sort (score / newest / name)
- Detail drawer: full profile, links repository, AI notes, competitors,
  inspiration, files, AI summary
- **Status pipeline:** New → Reviewing → Contacted → Approved →
  Website In Progress → Website Delivered → Activated
- **AI generators** (Website Brief + Proposals) per record
- **Export** to JSON and CSV
- **Load sample data** to explore with 3 demo businesses

---

## Data storage (Beta)

Records persist to `localStorage` (`sdc_submissions_v1`) and drafts to
`sdc_draft_v1`. This makes the portal fully functional with no server. File
uploads store **metadata only** in Beta (name, size, category); wire binary
upload to your object store / backend for production.

---

## Run locally

It's static — open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/index.html  and  /admin.html
```

---

## Design

Inspired by the Sarawak Digital Champion posters — **Navy · Orange · White**,
premium, clean, corporate, mobile-first. Tone is a *Digital Transformation
Mission*, **not** political / campaign style.

*This Digital Experience is Part of the KOBIS Berhad Innovation Ecosystem.*
