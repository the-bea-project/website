#!/usr/bin/env bash
# Copies the core of Bea's compiler (lexer, parser, deriving, lowering,
# codegen, formatter: Bea modules with no FFI) from a checkout of the
# compiler into src/bea/. The site compiles them with everything else, so
# the playground runs Bea's own compiler, built from its Bea source for the
# browser.
#
#   scripts/sync-compiler.sh [path/to/bea]      (default: ../bea)
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=$(pwd)
BEA=$(cd "${1:-../bea}" && pwd)

CORE="ast associated codegen compiler deriving diagnostic doc formatter lexer lower parser sourcemap span style"

rm -rf "$SITE/src/bea"
mkdir -p "$SITE/src/bea"
for m in $CORE; do cp "$BEA/src/bea/$m.bea" "$SITE/src/bea/"; done

# Workaround (see bea_research.md): the formatter's safety check erases spans
# with a regex over string.inspect output. On the JavaScript target inspect
# prints labels (`Span(start: 1, end: 2)`), so the regex never matches and every
# format is rejected. Accept both spellings until this is fixed upstream.
sed -i 's|regexp.from_string("Span\\\\(\\\\d+, \\\\d+\\\\)")|regexp.from_string("Span\\\\((start: )?\\\\d+, (end: )?\\\\d+\\\\)")|' \
  "$SITE/src/bea/formatter.bea"
grep -q '(start: )?' "$SITE/src/bea/formatter.bea" || {
  echo "the formatter workaround no longer applies: check src/bea/formatter.bea" >&2
  exit 1
}

# Anything the core starts importing must be copied too.
missing=$(grep -ho '^import bea/[a-z_/]*' "$SITE"/src/bea/*.bea | sort -u |
  sed 's|^import ||' | while read -r m; do [ -f "$SITE/src/$m.bea" ] || echo "$m"; done)
if [ -n "$missing" ]; then
  echo "the compiler core now imports: $missing (add it to CORE)" >&2
  exit 1
fi

VERSION=$(cd "$BEA" && git describe --tags --always --dirty 2>/dev/null || echo unknown)
RELEASE=$(sed -n 's/^version = "\(.*\)"/\1/p' "$BEA/bea.toml")
cat > "$SITE/content/compiler.json" <<EOF
{"release": "$RELEASE", "commit": "$VERSION", "synced": "$(date -u +%Y-%m-%d)"}
EOF
echo "Copied the compiler core of bea $RELEASE ($VERSION) into src/bea/"
