# Bea website: build notes

How the site is put together and why, plus what to know when changing it.

## What's on it

| Page | Built from |
| --- | --- |
| `/` home | `landing()` in `build.mjs`, snippets in `src/content/snippets/` |
| `/tour/` | `src/content/tour.mjs` (chapters) |
| `/tour/<slug>/` × 24 | one lesson per `beacode/src/*.bea` file: notes, Bea, Gleam, output |
| `/playground/` | `src/assets/playground.js` + `bea.min.mjs` |
| `/community/` | `community()` in `build.mjs` |
| `404.html` | served by GitHub Pages for unknown paths |

There is no install page yet, on purpose: Bea has no release binaries, so the
site points to the GitHub repo instead (see `bea_research.md`, "Releases").

## How it works

**Static, no framework.** `build.mjs` is ~700 lines of Node with no
dependencies. Pages are template strings; the output is plain HTML and CSS
with two small ES modules. Everything is pre-rendered, so the site reads
completely without JavaScript (JS adds tabs, copy buttons, the theme toggle and
the playground).

**Syntax highlighting.** `src/assets/highlight.js` is a small hand-written
tokenizer for Bea and Gleam (plus shell, toml and program output). It handles
nested `#{…}` interpolation, raw backtick strings, number literals, `@external`
attributes, constructors and types, function names at definitions and calls,
and the keyword sets of both languages. The build runs it on every code block,
so highlighted HTML ships in the page. The playground imports the same module to
highlight the editor and its output as you type. Bea's own control flow,
`return` and `?`, gets its own colour (gold), so it stands out against the
Gleam it becomes.

The keyword lists come from `bea/src/bea/lexer.gleam` (Bea) and Gleam's
reserved words. If Bea gains keywords, add them to `BEA_KEYWORDS`.

**Content is real compiler output.** Nothing on the site is hand-written
Gleam. `scripts/sync-examples.sh` runs the real `bea` CLI:

- every `beacode/src/*.bea` is copied, transpiled (`bea transpile`) and run
  (`bea run -m`, inside the built `beacode` project); output is cleaned of
  build chatter and colour codes
- every landing snippet is run and transpiled in its own folder (script mode
  compiles all `.bea` files in a folder together, so they can't share one)

If a snippet stops compiling, the sync fails, so the home page can't show
broken code.

**The playground runs Bea's compiler in the browser.** The compiler's core
modules are pure Gleam, so `scripts/build-playground.sh` copies them next to
`playground-engine/src/bea_web.gleam` (exposes `transpile` and `format`),
builds for JavaScript and bundles with esbuild. Result: `bea.min.mjs`, 210 KB
(53 KB gzipped). It is byte-identical to the CLI on all 24 examples, for both
transpiling and formatting. It reports Bea syntax errors in the CLI's format but
doesn't type check (that's Gleam's job), and the page says so.

Two workarounds live in that script, both explained in `bea_research.md`: a
patched regex in the formatter's safety check (JS `string.inspect` prints
labels) and esbuild's `--keep-names` (JS `inspect` reads class names).

Playground details: live transpile on every keystroke (90 ms debounce), Tab and
Shift+Tab indent, Enter keeps indentation, Esc then Tab leaves the editor,
Shift+Alt+F formats, edits go through `insertText` so undo works, "Copy link"
puts the code in the URL hash (base64url), `?example=<slug>` opens any tour
lesson ("Open in playground" on each lesson uses it), and the last draft is kept
in `localStorage` (wrapped in try/catch; the page works without it).

## Design

**Taken from Beatrix.** The palette is her artwork: the accretion disc gradient
(`#FC61B9 → #DB82DA → #B492F9`) for the wordmark, primary buttons and active
tabs; her plum outline (`#3C2B55`) as the 2px outline on buttons, panels and
code blocks; deep space (`#150E22`) for the hero and code. Links use a darker
magenta (`#A31F6E` light, `#FF8FD0` dark) because the disc pink fails contrast
on white.

**Type.** Unbounded (round, wide, a little cosmic) for the wordmark and
headings only; Hanken Grotesk for reading; Martian Mono narrowed to 87.5% width
for code. Diagnostics fall back to the system monospace because Martian Mono has
no box-drawing characters (the `┌─ │` gutter would misalign).

**The one memorable thing** is the event horizon: right under the hero, Bea
goes in on the left, passes Beatrix, and Gleam comes out on the right. The same
idea repeats in every feature row and tour lesson (Bea / Gleam tabs) and in the
playground. It makes the core claim, "it's just Gleam", visible instead of
asserted.

**Motion.** Beatrix arrives once on load and blinks every few seconds; nothing
else moves on its own. Tab switches fade. `prefers-reduced-motion` turns all of
it off.

**Gleam's minimalism, not Gleam's look.** Gleam's site is white with pink and
Lucy the star. Bea's is a night sky with a black hole: cousins, not twins.

**Quality floor.** Light and dark themes (system default, toggle remembers an
override), visible focus rings, a skip link, keyboard-operable tabs (arrow
keys, Home, End), scrollable code regions focusable for keyboard scrolling, no
horizontal page scroll at 390 px (checked on every page type), and the
playground stacks on narrow screens.

## Verified

- All 29 pages build; no console errors on home, tour, lessons, playground,
  community.
- No horizontal overflow at 390 px on home, tour index, lessons, playground,
  community.
- Playground: example loading, live transpile, error display, format,
  auto-indent, share link round trip, example picker.
- The browser compiler matches the CLI for all 24 examples (transpile and
  format).

## Rough edges worked around

| Rough edge | What the site does |
| --- | --- |
| `test_examples.sh` looks in `beacode/` not `beacode/src/` | sync script builds `beacode` as a project and runs modules with `-m` |
| one bad file breaks script-mode runs in that folder | each snippet compiles in its own temp folder |
| modules named `try`/`cond` crash `bea run` | snippet is named `question.bea` |
| `-> return x` isn't allowed | snippets use `{ return x }` |
| formatter broken on JS target | regex patched and `--keep-names` in the playground build |
| `e24_newsletter` has no `main` | lesson shows Bea and Gleam tabs only, and says why |
| no release binaries | no install page; links go to the repo |

## Things to decide later

- **Domain.** All links are relative, so a project page
  (`the-bea-project.github.io/website/`) and a custom domain both work. Only
  `404.html` needs absolute links; the Pages workflow passes the right base path
  in `SITE_BASE`. For other hosts, build with `SITE_BASE=/your/path/`.
- **Social card.** `og:image` is not set. A 1200×630 PNG of Beatrix with the
  wordmark would make shared links look better.
- **Install page.** Add it once there's a release.
- **Two example slips** (`e5`, `e18`, see research notes) show in the tour as
  written. Fix them in the compiler repo and re-sync rather than editing here.
