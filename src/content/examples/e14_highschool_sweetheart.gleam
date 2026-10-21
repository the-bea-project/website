import gleam/io
import gleam/list
import gleam/string

fn cleanup(name: String) -> String {
  name |> string.trim()
}

fn first_letter(name: String) -> String {
  let assert Ok(first) = name |> cleanup() |> string.first()
  first
}

fn initial(name: String) -> String {
  name |> first_letter |> string.uppercase() <> "."
}

fn initials(fullname: String) -> String {
  fullname |> string.split(" ") |> list.map(initial) |> string.join(" ")
}

fn pair(fullname1: String, fullname2: String) -> String {
  "
      ******       ******
    **      **   **      **
  **         ** **         **
  **            *            **
  **                         **
  **     " <> initials(fullname1) <> "  +  " <> initials(fullname2) <> "     **
  **                       **
    **                   **
      **               **
        **           **
          **       **
            **   **
              ***
               *
  "
}

pub fn main() {
  pair("James Pazo", "Rachel Kiador") |> io.println()
}
