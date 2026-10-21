fn secret_add(n: Int) -> fn(Int) -> Int {
  fn(x) { n + x }
}

fn secret_subtract(n: Int) -> fn(Int) -> Int {
  fn(x) { x - n }
}

fn secret_multiply(n: Int) -> fn(Int) -> Int {
  fn(x) { x * n }
}

fn secret_divide(n: Int) -> fn(Int) -> Int {
  fn(x) { x / n }
}

fn secret_combine(f1: fn(Int) -> Int, f2: fn(Int) -> Int) -> fn(Int) -> Int {
  fn(x) { x |> f1() |> f2() }
}

pub fn main() {
  let adder = secret_add(2)
  let subtractor = secret_subtract(2)
  let multiplier = secret_multiply(7)
  let divider = secret_divide(3)
  let combined = secret_combine(multiplier, divider)
  echo [adder(2), subtractor(3), combined(6)]
}
