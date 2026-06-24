# KSDC Portal — Session Handover

**Project:** Khaaliq's Mission / Sarawak Digital Champion (KSDC) — lead intake → dashboard → online payment portal
**Repo:** `zaiwin-lab/KB-Khaaliq`  ·  **Working branch:** `claude/friendly-turing-icdknc`
**Live site:** https://khaaliqsdc.uk
**Netlify site id:** `7e49a31e-e3b9-4c25-90f3-406467f9ad93` (project name: `khaaliqsdc`, team plan: nf_team_pro)
**Owner:** Zaiwin (zaiwin@gmail.com) · Business entity: KOBIS — Koperasi Pro Belia Inovatif Sarawak Bhd

---

## 1. What this session built (all LIVE in production)

| Capability | Status | Key files |
|---|---|---|
| Shared team backend (Netlify Blobs) | ✅ Live (pre-existing) | `netlify/functions/submissions.js`, `sync.js` |
| Instant WhatsApp lead alert on every new submission (via WATI) | ✅ Live & verified | `netlify/functions/submissions.js` (`notifyNewLead`) |
| Online payment — ToyyibPay (FPX live; DuitNow QR + Card pending) | ✅ Live | `netlify/functions/create-bill.js` |
| Payment callback → auto-marks lead "Paid" | ✅ Live | `netlify/functions/payment-callback.js` |
| Checkout UX: auto-fill real email/phone, itemized add-ons, success/pending/fail screens | ✅ Live | `pay.html`, `pay.js` |
| Single-record lookup (strong consistency) for checkout auto-fill | ✅ Live | `netlify/functions/submissions.js` (GET `?id=`) |

---

## 2. How the system works (flow)

1. Customer fills intake form `https://khaaliqsdc.uk/activate.html` → record saved to Netlify Blobs store `"submissions"` (via `app.js` → `sync.js` → `submissions.js` POST).
2. On a **genuinely new** record (id not seen before AND has `businessName`), `submissions.js` fires a WhatsApp alert through WATI to the team.
3. Team dashboard `https://khaaliqsdc.uk/dashboard.html` auto-pulls all records on load + every 30s.
4. Team sends the customer their pay link: `pay.html?b=<business>&name=<owner>&id=<recordId>`.
5. `pay.js` fetches the customer's real email/phone by `id` (GET `submissions?id=`) and calls `create-bill.js` → ToyyibPay bill → redirect to pay (FPX/etc).
6. On successful payment ToyyibPay calls `payment-callback.js` → sets `rec.paid=true`, `rec.status="Paid"`.

---

## 3. Integrations & config (env vars set in Netlify)

All set via Netlify MCP `manage-env-vars`, scope `functions`, context `all`.
**IMPORTANT:** they must be **NON-secret** (`envVarIsSecret:false`). Netlify "secret" env vars do NOT inject into the Functions runtime — this bit us once; the function read empty values until re-saved as non-secret.

| Env var | Purpose | Notes |
|---|---|---|
| `WATI_ENDPOINT` | WATI API base | `https://live-mt-server.wati.io/10164894` |
| `WATI_TOKEN` | WATI Bearer token | (value already in Netlify; ask Zaiwin) |
| `WATI_NOTIFY_TO` | Alert recipient WhatsApp | `601128465813` (Khaaliq) |
| `WATI_TEMPLATE` | Approved template name | currently `new_chat_v1` → switch to `new_lead_alert` once approved |
| `TOYYIBPAY_SECRET` | ToyyibPay user secret key | (value in Netlify; ask Zaiwin) |
| `TOYYIBPAY_CATEGORY` | ToyyibPay category code | `r2ybi54p` |

**WATI account:** tenant `10164894`, business number `+15559815013`. API: `getMessageTemplates`, `sendTemplateMessage` (param names are template-specific — `new_chat_v1` uses `{name}`; `new_lead_alert` uses `name,business,district,mobile,score`). Create-template endpoint: `POST {endpoint}/api/v1/whatsApp/templates`.

**ToyyibPay account:** merchant KOBIS, settlement bank **RHB `21125460005869`**. createBill: `POST https://toyyibpay.com/index.php/api/createBill`. Fee: FPX RM1 flat; DuitNow QR 1% or RM1; Card 1.4% local (CommercePay). billName/Description = alphanumeric+spaces only (we strip apostrophes).

---

## 4. PENDING (external approvals — auto-activate, no code needed)

