fn new() {
  []
}

fn existing() -> List(String) {
  ["Bea", "Gleam", "Go", "Rust"]
}

fn add_language(languages: List(String), language: String) -> List(String) {
  [language, ..languages]
}

fn count_languages(arg_0: List(String), sum: Int) -> Int {
  case arg_0 {
    [] -> sum
    [_, ..tail] -> count_languages(tail, sum + 1)
  }
}

pub fn main() {
  echo new()
  echo existing()
  echo add_language(["OCaml", "Gleam"], "Bea")
  echo count_languages(["jq", "Elm", "Rust", "Kotlin"], 0)
}
