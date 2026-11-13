# Design and behaviour

Most of these are built into the kit already; they're listed so you can check them and keep to them in anything you add (a new demo, a new drawing).

## Colour means job, everywhere
think **violet** · sense **blue** · output **green** · power **orange** · connect **magenta** · body **grey**
- Green is anything that does something to the world; give it a fitting subtitle per device ("shows you something" for a board, "moves and does the work" for a robot).
- A part with two jobs takes its main job's colour; the card mentions the second job.
- Ground is body grey. Tiny resistors and capacitors are "small parts" in power orange.

## Layout
- **One screen on big windows** (≥1200×700): chapter rail, a list column where a chapter has one (stations, roads, stories, steps), the stage, and a right column shaped to the chapter. **Stacked on phones.**
- Navigation is separate from demo controls. Nothing floats over a drawing; text under a picture sits in its own slot.
- **Pictures keep one proportion** on every screen size, centred, with their margin built into the drawing. A picture that changed size and sat too high on different screens felt broken.
- About 10 labels per view; smaller parts show their label only when tapped. Words fit their boxes with even spacing.
- **Text is the same size on screen in every chapter**, whatever the figure's size: about 11–14 pixels at 1280 wide, never under 10 (8 on a phone), and no bigger than the 3D labels on a big screen (about 17 at most). The kit stops demos and flat maps growing past that; a custom figure needs the same limit. A learner found figure text "too big" on a large monitor. A learner kept saying "chapter 5's text is tiny next to chapter 6". Road maps do this themselves (boxes grow into the empty space); `layoutCheck()` reports the sizes per chapter.
- **Maps are a canvas, not a picture.** Text stays its normal size and the parts spread to fill the stage. When there are too many parts to fit, the map runs past the edge and the learner drags it, as on a drawing board, with zoom buttons in a bar above it. Picking from a list or moving to a story step brings what lit up into view. A learner found the shrunken map crowded and its labels covered.
- **One drawing language from chapter 3 on.** The device is the dark box, everything else is the road map's white card with a dot in its job's colour (dashed for outside devices), and a connection is a road with moving dots. A new demo reuses `deviceBox()` and `partBox()`. Chapter 6 once used its own big tinted boxes and looked like another course.
- **SVG text doesn't wrap.** Anything over 3–4 words goes in a caption under the figure, never inside the drawing. This caused the most fixes in testing: the usual places are demo captions, notes over a picture, demo labels and map labels. Short labels in a shape use `data-fit`.

## Behaviour (rules from the learner's corrections)
1. **"Which picture" and "what to show" look different.** Pictures are **underlined tabs**; colour filters are **soft tinted chips** under a small "Colour = job" label. Every 3D tab is called **"3D view"**.
2. **A colour filter hides the other colours** (their parts, labels and list items), with one small "Show all colours" button. Choosing a colour closes a card of another colour; picking a part of another colour leaves the filter.
3. **A tap never closes a card.** Tapping a part again, or another member of its group, keeps the card open; only the back link closes it (on maps too).
4. **Choosing a part from a list makes it unmistakable:** it glows with an outline in its colour, everything else fades, closed layers open, and if it's covered or facing away the 3D view turns to a view where it can really be seen. A tap in the drawing itself never moves the view.
5. **Buttons show their state.** A toggle (plugged in, power cut, holding a button) is white while off and dark while on, and its words say the state and how to undo it ("Plugged in · unplug"). One-off actions stay white. A choice between options is a row of pills.
6. **Steps that depend on each other show their order:** numbered, joined by arrows, the next step outlined, steps that can't work yet greyed out.

## Quiz and progress
"Check yourself" sits behind a button and opens a dialog; the rail shows a tick when a chapter's quiz is all right. Chapters not built yet are greyed out with "after review".
