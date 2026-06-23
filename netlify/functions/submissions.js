/* =====================================================================
   submissions.js — shared data store for client registrations.
   Backed by Netlify Blobs (no external account, no DB to manage).

   GET    /.netlify/functions/submissions        → array of all records
   POST   /.netlify/functions/submissions        → save one record (body = record JSON)
   DELETE /.netlify/functions/submissions?id=…    → delete one record

   This is what makes a form filled on a client's phone show up on the
   team dashboard on any device.

   On a *genuinely new* lead, it also fires an instant WhatsApp alert to
   the team via WATI (see notifyNewLead). The alert is fail-safe: if WATI
   is unreachable or unconfigured, the lead is still saved — never lost.
   ===================================================================== */
import { getStore } from "@netlify/blobs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });

/* ---------------------------------------------------------------------
   WhatsApp alert via WATI.
   Config comes from environment variables (set in Netlify, never in code):
     WATI_ENDPOINT   e.g. https://live-mt-server.wati.io/10164894
     WATI_TOKEN      the Bearer access token (without the word "Bearer")
     WATI_NOTIFY_TO  destination WhatsApp number, intl format, no "+"  e.g. 60123456789
     WATI_TEMPLATE   approved template name (defaults to new_chat_v1)
   --------------------------------------------------------------------- */
async function notifyNewLead(rec) {
  const endpoint = process.env.WATI_ENDPOINT;
  const token = process.env.WATI_TOKEN;
  const to = process.env.WATI_NOTIFY_TO;
  const template = process.env.WATI_TEMPLATE || "new_chat_v1";
  if (!endpoint || !token || !to) return; // not configured → skip silently

  const biz = rec.businessName || "New business";
  const owner = rec.ownerName || "—";
  const district = rec.district || "—";
  const mobile = rec.mobile || "—";
  const score = (rec.leadScore != null ? rec.leadScore : (rec.summary && rec.summary.leadScore)) ?? "—";

  // WhatsApp template params must be single-line (no newlines / tabs).
  const clean = (s) => String(s).replace(/\s+/g, " ").trim();

  let parameters;
  if (template === "new_chat_v1") {
    // Only one slot ({{name}}) on the existing approved template — pack a summary in.
    const summary = clean(`NEW LEAD 🔔 ${biz} · ${owner} · ${district} · 📱${mobile} · ⭐${score}/100`);
    parameters = [{ name: "name", value: summary }];
  } else {
    // Clean dedicated template (new_lead_alert): one field per slot.
    parameters = [
      { name: "name", value: clean(owner) },
      { name: "business", value: clean(biz) },
      { name: "district", value: clean(district) },
      { name: "mobile", value: clean(mobile) },
      { name: "score", value: clean(score) }
    ];
  }

  const url =
    endpoint.replace(/\/+$/, "") +
    "/api/v1/sendTemplateMessage?whatsappNumber=" +
    encodeURIComponent(to);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      template_name: template,
      broadcast_name: "ksdc_new_lead_" + Date.now(),
      parameters
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("WATI notify failed", res.status, detail.slice(0, 300));
  }
}

export default async (req) => {
  const store = getStore("submissions");

  if (req.method === "GET") {
    // Single-record lookup (?id=) returns only the minimal contact fields the
    // public checkout needs — never the full record, for privacy.
    const qid = new URL(req.url).searchParams.get("id");
    if (qid) {
      // Strong consistency so a customer who pays immediately after signing up
      // still gets their real details (and receipt) on the checkout.
      const rec = await store
        .get(String(qid), { type: "json", consistency: "strong" })
        .catch(() => null);
      if (!rec) return json(null, 404);
      return json({
        id: rec.id,
        businessName: rec.businessName || "",
        ownerName: rec.ownerName || "",
        email: rec.email || "",
        mobile: rec.mobile || ""
      });
    }

    const { blobs } = await store.list();
    const records = await Promise.all(
      blobs.map((b) => store.get(b.key, { type: "json" }).catch(() => null))
    );
    return json(records.filter(Boolean));
  }

  if (req.method === "POST") {
    let rec;
    try { rec = await req.json(); } catch (_) { return json({ error: "bad JSON" }, 400); }
    if (!rec || !rec.id) return json({ error: "missing id" }, 400);

    // Is this a brand-new lead, or an update to an existing one?
    // Only a first-time arrival with real business details earns an alert,
    // so dashboard status-changes (which re-POST the same id) never spam.
    const existing = await store.get(String(rec.id), { consistency: "strong" }).catch(() => null);
    await store.setJSON(String(rec.id), rec);

    if (!existing && rec.businessName) {
      try { await notifyNewLead(rec); } catch (e) {
        console.error("notifyNewLead threw", e && e.message);
      }
    }

    return json({ ok: true, id: rec.id });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (id) await store.delete(String(id));
    return json({ ok: true });
  }

  return json({ error: "method not allowed" }, 405);
};
