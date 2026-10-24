import gleam/dict.{type Dict}
import gleam/int

pub type Order {
  Order(item: String, quantity: Int)
}

pub fn parse_order(form: Dict(String, String)) -> Result(Order, String) {
  case dict.get(form, "item") {
    Ok(item) ->
      case dict.get(form, "quantity") {
        Ok(text) ->
          case int.parse(text) {
            Ok(quantity) ->
              case quantity > 0 {
                True -> Ok(Order(item: item, quantity: quantity))
                False -> Error("at least one, please")
              }
            Error(_) -> Error(text <> " is not a number")
          }
        _ -> Error("how many?")
      }
    _ -> Error("pick something")
  }
}

pub fn main() {
  echo [
    parse_order(dict.from_list([#("item", "honey"), #("quantity", "2")])),
    parse_order(dict.from_list([#("item", "honey"), #("quantity", "lots")])),
    parse_order(dict.from_list([#("quantity", "1")])),
  ]
}
