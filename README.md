# ASCII Aurora

![HTML5](https://img.shields.io/badge/HTML5-static%20page-orange) ![CSS](https://img.shields.io/badge/CSS-no%20framework-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-canvas%20%2B%20WebAudio-yellow) ![OpenSpec](https://img.shields.io/badge/OpenSpec-specs-orange) ![License](https://img.shields.io/badge/License-Apache%202.0-green)

> "An aurora borealis drawn entirely in ASCII characters: ribbons of teal, green and cyan light over a star field and a dark treeline, reflected in a lake, with a live HUD and a soundtrack the page synthesises itself."

---

## What it is

ASCII Aurora renders a northern lights scene as animated text. Every frame is a grid of monospace characters: brightness becomes glyph density, so the aurora curtains, their vertical rays, the stars, the treeline silhouette at the horizon and the shimmering reflection in the lake below are all letters, drawn live on a canvas. A small HUD reports the frame rate, how many letters the last frame drew, the aurora activity level and the elapsed time, in the spirit of the ASCII render reels that inspired the page.

The page also makes its own music. An original ambient soundtrack, slow dreamcore pads and sparse tones, is synthesised in the browser with WebAudio. There are no audio files and no samples; the sound starts only when the visitor presses the Sound toggle.

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/arananet/ascii-aurora.git
cd ascii-aurora
npm install

# 2. Build the static site into dist/
npm run build

# 3. Serve dist/ with any static file server, for example:
npx serve dist
```

Check the built page deterministically:

```bash
node tools/verify.mjs
```

---

## Project layout

| Path | What it holds |
|---|---|
| index.html, assets/ | The page, its styles, the aurora renderer and the music engine |
| tools/verify.mjs | Deterministic checks over the built page |
| tools/shots.mjs | Scripted captures of the built page, the run evidence |
| .openspec/specs/ | The spec this project is built from |
| design/ | The design system: tokens.json is the source of truth |
| anvil.json, anvil.yaml | The ANVIL line configuration for this project |

---

## Contributing

This project uses **OpenSpec** for spec-driven development: every feature or bugfix starts with a spec file under `.openspec/specs/`. Each spec includes a `roles` block to assign responsibility (`implementer`, `reviewer`, `qa`, `product_owner`). See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the contributor checklist.

Development runs through the ANVIL factory line: work enters as a work order under `work-orders/`, the line implements it with an executed runtime, and a human gate decides on the evidence before anything merges.

---

## Documentation

| Topic | Where |
| --- | --- |
| The product spec | [`.openspec/specs/ascii-aurora/spec.md`](.openspec/specs/ascii-aurora/spec.md) |
| Design system | [`design/DESIGN.md`](design/DESIGN.md) and [`design/tokens.json`](design/tokens.json) |
| Project brain | [`brain/project.md`](brain/project.md) |
| Security policy | [`SECURITY.md`](SECURITY.md) |

---

## License

[Apache 2.0](LICENSE)

Copyright Eduardo Arana

---

## Developer

Eduardo Arana

## Support this with a ko-fi

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H51MPWG)
