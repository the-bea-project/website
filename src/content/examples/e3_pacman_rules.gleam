import gleam/io

fn eat_ghost(power_pellet_active: Bool, touching_ghost: Bool) -> Bool {
  touching_ghost && power_pellet_active
}

fn score(touching_power_pellet: Bool, touching_ghost: Bool) -> Bool {
  touching_ghost || touching_power_pellet
}

fn lose(power_pellet_active: Bool, touching_ghost) -> Bool {
  touching_ghost && !power_pellet_active
}

pub fn main() {
  echo eat_ghost(True, False)
  echo score(False, True)
  echo lose(True, True)
  io.println("Done!")
}
