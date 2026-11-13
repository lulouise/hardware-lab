# Research and the fact sheet

Everything on the page comes from the fact sheet, and every fact on the sheet says how sure it is. A beginner can't tell an invented number from a real one, so the course must never contain one.

## Sources, best first
1. **The maker:** datasheets, product pages, manuals, schematics, mechanical drawings, **official photos** (a datasheet's board photo is often the best evidence of what sits where), and the maker's **education or developer docs** (a robot maker's teaching-robot docs may describe the sensors better than the product manual).
2. **A pin map printed on the board itself** counts as confirmed.
3. **A maker's own PDF hosted on a shop site** counts as official; say where it's hosted.
4. **Repair guides** (iFixit and similar) only for what's inside a closed device, marked "repair guide", never for numbers.
5. **Common parts with no official datasheet** (a hobby servo, a photoresistor): use several independent sources, keep what they agree on, mark the rest "varies", and write on the card "typical numbers; check your part's guide".

Large PDFs may need downloading and text extraction (for example with a small Python script and `pypdf`); search the text for the facts you need.

If official information is thin, ask the learner for an official link (maker page, manual). If there still isn't enough, ask whether a general version is OK before building anything. If they already chose a general version, skip asking for a link.

## The fact sheet
Write it as a Markdown file in the course folder before drawing. A table per topic (family, outside, pins, inside, power, connections, anything chapters 5–6 need), each row:

| Fact | Level | Source |
|---|---|---|

**Levels**
- **confirmed:** stated by the maker
- **likely:** shown by the maker or a repair guide, or consistent across several sources, but not stated
- **approximate:** measured from a photo, or one example model's number
- **unknown:** not found (the page says so in the card's note line)
- **varies:** differs between models (general version) or between makers (common parts)

Include a **connections** table (what talks to the brain, over which kind of link, which pins) before designing chapter 4; the parts tables alone don't tell you how things talk. Add to the sheet whenever a later chapter needs a new fact, with the date.

Worked example: `examples/pico-course/facts-sheet.md`.

## A general version
Use 2–3 makers' official documents and keep what they agree on. Anything true for only some models says "some models" on the page. Sizes come from **one named example model**, and the page says so.

## Rules
- Never invent a pin map, a part name or a number. Unknown stays unknown, on the page too.
- Positions measured from a photo are "approximate" (say roughly how approximate); heights you can't find make the 3D model an "approximate shape" (one quiet note under the 3D view).
- Sources are listed on the page (the "Sources" button).
- Safety: no hands-on steps for mains power or for opening batteries; bare lithium cells are dangerous (say so where batteries appear). Point to the maker instead.
