import gleam/string

fn message(log_line: String) -> String {
  let assert [_, message] = string.split(log_line, ": ")
  message |> string.trim()
}

fn log_level(log_line: String) -> String {
  let assert [level, ..] = log_line |> string.split(": ")
  level
  |> string.replace("[", "")
  |> string.replace("]", "")
  |> string.lowercase()
}

fn reformat(log_line: String) -> String {
  let m = message(log_line)
  let l = log_level(log_line)
  m <> " (" <> l <> ")"
}

pub fn main() {
  echo message("[WARNING]:  Disk almost full\r\n")
  echo log_level("[ERROR]: Invalid operation")
  echo reformat("[INFO]: Operation completed")
}
