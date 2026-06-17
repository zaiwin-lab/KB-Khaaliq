/* landing.js — Khaaliq Digital Champion landing interactions */
(function () {
  "use strict";
  const D = window.SDC_DATA, E = window.SDC_ENGINE;
  const $ = s => document.querySelector(s);

  // ticker
  const gear = '<svg class="ticker-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2l-.4 2.6h-4l-.4-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 013 12c0-.4 0-.8.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L9.9 3h4l.4 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.1.4.1.8.1 1.2z"/></svg>';
  $("#ticker").innerHTML = Array(8).fill(
    `<span class="ticker-item">${gear}Empowering 100 New Digital Presences Across Sarawak</span>`).join("");

  // offerings showcase
  $("#offerGrid").innerHTML = D.OFFERINGS.map(o => `
    <div class="offer-item${o.free ? " is-free" : ""}">
      <svg class="offer-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      <div><b>${o.t}${o.free ? ` <span class="free-badge">FREE BONUS</span>` : ""}</b><span>${o.d}</span></div>
    </div>`).join("");

  // pledge progress — real activated count, with a baseline so it never reads empty
  const all = E.loadAll();
  const activated = all.filter(r => /^C|^D/.test(r.status || "")).length;
  const shown = Math.min(100, 12 + activated); // 12 baseline from the campaign so far
  const fill = $("#pledgeFill"), count = $("#pledgeCount");
  requestAnimationFrame(() => { fill.style.width = shown + "%"; });
  let n = 0; const step = Math.max(1, Math.round(shown / 40));
  const t = setInterval(() => { n = Math.min(shown, n + step); count.textContent = n; if (n >= shown) clearInterval(t); }, 24);

  // share
  $("#shareBtn").addEventListener("click", async e => {
    e.preventDefault();
    const data = { title: "Sarawak Digital Champion", text: "Help activate 100 Sarawak business websites.", url: location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); e.target.textContent = "Link copied ✓"; } }
    catch (_) {}
  });
})();
