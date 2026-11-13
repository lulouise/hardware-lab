# Course kit

Shared pieces for the hardware courses. A course only supplies its own facts, parts, 3D model and views; the kit does everything else.

```
course = facts → parts → 3D model → views      (the kit adds the frame, viewer, labels, maps, legend, cards, quiz, EN/中文)
```

## Build a page

```bash
python3 kit/build.py examples/pico-course
```

The script joins `kit/page.html`, `kit/css/kit.css`, the kit's JavaScript and the course's files into one HTML page (no doctype/head/body, for a publishing tool that wraps the page itself; add `--standalone` to also get a complete file that opens straight from disk; Three.js r128 comes from cdnjs). The output path is in the course's `course.json`.

## A course folder

| File | What goes in it |
|---|---|
| `course.json` | `{"name": "Pico Lab", "out": "../pico-course-kit.html"}` |
| `logo.svg` | the small drawing in the top bar and rail (`class="logo"`) |
| `facts.js` | `COURSE` (id, rest, words, sources) and `QUIZ` |
| `parts.js` | `PARTS`: one card per part |
| `model.js` | the numbers model (every size and position, in mm) and `COURSE.models` (the 3D builders) |
| `views.js` | flat maps and `COURSE.chapters`: pictures (ch 1–2), stations (ch 3), road map (ch 4), stories (ch 5), project steps (ch 6) |
| `course.css` | optional extra styles |

Every piece of text is an `{ en, zh }` pair. Examples: `examples/pico-course/` (a bare board) and `examples/mac-mini-course/` (a closed device).

### facts.js

```js
const COURSE = {
  id:"pico", name:COURSE_NAME,        // id = the saved-progress key; COURSE_NAME comes from course.json
  rest:"flat",                        // how it rests: "stands" | "flat" | "floor" (see below)
  langs:["zh"],                       // optional: a course in one language (the page uses it and hides the switch); leave out for EN + 中文
  filterKeep:["board"],               // parts that stay faint under a colour filter (optional)
  groups:{ output:{ en:["Act","moves and does the work"], zh:["行动","移动、干活"] } },  // optional job subtitle
  ui:{ footer:{…}, approx:{…}, spread:{…} }                                            // course words; any kit word can be overridden
};
const QUIZ = { outside:[{ ok:0, en:{ q, a:[…], why }, zh:{…} }], inside:[…] };
```

### parts.js

```js
const PARTS = { usb:{ g:"power", ch:[1, 2], en:{ lab, sub, word, name, what, does, how, facts:[…], note?, safety? }, zh:{…} } };
```
`g` = job colour (think, sense, output, power, connect, body). `ch` = chapters whose part list shows it. `lab`/`sub` = the label in the drawing; `word`/`name` = card title and real name; `note` = the card's quiet line for unknown or approximate facts.

### model.js: how it rests, and the builders

| `rest` | The device | Its frame (mm) | View names |
|---|---|---|---|
| `stands` | stands up like a phone | x right, y up, z out of its front | Front, Back, Top, Bottom, Left side, Right side |
| `flat` | lies flat like a board, shown like a picture | x right, y toward its top edge, z up (parts side) | Front, Back, Top edge, Bottom edge, Left edge |
| `floor` | sits on the floor like a robot | x right, y forward, z up | From above, Underneath, Front, Side, Back |

```js
COURSE.models = {
  outside(root, m){                        // add meshes to root, in the device's frame
    root.add(mesh(boxGeo(10, 10, 2), mat("#222"), "brain", 0, 0, 1));
    return {
      pose:{ yaw:-0.5, pitch:0.5 },        // starting turn
      fit:{ h:46, w:26, minK:0 },          // mm that must fit the height and width (chip or robot); leave out to fit the bounding box
      anchors:[{ id:"brain", p:[0, 0, 2], n:[0, 0, 1], min:0.2 }],   // label points, see viewer.js
      tick(time, dt){}                     // optional animation
    };
  },
  layers(root, m){                         // a model with layers gets a "Spread the layers" slider
    const lid = m.layer("lid", 120), board = m.layer("board", 60, { inner:true });   // inner: picking its part opens the layers
    …
  }
};
```
Shape helpers (`kit/js/shapes3d.js`): `mesh`, `mat`, `boxGeo`, `slab`, `arcGeo`, `discGeo`, `cylX`, `cylZ`, `textTexture`, `jobColour`, `deg`, `polar`. Every mesh names its part, so tapping it opens that part's card.

### views.js: chapters and pictures

