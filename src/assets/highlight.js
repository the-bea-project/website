// A small, dependency-free highlighter for Bea and Gleam (plus shell and toml).
// Used at build time to pre-render every code block on the site, and in the
// browser by the playground. Returns HTML with <span class="tk-…"> tokens.
//
// Token classes
//   tk-c  comment          tk-s  string          tk-e  escape / interpolation braces
//   tk-n  number           tk-k  keyword         tk-x  Bea control flow (return, ?)
//   tk-t  type/constructor tk-f  function name   tk-o  operator
//   tk-a  attribute        tk-p  prompt / dim

const BEA_KEYWORDS = new Set([
  "def", "fn", "pub", "type", "opaque", "const", "import", "as", "if", "else",
  "cond", "case", "use", "echo", "todo", "panic", "assert", "and", "or", "not",
]);
const GLEAM_KEYWORDS = new Set([
  "fn", "pub", "type", "opaque", "const", "import", "as", "if", "case", "use",
  "echo", "todo", "panic", "assert", "let",
]);
// Highlighted as Bea's own control flow, so they stand out on the page.
const BEA_SPECIAL = new Set(["return"]);

const OPERATORS = [
  "|>", "<>", "->", "<-", "==", "!=", ">=.", "<=.", ">=", "<=", ">.", "<.",
  "+.", "-.", "*.", "/.", "&&", "||", "<<", ">>", "..",
  "=", ">", "<", "+", "-", "*", "/", "%", "|", "!",
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const span = (cls, text) => `<span class="tk-${cls}">${esc(text)}</span>`;

const isUpper = (c) => c >= "A" && c <= "Z";
const isIdentStart = (c) => /[a-z_]/.test(c);
const isIdent = (c) => /[A-Za-z0-9_]/.test(c);
const isDigit = (c) => c >= "0" && c <= "9";

function scanCode(src, i, lang, stopAtBrace) {
  // Scans code from i. When stopAtBrace is true (inside #{…}), stops at the
  // matching close brace and returns its position.
  const kw = lang === "gleam" ? GLEAM_KEYWORDS : BEA_KEYWORDS;
  let out = "";
  let depth = 0;
  let prevWord = "";
  while (i < src.length) {
    const c = src[i];
    const rest = src.slice(i);

    if (stopAtBrace) {
      if (c === "{") depth++;
      if (c === "}") {
        if (depth === 0) return { html: out, end: i };
        depth--;
      }
    }

    // comments
    if (rest.startsWith("//")) {
      const nl = src.indexOf("\n", i);
      const end = nl === -1 ? src.length : nl;
      out += span("c", src.slice(i, end));
      i = end;
      continue;
    }
    // strings
    if (c === '"') {
      const r = scanString(src, i, lang);
      out += r.html;
      i = r.end;
      prevWord = "";
      continue;
    }
    if (c === "`" && lang === "bea") {
      const close = src.indexOf("`", i + 1);
      const end = close === -1 ? src.length : close + 1;
      out += span("s", src.slice(i, end));
      i = end;
      continue;
    }
    // numbers
    if (isDigit(c)) {
      const m = /^(0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|[0-9][0-9_]*(\.[0-9_]*)?([eE]-?[0-9_]+)?)/.exec(rest);
      out += span("n", m[0]);
      i += m[0].length;
      continue;
    }
    // attributes
    if (c === "@" && /[a-z]/.test(src[i + 1] || "")) {
      const m = /^@[a-z_][A-Za-z0-9_]*/.exec(rest);
      out += span("a", m[0]);
      i += m[0].length;
      continue;
    }
    // identifiers
    if (isUpper(c) || isIdentStart(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
      const word = m[0];
      const after = src.slice(i + word.length);
      if (isUpper(c)) {
        out += span("t", word);
      } else if (BEA_SPECIAL.has(word) && lang === "bea") {
        out += span("x", word);
      } else if (kw.has(word) && !/^\s*:(?!:)/.test(after) && src[i - 1] !== ".") {
        out += span("k", word);
      } else if (prevWord === "def" || prevWord === "fn" || /^\s*\(/.test(after) && !/^\s+\(/.test(after)) {
        out += word === "_" ? esc(word) : span("f", word);
      } else {
        out += esc(word);
      }
      prevWord = word;
      i += word.length;
      continue;
    }
    // the ? operator (Bea)
    if (c === "?" && lang === "bea") {
      out += span("x", "?");
      i++;
      continue;
    }
    // operators
    const op = OPERATORS.find((o) => rest.startsWith(o));
    if (op) {
      out += span("o", op);
      i += op.length;
      continue;
    }
    if (!/\s/.test(c)) prevWord = "";
    out += esc(c);
    i++;
  }
  return { html: out, end: i };
}

function scanString(src, i, lang) {
  let out = '<span class="tk-s">"';
  i++;
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") {
      out += `</span>${span("e", src.slice(i, i + 2))}<span class="tk-s">`;
      i += 2;
      continue;
    }
    if (c === "#" && src[i + 1] === "{" && lang === "bea") {
      out += `</span>${span("e", "#{")}`;
      const inner = scanCode(src, i + 2, lang, true);
      out += inner.html + span("e", "}") + '<span class="tk-s">';
      i = inner.end + 1;
      continue;
    }
    if (c === '"') {
      return { html: out + '"</span>', end: i + 1 };
    }
    out += esc(c);
    i++;
  }
  return { html: out + "</span>", end: i };
}

function highlightShell(src) {
  return src
    .split("\n")
    .map((line) => {
      if (/^\s*#/.test(line)) return span("c", line);
      const m = /^(\$ )?(\S+)(.*)$/.exec(line);
      if (!m) return esc(line);
      const [, prompt = "", cmd, rest] = m;
      const restHtml = esc(rest).replace(/(#.*)$/, (c) => `<span class="tk-c">${c}</span>`);
      return (prompt ? span("p", prompt) : "") + span("k", cmd) + restHtml;
    })
    .join("\n");
}

function highlightToml(src) {
  return src
    .split("\n")
    .map((line) => {
      if (/^\s*#/.test(line)) return span("c", line);
      if (/^\s*\[.*\]\s*$/.test(line)) return span("t", line);
      const m = /^(\s*[A-Za-z0-9_.-]+)(\s*=\s*)(.*)$/.exec(line);
      if (m) {
        const value = esc(m[3]).replace(/"[^"]*"/g, (s) => `<span class="tk-s">${s}</span>`);
        return span("f", m[1]) + span("o", m[2]) + value;
      }
      return esc(line);
    })
    .join("\n");
}

function highlightOutput(src) {
  // `echo` prints "path/file.bea:12" above each value: dim those lines.
  return src
    .split("\n")
    .map((line) => (/^\S+\.(bea|gleam):\d+$/.test(line) ? span("p", line) : esc(line)))
    .join("\n");
}

export function highlight(src, lang = "bea") {
  if (lang === "sh") return highlightShell(src);
  if (lang === "toml") return highlightToml(src);
  if (lang === "output") return highlightOutput(src);
  if (lang === "text") return esc(src);
  return scanCode(src, 0, lang, false).html;
}

export const escapeHtml = esc;
