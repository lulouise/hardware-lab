# hardware-lab

**English** · [中文](README.zh.md)

An agent skill that turns one piece of hardware into a visual course for a complete beginner.

You name a device (a Raspberry Pi Pico, an ESP32 board, a robot vacuum, a Mac mini…). Your AI agent researches it, checks the plan with you, and builds one web page you can click through, in English, Chinese or both.

## What a course contains

| # | Chapter | What you see |
|---|---|---|
| 1 | Outside | A 3D model with every part labelled, and what the device is for |
| 2 | Inside | The parts spread apart, and where each one sits |
| 3 | What each part does | One hands-on demo per part |
| 4 | How they connect | A road map of the connections around the main chip |
| 5 | Follow a signal | Short stories walked step by step on that map |
| 6 | Toward your goal | A small first project that fits why you are learning |

Every chapter ends with a short quiz. Every word is explained where it is used, so no background in electronics is needed.

## What you need

- An AI agent that can use skills (a folder with a `SKILL.md` file), search the web and run commands on your computer, for example Claude Code.
- Python 3. It runs the small script that puts the page together.
- A web browser, and an internet connection when you open a course: the 3D view loads the Three.js library from a public CDN.

## Install

```bash
git clone https://github.com/lulouise/hardware-lab.git
```

Then copy the inner `hardware-lab` folder into your agent's skills folder. For Claude Code that is `~/.claude/skills`:

```bash
mkdir -p ~/.claude/skills && cp -R hardware-lab/hardware-lab ~/.claude/skills/
```

For another agent, use the skills folder its documentation names. Start a new session afterwards so the agent picks the skill up.

## Use

Tell your agent what you want to understand, in your own words:

> I just bought a Raspberry Pi Pico and I know nothing about electronics. Teach me what is on this board and how it works.

The course is built in stages. After the plan, and after every two chapters, you look at the page in your browser and say what is unclear, so anything wrong is caught early. Say "just build it all" to get the whole course in one go.

## Examples

Two finished courses are included as course files, in `hardware-lab/examples/`:

- `pico-course`: a bare board (Raspberry Pi Pico) with a build project.
- `mac-mini-course`: a closed device (Mac mini M4) with a deep look at its chip.

To build one into a page:

```bash
python3 hardware-lab/kit/build.py hardware-lab/examples/pico-course
```

## Limits in this version

- English and Chinese only. The page's built-in text exists in these two languages.
- On a phone, wide road maps do not fit the screen: you drag them.
- Not covered: courses built from an article or a question, very abstract topics (chip design, power grids), videos, and courses a teacher or parent makes for someone else.
- Facts come from the agent's research at the time, with sources and a confidence level listed in the course. Check anything important against the maker's own documents before you wire or buy something.

## What is in this repository

| Path | What it is |
|---|---|
| `hardware-lab/SKILL.md` | The instructions the agent follows |
| `hardware-lab/references/` | Detailed rules: research, chapters, design, writing, Chinese style |
| `hardware-lab/kit/` | Shared page code and the build script |
| `hardware-lab/examples/` | The two example courses |
| `hardware-lab/assets/` | The template for a learner's record |

## Feedback

Open an issue on GitHub if a course shows something wrong or confusing. Notes on which sentence or picture confused you are the most useful kind.

## Author

Made by Luyao Tang ([@lulouise](https://github.com/lulouise)).

## Licence

MIT. See [LICENSE](LICENSE). Device names belong to their makers; this project is not connected to any of them.
