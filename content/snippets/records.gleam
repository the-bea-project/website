import gleam/option.{type Option, None, Some}

pub type Player {
  Player(name: Option(String), level: Int, health: Int, mana: Option(Int))
}

pub fn revive(arg_0) {
  case arg_0 {
    Player(health: 0, level: l, ..) as p if l >= 10 ->
      Some(Player(..p, health: 100, mana: Some(100)))
    Player(health: 0, ..) as p -> Some(Player(..p, health: 100))
    _ -> None
  }
}

pub fn main() {
  echo revive(Player(name: None, level: 12, health: 0, mana: None))
}
