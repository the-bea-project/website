import gleam/bool
import gleam/set.{type Set}
import gleam/string

pub fn new_collection(card: String) -> Set(String) {
  set.from_list([card])
}

pub fn add_card(collection: Set(String), card: String) -> #(Bool, Set(String)) {
  use <- bool.guard(
    when: set.contains(collection, card),
    return: #(True, collection),
  )
  collection |> set.insert(card) |> fn(x) { #(False, x) }
}

pub fn trade_card(
  my_card: String,
  their_card: String,
  collection: Set(String),
) -> #(Bool, Set(String)) {
  let transaction = collection |> set.delete(my_card) |> set.insert(their_card)
  case set.contains(collection, their_card) {
    True -> #(False, transaction)
    False ->
      case !set.contains(collection, my_card) {
        True -> #(False, transaction)
        False -> #(True, transaction)
      }
  }
}

fn find_boring(arg_0: List(Set(String)), acc: Set(String)) {
  case arg_0 {
    [] -> acc
    [head, ..tail] -> {
      let acc = set.intersection(acc, head)
      find_boring(tail, acc)
    }
  }
}

pub fn boring_cards(arg_0: List(Set(String))) -> List(String) {
  case arg_0 {
    [] -> []
    [head, ..tail] -> find_boring(tail, head) |> set.to_list()
  }
}

fn make_union(arg_0, acc) {
  case arg_0 {
    [] -> acc
    [head, ..tail] -> {
      let acc = set.union(acc, head)
      make_union(tail, acc)
    }
  }
}

pub fn total_cards(collections: List(Set(String))) -> Int {
  collections |> make_union(set.new()) |> set.size()
}

pub fn shiny_cards(collection: Set(String)) -> Set(String) {
  set.filter(collection, fn(x) { string.contains(x, "Shiny ") })
}

pub fn main() {
  echo new_collection("Newthree")
  echo add_card(set.from_list(["Newthree"]), "Scientuna")
  echo trade_card("Scientuna", "Newthree", set.from_list(["Scientuna"]))
  echo boring_cards(
    [set.from_list(["Scientuna"]), set.from_list(["Newthree", "Scientuna"])],
  )
  echo total_cards(
    [set.from_list(["Scientuna"]), set.from_list(["Newthree", "Scientuna"])],
  )
  echo shiny_cards(set.from_list(["Newthree", "Scientuna", "Shiny Scientuna"]))
}
