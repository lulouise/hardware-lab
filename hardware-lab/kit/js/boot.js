/* ===================== events and start =====================
   window.kit is a small handle for tests: kit.still(true) switches to one-frame drawing; kit.state is the page state. */
document.addEventListener("click", ev => {
  const sd = $("#srcdlg");
  if (sd && ev.target === sd){ sd.close(); return; }
  if (ev.target.closest("[data-srcs]")){ if (sd) sd.showModal(); return; }
  if (ev.target.closest("[data-srcclose]")){ if (sd) sd.close(); return; }
  const dlg = $("#quizdlg");
  if (dlg && ev.target === dlg){ dlg.close(); return; }
  if (ev.target.closest("[data-quizopen]")){ if (dlg){ dlg.showModal(); const first = dlg.querySelector("[data-q]"); if (first) first.focus(); } return; }
  if (ev.target.closest("[data-quizclose]")){ if (dlg) dlg.close(); return; }
  const zb = ev.target.closest("[data-zoom]"); if (zb){ if (viewer) viewer.zoom(zb.dataset.zoom === "reset" ? "reset" : +zb.dataset.zoom); return; }
  const ct = ev.target.closest("[data-chtoggle]"); if (ct){ const bar = ct.closest(".ctabs"), open = !bar.classList.contains("open"); bar.classList.toggle("open", open); ct.setAttribute("aria-expanded", String(open)); return; }
  const pm = ev.target.closest("[data-pmtoggle]"); if (pm){ const m = pm.closest(".pmenu"), open = !m.classList.contains("open"); m.classList.toggle("open", open); pm.setAttribute("aria-expanded", String(open)); return; }
  const pk = ev.target.closest("[data-pick]");
  if (pk){ const k = pk.dataset.pick, d = k === "station" ? stationList(CH()) : k === "story" ? storyListDef() : roadsListDef(), i = Math.max(0, d.items.findIndex(x => x.id === d.cur)), nx = d.items[clamp(i + +pk.dataset.dir, 0, d.items.length - 1)];
    return k === "station" ? pickStation(nx.id) : k === "story" ? pickStory(nx.id) : pickRoad(nx.id); }
  const ss = ev.target.closest("[data-sstep],[data-sgo]"); if (ss && CH().stories) return goStep(ss.dataset.sgo != null ? +ss.dataset.sgo : (S.step || 0) + +ss.dataset.sstep);
  if (ev.target.closest("[data-back]")){ if (CH().stories){ S.node = null; return paintStory(); } if (CH().roads){ S.road = null; S.node = null; return paintRoads(); } return unselect(); }
  const tg = ev.target.closest("[data-lang],[data-ch],[data-preset],[data-view],[data-filter],[data-part],[data-q],[data-station],[data-rk],[data-story],.map [data-node]");
  if (!tg) return;
  if (tg.dataset.lang) return setLang(tg.dataset.lang);
  if (tg.dataset.ch) return go(tg.dataset.ch);
  if (tg.dataset.preset){ if (viewer) viewer.preset(tg.dataset.preset); return; }
  if (tg.dataset.view) return setView(tg.dataset.view);
  if (tg.dataset.filter) return setFilter(tg.dataset.filter);
  if (tg.dataset.q) return answer(tg.dataset.q, +tg.dataset.a);
  if (tg.dataset.station) return pickStation(tg.dataset.station);
  if (tg.dataset.rk) return pickRoad(tg.dataset.rk);
  if (tg.dataset.story) return pickStory(tg.dataset.story);
  if (tg.dataset.node){ if (CH().stories){ S.node = tg.dataset.node; return paintStory(); } return pickNode(tg.dataset.node); }
  if (tg.dataset.part) return select(tg.dataset.part, !!tg.closest(".v3, .fig"));    // a tap in the drawing never moves the view
});
document.addEventListener("keydown", ev => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches && ev.target.matches(".lab, .map .node")){ ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles:true })); }
});
document.addEventListener("input", ev => {
  if (ev.target.id === "spread"){ S.spread = +ev.target.value; $("#spreadOut").textContent = spreadWord(); if (viewer) viewer.marks(); }
});
const rebuild = () => { if (VIEW().model) renderChapter(); };                  // job colours live in CSS: rebuild the 3D model when the theme changes
const dq = matchMedia("(prefers-color-scheme: dark)"); if (dq.addEventListener) dq.addEventListener("change", rebuild);
new MutationObserver(rebuild).observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (viewer) viewer.relabel(); });

/* COURSE.langs:["zh"] = a course in one language: the page uses it and hides the switch. Leave it out for English and 中文. */
if (ONE_LANG()){ LANG = ONE_LANG(); document.documentElement.classList.add("one-lang"); }
else { const l = store.get("lang"); if (LANGS.some(([k]) => k === l)) LANG = l; }
S.chapter = COURSE.chapters[0].id;
try{ const saved = JSON.parse(store.get("course") || "{}"); if (saved.answers) S.answers = saved.answers; if (isBuilt(COURSE.chapters.find(c => c.id === saved.chapter))) S.chapter = saved.chapter; }catch(_){}
renderStatic(); renderRail(); renderChapter();
const onApp = () => { const y = window.scrollY; renderRail(); renderChapter(); if (!APP.matches) window.scrollTo(0, y); };
if (APP.addEventListener) APP.addEventListener("change", onApp); else if (APP.addListener) APP.addListener(onApp);
window.kit = { langs:PAGE_LANGS(), roads:() => { try { return roadList(); } catch (_) { return []; } }, state:S, select, setFilter, setView, go, setLang, unselect, pickStation, pickRoad, pickNode, pickStory, goStep, preset:k => viewer && viewer.preset(k),
  still(on = true){ KIT.still = on; renderChapter(); } };
