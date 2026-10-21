import gleam/bool

fn reply(guess: Int) -> String {
  use <- bool.guard(when: guess == 42, return: "Correct")
  use <- bool.guard(when: guess == 41 || guess == 43, return: "So close")
  use <- bool.guard(when: guess > 42, return: "Too high")
  "Too low"
}

pub fn main() {
  echo [reply(42), reply(43), reply(99), reply(1)]
}
