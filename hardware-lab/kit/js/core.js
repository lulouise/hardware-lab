/* ===================== core: language, state, small helpers =====================
   Everything in the kit and the course shares one scope (the build joins the files inside one function).
   The course defines COURSE (see README); the kit only reads it at run time. */

/* ?still (or #still) draws each pose at once and stops the animation loop: for screenshots in a hidden browser */
const KIT = { still: /[?&#]still\b/.test(location.href) || window.KIT_STILL === true };
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const isStill = () => KIT.still || reduced.matches;

const store = {
  get(k){ try{ return localStorage.getItem(COURSE.id + "-" + k); }catch(_){ return null; } },
  set(k, v){ try{ localStorage.setItem(COURSE.id + "-" + k, v); }catch(_){} }
};

/* ---------- language ---------- */
let LANG = "en";
const LANGS = [["en", "EN"], ["zh", "中文"]];
const PAGE_LANGS = () => (Array.isArray(COURSE.langs) && COURSE.langs.length ? COURSE.langs : LANGS.map(([k]) => k)).filter(k => LANGS.some(([x]) => x === k));
const ONE_LANG = () => PAGE_LANGS().length === 1 ? PAGE_LANGS()[0] : null;
/* words every course shares; a course may override any of them in COURSE.ui */
const UI_KIT = {
  tagline:{ en:"see · understand · build", zh:"看 · 懂 · 做" },
  sources:{ en:"Sources", zh:"资料来源" },
  chapterOf:{ en:"Chapter {n} of 6", zh:"第 {n} 章 / 共 6 章" },
  viewLabel:{ en:"Jump to", zh:"换个角度" }, vAngle:{ en:"3/4 view", zh:"斜 45° 看" },
  dragHint:{ en:"Drag to turn it", zh:"拖一拖就能转" },
  spread:{ en:"Spread the layers", zh:"展开各层" }, spreadClosed:{ en:"closed", zh:"合着" }, spreadOpen:{ en:"spread out", zh:"已展开" },
  legendLab:{ en:"Colour = job", zh:"颜色代表用途" },
  legendHint:{ en:"Tap a colour to see only those parts.", zh:"点一个颜色，只看这一类部件。" },
  showAll:{ en:"Show all colours", zh:"显示全部颜色" },
  listHead:{ en:"Parts in this picture · tap one", zh:"图里的部件 · 点一下看看" },
  partCard:{ en:"Part card", zh:"部件卡片" }, pickPart:{ en:"Pick a part", zh:"选一个部件" }, tryThese:{ en:"Try these", zh:"试试这些" },
  allParts:{ en:"← All parts", zh:"← 全部部件" }, moreDetail:{ en:"More detail", zh:"更多细节" },
  dtWhat:{ en:"What it is", zh:"它是什么" }, dtDoes:{ en:"What it does", zh:"它干什么用" }, dtHow:{ en:"How it works", zh:"它是怎么工作的" },
  extPart:{ en:"Not on the board: you add this.", zh:"不在板上，需要你另外加。" },
  laterChapter:{ en:"You'll meet this part in chapter {n}.", zh:"第 {n} 章会讲到它。" },
  quizTitle:{ en:"Check yourself", zh:"自我检查" }, quizScore:{ en:"You got {a} of {b} right", zh:"答对 {a} 题，共 {b} 题" },
  quizCount:{ en:"Check yourself · {n} questions", zh:"自我检查 · {n} 道题" }, quizDone:{ en:"Check yourself · {a} of {b} right", zh:"自我检查 · 答对 {a} / {b}" },
  right:{ en:"Right. ", zh:"答对了。" }, wrong:{ en:"Not quite. Try another one.", zh:"再想想，换一个试试。" },
  noGL:{ en:"This browser can't show 3D (WebGL is off).", zh:"这个浏览器显示不了 3D（WebGL 没有打开）。" },
  zoom:{ en:"Zoom", zh:"缩放" }, zoomIn:{ en:"Zoom in", zh:"放大" }, zoomOut:{ en:"Zoom out", zh:"缩小" }, zoomReset:{ en:"Reset", zh:"复位" },
  explain:{ en:"Explanation", zh:"说明" }, close:{ en:"Close", zh:"关闭" },
  soon:{ en:"after review", zh:"审阅后" }
};
const t = (k, vars) => { const e = (COURSE.ui && COURSE.ui[k]) || UI_KIT[k]; let s = (e && (e[LANG] ?? e.en)) ?? k; if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace("{" + a + "}", b); return s; };
const tz = (en, zh) => LANG === "zh" ? zh : en;
const L = o => o == null ? "" : typeof o === "string" ? o : (o[LANG] ?? o.en);          // a {en, zh} pair → the current language

/* ---------- state ---------- */
const S = { chapter:null, view:{}, spread:70, selected:null, hover:null, filter:null, answers:{}, pose:{}, station:{}, road:null, node:null, story:{}, step:0 };

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const col = g => `--c:var(--${g});--ct:var(--${g}-t)`;
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const NARROW = () => innerWidth < 620;                                     // phones: maps pull their labels in
const APP = matchMedia("(min-width: 1200px) and (min-height: 700px)");    // one-screen app layout
