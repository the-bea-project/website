import gleam/int
import gleam/list

fn today(arg_0) {
  case arg_0 {
    [] -> 0
    [head, ..] -> head
  }
}

fn increment_day_count(arg_0) {
  case arg_0 {
    [] -> [1]
    [head, ..tail] -> [head + 1, ..tail]
  }
}

fn has_day_without_birds(arg_0: List(Int)) -> Bool {
  case arg_0 {
    [] -> False
    [head, .._tail] if head == 0 -> True
    [_head, ..tail] -> has_day_without_birds(tail)
  }
}

fn total(days: List(Int)) -> Int {
  int.sum(days)
}

fn busy_days(days: List(Int)) -> Int {
  days |> list.count(fn(x) { x >= 5 })
}

pub fn main() {
  echo today([2, 5, 1])
  echo increment_day_count([4, 0, 2])
  echo has_day_without_birds([3, 8, 1, 0])
  echo total([4, 0, 9, 0, 5])
  echo busy_days([4, 5, 0, 0, 6])
}
