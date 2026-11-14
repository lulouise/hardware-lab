# Building with the kit

## Contents
1. The course folder
2. Order of work
3. Notes per file
4. Demo types
5. Testing in a browser
6. Delivering the page

## 1. The course folder
Make a folder in the learner's project (for example `pico-course/`) with:

| File | What goes in it |
|---|---|
| `course.json` | `{"name": "Pico Lab", "out": "pico-course.html"}` (out is relative to the folder) |
| `facts-sheet.md` | the fact sheet (`research.md`) |
| `logo.svg` | a tiny drawing of the device, `<svg class="logo" viewBox="0 0 32 32">…</svg>` |
| `facts.js` | `COURSE` (id, rest, `device` name, words, sources) and `QUIZ` |
| `parts.js` | `PARTS`: one card per part, outside devices included |
| `model.js` | the numbers model (every size and position in mm) and `COURSE.models` (3D builders) |
| `views.js` | flat maps and `COURSE.chapters` (pictures, stations, road map, stories, project steps) |

Build: `python3 <skill>/kit/build.py <course-folder>`. The output is one HTML page with no doctype/head/body, which is what a page-publishing tool expects (it wraps the page itself). `--standalone` also writes `<out>.standalone.html`, a complete file with the text encoding and phone sizing set, for handing over as a file (§6).

**Read `kit/README.md` first**: it documents every field. Then copy the matching part of an example (`examples/pico-course/` for a board, `examples/mac-mini-course/` for a closed device) and change it. Chapters 1–2 first (review stop 2), then add chapters 3–4, then 5–6; until a chapter is built, give it only `id`, `title` and `rail` and it shows greyed out.

## 2. Order of work
1. Fact sheet → 2. `parts.js` (friendly name, real name, what / does / how, facts, note) → 3. the numbers model in `model.js` (positions from the fact sheet; measured ones marked approximate) → 4. the 3D builders → 5. `views.js` → 6. build → 7. the check → 8. review.

## 3. Notes per file
- **`facts.js`:** `rest` is how the device rests: `"stands"` (like a phone on its edge), `"flat"` (a board on a table), `"floor"` (a robot). It sets the 3D axes and the view names. `filterKeep` lists parts that stay faint under a colour filter (the board). `groups` renames a job's subtitle. `ui.footer` is the sources text; `ui.approx` the approximate-shape note.
- **`parts.js`:** each card must explain its own words (`writing.md`). `ch:[1, 2]` = the chapters whose part list shows it. `ext:true` for outside devices (with `ch:[]`).
- **`model.js`:** build every mesh with the part it belongs to (`mesh(geo, mat, partId, x, y, z)`), so tapping it opens that card. Anchors place labels; mark small parts `only:true` (shown when tapped) to keep about 10 labels. `fit:{ h, w }` sets how much must fit; leave it out to fit the bounding box. Layers (`m.layer(name, spread, { inner })`) give chapter 2 its spread slider. A layer is a group of parts that move together: use two to four, never one per part. For a closed device, one layer is the see-through shell (the chapter 1 body with `transparent:true, opacity` about 0.12, `depthWrite:false`), and each inside part is built from a few solids in its real shape, not one box (`chapters.md` §2).
- **`views.js`:** flat maps use `hit(id, shape)` and `label(id, px, py, tx, ty, side)`; pull labels in on phones (`NARROW()`). Stations need `parts` (lit up by `COURSE.where`, a function that draws the device for the station picture), `demo` + `setup`, `idea`, and `en`/`zh` with `t`, `lead`, `watch`, `general`. The labels default to "Same on other devices?" and "Where it is"; a board can override them with `ui.general` and `ui.where`. Roads, stories and steps: see `kit/README.md`.
- **Languages:** the kit supports English and Chinese (`{ en, zh }` everywhere). A course in one language sets `langs:["zh"]` (or `["en"]`) in `COURSE`: the page opens in it and the switch is hidden; its own text needs only that language. Other languages aren't supported yet: the kit's shared words are English and Chinese only.

## 4. Demo types (in `kit/js/demos.js`)
Demos have no default numbers or device names on purpose. The name comes from `COURSE.device`; numbers, pins and examples come from `setup`. The list with each `setup` is at the top of `demos.js`.

