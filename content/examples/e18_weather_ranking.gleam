import gleam/float
import gleam/list
import gleam/order.{type Order}

pub type Temperature {
  Celsius(Float)
  Fahrenheit(Float)
}

pub type City {
  City(name: String, temperature: Temperature)
}

fn fahrenheit_to_celsius(fh: Float) -> Float {
  fh -. 32.0 /. 1.8
}

fn compare_temperature(arg_0: Temperature, arg_1: Temperature) -> Order {
  case arg_0, arg_1 {
    Fahrenheit(a), Fahrenheit(b) ->
      compare_temperature(
        fahrenheit_to_celsius(a) |> Celsius,
        fahrenheit_to_celsius(b) |> Celsius,
      )
    Fahrenheit(a), b ->
      compare_temperature(fahrenheit_to_celsius(a) |> Celsius(), b)
    a, Fahrenheit(b) ->
      compare_temperature(a, fahrenheit_to_celsius(b) |> Celsius())
    Celsius(t1), Celsius(t2) -> float.compare(t1, t2)
  }
}

fn sort_cities_by_temperature(cities: List(City)) -> List(City) {
  fn(a: City, b: City) { compare_temperature(a.temperature, b.temperature) }
  |> list.sort(cities, _)
}

pub fn main() {
  echo fahrenheit_to_celsius(72.5)
  echo compare_temperature(Celsius(32.1), Celsius(21.4))
  echo sort_cities_by_temperature(
    [
      City(name: "London", temperature: Celsius(30.5)),
      City(name: "Paris", temperature: Fahrenheit(82.1)),
    ],
  )
}
