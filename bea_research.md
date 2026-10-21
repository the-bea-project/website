# Bea: suggestions for the transpiler

Notes from building the website against `the-bea-project/bea` at commit
`b21332a` (CLI reports `bea 0.2.0`), with Gleam 1.18.1 and Erlang/OTP 28.5.
Everything below was reproduced, not guessed. It is ordered by how much I
think it matters.

## Bugs

### 1. The end-to-end script never runs the exercism examples

`scripts/test_examples.sh` step 2 globs `beacode/*.bea`, but the examples moved
to `beacode/src/` when `beacode` became a project (it has `bea.toml` now).
The glob matches nothing, so the loop runs once with the literal `*`:

```text
FAIL example *
error: Module does not exist
Module `a` was not found.
cp: cannot stat 'beacode/*.bea': No such file or directory
```

Step 3 (formatter) copies the same missing path, so the examples are not
format-checked either. The script exits 1, so CI should be red on `main`.

Suggested fix: build `beacode` as a project and run each module by name.

```bash
cp -r beacode "$WORK/beacode"
(cd "$WORK/beacode" && $BEA build) || fail "beacode builds"
for f in "$WORK"/beacode/src/*.bea; do
  name=$(basename "$f" .bea)
  grep -q '^pub def main' "$f" || continue      # e24_newsletter is a library
  (cd "$WORK/beacode" && $BEA run -m "$name" >"$WORK/run.log" 2>&1) \
    && pass "example $name" || { fail "example $name"; tail -20 "$WORK/run.log"; }
done
# and in step 3: cp beacode/src/*.bea test/fixtures/*.bea "$WORK/format/"
```

With the paths fixed, all 24 examples build, 23 run (newsletter has no
`main`), and all 24 format.

### 2. The formatter rejects every file on the JavaScript target

`formatter.normalise` erases positions with a regex over
`string.inspect(module)`:

```gleam
regexp.from_string("Span\\(\\d+, \\d+\\)")
```

On Erlang, `inspect` prints `Span(3, 9)`. On JavaScript it prints labels:
`Span(start: 3, end: 9)`. The regex never matches, the before/after trees always
differ, and every file fails with "Formatter bug". There is a second trap: JS
`inspect` reads class names, so a minified bundle (no `--keep-names`) breaks it
again.

The website works around both (patched regex, `--keep-names`). A sturdier fix
upstream is to stop comparing printed text: write an `erase_spans(module)`
that rebuilds the AST with `Span(0, 0)` everywhere and compare with `==`, or at
least accept both spellings:

```gleam
regexp.from_string("Span\\((start: )?\\d+, (end: )?\\d+\\)")
```

### 3. Modules named after Erlang keywords crash `bea run`

A file called `try.bea` or `cond.bea` compiles, then crashes at boot:

```text
Error! Failed to eval: bea_script@@main:run(try)
{badmatch,{error,{1,erl_parse,["syntax error before: ","')'"]}}}
```

