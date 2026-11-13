# Fact sheet — Mac mini (2024, Apple M4, non-Pro)

Learner: complete electronics beginner. Languages: English + 中文. Goal: understand how it
works, and get it set up and running. Device is **look-only** (mains-powered, sealed): the
course shows the inside with drawings, never opening steps.

Example model drawn: **Mac mini (2024), base Apple M4**. Where the M4 Pro differs, the page
says so in one line.

## Sources (official first)
- Apple Support — Mac mini (2024) Tech Specs: https://support.apple.com/en-us/121555 (confirmed numbers)
- Apple — Mac mini Technical Specifications: https://www.apple.com/mac-mini/specs/
- iFixit M4 Mac mini teardown, via MacRumors / 9to5Mac / Mactrast coverage (inside layout: "repair guide" level, never used for numbers)
- Power-button location: MacRumors, 9to5Mac, BGR, heise (confirmed by Apple + teardown videos)

## Outside — size, shape, ports

| Fact | Level | Source |
|---|---|---|
| Height 5.0 cm (2.0 in), width 12.7 cm (5.0 in), depth 12.7 cm (5.0 in) | confirmed | Apple 121555 |
| Weight 0.67 kg (1.5 lb) base M4 | confirmed | Apple 121555 |
| Aluminium body, square with rounded corners | confirmed | Apple |
| Front: 2 × USB-C (USB 3, up to 10 Gb/s) + 3.5 mm headphone jack | confirmed | Apple 121555 |
| Back: power socket, Gigabit Ethernet (to 10 Gb option), HDMI, 3 × Thunderbolt 4 (USB-C) | confirmed | Apple 121555 |
| M4 Pro differs: 3 × Thunderbolt 5 instead of Thunderbolt 4 | confirmed | Apple |
| Power button on the **bottom**, toward the rear | confirmed | Apple execs + MacRumors/9to5Mac |
| Round recessed base is the air **intake vent**; air exits the back | likely | teardown coverage + Apple design |
| In the box: Mac mini + power cord (1.8 m). No monitor, keyboard or mouse. | confirmed | Apple 121555 |

## The brain and inside

| Fact | Level | Source |
|---|---|---|
| Apple M4 chip = a "system on a chip" (CPU + GPU + Neural Engine + memory controller in one) | confirmed | Apple |
| CPU: 10 cores (4 performance + 6 efficiency) | confirmed | Apple 121555 |
| GPU: 10 cores | confirmed | Apple 121555 |
| Neural Engine: 16 cores | confirmed | Apple 121555 |
| Unified memory 16 GB base, to 24 or 32 GB; shared by CPU and GPU | confirmed | Apple 121555 |
| Memory bandwidth 120 GB/s (M4 Pro: 273 GB/s) | confirmed | Apple / Apple IL |
| Memory is soldered onto the M4 chip package (not upgradeable) | likely | teardown coverage |
| SSD storage 256 GB base, to 512 GB / 1 TB / 2 TB; keeps data with power off | confirmed | Apple 121555 |
| SSD is on a removable module (Apple-proprietary; not a user upgrade) | likely | iFixit coverage |
| Power supply is **built in** (box ships only a cord, no brick); board across the top | confirmed (internal) / likely (layout) | Apple 121555 + teardown |
| Internal fan + copper heatsink pull air from the base over the chip and out the back | likely | teardown coverage |
| Small built-in speaker (for alerts and setup) | likely | teardown / Apple |
| Wi-Fi + Bluetooth antenna inside | likely | Apple (has Wi-Fi/BT) |

## Power

| Fact | Level | Source |
|---|---|---|
| Wall input 100–240 V AC, 50–60 Hz | confirmed | Apple 121555 |
| Maximum continuous power 155 W | confirmed | Apple 121555 |
| Operating temperature 10–35 °C (50–95 °F) | confirmed | Apple 121555 |

## Connections (for chapter 4 roads)

| Link | Carries | Level |
|---|---|---|
| Wall cord → internal power supply → logic board → M4 | energy (AC → DC → low-voltage DC) | confirmed/likely |
| M4 ↔ unified memory | data, very fast and wide (120 GB/s) | confirmed |
| M4 ↔ SSD | data (programs and files in/out) | confirmed |
| M4 → HDMI / Thunderbolt → monitor | the picture | confirmed |
| M4 ↔ USB-C / Thunderbolt → keyboard, mouse, drives | data + power | confirmed |
| M4 ↔ Ethernet port → router (cable) | internet data | confirmed |
| M4 ↔ Wi-Fi / Bluetooth antenna → through the air | internet + wireless keyboard/mouse | confirmed (has it) |

## Wireless

| Fact | Level | Source |
|---|---|---|
| Wi-Fi 6E (802.11ax) | confirmed | Apple 121555 |
| Bluetooth 5.3 | confirmed | Apple 121555 |

## What the page marks as approximate / unknown
- Inside layout (positions of fan, power supply, SSD, speaker, antenna): approximate, from teardown photos — "repair guide" level, drawn as an approximate shape.
- Exact internal part shapes and heights: not published → 3D inside view is an "approximate shape".
- Which chip area is CPU vs GPU vs Neural Engine: not externally visible; shown as regions of one chip, labelled as a teaching aid, not a die map.
- Readings in demos (temperature, speeds, setup screens) are simulated to show how it works.
