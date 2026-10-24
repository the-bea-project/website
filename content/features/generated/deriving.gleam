//// `@derive` writes functions that follow a record's fields, like JSON
//// decoders and encoders. What they do comes from a deriver: an ordinary
//// module, here `bea_json/decoder` and `bea_json/encoder`.

import bea_json/decoder
import bea_json/encoder
import gleam/option.{type Option, None}

pub type Address {
  Address(street: String, city: String)
}

/// Derived by `@derive(decoder)` on `Address`.
pub fn address_decoder() {
  use <- decoder.record("Address")
  use street <- decoder.field(
    "street",
    decoder.string(),
    fn(value: Address) { value.street },
  )
  use city <- decoder.field(
    "city",
    decoder.string(),
    fn(value: Address) { value.city },
  )
  decoder.done(Address(street: street, city: city))
}

/// Derived by `@derive(encoder)` on `Address`.
pub fn address_encoder() {
  use <- encoder.record("Address")
  use street <- encoder.field(
    "street",
    encoder.string(),
    fn(value: Address) { value.street },
  )
  use city <- encoder.field(
    "city",
    encoder.string(),
    fn(value: Address) { value.city },
  )
  encoder.done(Address(street: street, city: city))
}

pub type User {
  User(name: String, age: Int, tags: List(String), address: Option(Address))
}

/// Derived by `@derive(decoder)` on `User`.
pub fn user_decoder() {
  use <- decoder.record("User")
  use name <- decoder.field(
    "name",
    decoder.string(),
    fn(value: User) { value.name },
  )
  use age <- decoder.field("age", decoder.int(), fn(value: User) { value.age })
  use tags <- decoder.field(
    "tags",
    decoder.list(decoder.string()),
    fn(value: User) { value.tags },
  )
  use address <- decoder.field(
    "address",
    decoder.option(address_decoder()),
    fn(value: User) { value.address },
  )
  decoder.done(User(name: name, age: age, tags: tags, address: address))
}

/// Derived by `@derive(encoder)` on `User`.
pub fn user_encoder() {
  use <- encoder.record("User")
  use name <- encoder.field(
    "name",
    encoder.string(),
    fn(value: User) { value.name },
  )
  use age <- encoder.field("age", encoder.int(), fn(value: User) { value.age })
  use tags <- encoder.field(
    "tags",
    encoder.list(encoder.string()),
    fn(value: User) { value.tags },
  )
  use address <- encoder.field(
    "address",
    encoder.option(address_encoder()),
    fn(value: User) { value.address },
  )
  encoder.done(User(name: name, age: age, tags: tags, address: address))
}

pub fn main() {
  let json = "{\"name\": \"Ada\", \"age\": 36, \"tags\": [\"admin\"],
    \"address\": {\"street\": \"1 Hive Lane\", \"city\": \"Kanpur\"}}"
  case decoder.from_json(json, user_decoder()) {
    Ok(user) -> {
      echo user
      case decoder.from_json(
        "{\"name\": \"Bea\", \"age\": \"two\"}",
        user_decoder(),
      ) {
        Error(problem) -> {
          echo problem
          echo encoder.to_string(User(..user, address: None), user_encoder())
        }
        _ -> panic
      }
    }
    _ -> panic
  }
}
