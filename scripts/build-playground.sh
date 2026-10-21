#!/usr/bin/env bash
# Rebuilds src/assets/bea.min.mjs: Bea's compiler core (lexer, parser, lower,
# codegen, formatter) compiled to JavaScript so the playground runs entirely in
# the browser.
#
#   scripts/build-playground.sh [path/to/bea]      (default: ../bea)
#
# Needs: gleam (1.18+) and node/npx. Erlang is not needed for this step.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=$(pwd)
BEA=$(cd "${1:-../bea}" && pwd)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# These modules are pure Gleam (no Erlang FFI), so they compile to JS as-is.
CORE="ast codegen compiler diagnostic doc formatter lexer lower parser sourcemap span"

mkdir -p "$WORK/src/bea"
cp "$SITE/playground-engine/gleam.toml" "$WORK/"
cp "$SITE/playground-engine/src/bea_web.gleam" "$WORK/src/"
for m in $CORE; do cp "$BEA/src/bea/$m.gleam" "$WORK/src/bea/"; done

# Workaround (see bea_research.md): the formatter's safety check erases spans
# with a regex over string.inspect output. On the JavaScript target inspect
# prints labels (`Span(start: 1, end: 2)`), so the regex never matches and every
# format is rejected. Accept both spellings until this is fixed upstream.
sed -i 's|regexp.from_string("Span\\\\(\\\\d+, \\\\d+\\\\)")|regexp.from_string("Span\\\\((start: )?\\\\d+, (end: )?\\\\d+\\\\)")|' \
  "$WORK/src/bea/formatter.gleam"

(cd "$WORK" && gleam build --target javascript)

# --keep-names matters: Gleam's string.inspect on JS reads class names, and the
# formatter's safety check depends on inspect output.
npx --yes esbuild@0.24.2 "$WORK/build/dev/javascript/bea_web/bea_web.mjs" \
  --bundle --format=esm --minify --keep-names \
  --outfile="$SITE/src/assets/bea.min.mjs"

VERSION=$(cd "$BEA" && git describe --always --dirty 2>/dev/null || echo unknown)
echo "{\"bea\": \"$VERSION\", \"built\": \"$(date -u +%Y-%m-%d)\"}" > "$SITE/src/assets/bea.version.json"
echo "Wrote src/assets/bea.min.mjs (bea $VERSION)"
