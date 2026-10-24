import gleam/option.{type Option, None, Some}

pub type Player {
  Player(name: Option(String), level: Int, health: Int, mana: Option(Int))
}

pub fn introduce(arg_0) {
  case arg_0 {
    Player(name: None, ..) -> "Mighty Magician"
    Player(name: Some(v), ..) -> v
  }
}

pub fn revive(arg_0) {
  case arg_0 {
    Player(health: 0, level: l, ..) as p if l >= 10 ->
      Some(Player(..p, health: 100, mana: Some(100)))
    Player(health: 0, ..) as p -> Some(Player(..p, health: 100))
    _ -> None
  }
}

pub fn cast_spell(arg_0, cost) {
  case arg_0 {
    Player(mana: None, health: h, ..) as p -> {
      let updated_health = case h - cost < 0 {
        True -> 0
        False -> h - cost
      }
      #(Player(..p, health: updated_health), 0)
    }
    Player(mana: Some(m), ..) as p if m < cost -> #(p, 0)
    Player(mana: Some(m), ..) as p ->
      #(Player(..p, mana: Some(m - cost)), 2 * cost)
  }
}

pub fn main() {
  echo introduce(Player(name: None, level: 2, health: 8, mana: None))
  let dead_player = Player(name: None, level: 2, health: 0, mana: None)
  echo revive(dead_player)
  let alive_player = Player(name: None, level: 2, health: 42, mana: None)
  echo revive(alive_player)
  let wizard = Player(name: None, level: 18, health: 123, mana: Some(30))
  echo cast_spell(wizard, 14)
}
