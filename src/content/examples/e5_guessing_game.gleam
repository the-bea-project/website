import gleam/bool

fn reply_if(guess: Int) -> String {
  use <- bool.guard(when: guess == 42, return: "Correct")
  use <- bool.guard(when: guess == 41 || guess == 43, return: "So close")
  use <- bool.guard(when: guess > 42, return: "Too high")
  "Too low"
}

fn reply_cond(guess: Int) -> String {
  case guess == 42 {
    True -> "Correct"
    False ->
      case guess == 41 || guess == 42 {
        True -> "So close"
        False ->
          case guess > 42 {
            True -> "Too high"
            False -> "Too low"
          }
      }
  }
}

fn reply_case(guess: Int) -> String {
  case guess {
    42 -> "Correct"
    41 | 43 -> "So close"
    g if g > 42 -> "Too high"
    _ -> "Too low"
  }
}

pub fn main() {
  reply_if(46) |> echo
  reply_cond(42) |> echo
  reply_case(21) |> echo
}
