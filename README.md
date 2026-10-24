# Bea website

The website for [Bea](https://github.com/the-bea-project/bea), an ergonomic
language that transpiles to Gleam. The site is written in Bea: a Bea project
whose pages are [Lustre](https://hexdocs.pm/lustre/) views, rendered to static
HTML on Node, with its browser code (theme switch, code tabs, the playground)
compiled to JavaScript by the same build.

- **Home**: what Bea is and why it exists, every snippet shown as Bea and the
  Gleam it becomes, and how Bea (and this site) are written in Bea
- **Tour**: the 24 exercism examples from `bea/beacode`, then lessons on
  records, `else` guards, `@derive`, functions through types and testing,
  each with its Bea code, generated Gleam and program output
- **Toolchain**: installing `bea` (a standalone Linux binary), its commands,
  and how a build goes from `.bea` files through Gleam
- **Playground**: Bea's real compiler, compiled from its Bea source to
  JavaScript, transpiling as you type
- **Community**: Bea's topic on the Gleam Discord, issues, contributing,
  editor setup

## Build and preview

You need [bea](https://github.com/the-bea-project/bea/releases) (0.3.0 or
newer), Gleam and Node.

```sh
bea run                                  # writes dist/
python3 -m http.server -d dist 8000      # http://localhost:8000
```

`bea run` compiles the project for JavaScript (it is `target = "javascript"`
in `bea.toml`) and runs `src/bea_site.bea` on Node, which renders every page
into `dist/` and copies the browser modules next to them. Every link is
relative, so `dist/` works at a domain root or under a project path like
`/website/`; only `404.html` needs the absolute base, from `SITE_BASE` (default
`/`). `OUT_DIR` changes the output directory.

## Deploy to GitHub Pages

Push to `main`. `.github/workflows/pages.yml` installs the latest bea release
and Gleam, runs `bea run` and deploys `dist/`. Set **Settings → Pages →
Source** to **GitHub Actions** once.

## Updating content from the compiler repo

The build only reads committed files. When Bea or its examples change, refresh
them from a checkout of the compiler (default path `../bea`):

```sh
scripts/sync-compiler.sh ../bea   # the compiler core the playground runs
scripts/sync-examples.sh ../bea   # needs bea, gleam and Erlang/OTP 27+
bea run
```

- `sync-compiler.sh` copies the compiler's core modules (lexer, parser,
  deriving, lowering, codegen, formatter: Bea with no FFI) into `src/bea/`.
  The site compiles them with everything else, so the playground runs Bea's
  own compiler, built from its Bea source.
- `sync-examples.sh` copies `beacode/src/*.bea` into `content/examples/`, and
  saves each example's generated Gleam (`.gleam`) and output (`.out`) using
  the real `bea` CLI. It does the same for the feature lessons in
  `content/features/` (a Bea project of their own, with JSON derivers and
  tests; outputs in `content/features/generated/`), and type checks, runs and
  transpiles the home page snippets in `content/snippets/`.

A new lesson needs an entry in `src/bea_site/lessons.bea` (title, chapter,
notes).

## Layout

```text
bea.toml                        the site, a Bea project (JavaScript target)
src/bea_site.bea                the build: renders the pages into dist/
src/bea_site/                   pages (home, tour, toolchain, playground,
                                community), the layout, code blocks, the
                                highlighter, the tour's lessons
src/bea_site/browser/           what runs in the browser: enhance.bea (theme,
                                tabs, copy buttons), playground.bea (a Lustre
                                application), ffi.mjs (three browser calls
                                plinth doesn't have)
src/bea/                        Bea's compiler core, copied by sync-compiler.sh
src/bea_json/                   JSON derivers for @derive
assets/                         style.css, beatrix.svg
content/examples/               synced exercism examples (.bea, .gleam, .out)
content/features/               the feature lessons: a Bea project
content/snippets/               home page snippets (.bea, generated .gleam)
scripts/                        sync-compiler.sh, sync-examples.sh
```

See `bea_website.md` for design and build notes and `bea_research.md` for
suggestions for the compiler.
