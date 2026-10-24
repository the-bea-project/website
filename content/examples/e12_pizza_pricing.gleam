import gleam/dict
import gleam/result

pub type Pizza {
  Margherita
  Caprese
  Formaggio
  ExtraSauce(Pizza)
  ExtraToppings(Pizza)
}

fn price_map() {
  dict.from_list([#(Margherita, 7), #(Caprese, 9), #(Formaggio, 10)])
}

fn calc_pizza_price(p: Pizza, price_map, acc: Int) {
  case p {
    ExtraSauce(s) -> calc_pizza_price(s, price_map, acc + 1)
    ExtraToppings(s) -> calc_pizza_price(s, price_map, acc + 2)
    _ -> {
      use bea_try_406 <- result.try(dict.get(price_map, p))
      acc + bea_try_406 |> Ok
    }
  }
}

fn pizza_price(p: Pizza) {
  case calc_pizza_price(p, price_map(), 0) {
    Ok(price) -> price
    _ -> panic as "Invalid pizza"
  }
}

pub fn main() {
  echo pizza_price(ExtraToppings(ExtraSauce(ExtraSauce(Margherita))))
}
