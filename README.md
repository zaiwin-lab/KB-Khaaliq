# Sarawak Digital Champion — Abdul Khaaliq

A two-part product for the Sarawak Digital Champion initiative (District Kuching),
built for **KOBIS Berhad**:

1. **Khaaliq's Digital Champion landing** — his personal mission, the full service
   offering as proof of capability, and a clear path to act.
2. **Business Activation** — a short, "feel-good" form that turns each entrepreneur
   into a structured, AI-ready client profile feeding the hybrid build pipeline.

**Live:** https://khaaliqsdc.netlify.app

---

## Pages

| File | Purpose |
|------|---------|
| `index.html` / `landing.js` | Khaaliq landing: hero, mission + 4 pillars, the RM500 offer, **16-point offering showcase**, how-it-works, support/share, final CTA |
| `activate.html` / `app.js` | The short 4-moment form (see below) |
| `dashboard.html` / `dashboard.js` | Team CRM + build pipeline (Client Folder export, ZIP intake) |
| `admin.html` | Redirect → `dashboard.html` (keeps the old link working) |
| `engine.js` | Intelligence layer: AI summary, lead score, smart classifiers, folder/prompt generators |
| `data.js` | Districts, categories, offerings, pipeline statuses, Drive home |
| `style.css` | Navy · Orange · White design system |

No build step, no framework. Static files + vanilla JS. `dashboard.html` loads
JSZip (CDN) only to package the Client Folder.

---

## The short form (no more fatigue)

Four moments instead of twelve boxes:

1. **About you** — 6 essentials only (business, name, WhatsApp, email, category, district).
2. **🔗 Smart Link Dump** — paste *all* links in one box; the AI **detects and labels**
   each (Facebook, Shopee, Google, Website…) live, as chips.
3. **📎 Smart File Dump** — drop everything in one zone; the AI **auto-categorizes**
   each file (Logo, Profile, Certificates…), with manual override.
4. **Your story** — 2 light questions + needs, optional "add more" section, then an
   instant **AI Business Summary** (the trust payoff). Eligibility + one consent. Submit.

Drafts autosave; encouraging microcopy throughout.

---

## The hybrid build pipeline (dashboard)

Mirrors the KOBIS flow end to end. Pipeline stages:

`New → Reviewing → Folder Exported → Build Ready → Website In Progress → Preview Sent → Paid → Onboarded → Published`

Per client, the dashboard gives:

- **⬇ Export Client Folder (.zip)** — a structured folder containing:
  - `01_chatgpt-superprompt.txt` — pre-filled ChatGPT prompt
  - `02_notebooklm-source.md` — clean source for NotebookLM → Profile2Website PDF
  - `03_business-brief.json`, `04_summary`, `05_links`, `06_files-manifest`
- **Copy ChatGPT prompt** / **Copy NotebookLM source** — one-click to clipboard
- **📦 ZIP intake** — drop the finished Profile2Website ZIP back in → flips the stage
  to **Build Ready** for the Claude build session
- Status pipeline, lead score, JSON/CSV export, search/filter/sort

### Shared storage — Google Drive
The shared home is the Drive folder **`SDC — Client Intake`** (one subfolder per
client). The dashboard generates the exact folder structure to file there. Auto-sync
from the live portal into Drive is the next phase (needs a small backend).

---

## Beta data note
Submissions persist to `localStorage` so everything works with zero backend. File
uploads store metadata (name, size, category); binary upload + shared team storage
arrive with the backend phase. The deterministic "AI" in `engine.js` is swappable
for the Claude API without UI changes (the record shape stays identical).

---

## Run locally
```bash
python3 -m http.server 8000
# index.html · activate.html · dashboard.html
```

*This Digital Experience is Part of the KOBIS Berhad Innovation Ecosystem.*
