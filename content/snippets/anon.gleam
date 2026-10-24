import gleam/list

pub type Event {
  Click(x: Int, y: Int)
  Key(String)
  Tick
}

pub fn main() {
  [Click(3, 3), Key("q"), Key("j"), Tick]
  |> list.map(
    fn(bea_param_138) {
      case bea_param_138 {
        Click(x, y) if x == y -> "diagonal click"
        Click(..) -> "click"
        Key("q") -> "quit"
        Key(k) -> "key " <> k
        Tick -> "tick"
      }
    },
  )
  |> echo
}
