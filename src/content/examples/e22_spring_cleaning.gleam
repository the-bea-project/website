import gleam/string

pub fn extract_error(problem: Result(a, b)) -> b {
  let assert Error(v) = problem
  v
}

pub fn remove_team_prefix(arg_0: String) -> String {
  case arg_0 {
    "Team " <> name -> name
    name -> name
  }
}

pub fn split_region_and_team(combined: String) -> #(String, String) {
  let assert [p1, p2] = combined |> string.split(",")
  #(p1, remove_team_prefix(p2))
}

pub fn main() {
  echo extract_error(Error("Not enough coffee"))
  echo remove_team_prefix("Team Turtle")
  echo split_region_and_team("East,Team Orange")
}
