// Builds the static site into dist/. Zero dependencies: `node build.mjs`.
//
// Inputs (all committed, so the build never needs Gleam or Erlang):
//   src/assets/            css, js, Beatrix, the playground's compiler bundle
//   src/content/tour.mjs   tour chapters and lesson notes
//   src/content/examples/  exercism examples: .bea, generated .gleam, .out
//   src/content/snippets/  landing page snippets: .bea and generated .gleam
// Refresh the generated files with scripts/sync-examples.sh and
// scripts/build-playground.sh.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { highlight, escapeHtml as esc } from "./src/assets/highlight.js";
import { chapters, lessons } from "./src/content/tour.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "src");
const OUT = path.resolve(ROOT, process.env.OUT_DIR || "dist");
const REPO = "https://github.com/the-bea-project/bea";
const SITE_NAME = "Bea";

const read = (p) => fs.readFileSync(path.join(SRC, p), "utf8");
const exists = (p) => fs.existsSync(path.join(SRC, p));
const trimCode = (s) => s.replace(/\s+$/, "");

// ---------------------------------------------------------------------------
// Code blocks

let blockId = 0;

/**
 * A code block with optional tabs.
 * tabs: [{ label, lang, code, file? }]
 * opts: { caption?, actions? (html), className? }
 */
