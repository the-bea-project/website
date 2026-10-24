#!/usr/bin/env bash
# Runs the site's examples through the real `bea` CLI and saves what it
# says: each example's generated Gleam (.gleam) and program output (.out).
# The site build only reads these files, so nothing on the site is
# hand-written Gleam or made-up output.
#
#   scripts/sync-examples.sh [path/to/bea]      (default: ../bea)
#
#   content/examples/   the exercism examples, copied from bea/beacode/src
#   content/features/   the tour's lessons on newer features: a Bea project
#                       of its own (with derivers and tests), outputs in
#                       content/features/generated/
#   content/snippets/   the home page snippets, each checked on its own
#
# Needs: `bea` on the PATH (or BEA=...), gleam and Erlang/OTP 27+.
set -uo pipefail
cd "$(dirname "$0")/.."
SITE=$(pwd)
BEA_DIR=$(cd "${1:-../bea}" && pwd)
BEA=${BEA:-bea}
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
export NO_COLOR=1
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
rm -f "$SITE"/content/examples/*
for f in "$WORK"/beacode/src/*.bea; do
  name=$(basename "$f" .bea)
  cp "$f" "$SITE/content/examples/$name.bea"
  (cd "$WORK/beacode" && $BEA transpile "src/$name.bea") \
    > "$SITE/content/examples/$name.gleam" 2>/dev/null || { echo "FAIL transpile $name"; failures=$((failures+1)); }
  if grep -q '^pub def main' "$f"; then
    (cd "$WORK/beacode" && $BEA run -m "$name" 2>&1) | clean_output \
      > "$SITE/content/examples/$name.out"
  fi
  echo "ok $name"
done

# --- 2. the feature lessons, a project with derivers and tests ----------------
cp -r "$SITE/content/features" "$WORK/features"
rm -rf "$WORK/features/.beabuild" "$WORK/features/generated"
(cd "$WORK/features" && $BEA build >/dev/null 2>&1) || {
  echo "content/features does not build"; (cd "$WORK/features" && $BEA build); exit 1;
}
rm -rf "$SITE/content/features/generated"
mkdir -p "$SITE/content/features/generated"
for f in "$WORK"/features/src/*.bea; do
  name=$(basename "$f" .bea)
  (cd "$WORK/features" && $BEA transpile "src/$name.bea") \
    > "$SITE/content/features/generated/$name.gleam" 2>/dev/null || { echo "FAIL transpile $name"; failures=$((failures+1)); }
  if grep -q '^pub def main' "$f"; then
    (cd "$WORK/features" && $BEA run -m "$name" 2>&1) | clean_output \
      > "$SITE/content/features/generated/$name.out"
  fi
  echo "ok feature $name"
done
# What `bea test` prints, for the testing lesson.
if (cd "$WORK/features" && $BEA test >"$WORK/test.out" 2>&1); then
  { echo '$ bea test'; clean_output <"$WORK/test.out"; } > "$SITE/content/features/generated/bea_test.out"
  echo "ok feature tests"
else
  echo "FAIL bea test"; cat "$WORK/test.out"; failures=$((failures+1))
fi

# --- 3. landing-page snippets, each in its own folder ----------------------------
# (script mode compiles every .bea in the folder, so they must not share one)
for f in "$SITE"/content/snippets/*.bea; do
  name=$(basename "$f" .bea)
  mkdir -p "$WORK/snip_$name"
  cp "$f" "$WORK/snip_$name/$name.bea"
  # Type check (and run, when there is a main) so the landing page never shows
  # code that doesn't compile, then save the generated Gleam.
  if (cd "$WORK/snip_$name" && $BEA run "$name.bea" >"$WORK/err" 2>&1) &&
    (cd "$WORK/snip_$name" && $BEA transpile "$name.bea" > "$SITE/content/snippets/$name.gleam" 2>"$WORK/err"); then
    echo "ok snippet $name"
  else
    echo "FAIL snippet $name"; cat "$WORK/err"; failures=$((failures+1))
  fi
done

VERSION=$(cd "$BEA_DIR" && git describe --tags --always --dirty 2>/dev/null || echo unknown)
echo "{\"bea\": \"$VERSION\", \"synced\": \"$(date -u +%Y-%m-%d)\"}" > "$SITE/content/examples.version.json"
[ "$failures" -eq 0 ] && echo "Synced from bea $VERSION" || { echo "$failures failure(s)"; exit 1; }
