import gleam/result

pub type Player {
  Black
  White
}

pub type Game {
  Game(
    white_captured_stones: Int,
    black_captured_stones: Int,
    player: Player,
    error: String,
  )
}

fn apply_rules(
  game: Game,
  rule1: fn(Game) -> Result(Game, String),
  rule2: fn(Game) -> Game,
  rule3: fn(Game) -> Result(Game, String),
  rule4: fn(Game) -> Result(Game, String),
) {
  let outcome =
    game
    |> rule1()
    |> result.map(rule2)
    |> result.try(rule3)
    |> result.try(rule4)
  case outcome {
    Ok(updated_game) -> {
      let updated_player = case updated_game.player {
        Black -> White
        _ -> Black
      }
      Game(..updated_game, player: updated_player)
    }
    Error(s) -> Game(..game, error: s)
  }
}

pub fn main() {
  let initial_game = Game(
    white_captured_stones: 0,
    black_captured_stones: 0,
    player: Black,
    error: "",
  )
  let r1 = fn(g: Game) { Ok(g) }
  let r2 = fn(g: Game) { Game(..g, white_captured_stones: 2) }
  let r3 = fn(g: Game) { Ok(g) }
  let r4 = fn(g: Game) { Ok(g) }
  echo apply_rules(initial_game, r1, r2, r3, r4)
}
