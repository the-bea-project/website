import gleam/float
import gleam/int
import gleam/io

fn pence_to_pounds(pence: Int) -> Float {
  int.to_float(pence) *. 0.01
}

fn pounds_to_string(pounds: Float) -> String {
  "£" <> float.to_string(pounds)
}

pub fn main() {
  106.0 |> pounds_to_string() |> io.println()
  21 |> pence_to_pounds() |> float.to_string() |> echo
}
