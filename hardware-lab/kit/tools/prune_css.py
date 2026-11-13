#!/usr/bin/env python3
"""Split kit.css into the rules the course pages use and the rules they don't.

    python3 kit/tools/prune_css.py kit/css/kit.css used.txt kept.css unused.css

used.txt holds rule numbers (comma-separated, one or more lines), collected in the browser by
kit/tools/css-coverage.js on every built page, at big-window and phone size, in every language.
Rules are numbered the way the browser numbers them: style rules in file order, counting rules inside
@media blocks, skipping @keyframes. A few rules only apply in states a script can't reach (dragging,
no WebGL, every quiz answer right, reduced motion); FORCE keeps them.
"""
import re, sys

FORCE = re.compile(r"v3-fallback|\.drag|\.point|\.done|prefers-reduced|:root|\.dsvg|\.mdot|data-state|\.paper|\.book|\.next|\.stepn|:root\[data-theme|\.cq|\.rdot|\[disabled\]|\.rsoon|\.safety")


def parse(s, counter):
    out, i = [], 0
    while i < len(s):
        if s[i].isspace():
            j = i
            while j < len(s) and s[j].isspace():
                j += 1
            out.append(("ws", s[i:j], None)); i = j; continue
        if s.startswith("/*", i):
            j = s.index("*/", i) + 2; out.append(("comment", s[i:j], None)); i = j; continue
        j = s.index("{", i); head = s[i:j]; d, k = 0, j
        while True:
            if s[k] == "{": d += 1
            elif s[k] == "}":
                d -= 1
                if d == 0: break
            k += 1
        body = s[j + 1:k]
        if head.strip().startswith(("@media", "@supports")):
            out.append(("media", head, parse(body, counter)))
        elif head.strip().startswith("@"):
            out.append(("at", s[i:k + 1], None))
        else:
            out.append(("rule", s[i:k + 1], counter[0])); counter[0] += 1
        i = k + 1
    return out


def emit(tree, used, want):
    out = []
    for kind, text, extra in tree:
        if kind in ("ws", "comment"):
            out.append(text)
        elif kind == "at":
            out.append(text if want else "")
        elif kind == "media":
            inner = emit(extra, used, want)
            if "{" in inner:
                out.append(text + "{" + inner + "}")
        else:
            keep = extra in used or bool(FORCE.search(text.split("{")[0]))
            out.append(text if keep == want else "")
    return "".join(out)


def tidy(s):
    s = re.sub(r"[ \t]+\n", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    s = re.sub(r"/\* ={3,}[^*]*={3,} \*/\n(?=(/\* =|\s*$))", "", s)       # section headings left with nothing under them
    return s.strip() + "\n"


if __name__ == "__main__":
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    src, used_file, kept, unused = sys.argv[1:]
    used = set()
    for line in open(used_file):
        used |= {int(x) for x in line.strip().split(",") if x.strip()}
    counter = [0]
    tree = parse(open(src).read(), counter)
    print(f"{counter[0]} rules, {len(used)} seen in use", file=sys.stderr)
    open(kept, "w").write(tidy(emit(tree, used, True)))
    open(unused, "w").write(tidy(emit(tree, used, False)))
