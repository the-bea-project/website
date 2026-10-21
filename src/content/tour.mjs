// The language tour. Each lesson is one exercism exercise solved in Bea
// (from bea/beacode/src, synced into ./examples by scripts/sync-examples.sh).
//
// `file`   example file name without extension
// `title`  the exercism exercise name
// `teaches` short list shown under the title
// `notes`  HTML, written for someone meeting Bea for the first time

export const chapters = [
  { title: "First steps", lessons: ["e1_hello_world", "e2_lasagna", "e3_pacman_rules", "e4_bettys_bikeshop"] },
  { title: "Making decisions", lessons: ["e5_guessing_game", "e6_tisbury_treasure", "e7_tracks_on_tracks", "e8_log_levels"] },
  { title: "Your own types", lessons: ["e9_valentines_day", "e10_bandwagoner", "e11_bird_count", "e12_pizza_pricing"] },
  { title: "Functions as values", lessons: ["e13_secrets", "e14_highschool_sweetheart", "e15_treasure_chest", "e16_go"] },
  { title: "Collections", lessons: ["e17_high_score_board", "e18_weather_ranking", "e19_wine_cellar", "e20_gotta_snatch_em_all"] },
  { title: "Patterns all the way down", lessons: ["e21_role_playing", "e22_spring_cleaning", "e23_dna_encoding", "e24_newsletter"] },
];

