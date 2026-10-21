// The playground: Bea's compiler core (lexer, parser, lowering, codegen and
// formatter), compiled from Gleam to JavaScript, running entirely in the page.
import { transpile, format } from "./bea.min.mjs";
import { highlight, escapeHtml } from "./highlight.js";

const $ = (id) => document.getElementById(id);
const input = $("pg-input");
const hl = document.querySelector(".editor-hl code");
const hlPre = document.querySelector(".editor-hl");
const output = $("pg-output");
const outPre = output.parentElement;
const status = $("pg-status");
const picker = $("pg-example");
const formatButton = $("pg-format");
const shareButton = $("pg-share");

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

// --- URL-safe base64 for share links ------------------------------------------------
const encode = (text) => {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const decode = (b64) => {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

// --- Rendering --------------------------------------------------------------------------
function paintEditor() {
  // A trailing newline keeps the overlay's height in step with the textarea.
  hl.innerHTML = highlight(input.value, "bea") + "\n";
  syncScroll();
}

function syncScroll() {
  hlPre.scrollTop = input.scrollTop;
  hlPre.scrollLeft = input.scrollLeft;
}

function compile() {
  const started = performance.now();
  let ok, text;
  try {
    [ok, text] = transpile(input.value);
  } catch (err) {
    ok = false;
    text = `The compiler crashed on this input. Please report it with the code attached.\n\n${err}`;
  }
  const ms = Math.max(1, Math.round(performance.now() - started));
  if (ok) {
    output.innerHTML = highlight(text.replace(/\n$/, ""), "gleam");
    outPre.classList.remove("err");
    status.textContent = `Generated in ${ms} ms`;
    status.classList.remove("err");
  } else {
    output.innerHTML = escapeHtml(text.trim());
    outPre.classList.add("err");
    const count = (text.match(/^error:/gm) || []).length || 1;
    status.textContent = count === 1 ? "1 error" : `${count} errors`;
    status.classList.add("err");
  }
}

let timer;
function changed() {
  paintEditor();
  clearTimeout(timer);
  timer = setTimeout(() => {
    compile();
    store.set("bea-playground", input.value);
  }, 90);
}

// Replace text through the browser's editing commands where possible, so undo works.
function replaceRange(start, end, text) {
  input.focus();
  input.setSelectionRange(start, end);
  const done = document.execCommand && document.execCommand("insertText", false, text);
  if (!done) input.setRangeText(text, start, end, "end");
  changed();
}

function setCode(code) {
  input.value = code;
  input.scrollTop = 0;
  paintEditor();
  compile();
}

// --- Editing helpers -------------------------------------------------------------------
let escaped = false; // after Esc, Tab moves focus instead of indenting
input.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { escaped = true; return; }
  if (e.key === "Tab" && !escaped && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    const { selectionStart: s, selectionEnd: end, value } = input;
    if (e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const strip = value.slice(lineStart, lineStart + 2).match(/^ {1,2}/);
      if (strip) {
        input.setSelectionRange(lineStart, lineStart + strip[0].length);
        replaceRange(lineStart, lineStart + strip[0].length, "");
        input.setSelectionRange(Math.max(lineStart, s - strip[0].length), Math.max(lineStart, end - strip[0].length));
      }
    } else {
      replaceRange(s, end, "  ");
    }
    return;
  }
  escaped = false;
  if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
    // Keep the current indentation, one level deeper after an opening bracket.
    const { selectionStart: s, selectionEnd: end, value } = input;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const line = value.slice(lineStart, s);
    let indent = line.match(/^\s*/)[0];
    if (/[{([]\s*$/.test(line) || /->\s*$/.test(line)) indent += "  ";
    e.preventDefault();
    replaceRange(s, end, "\n" + indent);
    return;
  }
  if (e.key === "F" && e.shiftKey && e.altKey) {
    e.preventDefault();
    runFormat();
  }
});
input.addEventListener("input", changed);
input.addEventListener("scroll", syncScroll);

function runFormat() {
  const [ok, text] = format(input.value);
  if (ok) {
    if (text !== input.value) replaceRange(0, input.value.length, text);
    flash(formatButton, "Formatted");
  } else {
    flash(formatButton, "Fix errors first");
  }
}
formatButton.addEventListener("click", runFormat);

function flash(button, text) {
  const original = button.dataset.label || button.textContent;
  button.dataset.label = original;
  button.textContent = text;
  setTimeout(() => (button.textContent = original), 1500);
}

shareButton.addEventListener("click", async () => {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "code=" + encode(input.value);
  history.replaceState(null, "", url);
  try {
    await navigator.clipboard.writeText(url.href);
    flash(shareButton, "Link copied");
  } catch {
    flash(shareButton, "Link is in the address bar");
  }
});

// --- Examples -------------------------------------------------------------------------
async function start() {
  let examples = [];
  try {
    const res = await fetch(new URL("./examples.json", import.meta.url));
    examples = await res.json();
  } catch {
    /* the picker stays empty; the editor still works */
  }

  const groups = new Map();
  for (const ex of examples) {
    if (!groups.has(ex.group)) groups.set(ex.group, []);
    groups.get(ex.group).push(ex);
  }
  picker.innerHTML =
    `<option value="">Load an example…</option>` +
    [...groups]
      .map(([group, list]) => `<optgroup label="${escapeHtml(group)}">${list.map((ex) => `<option value="${ex.slug}">${escapeHtml(ex.title)}</option>`).join("")}</optgroup>`)
      .join("");

  picker.addEventListener("change", () => {
    const ex = examples.find((x) => x.slug === picker.value);
    if (!ex) return;
    setCode(ex.code);
    const url = new URL(location.href);
    url.hash = "";
    url.searchParams.set("example", ex.slug);
    history.replaceState(null, "", url);
  });

  // Starting code: a shared link, then ?example=, then the last draft, then Shapes.
  const params = new URLSearchParams(location.search);
  const hash = location.hash.match(/code=([A-Za-z0-9_-]+)/);
  let code = null;
  if (hash) {
    try { code = decode(hash[1]); } catch { code = null; }
  }
  if (code == null && params.get("example")) {
    const ex = examples.find((x) => x.slug === params.get("example"));
    if (ex) { code = ex.code; picker.value = ex.slug; }
  }
  if (code == null) code = store.get("bea-playground");
  if (code == null) code = examples[0]?.code ?? 'pub def main() {\n  echo "Hello from Bea"\n}\n';
  setCode(code);
}

start();
