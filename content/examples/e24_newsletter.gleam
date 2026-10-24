import gleam/list
import gleam/result
import gleam/string
import simplifile

pub fn read_emails(path: String) -> Result(List(String), Nil) {
  use data_str <- result.try(simplifile.read(path) |> result.replace_error(Nil))
  data_str |> string.trim |> string.split("\n") |> fn(x) { Ok(x) }
}

pub fn create_log_file(path: String) -> Result(Nil, Nil) {
  simplifile.write(path, "") |> result.replace_error(Nil)
}

pub fn log_sent_email(path: String, email: String) -> Result(Nil, Nil) {
  simplifile.append(path, email <> "\n") |> result.replace_error(Nil)
}

fn try_send(email, send_fn, log_path) {
  case send_fn(email) == Ok(Nil) {
    True -> log_sent_email(log_path, email)
    False -> Error(Nil)
  }
}

pub fn send_newsletter(
  emails_path: String,
  log_path: String,
  send_email: fn(String) -> Result(Nil, Nil),
) -> Result(Nil, Nil) {
  use emails <- result.try(read_emails(emails_path))
  use _ <- result.try(create_log_file(log_path))
  let _ = list.each(emails, fn(email) { try_send(email, send_email, log_path) })
  Ok(Nil)
}
