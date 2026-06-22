/* =====================================================================
   create-bill.js — creates a ToyyibPay payment bill and returns a URL
   the customer is redirected to (FPX online banking + card).

   POST body (JSON): { amount, business, owner, id, description, email, phone }
   Returns: { url } on success, or { error } so the client can fall back
   to the WhatsApp order flow (Beta-safe — payment never blocks an order).

   Config via env vars (set in Netlify, never in code):
     TOYYIBPAY_SECRET     your ToyyibPay User Secret Key
     TOYYIBPAY_CATEGORY   the Category Code to create bills under
     TOYYIBPAY_BASE       (optional) https://toyyibpay.com  (or dev sandbox)
   ===================================================================== */
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });

// ToyyibPay only accepts letters, numbers and spaces in name/description.
const clean = (s, max) =>
  String(s || "").replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

// Normalise a Malaysian mobile to local format (01XXXXXXXX) for the receipt.
const normPhone = (s) => {
  let d = String(s || "").replace(/\D/g, "");
  if (d.startsWith("60")) d = "0" + d.slice(2);
  return d;
};

const validEmail = (s) => /^\S+@\S+\.\S+$/.test(String(s || ""));

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const secret = process.env.TOYYIBPAY_SECRET;
  const category = process.env.TOYYIBPAY_CATEGORY;
  const base = (process.env.TOYYIBPAY_BASE || "https://toyyibpay.com").replace(/\/+$/, "");
  if (!secret || !category) return json({ error: "not_configured" }, 503);

  let o;
  try { o = await req.json(); } catch (_) { return json({ error: "bad JSON" }, 400); }

  const amount = Math.round(Number(o.amount) * 100); // RM → cents
  if (!amount || amount < 100) return json({ error: "bad amount" }, 400);

  const origin = new URL(req.url).origin;
  const ref = (o.id ? String(o.id) : "KSDC") + "-" + Date.now();
  const billName = clean("KSDC " + (o.business || "Website"), 30) || "KSDC Website";
  const billDesc = clean(o.description || "Website activation and add ons", 100) || "Website activation";

  const form = new URLSearchParams({
    userSecretKey: secret,
    categoryCode: category,
    billName,
    billDescription: billDesc,
    billPriceSetting: "1",            // fixed price
    billPayorInfo: "1",              // collect payer info on ToyyibPay page
    billAmount: String(amount),
    billReturnUrl: origin + "/pay.html?paid=1",
    billCallbackUrl: origin + "/.netlify/functions/payment-callback",
    billExternalReferenceNo: ref,
    billTo: clean(o.owner || o.business || "Customer", 50) || "Customer",
    // Use the customer's real email/phone so the official receipt reaches
    // THEM. Leave blank (not a placeholder) when unknown, so ToyyibPay
    // prompts them to fill it rather than mailing the receipt into a void.
    billEmail: validEmail(o.email) ? o.email : "",
    billPhone: normPhone(o.phone),
    billPaymentChannel: "2"          // 0=FPX, 1=card, 2=both
  });

  let data;
  try {
    const res = await fetch(base + "/index.php/api/createBill", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });
    data = await res.json().catch(() => null);
  } catch (e) {
    return json({ error: "gateway_unreachable" }, 502);
  }

  const code = Array.isArray(data) && data[0] && data[0].BillCode;
  if (!code) return json({ error: "create_failed", detail: data }, 502);

  return json({ url: base + "/" + code, billCode: code, ref });
};
