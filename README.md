# Bea website

The website for [Bea](https://github.com/the-bea-project/bea), an ergonomic language that transpiles to Gleam. A static site with no framework and no npm dependencies.

- **Home**: what Bea is and why it exists, with every snippet shown as Bea and
  the Gleam it becomes
- **Tour**: the 24 exercism examples from `bea/beacode`, each with its Bea code,
  generated Gleam and program output
- **Playground**: Bea's real compiler, compiled to JavaScript, transpiling as
  you type in the browser
- **Community**: issues, contributing, editor setup

## Build and preview

```sh
node build.mjs          # writes dist/
node scripts/serve.mjs  # http://localhost:8000
```

Node 18+ is all you need. Every link is relative, so `dist/` works at a domain
root or under a project path like `/website/`.

## Deploy to GitHub Pages

Push to `main`. `.github/workflows/pages.yml` builds and deploys `dist/`.
Set **Settings → Pages → Source** to **GitHub Actions** once.

## Updating content from the compiler repo

The build only reads committed files, so it never needs Gleam or Erlang. When
Bea or its examples change, refresh them from a checkout of the compiler
(default path `../bea`):

```sh
scripts/sync-examples.sh ../bea      # needs bea, gleam and Erlang/OTP 27+
scripts/build-playground.sh ../bea   # needs gleam and npx
node build.mjs
```

- `sync-examples.sh` copies `beacode/src/*.bea` into `src/content/examples/`
  and saves each file's generated Gleam (`.gleam`) and output (`.out`) using the
  real `bea` CLI. It also type checks, runs and transpiles the landing-page
  snippets in `src/content/snippets/`.
- `build-playground.sh` compiles Bea's compiler core to JavaScript and writes
  `src/assets/bea.min.mjs`.

A new exercise needs one entry in `src/content/tour.mjs` (title, chapter,
notes) after syncing; the build fails with a clear message if one is missing.

## Layout

```text
build.mjs                 page templates and the build
src/assets/               style.css, site.js, playground.js, highlight.js,
                          bea.min.mjs (compiler bundle), beatrix.svg
src/content/tour.mjs      tour chapters and lesson notes
src/content/examples/     synced exercism examples (.bea, .gleam, .out)
src/content/snippets/     landing page snippets (.bea, generated .gleam)
playground-engine/        the Gleam entry point compiled for the playground
scripts/                  sync, playground build, local server
```

See `bea_website.md` for design and build notes and `bea_research.md` for
suggestions for the compiler.
