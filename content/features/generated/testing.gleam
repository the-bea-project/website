//// A module of the project and its tests: `bea test` runs
//// test/features_test.gleam, which tests Bea code from Gleam.

import gleam/int
import gleam/list
import gleam/string

pub fn slug(title: String) -> String {
  title
  |> string.lowercase
  |> string.split(" ")
  |> list.filter(fn(word) { word != "" })
  |> string.join("-")
}

/// The reading time of a text, in whole minutes, at least one.
pub fn minutes(text: String, words_per_minute: Int) -> Result(Int, String) {
  case words_per_minute > 0 {
    True -> {
      let words = text |> string.split(" ") |> list.count(fn(w) { w != "" })
      Ok(int.max(1, { words + words_per_minute - 1 } / words_per_minute))
    }
    False -> Error("words per minute must be positive")
  }
}
