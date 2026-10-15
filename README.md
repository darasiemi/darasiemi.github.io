# darasiemi.github.io

Oluwadara Adedeji's personal academic website — live at [darasi.me](https://darasi.me), hosted through the `darasiemi.github.io` GitHub Pages repository.

**Designed by Oluwadara Adedeji.** Built on top of the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme by Maruan Al-Shedivat et al., which provides the base layout system, publication rendering (via Jekyll Scholar), responsive image pipeline, and overall academic-site plumbing. The visual direction, custom sections, and interactive elements are my own.

## Design highlights

Custom work layered on top of the base al-folio theme:

- **Hero** — Oversized name + portrait, a live-status strip, and a logo wall of institutions, over a backdrop of grid lines and soft green radial glows (desktop) that redistribute into vertical bands on mobile.
- **Interactive terminal bio** — A typed-out zsh session animates through a brief introduction, then reveals the full bio below. Zero-space collapse until it's ready so the carousel below doesn't float on empty whitespace.
- **Photo coverflow** — A Swiper-powered 3D cover-flow carousel of personal and professional moments, with click-and-drag on desktop and touch swipe on mobile.
- **Pinboard** — Three sticky-note identity cards (Researcher · Engineer · Community) pinned over a backdrop that mixes grid lines, soft green glows, and hand-shaped green ink splatters.
- **Achievement strip** — Animated counters for publications, modules taught, cloud certifications, and youth impacted.
- **Section-aware backgrounds** — Each major section has its own treatment: grid + glow in the hero and pinboard, warm cream paper tone in Selected Publications, hairline divider between News and Publications.
- **Footer signature** — Hand-signed "Darasimi" wordmark credit, with a hand-drawn heart standing in for the dot on the final "i".
- **Dark + light themes** everywhere — every custom treatment themes correctly.

## Local development

The repository is set up for Docker-based local development, which matches the production CI environment and sidesteps native Ruby/ImageMagick setup:

```bash
docker compose pull
docker compose up
```

Then open [http://localhost:8080](http://localhost:8080). Live reload is enabled.

For a native Jekyll setup (unsupported but documented), see [`INSTALL.md`](INSTALL.md).

## Repository guide

A detailed guide for coding agents and future contributors is in [`AGENTS.md`](AGENTS.md) (also referenced by `CLAUDE.md`). It covers architecture, editing conventions, validation, and CI/deployment notes.

## Credits

- **Design & customization** — [Oluwadara Adedeji](https://darasi.me)
- **Base theme** — [al-folio](https://github.com/alshedivat/al-folio) by [Maruan Al-Shedivat](https://maruan.alshedivat.com) and contributors
- **Fonts** — Bricolage Grotesque, Geist Mono, Instrument Sans
- **Icons** — Tabler Icons, Font Awesome
- **Carousel** — [Swiper](https://swiperjs.com)
- **Scroll animations** — [GSAP](https://greensock.com/gsap)

## License

Site content (text, images, publications) is © Oluwadara Adedeji. The theme code remains MIT-licensed, inheriting from al-folio — see [`LICENSE`](LICENSE).
