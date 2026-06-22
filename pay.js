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
    $("#payBtn").href = waHref(total);
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

  $("#copyOrder").addEventListener("click", async e => {
    try { await navigator.clipboard.writeText(orderText(render())); e.target.textContent = "Copied ✓"; setTimeout(() => e.target.textContent = "Copy order details", 1400); }
    catch (_) {}
  });

  /* ---------- Online payment (ToyyibPay), WhatsApp as fallback ------- */
  function orderDescription() {
    const parts = ["Website Activation"];
    selected.forEach(i => parts.push(D.ADDONS[i].k));
    return parts.join(", ");
  }
  const payOnlineBtn = $("#payOnlineBtn");
  if (payOnlineBtn) payOnlineBtn.addEventListener("click", async () => {
    const total = render();
    const orig = payOnlineBtn.textContent;
    payOnlineBtn.disabled = true;
    payOnlineBtn.textContent = "Connecting to payment…";
    try {
      const res = await fetch("/.netlify/functions/create-bill", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: total, business: biz, owner, id: recId, description: orderDescription() })
      });
      const data = await res.json().catch(() => null);
      if (data && data.url) { location.href = data.url; return; }   // → ToyyibPay
    } catch (_) { /* fall through to WhatsApp */ }
    location.href = waHref(total);                                  // graceful fallback
  });

  /* ---------- success banner when returning from a paid bill -------- */
  if (p.get("paid") === "1" || p.get("status_id") === "1") {
    const ok = document.createElement("div");
    ok.style.cssText = "margin:1rem 0;padding:.9rem 1rem;border-radius:10px;background:#e7f7ec;color:#176b35;font-weight:600;text-align:center";
    ok.textContent = "✅ Payment received — thank you! We'll be in touch shortly.";
    const anchor = $("#payOnlineBtn");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(ok, anchor);
  }

  render();
})();
