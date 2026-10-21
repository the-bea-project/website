import gleam/io
import gleam/list
import gleam/string

pub type Nucleotide {
  Adenine
  Cytosine
  Guanine
  Thymine
}

pub fn encode_nucleotide(nucleotide: Nucleotide) -> Int {
  case nucleotide {
    Adenine -> 0b00
    Cytosine -> 0b01
    Guanine -> 0b10
    Thymine -> 0b11
  }
}

pub fn decode_nucleotide(nucleotide: Int) -> Result(Nucleotide, Nil) {
  case nucleotide {
    0b00 -> Ok(Adenine)
    0b01 -> Ok(Cytosine)
    0b10 -> Ok(Guanine)
    0b11 -> Ok(Thymine)
    _ -> Error(Nil)
  }
}

pub fn encode(dna: List(Nucleotide)) -> BitArray {
  do_encode(dna, <<>>)
}

fn do_encode(arg_0: List(Nucleotide), acc: BitArray) -> BitArray {
  case arg_0 {
    [] -> acc
    [nucleotide, ..rest] ->
      do_encode(rest, <<acc:bits, encode_nucleotide(nucleotide):2>>)
  }
}

pub fn decode(dna: BitArray) -> Result(List(Nucleotide), Nil) {
  do_decode(dna, [])
}

fn do_decode(arg_0, arg_1) {
  case arg_0, arg_1 {
    <<>>, acc -> Ok(list.reverse(acc))
    <<0b00:2, rest:bits>>, acc -> do_decode(rest, [Adenine, ..acc])
    <<0b01:2, rest:bits>>, acc -> do_decode(rest, [Cytosine, ..acc])
    <<0b10:2, rest:bits>>, acc -> do_decode(rest, [Guanine, ..acc])
    <<0b11:2, rest:bits>>, acc -> do_decode(rest, [Thymine, ..acc])
    _, _ -> Error(Nil)
  }
}

pub fn main() {
  let dna = [Adenine, Cytosine, Guanine, Thymine, Thymine]
  let bits = encode(dna)
  io.println(string.inspect(bits))
  io.println(string.inspect(decode(bits) == Ok(dna)))
  io.println(string.inspect(decode(<<0b1:1>>)))
  let header = <<"DNA":utf8, 3:size(8), 255:8-big>>
  let assert <<"DNA":utf8, len:8, rest:bits>> = header
  io.println(string.inspect(#(len, rest)))
}
