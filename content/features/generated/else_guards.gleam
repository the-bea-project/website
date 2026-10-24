//// `else` guards: an assignment that has to match, and what to return when
//// it doesn't. Each check reads top to bottom, and the rest of the
//// function stays flat.

import gleam/dict.{type Dict}
import gleam/int
import gleam/io
import gleam/list
import gleam/result.{try as bea_result_try}

pub type User {
  User(name: String, age: Int)
}

pub type Problem {
  Missing(field: String)
  NotANumber(text: String)
  TooYoung(age: Int)
}

/// A boolean guard: the condition must hold.
fn check_age(age: Int) -> Result(Int, Problem) {
  case age >= 18 {
    True -> Ok(age)
    False -> Error(TooYoung(age))
  }
}

/// A pattern guard: `Ok(name)` must match, or the function returns.
/// With `?`, the pattern is for the `Ok` value and `else` can bind the error.
pub fn sign_up(form: Dict(String, String)) -> Result(User, Problem) {
  case dict.get(form, "name") {
    Ok(name) ->
      case dict.get(form, "age") {
        Ok(text) ->
          case int.parse(text) {
            Ok(age) -> {
              use age <- bea_result_try(check_age(age))
              Ok(User(name: name, age: age))
            }
            Error(_) -> Error(NotANumber(text))
          }
        _ -> Error(Missing("age"))
      }
    _ -> Error(Missing("name"))
  }
}

/// `else` can bind what didn't match. Here the error is turned into text.
pub fn greeting(form: Dict(String, String)) -> String {
  case sign_up(form) {
    Ok(User(name: name, ..)) -> "welcome, " <> name
    Error(problem) -> explain(problem)
  }
}

fn explain(problem: Problem) -> String {
  case problem {
    Missing(field) -> field <> " is missing"
    NotANumber(text) -> text <> " is not a number"
    TooYoung(age) -> "come back in " <> int.to_string(18 - age) <> " years"
  }
}

/// Any pattern works, lists included.
pub fn first_adult(users: List(User)) -> String {
  case list.filter(users, fn(u) { u.age >= 18 }) {
    [adult, ..] -> adult.name
    _ -> "nobody"
  }
}

/// `use` still works: it suits code that wraps the rest of the function,
/// like this logging (on stderr, with `echo`).
fn logged(label: String, next: fn() -> a) -> a {
  io.println_error("-> " <> label)
  let result = next()
  io.println_error("<- " <> label)
  result
}

pub fn main() {
  use <- logged("sign up")
  echo greeting(dict.from_list([#("name", "Ada"), #("age", "36")]))
  echo greeting(dict.from_list([#("name", "Bea"), #("age", "two")]))
  echo greeting(dict.from_list([#("name", "Kit"), #("age", "15")]))
  echo greeting(dict.from_list([#("age", "40")]))
  echo first_adult([User("Kit", 15), User("Ada", 36)])
}
