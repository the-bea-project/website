import gleam/int
import gleam/list

fn fizzbuzz(arg_0: Int) -> String {
  case arg_0 {
    n if n % 15 == 0 -> "FizzBuzz"
    n if n % 3 == 0 -> "Fizz"
    n if n % 5 == 0 -> "Buzz"
    n -> int.to_string(n)
  }
}

pub fn main() {
  [9, 10, 14, 15] |> list.map(fizzbuzz) |> echo
}
