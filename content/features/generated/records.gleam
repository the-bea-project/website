//// A type with one constructor, named like the type, can list its fields
//// in braces: a record.

import gleam/int

pub type Point {
  Point(x: Float, y: Float)
}

pub type Player {
  Player(name: String, level: Int, position: Point)
}

/// Generic records name their parameters, like any other type.
pub type Page(item) {
  Page(items: List(item), number: Int, total: Int)
}

/// A value without a label is written in full.
pub type UserId {
  UserId(Int)
}

pub fn describe(arg_0) -> String {
  case arg_0 {
    Player(name: name, level: level, ..) ->
      name <> ", level " <> int.to_string(level)
  }
}

pub fn move(player: Player, dx: Float) -> Player {
  Player(
    ..player,
    position: Point(..player.position, x: player.position.x +. dx),
  )
}

pub fn main() {
  let ada = Player(name: "Ada", level: 3, position: Point(0.0, 0.0))
  echo describe(ada)
  echo move(ada, 2.5).position
  echo Page(items: [UserId(1), UserId(2)], number: 1, total: 2)
}
