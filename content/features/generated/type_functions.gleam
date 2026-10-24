//// A type's functions are named `<type>_<name>`, and Bea code can reach
//// them through the type: `Account.decoder()` is `account_decoder()`.

import bea_json/decoder
import gleam/dynamic/decode
import gleam/list

pub type Role {
  Admin
  Member
}

/// Only records are derived. A union's decoder is written by hand, and is
/// still `Role.decoder()`; derived records with a `Role` field use it.
pub fn role_decoder() -> decode.Decoder(Role) {
  use role <- decode.then(decode.string)
  case role {
    "admin" -> decode.success(Admin)
    "member" -> decode.success(Member)
    _ -> decode.failure(Member, "Role")
  }
}

pub type Account {
  Account(email: String, role: Role)
}

/// Derived by `@derive(decoder)` on `Account`.
pub fn account_decoder() {
  use <- decoder.record("Account")
  use email <- decoder.field(
    "email",
    decoder.string(),
    fn(value: Account) { value.email },
  )
  use role <- decoder.field(
    "role",
    role_decoder(),
    fn(value: Account) { value.role },
  )
  decoder.done(Account(email: email, role: role))
}

pub fn main() {
  let json = "{\"email\": \"ada@example.com\", \"role\": \"admin\"}"
  case decoder.from_json(json, account_decoder()) {
    Ok(account) -> {
      echo account
      case decoder.from_json("\"guest\"", role_decoder()) {
        Error(problem) -> {
          echo problem
          let parse_role = decoder.from_json(_, role_decoder())
          echo list.map(["\"admin\"", "\"member\""], parse_role)
        }
        _ -> panic
      }
    }
    _ -> panic
  }
}
