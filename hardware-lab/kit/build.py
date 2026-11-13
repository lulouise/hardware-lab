#!/usr/bin/env python3
"""Join the kit and one course into a single HTML page (no doctype/head/body: the Artifact publish step wraps it).

    python3 kit/build.py examples/pico-course
    python3 kit/build.py --check examples/pico-course     also writes <out>.check.html with the layout check built in (see tools/layout-check.js)

The course folder holds:
    course.json   {"name": "Pico Lab", "out": "../pico-course-kit.html"}   (out is relative to the course folder)
    logo.svg      the small device drawing in the top bar and the rail (class="logo")
    facts.js      COURSE (words, chapters' text, sources), QUIZ
    parts.js      PARTS: one card per part
    model.js      the numbers model and the 3D builders (COURSE.models)
    views.js      COURSE.chapters: which pictures each chapter shows (3D views, flat maps), big ideas, tips
    course.css    optional extra styles
"""
import datetime, json, pathlib, sys

KIT = pathlib.Path(__file__).resolve().parent
KIT_JS = ["core", "parts", "flat", "shapes3d", "viewer", "quiz", "frame", "demos", "stations", "roads", "stories"]   # shared pieces, then the course, then boot
COURSE_JS = ["facts", "parts", "model", "views"]


def preflight(course):
    """Name anything missing in plain words, before the build fails with a traceback."""
    need = [KIT / "page.html", KIT / "css" / "kit.css", KIT / "js" / "boot.js"] + [KIT / "js" / f"{n}.js" for n in KIT_JS]
    need += [course / "course.json", course / "logo.svg"] + [course / f"{n}.js" for n in COURSE_JS]
    missing = [str(p) for p in need if not p.exists()]
    if missing:
        sys.exit("Can't build: these files are missing:\n  " + "\n  ".join(missing))


def build(course_dir, check=False):
    course = pathlib.Path(course_dir).resolve()
    preflight(course)
    meta = json.loads((course / "course.json").read_text())
    read = lambda p: p.read_text().rstrip() + "\n"
    css = read(KIT / "css" / "kit.css")
    if (course / "course.css").exists():
        css += "\n/* ================= this course ================= */\n" + read(course / "course.css")
    parts = [f"/* ----- kit/js/{n}.js ----- */\n" + read(KIT / "js" / f"{n}.js") for n in KIT_JS]
    parts.append(f"const COURSE_NAME = {json.dumps(meta['name'], ensure_ascii=False)};\n")
    parts.append(f"const COURSE_BUILT = {json.dumps(datetime.datetime.now().strftime('%Y-%m-%dT%H:%M'))};\n")   # shown under Sources, so the learner can tell which version they see
    parts += [f"/* ----- course: {n}.js ----- */\n" + read(course / f"{n}.js") for n in COURSE_JS]
    parts.append("/* ----- kit/js/boot.js ----- */\n" + read(KIT / "js" / "boot.js"))
    page = read(KIT / "page.html")
    for key, val in (("CSS", css.rstrip()), ("JS", "\n".join(parts).rstrip()), ("LOGO", (course / "logo.svg").read_text().strip()), ("NAME", meta["name"])):
        page = page.replace("{{" + key + "}}", val)
    out = (course / meta["out"]).resolve()
    out.write_text(page)
    print(f"wrote {out} ({len(page.encode()) // 1024} kB)")
    if check:
        tool = (KIT / "tools" / "layout-check.js").read_text()
        test = out.with_name(out.stem + ".check.html")
        test.write_text(page + "\n<script>\n" + tool + "\n</script>\n")
        print(f"wrote {test}: open it in a browser and run: await layoutCheck()")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    args = [a for a in sys.argv[1:] if a != "--check"]
    for d in args:
        build(d, "--check" in sys.argv)
