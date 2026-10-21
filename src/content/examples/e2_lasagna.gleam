fn expected_minutes_in_oven() {
  40
}

fn remaining_minutes_in_oven(actual_minutes_in_oven: Int) {
  expected_minutes_in_oven() - actual_minutes_in_oven
}

fn preparation_time_in_minutes(layers: Int) {
  2 * layers
}

fn total_time_in_minutes(layers: Int, actual_minutes_in_oven: Int) {
  preparation_time_in_minutes(layers) + actual_minutes_in_oven
}

fn alarm() {
  "Ding!"
}

pub fn main() {
  echo expected_minutes_in_oven()
  echo remaining_minutes_in_oven(29)
  echo preparation_time_in_minutes(2)
  echo total_time_in_minutes(2, 3)
  echo alarm()
}
