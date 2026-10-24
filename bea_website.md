# Bea website: build notes

How the site is put together and why, plus what to know when changing it.

## What's on it

| Page | Built from |
| --- | --- |
| `/` home | `src/bea_site/home.bea`, snippets in `content/snippets/` |
| `/tour/` | `src/bea_site/tour.bea`, chapters in `src/bea_site/lessons.bea` |
| `/tour/<slug>/` × 29 | one lesson per `beacode/src/*.bea` file, and per module of `content/features/`: notes, Bea, Gleam, output |
| `/toolchain/` | `src/bea_site/toolchain.bea` |
| `/playground/` | `src/bea_site/playground.bea` (view) and `src/bea_site/browser/playground.bea` (the app) |
| `/community/` | `src/bea_site/community.bea` |
| `404.html` | `not_found` in `src/bea_site.bea`, served by GitHub Pages for unknown paths |

## How it works

**The site is a Bea project.** `bea.toml` sets `target = "javascript"`, so
`bea run` compiles everything to JavaScript and runs `main` in
`src/bea_site.bea` on Node. It renders each page, a Lustre `Element`, with
`element.to_document_string`, copies `assets/`, and copies the browser
modules with every module they import (found by following the compiled
files' `import`s) into `dist/assets/js/`. Pages start them with a one-line
`<script type="module">` calling `main()`. A build takes about two seconds.

The only JavaScript written by hand: the inline script in `<head>` that
applies a saved theme before the first paint (it must run before any module
loads), and `src/bea_site/browser/ffi.mjs`, three browser calls the
[plinth](https://hexdocs.pm/plinth/) bindings don't have (`matchMedia`,
`history.replaceState`, and catching a compiler crash).

**Pages are Lustre views.** The layout (`layout.bea`) takes a `Page` record:
title, description, the relative path back to the root, the current nav
entry, the body, and which browser modules to start. Running text with
inline code is authored as HTML (`markup.bea`) inside the elements it belongs
to; everything structural is Lustre.

**Syntax highlighting.** `highlight.bea` is a small tokenizer for Bea and
Gleam (plus shell, TOML and program output). It handles nested `#{…}`
interpolation, raw backtick strings, number literals, attributes such as
`@derive`, constructors and types, function names at definitions and calls,
and the keyword sets of both languages. It returns tokens, which become
`<span class="tk-…">` elements, at build time for every code block and in the
browser for the playground's editor and output. Bea's own control flow,
`return`, `?` and the `else` of a guard, gets its own colour (gold). The
playground re-highlights on every keystroke, so the tokenizer avoids
`string.length` (it segments the whole text on JavaScript) and matches
operators with patterns: a 2 KB file takes about 6 ms.

The keyword lists come from Bea's lexer and Gleam's reserved words. If Bea
gains keywords, add them to `bea_keywords`.

**Content is real compiler output.** Nothing on the site is hand-written
Gleam or made-up output. `scripts/sync-examples.sh` runs the real `bea` CLI:

- every `beacode/src/*.bea` is copied, transpiled (`bea transpile`) and run
  (`bea run -m`, inside the built `beacode` project); output is cleaned of
  build chatter and colour codes
- `content/features/` is a Bea project with the lessons on newer features,
  the `bea_json` derivers they use, and Gleam tests: each module is
  transpiled and run the same way, and `bea test`'s output is saved for the
  testing lesson
- every landing snippet is run and transpiled in its own folder (script mode
  compiles all `.bea` files in a folder together, so they can't share one)

If anything stops compiling, the sync fails, so the site can't show broken
code. The home page's "Bea is written in Bea" excerpt is read from the
site's copy of the compiler (`compile_module` in `src/bea/compiler.bea`), so it
follows the compiler too.

**The playground runs Bea's compiler from its Bea source.**
`scripts/sync-compiler.sh` copies the compiler's core modules into `src/bea/`
and the site compiles them for JavaScript with everything else. The output
matches the CLI byte for byte on every example on the site, for transpiling
and formatting. It reports Bea syntax errors in the CLI's format but doesn't
type check (that's Gleam's job), and the page says so. One workaround lives
in the sync script: a patched regex in the formatter's safety check
(`bea_research.md`, item 2).

The playground is a Lustre application. The build renders its view once with
the first example and its real Gleam, so the page shows compiler output
before any JavaScript runs; in the browser the same view takes over. The
editor is a transparent `<textarea>` over the highlighted code. It is not a
controlled input: the browser owns its text while you type (a controlled
textarea loses keystrokes when the render lags behind fast typing), and the
app only replaces it through an effect (examples, formatting, Tab, Enter).
Lustre replays the editor's input event when it starts, so `main` puts the
starting code in the editor first.

Playground details: transpiles after a 90 ms pause in typing, Tab and
Shift+Tab indent, Enter keeps indentation (one level deeper after `{`, `(`,
`[` or `->`), Esc then Tab leaves the editor, Shift+Alt+F formats, "Copy link"
puts the code in the URL hash (base64url, never sent to a server),
`?example=<slug>` opens any tour lesson ("Open in playground" on each lesson
uses it), and the last draft is kept in `localStorage` (the page works
without it). The examples reach the page as JSON, written and read by
functions `@derive(encoder, decoder)` makes for the `Example` record.

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

- All 35 pages build, with no console errors on any page type, at 1280 px
  and 390 px, and no horizontal overflow at 390 px (the nav fits down to
  360 px).
- Playground: typing, live transpile, error display, Tab, Enter
  auto-indent, format, example picker, `?example=`, share link round trip,
  draft restore, copy button.
- Tabs (click, arrow keys), theme switch (and back to the system theme),
  copy buttons.
- The browser compiler matches the CLI on every example, snippet and
  feature lesson (transpile), and formats them all.

## Rough edges worked around

| Rough edge | What the site does |
| --- | --- |
| formatter broken on the JS target | `sync-compiler.sh` patches the regex in the site's copy |
| `panic as "…#{x}"` generates Gleam that drops the end of the message | the message is bound to a variable first |
| one bad file breaks script-mode runs in that folder | each snippet compiles in its own temp folder |
| modules named `try`/`cond` crash `bea run` | snippet is named `question.bea` |
| `e24_newsletter` and the testing lesson have no `main` | they show their Bea and Gleam (and `bea test`'s output) only |

## Things to decide later

- **Domain.** All links are relative, so a project page
  (`the-bea-project.github.io/website/`) and a custom domain both work. Only
  `404.html` needs absolute links; the Pages workflow passes the right base path
  in `SITE_BASE`. For other hosts, build with `SITE_BASE=/your/path/`.
- **The site's repository.** `links.site_repo` assumes
  `github.com/the-bea-project/website`; change it there if the site lives
  elsewhere.
- **Social card.** `og:image` is not set. A 1200×630 PNG of Beatrix with the
  wordmark would make shared links look better.
- **Bundling.** The browser loads the compiled modules as they are (about 135
  small files, 2 MB before compression). Fine on HTTP/2; a bundler step could
  cut it down if it ever matters.
- **Two example slips** (`e5`, `e18`, see research notes) show in the tour as
  written. Fix them in the compiler repo and re-sync rather than editing here.
