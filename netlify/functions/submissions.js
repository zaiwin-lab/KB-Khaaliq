/* =====================================================================
   submissions.js — shared data store for client registrations.
   Backed by Netlify Blobs (no external account, no DB to manage).

   GET    /.netlify/functions/submissions        → array of all records
   POST   /.netlify/functions/submissions        → save one record (body = record JSON)
   DELETE /.netlify/functions/submissions?id=…    → delete one record

   This is what makes a form filled on a client's phone show up on the
   team dashboard on any device.
   ===================================================================== */
import { getStore } from "@netlify/blobs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });

export default async (req) => {
  const store = getStore("submissions");

  if (req.method === "GET") {
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
    await store.setJSON(String(rec.id), rec);
    return json({ ok: true, id: rec.id });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (id) await store.delete(String(id));
    return json({ ok: true });
  }

  return json({ error: "method not allowed" }, 405);
};
