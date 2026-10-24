import gleam/bool
import gleam/float
import gleam/list

pub type Shape {
  Circle(r: Float)
  Rect(w: Float, h: Float)
}

pub fn area(arg_0) {
  case arg_0 {
    Circle(r) -> 3.14 *. r *. r
    Rect(w, h) -> w *. h
  }
}

pub fn describe(shapes: List(Shape)) -> Result(String, String) {
  use <- bool.guard(when: shapes == [], return: Error("no shapes"))
  let total = shapes |> list.map(area) |> float.sum
  Ok("total area: " <> float.to_string(total))
}

pub fn main() {
  describe([Circle(1.0), Rect(2.0, 3.0)]) |> echo
}
