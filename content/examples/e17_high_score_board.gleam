import gleam/dict.{type Dict}
import gleam/option.{None, Some}

pub type Scores =
  Dict(String, Int)

fn create_score_board() {
  dict.from_list([#("The Best Ever", 1_000_000)])
}

fn add_player(scores: Scores, name: String, score: Int) -> Scores {
  dict.insert(scores, name, score)
}

fn remove_player(scores: Scores, name: String) -> Scores {
  dict.delete(scores, name)
}

fn update_score(scores: Scores, name: String, score: Int) -> Scores {
  let update_fn = fn(x) {
    case x {
      Some(value) -> value + score
      None -> score
    }
  }
  dict.upsert(scores, name, update_fn)
}

fn apply_monday_bonus(scores: Scores) -> Scores {
  dict.map_values(scores, fn(_k, v) { v + 100 })
}

pub fn main() {
  create_score_board()
  |> add_player("James Pazo", 12)
  |> remove_player("James Pazo")
  |> update_score("The Best Ever", 3)
  |> apply_monday_bonus()
  |> echo
}