function codeBlock(tabs, opts = {}) {
  const id = `cb${++blockId}`;
  const single = tabs.length === 1;
  const head = single
    ? `<div class="code-head"><span class="code-file">${esc(tabs[0].file || tabs[0].label)}</span>${copyButton()}</div>`
    : `<div class="code-head">
        <div class="tabs" role="tablist" aria-label="${esc(opts.caption || "Code")}">
          ${tabs
            .map(
              (t, i) =>
                `<button role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-lang="${t.lang}">${esc(t.label)}</button>`,
            )
            .join("")}
        </div>
        ${opts.actions || ""}${copyButton()}
      </div>`;
  const panels = tabs
    .map(
      (t, i) =>
        `<div class="code-panel" ${single ? "" : `role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"`} ${i === 0 ? "" : "hidden"} data-lang="${t.lang}">
          <pre tabindex="0"><code class="lang-${t.lang}">${highlight(trimCode(t.code), t.lang)}</code></pre>
        </div>`,
    )
    .join("");
  return `<div class="code ${opts.className || ""}">${head}${panels}</div>`;
}

const copyButton = () =>
  `<button class="copy" type="button" aria-label="Copy code"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.5"/><path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h.5"/></svg><span>Copy</span></button>`;

const inlineCode = (s, lang = "bea") => `<code class="lang-${lang}">${highlight(s, lang)}</code>`;

function beaGleam(name, file) {
  return codeBlock(
    [
      { label: "Bea", lang: "bea", code: read(`content/snippets/${name}.bea`) },
      { label: "Gleam it becomes", lang: "gleam", code: read(`content/snippets/${name}.gleam`) },
    ],
    { caption: file },
  );
}

// ---------------------------------------------------------------------------
// Layout

const ICON_GITHUB = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

const ICON_THEME = `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4.2"/><path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M4 16l1.4-1.4M14.6 5.4 16 4"/></svg>`;

function page({ title, description, depth, active, body, bodyClass = "", scripts = [] }) {
  const root = depth === 0 ? "./" : "../".repeat(depth);
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME}: An ergonomic language that transpiles to Gleam`;
  const nav = [
    ["tour/", "Tour", "tour"],
    ["playground/", "Playground", "playground"],
    ["community/", "Community", "community"],
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#150E22">
<link rel="icon" href="${root}assets/beatrix.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400..700;1,400&family=Martian+Mono:wdth,wght@75..112.5,400..600&family=Unbounded:wght@500..700&display=swap">
<link rel="stylesheet" href="${root}assets/style.css">
<script>try{var t=localStorage.getItem("bea-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="bar">
    <a class="brand" href="${root}" aria-label="Bea home"><img src="${root}assets/beatrix.svg" alt="" width="34" height="34"><span>bea</span></a>
    <nav aria-label="Main">
      <ul>
        ${nav
          .map(([href, label, key]) => `<li><a href="${root}${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a></li>`)
          .join("")}
        <li><a class="gh" href="${REPO}" aria-label="Bea on GitHub">${ICON_GITHUB}<span>GitHub</span></a></li>
      </ul>
    </nav>
    <button class="theme-toggle" type="button" aria-label="Switch colour theme" title="Switch colour theme">${ICON_THEME}</button>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <img src="${root}assets/beatrix.svg" alt="" width="56" height="56">
      <p><strong>Bea</strong> is an ergonomic syntax for <a href="https://gleam.run">Gleam</a>. Built on Gleam's compiler, type checker and package ecosystem.</p>
    </div>
    <nav aria-label="Footer">
      <ul>
        <li><a href="${root}tour/">Language tour</a></li>
        <li><a href="${root}playground/">Playground</a></li>
        <li><a href="${root}community/">Community</a></li>
        <li><a href="${REPO}">Source on GitHub</a></li>
        <li><a href="${REPO}/issues">Report an issue</a></li>
      </ul>
    </nav>
  </div>
  <p class="wrap fine">Beatrix is Bea's mascot. Gleam and Lucy belong to the <a href="https://gleam.run">Gleam</a> project; Bea is an independent project.</p>
</footer>
<script type="module" src="${root}assets/site.js"></script>
${scripts.map((s) => `<script type="module" src="${root}${s}"></script>`).join("\n")}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Pages

function beatrixInline() {
  // The mascot inline in the hero, so her eyes can blink.
  return read("assets/beatrix.svg")
    .replace(/<svg ([^>]*?)width="\d+" height="\d+"/, '<svg $1class="beatrix" role="img" aria-label="Beatrix, a small smiling black hole"')
    .replace('<g fill="#FAF3EC">', '<g class="bx-eyes" fill="#FAF3EC">');
}

const glance = [
  ["let x = 1", "x = 1", "No <code>let</code>. Patterns that can fail get <code>let assert</code> for you."],
  ['#(1, "two")', '(1, "two")', "Tuples use parentheses."],
  ['"Hi " <> name', '"Hi #{name}"', "String interpolation."],
  ['dict.from_list([#("bea", 1)])', '%{"bea": 1}', "Map literals, and <code>%{m | k: v}</code> to update."],
  ["Point(..p, x: 1)", "Point(p | x: 1)", "Record update, Elixir style."],
  ["[x, ..rest]", "[x | rest]", "List patterns and prepends."],
  ["use n <- result.try(int.parse(raw))", "n = int.parse(raw)?", "<code>?</code> unwraps <code>Ok</code> or returns the <code>Error</code>."],
  ["use <- bool.guard(n < 0, Error(Nil))", "if n < 0 {\n  return Error(Nil)\n}", "Early return, anywhere a statement goes."],
];

function landing() {
  const hero = `
<section class="hero">
  <div class="stars" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 class="wordmark">bea</h1>
      <p class="lede">An ergonomic language that&nbsp;transpiles to Gleam.</p>
      <p class="hero-sub">Multi-clause functions with guards, early <code>return</code>, and <code>?</code> for errors. Bea compiles to plain, readable Gleam, so you keep Gleam's type checker, both compile targets and every package on Hex.</p>
      <div class="actions">
        <a class="btn btn-primary" href="tour/">Take the tour</a>
        <!-- <a class="btn" href="https://discord.gg/wpzXrRF8D">Join the Discord</a> -->
        <a class="btn btn-ghost" href="${REPO}">${ICON_GITHUB}<span>Bea on GitHub</span></a>
      </div>
      <p class="beta"><span class="beta-dot" aria-hidden="true"></span>Sparky beta. The compiler works today; the edges are still being sanded.</p>
    </div>
    <div class="hero-art">${beatrixInline()}</div>
  </div>
</section>`;

  const horizon = `
<section class="horizon-section" aria-labelledby="horizon-title">
  <div class="wrap">
    <div class="horizon">
      <div class="horizon-pane">
        ${codeBlock([{ label: "shapes.bea", lang: "bea", code: read("content/snippets/hero.bea"), file: "shapes.bea" }])}
      </div>
      <div class="horizon-core" aria-hidden="true">
        <img src="assets/beatrix.svg" alt="" width="64" height="64">
      </div>
      <div class="horizon-pane">
        ${codeBlock([{ label: "shapes.gleam", lang: "gleam", code: read("content/snippets/hero.gleam"), file: "shapes.gleam, generated" }])}
      </div>
    </div>
    <h2 id="horizon-title" class="horizon-caption">Bea goes in, Gleam comes out. The Gleam is what you would have written by hand: the clauses become a <code>case</code>, the <code>return</code> becomes a <code>bool.guard</code>, and the imports are added for you.</h2>
  </div>
</section>`;

  const why = `
<section class="why" aria-labelledby="why-title">
  <div class="wrap why-grid">
    <div class="prose">
      <h2 id="why-title">Why Bea exists</h2>
      <p>Gleam is a lovely language: a sound type system, friendly errors, and code that runs on the Erlang VM or in JavaScript. Writing it day to day, a few things wear on you.</p>
      <p>A function that handles three shapes of input becomes one function wrapping one big <code>case</code>. There is no early return, so a guard clause is <code>use &lt;- bool.guard(…)</code> or another level of nesting. Error handling chains through <code>use x &lt;- result.try(…)</code>, which quietly turns the rest of your function into a callback. All of it works, and none of it is how you think about the problem.</p>
      <p>Bea keeps Gleam's meaning and changes how it reads. It borrows Elixir's multi-clause functions and guards, adds <code>return</code> and <code>?</code>, and drops <code>let</code>. There are no macros, no new runtime and no new type system, just a syntax that lowers to idiomatic Gleam.</p>
    </div>
    <ul class="promises">
      <li>
        <h3>Gleam's type checker</h3>
        <p>Every line is checked by the Gleam compiler. Its errors are rewritten to point at your <code>.bea</code> file.</p>
      </li>
      <li>
        <h3>Gleam's ecosystem</h3>
        <p>Any Gleam package works with nothing to wrap, and <code>bea publish</code> ships ordinary Gleam packages to Hex.</p>
      </li>
      <li>
        <h3>A way out, any time</h3>
        <p><code>bea transpile --out</code> writes your project as a plain Gleam project. Trying Bea costs nothing to undo.</p>
      </li>
    </ul>
  </div>
</section>`;

  const features = [
    {
      name: "clauses",
      title: "Functions with clauses",
      body: `<p>Write one <code>def</code> per shape of input, Elixir style. Clauses can match patterns and carry <code>if</code> guards, and an optional body-less head declares the types once.</p><p>They compile to a single Gleam function with a <code>case</code>, so recursion in tail position stays tail-call optimised.</p>`,
    },
    {
      name: "returns",
      title: "Return early",
      body: `<p>Check the edge cases first and get out. <code>return</code> works anywhere a statement goes: at the top of a function, inside <code>if</code> and <code>case</code> branches, and inside anonymous functions.</p><p>The returned expression is only evaluated when its branch is taken.</p>`,
    },
    {
      name: "question",
      title: "Bubble errors up with <code>?</code>",
      body: `<p><code>expr?</code> gives you the value inside an <code>Ok</code>, or returns the <code>Error</code> from the enclosing function. It works inside any expression, and after a pipeline it applies to the whole pipeline.</p><p>Evaluation order is kept, and short-circuiting is respected: in <code>flag and parse(s)?</code>, <code>parse</code> only runs when <code>flag</code> is true.</p>`,
    },
    {
      name: "anon",
      title: "Anonymous functions with clauses",
      body: `<p><code>fn { … }</code> is an anonymous function made of clauses. Hand it straight to <code>list.map</code> instead of writing <code>fn(x) { case x { … } }</code>.</p>`,
    },
    {
      name: "records",
      title: "Match only what you need",
      body: `<p>Record patterns can name a few fields and skip the rest with <code>| _</code>. <code>as</code> keeps the whole value, and <code>Player(p | health: 100)</code> copies it with one field changed.</p>`,
    },
  ];

  const featureHtml = `
<section class="features" aria-labelledby="features-title">
  <div class="wrap">
    <h2 id="features-title" class="section-title">What it feels like</h2>
    ${features
      .map(
        (f) => `
    <article class="feature">
      <div class="feature-text">
        <h3>${f.title}</h3>
        ${f.body}
      </div>
      <div class="feature-code">${beaGleam(f.name, f.name)}</div>
    </article>`,
      )
      .join("")}
  </div>
</section>`;

  const glanceHtml = `
<section class="glance" aria-labelledby="glance-title">
  <div class="wrap">
    <h2 id="glance-title" class="section-title">The Gleam you know, spelled shorter</h2>
    <p class="section-lede">Everything else is Gleam as written: <code>case</code>, <code>use</code>, pipes, captures, labelled arguments, <code>echo</code>, <code>assert</code>, bit arrays and <code>@external</code>.</p>
    <div class="table-scroll" tabindex="0">
      <table>
        <thead><tr><th scope="col">Gleam</th><th scope="col">Bea</th><th scope="col">What changed</th></tr></thead>
        <tbody>
          ${glance
            .map(
              ([g, b, note]) =>
                `<tr><td><pre><code class="lang-gleam">${highlight(g, "gleam")}</code></pre></td><td><pre><code class="lang-bea">${highlight(b, "bea")}</code></pre></td><td>${note}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>
</section>`;

  const ecosystem = `
<section class="ecosystem" aria-labelledby="eco-title">
  <div class="wrap eco-grid">
    <div class="prose">
      <h2 id="eco-title">Everything Gleam has</h2>
      <p>A Bea project is a Gleam project with <code>bea.toml</code> in place of <code>gleam.toml</code> and <code>.bea</code> files in <code>src/</code>. The <code>bea</code> command wraps Gleam's tooling: dependencies come from Hex, builds target Erlang or JavaScript, and Gleam modules and FFI files can live right next to your Bea code.</p>
      <ul class="checks">
        <li>Any Gleam package, straight from Hex: <code>bea add lustre gleam_json</code></li>
        <li>Erlang and JavaScript targets</li>
        <li>A language server with Gleam's hovers, completion, go to definition and rename, on <code>.bea</code> files, for VS Code, Neovim and Helix</li>
        <li>A formatter: <code>bea format</code></li>
        <li>Compiler errors, <code>echo</code> output and stack traces that point at your Bea source</li>
      </ul>
    </div>
    <div class="eco-code">
      ${codeBlock([
        {
          label: "Terminal",
          lang: "sh",
          file: "Terminal",
          code: `$ bea new my_app
$ cd my_app
$ bea add gleam_json
$ bea run
$ bea transpile src/my_app.bea   # show the Gleam
$ bea transpile --out ../plain   # eject`,
        },
      ])}
      ${codeBlock([
        {
          label: "error",
          lang: "text",
          file: "A Gleam type error, pointing at Bea",
          code: `error: Type mismatch
   ┌─ src/demo.bea:16:22
   │
16 │   label = "n is " <> n
   │                      ^

The <> operator expects arguments of this type:
    String`,
        },
      ])}
    </div>
  </div>
</section>`;

  const tryIt = `
<section class="try" aria-labelledby="try-title">
  <div class="wrap"><div class="try-inner">
    <div>
      <h2 id="try-title">Try it without installing anything</h2>
      <p>The playground runs Bea's real compiler in your browser. Type Bea on the left, read the Gleam on the right.</p>
    </div>
    <a class="btn btn-primary" href="playground/">Open the playground</a>
  </div></div>
</section>`;

  const cousins = `
<section class="cousins" aria-labelledby="cousins-title">
  <div class="wrap cousins-inner">
    <img src="assets/beatrix.svg" alt="Beatrix" width="160" height="160">
    <div class="prose">
      <h2 id="cousins-title">Meet Beatrix</h2>
      <p>Beatrix is Bea's mascot: a small, cheerful black hole. Gleam's Lucy is a star, which makes the two of them cousins in the same sky. Whatever you write falls into Beatrix, and Gleam comes out the other side.</p>
    </div>
  </div>
</section>`;

  return page({
    title: "",
    description: "Bea is an ergonomic language that transpiles to Gleam: multi-clause functions with guards, early return and ? for errors, compiled to plain, readable Gleam.",
    depth: 0,
    active: "home",
    bodyClass: "home",
    body: hero + horizon + why + featureHtml + glanceHtml + ecosystem + tryIt + cousins,
  });
}

// --- Tour -----------------------------------------------------------------

const lessonOrder = chapters.flatMap((c, ci) => c.lessons.map((file) => ({ file, chapter: c, chapterIndex: ci })));

function tourNav(currentFile, depth) {
  const root = "../".repeat(depth);
  return `<nav class="tour-nav" aria-label="Tour lessons">
    <details class="tour-nav-details" open>
      <summary>All lessons</summary>
      <ol class="chapters">
        ${chapters
          .map(
            (c) => `<li>
          <span class="chapter-title">${esc(c.title)}</span>
          <ol>
            ${c.lessons
              .map((file) => {
                const l = lessons[file];
                const current = file === currentFile ? ' aria-current="page"' : "";
                return `<li><a href="${root}tour/${l.slug}/"${current}>${esc(l.title)}</a></li>`;
              })
              .join("")}
          </ol>
        </li>`,
          )
          .join("")}
      </ol>
    </details>
  </nav>`;
}

function lessonPage(index) {
  const { file, chapter, chapterIndex } = lessonOrder[index];
  const l = lessons[file];
  const prev = lessonOrder[index - 1];
  const next = lessonOrder[index + 1];
  const tabs = [
    { label: "Bea", lang: "bea", code: read(`content/examples/${file}.bea`) },
    { label: "Gleam", lang: "gleam", code: read(`content/examples/${file}.gleam`) },
  ];
  if (exists(`content/examples/${file}.out`)) {
    tabs.push({ label: "Output", lang: "output", code: read(`content/examples/${file}.out`) });
  }
  const actions = `<a class="open-pg" href="../../playground/?example=${l.slug}">Open in playground</a>`;
  const pager = `<nav class="pager" aria-label="Previous and next lesson">
    ${prev ? `<a class="pager-prev" href="../${lessons[prev.file].slug}/"><span>Previous</span>${esc(lessons[prev.file].title)}</a>` : `<a class="pager-prev" href="../"><span>Back to</span>Tour contents</a>`}
    ${next ? `<a class="pager-next" href="../${lessons[next.file].slug}/"><span>Next</span>${esc(lessons[next.file].title)}</a>` : `<a class="pager-next" href="../../playground/"><span>Next</span>Try the playground</a>`}
  </nav>`;
  const body = `
<div class="wrap tour-layout">
  ${tourNav(file, 2)}
  <article class="lesson">
    <header class="lesson-head">
      <p class="lesson-chapter">Chapter ${chapterIndex + 1}: ${esc(chapter.title)}</p>
      <h1>${esc(l.title)}</h1>
      <ul class="teaches" aria-label="What this lesson shows">${l.teaches.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    </header>
    <div class="prose lesson-notes">${l.notes}</div>
    ${codeBlock(tabs, { caption: `${l.title} in Bea`, actions, className: "lesson-code" })}
    <p class="source-note">An exercism exercise from the Gleam track, solved in Bea: <a href="${REPO}/blob/main/beacode/src/${file}.bea">beacode/src/${file}.bea</a></p>
    ${pager}
  </article>
</div>`;
  return page({
    title: `${l.title}: tour`,
    description: `${l.title}, an exercism exercise solved in Bea. Shows ${l.teaches.join(", ")}.`,
    depth: 2,
    active: "tour",
    bodyClass: "tour-page",
    body,
  });
}

function tourIndex() {
  const first = lessons[lessonOrder[0].file];
  const body = `
<div class="wrap tour-intro">
  <header class="page-head">
    <h1>Language tour</h1>
    <p class="section-lede">Twenty-four exercises from the Gleam track on <a href="https://exercism.org/tracks/gleam">exercism</a>, solved in Bea. Each lesson shows the Bea code, the Gleam it compiles to, and what it prints. Start at the top if Bea is new to you; every lesson builds on the last.</p>
    <p><a class="btn btn-primary" href="${first.slug}/">Start with ${esc(first.title)}</a></p>
  </header>
  <ol class="chapter-grid">
    ${chapters
      .map(
        (c, ci) => `<li class="chapter-card">
      <h2><span class="chapter-num">${ci + 1}</span>${esc(c.title)}</h2>
      <ol>
        ${c.lessons
          .map((file) => {
            const l = lessons[file];
            return `<li><a href="${l.slug}/">${esc(l.title)}</a><span class="chapter-teaches">${esc(l.teaches.join(", "))}</span></li>`;
          })
          .join("")}
      </ol>
    </li>`,
      )
      .join("")}
  </ol>
</div>`;
  return page({
    title: "Language tour",
    description: "Learn Bea through 24 exercism exercises: Bea code, the Gleam it compiles to, and its output.",
    depth: 1,
    active: "tour",
    bodyClass: "tour-index",
    body,
  });
}

// --- Playground -------------------------------------------------------------

function playground() {
  const body = `
<div class="pg">
  <div class="pg-bar">
    <div class="pg-title">
      <h1>Playground</h1>
      <p>Bea's compiler, running in your browser. Nothing is sent anywhere.</p>
    </div>
    <div class="pg-tools">
      <label class="pg-select"><span class="visually-hidden">Load an example</span>
        <select id="pg-example"></select>
      </label>
      <button class="btn btn-small" type="button" id="pg-format" title="Format (Shift+Alt+F)">Format</button>
      <button class="btn btn-small" type="button" id="pg-share">Copy link</button>
    </div>
  </div>
  <div class="pg-panes">
    <section class="pg-pane" aria-label="Bea source">
      <div class="pg-pane-head"><span>main.bea</span><span class="pg-hint">Tab indents. Esc, then Tab, leaves the editor.</span></div>
      <div class="editor">
        <pre class="editor-hl" aria-hidden="true"><code class="lang-bea"></code></pre>
        <textarea id="pg-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Bea source code"></textarea>
      </div>
    </section>
    <section class="pg-pane pg-out" aria-label="Generated Gleam">
      <div class="pg-pane-head"><span id="pg-out-label">main.gleam</span><span class="pg-status" id="pg-status" role="status"></span>${copyButton()}</div>
      <pre class="pg-output" tabindex="0"><code class="lang-gleam" id="pg-output"></code></pre>
    </section>
  </div>
  <p class="pg-note">The playground turns Bea into Gleam and reports Bea's syntax errors. Type checking and running happen in Gleam, so install Bea locally to run programs. <a href="${REPO}">Get the source</a>.</p>
</div>
<noscript><p class="wrap">The playground needs JavaScript. The <a href="../tour/">tour</a> shows every example with its Gleam and output, no JavaScript required.</p></noscript>`;
  return page({
    title: "Playground",
    description: "Write Bea and see the Gleam it compiles to, live in your browser.",
    depth: 1,
    active: "playground",
    bodyClass: "playground",
    body,
    scripts: ["assets/playground.js"],
  });
}

// --- Community --------------------------------------------------------------

function community() {
  const editors = codeBlock([
    {
      label: "Neovim",
      lang: "text",
      file: "init.lua",
      code: `vim.filetype.add({ extension = { bea = "bea" } })
vim.api.nvim_create_autocmd("FileType", {
  pattern = "bea",
  callback = function(args)
    vim.lsp.start({
      name = "bea",
      cmd = { "bea", "lsp" },
      root_dir = vim.fs.root(args.buf, { "bea.toml" }),
    })
  end,
})`,
    },
    {
      label: "Helix",
      lang: "toml",
      file: "languages.toml",
      code: `[[language]]
name = "bea"
scope = "source.bea"
file-types = ["bea"]
roots = ["bea.toml"]
language-servers = ["bea-lsp"]
comment-token = "//"

[language-server.bea-lsp]
command = "bea"
args = ["lsp"]`,
    },
  ].map((t) => t), { caption: "Editor setup" });

  const body = `
<div class="wrap community">
  <header class="page-head">
    <h1>Community</h1>
    <p class="section-lede">Bea is young, and the people trying it now shape what it becomes. Everything happens in the open on GitHub.</p>
  </header>

  <div class="ways">
    <!--<section class="way">
      <h2>Join the Discord</h2>
      <p>Talk about Bea, ask questions about the procedural syntax, or follow the transpiler's development. It's the best place to get help or share what you've built.</p>
      <a class="btn btn-primary" href="https://discord.gg/wpzXrRF8D">Join the Discord</a>
    </section>
    -->
    <section class="way">
      <h2>Report what breaks</h2>
      <p>Found code that doesn't compile, a confusing error, or a formatter that refuses your file? Open an issue with the smallest <code>.bea</code> file that shows it. <code>bea transpile file.bea</code> output helps a lot.</p>
      <a class="btn" href="${REPO}/issues">Open an issue</a>
    </section>
    <section class="way">
      <h2>Contribute to the compiler</h2>
      <p>The transpiler is written in Gleam: lexer, parser, lowering, code generation, formatter and language server, each in its own module with tests. Pick something from the issues or bring a proposal.</p>
      <a class="btn" href="${REPO}">Browse the source</a>
    </section>
    <section class="way">
      <h2>Add to the examples</h2>
      <p>The tour on this site is built from <code>beacode/</code>, Bea solutions to the Gleam exercism track. A new solution there becomes a new lesson here.</p>
      <a class="btn" href="${REPO}/tree/main/beacode">See beacode</a>
    </section>
  </div>

  <section class="editors" aria-labelledby="editors-title">
    <div class="prose">
      <h2 id="editors-title">Set up your editor</h2>
      <p><code>bea lsp</code> runs Gleam's language server on the generated code and maps every position back to your <code>.bea</code> files: diagnostics, hover, completion, go to definition, rename and formatting. The VS Code extension lives in <a href="${REPO}/tree/main/editors/vscode"><code>editors/vscode</code></a>.</p>
    </div>
    ${editors}
  </section>

  <section class="cousins-small">
    <img src="../assets/beatrix.svg" alt="" width="72" height="72">
    <p>Beatrix the black hole is Bea's mascot, and a cousin of Gleam's Lucy. Use her when you write or talk about Bea.</p>
  </section>
</div>`;
  return page({
    title: "Community",
    description: "Report issues, contribute to the Bea compiler, add examples, and set up your editor.",
    depth: 1,
    active: "community",
    bodyClass: "community-page",
    body,
  });
}

function notFound() {
  // GitHub Pages serves 404.html for a missing path at any depth, so this page
  // can't use relative links. SITE_BASE is the site's absolute base path; the
  // Pages workflow sets it from actions/configure-pages (e.g. "/website/").
  const base = (process.env.SITE_BASE || "/").replace(/\/?$/, "/");
  const body = `
<div class="wrap lost">
  <img src="${base}assets/beatrix.svg" alt="" width="180" height="180">
  <h1>This page fell past the event horizon</h1>
  <p>There is nothing at this address. Beatrix swears she didn't eat it.</p>
  <p><a class="btn btn-primary" href="${base}">Go to the home page</a> <a class="btn" href="${base}tour/">Open the tour</a></p>
</div>`;
  return page({ title: "Page not found", description: "Page not found.", depth: 0, active: "", bodyClass: "lost-page", body })
    .replace(/(href|src)="\.\/(?!\/)/g, `$1="${base}`);
}

// ---------------------------------------------------------------------------
// Playground data: every snippet and tour example, for the example picker.

function playgroundExamples() {
  const list = [
    { slug: "shapes", title: "Shapes (home page)", group: "Highlights", code: read("content/snippets/hero.bea") },
    { slug: "clauses", title: "FizzBuzz with clauses", group: "Highlights", code: read("content/snippets/clauses.bea") },
    { slug: "returns", title: "Early return", group: "Highlights", code: read("content/snippets/returns.bea") },
    { slug: "question", title: "The ? operator", group: "Highlights", code: read("content/snippets/question.bea") },
    { slug: "anon", title: "Anonymous clauses", group: "Highlights", code: read("content/snippets/anon.bea") },
    { slug: "records", title: "Record patterns", group: "Highlights", code: read("content/snippets/records.bea") },
  ];
  for (const { file } of lessonOrder) {
    const l = lessons[file];
    list.push({ slug: l.slug, title: l.title, group: "Tour", code: read(`content/examples/${file}.bea`) });
  }
  return list;
}

// ---------------------------------------------------------------------------
// Write everything

function write(rel, content) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

// Sanity checks: every lesson has its files.
for (const { file } of lessonOrder) {
  if (!lessons[file]) throw new Error(`tour.mjs has no lesson entry for ${file}`);
  for (const ext of ["bea", "gleam"]) {
    if (!exists(`content/examples/${file}.${ext}`)) throw new Error(`missing content/examples/${file}.${ext} (run scripts/sync-examples.sh)`);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(path.join(SRC, "assets"), path.join(OUT, "assets"));
write("assets/examples.json", JSON.stringify(playgroundExamples()));
write("index.html", landing());
write("tour/index.html", tourIndex());
lessonOrder.forEach((_, i) => write(`tour/${lessons[lessonOrder[i].file].slug}/index.html`, lessonPage(i)));
write("playground/index.html", playground());
write("community/index.html", community());
write("404.html", notFound());
write(".nojekyll", "");

const count = (dir) => fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".html")).length;
console.log(`Built ${count(OUT)} pages into ${path.relative(ROOT, OUT) || "."}/`);
