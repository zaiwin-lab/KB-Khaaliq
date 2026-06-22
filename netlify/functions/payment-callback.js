/* =====================================================================
   payment-callback.js — server-to-server callback from ToyyibPay.
   On a successful payment it flags the matching submission as paid so
   the team dashboard reflects it automatically.

   ToyyibPay posts (form-encoded): status_id (1=success), billcode,
   order_id (= our billExternalReferenceNo), amount, transaction_id …
   Always returns 200 "OK" so ToyyibPay stops retrying.
   ===================================================================== */
import { getStore } from "@netlify/blobs";

export default async (req) => {
  let params = {};
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      params = await req.json();
    } else {
      const text = await req.text();
      params = Object.fromEntries(new URLSearchParams(text));
    }
  } catch (_) { /* ignore — still ack */ }

  const status = String(params.status_id ?? params.status ?? "");
  const ref = String(params.order_id || params.billExternalReferenceNo || "");

  if (status === "1" && ref) {
    // ref = "<recordId>-<timestamp>" → strip the trailing timestamp segment.
    const id = ref.split("-").slice(0, -1).join("-");
    if (id) {
      try {
        const store = getStore("submissions");
        const rec = await store.get(id, { type: "json" });
        if (rec) {
          rec.paid = true;
          rec.paidAt = new Date().toISOString();
          rec.paidAmount = Number(params.amount) ? Number(params.amount) / 100 : rec.paidAmount;
          rec.billCode = params.billcode || rec.billCode;
          rec.status = "Paid";
          await store.setJSON(id, rec);
        }
      } catch (_) { /* never fail the callback */ }
    }
  }

  return new Response("OK", { status: 200 });
};