```js
COURSE.chapters = [
  { id:"outside", title:{…}, rail:{…}, thumb:`<svg content>`, intro:{…},
    views:[{ id:"3d", model:"outside", presets:["angle", "front", "back"], idea:{…}, tips:[{…}, {…}] }],
    nav:[{ to:"inside", label:{…} }] },
  { id:"inside", …, safety:{ lead:{…}, text:{…} },       // closed devices: the "look only" line in the start card
    views:[
      { id:"3d", tab:{…}, model:"layers", presets:[…], idea, tips },
      { id:"flat", tab:{…}, svg:{ viewBox:() => NARROW() ? "…" : "…", draw:mapParts }, idea, tips, parts?:[…] } ] },
  { id:"parts", title:{…}, rail:{…} },                    // no views = greyed out, "after review"
  …                                                       // six chapters in all
];
```
- Two or more views in a chapter become underlined tabs. Colour chips appear for the jobs that have parts in the picture (or set `legend`).
- `parts` lists the parts of a view, if not "every part whose `ch` includes this chapter".
- Flat maps use `hit(id, shape)` for tappable shapes and `label(id, px, py, tx, ty, "l"|"r")` for names with leader lines. On phones (`NARROW()`), move the label columns in.

### Chapter 3: stations (`kit/js/stations.js`, `kit/js/demos.js`)

```js
{ id:"parts", title:{…}, rail:{…}, intro:{…}, nav:[…],
  stations:[{ id:"beat", g:"think", parts:["crystal"], demo:"beat", setup:{ crystal:12, brain:133 },
    idea:{…},                                             // the line under the demo
    en:{ t:"The beat", lead:"…", watch:["…", "…"] }, zh:{…} }] }
```
- One station per part. `lead` says what happens and what job the device does in it; `watch` is "what to notice".
- `demo` picks a type from the demo library; `setup` passes its numbers (from the fact sheet). There are 24 types, each described with its `setup` at the top of `demos.js` (inside a device: `workers`, `chipmap`, `parallel`, `pattern`, `shared`, `memory`, `beat`, `boot`, `reading`, `thermo`, `blink`, `regulator`, `powerpath`, `pin`, `ports`, `radio`; chapter 6: `project`, `servo`, `lightpair`, `follow`, `wiring`, `next`, `hookup`, `firstrun`). A new device adds a type there when none fits. Every demo's `data-fit` labels are shrunk to their shape after it is drawn.
- On big windows the stations are a list on the left (grouped by job colour); on phones a menu above the stage. The demo's controls sit in a "Try it" tray above its drawing.

### Chapter 4: roads (`kit/js/roads.js`)

```js
{ id:"roads", …, roads:{
    families:[{ id:"energy", line:"power", en:["Energy", "keeps every part alive"], zh }],
    kinds:{ power:{ fam:"energy", line:"power", en:[name, what it is], zh, why:{…} } },
    nodes:{ brain:[460, 300], … }, extra:{ battery:{ g:"power", en:[…], zh, dashed:true } },
    zones:[["sense", x, y, w, h, name, sub]], roads:[["usb", "diode", "power", {…}, both?, bend?]],
    idea:{ title, text, tips, note, line } } }
```
- `line` picks a line pattern: `power` (thick orange), `gpio` (thin), `i2c` (dashed), `i2s` (dotted), `spi` (thick), `analog` (dash-dot), `usb` (short dashes), `radio` (magenta dots), `net`.
- The left list is the big idea plus the road types by family; picking one lights only its roads, with dots showing the direction. Tapping a part shows all its roads; only "← Back to the big idea" closes that card.
- `bend:"v"` or `"h"` re-routes a road that would cross a part.

### Outside devices (`ext:true` parts)

A bare board only makes sense with the things around it. Add each device the course uses but the board doesn't have (a computer, a battery, a sensor, a servo, a breadboard) to `PARTS` with `ext:true` and `ch:[]`. It gets its own card ("Not on the board: you add this."), a dashed outline on maps, and it can be a node on the road map or in a story.

### Chapter 5: stories (`kit/js/stories.js`)

```js
{ id:"signal", …, stories:{ map:"roads", viewBox:"-190 0 1110 590",          // walk on chapter 4's map, widened for extra nodes
    nodes:{ computer:[-95, 500] }, roads:[["computer", "usb", "usb", {…}, true]],   // only the stories need these
    list:[{ id:"load", en:{ t, goal }, zh,
      steps:[{ roads:[["usb", "brain", "usb"]], at:["bootsel"], form:"file", now:{…}, en:{ t, text }, zh }] }] } }
```
Each step lights its roads (dots show the direction), rings the parts in `at`, and shows what is travelling (`form`: energy, file, bits, voltage, beat, number, think) under the map. Tapping a part opens its card.

