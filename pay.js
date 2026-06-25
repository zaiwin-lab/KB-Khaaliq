/* =====================================================================
   pay.js — client checkout: activation + upsell add-ons, live total,
   WhatsApp order confirmation. Reads ?b=Business&id=… for personalising.
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDC_DATA;
  const $ = (s) => document.querySelector(s);
  const money = n => `${D.CURRENCY}${Number(n).toLocaleString("en-MY")}`;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ticker */
  const gear = '<svg class="ticker-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2l-.4 2.6h-4l-.4-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 013 12c0-.4 0-.8.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L9.9 3h4l.4 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.1.4.1.8.1 1.2z"/></svg>';
  $("#ticker").innerHTML = Array(8).fill(`<span class="ticker-item">${gear}Empowering 100 New Digital Presences Across Sarawak</span>`).join("");

  /* params */
  const p = new URLSearchParams(location.search);
  const biz = (p.get("b") || "").trim();
  const owner = (p.get("name") || "").trim();
  const recId = (p.get("id") || "").trim();
  if (biz) $("#bizName").textContent = biz;
  document.title = (biz ? biz + " — " : "") + "Activate Your Website";

  /* prices */
  $("#wasPrice").textContent = money(D.ACTIVATION_WAS);
  $("#nowPrice").textContent = money(D.ACTIVATION_PRICE);

  /* included list (from offerings) */
  $("#inclGrid").innerHTML = D.OFFERINGS.map(o =>
    `<li class="${o.free ? "is-free" : ""}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>${esc(o.t)}${o.free ? ` <span class="free-badge">FREE</span>` : ""}</li>`).join("");

  /* add-ons */
  const selected = new Set();
  $("#addonList").innerHTML = D.ADDONS.map((a, i) => `
    <label class="addon" data-i="${i}">
      <input type="checkbox" data-addon="${i}" />
      <span class="addon-info"><b>${esc(a.k)}</b><em>${esc(a.d)}</em></span>
      <span class="addon-price">+${money(a.p)}</span>
    </label>`).join("");

  function render() {
    const rows = [`<div class="sum-row base"><span>Website Activation</span><span>${money(D.ACTIVATION_PRICE)}</span></div>`];
    let total = D.ACTIVATION_PRICE;
    selected.forEach(i => {
      const a = D.ADDONS[i]; total += a.p;
      rows.push(`<div class="sum-row"><span>${esc(a.k)}</span><span>+${money(a.p)}</span></div>`);
    });
    $("#sumRows").innerHTML = rows.join("");
    $("#sumTotal").textContent = money(total);
    const _pb = $("#payBtn"); if (_pb) _pb.href = waHref(total);
    return total;
  }

  document.querySelectorAll("[data-addon]").forEach(cb => cb.addEventListener("change", () => {
    const i = +cb.dataset.addon;
    if (cb.checked) selected.add(i); else selected.delete(i);
    cb.closest(".addon").classList.toggle("checked", cb.checked);
    render();
  }));

  /* WhatsApp order */
  function orderText(total) {
    const lines = [
      `🟠 *KSDC WEBSITE ORDER* 🟠`,
      ``,
      `Hi Khaaliq, I'd like to activate my website! 🚀`,
      biz ? `🏢 Business: ${biz}` : null,
      owner ? `👤 Owner: ${owner}` : null,
      ``,
      `• Website Activation — ${money(D.ACTIVATION_PRICE)}`
    ].filter(Boolean);
    selected.forEach(i => lines.push(`• ${D.ADDONS[i].k} — ${money(D.ADDONS[i].p)}`));
    lines.push(``, `💰 Total: ${money(total != null ? total : D.ACTIVATION_PRICE)}`, ``,
      `Please send me the payment details. Thank you!`);
    return lines.join("\n");
  }
  function waHref(total) {
    const base = D.KHAALIQ_WA ? `https://wa.me/${D.KHAALIQ_WA}` : `https://wa.me/`;
    return `${base}?text=${encodeURIComponent(orderText(total))}`;
  }

  /* ---------- customer details (auto-fill the checkout) ------------- */
  // We already collected the customer's name/email/phone at intake — pull
  // them so the receipt reaches THEM and they barely type anything.
  let cust = { name: owner, email: "", phone: "" };
  async function loadCustomer() {
    if (!recId) return;
    try {
      const res = await fetch("/.netlify/functions/submissions?id=" + encodeURIComponent(recId));
      if (!res.ok) return;
      const r = await res.json();
      if (r) {
        cust = { name: r.ownerName || owner, email: r.email || "", phone: r.mobile || "" };
        if (!biz && r.businessName) $("#bizName").textContent = r.businessName;
      }
    } catch (_) { /* checkout still works without it */ }
  }
  const customerReady = loadCustomer();

  /* ---------- Online payment (ToyyibPay), WhatsApp as fallback ------- */
  function orderDescription() {
    const parts = ["Website Activation"];
    selected.forEach(i => parts.push(D.ADDONS[i].k));
    return parts.join(" + ");
  }
  const payOnlineBtn = $("#payOnlineBtn");
  if (payOnlineBtn) payOnlineBtn.addEventListener("click", async () => {
    const total = render();
    const orig = payOnlineBtn.textContent;
    payOnlineBtn.disabled = true;
    payOnlineBtn.textContent = "Connecting to payment…";
    try {
      await customerReady;                                   // make sure details are in
      const res = await fetch("/.netlify/functions/create-bill", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: total, business: biz, id: recId,
          owner: cust.name, email: cust.email, phone: cust.phone,
          description: orderDescription()
        })
      });
      const data = await res.json().catch(() => null);
      if (data && data.url) { location.href = data.url; return; }   // → ToyyibPay
    } catch (_) { /* show inline error below — never bounce to WhatsApp */ }
    payOnlineBtn.disabled = false;
    payOnlineBtn.textContent = orig;
    let e = document.querySelector("#payErr");
    if (!e) {
      e = document.createElement("p");
      e.id = "payErr";
      e.style.cssText = "color:#b42318;font-size:.85rem;text-align:center;margin:.6rem 0 0";
      payOnlineBtn.parentNode.insertBefore(e, payOnlineBtn.nextSibling);
    }
    e.textContent = "⚠️ Payment is busy right now — please tap Pay again in a moment.";
  });

  /* ---------- result screen when returning from ToyyibPay ----------- */
  const sid = p.get("status_id");
  if (p.get("paid") === "1" || sid) {
    const state = sid === "3" ? "fail" : sid === "2" ? "pending" : "success";
    showResult(state);
  }

  function showResult(state) {
    const hero = document.querySelector(".pay-hero");
    const main = document.querySelector("main.pay-wrap");
    if (hero) hero.style.display = "none";
    if (!main) return;
    const wa = D.KHAALIQ_WA ? `https://wa.me/${D.KHAALIQ_WA}` : "index.html";
    const retry = `pay.html?b=${encodeURIComponent(biz)}&name=${encodeURIComponent(cust.name || owner)}` +
      (recId ? `&id=${encodeURIComponent(recId)}` : "");

    if (state === "success") {
      main.innerHTML = `
        <div class="pay-card" style="max-width:580px;margin:2.5rem auto;text-align:center;padding:2rem 1.6rem">
          <div style="font-size:3.2rem;line-height:1">✅</div>
          <h2 style="margin:.6rem 0 .2rem">Payment received — thank you${biz ? `, ${esc(biz)}` : ""}!</h2>
          <p class="base-sub">Your spot is locked in. 🎉</p>
          <div style="text-align:left;background:#f4f8f5;border:1px solid #dcebe0;border-radius:14px;padding:1.1rem 1.3rem;margin:1.4rem 0">
            <p style="margin:0 0 .5rem;font-weight:700">What happens next</p>
            <p style="margin:.45rem 0">1️⃣ Our team starts building your website within <strong>48 hours</strong>.</p>
            <p style="margin:.45rem 0">2️⃣ We'll <strong>WhatsApp you</strong> to confirm your content &amp; details.</p>
            <p style="margin:.45rem 0">3️⃣ Your official <strong>receipt is on its way to your email</strong>. 📧</p>
          </div>
          <a class="btn btn-primary btn-lg" style="width:100%;justify-content:center" href="${wa}">💬 Message us on WhatsApp</a>
          <a class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:.6rem" href="index.html">Back to home</a>
        </div>`;
    } else if (state === "pending") {
      main.innerHTML = `
        <div class="pay-card" style="max-width:560px;margin:2.5rem auto;text-align:center;padding:2rem 1.6rem">
          <div style="font-size:3rem">⏳</div>
          <h2 style="margin:.6rem 0 .2rem">Payment is processing…</h2>
          <p class="base-sub">Your bank is confirming the payment. We'll WhatsApp you the moment it clears — no need to pay again.</p>
          <a class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:1rem" href="${wa}">💬 Check with us on WhatsApp</a>
        </div>`;
    } else {
      main.innerHTML = `
        <div class="pay-card" style="max-width:560px;margin:2.5rem auto;text-align:center;padding:2rem 1.6rem">
          <div style="font-size:3rem">⚠️</div>
          <h2 style="margin:.6rem 0 .2rem">Payment didn't go through</h2>
          <p class="base-sub">No charge was made. You can try again, or pay another way — we're happy to help.</p>
          <a class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:1rem" href="${retry}">↺ Try again</a>
          <a class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:.6rem" href="${wa}">💬 Pay via WhatsApp instead</a>
        </div>`;
    }
  }

  render();
})();