The module name is passed to `erl -eval` as a bare atom. The real culprit is
Gleam's runner, but Bea users hit it more because `cond` is a Bea keyword and
an obvious file name. Erlang's reserved words are `after and andalso band begin
bnot bor bsl bsr bxor case catch cond div else end fun if let maybe not of or
orelse receive rem try when xor`. Bea could warn when a module path segment is
one of them, and the issue is worth reporting to Gleam.

### 4. `bea run missing.bea` reports the wrong problem

```text
Hint: Try creating the file `src/missing.gleam`.
```

The file doesn't exist; Bea should say so before handing anything to Gleam,
and mention `.bea`, not `.gleam`.

### 5. Two of the exercism examples have logic slips

Both build and run, so no test catches them, and they now appear in the tour:

- `e5_guessing_game.bea`, `reply_cond`: `guess == 41 or guess == 42` should be
  `guess == 41 or guess == 43` (the 42 branch above already wins).
- `e18_weather_ranking.bea`: `fh -. 32.0 /. 1.8` parses as
  `fh -. (32.0 /. 1.8)`, so 72.5 °F prints `54.72…` instead of `22.5`. It
  should be `(fh -. 32.0) /. 1.8` (Bea accepts parentheses for grouping and
  emits Gleam's `{ … }`).

Fixing them in the repo and re-running `scripts/sync-examples.sh` updates the
site.

## Ergonomics

### 6. Allow `return` directly after `->`

```bea
case lookup(id) {
  Some(u) -> u
  None -> return Error("not found")     // today: error, needs `{ return … }`
}
```

The error and its hint are good, but this is the most natural way to write it
for anyone coming from Elixir, Rust or Kotlin, and the desugaring already
exists. Parsing `-> return expr` as `-> { return expr }` in `case` and `cond`
arms would remove the papercut.

### 7. Multi-clause anonymous functions with more than one argument

`fn { … }` is fixed at arity 1 (the parser comment says so). Folds and
comparators want two:

```bea
list.fold(items, 0, fn {
  acc, Item(price:, ..) if price > 100 -> acc + 1
  acc, _ -> acc
})
```

Infer the arity from the first clause's pattern count and lower to
`fn(a, b) { case a, b { … } }`, which mirrors multi-subject `case`. Today's
error also leaks the desugaring ("this case has 1 subject(s)"); it should talk
about the function's parameters.

### 8. Script mode compiles every `.bea` in the folder

`bea run file.bea` treats the folder as `src/`, so one broken file anywhere in
it stops every other file from running. Compiling only the requested file and
the modules it imports would make scratch folders and exercise directories much
friendlier.

## Generated Gleam

The selling point is "the Gleam you would have written". A few small things
make the output look generated:

### 9. Use label shorthand in output

`Server(host:, port:)` in Bea becomes `Server(host: host, port: port)`. Gleam
has supported `Server(host:, port:)` since 1.4, so emit it whenever the value
is a variable with the label's name.

### 10. Better names for synthesised variables

- Multi-clause functions name their parameter `arg_0` even when every clause
  binds the same name in that position (`fizzbuzz(n)` → `fn fizzbuzz(arg_0)` with
  `n -> …` in each arm). Reuse the shared name, or the label from the
  body-less head when there is one.
- Counters like `bea_try_404`, `bea_param_137` and `bea_continue_250` come from
  source offsets, so an unrelated edit renames them and makes diffs of ejected
  code noisy. Number them per function instead (`try_1`, `try_2`).

### 11. Continuations for `return` inside an assigned `case`

```bea
[host, port] = case string.split(line, ":") {
  [h, p] -> [h, p]
  _ -> {
    return Error("expected host:port")
  }
}
```

becomes a `bea_continue_250 = fn(bea_value_250) { … }` closure plus a
`let assert`. That's correct, but when the returning arms are the minority, it
would read better to push the rest of the function into the non-returning arms
(`[h, p] -> { … rest … }`), which is what a person would write.

## Make the compiler core a supported JS target

The lexer, parser, lowering, codegen, formatter, diagnostics and source map are
pure Gleam with no Erlang FFI. The website's playground compiles them to
JavaScript unchanged (53 KB gzipped) and its output is byte-identical to the CLI
for all 24 examples, both for transpiling and formatting.

Worth doing upstream:

- Add the entry module (`website/playground-engine/src/bea_web.gleam`, 25
  lines) to the repo, and a CI step that builds it with
  `--target javascript`, so the core stays pure and the playground can't
  silently break.
- Publish it to npm as `@bea-lang/compiler` for editor plugins, docs tooling
  and anyone who wants Bea in a browser.
- Next step for the playground: Gleam's own tour runs the Gleam compiler as
  WebAssembly. Feeding the generated Gleam into that would give type checking
  and running in the browser, with no server.

## Housekeeping

- **Licence.** The repo has no `LICENCE` file. Add one before people depend on
  it; `bea publish` and Hex will want it too.
- **Versions.** `gleam.toml` says `version = "1.0.0"`; the CLI and VS Code
  extension say `0.2.0`. Pick one; the site calls it a beta.
- **Releases.** There's no prebuilt `bea` binary yet, which is why the site has
  no install page. A GitHub release with an escript or gleepack binary per
  platform, plus a one-line install script, would let the site add a "Get
  started" page.
- **beacode's stdlib bound.** `beacode/bea.toml` allows
  `gleam_stdlib >= 0.44.0`, but the code relies on 1.x behaviour (for example,
  `list.range` is gone in 1.0 and `int.range` takes a reducer). `>= 1.0.0` would
  match what is tested.
- **README positioning of `use`.** The README says `use` "works exactly as in
  Gleam", which is right, but the pitch is that you rarely need it. The site
  says Bea makes `use` optional for control flow (`return` and `?` cover the
  common cases) while keeping it for APIs built around it (decoders, wisp). The
  README could say the same.
