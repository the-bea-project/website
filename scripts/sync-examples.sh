#!/usr/bin/env bash
# Copies the exercism examples and landing-page snippets through the real `bea`
# CLI: each .bea file gets its generated .gleam and its program output (.out)
# saved next to it. The site build only reads these files, so GitHub Pages
# never needs Gleam or Erlang.
#
#   scripts/sync-examples.sh [path/to/bea]      (default: ../bea)
#
# Needs: `bea` on the PATH (or BEA=...), gleam and Erlang/OTP 27+.
set -uo pipefail
cd "$(dirname "$0")/.."
SITE=$(pwd)
BEA_DIR=$(cd "${1:-../bea}" && pwd)
BEA=${BEA:-bea}
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
failures=0

clean_output() {
  # Drop build chatter and colour codes, keep program output and echo lines.
  sed -E 's/\x1b\[[0-9;]*m//g' |
    grep -vE '^\s*(Compiling|Compiled|Running|Downloading|Downloaded|Resolving|Added) ' |
    grep -vE '^ *Downloaded [0-9]+ packages'
}

# --- 1. exercism examples, built as the beacode project ----------------------
cp -r "$BEA_DIR/beacode" "$WORK/beacode"
rm -rf "$WORK/beacode/.beabuild"
(cd "$WORK/beacode" && $BEA build >/dev/null 2>&1) || {
  echo "beacode does not build"; (cd "$WORK/beacode" && $BEA build); exit 1;
}
rm -f "$SITE"/src/content/examples/*
for f in "$WORK"/beacode/src/*.bea; do
  name=$(basename "$f" .bea)
  cp "$f" "$SITE/src/content/examples/$name.bea"
  (cd "$WORK/beacode" && $BEA transpile "src/$name.bea") \
    > "$SITE/src/content/examples/$name.gleam" 2>/dev/null || { echo "FAIL transpile $name"; failures=$((failures+1)); }
  if grep -q '^pub def main' "$f"; then
    (cd "$WORK/beacode" && $BEA run -m "$name" 2>&1) | clean_output \
      > "$SITE/src/content/examples/$name.out"
  fi
  echo "ok $name"
done

# --- 2. landing-page snippets, each in its own folder ----------------------------
# (script mode compiles every .bea in the folder, so they must not share one)
for f in "$SITE"/src/content/snippets/*.bea; do
  name=$(basename "$f" .bea)
  mkdir -p "$WORK/snip_$name"
  cp "$f" "$WORK/snip_$name/$name.bea"
  # Type check (and run, when there is a main) so the landing page never shows
  # code that doesn't compile, then save the generated Gleam.
  if (cd "$WORK/snip_$name" && $BEA run "$name.bea" >"$WORK/err" 2>&1) &&
    (cd "$WORK/snip_$name" && $BEA transpile "$name.bea" > "$SITE/src/content/snippets/$name.gleam" 2>"$WORK/err"); then
    echo "ok snippet $name"
  else
    echo "FAIL snippet $name"; cat "$WORK/err"; failures=$((failures+1))
  fi
done

VERSION=$(cd "$BEA_DIR" && git describe --always --dirty 2>/dev/null || echo unknown)
echo "{\"bea\": \"$VERSION\", \"synced\": \"$(date -u +%Y-%m-%d)\"}" > "$SITE/src/content/examples.version.json"
[ "$failures" -eq 0 ] && echo "Synced from bea $VERSION" || { echo "$failures failure(s)"; exit 1; }
