/* ===================== flat maps: SVG drawings with labels and leader lines =====================
   A course draws its own map (its own mm → px scale) with these pieces:
   - hit(id, shape): a tappable shape that belongs to a part (gets the part's colour, highlight and filter)
   - label(id, px, py, tx, ty, side): a name with a leader line from the point (px, py) to a label at (tx, ty), side "l" or "r"
   On phones (NARROW()), move label columns closer to the drawing so the text stays readable. */
const rr = (x, y, w, h, r, cls, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="${cls}" ${extra}/>`;
const textW = (str, latin, cjk) => [...str].reduce((s, c) => s + (/[　-鿿＀-￯]/.test(c) ? cjk : latin), 0);
function label(id, px, py, tx, ty, side){
  const p = P(id), g = p.g, title = p.lab;
  const ex = side === "r" ? tx - 8 : tx + 8;
  const d = `M${px} ${py}L${ex - (side === "r" ? 18 : -18)} ${ty}L${ex} ${ty}`;
  const anchor = side === "r" ? "start" : "end";
  const w = textW(title, 9.2, 16) + 14;
  const bx0 = side === "r" ? tx - 4 : tx - w + 4;
  return `<g class="lab" data-part="${id}" data-g="${g}" style="${col(g)}" role="button" tabindex="0" aria-label="${esc(title)}">
    <rect class="bg" x="${bx0}" y="${ty - 14}" width="${w}" height="24" rx="5"/>
    <path class="ln" d="${d}"/><circle class="end" cx="${px}" cy="${py}" r="3.6"/><circle class="dot" cx="${ex}" cy="${ty}" r="3"/>
    <text class="t" x="${tx + (side === "r" ? 4 : -4)}" y="${ty + 5}" text-anchor="${anchor}">${esc(title)}</text>
  </g>`;
}
/* keep: stays faintly visible under a colour filter (the board or body that gives the other parts a place) */
function hit(id, shape){ const g = PARTS[id].g, keep = (COURSE.filterKeep || []).includes(id); return `<g class="hit" data-part="${id}" data-g="${g}"${keep ? " data-keep" : ""} style="${col(g)}">${shape}</g>`; }

/* a flat view: { svg:{ viewBox: () => "x y w h", draw: () => "<svg content>", cls? } } */
/* on a big screen the drawing grows only to 1.1× its own size, so its labels stay about the size of the 3D labels */
const flatHTML = v => { const vb = typeof v.svg.viewBox === "function" ? v.svg.viewBox() : v.svg.viewBox, [, , w, h] = vb.split(/[\s,]+/).map(Number);
  return `<svg class="fig${v.svg.cls ? " " + v.svg.cls : ""}" id="fig2" viewBox="${vb}" role="img" style="--capw:${(w * 1.1).toFixed(0)}px;--caph:${(h * 1.1).toFixed(0)}px">${v.svg.draw()}</svg>`; };
