/* The layout check: finds what a person would see as rough, on every view, station, demo state, road, story step and project step,
   in every language. Required before every review stop, at 1280 × 800 and at phone width (375).
   `python3 kit/build.py --check <course>` builds <out>.check.html with this file inside. Open it, set the window size, then run
       await layoutCheck()          → { width, faults:{ kind:count }, textPx:{ chapter:{ min, median, max } }, list:[…] }
   In a tool that limits how long a script may run: start it with layoutCheck() (no await), read window.__layout when it is set.
   It reports: text running off a drawing, text on text, text out of its shape, boxes overflowing, a page that scrolls sideways,
   text too small on screen, a chapter whose text size differs from the others, a road crossing a part, parts touching,
   text too big (over 19 px: run once at 1920 × 1080), a map label under a part, and a part lit by a list or story step but out of sight on the canvas.
   It can't see: 3D labels, or lines crossing a drawing's own shapes. Look at those yourself. */
window.layoutCheck = async () => {
  if (innerWidth < 300) throw new Error("The page has no width: the browser pane is hidden. Set a window size first, or every check passes for nothing.");
  window.__layout = null;
  const W = ms => new Promise(r => setTimeout(r, ms)), phone = innerWidth < 620, MIN = phone ? 8 : 10;
  const faults = new Map(), sizes = {};
  const add = (kind, where, what) => { const k = kind + "|" + what; if (!faults.has(k)) faults.set(k, { kind, where, what }); };
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let n = e; n && n.nodeType === 1; n = n.parentElement){ const s = getComputedStyle(n); if (s.display === "none" || s.visibility === "hidden" || +s.opacity < 0.05) return false; } return true; };
  const short = s => s.trim().replace(/\s+/g, " ").slice(0, 40);
  function scan(where, ch){
    document.querySelectorAll("#chapter svg").forEach(svg => {
      if (!vis(svg) || !svg.viewBox.baseVal.width || svg.closest(".rl,.ricon,.sn-ico,.v3-hint,.where")) return;   // .where: a small picture for finding the part, not for reading
      const box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sc = Math.min(box.width / vb.width, box.height / vb.height), fx = box.left + (box.width - vb.width * sc) / 2, fy = box.top + (box.height - vb.height * sc) / 2;
      const area = { left:fx, top:fy, right:fx + vb.width * sc, bottom:fy + vb.height * sc };
      const texts = [...svg.querySelectorAll("text")].filter(t => t.textContent.trim() && vis(t));
      const rs = texts.map(t => t.getBoundingClientRect()), shapes = [...svg.querySelectorAll("rect")].filter(b => vis(b)).map(b => b.getBoundingClientRect()).filter(c => c.width < box.width * 0.6);
      texts.forEach((t, i) => {
        const r = rs[i], px = parseFloat(getComputedStyle(t).fontSize) * sc;
        (sizes[ch] = sizes[ch] || []).push(px);
        if (px < MIN) add("text too small", where, `${px.toFixed(1)}px: ${short(t.textContent)}`);
        if (px > 19) add("text too big", where, `${px.toFixed(1)}px: ${short(t.textContent)}`);
        if (!svg.classList.contains("map") && (r.left < area.left - 1 || r.right > area.right + 1 || r.top < area.top - 1 || r.bottom > area.bottom + 1)) add("off the drawing", where, short(t.textContent));
        for (let j = i + 1; j < texts.length; j++){ const q = rs[j], ox = Math.min(r.right, q.right) - Math.max(r.left, q.left), oy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
          if (ox > 2 && oy > Math.min(r.height, q.height) * 0.35) add("text on text", where, short(t.textContent) + " / " + short(texts[j].textContent)); }
        const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, c = shapes.filter(c => cx > c.left && cx < c.right && cy > c.top && cy < c.bottom).sort((a, b) => a.width * a.height - b.width * b.height)[0];
        if (c && !t.classList.contains("zlab") && (r.left < c.left - 1 || r.right > c.right + 1)) add("text out of its shape", where, short(t.textContent));
      });
      if (svg.classList.contains("map")){
        const nodes = [...svg.querySelectorAll("[data-node]")].filter(n => !n.classList.contains("off") && vis(n)).map(n => ({ id:n.dataset.node, r:n.querySelector(".nbox").getBoundingClientRect() }));
        const lit = n => svg.classList.contains("story") ? svg.querySelector(`[data-node="${n.id}"]`).classList.contains("on") : !!svg.querySelector(".node.off");
        nodes.forEach((a, i) => { if (lit(a) && (a.r.left < box.left - 1 || a.r.right > box.right + 1 || a.r.top < box.top - 1 || a.r.bottom > box.bottom + 1)) add("lit part out of sight", where, a.id);
          nodes.slice(i + 1).forEach(b => { if (a.r.left < b.r.right && b.r.left < a.r.right && a.r.top < b.r.bottom && b.r.top < a.r.bottom) add("parts touching", where, a.id + " / " + b.id); }); });
        texts.filter(t => t.classList.contains("zlab")).forEach(t => { const q = t.getBoundingClientRect(), hit = nodes.find(n => q.left < n.r.right && n.r.left < q.right && q.top < n.r.bottom && n.r.top < q.bottom); if (hit) add("label under a part", where, short(t.textContent) + " / " + hit.id); });
        const m = svg.getScreenCTM();
        svg.querySelectorAll("[data-road]").forEach(p => { const ends = new Set(((window.kit.roads && window.kit.roads()) || []).filter(r => r.i === +p.dataset.road).flatMap(r => [r.a, r.b])), len = p.getTotalLength();
          for (let d = 0; d < len; d += 8){ const pt = p.getPointAtLength(d), x = pt.x * m.a + m.e, y = pt.y * m.d + m.f, hit = nodes.find(n => !ends.has(n.id) && x > n.r.left + 3 && x < n.r.right - 3 && y > n.r.top + 3 && y < n.r.bottom - 3); if (hit){ add("road crosses a part", where, [...ends].join("→") + " crosses " + hit.id); break; } } });
      }
    });
    document.querySelectorAll("#chapter *").forEach(e => {
      if (e.closest("svg") || e.closest(".v3") || !e.textContent.trim() || !vis(e)) return;
      const s = getComputedStyle(e); if (s.overflowX !== "visible" || s.display === "inline") return;
      if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) add("box overflow", where, e.tagName + "." + e.className + " " + short(e.textContent));
    });
    if (document.documentElement.scrollWidth > innerWidth + 1) add("page scrolls sideways", where, "page");
  }
  const c = s => { const e = typeof s === "string" ? document.querySelector(s) : s; if (e) e.dispatchEvent(new MouseEvent("click", { bubbles:true })); };
  kit.still(true);
  for (const lang of kit.langs || ["en", "zh"]){ kit.setLang(lang);
    for (const ch of [...document.querySelectorAll("#rail2 [data-ch]:not([disabled])")].map(b => b.dataset.ch)){ kit.go(ch); await W(500);
      const tag = `${lang}/${ch}`;
      if (document.querySelector("[data-station]")){
        for (const id of [...new Set([...document.querySelectorAll("[data-station]")].map(b => b.dataset.station))]){ kit.pickStation(id); await W(150); scan(`${tag}/${id}`, ch);
          for (const b of [...document.querySelectorAll("#demo button:not([data-open])")]){ if (!b.isConnected) continue; c(b); await W(80); scan(`${tag}/${id}/${short(b.textContent)}`, ch); } }
      } else if (document.querySelector("[data-story]")){
        for (const id of [...new Set([...document.querySelectorAll("[data-story]")].map(b => b.dataset.story))]){ kit.pickStory(id); await W(80);
          for (let i = 0; i < document.querySelectorAll(".transport .dots button").length; i++){ kit.goStep(i); await W(60); scan(`${tag}/${id}/${i + 1}`, ch); } }
      } else if (document.querySelector(".map")){ scan(tag, ch);
        for (const id of [...new Set([...document.querySelectorAll("[data-rk]")].map(b => b.dataset.rk))]){ kit.pickRoad(id); await W(60); scan(`${tag}/${id}`, ch); }
      } else { for (const v of [...document.querySelectorAll("[data-view]")].map(b => b.dataset.view)){ kit.setView(v); await W(150); scan(`${tag}/${v}`, ch); } }
    } }
  const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
  const textPx = Object.fromEntries(Object.entries(sizes).map(([k, a]) => [k, { min:+Math.min(...a).toFixed(1), median:+med(a).toFixed(1), max:+Math.max(...a).toFixed(1) }]));
  const meds = Object.values(textPx).map(x => x.median); if (meds.length > 1 && Math.max(...meds) > Math.min(...meds) * 1.5) add("chapters differ in text size", "all", `medians ${Math.min(...meds)}–${Math.max(...meds)}px`);
  const list = [...faults.values()], count = {}; list.forEach(f => count[f.kind] = (count[f.kind] || 0) + 1);
  return window.__layout = { width:innerWidth, faults:count, textPx, list:list.map(f => `${f.kind} @ ${f.where} :: ${f.what}`) };
};