### Chapter 6: a project in steps (`steps:[…]`)

The station frame with an ordered list (Step 1 of 7) instead of colour groups. A step may add `need:[…]` (what to buy, approximate) and `note` (what the page simulates). Project demos: `project`, `servo`, `lightpair` (with `rule:true` for the decision), `follow`, `wiring`, `next`.

## Rules the kit enforces (the skill's `references/design.md`)

1. **Tabs vs chips:** "which picture" is underlined tabs; "what to show" is tinted colour chips under "Colour = job". With 3 or more tabs on a phone, the tabs share the width and their words wrap.
2. **A filter hides:** other colours' parts drop to a faint ghost you can't tap, and their labels and list items disappear; one "Show all colours" button. Choosing a colour closes a card of another colour; picking a part of another colour leaves the filter.
3. **A tap never closes a card:** only "← All parts" does.
4. **Choosing a part makes it visible:** picking from the list turns the 3D view until the part faces you and opens closed layers if it's inside. A tap in the drawing (a part or its label) never moves the view.

Also built in: one big-idea line under each picture, the "Approximate shape" note on 3D views, a label budget (`only:true` anchors appear when tapped), part cards that explain their own words, the quiz in a dialog, the one-screen layout on big windows and the stacked layout on phones, EN/中文.

## Added after the Mac mini test
- `COURSE.device:{ en, zh }`: the device's short name, used by every demo. Demos have no default numbers, pins or names.
- Big picture: a view with `model:"scene"`, `presets:[]`, `card`. The model returns `scene:true` and uses `sceneDevice()`, `companion()`, `cable()` (`kit/js/shapes3d.js`). `orbit` limits dragging.
- Chapter order: the first view opens, so chapter 1 lists the 3D view first.
- Picking a part: glow, outline, the rest fade; `focus()` tests views with rays and turns to one where the part can be seen.
- Deep dive: `chapter.deep` and `station.deep` (`kit/js/stations.js`), with `chipmap` and its block `station`.
- Road maps are a canvas (`kit/js/roads.js`). `fitMap()` keeps text 13 px on screen (11 px on a phone) and spreads the parts to fill the stage; `nodes` set the map's shape, not its size. If parts would touch it drops their small line, then spreads them down, then across, then both, past the edge if it must. A zone around the hub has its name under it, so it can't sit on the hub's label. A list pick or story step zooms out no further than 80% (76% on a phone), so text stays readable; on a phone a road type whose parts sit at both ends of a wide row may still run past the edge (the learner drags). Drag moves the canvas, the bar above it zooms, ctrl + wheel or pinch zooms, and a list pick or story step moves the canvas to what lit up. A tap on the map never moves it. Zones wrap the parts inside them. The hub's label is drawn over the parts.
- One drawing language from chapter 3 on: `deviceBox()` for the device, `partBox()` for anything else (the road map's white card with a coloured dot, dashed when it is an outside device), and a road with moving dots for a connection. Chapter 6 demos use these. `next` draws roads out of the device; `cards` is `[job, title, sub]`.
- Sentences go in `captionHTML()`; short labels in a shape get `data-fit` and `fitTexts()`.

## Testing
`python3 kit/build.py --check <course>` writes `<out>.check.html`; open it and run `await layoutCheck()` (`kit/tools/layout-check.js`).

- `?still` (or `#still`) draws each pose at once with no animation loop, for screenshots in a hidden browser. The built-in browser loads local files as `data:` URLs and drops the query, so there call `kit.still(true)` from the test script instead.
- `window.kit` is a small test handle: `kit.langs` (the page's languages), `kit.go(id)`, `kit.setView(id)`, `kit.select(id)`, `kit.setFilter(g)`, `kit.unselect()`, `kit.pickStation(id)`, `kit.pickRoad(kind)`, `kit.pickNode(id)`, `kit.setLang("zh")`, `kit.preset("top")`, `kit.state`.
- In still mode the demos run on a timer instead of animation frames (a hidden browser pauses those, and slows timers to about once a second).
- localStorage throws in the built-in browser; the kit wraps it, so progress just isn't saved there.

## Keeping the CSS small

`kit/tools/css-coverage.js` (paste into a built page in the test browser, at big-window and phone size) records which `kit.css` rules any state uses; `kit/tools/prune_css.py` then splits the file into used and unused rules. Run it on every course page before trimming. As of Nov 4, 2026, 563 of 576 rules are used; the rest are kept on purpose (dragging, no-WebGL, dark mode, quiz-complete marks, the robot vacuum's safety line and greyed-out chapters).

## All six chapters

Chapters 1–6 are all kit pieces now, tested on a bare board (Pico) and a closed device (Mac mini).
