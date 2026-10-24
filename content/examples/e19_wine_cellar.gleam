import gleam/list

fn filter_by_color(
  arg_0: List(Wine),
  arg_1: Color,
  acc: List(Wine),
) -> List(Wine) {
  case arg_0, arg_1 {
    [], _ -> acc |> list.reverse()
    [head, ..tail], color if head.color == color ->
      filter_by_color(tail, color, [head, ..acc])
    [_head, ..tail], color -> filter_by_color(tail, color, acc)
  }
}

pub fn wines_of_color(wines: List(Wine), color color: Color) -> List(Wine) {
  filter_by_color(wines, color, [])
}

fn filter_by_country(
  arg_0: List(Wine),
  arg_1: String,
  acc: List(Wine),
) -> List(Wine) {
  case arg_0, arg_1 {
    [], _ -> acc |> list.reverse()
    [head, ..tail], country if head.country == country ->
      filter_by_country(tail, country, [head, ..acc])
    [_head, ..tail], country -> filter_by_country(tail, country, acc)
  }
}

pub fn wines_from_country(
  wines: List(Wine),
  country country: String,
) -> List(Wine) {
  filter_by_country(wines, country, [])
}

pub fn filter(
  wines: List(Wine),
  color color: Color,
  country country: String,
) -> List(Wine) {
  wines |> wines_of_color(color) |> wines_from_country(country)
}

pub type Wine {
  Wine(name: String, year: Int, country: String, color: Color)
}

pub type Color {
  Red
  Rose
  White
}

pub fn main() {
  echo wines_of_color(
    [
      Wine("Chardonnay", 2015, "Italy", White),
      Wine("Pinot grigio", 2017, "Germany", White),
      Wine("Pinot noir", 2016, "France", Red),
      Wine("Dornfelder", 2018, "Germany", Rose),
    ],
    color: White,
  )
  echo wines_from_country(
    [
      Wine("Chardonnay", 2015, "Italy", White),
      Wine("Pinot grigio", 2017, "Germany", White),
      Wine("Pinot noir", 2016, "France", Red),
      Wine("Dornfelder", 2018, "Germany", Rose),
    ],
    country: "Germany",
  )
  echo filter(
    [
      Wine("Chardonnay", 2015, "Italy", White),
      Wine("Pinot grigio", 2017, "Germany", White),
      Wine("Pinot noir", 2016, "France", Red),
      Wine("Dornfelder", 2018, "Germany", Rose),
    ],
    color: White,
    country: "Italy",
  )
}