export const lessons = {
  e1_hello_world: {
    slug: "hello-world",
    title: "Hello, World!",
    teaches: ["def", "echo"],
    notes: `
<p>Every Bea program starts at a public function called <code>main</code>.
Functions are declared with <code>def</code>, and <code>pub</code> makes one
visible outside its module.</p>
<p><code>echo</code> prints any value along with the file and line it came
from, which makes it the quickest way to look inside a program. It is
Gleam's <code>echo</code>, unchanged.</p>
<p>Switch to the <strong>Gleam</strong> tab: the only difference is
<code>def</code> becoming <code>fn</code>. Bea is Gleam with a different
surface, so that is what most of this tour will keep showing you.</p>`,
  },
  e2_lasagna: {
    slug: "lasagna",
    title: "Lasagna",
    teaches: ["functions", "Int", "type annotations"],
    notes: `
<p>A function's last expression is its result; there is no
<code>return</code> needed for the normal case. Parameters can carry type
annotations like <code>layers: Int</code>, and Gleam's type checker infers
the rest.</p>
<p>Functions without <code>pub</code> are private to the module. Calling one
looks like you would expect: <code>preparation_time_in_minutes(2)</code>.</p>`,
  },
  e3_pacman_rules: {
    slug: "pacman-rules",
    title: "Pac-Man rules",
    teaches: ["Bool", "and / or / not", "imports"],
    notes: `
<p>Bea spells boolean logic as words: <code>and</code>, <code>or</code> and
<code>not</code>. They become Gleam's <code>&amp;&amp;</code>,
<code>||</code> and <code>!</code>, and they short-circuit the same way.</p>
<p><code>import gleam/io</code> brings in the standard library's IO module.
You can skip imports for the standard library entirely: Bea adds
<code>list</code>, <code>string</code>, <code>int</code> and friends
automatically when you use them.</p>`,
  },
  e4_bettys_bikeshop: {
    slug: "bettys-bike-shop",
    title: "Betty's bike shop",
    teaches: ["Float", "pipes", "interpolation"],
    notes: `
<p>Floats have their own operators, like <code>*.</code> and
<code>+.</code>, so an <code>Int</code> never turns into a
<code>Float</code> by accident.</p>
<p>The pipe <code>|&gt;</code> passes the value on its left as the first
argument of the call on its right. Read it top to bottom: take
<code>21</code>, convert it to pounds, turn that into a string, print it.</p>
<p><code>"£#{float.to_string(pounds)}"</code> is string interpolation: any
<code>String</code> expression can go inside <code>#{…}</code>. Gleam has no
interpolation, so it becomes <code>"£" &lt;&gt; …</code>.</p>`,
  },
  e5_guessing_game: {
    slug: "guessing-game",
    title: "Guessing game",
    teaches: ["return", "cond", "case", "guards"],
    notes: `
<p>The same function written three ways. Each is a good fit somewhere.</p>
<p><strong>Early return.</strong> <code>reply_if</code> checks a condition
and leaves straight away. In Gleam this needs
<code>use &lt;- bool.guard(…)</code>; in Bea it is just
<code>return</code>. The returned value is only computed when the branch is
taken.</p>
<p><strong>cond.</strong> A list of conditions, and the first true one wins.
<code>_</code> or <code>True</code> is the fallback.</p>
<p><strong>case.</strong> Pattern matching on the value itself:
<code>41 | 43</code> matches either number and
<code>g if g &gt; 42</code> adds a guard.</p>`,
  },
  e6_tisbury_treasure: {
    slug: "tisbury-treasure",
    title: "Tisbury treasure hunt",
    teaches: ["tuples", "anonymous functions"],
    notes: `
<p>Tuples are written with plain parentheses: <code>("B", 4)</code>. Read a
field by position with <code>.0</code>, <code>.1</code> and so on. They
compile to Gleam's <code>#(…)</code>.</p>
<p><code>fn(x) { x.1 == treasure_location }</code> is an anonymous function,
handed to <code>list.count</code> to decide which treasures match.</p>`,
  },
  e7_tracks_on_tracks: {
    slug: "tracks-on-tracks",
    title: "Tracks on tracks on tracks",
    teaches: ["lists", "multi-clause functions"],
    notes: `
<p><code>[language | languages]</code> builds a new list with one more item
at the front. The same shape works as a pattern, which is how
<code>count_languages</code> walks a list.</p>
<p>This is the first <strong>multi-clause function</strong>. The body-less
line declares the types once. Then each <code>def</code> handles one shape
of input: the empty list, or a list with a head and a tail. Bea joins the
clauses into a single Gleam function with a <code>case</code>, so the
recursion stays tail-call optimised.</p>`,
  },
  e8_log_levels: {
    slug: "log-levels",
    title: "Log levels",
    teaches: ["strings", "destructuring"],
    notes: `
<p>There is no <code>let</code> in Bea. <code>m = message(log_line)</code>
binds a name, and a pattern on the left destructures:
<code>[_, message] = string.split(log_line, ": ")</code>.</p>
<p>That pattern could fail if the line has no <code>": "</code>, so Bea
emits <code>let assert</code> for it. When a pattern can't fail, you get a
plain <code>let</code>. You never have to choose.</p>`,
  },
  e9_valentines_day: {
    slug: "valentines-day",
    title: "Valentine's day",
    teaches: ["custom types", "case", "guards"],
    notes: `
<p><code>pub type Activity { … }</code> defines a custom type: a value is
exactly one of its variants, and some variants carry data, like
<code>Movie(Genre)</code> or <code>Walk(Int)</code>.</p>
<p><code>case</code> takes them apart. Patterns nest
(<code>Movie(Romance)</code>), guards refine them
(<code>Walk(k) if k &gt; 11</code>), and the compiler checks that every
possibility is handled.</p>`,
  },
  e10_bandwagoner: {
    slug: "bandwagoner",
    title: "Bandwagoner",
    teaches: ["records", "record update", "label shorthand"],
    notes: `
<p>A variant with named fields is a record. <code>Coach(name:,
former_player:)</code> uses the label shorthand: when a variable has the
same name as the field, you write the label once.</p>
<p><code>Team(team | coach:)</code> copies <code>team</code> with a new
coach. It reads like Elixir's map update and compiles to Gleam's
<code>Team(..team, coach: coach)</code>.</p>
<p>Fields chain with dots: <code>team.coach.name</code>.</p>`,
  },
  e11_bird_count: {
    slug: "bird-count",
    title: "Bird count",
    teaches: ["recursion", "clause guards"],
    notes: `
<p>Multi-clause functions can have guards. In
<code>has_day_without_birds</code>, the second clause only applies
<code>if head == 0</code>; otherwise matching falls through to the next
clause.</p>
<p>Notice that <code>today</code> and <code>increment_day_count</code> need
no type annotations at all. Gleam infers them from the patterns.</p>`,
  },
  e12_pizza_pricing: {
    slug: "pizza-pricing",
    title: "Pizza pricing",
    teaches: ["recursive types", "maps", "?"],
    notes: `
<p><code>ExtraSauce(Pizza)</code> holds another pizza, so a pizza can be
wrapped any number of times. The price function peels one layer per call.</p>
<p><code>%{Margherita: 7, …}</code> is a map literal, compiled to
<code>dict.from_list</code>.</p>
<p><code>dict.get(price_map, p)?</code> uses the <code>?</code> operator: if
the lookup is <code>Ok</code>, you get the value; if it is
<code>Error</code>, the whole function returns that error immediately.
It works in the middle of an expression, here even inside a
<code>case</code> branch.</p>`,
  },
  e13_secrets: {
    slug: "secrets",
    title: "Secrets",
    teaches: ["closures", "function types"],
    notes: `
<p>Functions are values. <code>secret_add(2)</code> returns a new function
that remembers <code>n</code>; that is a closure.</p>
<p>The return type <code>fn (x: Int) -&gt; Int</code> spells out "a function
from Int to Int". <code>secret_combine</code> takes two of them and pipes
a value through both.</p>`,
  },
  e14_highschool_sweetheart: {
    slug: "high-school-sweetheart",
    title: "High school sweetheart",
    teaches: ["string functions", "multi-line strings"],
    notes: `
<p>Pipelines can span several lines; a line that starts with
<code>|&gt;</code> continues the expression above it.</p>
<p><code>Ok(first) = … |&gt; string.first()</code> asserts that the name
isn't empty. Strings can span lines, and interpolation works inside them,
which is how the initials land in the middle of the heart.</p>`,
  },
  e15_treasure_chest: {
    slug: "treasure-chest",
    title: "Treasure chest",
    teaches: ["generics", "cond"],
    notes: `
<p><code>TreasureChest(t)</code> is generic: <code>t</code> stands for any
type, chosen by whoever builds the chest. Here it holds a tuple, but it
could hold anything.</p>
<p><code>cond</code> compiles to nested <code>case</code> expressions on
<code>True</code>/<code>False</code>; you write the flat version.</p>`,
  },
  e16_go: {
    slug: "go",
    title: "Go",
    teaches: ["Result", "result.try", "record update"],
    notes: `
<p>Rules return <code>Result(Game, String)</code>: either an updated game
or a reason the move is illegal. <code>result.map</code> and
<code>result.try</code> chain them so the first error stops the rest.</p>
<p>Anonymous functions can annotate their parameters too:
<code>fn(g: Game) { … }</code>.</p>`,
  },
  e17_high_score_board: {
    slug: "high-score-board",
    title: "High score board",
    teaches: ["dicts", "type aliases", "Option"],
    notes: `
<p><code>pub type Scores = Dict(String, Int)</code> gives a long type a
short name.</p>
<p><code>Some</code>, <code>None</code> and <code>Dict</code> appear without
any import: Bea adds the right imports for standard library names when you
use them, and it is scope aware, so a variable called <code>list</code> is
never mistaken for the module.</p>`,
  },
  e18_weather_ranking: {
    slug: "weather-ranking",
    title: "Weather ranking",
    teaches: ["multi-clause on several arguments", "Order"],
    notes: `
<p><code>compare_temperature</code> matches on <em>both</em> arguments at
once. Each clause handles one combination of units, converts, and calls
itself again until both are Celsius.</p>
<p><code>list.sort(cities, _)</code> is a function capture: the
<code>_</code> marks where the piped value goes.</p>`,
  },
  e19_wine_cellar: {
    slug: "wine-cellar",
    title: "Wine cellar",
    teaches: ["labelled arguments", "guards on fields"],
    notes: `
<p><code>color color: Color</code> gives the parameter an outside label
(<code>color</code>) and an inside name. Callers write
<code>wines_of_color(wines, color: White)</code>, so the call reads clearly.</p>
<p>Clause guards can look into the matched value:
<code>if head.color == color</code>. Types can also be declared after
the functions that use them.</p>`,
  },
  e20_gotta_snatch_em_all: {
    slug: "gotta-snatch-em-all",
    title: "Gotta snatch 'em all",
    teaches: ["sets", "early return", "patterns in clause heads"],
    notes: `
<p><code>add_card</code> returns early when the card is already in the
collection, then carries on with the normal path. Without
<code>return</code> this would be a <code>case</code> on a boolean.</p>
<p><code>boring_cards([head | tail]: List(Set(String)))</code> pattern
matches and annotates the parameter in the same place.</p>`,
  },
  e21_role_playing: {
    slug: "role-playing",
    title: "Role playing game",
    teaches: ["partial record patterns", "as", "Option"],
    notes: `
<p>This one shows off Bea's record patterns. <code>Player(name: None |
_)</code> matches any player whose name is <code>None</code> and ignores
the other fields. The <code>| _</code> means "and the rest".</p>
<p><code>as p</code> keeps the whole value while you take it apart, so
<code>Player(p | health: 100)</code> can rebuild it with one field changed.
Guards still apply: <code>revive</code> treats high-level players
differently.</p>`,
  },
  e22_spring_cleaning: {
    slug: "spring-cleaning",
    title: "Spring cleaning",
    teaches: ["let assert", "string prefix patterns"],
    notes: `
<p><code>Error(v) = problem</code> asserts that <code>problem</code> is an
error; if it isn't, the program crashes with a clear message. Use this
when a failure would be a bug.</p>
<p><code>"Team " &lt;&gt; name</code> is a string prefix pattern, right in a
function head: the first clause strips the prefix, the second catches every
other string.</p>`,
  },
  e23_dna_encoding: {
    slug: "dna-encoding",
    title: "DNA encoding",
    teaches: ["bit arrays", "binary literals"],
    notes: `
<p>Each nucleotide fits in two bits. <code>&lt;&lt;acc:bits,
encode_nucleotide(nucleotide):2&gt;&gt;</code> appends two bits to a bit
array.</p>
<p>Decoding runs the other way: every clause of <code>do_decode</code>
matches two bits off the front with <code>&lt;&lt;0b01:2,
rest:bits&gt;&gt;</code>. Bit-level parsing ends up looking like a
table.</p>`,
  },
  e24_newsletter: {
    slug: "newsletter",
    title: "Newsletter",
    teaches: ["?", "Hex packages", "files"],
    notes: `
<p>This one uses <a href="https://hex.pm/packages/simplifile">simplifile</a>,
a Gleam package from Hex. <code>bea add simplifile</code> puts it in
<code>bea.toml</code>, and from then on it is an ordinary import.</p>
<p><code>emails = read_emails(emails_path)?</code> is the <code>?</code>
operator at its most useful: each step either gives you its value or
stops the function with its error. The Gleam tab shows the
<code>use … &lt;- result.try(…)</code> chain you didn't have to write.</p>
<p>This module is a library with no <code>main</code>, so there is no
output to show.</p>`,
  },
};
