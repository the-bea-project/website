pub type TreasureChest(t) {
  TreasureChest(String, t)
}

pub type UnlockedResult(t) {
  Unlocked(t)
  WrongPassword
}

fn get_treasure(
  chest: TreasureChest(treasure),
  password: String,
) -> UnlockedResult(treasure) {
  let TreasureChest(s, t) = chest
  case s == password {
    True -> Unlocked(t)
    False -> WrongPassword
  }
}

pub fn main() {
  echo get_treasure(TreasureChest("SomePass", #("a", 2)), "SomePass")
}
