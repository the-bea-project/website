import gleam/int
import gleam/result
import gleam/string

pub type Server {
  Server(host: String, port: Int)
}

fn parse_port(text: String) -> Result(Int, String) {
  int.parse(text) |> result.replace_error("not a port: " <> text)
}

fn check_host(host: String) -> Result(String, String) {
  case string.trim(host) {
    "" -> Error("missing host")
    h -> Ok(h)
  }
}

pub fn server(host: String, port: String) -> Result(Server, String) {
  use host <- result.try(check_host(host))
  use port <- result.try(parse_port(port))
  Ok(Server(host: host, port: port))
}

pub fn main() {
  [server("localhost", "8080"), server("localhost", "http")] |> echo
}
