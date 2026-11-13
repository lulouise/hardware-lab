/* ===================== quiz: "Check yourself", in a dialog behind a button =====================
   QUIZ: { chapterId: [{ ok, en:{ q, a:[…], why }, zh:{ … } }] }. ok = the index of the right answer. */
const quizRight = ch => (QUIZ[ch] || []).filter((q, i) => S.answers[ch + i] === q.ok).length;
const quizTried = ch => (QUIZ[ch] || []).some((q, j) => S.answers[ch + j] != null);
const quizLabel = ch => { const n = (QUIZ[ch] || []).length; return quizTried(ch) ? t("quizDone", { a:quizRight(ch), b:n }) : t("quizCount", { n }); };
const quizBtn = ch => QUIZ[ch] ? `<button class="btn ghost qbtn" data-quizopen><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5.2 8.2 7.2 10.2 10.9 6"/></svg><span>${esc(quizLabel(ch))}</span></button>` : "";
function quizHTML(ch){
  const qs = QUIZ[ch] || [], done = quizRight(ch);
  return `<section class="quiz" id="quiz"><div class="qhead"><h3>${esc(t("quizTitle"))}</h3><span class="qscore">${esc(t("quizScore", { a:done, b:qs.length }))}</span></div>
    ${qs.map((q, i) => { const a = S.answers[ch + i], L2 = q[LANG] || q.en;
      return `<div class="q"><p>${i + 1}. ${esc(L2.q)}</p><div class="opts">${L2.a.map((tx, j) => `<button data-q="${ch + i}" data-a="${j}" ${a === j ? `data-r="${j === q.ok ? "yes" : "no"}"` : ""}>${esc(tx)}</button>`).join("")}</div>
        <p class="fb">${a == null ? "" : a === q.ok ? esc(t("right") + L2.why) : esc(t("wrong"))}</p></div>`; }).join("")}
  </section>`;
}
function answer(q, a){
  S.answers[q] = a; save();
  const el = $("#quiz"); if (el) el.outerHTML = quizHTML(S.chapter);
  renderRail();
  document.querySelectorAll("[data-quizopen] span").forEach(x => { x.textContent = quizLabel(S.chapter); });
  const back = document.querySelector(`[data-q="${q}"][data-a="${a}"]`); if (back) back.focus();
}