| Type | Shows | Used for |
|---|---|---|
| `workers` | jobs shared by the real number of cores, in kinds if there are kinds | a chip's cores |
| `chipmap` | one chip unfolded into blocks; opens each block's station | the deep dive |
| `parallel` | one worker or many on one picture | a graphics part |
| `pattern` | something in, many small sums, an answer out | an AI part |
| `shared` | one shared memory, or copying between two | shared memory |
| `memory` | storage keeps, working memory is wiped at power-off | storage + memory |
| `beat` | a crystal's beat and the brain's faster steps | the clock |
| `boot` | ordered steps: hold the button, plug in, drop a file | a boot/program button |
| `reading` | a knob's voltage becomes a number | measuring pins, any analog sensor |
| `thermo` | a chip thermometer (direction only) | internal temperature |
| `blink` | a pin switching a light, with its 1/0 trace | an LED |
| `regulator` | any input in a range → one steady output | a power converter |
| `powerpath` | cable or battery, and a one-way valve | power inputs |
| `pin` | one pin sending or listening, as a full loop | signal pins |
| `ports` | one socket and cable carrying several things | USB-C and similar |
| `radio` | waves through the air to each target | Wi-Fi, Bluetooth |
| `project`, `servo`, `lightpair`, `follow`, `wiring` | a project on a board | chapter 6, a board |
| `hookup`, `firstrun` | what you connect; the first switch-on | chapter 6, a finished device |
| `next` | roads out of the device to the next ideas (`cards:[[job, title, sub]]`) | chapter 6 last step |

Many demos won't fit a new device as they stand. **If a type can't show the truth about this device, add one** to `demos.js` following the same pattern: controls in `.demo-ctl` / `.slider`, one 640×300 SVG, words through `tz()`, a `tick` for animation. Keep the rules: real names on the drawing, the whole path, button states, numbered steps. Sentences go in `captionHTML()` under the figure, never in SVG; short labels in a shape get `data-fit` and a call to `fitTexts(root)`. Draw the device with `deviceBox()` and other things with `partBox()`, so the new demo looks like the rest.

**Big picture scene:** a model that returns `scene:true`, built upright. `sceneDevice()` places your device model, `companion()` adds a screen, keyboard, laptop, socket, battery, sensor, motor and so on, `cable()` joins them, `orbit` limits the turning. See `scene` in either example's `model.js`.

**Deep dive:** give the chapter `deep:{ m4:{ g:"think", en:[title, sub], zh:[…] } }` and each station `deep:"m4"`; they're listed together. In `chipmap`, a block's `station` is the station its Open button goes to.

**Framing:** the 3D view keeps the model centred on its own, also while layers spread. `fit:{ h, w }` sets how much must fit; `look` overrides the centring.

## 5. Testing in a browser
`python3 <skill>/kit/build.py --check <course-folder>` also writes `<out>.check.html` with the layout check inside. Open it, set the window size, and run `await layoutCheck()` (if a tool limits how long a script runs, start `layoutCheck()` without await and read `window.__layout` when it appears). Do this at 1280×800, at 375 wide, and once at 1920×1080 (for text that grows too big). It reports text off a drawing, text on text, text out of its shape, boxes overflowing, text too small, chapters that differ in text size, roads crossing parts, parts touching, map labels under parts, and lit parts out of sight on the canvas. A demo that crashes stops it with the error. Delete the `.check.html` before delivering.

One fault is expected on phones: a road map is wider than a phone (the learner drags it), so a road type whose parts sit at both ends of a wide row can be listed as "lit part out of sight" at 375 wide. Check it's only that, and say so at the review stop; at 1280 and 1920 the check must be clean.

Driving the page yourself:
- `window.kit` drives the page from a script: `kit.go(chapter)`, `kit.setView(id)`, `kit.select(part)`, `kit.pickStation(id)`, `kit.pickRoad(kind)`, `kit.pickStory(id)`, `kit.goStep(n)`, `kit.setLang("zh")`, `kit.still(true)`.
- Open the 3D view, pick each part from the list, and check it stands out and can be seen.

Known preview quirks, not bugs in the page:
- A hidden or zero-width preview pane: `innerWidth` reads 0, so nothing can be measured, and the 3D viewer logs `NaN` line coordinates. Set a window size first; `layoutCheck()` refuses to run without one.
- Animation frames pause in a hidden browser: call `kit.still(true)` (or open the page with `?still`). Screenshots may lag one step; take each one twice.
- Phone width: if the page has no viewport meta tag, inject `<meta name="viewport" content="width=device-width,initial-scale=1">`. Emulated sizes on `data:` URLs may stick at 980 wide without it.
- localStorage may throw in test browsers; the kit already guards it.
- Some tools stop a script after about 45 seconds.

## 6. Delivering the page
If you have a tool that publishes a web page as a private link, publish the built HTML and give the learner the link. Otherwise build with `--standalone` and give them the `.standalone.html` file: opened straight from disk, the plain build can show Chinese as broken characters and the wrong size on a phone. Tell them which chapters are built and what the next review stop will cover.

**One place to look, always current.** In testing, the learner saw an old version in the app's preview while the browser showed the new one, and couldn't tell which was right.
- Republish to the same link (or rebuild the same file) after every change you ask the learner to look at, not only at review stops. Give one place to look, not a link and a file.
- After republishing, open the page again if your tool has a way to, so any preview the learner has open shows the new version.
- Every build prints its time on the page, under "Sources" in the chapter rail. In your message, say the time of this build, and tell the learner: if the page shows an earlier time, close it and open the link or file again.
