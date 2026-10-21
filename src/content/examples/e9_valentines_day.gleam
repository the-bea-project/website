import gleam/list

pub type Approval {
  Yes
  No
  Maybe
}

pub type Cuisine {
  Korean
  Turkish
}

pub type Genre {
  Crime
  Horror
  Romance
  Thriller
}

pub type Activity {
  BoardGame
  Chill
  Movie(Genre)
  Restaurant(Cuisine)
  Walk(Int)
}

fn rate_activity(activity: Activity) -> Approval {
  case activity {
    BoardGame -> No
    Chill -> No
    Movie(Romance) -> Yes
    Movie(_) -> No
    Restaurant(Korean) -> Yes
    Restaurant(Turkish) -> Maybe
    Walk(k) if k > 11 -> Yes
    Walk(k) if k > 6 -> Maybe
    Walk(_) -> No
  }
}

fn do_rate(arg_0: List(Activity), acc: List(Approval)) -> List(Approval) {
  case arg_0 {
    [] -> acc |> list.reverse()
    [head, ..tail] -> {
      let acc = [rate_activity(head), ..acc]
      do_rate(tail, acc)
    }
  }
}

pub fn main() {
  let items = [Walk(12), Chill, Movie(Horror)]
  echo do_rate(items, [])
}
