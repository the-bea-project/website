import gleeunit
import testing

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn slug_test() {
  assert testing.slug("Hello, Bea World") == "hello,-bea-world"
  assert testing.slug("  spaces   everywhere ") == "spaces-everywhere"
}

pub fn minutes_test() {
  assert testing.minutes("one two three", 2) == Ok(2)
  assert testing.minutes("", 200) == Ok(1)
  assert testing.minutes("words", 0)
    == Error("words per minute must be positive")
}
