//// Browser entry point: the pure compiler core of Bea, compiled to JavaScript.

import bea/codegen
import bea/compiler
import bea/diagnostic.{type Diagnostic}
import bea/formatter

/// Transpile Bea source to Gleam.
/// Returns #(ok, text): the generated Gleam, or the rendered diagnostics.
pub fn transpile(source: String) -> #(Bool, String) {
  case compiler.compile(source, codegen.empty_context()) {
    Ok(out) -> #(True, out.gleam)
    Error(errors) -> #(False, render(errors, source))
  }
}

/// Format Bea source with Bea's own formatter.
pub fn format(source: String) -> #(Bool, String) {
  case formatter.format(source) {
    Ok(text) -> #(True, text)
    Error(errors) -> #(False, render(errors, source))
  }
}

fn render(errors: List(Diagnostic), source: String) -> String {
  diagnostic.render_all(errors, "playground.bea", source, False)
}