| Item | Where | ETA | Action when done |
|---|---|---|---|
| **WhatsApp template `new_lead_alert`** | Meta review (submitted via WATI API) | hours–1 day | Set `WATI_TEMPLATE=new_lead_alert` in Netlify + redeploy |
| **DuitNow QR** | ToyyibPay → Payment Channel (consent form submitted) | 1–3 days | Appears on checkout automatically |
| **Card Payment (CommercePay)** | ToyyibPay → Payment Channel → "Register for Business/Society" (form in progress) | days–2 weeks | RM100 one-time fee via emailed link; then auto-appears |

---

## 5. Open / next actions for Zaiwin

- [ ] Finish + submit the **CommercePay card application** (PayHalal is discontinued; CommercePay only). Values: Type=Cooperative, Reg name=`KOPERASI PRO BELIA INOVATIF SARAWAK BHD`, BRN=`201167400647`, Website=`https://khaaliqsdc.uk`, Address=`1st & 2nd Floor, Lot 284, Section 9, Rubber Road, 93400 Kuching, Sarawak`, TIN=blank.
- [ ] Pay RM100 card registration fee when emailed.
- [ ] Ping to flip the WhatsApp template once Meta approves it.
- [ ] (Optional) Brand the ToyyibPay support footer (currently `support@kobis.com.my`) in ToyyibPay settings.
- [ ] **KICK OFF**: share `https://khaaliqsdc.uk/activate.html` to start taking customers (FPX is live now).

---

## 6. How to deploy (this site is NOT git-auto-deploy)

Deploys are triggered manually:
1. Commit + push to `claude/friendly-turing-icdknc`.
2. Call Netlify MCP `netlify-deploy-services-updater` → `deploy-site` with the site id → it returns an `npx @netlify/mcp ... --proxy-path ...` command.
3. Run that `npx` command in the repo dir (`/home/user/KB-Khaaliq`). It builds + deploys; waits until "Deploy is ready!".

Env var changes require a **redeploy** to take effect in functions.

### To flip the WhatsApp template when approved
1. Verify approval: `GET {WATI_ENDPOINT}/api/v1/getMessageTemplates` → `new_lead_alert` status `APPROVED`.
2. Netlify `manage-env-vars`: upsert `WATI_TEMPLATE=new_lead_alert` (non-secret, scope functions).
3. Redeploy.
4. Test: POST a throwaway record to `submissions` then DELETE it; confirm the polished alert arrives.

---

## 7. Pre-flight / test commands

```bash
BASE="https://khaaliqsdc.uk"; TID="TEST-$(date +%s)"
# create lead (fires alert)
curl -sS -X POST "$BASE/.netlify/functions/submissions" -H "content-type: application/json" \
  -d "{\"id\":\"$TID\",\"businessName\":\"Test Co\",\"ownerName\":\"A\",\"email\":\"a@b.com\",\"mobile\":\"012-000 0000\",\"district\":\"Kuching\",\"leadScore\":90}"
# checkout auto-fill (strong consistency, instant)
curl -sS "$BASE/.netlify/functions/submissions?id=$TID"
# generate FPX checkout
curl -sS -X POST "$BASE/.netlify/functions/create-bill" -H "content-type: application/json" \
  -d "{\"amount\":500,\"business\":\"Test Co\",\"owner\":\"A\",\"email\":\"a@b.com\",\"phone\":\"012-000 0000\",\"id\":\"$TID\"}"
# cleanup
curl -sS -X DELETE "$BASE/.netlify/functions/submissions?id=$TID"
```

---

## 8. Gotchas learned this session

- **Netlify secret env vars don't reach Functions** — store integration keys as NON-secret.
- **Netlify Blobs defaults to eventual consistency** — checkout lookup + new-lead detection use `{ consistency: "strong" }`. The dashboard list read is eventual (fine; polls every 30s).
- **ToyyibPay billName/Description**: alphanumeric + spaces only; apostrophes stripped (`Mom's`→`Moms`).
- **WATI**: business-initiated messages require an APPROVED template; param names are per-template.
- Pay link must carry `&id=` for auto-fill + paid-callback mapping (dashboard `payUrl()` already does).

---

## 9. Commits this session (branch `claude/friendly-turing-icdknc`)

- Add instant WhatsApp new-lead alerts via WATI
- Add ToyyibPay online payment (FPX/card) with WhatsApp fallback
- Improve checkout UX: real receipts, auto-fill, itemized bill, result screens
- Declutter checkout + polish bill name
- Use strong consistency for checkout lookup + new-lead detection

_Last updated: this handover. Everything above is deployed and verified live._
