import gleam/bool
import gleam/dict
import gleam/int
import gleam/result

pub type Point {
  Point(x: Int, y: Int)
}

fn first(xs: List(Int)) -> Result(Int, Nil) {
  let assert [x, .._rest] = xs
  Ok(x)
}

fn demo(p: Point, name: String, raw: String) -> Result(Int, Nil) {
  let x = 1
  let pair = #(x, name)
  let hello = "Hi " <> name
  let scores = dict.from_list([#("bea", 1)])
  let moved = Point(..p, x: 1)
  use n <- result.try(int.parse(raw))
  use <- bool.guard(when: n < 0, return: Error(Nil))
  echo #(pair, hello, scores, moved)
  first([n])
}

pub fn main() {
  demo(Point(0, 0), "Bea", "4") |> echo
}
