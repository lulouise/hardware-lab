/* Paste into a built course page (in a test browser) to find which kit.css rules it uses.
   Run at a big-window size and again at phone size (add a viewport meta tag), then copy the printed numbers into used.txt
   for kit/tools/prune_css.py. It visits every built chapter, view, station, step, road and story, in every language. */
(async () => {
  const W = ms => new Promise(r => setTimeout(r, ms));
  const rules = []; (function walk(list){ for (const r of list){ if (r.selectorText) rules.push(r); else if (r.cssRules) walk(r.cssRules); } })([...document.styleSheets].find(s => s.ownerNode.tagName === "STYLE").cssRules);
  const used = window.__used || (window.__used = new Set());
  const strip = s => s.replace(/::?[a-z-]+(\([^()]*(\([^()]*\))?[^()]*\))?/gi, m => /^:(not|has|is|where|nth-child|first-child|last-child|first-of-type)\b/i.test(m) ? m : "");
  const mark = () => rules.forEach((r, i) => { if (used.has(i)) return; for (const part of r.selectorText.split(/,(?![^(]*\))/)){ const q = strip(part).trim() || "*"; try{ if (document.querySelector(q)){ used.add(i); return; } }catch(_){ used.add(i); return; } } });
  const c = s => { const e = typeof s === "string" ? document.querySelector(s) : s; if (e) e.dispatchEvent(new MouseEvent("click", { bubbles:true })); };
  kit.still(true);
  for (const lang of ["en", "zh"]){ kit.setLang(lang);
    for (const ch of [...document.querySelectorAll("#rail2 [data-ch]:not([disabled])")].map(b => b.dataset.ch)){ kit.go(ch); await W(60); mark();
      if (document.querySelector("[data-station]")){
        for (const id of [...new Set([...document.querySelectorAll("[data-station]")].map(b => b.dataset.station))]){ kit.pickStation(id); await W(60); mark();
          for (const b of [...document.querySelectorAll("#demo button")]){ c(b); await W(30); mark(); c(b); await W(30); mark(); } }
      } else if (document.querySelector("[data-story]")){
        for (const id of [...new Set([...document.querySelectorAll("[data-story]")].map(b => b.dataset.story))]){ kit.pickStory(id); await W(40);
          for (let i = 0; i < document.querySelectorAll(".transport .dots button").length; i++){ kit.goStep(i); await W(20); mark(); } }
        c(".map [data-node]"); mark(); c("[data-back]");
      } else if (document.querySelector(".map")){
        for (const id of [...new Set([...document.querySelectorAll("[data-rk]")].map(b => b.dataset.rk))]){ kit.pickRoad(id); await W(30); mark(); }
        kit.pickNode(document.querySelector(".map [data-node]").dataset.node); mark(); c("[data-back]"); mark();
      } else {
        for (const v of [...document.querySelectorAll("[data-view]")].map(b => b.dataset.view).concat([null])){ if (v) kit.setView(v); await W(50); mark();
          const f = document.querySelector(".legend [data-filter]"); if (f){ kit.setFilter(f.dataset.filter); mark(); }
          c(".pl-item"); await W(40); mark(); kit.unselect(); c(".pl-item"); mark(); kit.unselect(); if (kit.state.filter) kit.setFilter(kit.state.filter); }
      }
      c("[data-pmtoggle]"); mark(); c("[data-pmtoggle]");
      c("[data-quizopen]"); document.querySelectorAll("[data-q]").forEach(b => c(b)); mark(); const qd = document.querySelector("#quizdlg"); if (qd) qd.close();
    } }
  document.querySelector("#srcdlg").showModal(); mark(); document.querySelector("#srcdlg").close();
  c("[data-chtoggle]"); mark(); c("[data-chtoggle]");
  window.__usedList = [...used].sort((a, b) => a - b).join(",");
  console.log(`${rules.length} rules, ${used.size} used`);
})();
